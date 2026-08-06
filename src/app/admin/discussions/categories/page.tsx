"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Edit, X } from "lucide-react";
import { CardGridSkeleton } from "@/components/skeletons";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  order: number;
  isActive: boolean;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
}

type Tab = "categories" | "tags";

export default function CategoriesTagsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("categories");
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showTagForm, setShowTagForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    color: "#3B82F6",
    order: 0,
  });

  const [tagForm, setTagForm] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, tagsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/discussions/categories/list`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/discussions/tags/list`),
      ]);

      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        setCategories(data.data);
      }

      if (tagsRes.ok) {
        const data = await tagsRes.json();
        setTags(data.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/discussions/categories`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(categoryForm),
        }
      );

      if (response.ok) {
        fetchData();
        setCategoryForm({ name: "", description: "", color: "#3B82F6", order: 0 });
        setShowCategoryForm(false);
      }
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/discussions/categories/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/discussions/tags`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(tagForm),
        }
      );

      if (response.ok) {
        fetchData();
        setTagForm({ name: "", description: "" });
        setShowTagForm(false);
      }
    } catch (error) {
      console.error("Error adding tag:", error);
    }
  };

  const handleDeleteTag = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tag?")) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/discussions/tags/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Error deleting tag:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <Link href="/admin/discussions" className="flex items-center gap-2 text-blue-600 mb-6">
          <ArrowLeft size={20} />
          Back to Discussions
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">Discussion Settings</h1>
          <p className="text-slate-600 mt-2">Manage categories and tags for discussions</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 bg-white rounded-lg shadow-md p-2">
          <button
            onClick={() => setActiveTab("categories")}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              activeTab === "categories"
                ? "bg-blue-600 text-white"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => setActiveTab("tags")}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              activeTab === "tags"
                ? "bg-blue-600 text-white"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            Tags
          </button>
        </div>

        {/* Categories Tab */}
        {activeTab === "categories" && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Categories</h2>
              <button
                onClick={() => setShowCategoryForm(!showCategoryForm)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
              >
                <Plus size={20} />
                Add Category
              </button>
            </div>

            {/* Category Form */}
            {showCategoryForm && (
              <form onSubmit={handleAddCategory} className="mb-6 p-6 bg-slate-50 rounded-lg border border-slate-200">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={categoryForm.name}
                      onChange={(e) =>
                        setCategoryForm({ ...categoryForm, name: e.target.value })
                      }
                      placeholder="Category name"
                      required
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Color
                    </label>
                    <input
                      type="color"
                      value={categoryForm.color}
                      onChange={(e) =>
                        setCategoryForm({ ...categoryForm, color: e.target.value })
                      }
                      className="w-full h-10 rounded-lg border border-slate-300 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Description
                  </label>
                  <textarea
                    value={categoryForm.description}
                    onChange={(e) =>
                      setCategoryForm({ ...categoryForm, description: e.target.value })
                    }
                    placeholder="Category description"
                    rows={3}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Add Category
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCategoryForm(false)}
                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Categories List */}
            {loading ? (
              <CardGridSkeleton count={6} cols={3} />
            ) : categories.length === 0 ? (
              <p className="text-slate-600 text-center py-8">No categories yet</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="p-4 border rounded-lg hover:shadow-md transition"
                    style={{ borderLeftColor: category.color, borderLeftWidth: "4px" }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-slate-900">{category.name}</h3>
                        {category.description && (
                          <p className="text-sm text-slate-600 mt-1">{category.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <span>{category.slug}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tags Tab */}
        {activeTab === "tags" && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Tags</h2>
              <button
                onClick={() => setShowTagForm(!showTagForm)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
              >
                <Plus size={20} />
                Add Tag
              </button>
            </div>

            {/* Tag Form */}
            {showTagForm && (
              <form onSubmit={handleAddTag} className="mb-6 p-6 bg-slate-50 rounded-lg border border-slate-200">
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Tag Name
                  </label>
                  <input
                    type="text"
                    value={tagForm.name}
                    onChange={(e) => setTagForm({ ...tagForm, name: e.target.value })}
                    placeholder="Tag name"
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Description
                  </label>
                  <textarea
                    value={tagForm.description}
                    onChange={(e) => setTagForm({ ...tagForm, description: e.target.value })}
                    placeholder="Tag description"
                    rows={3}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Add Tag
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTagForm(false)}
                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Tags List */}
            {loading ? (
              <div className="flex flex-wrap gap-3 py-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="h-8 w-20 animate-pulse rounded-full bg-black/10 dark:bg-white/10" aria-hidden="true" />
                ))}
              </div>
            ) : tags.length === 0 ? (
              <p className="text-slate-600 text-center py-8">No tags yet</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full hover:bg-slate-200 transition"
                  >
                    <span className="font-medium text-slate-900">{tag.name}</span>
                    <button
                      onClick={() => handleDeleteTag(tag.id)}
                      className="p-1 text-slate-600 hover:text-red-600 transition"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
