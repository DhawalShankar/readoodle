import { MongoClient, Db } from "mongodb";

/**
 * Single source of truth for the MongoDB connection. Nothing else in the
 * app should import "mongodb" directly — route handlers call
 * getBooksCollection() (or getDb(), if you add more collections later)
 * and never touch the driver themselves. That's what makes swapping this
 * out later a contained change: only this file, plus the three route
 * handlers, know a database exists at all.
 */

const uri = process.env.MONGO_URI;

if (!uri) {
  throw new Error("Missing MONGO_URI — add it to .env.local");
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // Next.js dev mode hot-reloads modules on every save. Without this
  // global cache, that would open a fresh MongoDB connection on every
  // single reload and never close the old ones.
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = new MongoClient(uri).connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = new MongoClient(uri).connect();
}

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  // Uses the database name from MONGO_URI itself (e.g.
  // mongodb+srv://.../readoodle?...) — no need to name it again here.
  return client.db();
}

export async function getBooksCollection() {
  const db = await getDb();
  return db.collection("books");
}

export async function getUsersCollection() {
  const client = await getDb(); // jo bhi tumhara existing connection function hai
  return client.collection("users");
}

export async function getRentalsCollection() {
  const client = await getDb(); // wahi function jo getUsersCollection/getBooksCollection use karte hain
  return client.collection("rentals");
}