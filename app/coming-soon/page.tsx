import { CORAL, FONT_DISPLAY, FONT_MONO, INK, PAPER } from "@/lib/theme";
import Button from "@/components/ui/Button";
import DashedCard from "@/components/ui/DashedCard";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function ComingSoonPage() {
  return (
    <div style={{ backgroundColor: PAPER }} className="min-h-screen">
      <Navbar />

      <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-24 text-center">
        <DashedCard className="max-w-sm" tilt={-3}>
          <p
            style={{ fontFamily: FONT_DISPLAY, color: CORAL }}
            className="text-3xl leading-none"
          >
            hi, reader!
          </p>
          <p
            style={{ fontFamily: FONT_MONO }}
            className="mt-3 text-[11px] uppercase tracking-widest text-[#20304D]/60"
          >
            status
          </p>
          <p style={{ fontFamily: FONT_MONO }} className="text-sm">
            still being doodled
          </p>
        </DashedCard>

        <h1
          style={{ fontFamily: FONT_DISPLAY, color: INK }}
          className="mt-8 text-5xl font-bold"
        >
          This page isn&rsquo;t ready yet
        </h1>
        <p className="mt-4 max-w-md text-[#20304D]/70">
          We&rsquo;re still building this bit of Readoodle. Browsing books and
          listing your own already work — check back here soon for the rest.
        </p>

        <div className="mt-8">
          <Button href="/" variant="filled">
            Back to Readoodle
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
}