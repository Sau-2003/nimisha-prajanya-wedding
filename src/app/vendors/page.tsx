"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, UserCheck, Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useVendors } from "@/hooks/useVendors"; // <-- New Cloud Hook

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
  { name: "Nail Artist", status: "Not Started", urgencyStatus: "bg-white-100 text-black-700" },
  { name: "Photographer", status: "Not Started", urgencyStatus: "bg-white-100 text-black-700" },
  { name: "Mehendi Artist", status: "Not Started", urgencyStatus: "bg-white-100 text-black-700" },
  { name: "DJ / Music", status: "Not Started", urgencyStatus: "bg-white-100 text-black-700" },
  { name: "Transport / Cars", status: "Not Started", urgencyStatus: "bg-white-100 text-black-700" },
  { name: "Invitations", status: "Not Started", urgencyStatus: "bg-white-100 text-black-700" },
  { name: "Wedding Favors", status: "Not Started", urgencyStatus: "bg-white-100 text-black-700" }
];

function VendorsTracker() {
  const { dbVendors, loading, fetchData } = useVendors();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  // Dialog form state
  const [vendorName, setVendorName] = useState("");
  const [vendorStatus, setVendorStatus] = useState<BookingStatus>("Not Started");

  // Merge the fixed template with live database data
  const displayVendors = initialVendors.map(template => {
    const dbMatch = dbVendors.find(v => v.category === template.name);
    
    if (dbMatch) {
      let newUrgency: LeadTimeColor = "bg-white-100 text-black-700";
      if (dbMatch.status === 'Confirmed' || dbMatch.status === 'Booked') {
        newUrgency = "bg-emerald-100 text-emerald-700";
      } else if (dbMatch.status === 'Negotiating' || dbMatch.status === 'Enquired') {
        newUrgency = "bg-orange-100 text-orange-700";
      } else if (dbMatch.status === 'Not Booked') {
        newUrgency = "bg-red-100 text-red-700";
      }

      return {
        name: template.name,
        assignedVendor: dbMatch.assigned_vendor || undefined,
        status: dbMatch.status as BookingStatus,
        urgencyStatus: newUrgency
      };
    }
    return template;
  });

  const openDialog = (index: number) => {
    setEditingIndex(index);
    setVendorName(displayVendors[index].assignedVendor || "");
    setVendorStatus(displayVendors[index].status);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (editingIndex !== null) {
      const categoryName = displayVendors[editingIndex].name;
      
      // Upsert: Updates the row if "category" exists, inserts a new row if it doesn't.
      await supabase.from('vendors').upsert({
        category: categoryName,
        assigned_vendor: vendorName.trim() !== "" ? vendorName.trim() : null,
        status: vendorStatus,
        updated_at: new Date().toISOString()
      });
      
      fetchData(); // Force instant refresh
    }
    setIsDialogOpen(false);
  };

  if (loading) return <div className="p-12 text-center text-emerald-600 font-medium">Loading Vendors...</div>;

  return (
    <>
      <Card className="col-span-full border-slate-200 shadow-sm">
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayVendors.map((item, idx) => (
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
            <DialogTitle>Update {editingIndex !== null ? displayVendors[editingIndex].name : 'Vendor'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1">Vendor Name / Details</label>
              <input 
                type="text" 
                className="w-full border border-slate-300 p-2 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select 
                className="w-full border border-slate-300 p-2 rounded-lg text-sm bg-white focus:outline-none focus:border-emerald-500"
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