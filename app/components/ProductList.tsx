"use client";

import { Product } from "@/app/lib/schema";
import Image from "next/image";

interface ProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

export default function ProductList({
  products,
  onEdit,
  onDelete,
}: ProductListProps) {
  if (products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <div className="text-gray-500 mb-4">
          <svg
            className="mx-auto h-16 w-16 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">
          មិនមានផលិតផលត្រូវបានរកឃើញ
        </h3>
        <p className="text-gray-500 mb-6">
          ចាប់ផ្តើមដោយបង្កើតផលិតផលដំបូងរបស់អ្នក។
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
        >
          <div className="relative aspect-square bg-gray-100">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg
                  className="w-12 h-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}

            {/* Stock indicator */}

            {/* Stock indicator */}
            <div className="absolute top-2 right-2">
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  product.stock > 10
                    ? "bg-green-100 text-green-800"
                    : product.stock > 0
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {product.stock > 0
                  ? `${product.stock} មានក្នុងស្តុក`
                  : "អស់ពីស្តុក"}
              </span>
            </div>
          </div>

          <div className="p-4">
            <div className="mb-2">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 mb-1">
                {product.name}
              </h3>
              <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                {product.category_name}
              </span>
            </div>

            {product.description && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {product.description}
              </p>
            )}

            <div className="flex justify-between items-center mb-4">
              <span className="text-2xl font-bold text-green-600">
                {product.price.toFixed(0)}៛
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onEdit(product)}
                className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                កែសម្រួល
              </button>
              <button
                onClick={() => onDelete(product.id)}
                className="flex-1 bg-red-600 text-white py-2 px-3 rounded-md text-sm font-medium hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                លុប
              </button>
            </div>

            <div className="mt-3 text-xs text-gray-500">
              ធ្វើបច្ចុប្បន្នភាព:{" "}
              {new Date(product.updated_at).toLocaleDateString("km-KH")}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
