import { AlertCircle } from "lucide-react";

export function EmptyState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center">
      <AlertCircle className="h-8 w-8 text-slate-400" />
      <h3 className="mt-3 text-base font-semibold text-slate-950">{title}</h3>
      <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">{message}</p>
    </div>
  );
}
