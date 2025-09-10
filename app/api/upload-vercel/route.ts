import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get("filename");

  if (!filename || !request.body) {
    return NextResponse.json(
      { message: "No filename or file body provided." },
      { status: 400 }
    );
  }

  try {
    const blob = await put(filename, request.body, {
      access: "public",
    });

    return NextResponse.json(blob);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Vercel Blob upload error:", errorMessage);

    if (errorMessage.includes("store not found")) {
      return NextResponse.json(
        {
          message:
            "Vercel Blob store not found. Please link your project to a Vercel team with Blob enabled.",
        },
        { status: 404 }
      );
    }
    if (errorMessage.includes("forbidden")) {
      return NextResponse.json(
        { message: "Permission denied. Please check your Vercel Blob token." },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { message: "Failed to upload file." },
      { status: 500 }
    );
  }
}
