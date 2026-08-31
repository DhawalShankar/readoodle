import { NextResponse } from "next/server";
import { getRentalsCollection, getUsersCollection, getBooksCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { requireAdminSession } from "@/lib/admin";
import { ADMIN_EMAIL } from "@/lib/admin-utils";

export async function GET() {
    try {
        const { errorResponse } = await requireAdminSession();
        if (errorResponse) return errorResponse;

        const rentalsCollection = await getRentalsCollection();
        const usersCollection = await getUsersCollection();
        const booksCollection = await getBooksCollection();

        // Get all approved rentals to calculate lister earnings
        const approvedRentals = await rentalsCollection
            .find({ status: "approved" })
            .sort({ createdAt: -1 })
            .toArray();

        // Group rentals by lister to calculate earnings
        const listerEarnings: Record<string, any> = {};

        for (const rental of approvedRentals) {
            const bookData = await booksCollection.findOne({ id: rental.bookId });

            if (bookData && bookData.lister) {
                const listerId = bookData.lister.id;

                let listerUser = null;
                try {
                    listerUser = await usersCollection.findOne({ _id: new ObjectId(listerId) });
                } catch {
                    listerUser = await usersCollection.findOne({ _id: listerId as any });
                }

                // Skip admin user - don't show their payouts
                if (listerUser?.email === ADMIN_EMAIL) {
                    continue;
                }

                if (!listerEarnings[listerId]) {
                    const upiId = bookData.lister?.upiId || listerUser?.upiId || "N/A";
                    const phoneNumber = bookData.lister?.phoneNumber || listerUser?.phoneNumber || "N/A";

                    listerEarnings[listerId] = {
                        id: listerId,
                        name: bookData.lister.name || listerUser?.name || "Unknown",
                        email: listerUser?.email || "N/A",
                        upiId,
                        phoneNumber,
                        pickupPoint: bookData.lister.pickupPoint,
                        totalRentals: 0,
                        totalEarnings: 0, // Before commission
                        platformCommission: 0, // 2% commission
                        netEarnings: 0, // After commission
                        payoutReleased: Boolean(listerUser?.payoutReleased),
                        lastPayoutDate: listerUser?.lastPayoutDate ? new Date(listerUser.lastPayoutDate).toISOString() : null,
                        rentals: [],
                    };
                }

                const rentalAmount = rental.amount || 50;
                const commission = Math.round(rentalAmount * 0.02 * 100) / 100; // 2% commission
                const netAmount = rentalAmount - commission;

                listerEarnings[listerId].totalRentals += 1;
                listerEarnings[listerId].totalEarnings += rentalAmount;
                listerEarnings[listerId].platformCommission += commission;
                listerEarnings[listerId].netEarnings += netAmount;
                listerEarnings[listerId].rentals.push({
                    id: rental.id,
                    bookTitle: rental.bookTitle,
                    amount: rentalAmount,
                    commission: commission,
                    netAmount: netAmount,
                    createdAt: rental.createdAt,
                });
            }
        }

        // Convert to array and sort by net earnings
        const listers = Object.values(listerEarnings)
            .sort((a, b) => (b.netEarnings || 0) - (a.netEarnings || 0));

        return NextResponse.json(listers);
    } catch (error: any) {
        return NextResponse.json(
            { detail: error.message || "Failed to fetch listers" },
            { status: 500 }
        );
    }
}

export async function PATCH(request: Request) {
    try {
        const { errorResponse } = await requireAdminSession();
        if (errorResponse) return errorResponse;

        const { listerId, payoutReleased } = await request.json();
        if (!listerId || typeof payoutReleased !== "boolean") {
            return NextResponse.json({ detail: "listerId and boolean payoutReleased required" }, { status: 400 });
        }

        const usersCollection = await getUsersCollection();
        let filter: any;
        try {
            filter = { _id: new ObjectId(listerId) };
        } catch {
            filter = { _id: listerId };
        }

        const lastPayoutDate = payoutReleased ? new Date() : null;
        await usersCollection.updateOne(filter, {
            $set: { payoutReleased, lastPayoutDate },
        });

        return NextResponse.json({ success: true, listerId, payoutReleased, lastPayoutDate });
    } catch (error: any) {
        return NextResponse.json(
            { detail: error.message || "Failed to update lister payout status" },
            { status: 500 }
        );
    }
}
