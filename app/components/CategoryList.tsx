"use client";

import { Category } from "@/app/lib/schema";

interface CategoryListProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

export default function CategoryList({
  categories,
  onEdit,
  onDelete,
}: CategoryListProps) {
  if (categories.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-gray-500 mb-2">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          មិនមានប្រភេទត្រូវបានរកឃើញ
        </h3>
        <p className="text-gray-500">ចាប់ផ្តើមដោយបង្កើតប្រភេទដំបូងរបស់អ្នក។</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          ប្រភេទ ({categories.length})
        </h3>
      </div>

      <div className="divide-y divide-gray-200">
        {categories.map((category) => (
          <div
            key={category.id}
            className="px-6 py-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {category.name}
                </h4>
                {category.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {category.description}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  បានបង្កើត:{" "}
                  {new Date(category.createdAt).toLocaleDateString("km-KH")}
                </p>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => onEdit(category)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                >
                  កែសម្រួល
                </button>
                <button
                  onClick={() => onDelete(category.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                >
                  លុប
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
