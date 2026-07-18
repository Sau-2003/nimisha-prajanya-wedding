"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, UserCheck } from "lucide-react";

interface VendorCategory {
  name: string;
  assignedVendor?: string;
}

const vendorsList: VendorCategory[] = [
  { name: "Venue" },
  { name: "Wedding Planner" },
  { name: "Decorator" },
  { name: "Makeup Artist" },
  { name: "Photographer" },
  { name: "Mehendi Artist" },
  { name: "DJ / Music" },
  { name: "Transport / Cars" },
  { name: "Invitations", assignedVendor: "PrintWorks, Bhopal" },
  { name: "Wedding Favors" }
];

function VendorsTracker() {
  return (
    <Card className="col-span-full border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="font-serif text-2xl text-emerald-900 dark:text-emerald-50 flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-emerald-600" />
          Vendor Directory
        </CardTitle>
        <p className="text-sm text-slate-500">Your finalized wedding partners and contacts.</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vendorsList.map((item) => (
            <div key={item.name} className="p-4 rounded-xl border border-slate-100 hover:border-emerald-300 transition-colors bg-white shadow-sm flex flex-col justify-between min-h-[100px]">
              <div>
                <h3 className="font-medium text-slate-800">{item.name}</h3>
              </div>
              
              <div className="mt-4">
                {item.assignedVendor ? (
                  <div className="text-sm text-emerald-700 font-medium flex items-center gap-2 bg-emerald-50 w-fit px-3 py-1.5 rounded-lg border border-emerald-100">
                    <MapPin className="w-4 h-4 text-emerald-500" />
                    {item.assignedVendor}
                  </div>
                ) : (
                  <div className="text-sm text-slate-400 italic px-1">
                    Pending
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function VendorsPage() {
  return (
    <div className="p-6 md:p-12 max-w-[1600px] mx-auto space-y-8 h-full flex flex-col">
      <div>
        <h1 className="font-serif text-3xl font-bold text-emerald-900 dark:text-emerald-50">Vendors</h1>
        <p className="text-slate-500 mt-1">Keep track of your chosen wedding team.</p>
      </div>

      <VendorsTracker />
    </div>
  );
}