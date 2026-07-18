"use client";

import { Card } from "@/components/ui/card";

export default function BudgetPage() {
  return (
    <div className="p-6 md:p-12 max-w-[1600px] mx-auto h-[calc(100vh-40px)] flex flex-col">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-emerald-900 dark:text-emerald-50">
          Budget &amp; Expenses
        </h1>
        <p className="text-slate-500 mt-1">Manage your wedding budget and track expenses in real-time.</p>
      </div>

      {/* The Google Sheet Embed Container */}
      <Card className="flex-1 w-full overflow-hidden border-slate-200 shadow-sm rounded-xl relative">
        <iframe
          src="https://docs.google.com/spreadsheets/d/1o5cCLpPLm38YauUIZbmayh4ywXIFiMGCIhi85fQpnag/edit?resourcekey=&gid=1406821983#gid=1406821983"
          width="100%"
          height="100%"
          className="absolute inset-0 w-full h-full border-none"
          title="Wedding Budget Tracker"
          allowFullScreen
        />
      </Card>
    </div>
  );
}