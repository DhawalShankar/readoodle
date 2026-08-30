"use client";

import type { BookFilterState } from "@/types";
import { FONT_MONO, INK } from "@/lib/theme";
import DashedCard from "@/components/ui/DashedCard";

const GENRES = ["all", "Fiction", "Non-fiction", "Fantasy", "Romance", "Mystery", "Textbook"];
const CITIES = ["all", "Kanpur"];

export default function BookFilters({
  filters,
  onChange,
}: {
  filters: BookFilterState;
  onChange: (next: BookFilterState) => void;
}) {
  function set<K extends keyof BookFilterState>(key: K, value: BookFilterState[K]) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <DashedCard className="sticky top-6 space-y-6">
      <p style={{ fontFamily: FONT_MONO, color: INK }} className="text-xs uppercase tracking-[0.2em] text-[#20304D]/60">
        Find your next read
      </p>

      <div>
        <input
          value={filters.query}
          onChange={(e) => set("query", e.target.value)}
          placeholder="Search title or author…"
          className="w-full border border-[#20304D]/25 bg-transparent px-3 py-2 text-sm outline-none focus:border-[#20304D]"
        />
      </div>

      <FilterGroup label="Genre">
        <select
          value={filters.genre}
          onChange={(e) => set("genre", e.target.value)}
          className="w-full border border-[#20304D]/25 bg-transparent px-3 py-2 text-sm outline-none focus:border-[#20304D]"
        >
          {GENRES.map((g) => (
            <option key={g} value={g}>
              {g === "all" ? "All genres" : g}
            </option>
          ))}
        </select>
      </FilterGroup>

      <FilterGroup label="Pickup point">
        <select
          value={filters.pickupCity}
          onChange={(e) => set("pickupCity", e.target.value)}
          className="w-full border border-[#20304D]/25 bg-transparent px-3 py-2 text-sm outline-none focus:border-[#20304D]"
        >
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c === "all" ? "Any pickup point" : c}
            </option>
          ))}
        </select>
      </FilterGroup>

      <FilterGroup label="Availability">
        <div className="flex gap-4 text-sm">
          {(["all", "available", "unavailable"] as const).map((v) => (
            <label key={v} className="flex items-center gap-1.5">
              <input type="radio" name="availability" checked={filters.availability === v} onChange={() => set("availability", v)} />
              {v === "all" ? "All" : v === "available" ? "Available" : "Rented out"}
            </label>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup label={`Max price · ₹${filters.maxPricePerWeek ?? 200}/wk`}>
        <input
          type="range"
          min={20}
          max={200}
          step={10}
          value={filters.maxPricePerWeek ?? 200}
          onChange={(e) => set("maxPricePerWeek", Number(e.target.value))}
          className="w-full"
        />
      </FilterGroup>

      <FilterGroup label="Sort by">
        <select
          value={filters.sort}
          onChange={(e) => set("sort", e.target.value as BookFilterState["sort"])}
          className="w-full border border-[#20304D]/25 bg-transparent px-3 py-2 text-sm outline-none focus:border-[#20304D]"
        >
          <option value="relevance">Relevance</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="newest">Newest listings</option>
        </select>
      </FilterGroup>
    </DashedCard>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#20304D]/60">{label}</p>
      {children}
    </div>
  );
}
