"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PAPER, INK, FONT_DISPLAY } from "@/lib/theme";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const res = await signIn("credentials", { email, password, redirect: false });

    if (res?.error) {
      setError("Login failed — invalid email or password");
      setSubmitting(false);
      return;
    }

    router.push("/lister");
  }

  return (
    <div style={{ backgroundColor: PAPER }} className="flex min-h-screen items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <h1 style={{ fontFamily: FONT_DISPLAY, color: INK }} className="text-4xl font-bold">
          Log in
        </h1>

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
          className="w-full border border-[#20304D]/20 bg-[#FBF7EC] p-2.5 text-sm outline-none focus:border-[#20304D]/50"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          style={{ backgroundColor: INK, color: PAPER }}
          className="w-full rounded-sm p-2.5 text-sm font-semibold disabled:opacity-50"
        >
          {submitting ? "Logging in..." : "Log in"}
        </button>

        <a href="/signup" className="block text-center text-sm underline decoration-dashed underline-offset-4">
          New to Readoodle? Create an account
        </a>
      </form>
    </div>
  );
}