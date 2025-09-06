import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";

export async function GET() {
  try {
    const allCategories = await prisma.category.findMany();
    return NextResponse.json(
      allCategories.map((category) => ({
        ...category,
        created_at: category.created_at.toISOString(),
        updated_at: category.updated_at.toISOString(),
      }))
    );
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;

    const newCategory = await prisma.category.create({
      data: {
        name,
        description: description || "",
      },
    });

    return NextResponse.json({
      ...newCategory,
      created_at: newCategory.created_at.toISOString(),
      updated_at: newCategory.updated_at.toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
