import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description } = body;

    await prisma.category.update({
      where: { id },
      data: {
        name,
        description: description || "",
      },
    });

    // TODO: Implement update query for PostgreSQL

    // Update category name in all products that use this category
    // TODO: Implement product updates for PostgreSQL

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
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

    // Delete all products in this category first
    await prisma.product.deleteMany({
      where: { category_id: id },
    });

    // Then delete the category
    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
