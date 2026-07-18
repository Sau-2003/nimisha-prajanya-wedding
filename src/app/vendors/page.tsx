"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, UserCheck, Plus } from "lucide-react";

interface VendorCategory {
  name: string;
  assignedVendor?: string;
}

const initialVendors: VendorCategory[] = [
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
  // 1. Setup State to hold the vendor list
  const [vendors, setVendors] = useState<VendorCategory[]>(initialVendors);
  
  // 2. Setup State for the pop-up modal
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [vendorName, setVendorName] = useState("");

  // 3. Open Modal Function
  const openDialog = (index: number) => {
    setEditingIndex(index);
    setVendorName(vendors[index].assignedVendor || "");
    setIsDialogOpen(true);
  };

  // 4. Save Changes Function
  const handleSave = () => {
    if (editingIndex !== null) {
      const updated = [...vendors];
      updated[editingIndex] = {
        ...updated[editingIndex],
        assignedVendor: vendorName.trim() !== "" ? vendorName : undefined,
      };
      setVendors(updated);
    }
    setIsDialogOpen(false);
  };

  return (
    <>
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
            {vendors.map((item, idx) => (
              <div key={item.name} className="p-4 rounded-xl border border-slate-100 hover:border-emerald-300 transition-colors bg-white shadow-sm flex flex-col justify-between min-h-[100px]">
                <div>
                  <h3 className="font-medium text-slate-800">{item.name}</h3>
                </div>
                
                <div className="mt-4">
                  {item.assignedVendor ? (
                    <button 
                      onClick={() => openDialog(idx)}
                      className="text-sm text-emerald-700 font-medium flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 transition-colors w-fit px-3 py-1.5 rounded-lg border border-emerald-100 text-left"
                      title="Click to Edit"
                    >
                      <MapPin className="w-4 h-4 text-emerald-500" />
                      {item.assignedVendor}
                    </button>
                  ) : (
                    <button 
                      onClick={() => openDialog(idx)}
                      className="text-sm text-slate-500 hover:text-emerald-700 font-medium flex items-center gap-1 transition-colors"
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

      {/* The Edit Pop-up Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update {editingIndex !== null ? vendors[editingIndex].name : 'Vendor'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1">Assigned Vendor Name</label>
              <input 
                type="text" 
                className="w-full border border-slate-300 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g. John Doe Photography"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
            </div>
            <Button onClick={handleSave} className="w-full bg-emerald-600 hover:bg-emerald-700">
              Save Changes
            </Button>
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
        <h1 className="font-serif text-3xl font-bold text-emerald-900 dark:text-emerald-50">Vendors</h1>
        <p className="text-slate-500 mt-1">Keep track of your chosen wedding team.</p>
      </div>

      <VendorsTracker />
    </div>
  );
}