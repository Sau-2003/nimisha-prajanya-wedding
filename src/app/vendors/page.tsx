"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

type BookingStatus = 'Not Booked' | 'Enquired' | 'Negotiating' | 'Booked' | 'Confirmed';
type LeadTimeColor = 'bg-red-100 text-red-700' | 'bg-orange-100 text-orange-700' | 'bg-emerald-100 text-emerald-700';

interface VendorCategory {
  name: string;
  status: BookingStatus;
  urgencyStatus: LeadTimeColor;
  assignedVendor?: string;
}

function CriticalBookingTracker() {
  const bookings: VendorCategory[] = [
    { name: "Venue", status: "Confirmed", urgencyStatus: "bg-emerald-100 text-emerald-700", assignedVendor: "Taj Lakefront, Bhopal" },
    { name: "Catering", status: "Booked", urgencyStatus: "bg-emerald-100 text-emerald-700", assignedVendor: "Royal Feasts" },
    { name: "Makeup Artist", status: "Not Booked", urgencyStatus: "bg-red-100 text-red-700" },
    { name: "Photographer", status: "Negotiating", urgencyStatus: "bg-orange-100 text-orange-700" },
    { name: "Mehendi Artist", status: "Not Booked", urgencyStatus: "bg-orange-100 text-orange-700" },
  ];

  return (
    <Card className="col-span-full border-gold-200 shadow-sm">
      <CardHeader>
        <CardTitle className="font-serif text-2xl text-emerald-900 dark:text-emerald-50">Critical Bookings</CardTitle>
        <p className="text-sm text-slate-500">Urgency colored by typical lead time requirements.</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookings.map((item) => (
            <div key={item.name} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-gold-300 transition-colors bg-white dark:bg-slate-950 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-medium text-slate-800 dark:text-slate-200">{item.name}</h3>
                <Badge className={`${item.urgencyStatus} border-none`}>
                  {item.status}
                </Badge>
              </div>
              
              {item.assignedVendor ? (
                <div className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  {item.assignedVendor}
                </div>
              ) : (
                <button className="text-sm text-gold-600 hover:text-gold-700 dark:text-gold-500 dark:hover:text-gold-400 text-left font-medium">
                  + Add Vendor / Enquire
                </button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// THIS is the required default export that Vercel was looking for
export default function VendorsPage() {
  return (
    <div className="p-6 md:p-12 max-w-[1600px] mx-auto space-y-8 h-full flex flex-col">
      <div>
        <h1 className="font-serif text-3xl font-bold text-emerald-900 dark:text-emerald-50">Vendor Management</h1>
        <p className="text-slate-500 mt-1">Track and manage all your external partners and bookings</p>
      </div>

      <CriticalBookingTracker />
    </div>
  );
}