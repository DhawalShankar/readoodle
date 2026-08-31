import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getRentalsCollection } from "@/lib/mongodb";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ rentalId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
    }

    const { rentalId } = await params;
    const userId = (session.user as any).id;
    const userEmail = session.user.email?.toLowerCase();

    let additionalWeeks = 1;
    try {
      const body = await request.json();
      if (body.additional_weeks) additionalWeeks = Number(body.additional_weeks);
    } catch {}

    const rentalsCollection = await getRentalsCollection();

    const rental = await rentalsCollection.findOne({
      id: rentalId,
      $or: [{ renterId: userId }, { renterEmail: userEmail }],
    });

    if (!rental) {
      return NextResponse.json({ detail: "Rental not found or access denied." }, { status: 404 });
    }

    const currentDue = rental.dueDateISO ? new Date(rental.dueDateISO) : new Date(Date.now() + 7 * 86400000);
    currentDue.setDate(currentDue.getDate() + 7 * additionalWeeks);
    const newDueDateISO = currentDue.toISOString();

    const newWeeks = (rental.weeks || 1) + additionalWeeks;
    const newAmount = (rental.amount || 50) + 50 * additionalWeeks;

    await rentalsCollection.updateOne(
      { id: rentalId },
      {
        $set: {
          dueDateISO: newDueDateISO,
          weeks: newWeeks,
          amount: newAmount,
          status: "approved",
        },
      }
    );

    const updatedRental = await rentalsCollection.findOne({ id: rentalId });
    return NextResponse.json({
      ...updatedRental,
      dueDateISO: newDueDateISO,
      weeks: newWeeks,
      amount: newAmount,
    });
  } catch (error: any) {
    return NextResponse.json({ detail: error.message || "Failed to extend rental" }, { status: 500 });
  }
}
