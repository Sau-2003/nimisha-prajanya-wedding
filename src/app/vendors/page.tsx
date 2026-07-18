"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type BookingStatus = 'Not Booked' | 'Enquired' | 'Negotiating' | 'Booked' | 'Confirmed';
type LeadTimeColor = 'bg-red-100 text-red-700' | 'bg-orange-100 text-orange-700' | 'bg-emerald-100 text-emerald-700';

interface VendorCategory {
  name: string;
  status: BookingStatus;
  urgencyStatus: LeadTimeColor;
  assignedVendor?: string;
}

// Moved the initial list outside the component so it acts as default state
const initialBookings: VendorCategory[] = [
  { name: "Venue", status: "Confirmed", urgencyStatus: "bg-emerald-100 text-emerald-700", assignedVendor: "Safal, Bhopal" },
  { name: "Makeup Artist", status: "Not Booked", urgencyStatus: "bg-red-100 text-red-700" },
  { name: "Photographer", status: "Negotiating", urgencyStatus: "bg-orange-100 text-orange-700" },
  { name: "Mehendi Artist", status: "Not Booked", urgencyStatus: "bg-orange-100 text-orange-700" },
  { name: "Wedding Planner", status: "Enquired", urgencyStatus: "bg-orange-100 text-orange-700" },
  { name: "Decorator", status: "Booked", urgencyStatus: "bg-emerald-100 text-emerald-700", assignedVendor: "DecorPlus, Bhopal" },
  { name: "DJ / Music", status: "Not Booked", urgencyStatus: "bg-red-100 text-red-700" },
  { name: "Transport / Cars", status: "Enquired", urgencyStatus: "bg-orange-100 text-orange-700" },
  { name: "Invitations", status: "Booked", urgencyStatus: "bg-emerald-100 text-emerald-700", assignedVendor: "PrintWorks, Bhopal" },
  { name: "Wedding Favors", status: "Not Booked", urgencyStatus: "bg-red-100 text-red-700" },
];

function CriticalBookingTracker() {
  // 1. Setup State
  const [bookings, setBookings] = useState<VendorCategory[]>(initialBookings);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  // Temporary state for the dialog inputs
  const [vendorName, setVendorName] = useState("");
  const [vendorStatus, setVendorStatus] = useState<BookingStatus>("Enquired");

  // 2. Open Dialog Function
  const openDialog = (index: number) => {
    setEditingIndex(index);
    setVendorName(bookings[index].assignedVendor || "");
    // Default to 'Enquired' if they are currently 'Not Booked'
    setVendorStatus(bookings[index].status === "Not Booked" ? "Enquired" : bookings[index].status);
    setIsDialogOpen(true);
  };

  // 3. Save Function
  const handleSave = () => {
    if (editingIndex !== null) {
      const updatedBookings = [...bookings];
      let newUrgency: LeadTimeColor = updatedBookings[editingIndex].urgencyStatus;
      
      // Automatically update the color badge based on status
      if (vendorStatus === 'Confirmed' || vendorStatus === 'Booked') {
        newUrgency = "bg-emerald-100 text-emerald-700";
      } else if (vendorStatus === 'Negotiating' || vendorStatus === 'Enquired') {
         newUrgency = "bg-orange-100 text-orange-700";
      } else {
         newUrgency = "bg-red-100 text-red-700";
      }

      updatedBookings[editingIndex] = {
        ...updatedBookings[editingIndex],
        status: vendorStatus,
        assignedVendor: vendorName,
        urgencyStatus: newUrgency,
      };
      
      setBookings(updatedBookings);
    }
    setIsDialogOpen(false);
  };

  return (
    <>
      <Card className="col-span-full border-gold-200 shadow-sm">
        <CardHeader>
          <CardTitle className="font-serif text-2xl text-emerald-900 dark:text-emerald-50">Critical Bookings</CardTitle>
          <p className="text-sm text-slate-500">Urgency colored by typical lead time requirements.</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookings.map((item, idx) => (
              <div key={item.name} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-gold-300 transition-colors bg-white dark:bg-slate-950 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-medium text-slate-800 dark:text-slate-200">{item.name}</h3>
                  <Badge className={`${item.urgencyStatus} border-none`}>
                    {item.status}
                  </Badge>
                </div>
                
                {item.assignedVendor ? (
                  <div 
                    onClick={() => openDialog(idx)}
                    className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2 cursor-pointer hover:text-emerald-600 transition-colors"
                    title="Click to edit"
                  >
                    <MapPin className="w-4 h-4 text-emerald-500" />
                    {item.assignedVendor}
                  </div>
                ) : (
                  <button 
                    onClick={() => openDialog(idx)}
                    className="text-sm text-gold-600 hover:text-gold-700 dark:text-gold-500 dark:hover:text-gold-400 text-left font-medium transition-colors"
                  >
                    + Add Vendor / Enquire
                  </button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 4. The Edit Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update {editingIndex !== null ? bookings[editingIndex].name : 'Vendor'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1">Vendor Name / Details</label>
              <input 
                type="text" 
                className="w-full border p-2 rounded-lg text-sm"
                placeholder="e.g. John Doe Photography"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select 
                className="w-full border p-2 rounded-lg text-sm"
                value={vendorStatus}
                onChange={(e) => setVendorStatus(e.target.value as BookingStatus)}
              >
                <option value="Not Booked">Not Booked</option>
                <option value="Enquired">Enquired</option>
                <option value="Negotiating">Negotiating</option>
                <option value="Booked">Booked</option>
                <option value="Confirmed">Confirmed</option>
              </select>
            </div>

            <Button onClick={handleSave} className="w-full bg-emerald-600 hover:bg-emerald-700">
              Save Updates
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
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