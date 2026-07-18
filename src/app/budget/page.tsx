"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, IndianRupee, PlusCircle } from "lucide-react";

export default function BudgetPage() {
  return (
    <div className="p-6 md:p-12 max-w-[1600px] mx-auto h-[calc(100vh-40px)] flex flex-col">
      {/* Header Section */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-emerald-900 flex items-center gap-3">
            <IndianRupee className="w-8 h-8 text-emerald-600" />
            Budget &amp; Expenses
          </h1>
          <p className="text-slate-500 mt-1">Live overview of your wedding expenses.</p>
        </div>
        
        {/* Action Buttons Container */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Add Form Button */}
          <a 
            href="https://docs.google.com/forms/d/e/1FAIpQLScwW6sforfMpWeOcF-5RG3M0tteSx1fB8XdAeLUJmEic-12fw/viewform" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-sm font-medium">
              <PlusCircle className="w-4 h-4 mr-2" />
              Log Expense
            </Button>
          </a>

          {/* Full Google Sheet Button */}
          <a 
            href="https://docs.google.com/spreadsheets/d/1o5cCLpPLm38YauUIZbmayh4ywXIFiMGCIhi85fQpnag/edit" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm font-medium">
              <ExternalLink className="w-4 h-4 mr-2 text-slate-400" />
              Open Sheet
            </Button>
          </a>
        </div>
      </div>

      {/* Clean Embedded Table */}
      <Card className="flex-1 w-full overflow-hidden border-slate-200 shadow-sm rounded-xl relative bg-white">
        <iframe
          // widget=false removes the bottom tabs
          // chrome=false removes the top header/menus
          // headers=false removes the 1,2,3 / A,B,C grid labels
          src="https://docs.google.com/spreadsheets/d/1o5cCLpPLm38YauUIZbmayh4ywXIFiMGCIhi85fQpnag/htmlembed?gid=1406821983&widget=false&chrome=false&headers=false"
          width="100%"
          height="100%"
          className="absolute inset-0 w-full h-full border-none"
          title="Wedding Budget Tracker"
        />
      </Card>
    </div>
  );
}