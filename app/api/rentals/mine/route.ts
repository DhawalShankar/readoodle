import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getBooksCollection, getRentalsCollection } from "@/lib/mongodb";
import { calculateLateFine, daysUntil } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const userEmail = session.user.email?.toLowerCase();
    const { searchParams } = new URL(request.url);
    const statusTab = searchParams.get("status") || "active";

    const rentalsCollection = await getRentalsCollection();
    const booksCollection = await getBooksCollection();

    // Query user rentals by userId or email
    const rawRentals = await rentalsCollection
      .find({
        $or: [
          { renterId: userId },
          { renterEmail: userEmail },
          { "renter.id": userId },
        ],
      })
      .sort({ createdAt: -1 })
      .toArray();

    // Fetch all related books to format full Book objects
    const bookIds = Array.from(new Set(rawRentals.map((r) => r.bookId).filter(Boolean)));
    const booksList = bookIds.length > 0 ? await booksCollection.find({ id: { $in: bookIds } }).toArray() : [];
    const booksMap = new Map(booksList.map((b) => [b.id, b]));

    const formattedRentals = rawRentals.map((r) => {
      const bookDoc = booksMap.get(r.bookId);

      const coverColor = bookDoc?.coverColor || r.bookCoverColor || "#5B7B9A";
      const title = bookDoc?.title || r.bookTitle || "Untitled Book";
      const author = bookDoc?.author || r.bookAuthor || "Unknown Author";

      const rentedOnISO = r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString();

      let dueDateISO = r.dueDateISO;
      if (!dueDateISO) {
        const d = new Date(r.createdAt || Date.now());
        d.setDate(d.getDate() + 7 * (r.weeks || 1));
        dueDateISO = d.toISOString();
      }

      const isReturned = r.status === "returned" || r.status === "completed";
      const isRejected = r.status === "rejected";

      const daysRemaining = daysUntil(dueDateISO);
      const isOverdue = !isReturned && !isRejected && daysRemaining < 0;
      const lateFine = isOverdue ? calculateLateFine(dueDateISO) : (r.lateFine || 0);

      const rentalFeeTotal = r.amount || r.rentalFeeTotal || 50;
      const depositHeld = r.depositHeld || 500;
      const totalPayableOnReturn = rentalFeeTotal + lateFine;

      let calculatedStatus: "active" | "overdue" | "returned" | "pending_approval" | "rejected" = "active";
      if (isReturned) calculatedStatus = "returned";
      else if (isRejected) calculatedStatus = "rejected";
      else if (isOverdue) calculatedStatus = "overdue";
      else if (r.status === "pending_approval") calculatedStatus = "pending_approval";

      return {
        id: r.id || r._id.toString(),
        bookId: r.bookId,
        book: {
          id: r.bookId || "unknown",
          title,
          author,
          coverColor,
          genre: bookDoc?.genre || "Fiction",
          description: bookDoc?.description || "",
          condition: bookDoc?.condition || "good",
          bookPrice: bookDoc?.bookPrice || 100,
          rentalPricePerWeek: bookDoc?.rentalPricePerWeek || 50,
          securityDeposit: bookDoc?.securityDeposit || 0,
          available: bookDoc?.available ?? true,
          lister: bookDoc?.lister || {
            id: "system",
            name: "Readoodle",
            source: "readoodle",
            pickupPoint: {
              id: "p1",
              label: r.pickupLocation || "Pickup Point",
              addressLine: "",
              city: "Kanpur",
            },
          },
          bookmark: bookDoc?.bookmark || {
            id: "bm1",
            setName: "Season 1",
            designName: "Classic",
            imageUrl: "",
          },
        },
        rentedOnISO,
        dueDateISO,
        returnedOnISO: r.returnedOnISO || null,
        status: calculatedStatus,
        weeks: r.weeks || 1,
        rentalFeeTotal,
        depositHeld,
        lateFine,
        totalPayableOnReturn,
        daysRemaining,
        pickupLocation: r.pickupLocation || "Readoodle Pickup Point",
      };
    });

    // Filter by tab
    const filteredRentals = formattedRentals.filter((r) => {
      if (statusTab === "history") {
        return r.status === "returned" || r.status === "rejected";
      }
      return r.status === "active" || r.status === "overdue" || r.status === "pending_approval";
    });

    return NextResponse.json(filteredRentals);
  } catch (error: any) {
    return NextResponse.json({ detail: error.message || "Failed to fetch rentals" }, { status: 500 });
  }
}
