import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, price, category_id, stock, image_url } = body;

    // Get category
    const category = await prisma.category.findUnique({
      where: { id: category_id },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 400 }
      );
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        description: description || "",
        price: parseFloat(price),
        category_id,
        stock: parseInt(stock),
        image_url: image_url || "",
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({
      ...updatedProduct,
      created_at: updatedProduct.created_at.toISOString(),
      updated_at: updatedProduct.updated_at.toISOString(),
    });
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

    await prisma.product.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
