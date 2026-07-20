"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus, CheckCircle2, Trash2, Phone, IndianRupee, Pencil, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useVendors } from "@/hooks/useVendors";

type BookingStatus = 'Not Started' | 'Not Booked' | 'Enquired' | 'Negotiating' | 'Booked' | 'Confirmed';

interface VendorOption {
  id: string;
  name: string;
  status: BookingStatus;
  estimatedCost?: number;
  contactNumber?: string;
  notes?: string;
}

const initialCategories = [
  "Venue", "Wedding Planner", "Decorator", "Makeup Artist", "Nail Artist",
  "Photographer", "Mehendi Artist", "DJ / Music", "Transport / Cars",
  "Invitations", "Wedding Favors"
];

// Helper to make URLs clickable in notes
const renderTextWithLinks = (text: string) => {
  if (!text) return "";
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a 
          key={index} 
          href={part} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-emerald-600 font-medium hover:underline break-all"
          onClick={(e) => e.stopPropagation()} 
        >
          {part}
        </a>
      );
    }
    return <span key={index}>{part}</span>;
  });
};

function VendorsTracker() {
  const { dbVendors, loading, fetchData } = useVendors();

  // Modal State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);

  // Add Mode State
  const [newOptionName, setNewOptionName] = useState("");
  const [newOptionStatus, setNewOptionStatus] = useState<BookingStatus>("Enquired");
  const [newEstimatedCost, setNewEstimatedCost] = useState<string>("");
  const [newContactNumber, setNewContactNumber] = useState("");
  const [newNotes, setNewNotes] = useState("");

  // Edit Mode State
  const [editingOptionId, setEditingOptionId] = useState<string | null>(null);
  const [editOptionName, setEditOptionName] = useState("");
  const [editEstimatedCost, setEditEstimatedCost] = useState<string>("");
  const [editContactNumber, setEditContactNumber] = useState("");
  const [editNotes, setEditNotes] = useState("");

  // Process and map database entries to our fixed categories
  const displayCategories = initialCategories.map((categoryName) => {
    const matches: VendorOption[] = dbVendors
      ?.filter((v) => v.category === categoryName)
      .map((v: any) => ({
        id: v.id,
        name: v.assigned_vendor || "Unnamed Vendor",
        status: v.status as BookingStatus,
        estimatedCost: v.estimated_cost || 0,
        contactNumber: v.contact_number || "",
        notes: v.notes || "",
      })) || [];

    const confirmedOption = matches.find((opt) => opt.status === 'Confirmed');

    return {
      name: categoryName,
      options: matches,
      confirmedOption: confirmedOption || null,
    };
  });

  const currentCategoryData = displayCategories.find((c) => c.name === editingCategory);

  const openDialog = (categoryName: string) => {
    setEditingCategory(categoryName);
    setNewOptionName("");
    setNewOptionStatus("Enquired");
    setNewEstimatedCost("");
    setNewContactNumber("");
    setNewNotes("");
    setEditingOptionId(null); // Reset edit mode
    setIsDialogOpen(true);
  };

  const handleAddOption = async () => {
    if (!newOptionName.trim() || !editingCategory) return;

    await supabase.from("vendors").insert({
      category: editingCategory,
      assigned_vendor: newOptionName.trim(),
      status: newOptionStatus,
      estimated_cost: newEstimatedCost ? parseFloat(newEstimatedCost) : 0,
      contact_number: newContactNumber.trim() || null,
      notes: newNotes.trim() || null,
      updated_at: new Date().toISOString(),
    });

    setNewOptionName("");
    setNewEstimatedCost("");
    setNewContactNumber("");
    setNewNotes("");
    await fetchData();
  };

  const startEditing = (opt: VendorOption) => {
    setEditingOptionId(opt.id);
    setEditOptionName(opt.name);
    setEditEstimatedCost(opt.estimatedCost ? opt.estimatedCost.toString() : "");
    setEditContactNumber(opt.contactNumber || "");
    setEditNotes(opt.notes || "");
  };

  const cancelEditing = () => setEditingOptionId(null);

  const saveEditedOption = async (optionId: string) => {
    if (!editOptionName.trim()) return;

    await supabase.from("vendors").update({
      assigned_vendor: editOptionName.trim(),
      estimated_cost: editEstimatedCost ? parseFloat(editEstimatedCost) : 0,
      contact_number: editContactNumber.trim() || null,
      notes: editNotes.trim() || null,
      updated_at: new Date().toISOString(),
    }).eq("id", optionId);

    setEditingOptionId(null);
    fetchData();
  };

  const handleStatusChange = async (optionId: string, status: BookingStatus) => {
    await supabase.from("vendors").update({ status }).eq("id", optionId);
    fetchData();
  };

  const handleDeleteOption = async (optionId: string) => {
    if (!optionId) {
      alert("Error: Vendor ID is missing. Check the console.");
      return;
    }

    const { error } = await supabase.from("vendors").delete().eq("id", optionId);
    if (error) alert("Failed to delete. Check console.");
    else await fetchData(); 
  };

  if (loading) return <div className="p-12 text-center text-emerald-600 font-medium">Loading Vendors...</div>;

  return (
    <>
      <Card className="col-span-full border-slate-200 shadow-sm">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayCategories.map((item) => {
              const hasConfirmed = Boolean(item.confirmedOption);

              return (
                <div
                  key={item.name}
                  className={`p-4 rounded-xl border transition-colors shadow-sm flex flex-col justify-between min-h-[130px] ${
                    hasConfirmed ? "border-emerald-200 bg-emerald-50/30" : "border-slate-100 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-slate-800">{item.name}</h3>
                    <Badge
                      className={`${
                        hasConfirmed
                          ? "bg-emerald-100 text-emerald-700"
                          : item.options.length > 0
                          ? "bg-orange-100 text-orange-700"
                          : "bg-slate-100 text-slate-600"
                      } border-none shadow-none font-medium`}
                    >
                      {hasConfirmed ? "Confirmed" : item.options.length > 0 ? `${item.options.length} Options` : "Not Started"}
                    </Badge>
                  </div>

                  <div className="mt-2 space-y-2">
                    {/* CONFIRMED STATE */}
                    {hasConfirmed && item.confirmedOption ? (
                      <div className="bg-emerald-100/60 p-2.5 rounded-lg border border-emerald-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-emerald-900 font-semibold text-sm">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>{item.confirmedOption.name}</span>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => openDialog(item.name)} className="text-xs text-emerald-700 hover:bg-emerald-200/50 h-6 px-2">
                            Manage
                          </Button>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-emerald-800 pt-1">
                          {item.confirmedOption.estimatedCost ? (
                            <span className="flex items-center gap-0.5 font-medium">
                              <IndianRupee className="w-3 h-3 text-emerald-700" />
                              {item.confirmedOption.estimatedCost.toLocaleString("en-IN")}
                            </span>
                          ) : null}
                          {item.confirmedOption.contactNumber && (
                            <a href={`tel:${item.confirmedOption.contactNumber}`} className="flex items-center gap-1 hover:underline">
                              <Phone className="w-3 h-3" />
                              {item.confirmedOption.contactNumber}
                            </a>
                          )}
                        </div>
                      </div>
                    ) : (
                      
                      /* UNCONFIRMED MULTI-OPTION STATE */
                      <div>
                        {item.options.length > 0 ? (
                          <div className="space-y-1.5">
                            {item.options.map((opt) => (
                              <div key={opt.id} className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded border border-slate-100">
                                <div className="flex items-center gap-2 truncate">
                                  <span className="font-medium truncate max-w-[120px]">{opt.name}</span>
                                  {opt.estimatedCost ? (
                                    <span className="text-[11px] text-slate-500 flex items-center">
                                      ₹{opt.estimatedCost.toLocaleString("en-IN")}
                                    </span>
                                  ) : null}
                                </div>
                                <span className="text-[10px] text-slate-500 bg-slate-200/60 px-1.5 py-0.5 rounded">{opt.status}</span>
                              </div>
                            ))}
                            <button
                              onClick={() => openDialog(item.name)}
                              className="text-xs text-emerald-700 font-medium hover:underline mt-1 block"
                            >
                              + Edit / Add Options
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => openDialog(item.name)}
                            className="text-sm text-slate-500 hover:text-emerald-700 font-medium flex items-center gap-1 transition-colors mt-1"
                          >
                            <Plus className="w-4 h-4" /> Add Options
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* MANAGE OPTIONS MODAL */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          
          {/* Silent Focus Trap: Keeps mobile keyboard closed on open */}
          <button type="button" aria-hidden="true" className="opacity-0 absolute w-0 h-0 pointer-events-none" />

          <DialogHeader>
            <DialogTitle>Manage {editingCategory} Options</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 mt-2">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Options</h4>
            {currentCategoryData?.options.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No options added yet.</p>
            ) : (
              <div className="space-y-2">
                {currentCategoryData?.options.map((opt) => (
                  <div key={opt.id} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1.5">
                    
                    {/* EDIT OPTION MODE */}
                    {editingOptionId === opt.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          className="w-full border border-emerald-500 p-1.5 rounded text-sm focus:outline-none"
                          value={editOptionName}
                          onChange={(e) => setEditOptionName(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder="Est. Cost"
                            className="w-1/2 border border-emerald-500 p-1.5 rounded text-sm focus:outline-none"
                            value={editEstimatedCost}
                            onChange={(e) => setEditEstimatedCost(e.target.value)}
                          />
                          <input
                            type="text"
                            placeholder="Phone / Links"
                            className="w-1/2 border border-emerald-500 p-1.5 rounded text-sm focus:outline-none"
                            value={editContactNumber}
                            onChange={(e) => setEditContactNumber(e.target.value)}
                          />
                        </div>
                        <textarea
                          placeholder="Notes"
                          className="w-full border border-emerald-500 p-1.5 rounded text-sm focus:outline-none resize-none"
                          rows={2}
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                        />
                        <div className="flex justify-end gap-2 mt-1">
                          <button onClick={cancelEditing} className="px-3 py-1.5 text-xs bg-slate-200 text-slate-700 font-medium rounded-md hover:bg-slate-300 transition-colors">Cancel</button>
                          <button onClick={() => saveEditedOption(opt.id)} className="px-3 py-1.5 text-xs bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-700 transition-colors">Save</button>
                        </div>
                      </div>
                    ) : (
                      
                      /* DISPLAY OPTION MODE */
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-800">{opt.name}</span>
                          <div className="flex items-center gap-1.5">
                            <select
                              value={opt.status}
                              onChange={(e) => handleStatusChange(opt.id, e.target.value as BookingStatus)}
                              className={`text-xs p-1 rounded border font-medium outline-none cursor-pointer ${
                                opt.status === "Confirmed" ? "bg-emerald-100 text-emerald-800 border-emerald-300" : "bg-white border-slate-300"
                              }`}
                            >
                              <option value="Enquired">Enquired</option>
                              <option value="Negotiating">Negotiating</option>
                              <option value="Booked">Booked</option>
                              <option value="Confirmed">Confirmed</option>
                            </select>
                            <button onClick={() => startEditing(opt)} className="p-1 text-slate-400 hover:text-emerald-600 rounded bg-white border border-slate-200 transition-colors">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDeleteOption(opt.id)} className="p-1 text-slate-400 hover:text-red-600 rounded bg-white border border-slate-200 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                          {opt.estimatedCost ? (
                            <span className="flex items-center gap-0.5 text-slate-700 font-medium">
                              <IndianRupee className="w-3 h-3 text-slate-400" />
                              {opt.estimatedCost.toLocaleString("en-IN")}
                            </span>
                          ) : null}
                          {opt.contactNumber && (
                            <a href={`tel:${opt.contactNumber}`} className="flex items-center gap-1 hover:text-emerald-600 hover:underline">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {opt.contactNumber}
                            </a>
                          )}
                        </div>
                        {opt.notes && (
                          <p className="text-[11px] text-slate-600 bg-white p-2.5 rounded-md border border-slate-100 whitespace-pre-wrap break-words mt-1">
                            {renderTextWithLinks(opt.notes)}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <hr className="my-3 border-slate-100" />

          {/* ADD NEW OPTION FORM */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Add New Option</h4>
            
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Vendor Name"
                  className="flex-1 border border-slate-300 p-2 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                  value={newOptionName}
                  onChange={(e) => setNewOptionName(e.target.value)}
                />
                <select
                  className="border border-slate-300 p-2 rounded-lg text-sm bg-white focus:outline-none focus:border-emerald-500"
                  value={newOptionStatus}
                  onChange={(e) => setNewOptionStatus(e.target.value as BookingStatus)}
                >
                  <option value="Enquired">Enquired</option>
                  <option value="Negotiating">Negotiating</option>
                  <option value="Booked">Booked</option>
                  <option value="Confirmed">Confirmed</option>
                </select>
              </div>

              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Est. Cost (₹)"
                  className="w-1/2 border border-slate-300 p-2 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                  value={newEstimatedCost}
                  onChange={(e) => setNewEstimatedCost(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Phone Number"
                  className="w-1/2 border border-slate-300 p-2 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                  value={newContactNumber}
                  onChange={(e) => setNewContactNumber(e.target.value)}
                />
              </div>

              <textarea
                placeholder="Notes / Links (Package details, inclusions, Instagram link, etc.)"
                className="w-full border border-slate-300 p-2 rounded-lg text-sm focus:outline-none focus:border-emerald-500 resize-none"
                rows={2}
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
              />
            </div>

            <Button onClick={handleAddOption} className="w-full bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold transition-colors">
              <Plus className="w-4 h-4 mr-1" /> Add Vendor Option
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
        <h1 className="font-serif text-3xl font-bold text-emerald-900">Vendors</h1>
        <p className="text-slate-500 mt-1">Keep track of options and confirmed selections for your wedding team.</p>
      </div>
      <VendorsTracker />
    </div>
  );
}
