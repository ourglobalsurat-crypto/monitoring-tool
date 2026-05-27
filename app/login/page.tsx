"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    setLoading(false);

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      setError(payload.error ?? "Unable to sign in.");
      return;
    }

    const params = new URLSearchParams(window.location.search);
    router.replace(params.get("from") ?? "/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Medallion Fence</p>
            <h1 className="text-xl font-semibold tracking-normal text-slate-950">Client Reporting</h1>
          </div>
        </div>

        <Card className="shadow-soft">
          <CardContent className="p-6">
            <div className="mb-6">
              <LockKeyhole className="h-6 w-6 text-primary" />
              <h2 className="mt-4 text-2xl font-semibold tracking-normal text-slate-950">Sign in</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">Enter the dashboard password to view live performance.</p>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
              {error && <p className="rounded-md bg-rose-50 px-3 py-2 text-sm font-medium text-rose">{error}</p>}
              <Button className="w-full" type="submit" disabled={loading}>
                {loading ? "Checking..." : "Open dashboard"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
