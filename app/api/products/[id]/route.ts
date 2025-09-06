import { NextRequest, NextResponse } from "next/server";
import { getProductsCollection, getCategoriesCollection } from "@/app/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, price, categoryId, stock, imageUrl } = body;

    // Get category name
    const categories = await getCategoriesCollection();
    const category = await categories.findOne({ id: categoryId });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 400 }
      );
    }

    const products = await getProductsCollection();

    const updatedProduct = {
      name,
      description: description || "",
      price: parseFloat(price),
      categoryId,
      categoryName: category.name,
      stock: parseInt(stock),
      imageUrl: imageUrl || "",
      updatedAt: new Date(),
    };

    const result = await products.updateOne({ id }, { $set: updatedProduct });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const products = await getProductsCollection();

    const result = await products.deleteOne({ id });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
