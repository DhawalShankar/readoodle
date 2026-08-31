import { NextResponse } from "next/server";
import { getBooksCollection } from "@/lib/mongodb";

/**
 * GET /api/cities
 * Returns a list of unique cities where Readoodle has pickup locations
 * based on the books in the catalog
 */
export async function GET() {
    try {
        const booksCollection = await getBooksCollection();

        // Fetch all books and extract unique cities from pickup points
        const books = await booksCollection
            .find({}, { projection: { "lister.pickupPoint.city": 1 } })
            .toArray();

        // Extract unique cities
        const citiesSet = new Set<string>();
        books.forEach((book: any) => {
            if (book.lister?.pickupPoint?.city) {
                citiesSet.add(book.lister.pickupPoint.city);
            }
        });

        // Convert to array and sort
        const cities = Array.from(citiesSet).sort();

        // If no cities found, return default
        if (cities.length === 0) {
            return NextResponse.json({ cities: ["Kanpur"] });
        }

        return NextResponse.json({ cities });
    } catch (error: any) {
        return NextResponse.json(
            { detail: error.message || "Failed to fetch cities" },
            { status: 500 }
        );
    }
}
