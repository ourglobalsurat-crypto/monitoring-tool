import { Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function InsightList({ insights }: { insights: string[] }) {
  return (
    <Card className="border-primary/15 bg-[#F7FBFF]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Plain-English Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.map((insight) => (
            <p key={insight} className="rounded-md bg-white px-3 py-2 text-sm leading-6 text-slate-700 shadow-sm">
              {insight}
            </p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
