"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, UserCheck, Plus } from "lucide-react";

import { useWeddingData } from "@/hooks/useWeddingData";
import { supabase } from "@/lib/supabase";

type BookingStatus = 'Not Started' | 'Not Booked' | 'Enquired' | 'Negotiating' | 'Booked' | 'Confirmed';

const initialVendors = [
  { name: "Venue" }, { name: "Wedding Planner" }, { name: "Decorator" },
  { name: "Makeup Artist" }, { name: "Photographer" }, { name: "Mehendi Artist" },
  { name: "DJ / Music" }, { name: "Transport / Cars" }, { name: "Invitations" }, { name: "Wedding Favors" }
];

export default function VendorsPage() {
  const { data: dbVendors } = useWeddingData('vendors');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingName, setEditingName] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [vendorStatus, setVendorStatus] = useState<BookingStatus>("Not Started");

  // Helper to find data from DB for a specific category
  const getDBData = (name: string) => dbVendors.find(v => v.name === name) || { status: 'Not Started', assigned_vendor: '' };

  const openDialog = (name: string) => {
    const data = getDBData(name);
    setEditingName(name);
    setVendorName(data.assigned_vendor || "");
    setVendorStatus(data.status || "Not Started");
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    const existing = dbVendors.find(v => v.name === editingName);
    if (existing) {
      await supabase.from('vendors').update({ assigned_vendor: vendorName, status: vendorStatus }).eq('id', existing.id);
    } else {
      await supabase.from('vendors').insert({ name: editingName, assigned_vendor: vendorName, status: vendorStatus });
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="p-6 md:p-12 max-w-[1600px] mx-auto space-y-8">
      <h1 className="font-serif text-3xl font-bold text-emerald-900">Vendors</h1>
      
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {initialVendors.map((item) => {
              const data = getDBData(item.name);
              return (
                <div key={item.name} className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-slate-800">{item.name}</h3>
                    <Badge className="bg-emerald-50 text-emerald-700 border-none">{data.status}</Badge>
                  </div>
                  <button onClick={() => openDialog(item.name)} className="text-sm text-emerald-700 font-medium flex items-center gap-2 mt-2">
                    {data.assigned_vendor ? <><MapPin className="w-4 h-4" /> {data.assigned_vendor}</> : <><Plus className="w-4 h-4" /> Add Vendor</>}
                  </button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Update {editingName}</DialogTitle></DialogHeader>
          <input className="w-full border p-2 rounded" value={vendorName} onChange={(e) => setVendorName(e.target.value)} placeholder="Vendor name..." />
          <select className="w-full border p-2 rounded" value={vendorStatus} onChange={(e) => setVendorStatus(e.target.value as BookingStatus)}>
            <option value="Not Started">Not Started</option>
            <option value="Not Booked">Not Booked</option>
            <option value="Booked">Booked</option>
            <option value="Confirmed">Confirmed</option>
          </select>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}