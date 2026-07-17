"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Phone, MapPin } from "lucide-react";

type BookingStatus = 'Not Booked' | 'Enquired' | 'Negotiating' | 'Booked' | 'Confirmed';
type LeadTimeColor = 'bg-red-100 text-red-700' | 'bg-orange-100 text-orange-700' | 'bg-emerald-100 text-emerald-700';

interface VendorCategory {
    name: string;
  status: BookingStatus;
  urgencyStatus: LeadTimeColor; // Calculated by urgency engine
  assignedVendor?: string;
}

export function CriticalBookingTracker() {
  // In a real app, this data is fetched from Supabase, and urgencyStatus is 
  // calculated by comparing today's date against (weddingDate - idealLeadTimeMonths)
  const bookings: VendorCategory[] = [
    { name: "Venue", status: "Confirmed", urgencyStatus: "bg-emerald-100 text-emerald-700", assignedVendor: "Taj Lakefront, Bhopal" },
    { name: "Catering", status: "Booked", urgencyStatus: "bg-emerald-100 text-emerald-700", assignedVendor: "Royal Feasts" },
    { name: "Makeup Artist", status: "Not Booked", urgencyStatus: "bg-red-100 text-red-700" }, // Red flag: past ideal booking window
    { name: "Photographer", status: "Negotiating", urgencyStatus: "bg-orange-100 text-orange-700" },
    { name: "Mehendi Artist", status: "Not Booked", urgencyStatus: "bg-orange-100 text-orange-700" },
  ];

  return (
    <Card className="col-span-full border-gold-200">
      <CardHeader>
        <CardTitle className="font-serif text-2xl text-emerald-900">Critical Booking Tracker</CardTitle>
        <p className="text-sm text-slate-500">Urgency colored by typical lead time requirements.</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookings.map((item) => (
            <div key={item.name} className="p-4 rounded-xl border border-slate-100 hover:border-gold-300 transition-colors bg-white shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-medium text-slate-800">{item.name}</h3>
                <Badge className={`${item.urgencyStatus} border-none`}>
                  {item.status}
                </Badge>
              </div>
              
              {item.assignedVendor ? (
                <div className="text-sm text-slate-600 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  {item.assignedVendor}
                </div>
              ) : (
                <button className="text-sm text-gold-600 hover:text-gold-700 text-left font-medium">
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