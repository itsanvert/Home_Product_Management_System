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

    // Validation
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Product name is required" },
        { status: 400 }
      );
    }

    if (!category_id || typeof category_id !== "string") {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    if (price === undefined || price === null || isNaN(parseFloat(price))) {
      return NextResponse.json(
        { error: "Valid price is required" },
        { status: 400 }
      );
    }

    if (
      stock === undefined ||
      stock === null ||
      isNaN(parseInt(stock)) ||
      parseInt(stock) < 0
    ) {
      return NextResponse.json(
        { error: "Valid stock quantity is required" },
        { status: 400 }
      );
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: category_id },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 400 }
      );
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description ? description.trim() : "",
        price: parseFloat(price),
        category_id,
        stock: parseInt(stock),
        image_url: image_url || "", // Handle both null/undefined and empty string
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Return formatted response
    return NextResponse.json({
      id: updatedProduct.id,
      name: updatedProduct.name,
      description: updatedProduct.description,
      price: updatedProduct.price,
      category_id: updatedProduct.category_id,
      category_name: updatedProduct.category.name,
      stock: updatedProduct.stock,
      image_url: updatedProduct.image_url,
      created_at: updatedProduct.created_at.toISOString(),
      updated_at: updatedProduct.updated_at.toISOString(),
    });
  } catch (error) {
    console.error("Failed to update product:", error);
    return NextResponse.json(
      { error: "Failed to update product. Please try again." },
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

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Delete product
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete product:", error);
    return NextResponse.json(
      { error: "Failed to delete product. Please try again." },
      { status: 500 }
    );
  }
}

// Also add POST for creating products
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, price, category_id, stock, image_url } = body;

    // Validation
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Product name is required" },
        { status: 400 }
      );
    }

    if (!category_id || typeof category_id !== "string") {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    if (price === undefined || price === null || isNaN(parseFloat(price))) {
      return NextResponse.json(
        { error: "Valid price is required" },
        { status: 400 }
      );
    }

    if (
      stock === undefined ||
      stock === null ||
      isNaN(parseInt(stock)) ||
      parseInt(stock) < 0
    ) {
      return NextResponse.json(
        { error: "Valid stock quantity is required" },
        { status: 400 }
      );
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: category_id },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 400 }
      );
    }

    // Create product
    const newProduct = await prisma.product.create({
      data: {
        name: name.trim(),
        description: description ? description.trim() : "",
        price: parseFloat(price),
        category_id,
        stock: parseInt(stock),
        image_url: image_url || "", // Handle both null/undefined and empty string
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Return formatted response
    return NextResponse.json(
      {
        id: newProduct.id,
        name: newProduct.name,
        description: newProduct.description,
        price: newProduct.price,
        category_id: newProduct.category_id,
        category_name: newProduct.category.name,
        stock: newProduct.stock,
        image_url: newProduct.image_url,
        created_at: newProduct.created_at.toISOString(),
        updated_at: newProduct.updated_at.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create product:", error);
    return NextResponse.json(
      { error: "Failed to create product. Please try again." },
      { status: 500 }
    );
  }
}
