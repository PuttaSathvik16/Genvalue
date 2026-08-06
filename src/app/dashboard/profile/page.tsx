"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  FaCamera,
  FaUserPen,
  FaLinkedin,
  FaGithub,
  FaGlobe,
  FaXTwitter,
  FaKey,
  FaCircleCheck,
  FaCircleXmark,
  FaTrash,
} from "react-icons/fa6";
import Avatar from "@/components/ui/Avatar";
import ProfilePictureEditor from "@/components/profile/ProfilePictureEditor";
import { ProfilePageSkeleton } from "@/components/skeletons";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

// Predefined AI Skills list
const AI_SKILLS = [
  "Python", "Prompt Engineering", "ChatGPT", "Claude", "Gemini",
  "Cursor AI", "GitHub Copilot", "LangChain", "LangGraph", "CrewAI",
  "n8n", "Make.com", "Zapier", "FastAPI", "React", "Node.js",
  "Vector Databases", "Pinecone", "ChromaDB", "FAISS", "RAG",
  "AI Agents", "Hugging Face", "Docker", "Firebase", "Supabase",
];

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "India",
  "Germany", "France", "Japan", "Singapore", "Netherlands", "Other"
];

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "hi", name: "Hindi" },
];

interface ProfileData {
  id: string;
  name: string;
  email: string;
  role: string;
  bio?: string;
  profilePicture?: string | null;
  phoneNumber?: string;
  country?: string;
  timeZone?: string;
  skills: string[];
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  huggingFaceUrl?: string;
  kaggleUrl?: string;
  twitterUrl?: string;
  preferredLanguage: string;
  emailNotifications: boolean;
  publicProfile: boolean;
  membershipPlan: string;
  createdAt: string;
}

export default function StudentProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showEditor, setShowEditor] = useState(false);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const authToken = localStorage.getItem("authToken");
        const response = await fetch(`${API_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        if (response.ok) {
          const data = await response.json();
          setProfileData(data.data);
          setSelectedSkills(data.data.skills || []);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const authToken = localStorage.getItem("authToken");
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          ...profileData,
          skills: selectedSkills,
        }),
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError("Failed to update profile");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const addSkill = (skill: string) => {
    if (!selectedSkills.includes(skill)) {
      setSelectedSkills([...selectedSkills, skill]);
    }
    setSkillInput("");
    setShowSkillDropdown(false);
  };

  const removeSkill = (skill: string) => {
    setSelectedSkills(selectedSkills.filter((s) => s !== skill));
  };

  const filteredSkills = AI_SKILLS.filter(
    (skill) =>
      skill.toLowerCase().includes(skillInput.toLowerCase()) &&
      !selectedSkills.includes(skill)
  );

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }

    setUploading(true);
    setError("");

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = async () => {
        const base64Image = reader.result as string;

        // Upload to backend
        const authToken = localStorage.getItem("authToken");
        const response = await fetch(`${API_URL}/auth/upload-profile-picture`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ image: base64Image }),
        });

        if (response.ok) {
          const data = await response.json();
          setProfileData({
            ...profileData!,
            profilePicture: data.data.profilePicture,
          });
          setSaved(true);
          setTimeout(() => setSaved(false), 3000);
        } else {
          const error = await response.json();
          setError(error.message || "Failed to upload image");
        }
      };

      reader.onerror = () => {
        setError("Failed to read image file");
      };
    } catch (err) {
      setError("Failed to upload image");
      console.error("Image upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveFromEditor = async (imageData: string) => {
    setUploading(true);
    setError("");

    try {
      const authToken = localStorage.getItem("authToken");
      const response = await fetch(`${API_URL}/auth/upload-profile-picture`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ image: imageData }),
      });

      if (response.ok) {
        const data = await response.json();
        setProfileData({
          ...profileData!,
          profilePicture: data.data.profilePicture,
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const error = await response.json();
        setError(error.message || "Failed to upload image");
      }
    } catch (err) {
      setError("Failed to upload image");
      console.error("Image upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteProfilePicture = async () => {
    if (!profileData?.profilePicture) return;

    if (!confirm("Are you sure you want to delete your profile picture?")) {
      return;
    }

    setUploading(true);
    setError("");

    try {
      const authToken = localStorage.getItem("authToken");
      const response = await fetch(`${API_URL}/auth/delete-profile-picture`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        setProfileData({
          ...profileData,
          profilePicture: null,
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const error = await response.json();
        setError(error.message || "Failed to delete image");
      }
    } catch (err) {
      setError("Failed to delete image");
      console.error("Image delete error:", err);
    } finally {
      setUploading(false);
    }
  };

  const calculateProfileCompletion = () => {
    if (!profileData) return 0;
    const fields = [
      profileData.name,
      profileData.bio,
      profileData.profilePicture,
      profileData.phoneNumber,
      profileData.country,
      profileData.linkedinUrl,
      profileData.githubUrl,
      selectedSkills.length > 0,
    ];
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  };

  if (loading) {
    return <ProfilePageSkeleton />;
  }

  if (!profileData) return null;

  const completion = calculateProfileCompletion();

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div>
        <span className="font-annotation text-xs font-bold uppercase tracking-widest text-[#E8622E]">
          ★ STUDENT IDENTITY & SETTINGS
        </span>
        <h1 className="font-display-custom text-2xl font-extrabold tracking-tight text-[#2A2A28] dark:text-white sm:text-3xl">
          My Student Profile
        </h1>
        <p className="text-sm font-medium text-[#6B6558] dark:text-slate-400">
          Manage your personal details, public bio, and skills showcase.
        </p>
      </div>

      {/* Success Message */}
      {saved && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 rounded-2xl border border-[#10B981]/20 bg-[#10B981]/10 p-4 text-sm font-bold text-[#10B981]"
        >
          <FaCircleCheck className="h-5 w-5" />
          Profile updated successfully!
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-bold text-red-600 dark:text-red-400">
          <FaCircleXmark className="h-5 w-5" />
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Profile Header */}
        <div className="rounded-3xl border border-black/10 bg-[#F6F1E4] p-6 shadow-xl dark:border-white/10 dark:bg-[#0D1B2A] sm:p-8">
          <h2 className="mb-6 text-lg font-extrabold text-[#2A2A28] dark:text-white">
            Profile Header
          </h2>

          <div className="flex flex-col items-center gap-6 sm:flex-row">
            {/* Profile Picture */}
            <div className="relative">
              <div className="relative">
                <Avatar
                  src={profileData.profilePicture}
                  name={profileData.name}
                  size="xl"
                  className="border-4 border-[#1E3FE0] shadow-lg dark:border-[#60A5FA]"
                  priority
                />
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
                  </div>
                )}
              </div>
              
              <input
                type="file"
                id="profile-picture-upload"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
              
              <div className="absolute -bottom-2 -right-2 flex gap-1">
                <button
                  type="button"
                  onClick={() => setShowEditor(true)}
                  disabled={uploading}
                  className="rounded-full bg-[#E8622E] p-2 text-white shadow-lg transition hover:bg-[#d55321] disabled:opacity-50"
                  title="Edit profile picture"
                >
                  <FaCamera className="h-3 w-3" />
                </button>
                
                {profileData.profilePicture && (
                  <button
                    type="button"
                    onClick={handleDeleteProfilePicture}
                    disabled={uploading}
                    className="rounded-full bg-red-600 p-2 text-white shadow-lg transition hover:bg-red-700 disabled:opacity-50"
                    title="Delete profile picture"
                  >
                    <FaTrash className="h-2.5 w-2.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-display-custom text-2xl font-extrabold text-[#2A2A28] dark:text-white">
                {profileData.name}
              </h3>
              <div className="mt-1 inline-flex items-center gap-2 rounded-full bg-[#1E3FE0]/10 px-3 py-1 text-xs font-bold uppercase text-[#1E3FE0] dark:bg-[#60A5FA]/20 dark:text-[#60A5FA]">
                {profileData.role}
              </div>
              <p className="mt-2 text-sm font-medium text-[#6B6558] dark:text-slate-400">
                GenValue
              </p>
              <p className="text-sm font-medium text-[#6B6558] dark:text-slate-400">
                {profileData.email}
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Personal Information */}
        <div className="rounded-3xl border border-black/10 bg-[#F6F1E4] p-6 shadow-xl dark:border-white/10 dark:bg-[#0D1B2A] sm:p-8">
          <h2 className="mb-6 text-lg font-extrabold text-[#2A2A28] dark:text-white">
            Personal Information
          </h2>

          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6B6558] dark:text-slate-300">
                Full Name *
              </label>
              <input
                type="text"
                required
                maxLength={100}
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="mt-1.5 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-[#1E3FE0] dark:border-white/10 dark:bg-white/5 dark:focus:border-[#60A5FA]"
              />
            </div>

            {/* Professional Tagline / Bio */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6B6558] dark:text-slate-300">
                Professional Tagline / Bio
              </label>
              <textarea
                rows={3}
                maxLength={250}
                value={profileData.bio || ""}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                placeholder="AI Enthusiast passionate about Generative AI, Prompt Engineering, and Full-Stack Development."
                className="mt-1.5 w-full rounded-2xl border border-black/10 bg-white p-4 text-sm font-medium outline-none transition focus:border-[#1E3FE0] dark:border-white/10 dark:bg-white/5 dark:focus:border-[#60A5FA]"
              />
              <p className="mt-1 text-xs text-[#6B6558] dark:text-slate-400">
                {profileData.bio?.length || 0}/250 characters
              </p>
            </div>

            {/* AI Skills & Tool Expertise */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6B6558] dark:text-slate-300">
                AI Skills & Tool Expertise
              </label>
              <div className="relative mt-1.5">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => {
                    setSkillInput(e.target.value);
                    setShowSkillDropdown(true);
                  }}
                  onFocus={() => setShowSkillDropdown(true)}
                  placeholder="Search and add skills..."
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-[#1E3FE0] dark:border-white/10 dark:bg-white/5 dark:focus:border-[#60A5FA]"
                />
                {/* Dropdown */}
                {showSkillDropdown && filteredSkills.length > 0 && (
                  <div className="absolute z-10 mt-2 max-h-48 w-full overflow-y-auto rounded-2xl border border-black/10 bg-white shadow-lg dark:border-white/10 dark:bg-[#0D1B2A]">
                    {filteredSkills.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => addSkill(skill)}
                        className="w-full px-4 py-2 text-left text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5"
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Skills */}
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-2 rounded-full border border-[#1E3FE0]/20 bg-[#1E3FE0]/10 px-3 py-1.5 text-xs font-bold text-[#1E3FE0] dark:border-[#60A5FA]/20 dark:bg-[#60A5FA]/10 dark:text-[#60A5FA]"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="hover:text-red-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Social Profiles */}
        <div className="rounded-3xl border border-black/10 bg-[#F6F1E4] p-6 shadow-xl dark:border-white/10 dark:bg-[#0D1B2A] sm:p-8">
          <h2 className="mb-6 text-lg font-extrabold text-[#2A2A28] dark:text-white">
            Social Profiles
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* LinkedIn */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6B6558] dark:text-slate-300">
                <FaLinkedin className="h-4 w-4 text-[#0077B5]" /> LinkedIn
              </label>
              <input
                type="url"
                value={profileData.linkedinUrl || ""}
                onChange={(e) => setProfileData({ ...profileData, linkedinUrl: e.target.value })}
                placeholder="https://linkedin.com/in/yourprofile"
                className="mt-1.5 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-[#1E3FE0] dark:border-white/10 dark:bg-white/5 dark:focus:border-[#60A5FA]"
              />
            </div>

            {/* GitHub */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6B6558] dark:text-slate-300">
                <FaGithub className="h-4 w-4" /> GitHub
              </label>
              <input
                type="url"
                value={profileData.githubUrl || ""}
                onChange={(e) => setProfileData({ ...profileData, githubUrl: e.target.value })}
                placeholder="https://github.com/yourusername"
                className="mt-1.5 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-[#1E3FE0] dark:border-white/10 dark:bg-white/5 dark:focus:border-[#60A5FA]"
              />
            </div>

            {/* Portfolio */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6B6558] dark:text-slate-300">
                <FaGlobe className="h-4 w-4" /> Portfolio Website
              </label>
              <input
                type="url"
                value={profileData.portfolioUrl || ""}
                onChange={(e) => setProfileData({ ...profileData, portfolioUrl: e.target.value })}
                placeholder="https://yourportfolio.com"
                className="mt-1.5 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-[#1E3FE0] dark:border-white/10 dark:bg-white/5 dark:focus:border-[#60A5FA]"
              />
            </div>

            {/* Hugging Face */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6B6558] dark:text-slate-300">
                🤗 Hugging Face
              </label>
              <input
                type="url"
                value={profileData.huggingFaceUrl || ""}
                onChange={(e) => setProfileData({ ...profileData, huggingFaceUrl: e.target.value })}
                placeholder="https://huggingface.co/yourprofile"
                className="mt-1.5 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-[#1E3FE0] dark:border-white/10 dark:bg-white/5 dark:focus:border-[#60A5FA]"
              />
            </div>

            {/* Kaggle */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6B6558] dark:text-slate-300">
                📊 Kaggle
              </label>
              <input
                type="url"
                value={profileData.kaggleUrl || ""}
                onChange={(e) => setProfileData({ ...profileData, kaggleUrl: e.target.value })}
                placeholder="https://kaggle.com/yourprofile"
                className="mt-1.5 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-[#1E3FE0] dark:border-white/10 dark:bg-white/5 dark:focus:border-[#60A5FA]"
              />
            </div>

            {/* X (Twitter) */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6B6558] dark:text-slate-300">
                <FaXTwitter className="h-4 w-4" /> X (Twitter)
              </label>
              <input
                type="url"
                value={profileData.twitterUrl || ""}
                onChange={(e) => setProfileData({ ...profileData, twitterUrl: e.target.value })}
                placeholder="https://x.com/yourusername"
                className="mt-1.5 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-[#1E3FE0] dark:border-white/10 dark:bg-white/5 dark:focus:border-[#60A5FA]"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Contact Information */}
        <div className="rounded-3xl border border-black/10 bg-[#F6F1E4] p-6 shadow-xl dark:border-white/10 dark:bg-[#0D1B2A] sm:p-8">
          <h2 className="mb-6 text-lg font-extrabold text-[#2A2A28] dark:text-white">
            Contact Information
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6B6558] dark:text-slate-300">
                Phone Number
              </label>
              <input
                type="tel"
                value={profileData.phoneNumber || ""}
                onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                placeholder="+1 (555) 123-4567"
                className="mt-1.5 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-[#1E3FE0] dark:border-white/10 dark:bg-white/5 dark:focus:border-[#60A5FA]"
              />
            </div>

            {/* Country */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6B6558] dark:text-slate-300">
                Country
              </label>
              <select
                value={profileData.country || ""}
                onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                className="mt-1.5 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-[#1E3FE0] dark:border-white/10 dark:bg-white/5 dark:focus:border-[#60A5FA]"
              >
                <option value="">Select Country</option>
                {COUNTRIES.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            {/* Time Zone */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6B6558] dark:text-slate-300">
                Time Zone
              </label>
              <input
                type="text"
                value={profileData.timeZone || ""}
                onChange={(e) => setProfileData({ ...profileData, timeZone: e.target.value })}
                placeholder="e.g., America/New_York, Europe/London"
                className="mt-1.5 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-[#1E3FE0] dark:border-white/10 dark:bg-white/5 dark:focus:border-[#60A5FA]"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Preferences */}
        <div className="rounded-3xl border border-black/10 bg-[#F6F1E4] p-6 shadow-xl dark:border-white/10 dark:bg-[#0D1B2A] sm:p-8">
          <h2 className="mb-6 text-lg font-extrabold text-[#2A2A28] dark:text-white">
            Preferences
          </h2>

          <div className="space-y-4">
            {/* Preferred Language */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6B6558] dark:text-slate-300">
                Preferred Language
              </label>
              <select
                value={profileData.preferredLanguage}
                onChange={(e) => setProfileData({ ...profileData, preferredLanguage: e.target.value })}
                className="mt-1.5 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-[#1E3FE0] dark:border-white/10 dark:bg-white/5 dark:focus:border-[#60A5FA]"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Email Notifications */}
            <div className="flex items-center justify-between rounded-2xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/5">
              <div>
                <p className="text-sm font-bold text-[#2A2A28] dark:text-white">
                  Email Notifications
                </p>
                <p className="text-xs text-[#6B6558] dark:text-slate-400">
                  Receive updates about courses and announcements
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={profileData.emailNotifications}
                  onChange={(e) =>
                    setProfileData({ ...profileData, emailNotifications: e.target.checked })
                  }
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#1E3FE0] peer-checked:after:translate-x-full peer-checked:after:border-white dark:peer-checked:bg-[#60A5FA]"></div>
              </label>
            </div>

            {/* Public Profile */}
            <div className="flex items-center justify-between rounded-2xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/5">
              <div>
                <p className="text-sm font-bold text-[#2A2A28] dark:text-white">
                  Public Profile Visibility
                </p>
                <p className="text-xs text-[#6B6558] dark:text-slate-400">
                  Make your profile visible to other students
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={profileData.publicProfile}
                  onChange={(e) =>
                    setProfileData({ ...profileData, publicProfile: e.target.checked })
                  }
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#1E3FE0] peer-checked:after:translate-x-full peer-checked:after:border-white dark:peer-checked:bg-[#60A5FA]"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Section 6: Account Information (Read Only) */}
        <div className="rounded-3xl border border-black/10 bg-[#F6F1E4] p-6 shadow-xl dark:border-white/10 dark:bg-[#0D1B2A] sm:p-8">
          <h2 className="mb-6 text-lg font-extrabold text-[#2A2A28] dark:text-white">
            Account Information
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#6B6558] dark:text-slate-300">
                Student ID
              </p>
              <p className="mt-1 text-sm font-medium text-[#2A2A28] dark:text-white">
                {profileData.id.substring(0, 8).toUpperCase()}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#6B6558] dark:text-slate-300">
                Registered Email
              </p>
              <p className="mt-1 text-sm font-medium text-[#2A2A28] dark:text-white">
                {profileData.email}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#6B6558] dark:text-slate-300">
                Joined Date
              </p>
              <p className="mt-1 text-sm font-medium text-[#2A2A28] dark:text-white">
                {new Date(profileData.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#6B6558] dark:text-slate-300">
                Membership Plan
              </p>
              <p className="mt-1 text-sm font-medium text-[#2A2A28] dark:text-white">
                {profileData.membershipPlan}
              </p>
            </div>
          </div>
        </div>

        {/* Section 7: Profile Completion */}
        <div className="rounded-3xl border border-black/10 bg-[#F6F1E4] p-6 shadow-xl dark:border-white/10 dark:bg-[#0D1B2A] sm:p-8">
          <h2 className="mb-4 text-lg font-extrabold text-[#2A2A28] dark:text-white">
            Profile Completion
          </h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-[#2A2A28] dark:text-white">
                {completion}% Complete
              </span>
            </div>

            {/* Progress Bar */}
            <div className="h-3 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#1E3FE0] to-[#60A5FA] transition-all duration-500"
                style={{ width: `${completion}%` }}
              />
            </div>

            {/* Missing Fields */}
            {completion < 100 && (
              <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4">
                <p className="mb-2 text-xs font-bold uppercase text-yellow-700 dark:text-yellow-400">
                  Complete your profile:
                </p>
                <ul className="space-y-1 text-xs text-yellow-700 dark:text-yellow-400">
                  {!profileData.bio && <li>• Add professional bio</li>}
                  {!profileData.profilePicture && <li>• Upload profile picture</li>}
                  {!profileData.phoneNumber && <li>• Add phone number</li>}
                  {!profileData.country && <li>• Select country</li>}
                  {!profileData.linkedinUrl && <li>• Add LinkedIn profile</li>}
                  {!profileData.githubUrl && <li>• Add GitHub profile</li>}
                  {selectedSkills.length === 0 && <li>• Add AI skills</li>}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Section 8: Actions */}
        <div className="flex flex-wrap gap-4">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-[#E8622E] px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-xl transition hover:bg-[#d55321] disabled:opacity-50"
          >
            <FaUserPen className="h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </button>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-full border-2 border-black/10 bg-white px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-[#2A2A28] transition hover:bg-black/5 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            Cancel
          </button>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border-2 border-[#1E3FE0] bg-[#1E3FE0]/10 px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-[#1E3FE0] transition hover:bg-[#1E3FE0]/20 dark:border-[#60A5FA] dark:bg-[#60A5FA]/10 dark:text-[#60A5FA] dark:hover:bg-[#60A5FA]/20"
          >
            <FaKey className="h-4 w-4" />
            Change Password
          </button>
        </div>
      </form>

      {/* Profile Picture Editor Modal */}
      <ProfilePictureEditor
        isOpen={showEditor}
        onClose={() => setShowEditor(false)}
        onSave={handleSaveFromEditor}
        currentImage={profileData?.profilePicture || null}
      />
    </div>
  );
}
