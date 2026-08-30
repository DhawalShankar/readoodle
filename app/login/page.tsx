"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) setError("Login fail — email ya password galat hai");
    else router.push("/lister");
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-sm p-8 space-y-4">
      <h1 className="text-2xl font-bold">Login</h1>
      <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" className="w-full border p-2" />
      <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="w-full border p-2" />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button type="submit" className="w-full bg-black text-white p-2">Login</button>
      <a href="/signup" className="block text-sm text-center underline">Naya account banao</a>
    </form>
  );
}