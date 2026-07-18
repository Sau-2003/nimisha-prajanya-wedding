"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, UserCheck, Plus } from "lucide-react";

type BookingStatus = 'Not Started' | 'Not Booked' | 'Enquired' | 'Negotiating' | 'Booked' | 'Confirmed';
type LeadTimeColor = 'bg-white-100 text-black-700' | 'bg-red-100 text-red-700' | 'bg-orange-100 text-orange-700' | 'bg-emerald-100 text-emerald-700';

interface VendorCategory {
  name: string;
  assignedVendor?: string;
  status: BookingStatus;
  urgencyStatus: LeadTimeColor;
}

const initialVendors: VendorCategory[] = [
  { name: "Venue", status: "Not Started", urgencyStatus: "bg-white-100 text-black-700" },
  { name: "Wedding Planner", status: "Not Started", urgencyStatus: "bg-white-100 text-black-700" },
  { name: "Decorator", status: "Not Started", urgencyStatus: "bg-white-100 text-black-700" },
  { name: "Makeup Artist", status: "Not Started", urgencyStatus: "bg-white-100 text-black-700" },
  { name: "Photographer", status: "Not Started", urgencyStatus: "bg-white-100 text-black-700" },
  { name: "Mehendi Artist", status: "Not Started", urgencyStatus: "bg-white-100 text-black-700" },
  { name: "DJ / Music", status: "Not Started", urgencyStatus: "bg-white-100 text-black-700" },
  { name: "Transport / Cars", status: "Not Started", urgencyStatus: "bg-white-100 text-black-700" },
  { name: "Invitations", status: "Not Started", urgencyStatus: "bg-white-100 text-black-700" },
  { name: "Wedding Favors", status: "Not Started", urgencyStatus: "bg-white-100 text-black-700" }
];

function VendorsTracker() {
  const [vendors, setVendors] = useState<VendorCategory[]>(initialVendors);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  // Dialog form state
  const [vendorName, setVendorName] = useState("");
  const [vendorStatus, setVendorStatus] = useState<BookingStatus>("Not Started");

  const openDialog = (index: number) => {
    setEditingIndex(index);
    setVendorName(vendors[index].assignedVendor || "");
    setVendorStatus(vendors[index].status);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (editingIndex !== null) {
      // Calculate color based on status
      let newUrgency: LeadTimeColor = "bg-white-100 text-black-700";
      if (vendorStatus === 'Confirmed' || vendorStatus === 'Booked') {
        newUrgency = "bg-emerald-100 text-emerald-700";
      } else if (vendorStatus === 'Negotiating' || vendorStatus === 'Enquired') {
        newUrgency = "bg-orange-100 text-orange-700";
      } else if (vendorStatus === 'Not Booked') {
        newUrgency = "bg-red-100 text-red-700";
      }

      // Update state
      const updated = vendors.map((v, i) => {
        if (i === editingIndex) {
          return {
            ...v,
            assignedVendor: vendorName.trim() !== "" ? vendorName : undefined,
            status: vendorStatus,
            urgencyStatus: newUrgency
          };
        }
        return v;
      });
      
      setVendors(updated);
    }
    setIsDialogOpen(false);
  };

  return (
    <>
      <Card className="col-span-full border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="font-serif text-2xl text-emerald-900 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-emerald-600" />
            Vendor Directory
          </CardTitle>
          <p className="text-sm text-slate-500">Track statuses and finalized wedding partners.</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vendors.map((item, idx) => (
              <div key={item.name} className="p-4 rounded-xl border border-slate-100 hover:border-emerald-300 transition-colors bg-white shadow-sm flex flex-col justify-between min-h-[110px]">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-slate-800">{item.name}</h3>
                  <Badge className={`${item.urgencyStatus} border-none shadow-none font-medium`}>
                    {item.status}
                  </Badge>
                </div>
                
                <div className="mt-2">
                  {item.assignedVendor ? (
                    <button 
                      onClick={() => openDialog(idx)}
                      className="text-sm text-emerald-700 font-medium flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 transition-colors w-fit px-3 py-1.5 rounded-lg border border-emerald-100 text-left"
                    >
                      <MapPin className="w-4 h-4 text-emerald-500" />
                      {item.assignedVendor}
                    </button>
                  ) : (
                    <button 
                      onClick={() => openDialog(idx)}
                      className="text-sm text-slate-500 hover:text-emerald-700 font-medium flex items-center gap-1 transition-colors mt-1"
                    >
                      <Plus className="w-4 h-4" /> Add Vendor
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update {editingIndex !== null ? vendors[editingIndex].name : 'Vendor'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1">Vendor Name / Details</label>
              <input 
                type="text" 
                className="w-full border border-slate-300 p-2 rounded-lg text-sm"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select 
                className="w-full border border-slate-300 p-2 rounded-lg text-sm bg-white"
                value={vendorStatus}
                onChange={(e) => setVendorStatus(e.target.value as BookingStatus)}
              >
                <option value="Not Started">Not Started</option>
                <option value="Not Booked">Not Booked</option>
                <option value="Enquired">Enquired</option>
                <option value="Negotiating">Negotiating</option>
                <option value="Booked">Booked</option>
                <option value="Confirmed">Confirmed</option>
              </select>
            </div>
            <Button onClick={handleSave} className="w-full bg-emerald-600 hover:bg-emerald-700">Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function VendorsPage() {
  return (
    <div className="p-6 md:p-12 max-w-[1600px] mx-auto space-y-8 h-full flex flex-col">
      <div>
        <h1 className="font-serif text-3xl font-bold text-emerald-900">Vendors</h1>
        <p className="text-slate-500 mt-1">Keep track of your chosen wedding team.</p>
      </div>
      <VendorsTracker />
    </div>
  );
}