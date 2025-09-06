"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Product, Category } from "@/app/lib/schema";

interface ProductFormProps {
  product?: Product;
  categories: Category[];
  onSubmit: (product: Partial<Product>) => void;
  onCancel: () => void;
}

export default function ProductForm({
  product,
  categories,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    stock: "",
    imageUrl: "",
  });
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || "",
        price: product.price.toString(),
        categoryId: product.categoryId,
        stock: product.stock.toString(),
        imageUrl: product.imageUrl || "",
      });
      setImagePreview(product.imageUrl || "");
    }
  }, [product]);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData({ ...formData, imageUrl: url });
    setImagePreview(url);
    setImageFile(null);
  };

  const uploadImageToServer = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      return data.imageUrl;
    } catch (error) {
      console.error("Image upload failed:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let finalImageUrl = formData.imageUrl;

      // If there's a file to upload, upload it first
      if (imageFile) {
        try {
          finalImageUrl = await uploadImageToServer(imageFile);
        } catch (error) {
          // If upload fails, continue without image or use the URL if provided
          console.error("Image upload failed, continuing without image");
          finalImageUrl = formData.imageUrl;
        }
      }

      onSubmit({
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        imageUrl: finalImageUrl,
      });
    } catch (error) {
      console.error("Form submission failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    setImagePreview("");
    setImageFile(null);
    setFormData({ ...formData, imageUrl: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 my-8 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {product ? "កែសម្រួលផលិតផល" : "បន្ថែមផលិតផលថ្មី"}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
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
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Product Image Section */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              រូបភាពផលិតផល
            </label>

            {imagePreview && (
              <div className="relative inline-block">
                <div className="w-32 h-32 relative rounded-lg border border-gray-300 overflow-hidden">
                  <Image
                    src={imagePreview}
                    alt="Product preview"
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                </div>
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  ×
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  បង្ហោះឯកសាររូបភាព
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  ឬ URL រូបភាព
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={handleImageUrlChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm"
                />
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ឈ្មោះផលិតផល *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="បញ្ចូលឈ្មោះផលិតផល"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ប្រភេទ *
              </label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              >
                <option value="">ជ្រើសរើសប្រភេទ</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
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
              rows={4}
              placeholder="បញ្ចូលការពិពណ៌នាអំពីផលិតផល"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                តម្លៃ ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                បរិមាណស្តុក *
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={isUploading}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors font-medium flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {product ? "កំពុងធ្វើបច្ចុប្បន្នភាព..." : "កំពុងបង្កើត..."}
                </>
              ) : (
                <>{product ? "ធ្វើបច្ចុប្បន្នភាព" : "បង្កើត"} ផលិតផល</>
              )}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isUploading}
              className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-400 disabled:bg-gray-200 transition-colors font-medium"
            >
              បោះបង់
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
