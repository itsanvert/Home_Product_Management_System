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
    category_id: "",
    stock: "",
    image_url: "",
  });
  const [currency, setCurrency] = useState<"៛">("៛");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [showCamera, setShowCamera] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraError, setCameraError] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleCameraCapture = async () => {
    try {
      setCameraError("");

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera is not supported in this browser");
      }

      setShowCamera(true);

      // Try different camera configurations for better device compatibility
      const constraints = [
        {
          video: {
            facingMode: "environment",
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        },
        { video: { facingMode: "environment" } },
        { video: { facingMode: { exact: "environment" } } },
        { video: true },
        { video: { width: { ideal: 1280 }, height: { ideal: 720 } } },
      ];

      let stream: MediaStream | null = null;

      for (const constraint of constraints) {
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraint);
          break;
        } catch (err) {
          console.log("Trying next camera constraint...", err);
          continue;
        }
      }

      if (!stream) {
        throw new Error("Could not access camera with any configuration");
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // Wait for video to be ready
        await new Promise<void>((resolve, reject) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              if (videoRef.current) {
                videoRef.current
                  .play()
                  .then(() => resolve())
                  .catch(reject);
              }
            };
            videoRef.current.onerror = reject;
          }
        });
      }
    } catch (error) {
      console.error("Camera error:", error);
      let errorMessage = "Could not access camera";

      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          errorMessage =
            "Camera access denied. Please allow camera permissions and try again.";
        } else if (error.name === "NotFoundError") {
          errorMessage = "No camera found on this device.";
        } else if (error.name === "NotSupportedError") {
          errorMessage = "Camera is not supported on this device.";
        } else {
          errorMessage = error.message;
        }
      }

      setCameraError(errorMessage);
      setShowCamera(false);
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !videoRef.current.videoWidth) return;

    setIsCapturing(true);

    try {
      const video = videoRef.current;

      // Create canvas if it doesn't exist
      if (!canvasRef.current) {
        canvasRef.current = document.createElement("canvas");
      }

      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Could not get canvas context");
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to blob with better quality
      canvas.toBlob(
        async (blob) => {
          if (blob) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
            const file = new File([blob], `product-${timestamp}.jpg`, {
              type: "image/jpeg",
            });

            setImageFile(file);

            const reader = new FileReader();
            reader.onload = (e) => {
              const result = e.target?.result as string;
              setImagePreview(result);
              setFormData((prev) => ({ ...prev, image_url: "" })); // Clear URL when using file
            };
            reader.readAsDataURL(file);
          }
          setIsCapturing(false);
          closeCamera();
        },
        "image/jpeg",
        0.92 // High quality
      );
    } catch (error) {
      console.error("Capture error:", error);
      setIsCapturing(false);
      setCameraError("Failed to capture photo. Please try again.");
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
    setCameraError("");
  };

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || "",
        price: product.price.toString(),
        category_id: product.category_id,
        stock: product.stock.toString(),
        image_url: product.image_url || "",
      });
      setImagePreview(product.image_url || "");
    }
  }, [product]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      closeCamera();
    };
  }, []);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size too large. Please select a file smaller than 10MB.");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file.");
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setFormData((prev) => ({ ...prev, image_url: "" })); // Clear URL when using file
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData({ ...formData, image_url: url });
    setImagePreview(url);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadImageToServer = async (file: File): Promise<string> => {
    const response = await fetch(`/api/upload-vercel?filename=${file.name}`, {
      method: "POST",
      body: file,
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Image upload failed" }));
      throw new Error(errorData.message || "Image upload failed");
    }

    const newBlob = await response.json();
    if (!newBlob.url) {
      throw new Error("Image upload failed: No URL returned");
    }
    return newBlob.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let finalImageUrl = formData.image_url;

      // If there's a file to upload, upload it first
      if (imageFile) {
        try {
          finalImageUrl = await uploadImageToServer(imageFile);
        } catch (error: any) {
          console.error("Image upload failed:", error);
          alert(`Image upload failed: ${error.message}`);
          setIsUploading(false);
          return;
        }
      }

      // Validate required fields
      if (!formData.name.trim()) {
        alert("Product name is required");
        return;
      }

      if (!formData.category_id) {
        alert("Category selection is required");
        return;
      }

      if (!formData.price || parseFloat(formData.price) <= 0) {
        alert("Valid price is required");
        return;
      }

      if (!formData.stock || parseInt(formData.stock) < 0) {
        alert("Valid stock quantity is required");
        return;
      }

      const submitData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price), // Keep as Riel
        category_id: formData.category_id,
        stock: parseInt(formData.stock),
        image_url: finalImageUrl || "",
      };

      onSubmit(submitData);
    } catch (error: unknown) {
      console.error("Form submission failed:", error);
      alert("Failed to submit form. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    setImagePreview("");
    setImageFile(null);
    setFormData({ ...formData, image_url: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl mx-auto my-4 sm:my-8 max-h-[98vh] sm:max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3 sm:py-4 rounded-t-lg z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              {product ? "កែសម្រួលផលិតផល" : "បន្ថែមផលិតផលថ្មី"}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
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

        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-6 space-y-4 sm:space-y-6"
        >
          {/* Product Image Section */}
          <div className="space-y-3 sm:space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              រូបភាពផលិតផល
            </label>

            {/* Image Preview */}
            {imagePreview && (
              <div className="relative inline-block">
                <div className="w-24 h-24 sm:w-32 sm:h-32 relative rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
                  <Image
                    src={imagePreview}
                    alt="Product preview"
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 96px, 128px"
                    loader={({ src }) => src}
                  />
                </div>
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center hover:bg-red-600 transition-colors text-xs sm:text-sm"
                >
                  ×
                </button>
              </div>
            )}

            {/* Camera Error */}
            {cameraError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-red-700 dark:text-red-300 text-sm">
                {cameraError}
              </div>
            )}

            {/* Image Upload Controls */}
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                  បង្ហោះឯកសាររូបភាព
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm text-center hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"
                  >
                    Select File
                  </button>
                  <button
                    type="button"
                    onClick={handleCameraCapture}
                    className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 outline-none transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 sm:h-5 sm:w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="hidden sm:inline">Take Photo</span>
                    <span className="sm:hidden">Camera</span>
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                  ឬ URL រូបភាព
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={handleImageUrlChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ឈ្មោះផលិតផល *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="បញ្ចូលឈ្មោះផលិតផល"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ប្រភេទ *
              </label>
              <select
                required
                value={formData.category_id}
                onChange={(e) =>
                  setFormData({ ...formData, category_id: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              ការពិពណ៌នា
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={3}
              placeholder="បញ្ចូលការពិពណ៌នាអំពីផលិតផល"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                តម្លៃ *
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="hidden"
                  value="៛"
                  className="px-2 sm:px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="submit"
              disabled={isUploading}
              className="flex-1 bg-blue-600 text-white py-2.5 sm:py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
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
              className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 py-2.5 sm:py-3 px-4 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 disabled:bg-gray-200 dark:disabled:bg-gray-700 transition-colors font-medium text-sm sm:text-base"
            >
              បោះបង់
            </button>
          </div>
        </form>
      </div>

      {/* Enhanced Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black z-[60] flex flex-col">
          {/* Camera Header */}
          <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-sm">
            <h3 className="text-white font-medium text-lg">ថតរូបភាពផលិតផល</h3>
            <button
              onClick={closeCamera}
              className="text-white hover:text-gray-300 transition-colors"
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

          {/* Camera View */}
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="w-full h-full max-w-2xl max-h-[70vh] relative">
              <video
                ref={videoRef}
                className="w-full h-full object-cover rounded-lg"
                playsInline
                muted
                autoPlay
              />

              {/* Camera Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-4 border-2 border-white/30 rounded-lg"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-2 border-white rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Camera Controls */}
          <div className="p-4 bg-black/50 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-4 max-w-md mx-auto">
              <button
                onClick={closeCamera}
                className="flex-1 px-4 py-3 bg-red-500/80 backdrop-blur-sm text-white rounded-full hover:bg-red-600/80 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={capturePhoto}
                disabled={isCapturing}
                className="flex-shrink-0 w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white disabled:bg-white/50 transition-all flex items-center justify-center shadow-lg"
              >
                {isCapturing ? (
                  <svg
                    className="animate-spin h-6 w-6 text-gray-600"
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
                ) : (
                  <div className="w-6 h-6 bg-gray-600 rounded-full"></div>
                )}
              </button>
              <div className="flex-1"></div> {/* Spacer for center alignment */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
