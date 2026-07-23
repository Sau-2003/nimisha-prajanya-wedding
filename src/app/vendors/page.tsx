"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, CheckCircle2, Trash2, Phone, IndianRupee, Pencil, Handshake, X, Link as LinkIcon, ChevronUp, ChevronDown, Pin } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useVendors } from "@/hooks/useVendors";

type BookingStatus = 'Not Started' | 'Enquired' | 'Negotiating' | 'Confirmed' | 'Recommendation';

interface VendorOption {
  id: string;
  name: string;
  status: BookingStatus;
  estimatedCost?: number;
  contactNumber?: string[];
  notes?: string;
}

const initialCategories = [
  "Venue", "Wedding Planner", "Panditji", "Decorator", "Makeup Artist", "Nail Artist",
  "Photographer/Videographer/Content Creater", "Mehendi Artist", "DJ / Music / Band", "Transport / Cars",
  "Invitations", "Wedding Favors", "Bhajan Jamming"
];

// --- Component: Link Preview ---
const LinkPreview = ({ url }: { url: string }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.status === "success") {
          setData(json.data);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [url]);

  if (loading) {
    return <div className="animate-pulse bg-slate-100 h-20 rounded-lg border border-slate-200 w-full mt-2"></div>;
  }

  if (!data) return null; 

  const domain = new URL(url).hostname.replace('www.', '');

  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="flex items-stretch mt-2 border border-slate-200 rounded-lg overflow-hidden hover:bg-slate-50 transition-colors bg-white group shadow-sm no-underline max-w-sm"
      onClick={(e) => e.stopPropagation()}
    >
      {data.image?.url ? (
        <div className="w-20 sm:w-24 flex-shrink-0 border-r border-slate-100">
          <img src={data.image.url} alt={data.title} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-20 sm:w-24 flex-shrink-0 border-r border-slate-100 bg-slate-50 flex items-center justify-center text-slate-300">
          <LinkIcon className="w-6 h-6" />
        </div>
      )}
      <div className="p-2 sm:p-3 flex flex-col justify-center overflow-hidden flex-1">
        <h4 className="text-xs font-semibold text-slate-800 truncate group-hover:text-emerald-700 transition-colors">
          {data.title || domain}
        </h4>
        <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{data.description}</p>
        <span className="text-[9px] text-slate-400 mt-1 truncate uppercase tracking-wider">{domain}</span>
      </div>
    </a>
  );
};

// --- Helper: Render Text with Clickable Links and Previews ---
const renderTextWithLinks = (text: string) => {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  const extractedUrls = text.match(urlRegex) || [];

  return (
    <div className="space-y-2">
      <div className="whitespace-pre-wrap break-words">
        {parts.map((part, index) => {
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
        })}
      </div>
      
      {extractedUrls.length > 0 && (
        <div className="flex flex-col gap-2 pt-1">
          {extractedUrls.map((url, idx) => (
            <LinkPreview key={idx} url={url} />
          ))}
        </div>
      )}
    </div>
  );
};

function VendorsTracker() {
  const { dbVendors, loading: vendorsLoading, fetchData: fetchVendors } = useVendors();

  // Category Management State (Synced with Supabase)
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [hiddenCategories, setHiddenCategories] = useState<string[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  
  // Custom Reordering State
  const [categoryOrder, setCategoryOrder] = useState<string[]>([]);

  // Rename Category State
  const [editingCategoryTitle, setEditingCategoryTitle] = useState<string | null>(null);
  const [editCategoryInput, setEditCategoryInput] = useState("");

  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Modal State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);

  // Add Mode State
  const [newOptionName, setNewOptionName] = useState("");
  const [newOptionStatus, setNewOptionStatus] = useState<BookingStatus>("Not Started");
  const [newEstimatedCost, setNewEstimatedCost] = useState<string>("");
  const [newContactNumbers, setNewContactNumbers] = useState<string[]>([""]);
  const [newNotes, setNewNotes] = useState("");

  // Edit Mode State
  const [editingOptionId, setEditingOptionId] = useState<string | null>(null);
  const [editOptionName, setEditOptionName] = useState("");
  const [editEstimatedCost, setEditEstimatedCost] = useState<string>("");
  const [editContactNumbers, setEditContactNumbers] = useState<string[]>([""]);
  const [editNotes, setEditNotes] = useState("");

  // Fetch categories from Supabase on mount
  const fetchCategories = async () => {
    setCategoriesLoading(true);
    const { data, error } = await supabase
      .from('vendor_categories')
      .select('*')
      .order('order_index', { ascending: true }) 
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error("Error fetching categories:", error);
    } else if (data) {
      const hidden = data.filter(c => c.is_hidden).map(c => c.category_name);
      const custom = data.filter(c => c.is_custom && !c.is_hidden).map(c => c.category_name);
      const savedOrder = data.filter(c => !c.is_hidden).map(c => c.category_name);
      
      setHiddenCategories(hidden);
      setCustomCategories(custom);
      setCategoryOrder(savedOrder);
    }
    setCategoriesLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Merge categories dynamically & filter out hidden ones
  const allCategories = Array.from(new Set([
    ...initialCategories,
    ...customCategories,
    ...(dbVendors?.map((v: any) => v.category) || [])
  ])).filter(c => !hiddenCategories.includes(c));

  // Sort them based on saved user preference. Unsaved/Untracked ones go to the bottom.
  const orderedCategories = allCategories.slice().sort((a, b) => {
    const iA = categoryOrder.indexOf(a);
    const iB = categoryOrder.indexOf(b);
    
    if (iA !== -1 && iB !== -1) return iA - iB;
    if (iA !== -1) return -1;
    if (iB !== -1) return 1;
    return 0;
  });

  // Map to data structure AND Pin confirmed categories to the top
  const displayCategories = orderedCategories
    .map((categoryName) => {
      const matches: VendorOption[] = dbVendors
        ?.filter((v) => v.category === categoryName)
        .map((v: any) => ({
          id: v.id,
          name: v.assigned_vendor || "Unnamed Vendor",
          status: v.status as BookingStatus,
          estimatedCost: v.estimated_cost || 0,
          contactNumber: v.contact_numbers ?? [],
          notes: v.notes || "",
        })) || [];
      
      const confirmedOptions = matches.filter((opt) => opt.status === "Confirmed");

      return {
        name: categoryName,
        options: matches,
        confirmedOptions,
      };
    })
    .sort((a, b) => {
      const aPinned = a.confirmedOptions.length > 0;
      const bPinned = b.confirmedOptions.length > 0;
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return 0;
    });

  const currentCategoryData = displayCategories.find((c) => c.name === editingCategory);

  // Move Category Up / Down Handler
  const handleMoveCategory = async (index: number, direction: 'up' | 'down') => {
    const visualOrderNames = displayCategories.map((c) => c.name);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= visualOrderNames.length) return;

    const itemToMove = visualOrderNames[index];
    visualOrderNames.splice(index, 1);
    visualOrderNames.splice(targetIndex, 0, itemToMove);

    setCategoryOrder(visualOrderNames);

    const updates = visualOrderNames.map((cat, idx) => ({
      category_name: cat,
      order_index: idx,
      is_hidden: false,
      is_custom: !initialCategories.includes(cat)
    }));

    const { error } = await supabase.from('vendor_categories').upsert(updates, { onConflict: 'category_name' });
    if (error) console.error("Error saving new order to DB:", error);
  };

  const handleAddCustomCategory = async () => {
    const trimmed = newCategoryName.trim();
    if (trimmed) {
      const updatedOrder = Array.from(new Set([trimmed, ...orderedCategories.filter(c => c !== trimmed)]));
      
      const updates = updatedOrder.map((cat, idx) => ({
        category_name: cat,
        order_index: idx,
        is_hidden: false,
        is_custom: !initialCategories.includes(cat)
      }));

      const { error } = await supabase.from('vendor_categories').upsert(updates, { onConflict: 'category_name' });

      if (error) {
        console.error("Error adding category:", error);
        alert("Failed to add category.");
      } else {
        await fetchCategories();
      }
    }
    setNewCategoryName("");
    setIsAddCategoryOpen(false);
  };

  const handleSaveCategoryName = async (oldName: string) => {
    const newName = editCategoryInput.trim();
    
    if (!newName || newName === oldName) {
      setEditingCategoryTitle(null);
      return;
    }
    
    if (allCategories.includes(newName)) {
      alert("A category with this name already exists.");
      return;
    }

    const currentIndex = categoryOrder.indexOf(oldName);

    const { error: vendorUpdateError } = await supabase.from('vendors').update({ category: newName }).eq('category', oldName);
    if (vendorUpdateError) {
      console.error("Error updating vendor categories:", vendorUpdateError);
      alert("Failed to update category name on existing vendors.");
      return;
    }

    if (initialCategories.includes(oldName)) {
      await supabase.from('vendor_categories').upsert(
        { category_name: oldName, is_hidden: true, is_custom: false },
        { onConflict: 'category_name' }
      );
    } else {
      await supabase.from('vendor_categories').delete().eq('category_name', oldName);
    }

    await supabase.from('vendor_categories').upsert(
      { category_name: newName, order_index: currentIndex > -1 ? currentIndex : 0, is_hidden: false, is_custom: true },
      { onConflict: 'category_name' }
    );

    setCategoryOrder(prev => prev.map(name => name === oldName ? newName : name));
    setEditingCategoryTitle(null);
    await fetchCategories();
    await fetchVendors();
  };

  const handleDeleteCategory = async (categoryName: string, vendorCount: number) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the "${categoryName}" category${
        vendorCount > 0 ? ` and its ${vendorCount} vendor(s)` : ""
      }?`
    );

    if (!confirmDelete) return;

    if (vendorCount > 0) {
      const { error: vendorError } = await supabase.from("vendors").delete().eq("category", categoryName);
      if (vendorError) {
        console.error("Error deleting vendors:", vendorError);
        alert("Failed to delete category vendors.");
        return;
      }
    }

    const { error: catError } = await supabase.from('vendor_categories').upsert({
      category_name: categoryName,
      is_hidden: true,
      is_custom: !initialCategories.includes(categoryName)
    }, { onConflict: 'category_name' });

    if (catError) {
      console.error("Error deleting category setting:", catError);
      alert("Failed to delete category.");
    } else {
      setCategoryOrder(prev => prev.filter(name => name !== categoryName)); 
      await fetchCategories();
      await fetchVendors();
    }
  };

  const openDialog = (categoryName: string) => {
    setEditingCategory(categoryName);
    setNewOptionName("");
    setNewOptionStatus("Not Started");
    setNewEstimatedCost("");
    setNewContactNumbers([""]);
    setNewNotes("");
    setEditingOptionId(null);
    setIsDialogOpen(true);
  };

  const handleAddOption = async () => {
    if (!newOptionName.trim() || !editingCategory) return;

    const filteredPhones = newContactNumbers.filter(phone => phone.trim() !== "");

    const { error } = await supabase.from("vendors").insert({
      category: editingCategory,
      assigned_vendor: newOptionName.trim(),
      status: newOptionStatus,
      estimated_cost: newEstimatedCost ? parseFloat(newEstimatedCost) : 0,
      contact_numbers: filteredPhones.length > 0 ? filteredPhones : null,
      notes: newNotes.trim() || null,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Supabase insert error:", error);
      alert("Failed to add vendor. Check console for details.");
      return;
    }

    setNewOptionName("");
    setNewOptionStatus("Not Started");
    setNewEstimatedCost("");
    setNewContactNumbers([""]);
    setNewNotes("");
    
    await fetchVendors();
  };

  const startEditing = (opt: VendorOption) => {
    setEditingOptionId(opt.id);
    setEditOptionName(opt.name);
    setEditEstimatedCost(opt.estimatedCost ? opt.estimatedCost.toString() : "");
    setEditContactNumbers(opt.contactNumber && opt.contactNumber.length > 0 ? opt.contactNumber : [""]);
    setEditNotes(opt.notes || "");
  };

  const cancelEditing = () => setEditingOptionId(null);

  const saveEditedOption = async (optionId: string) => {
    if (!editOptionName.trim()) return;

    const filteredPhones = editContactNumbers.filter(phone => phone.trim() !== "");

    const { error } = await supabase.from("vendors").update({
      assigned_vendor: editOptionName.trim(),
      estimated_cost: editEstimatedCost ? parseFloat(editEstimatedCost) : 0,
      contact_numbers: filteredPhones.length > 0 ? filteredPhones : null,
      notes: editNotes.trim() || null,
      updated_at: new Date().toISOString(),
    }).eq("id", optionId);

    if (error) {
      console.error("Supabase update error:", error);
      alert("Failed to update vendor. Check console.");
      return;
    }

    setEditingOptionId(null);
    await fetchVendors();
  };

  const handleStatusChange = async (optionId: string, status: BookingStatus) => {
    await supabase.from("vendors").update({ status }).eq("id", optionId);
    await fetchVendors();
  };

  const handleDeleteOption = async (optionId: string) => {
    if (!optionId) {
      alert("Error: Vendor ID is missing. Check the console.");
      return;
    }

    const { error } = await supabase.from("vendors").delete().eq("id", optionId);
    if (error) alert("Failed to delete. Check console.");
    else await fetchVendors(); 
  };

  if (vendorsLoading || categoriesLoading) {
    return <div className="p-12 text-center text-emerald-600 font-medium">Loading Vendors...</div>;
  }

  return (
    <>
      <div className="space-y-4 mb-2">
        <div>
          <h1 className="text-3xl font-serif font-bold text-emerald-900 flex items-center gap-3">
            <Handshake className="w-8 h-8 text-emerald-700" /> Vendors
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Keep track of options and confirmed selections of your wedding team.
          </p>
        </div>
        <div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsAddCategoryOpen(true)}
            className="text-xs font-medium text-emerald-700 border-emerald-200 hover:bg-emerald-50 h-8 shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Category
          </Button>
        </div>
      </div>

      <Card className="col-span-full border-slate-200 shadow-sm">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayCategories.map((item, index) => {
              const hasConfirmed = item.confirmedOptions.length > 0;

              return (
                <div
                  key={item.name}
                  className={`group/category p-4 rounded-xl border transition-colors shadow-sm flex flex-col justify-between min-h-[130px] ${
                    hasConfirmed ? "border-emerald-200 bg-emerald-50/30" : "border-slate-100 bg-white hover:border-slate-300"
                  }`}
                >
                  
                  {/* CATEGORY HEADER ROW */}
                  {editingCategoryTitle === item.name ? (
                    <div className="flex items-center gap-1.5 w-full mb-3">
                      <input 
                        type="text" 
                        value={editCategoryInput}
                        onChange={(e) => setEditCategoryInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveCategoryName(item.name);
                          if (e.key === 'Escape') setEditingCategoryTitle(null);
                        }}
                        className="flex-1 border border-emerald-500 p-1 rounded text-sm focus:outline-none"
                        autoFocus
                      />
                      <button onClick={() => handleSaveCategoryName(item.name)} className="p-1 text-emerald-600 bg-emerald-50 rounded border border-emerald-100 hover:bg-emerald-100">
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditingCategoryTitle(null)} className="p-1 text-slate-400 bg-slate-100 rounded border border-slate-200 hover:bg-slate-200">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start mb-2 w-full gap-2">
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <h3 className="font-medium text-slate-800 truncate">{item.name}</h3>
                        {hasConfirmed && (
                          <span title="Pinned to top">
                            <Pin className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/20 flex-shrink-0" />
                          </span>
                        )}
                        
                        {/* 50% opacity on mobile, hidden on desktop until hovered */}
                        <div className="flex items-center opacity-50 lg:opacity-0 group-hover/category:opacity-100 transition-opacity flex-shrink-0 bg-white rounded-md border border-slate-100 overflow-hidden shadow-sm">
                          <button
                            onClick={() => handleMoveCategory(index, 'up')}
                            disabled={index === 0}
                            className="text-slate-400 hover:text-emerald-600 p-1 hover:bg-emerald-50 transition-colors border-r border-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
                            title="Move Up"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMoveCategory(index, 'down')}
                            disabled={index === displayCategories.length - 1}
                            className="text-slate-400 hover:text-emerald-600 p-1 hover:bg-emerald-50 transition-colors border-r border-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
                            title="Move Down"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingCategoryTitle(item.name);
                              setEditCategoryInput(item.name);
                            }}
                            className="text-slate-400 hover:text-emerald-600 p-1 hover:bg-emerald-50 transition-colors border-r border-slate-100"
                            title="Edit Category Name"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(item.name, item.options.length)}
                            className="text-slate-400 hover:text-red-500 p-1 hover:bg-red-50 transition-colors"
                            title="Delete Category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>                  
                      <Badge
                        className={`${
                          hasConfirmed
                            ? "bg-emerald-100 text-emerald-700"
                            : item.options.length > 0
                            ? "bg-orange-100 text-orange-700"
                            : "bg-slate-100 text-slate-600"
                        } border-none shadow-none font-medium whitespace-nowrap`}
                      >
                        {hasConfirmed
                          ? `${item.confirmedOptions.length} Confirmed`
                          : item.options.length > 0
                          ? `${item.options.length} Options`
                          : "Not Started"}
                      </Badge>
                    </div>
                  )}

                  <div className="mt-2 space-y-2">
                    {/* CONFIRMED STATE */}
                    {hasConfirmed ? (
                      <div className="space-y-2">
                        {item.confirmedOptions.map((vendor) => (
                          <div
                            key={vendor.id}
                            className="bg-emerald-100/60 p-2.5 rounded-lg border border-emerald-200 space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-emerald-900 font-semibold text-sm">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span>{vendor.name}</span>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-3 text-xs text-emerald-800">
                              {vendor.estimatedCost ? (
                                <span className="flex items-center gap-1">
                                  <IndianRupee className="w-3 h-3" />
                                  {vendor.estimatedCost.toLocaleString("en-IN")}
                                </span>
                              ) : null}

                              {vendor.contactNumber?.map((phone, i) => (
                                <a
                                  key={i}
                                  href={`tel:${phone}`}
                                  className="flex items-center gap-1 hover:underline"
                                >
                                  <Phone className="w-3 h-3" />
                                  {phone}
                                </a>
                              ))}
                            </div>
                            
                            {/* Confirmed Vendor Notes Preview */}
                            {vendor.notes && (
                               <div className="mt-2 text-[11px] text-emerald-800/80 bg-white/60 p-2 rounded border border-emerald-100/50">
                                 {renderTextWithLinks(vendor.notes)}
                               </div>
                            )}
                          </div>
                        ))}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDialog(item.name)}
                          className="text-xs text-emerald-700"
                        >
                          Manage
                        </Button>
                      </div>
                    ) : (
                      
                      /* UNCONFIRMED MULTI-OPTION STATE */
                      <div>
                        {item.options.length > 0 ? (
                          <div className="space-y-2">
                            {item.options.map((opt) => (
                              <div key={opt.id} className="flex flex-col gap-1.5 text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 truncate">
                                    <span className="font-medium text-slate-700 truncate max-w-[120px]">{opt.name}</span>
                                    {opt.estimatedCost ? (
                                      <span className="text-[11px] text-slate-500 flex items-center">
                                        ₹{opt.estimatedCost.toLocaleString("en-IN")}
                                      </span>
                                    ) : null}
                                  </div>
                                  <span className="text-[10px] text-slate-500 bg-slate-200/60 px-1.5 py-0.5 rounded">{opt.status}</span>
                                </div>
                                
                                {/* Always Show Contact Numbers */}
                                {opt.contactNumber && opt.contactNumber.length > 0 && (
                                  <div className="flex flex-wrap gap-3">
                                    {opt.contactNumber.map((phone, i) => (
                                      <a
                                        key={i}
                                        href={`tel:${phone}`}
                                        className="flex items-center gap-1 text-[11px] hover:text-emerald-600 transition-colors"
                                      >
                                        <Phone className="w-3 h-3" />
                                        {phone}
                                      </a>
                                    ))}
                                  </div>
                                )}

                                {/* Always Show Notes & Links */}
                                {opt.notes && (
                                  <div className="mt-1 pt-1.5 border-t border-slate-200/60 text-[11px] text-slate-500">
                                    {renderTextWithLinks(opt.notes)}
                                  </div>
                                )}
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

      {/* ADD CUSTOM CATEGORY MODAL */}
      <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Vendor Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <input
              type="text"
              placeholder="e.g. Caterer, Choreographer, Security..."
              className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCustomCategory()}
              autoFocus
            />
            <Button onClick={handleAddCustomCategory} className="w-full bg-emerald-600 hover:bg-emerald-700">
              Add Category
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* MANAGE OPTIONS MODAL */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          
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
                          <div className="space-y-2 w-1/2">
                            {editContactNumbers.map((phone, index) => (
                              <div key={index} className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder={`Phone ${index + 1}`}
                                  className="flex-1 border border-slate-300 p-2 rounded-lg text-sm"
                                  value={phone}
                                  onChange={(e) => {
                                    const updated = [...editContactNumbers];
                                    updated[index] = e.target.value;
                                    setEditContactNumbers(updated);
                                  }}
                                />

                                {editContactNumbers.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() =>
                                      setEditContactNumbers(
                                        editContactNumbers.filter((_, i) => i !== index)
                                      )
                                    }
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            ))}

                            <Button
                              type="button"
                              variant="outline"
                              onClick={() =>
                                setEditContactNumbers([...editContactNumbers, ""])
                              }
                            >
                              + Add Phone
                            </Button>
                          </div>
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
                              <option value="Not Started">Not Started</option>
                              <option value="Enquired">Enquired</option>
                              <option value="Negotiating">Negotiating</option>
                              <option value="Recommendation">Recommendation</option>
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
                            <div className="flex flex-col gap-1">
                              {opt.contactNumber?.map((phone, index) => (
                                <a
                                  key={index}
                                  href={`tel:${phone}`}
                                  className="flex items-center gap-1 hover:text-emerald-600"
                                >
                                  <Phone className="w-3 h-3" />
                                  {phone}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                        {opt.notes && (
                          <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-md border border-slate-100 mt-1">
                            {renderTextWithLinks(opt.notes)}
                          </div>
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
                  <option value="Recommendation">Recommendation</option>
                  <option value="Not Started">Not Started</option>
                  <option value="Confirmed">Confirmed</option>
                </select>
              </div>

              <input
                type="number"
                placeholder="Est. Cost (₹)"
                className="w-full border border-slate-300 p-2 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                value={newEstimatedCost}
                onChange={(e) => setNewEstimatedCost(e.target.value)}
              />

              <div className="space-y-2">
                {newContactNumbers.map((phone, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      placeholder={`Phone ${index + 1}`}
                      className="flex-1 border border-slate-300 p-2 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                      value={phone}
                      onChange={(e) => {
                        const updated = [...newContactNumbers];
                        updated[index] = e.target.value;
                        setNewContactNumbers(updated);
                      }}
                    />

                    {newContactNumbers.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          setNewContactNumbers(
                            newContactNumbers.filter((_, i) => i !== index)
                          )
                        }
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setNewContactNumbers([...newContactNumbers, ""])}
                >
                  + Add Phone
                </Button>
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
    <div className="p-6 md:p-12 max-w-[1600px] mx-auto space-y-6 h-full flex flex-col">
      <VendorsTracker />
    </div>
  );
}