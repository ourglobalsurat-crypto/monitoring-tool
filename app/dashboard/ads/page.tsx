"use client";

import { CalendarClock, Megaphone, MousePointerClick, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const futureMetrics = [
  { label: "Ad Spend", icon: TrendingUp },
  { label: "Paid Leads", icon: MousePointerClick },
  { label: "Campaigns", icon: Megaphone },
];

export default function GoogleAdsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">Google Ads</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">Paid search reporting</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          A polished space reserved for future Google Ads performance data.
        </p>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <section className="overflow-hidden rounded-lg border border-border bg-white shadow-soft">
          <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="p-6 sm:p-8">
              <Badge className="border-primary/20 bg-[#F7FBFF] text-primary">Coming Soon</Badge>
              <h2 className="mt-6 text-3xl font-semibold tracking-normal text-slate-950">Google Ads insights are ready for the next phase.</h2>
              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-500">
                This page is designed for campaign spend, paid search leads, cost per lead, and campaign trend reporting once Google Ads API access is connected.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {futureMetrics.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="rounded-md border border-border bg-slate-50 p-4">
                      <Icon className="h-5 w-5 text-primary" />
                      <p className="mt-3 text-sm font-semibold text-slate-950">{item.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="border-t border-border bg-[#F7FBFF] p-6 sm:p-8 lg:border-l lg:border-t-0">
              <Card className="h-full bg-white">
                <CardContent className="flex h-full min-h-72 flex-col justify-between p-6">
                  <div>
                    <CalendarClock className="h-7 w-7 text-primary" />
                    <p className="mt-5 text-lg font-semibold text-slate-950">Future-ready layout</p>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      The same visual system will support paid media metrics without making the client dashboard feel technical.
                    </p>
                  </div>
                  <div className="mt-8 space-y-3">
                    <div className="h-3 rounded bg-slate-100" />
                    <div className="h-3 w-4/5 rounded bg-slate-100" />
                    <div className="h-3 w-2/3 rounded bg-slate-100" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </motion.div>
    </div>
  );
}
