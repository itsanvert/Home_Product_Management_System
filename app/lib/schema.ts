export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category_id: string;
  category_name: string;
  stock: number;
  image_url?: string;
  currency: "USD" | "KHR";
  created_at: Date;
  updated_at: Date;
}
