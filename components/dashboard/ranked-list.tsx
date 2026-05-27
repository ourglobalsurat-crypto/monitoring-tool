import { ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { NamedMetric } from "@/types/dashboard";
import { formatNumber } from "@/lib/utils";

export function RankedList({
  title,
  description,
  data,
  valueLabel = "Clicks",
  linkItems = false,
}: {
  title: string;
  description: string;
  data: NamedMetric[];
  valueLabel?: string;
  linkItems?: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={`${item.name}-${index}`} className="flex items-center gap-3 rounded-md border border-border p-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-slate-100 text-sm font-semibold text-slate-600">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-950">
                  {item.name}
                  {linkItems && <ExternalLink className="ml-1 inline h-3.5 w-3.5 text-slate-400" />}
                </p>
                {item.helper && <p className="mt-0.5 text-xs text-slate-500">{item.helper}</p>}
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-950">{formatNumber(item.value)}</p>
                <p className="text-xs text-slate-500">{valueLabel}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
