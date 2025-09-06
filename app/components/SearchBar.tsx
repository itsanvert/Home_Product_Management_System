"use client";

import { useState, useEffect } from "react";

interface SearchBarProps {
  onSearch: (search: string, category: string) => void;
  categories: Array<{ id: string; name: string }>;
}

export default function SearchBar({ onSearch, categories }: SearchBarProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Auto-search as user types with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch(search, selectedCategory);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search, selectedCategory, onSearch]);

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("");
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="ស្វែងរកផលិតផលតាមឈ្មោះ ឬការពិពណ៌នា..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="sm:w-64">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          >
            <option value="">ប្រភេទទាំងអស់</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters Button */}
        {(search || selectedCategory) && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors whitespace-nowrap"
          >
            សម្អាតតម្រង
          </button>
        )}
      </div>

      {/* Active Filters Display */}
      {(search || selectedCategory) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {search && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              ស្វែងរក: "{search}"
              <button
                onClick={() => setSearch("")}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          )}
          {selectedCategory && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
              ប្រភេទ: {categories.find((c) => c.id === selectedCategory)?.name}
              <button
                onClick={() => setSelectedCategory("")}
                className="ml-2 text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
