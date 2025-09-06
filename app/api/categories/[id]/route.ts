import { NextRequest, NextResponse } from "next/server";
import { getCategoriesCollection, getProductsCollection } from "@/app/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description } = body;

    const categories = await getCategoriesCollection();
    
    const updatedCategory = {
      name,
      description: description || '',
      updatedAt: new Date()
    };

    const result = await categories.updateOne(
      { id },
      { $set: updatedCategory }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Update category name in all products that use this category
    const products = await getProductsCollection();
    await products.updateMany(
      { categoryId: id },
      { $set: { categoryName: name, updatedAt: new Date() } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const categories = await getCategoriesCollection();
    const products = await getProductsCollection();

    // Delete all products in this category first
    await products.deleteMany({ categoryId: id });

    // Then delete the category
    const result = await categories.deleteOne({ id });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}