import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
      },
    });

    const productList = products.map((product) => ({
      ...product,
      created_at: product.created_at.toISOString(),
      updated_at: product.updated_at.toISOString(),
      categoryName: product.category?.name || "Unknown",
    }));

    return NextResponse.json(productList);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, price, category_id, stock, image_url } = body;

    // Get category name
    const category = await prisma.category.findUnique({
      where: { id: category_id },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        description: description || "",
        price: parseFloat(price),
        category_id,
        stock: parseInt(stock),
        image_url: image_url || "",
      },
    });

    return NextResponse.json(
      {
        ...newProduct,
        created_at: newProduct.created_at.toISOString(),
        updated_at: newProduct.updated_at.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
