import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUsersCollection } from "@/lib/mongodb";
import { EARLY_USER_LIMIT, EARLY_USER_MAX_ACTIVE_RENTALS, DEFAULT_MAX_ACTIVE_RENTALS } from "@/lib/constants";

export async function POST(request: Request) {
  const { name, email, password } = await request.json();

  if (!name || !email || !password) {
    return NextResponse.json({ detail: "Sab fields required hain" }, { status: 400 });
  }

  const users = await getUsersCollection();
  const existing = await users.findOne({ email });
  if (existing) {
    return NextResponse.json({ detail: "Ye email already registered hai" }, { status: 400 });
  }

  const totalUsers = await users.countDocuments();
  const maxActiveRentals =
    totalUsers < EARLY_USER_LIMIT ? EARLY_USER_MAX_ACTIVE_RENTALS : DEFAULT_MAX_ACTIVE_RENTALS;

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await users.insertOne({
    name,
    email,
    passwordHash,
    maxActiveRentals, // 2 agar pehle 20 mein hai, warna 1
    createdAt: new Date(),
  });

  return NextResponse.json({ id: result.insertedId.toString(), name, email }, { status: 201 });
}