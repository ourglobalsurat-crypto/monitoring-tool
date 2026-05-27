import { AlertTriangle } from "lucide-react";

export function ErrorBanner({ errors }: { errors: string[] }) {
  if (!errors.length) return null;

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-950">
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
        <div>
          <p className="font-semibold">Some live data is unavailable</p>
          <p className="mt-1 text-sm leading-6 text-amber-800">{errors.join(" ")}</p>
        </div>
      </div>
    </div>
  );
}
