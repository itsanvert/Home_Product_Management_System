"use client";

import { useState, useEffect } from "react";
import { Category } from "@/app/lib/schema";

interface CategoryFormProps {
  category?: Category;
  onSubmit: (category: Partial<Category>) => void;
  onCancel: () => void;
}

export default function CategoryForm({
  category,
  onSubmit,
  onCancel,
}: CategoryFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || "",
      });
    }
  }, [category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold mb-4 text-gray-900">
          {category ? "កែសម្រួលប្រភេទ" : "បន្ថែមប្រភេទថ្មី"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ឈ្មោះ *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              placeholder="បញ្ចូលឈ្មោះប្រភេទ"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ការពិពណ៌នា
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
              rows={3}
              placeholder="បញ្ចូលការពិពណ៌នាអំពីប្រភេទ (ជាជម្រើស)"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              {category ? "ធ្វើបច្ចុប្បន្នភាព" : "បង្កើត"} ប្រភេទ
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors font-medium"
            >
              បោះបង់
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
