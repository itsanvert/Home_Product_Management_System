import { NextRequest, NextResponse } from 'next/server';
import { getProductsCollection, getCategoriesCollection } from '@/app/lib/db';

export async function GET() {
  try {
    const products = await getProductsCollection();
    const allProducts = await products.find({}).toArray();
    return NextResponse.json(allProducts);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, price, categoryId, stock, imageUrl } = body;

    // Get category name
    const categories = await getCategoriesCollection();
    const category = await categories.findOne({ id: categoryId });
    
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 400 });
    }

    const products = await getProductsCollection();
    
    const newProduct = {
      id: Date.now().toString(),
      name,
      description: description || '',
      price: parseFloat(price),
      categoryId,
      categoryName: category.name,
      stock: parseInt(stock),
      imageUrl: imageUrl || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await products.insertOne(newProduct);
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}