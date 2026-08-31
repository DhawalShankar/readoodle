'use client';

import ListingForm from '@/components/lister/ListingForm';
import { FONT_DISPLAY, INK, PAPER, SAGE } from '@/lib/theme';

export default function NewListingPage() {
    return (
        <div style={{ backgroundColor: PAPER }} className="min-h-screen">
            <div className="mx-auto max-w-3xl px-6 py-12">
                <h1 style={{ fontFamily: FONT_DISPLAY, color: INK }} className="text-5xl font-bold">
                    List a book
                </h1>
                <p className="mt-3 max-w-xl text-[#20304D]/70">
                    Every rental is ₹50 for 7 days. Set your pickup point and publish the book in minutes.
                </p>

                <div className="mt-10 border-2 border-dashed border-[#20304D]/20 bg-[#F5F9F6] p-6">
                    <p style={{ fontFamily: 'var(--font-plex-mono)', color: SAGE }} className="text-xs uppercase tracking-[0.2em]">
                        Pricing
                    </p>
                    <p className="mt-2 text-sm text-[#20304D]/80">
                        Readoodle keeps a flat 2% commission, and you receive ₹49 per approved rental after the platform cut.
                    </p>
                </div>

                <div className="mt-10">
                    <ListingForm />
                </div>
            </div>
        </div>
    );
}
