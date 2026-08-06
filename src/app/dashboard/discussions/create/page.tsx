"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaArrowLeft, FaCircleCheck } from "react-icons/fa6";

interface Course {
  id: string;
  title: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

interface Tag {
  id: string;
  name: string;
}

export default function CreateDiscussionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    courseId: "",
    categoryId: "",
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [coursesRes, categoriesRes, tagsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/courses`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("authToken") || localStorage.getItem("token")}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/discussions/categories/list`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/discussions/tags/list`),
      ]);

      if (coursesRes.ok) {
        const data = await coursesRes.json();
        setCourses(data.data);
      }

      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        setCategories(data.data);
      }

      if (tagsRes.ok) {
        const data = await tagsRes.json();
        setTags(data.data);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load form data");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/discussions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken") || localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            ...formData,
            tagIds: selectedTags,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to create discussion");
      }

      const data = await response.json();
      router.push(`/dashboard/discussions/${data.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create discussion");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const inputClass =
    "w-full rounded-2xl border border-black/10 bg-white/60 px-4 py-3 text-sm font-medium text-[#2A2A28] outline-none transition focus:border-[#1E3FE0] dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-[#60A5FA]";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/discussions"
          aria-label="Back to discussions"
          className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-[#1E3FE0] transition hover:text-[#12266E] dark:text-[#60A5FA] dark:hover:text-[#93C5FD]"
        >
          <FaArrowLeft className="h-4 w-4" />
          Back to Discussions
        </Link>
        <span className="font-annotation text-xs font-bold uppercase tracking-widest text-[#E8622E]">
          ★ NEW THREAD
        </span>
        <h1 className="font-display-custom text-2xl font-extrabold tracking-tight text-[#2A2A28] dark:text-white sm:text-3xl">
          Create Discussion
        </h1>
        <p className="text-xs font-medium text-[#6B6558] dark:text-slate-400">
          Ask a question or start a conversation
        </p>
      </div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="rounded-2xl border border-black/10 bg-[#F6F1E4] p-8 shadow-lg dark:border-white/10 dark:bg-[#0D1B2A]"
      >
        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-bold text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="mb-6">
          <label htmlFor="title" className="mb-2 block text-sm font-bold text-[#2A2A28] dark:text-white">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="What's your question or topic?"
            maxLength={255}
            required
            aria-label="Discussion title"
            className={inputClass}
          />
          <p className="mt-1 text-xs text-[#6B6558] dark:text-slate-400">
            {formData.title.length}/255 characters
          </p>
        </div>

        <div className="mb-6">
          <label htmlFor="description" className="mb-2 block text-sm font-bold text-[#2A2A28] dark:text-white">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Provide details about your question or discussion topic. Be clear and specific."
            rows={8}
            required
            aria-label="Discussion description"
            className={inputClass}
          />
          <p className="mt-1 text-xs text-[#6B6558] dark:text-slate-400">
            Include as much context as needed to help others understand your question
          </p>
        </div>

        <div className="mb-6">
          <label htmlFor="courseId" className="mb-2 block text-sm font-bold text-[#2A2A28] dark:text-white">
            Course <span className="text-red-500">*</span>
          </label>
          <select
            id="courseId"
            name="courseId"
            value={formData.courseId}
            onChange={handleChange}
            required
            aria-label="Select course"
            className={inputClass}
          >
            <option value="">Select a course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label htmlFor="categoryId" className="mb-2 block text-sm font-bold text-[#2A2A28] dark:text-white">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            required
            aria-label="Select category"
            className={inputClass}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <span className="mb-2 block text-sm font-bold text-[#2A2A28] dark:text-white">
            Tags (Optional)
          </span>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                aria-label={`Toggle tag ${tag.name}`}
                aria-pressed={selectedTags.includes(tag.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                  selectedTags.includes(tag.id)
                    ? "bg-[#1E3FE0] text-white dark:bg-[#60A5FA] dark:text-[#070B19]"
                    : "bg-black/5 text-[#2A2A28] hover:bg-black/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                }`}
              >
                {tag.name}
                {selectedTags.includes(tag.id) && " ✕"}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-[#6B6558] dark:text-slate-400">
            Select relevant tags to help others find your discussion
          </p>
        </div>

        <div className="mb-6 rounded-2xl border border-[#1E3FE0]/20 bg-[#1E3FE0]/5 p-4 dark:border-[#60A5FA]/20 dark:bg-[#60A5FA]/5">
          <h4 className="mb-2 font-bold text-[#2A2A28] dark:text-white">Tips for a good discussion:</h4>
          <ul className="space-y-1 text-sm text-[#6B6558] dark:text-slate-400">
            <li>• Use a clear, specific title</li>
            <li>• Include relevant context and background information</li>
            <li>• Mention what you&apos;ve already tried</li>
            <li>• Be respectful and professional</li>
          </ul>
        </div>

        <div className="flex flex-wrap gap-4">
          <button
            type="submit"
            disabled={loading}
            aria-label="Create discussion"
            className="inline-flex items-center gap-2 rounded-full bg-[#1E3FE0] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#12266E] disabled:opacity-50 dark:bg-[#60A5FA] dark:text-[#070B19]"
          >
            <FaCircleCheck className="h-4 w-4" />
            {loading ? "Creating..." : "Create Discussion"}
          </button>
          <Link
            href="/dashboard/discussions"
            aria-label="Cancel and go back"
            className="inline-flex items-center rounded-full border border-black/10 bg-white/60 px-6 py-3 text-sm font-bold text-[#2A2A28] transition hover:bg-black/5 dark:border-white/10 dark:bg-white/5 dark:text-white"
          >
            Cancel
          </Link>
        </div>
      </motion.form>
    </div>
  );
}
