import { NextRequest, NextResponse } from "next/server";
import { getCategoriesCollection } from "@/app/lib/db";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const categories = await getCategoriesCollection();
    const categoryList = await categories.find({}).toArray();

    return NextResponse.json(categoryList);
  } catch (error) {
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

    const categories = await getCategoriesCollection();

    const newCategory = {
      id: new ObjectId().toString(),
      name,
      description: description || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await categories.insertOne(newCategory);

    return NextResponse.json({ ...newCategory, _id: result.insertedId });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
