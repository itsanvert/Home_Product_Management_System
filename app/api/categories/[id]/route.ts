import { NextRequest, NextResponse } from "next/server";


export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description } = body;

    const updatedCategory = {
      name,
      description: description || "",
      updated_at: new Date(),
    };

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

    // TODO: Implement delete products in this category for PostgreSQL
    // TODO: Implement delete category for PostgreSQL

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
