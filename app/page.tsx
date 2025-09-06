"use client";

import { useState, useEffect, useCallback } from "react";
import ProductList from "./components/ProductList";
import ProductForm from "./components/ProductForm";
import CategoryForm from "./components/CategoryForm";
import CategoryList from "./components/CategoryList";
import SearchBar from "./components/SearchBar";
import { Product, Category } from "./lib/schema";

type ActiveTab = "products" | "categories";

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [editingCategory, setEditingCategory] = useState<
    Category | undefined
  >();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("មិនអាចទាញយកផលិតផល:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("មិនអាចទាញយកប្រភេទ:", error);
    }
  };

  const handleSearch = useCallback(
    (query: string, categoryId: string) => {
      let filtered = products;

      if (query) {
        filtered = filtered.filter(
          (product) =>
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            product.description?.toLowerCase().includes(query.toLowerCase())
        );
      }

      if (categoryId) {
        filtered = filtered.filter(
          (product) => product.categoryId === categoryId
        );
      }

      setFilteredProducts(filtered);
    },
    [products]
  );

  // ការគ្រប់គ្រងផលិតផល
  const handleCreateProduct = async (productData: Partial<Product>) => {
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        await fetchProducts();
        setShowProductForm(false);
      }
    } catch (error) {
      console.error("មិនអាចបង្កើតផលិតផល:", error);
    }
  };

  const handleUpdateProduct = async (productData: Partial<Product>) => {
    if (!editingProduct) return;

    try {
      const response = await fetch(`/api/products/${editingProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        await fetchProducts();
        setEditingProduct(undefined);
        setShowProductForm(false);
      }
    } catch (error) {
      console.error("មិនអាចធ្វើបច្ចុប្បន្នភាពផលិតផល:", error);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("តើអ្នកពិតជាចង់លុបផលិតផលនេះមែនទេ?")) return;

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchProducts();
      }
    } catch (error) {
      console.error("មិនអាចលុបផលិតផល:", error);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleProductFormSubmit = (productData: Partial<Product>) => {
    if (editingProduct) {
      handleUpdateProduct(productData);
    } else {
      handleCreateProduct(productData);
    }
  };

  const handleCancelProductForm = () => {
    setShowProductForm(false);
    setEditingProduct(undefined);
  };

  // ការគ្រប់គ្រងប្រភេទ
  const handleCreateCategory = async (categoryData: Partial<Category>) => {
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryData),
      });

      if (response.ok) {
        await fetchCategories();
        setShowCategoryForm(false);
      }
    } catch (error) {
      console.error("មិនអាចបង្កើតប្រភេទ:", error);
    }
  };

  const handleUpdateCategory = async (categoryData: Partial<Category>) => {
    if (!editingCategory) return;

    try {
      const response = await fetch(`/api/categories/${editingCategory.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryData),
      });

      if (response.ok) {
        await fetchCategories();
        await fetchProducts(); // ផ្ទុកផលិតផលម្តងទៀតដើម្បីធ្វើបច្ចុប្បន្នភាពឈ្មោះប្រភេទ
        setEditingCategory(undefined);
        setShowCategoryForm(false);
      }
    } catch (error) {
      console.error("មិនអាចធ្វើបច្ចុប្បន្នភាពប្រភេទ:", error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const productsInCategory = products.filter((p) => p.categoryId === id);

    if (productsInCategory.length > 0) {
      if (
        !confirm(
          `ប្រភេទនេះមានផលិតផល ${productsInCategory.length} ។ ការលុបវានឹងលុបផលិតផលទាំងអស់ដែលពាក់ព័ន្ធ។ តើអ្នកពិតជាចង់ធ្វើដូច្នេះមែនទេ?`
        )
      ) {
        return;
      }
    } else {
      if (!confirm("តើអ្នកពិតជាចង់លុបប្រភេទនេះមែនទេ?")) return;
    }

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchCategories();
        await fetchProducts(); // ផ្ទុកផលិតផលម្តងទៀតប្រសិនបើមានផលិតផលត្រូវបានលុប
      }
    } catch (error) {
      console.error("មិនអាចលុបប្រភេទ:", error);
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setShowCategoryForm(true);
  };

  const handleCategoryFormSubmit = (categoryData: Partial<Category>) => {
    if (editingCategory) {
      handleUpdateCategory(categoryData);
    } else {
      handleCreateCategory(categoryData);
    }
  };

  const handleCancelCategoryForm = () => {
    setShowCategoryForm(false);
    setEditingCategory(undefined);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <svg
            className="animate-spin h-8 w-8 text-blue-600"
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
          <span className="text-lg text-gray-700">កំពុងផ្ទុក...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* ក្បាល់ទំព័រ */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            ប្រព័ន្ធគ្រប់គ្រងផលិតផល
          </h1>
          <p className="text-gray-600 text-lg">
            គ្រប់គ្រងផលិតផល និងប្រភេទផលិតផលរបស់អ្នកដោយមានប្រសិទ្ធភាព
          </p>
        </div>

        {/* របារណាវិចិត្រ */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("products")}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "products"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                ផលិតផល ({products.length})
              </button>
              <button
                onClick={() => setActiveTab("categories")}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "categories"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                ប្រភេទ ({categories.length})
              </button>
            </nav>
          </div>
        </div>

        {/* ផ្ទាំងផលិតផល */}
        {activeTab === "products" && (
          <>
            <div className="mb-6">
              <SearchBar categories={categories} onSearch={handleSearch} />
            </div>

            <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  ផលិតផល ({filteredProducts.length})
                </h2>
              </div>
              <button
                onClick={() => setShowProductForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                បន្ថែមផលិតផលថ្មី
              </button>
            </div>

            <ProductList
              products={filteredProducts}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
            />
          </>
        )}

        {/* ផ្ទាំងប្រភេទ */}
        {activeTab === "categories" && (
          <>
            <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  ប្រភេទ ({categories.length})
                </h2>
              </div>
              <button
                onClick={() => setShowCategoryForm(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                បន្ថែមប្រភេទថ្មី
              </button>
            </div>

            <CategoryList
              categories={categories}
              onEdit={handleEditCategory}
              onDelete={handleDeleteCategory}
            />
          </>
        )}

        {/* សំនុំបែបបទ */}
        {showProductForm && (
          <ProductForm
            product={editingProduct}
            categories={categories}
            onSubmit={handleProductFormSubmit}
            onCancel={handleCancelProductForm}
          />
        )}

        {showCategoryForm && (
          <CategoryForm
            category={editingCategory}
            onSubmit={handleCategoryFormSubmit}
            onCancel={handleCancelCategoryForm}
          />
        )}
      </div>
    </div>
  );
}
