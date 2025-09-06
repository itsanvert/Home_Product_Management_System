import { MongoClient, Db, Collection } from "mongodb";
import { Product, Category } from "./schema";

let client: MongoClient;
let db: Db;

export async function connectToDatabase() {
  if (!client) {
    client = new MongoClient(process.env.MONGODB_URI as string);
    await client.connect();
    db = client.db();
  }
  return { client, db };
}

export async function getProductsCollection(): Promise<Collection<Product>> {
  const { db } = await connectToDatabase();
  return db.collection<Product>("products");
}

export async function getCategoriesCollection(): Promise<Collection<Category>> {
  const { db } = await connectToDatabase();
  return db.collection<Category>("categories");
}
