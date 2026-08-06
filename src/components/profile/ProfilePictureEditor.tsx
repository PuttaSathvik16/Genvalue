"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import ReactCrop, { Crop, PixelCrop } from "react-image-crop";
import Webcam from "react-webcam";
import "react-image-crop/dist/ReactCrop.css";
import {
  FaCamera,
  FaUpload,
  FaCrop,
  FaRotateRight,
  FaRotateLeft,
  FaArrowsUpDown,
  FaArrowsLeftRight,
  FaWandMagicSparkles,
  FaSliders,
  FaArrowRotateLeft,
  FaArrowRotateRight,
  FaTrash,
  FaCheck,
  FaXmark,
  FaExpand,
  FaCompress,
  FaMinus,
  FaPlus,
} from "react-icons/fa6";

interface ProfilePictureEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (imageData: string) => Promise<void>;
  currentImage?: string | null;
}

type EditorTab = "upload" | "camera" | "crop" | "adjust" | "filters";

const FILTERS = [
  { name: "Natural", style: {} },
  { name: "Professional", style: { filter: "contrast(1.1) brightness(1.05)" } },
  { name: "Warm", style: { filter: "sepia(0.2) saturate(1.1)" } },
  { name: "Cool", style: { filter: "hue-rotate(15deg) saturate(0.9)" } },
  { name: "B&W", style: { filter: "grayscale(1)" } },
  { name: "Vivid", style: { filter: "saturate(1.5) contrast(1.1)" } },
  { name: "Portrait", style: { filter: "brightness(1.05) contrast(1.05) saturate(1.05)" } },
];

export default function ProfilePictureEditor({
  isOpen,
  onClose,
  onSave,
  currentImage,
}: ProfilePictureEditorProps) {
  const [activeTab, setActiveTab] = useState<EditorTab>("upload");
  const [image, setImage] = useState<string | null>(currentImage || null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 90,
    height: 90,
    x: 5,
    y: 5,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  
  // Adjustments
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [selectedFilter, setSelectedFilter] = useState(0);

  // History
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Refs
  const imageRef = useRef<HTMLImageElement>(null);
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Webcam
  const [showWebcam, setShowWebcam] = useState(false);
  const [saving, setSaving] = useState(false);

  // Add to history
  const addToHistory = useCallback((imageData: string) => {
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(imageData);
      return newHistory;
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setImage(result);
        setOriginalImage(result);
        addToHistory(result);
        setActiveTab("crop");
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle drag and drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setImage(result);
        setOriginalImage(result);
        addToHistory(result);
        setActiveTab("crop");
      };
      reader.readAsDataURL(file);
    }
  };

  // Capture from webcam
  const capturePhoto = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setImage(imageSrc);
      setOriginalImage(imageSrc);
      addToHistory(imageSrc);
      setShowWebcam(false);
      setActiveTab("crop");
    }
  }, [addToHistory]);

  // Apply transformations
  const getTransformStyle = () => {
    const baseFilter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    const selectedFilterStyle = FILTERS[selectedFilter].style.filter || '';
    const combinedFilter = selectedFilterStyle ? `${baseFilter} ${selectedFilterStyle}` : baseFilter;
    
    return {
      filter: combinedFilter,
      transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1}) scale(${zoom})`,
    };
  };

  // Generate final image
  const generateFinalImage = useCallback(async (): Promise<string> => {
    if (!imageRef.current || !canvasRef.current) return image || "";

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return image || "";

    const img = imageRef.current;
    
    // Set canvas size based on crop or full image
    const cropData = completedCrop || {
      x: 0,
      y: 0,
      width: img.naturalWidth,
      height: img.naturalHeight,
    };

    canvas.width = cropData.width;
    canvas.height = cropData.height;

    // Apply transformations
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.scale(zoom, zoom);
    
    // Combine base filters with selected filter
    const baseFilter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    const selectedFilterStyle = FILTERS[selectedFilter].style.filter || '';
    ctx.filter = selectedFilterStyle ? `${baseFilter} ${selectedFilterStyle}` : baseFilter;
    
    // Draw cropped image
    ctx.drawImage(
      img,
      cropData.x,
      cropData.y,
      cropData.width,
      cropData.height,
      -cropData.width / 2,
      -cropData.height / 2,
      cropData.width,
      cropData.height
    );

    ctx.restore();

    return canvas.toDataURL("image/jpeg", 0.95);
  }, [image, completedCrop, brightness, contrast, saturation, rotation, flipH, flipV, zoom, selectedFilter]);

  // Handle save
  const handleSave = async () => {
    setSaving(true);
    try {
      const finalImage = await generateFinalImage();
      await onSave(finalImage);
      onClose();
    } catch (error) {
      console.error("Failed to save image:", error);
    } finally {
      setSaving(false);
    }
  };

  // Undo/Redo
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setImage(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setImage(history[historyIndex + 1]);
    }
  };

  // Reset all adjustments
  const resetAdjustments = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setZoom(1);
    setSelectedFilter(0);
    if (originalImage) {
      setImage(originalImage);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-3xl border border-black/10 bg-[#F6F1E4] shadow-2xl dark:border-white/10 dark:bg-[#0D1B2A]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/10 bg-white/40 p-6 dark:border-white/10 dark:bg-[#12266E]/40">
          <h2 className="font-display-custom text-2xl font-extrabold text-[#2A2A28] dark:text-white">
            Edit Profile Photo
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-[#6B6558] transition hover:bg-black/5 hover:text-[#2A2A28] dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <FaXmark className="h-5 w-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap gap-2 border-b border-black/10 bg-white/20 p-4 dark:border-white/10 dark:bg-white/5">
          <button
            onClick={() => {
              setActiveTab("upload");
              fileInputRef.current?.click();
            }}
            className="flex items-center gap-2 rounded-full bg-[#1E3FE0] px-4 py-2 text-sm font-bold text-white shadow-md transition hover:bg-[#12266E] dark:bg-[#1E3FE0] dark:hover:bg-[#12266E]"
          >
            <FaUpload className="h-4 w-4" />
            Upload
          </button>

          <button
            onClick={() => {
              setActiveTab("camera");
              setShowWebcam(true);
            }}
            className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-bold text-[#2A2A28] transition hover:bg-black/5 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
          >
            <FaCamera className="h-4 w-4" />
            Camera
          </button>

          {image && (
            <>
              <button
                onClick={() => setActiveTab("crop")}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${
                  activeTab === "crop"
                    ? "bg-[#E8622E] text-white shadow-md"
                    : "border border-black/10 bg-white text-[#2A2A28] hover:bg-black/5 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                }`}
              >
                <FaCrop className="h-4 w-4" />
                Crop
              </button>

              <button
                onClick={() => setActiveTab("adjust")}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${
                  activeTab === "adjust"
                    ? "bg-[#E8622E] text-white shadow-md"
                    : "border border-black/10 bg-white text-[#2A2A28] hover:bg-black/5 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                }`}
              >
                <FaSliders className="h-4 w-4" />
                Adjust
              </button>

              <button
                onClick={() => setActiveTab("filters")}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${
                  activeTab === "filters"
                    ? "bg-[#E8622E] text-white shadow-md"
                    : "border border-black/10 bg-white text-[#2A2A28] hover:bg-black/5 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                }`}
              >
                <FaWandMagicSparkles className="h-4 w-4" />
                Filters
              </button>
            </>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Hidden canvas for processing */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Main Content Area */}
        <div className="max-h-[60vh] overflow-y-auto p-6">
          {/* Upload/Camera Tab */}
          {(activeTab === "upload" || activeTab === "camera") && !image && (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-black/20 bg-white/40 p-8 dark:border-white/20 dark:bg-white/5"
            >
              {showWebcam ? (
                <div className="space-y-4">
                  <Webcam
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="rounded-2xl shadow-xl"
                    mirrored
                  />
                  <div className="flex gap-4">
                    <button
                      onClick={capturePhoto}
                      className="flex-1 rounded-full bg-[#1E3FE0] px-6 py-3 font-bold text-white shadow-md transition hover:bg-[#12266E]"
                    >
                      Capture Photo
                    </button>
                    <button
                      onClick={() => setShowWebcam(false)}
                      className="rounded-full border border-black/10 bg-white px-6 py-3 font-bold text-[#2A2A28] transition hover:bg-black/5 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <FaUpload className="mx-auto mb-4 h-16 w-16 text-[#6B6558] dark:text-white/40" />
                  <h3 className="mb-2 text-xl font-bold text-[#2A2A28] dark:text-white">
                    Upload Profile Picture
                  </h3>
                  <p className="mb-6 text-sm text-[#6B6558] dark:text-white/60">
                    Drag and drop an image or click to browse
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-full bg-[#1E3FE0] px-8 py-3 font-bold text-white shadow-md transition hover:bg-[#12266E]"
                  >
                    Choose File
                  </button>
                  <p className="mt-4 text-xs text-[#6B6558] dark:text-white/40">
                    Supports: JPG, PNG, WEBP (Max 5MB)
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Image Preview with Tools */}
          {image && activeTab !== "upload" && activeTab !== "camera" && (
            <div className="space-y-4">
              {/* Preview Area */}
              <div className="flex justify-center rounded-2xl bg-white/20 p-8 dark:bg-black/40">
                <div className="relative max-w-2xl">
                  {activeTab === "crop" ? (
                    <ReactCrop
                      crop={crop}
                      onChange={(c) => setCrop(c)}
                      onComplete={(c) => setCompletedCrop(c)}
                      aspect={1}
                      circularCrop
                    >
                      <img
                        ref={imageRef}
                        src={image}
                        alt="Preview"
                        crossOrigin="anonymous"
                        className="max-h-[500px] rounded-lg shadow-xl"
                        style={getTransformStyle()}
                      />
                    </ReactCrop>
                  ) : (
                    <img
                      ref={imageRef}
                      src={image}
                      alt="Preview"
                      crossOrigin="anonymous"
                      className="max-h-[500px] rounded-lg shadow-xl"
                      style={getTransformStyle()}
                    />
                  )}
                </div>
              </div>

              {/* Adjustment Controls */}
              {activeTab === "adjust" && (
                <div className="space-y-4 rounded-2xl border border-black/10 bg-white/40 p-6 dark:border-white/10 dark:bg-white/5">
                  {/* Zoom */}
                  <div>
                    <label className="mb-2 flex items-center justify-between text-sm font-bold text-[#2A2A28] dark:text-white">
                      <span>Zoom</span>
                      <span className="text-[#6B6558] dark:text-white/60">{Math.round(zoom * 100)}%</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                        className="rounded-lg border border-black/10 bg-white p-2 text-[#2A2A28] transition hover:bg-black/5 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                      >
                        <FaMinus className="h-3 w-3" />
                      </button>
                      <input
                        type="range"
                        min="50"
                        max="200"
                        value={zoom * 100}
                        onChange={(e) => setZoom(Number(e.target.value) / 100)}
                        className="flex-1"
                      />
                      <button
                        onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                        className="rounded-lg border border-black/10 bg-white p-2 text-[#2A2A28] transition hover:bg-black/5 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                      >
                        <FaPlus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Brightness */}
                  <div>
                    <label className="mb-2 flex items-center justify-between text-sm font-bold text-[#2A2A28] dark:text-white">
                      <span>Brightness</span>
                      <span className="text-[#6B6558] dark:text-white/60">{brightness}%</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={brightness}
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  {/* Contrast */}
                  <div>
                    <label className="mb-2 flex items-center justify-between text-sm font-bold text-[#2A2A28] dark:text-white">
                      <span>Contrast</span>
                      <span className="text-[#6B6558] dark:text-white/60">{contrast}%</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={contrast}
                      onChange={(e) => setContrast(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  {/* Saturation */}
                  <div>
                    <label className="mb-2 flex items-center justify-between text-sm font-bold text-[#2A2A28] dark:text-white">
                      <span>Saturation</span>
                      <span className="text-[#6B6558] dark:text-white/60">{saturation}%</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={saturation}
                      onChange={(e) => setSaturation(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  {/* Rotation & Flip */}
                  <div className="flex flex-wrap gap-2 border-t border-black/10 pt-4 dark:border-white/10">
                    <button
                      onClick={() => setRotation((rotation - 90) % 360)}
                      className="flex items-center gap-2 rounded-lg border border-black/10 bg-white px-4 py-2 text-sm font-bold text-[#2A2A28] transition hover:bg-black/5 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                    >
                      <FaRotateLeft className="h-4 w-4" />
                      Rotate Left
                    </button>
                    <button
                      onClick={() => setRotation((rotation + 90) % 360)}
                      className="flex items-center gap-2 rounded-lg border border-black/10 bg-white px-4 py-2 text-sm font-bold text-[#2A2A28] transition hover:bg-black/5 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                    >
                      <FaRotateRight className="h-4 w-4" />
                      Rotate Right
                    </button>
                    <button
                      onClick={() => setFlipH(!flipH)}
                      className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition ${
                        flipH ? "bg-[#E8622E] text-white" : "border border-black/10 bg-white text-[#2A2A28] hover:bg-black/5 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                      }`}
                    >
                      <FaArrowsLeftRight className="h-4 w-4" />
                      Flip H
                    </button>
                    <button
                      onClick={() => setFlipV(!flipV)}
                      className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition ${
                        flipV ? "bg-[#E8622E] text-white" : "border border-black/10 bg-white text-[#2A2A28] hover:bg-black/5 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                      }`}
                    >
                      <FaArrowsUpDown className="h-4 w-4" />
                      Flip V
                    </button>
                  </div>
                </div>
              )}

              {/* Filters */}
              {activeTab === "filters" && (
                <div className="grid grid-cols-4 gap-4 rounded-2xl border border-black/10 bg-white/40 p-6 dark:border-white/10 dark:bg-white/5 md:grid-cols-7">
                  {FILTERS.map((filter, index) => (
                    <button
                      key={filter.name}
                      onClick={() => setSelectedFilter(index)}
                      className={`group relative overflow-hidden rounded-xl border-2 transition ${
                        selectedFilter === index
                          ? "border-[#E8622E] shadow-md"
                          : "border-black/10 hover:border-black/30 dark:border-white/10 dark:hover:border-white/30"
                      }`}
                    >
                      <img
                        src={image}
                        alt={filter.name}
                        crossOrigin="anonymous"
                        className="h-20 w-full object-cover"
                        style={filter.style}
                      />
                      <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 to-transparent p-2">
                        <span className="text-xs font-bold text-white">{filter.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-black/10 bg-white/20 p-6 dark:border-white/10 dark:bg-white/5">
          {/* Left: History Controls */}
          <div className="flex gap-2">
            {image && (
              <>
                <button
                  onClick={undo}
                  disabled={historyIndex <= 0}
                  className="rounded-lg border border-black/10 bg-white p-2 text-[#2A2A28] transition hover:bg-black/5 disabled:opacity-30 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                  title="Undo"
                >
                  <FaArrowRotateLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={redo}
                  disabled={historyIndex >= history.length - 1}
                  className="rounded-lg border border-black/10 bg-white p-2 text-[#2A2A28] transition hover:bg-black/5 disabled:opacity-30 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                  title="Redo"
                >
                  <FaArrowRotateRight className="h-4 w-4" />
                </button>
                <button
                  onClick={resetAdjustments}
                  className="rounded-lg border border-black/10 bg-white px-4 py-2 text-sm font-bold text-[#2A2A28] transition hover:bg-black/5 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                >
                  Reset
                </button>
              </>
            )}
          </div>

          {/* Right: Action Buttons */}
          <div className="flex gap-3">
            {image && (
              <button
                onClick={() => {
                  setImage(null);
                  setOriginalImage(null);
                  setActiveTab("upload");
                  resetAdjustments();
                }}
                className="flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-red-700"
              >
                <FaTrash className="h-4 w-4" />
                Remove
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-bold text-[#2A2A28] transition hover:bg-black/5 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
            >
              Cancel
            </button>
            {image && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-full bg-[#1E3FE0] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#12266E] disabled:opacity-50"
              >
                <FaCheck className="h-4 w-4" />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
