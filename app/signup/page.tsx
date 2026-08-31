"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PAPER, INK, FONT_DISPLAY } from "@/lib/theme";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.detail ?? "Signup failed — please try again");
        setSubmitting(false);
        return;
      }

      router.push("/login");
    } catch {
      setError("Something went wrong — please try again");
      setSubmitting(false);
    }
  }

  return (
    <div style={{ backgroundColor: PAPER }} className="flex min-h-screen items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <h1 style={{ fontFamily: FONT_DISPLAY, color: INK }} className="text-4xl font-bold">
          Join Readoodle
        </h1>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          type="text"
          placeholder="Name"
          required
          className="w-full border border-[#20304D]/20 bg-[#FBF7EC] p-2.5 text-sm outline-none focus:border-[#20304D]/50"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Email"
          required
          className="w-full border border-[#20304D]/20 bg-[#FBF7EC] p-2.5 text-sm outline-none focus:border-[#20304D]/50"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Password"
          required
          minLength={6}
          className="w-full border border-[#20304D]/20 bg-[#FBF7EC] p-2.5 text-sm outline-none focus:border-[#20304D]/50"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          style={{ backgroundColor: INK, color: PAPER }}
          className="w-full rounded-sm p-2.5 text-sm font-semibold disabled:opacity-50"
        >
          {submitting ? "Creating account..." : "Create account"}
        </button>

        <a href="/login" className="block text-center text-sm underline decoration-dashed underline-offset-4">
          Already have an account? Log in
        </a>
      </form>
    </div>
  );
}