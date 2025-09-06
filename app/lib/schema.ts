import { ObjectId } from "mongodb";

// Clean up unused variables in schema definitions

// For MongoDB with Drizzle, we'll define our schema types
export interface Category {
  _id?: ObjectId;
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  _id?: ObjectId;
  id: string;
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  categoryName: string;
  stock: number;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
