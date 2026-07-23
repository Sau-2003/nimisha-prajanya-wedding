"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, CheckCircle2, Trash2, Phone, Pencil, Handshake, X, Link as LinkIcon, ChevronUp, ChevronDown, Pin } from "lucide-react";
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

  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [hiddenCategories, setHiddenCategories] = useState<string[]>([]);
  const [pinnedCategoriesList, setPinnedCategoriesList] = useState<string[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  
  const [categoryOrder, setCategoryOrder] = useState<string[]>([]);

  const [editingCategoryTitle, setEditingCategoryTitle] = useState<string | null>(null);
  const [editCategoryInput, setEditCategoryInput] = useState("");

  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);

  const [newOptionName, setNewOptionName] = useState("");
  const [newOptionStatus, setNewOptionStatus] = useState<BookingStatus>("Not Started");
  const [newEstimatedCost, setNewEstimatedCost] = useState<string>("");
  const [newContactNumbers, setNewContactNumbers] = useState<string[]>([""]);
  const [newNotes, setNewNotes] = useState("");

  const [editingOptionId, setEditingOptionId] = useState<string | null>(null);
  const [editOptionName, setEditOptionName] = useState("");
  const [editEstimatedCost, setEditEstimatedCost] = useState<string>("");
  const [editContactNumbers, setEditContactNumbers] = useState<string[]>([""]);
  const [editNotes, setEditNotes] = useState("");

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
      const pinned = data.filter(c => c.is_pinned && !c.is_hidden).map(c => c.category_name);
      const savedOrder = data.filter(c => !c.is_hidden).map(c => c.category_name);
      
      setHiddenCategories(hidden);
      setCustomCategories(custom);
      setPinnedCategoriesList(pinned);
      setCategoryOrder(savedOrder);
    }
    setCategoriesLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // --- MEMOIZED DERIVED STATES ---

  const allCategories = useMemo(() => {
    return Array.from(new Set([
      ...initialCategories,
      ...customCategories,
      ...(dbVendors?.map((v: any) => v.category) || [])
    ])).filter(c => !hiddenCategories.includes(c));
  }, [customCategories, dbVendors, hiddenCategories]);

  const orderedCategories = useMemo(() => {
    return allCategories.slice().sort((a, b) => {
      const iA = categoryOrder.indexOf(a);
      const iB = categoryOrder.indexOf(b);
      
      if (iA !== -1 && iB !== -1) return iA - iB;
      if (iA !== -1) return -1;
      if (iB !== -1) return 1;
      return 0;
    });
  }, [allCategories, categoryOrder]);

  const rawDisplayCategories = useMemo(() => {
    return orderedCategories.map((categoryName) => {
      let matches: VendorOption[] = dbVendors
        ?.filter((v) => v.category === categoryName)
        .map((v: any) => ({
          id: v.id,
          name: v.assigned_vendor || "Unnamed Vendor",
          status: v.status as BookingStatus,
          estimatedCost: v.estimated_cost || 0,
          contactNumber: v.contact_numbers ?? [],
          notes: v.notes || "",
        })) || [];
        
      // SORT: Bring "Confirmed" vendors to the top of the modal list
      matches = matches.sort((a, b) => {
        if (a.status === 'Confirmed' && b.status !== 'Confirmed') return -1;
        if (b.status === 'Confirmed' && a.status !== 'Confirmed') return 1;
        return 0;
      });
      
      const confirmedOptions = matches.filter((opt) => opt.status === "Confirmed");
      const hasConfirmed = confirmedOptions.length > 0;
      
      const isManuallyPinned = pinnedCategoriesList.includes(categoryName);
      const isPinned = isManuallyPinned || hasConfirmed; 

      return {
        name: categoryName,
        options: matches,
        confirmedOptions,
        hasConfirmed,
        isManuallyPinned,
        isPinned
      };
    });
  }, [orderedCategories, dbVendors, pinnedCategoriesList]);

  const pinnedGroup = useMemo(() => rawDisplayCategories.filter(c => c.isPinned), [rawDisplayCategories]);
  const unpinnedGroup = useMemo(() => rawDisplayCategories.filter(c => !c.isPinned), [rawDisplayCategories]);
  const displayCategories = useMemo(() => [...pinnedGroup, ...unpinnedGroup], [pinnedGroup, unpinnedGroup]);
  const currentCategoryData = useMemo(() => displayCategories.find((c) => c.name === editingCategory), [displayCategories, editingCategory]);

  // --- ACTIONS ---

  const handleTogglePin = async (categoryName: string, currentPinnedState: boolean) => {
    const newPinnedState = !currentPinnedState;
    const { error } = await supabase.from('vendor_categories').upsert({
      category_name: categoryName,
      is_pinned: newPinnedState,
      is_hidden: false,
      is_custom: !initialCategories.includes(categoryName)
    }, { onConflict: 'category_name' });

    if (error) {
      console.error("Error updating pin state:", error);
      alert("Failed to pin/unpin category.");
    } else {
      await fetchCategories();
    }
  };

  const handleMoveCategory = async (categoryName: string, direction: 'up' | 'down', isPinnedGroup: boolean) => {
    const group = isPinnedGroup ? pinnedGroup : unpinnedGroup;
    const currentIndex = group.findIndex((c) => c.name === categoryName);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= group.length) return;

    const groupNames = group.map(c => c.name);
    const [movedItem] = groupNames.splice(currentIndex, 1);
    groupNames.splice(targetIndex, 0, movedItem);

    const newPinnedNames = isPinnedGroup ? groupNames : pinnedGroup.map(c => c.name);
    const newUnpinnedNames = !isPinnedGroup ? groupNames : unpinnedGroup.map(c => c.name);
    
    const updatedFullOrder = [...newPinnedNames, ...newUnpinnedNames];
    setCategoryOrder(updatedFullOrder);

    const updates = updatedFullOrder.map((cat, idx) => ({
      category_name: cat,
      order_index: idx,
      is_hidden: false,
      is_pinned: pinnedCategoriesList.includes(cat),
      is_custom: !initialCategories.includes(cat)
    }));

    const { error } = await supabase.from('vendor_categories').upsert(updates, { onConflict: 'category_name' });
    if (error) {
      console.error("Error saving new order to DB:", error);
    } else {
      await fetchCategories();
    }
  };

  const handleAddCustomCategory = async () => {
    const trimmed = newCategoryName.trim();
    if (trimmed) {
      const updatedOrder = Array.from(new Set([trimmed, ...orderedCategories.filter(c => c !== trimmed)]));
      
      const updates = updatedOrder.map((cat, idx) => ({
        category_name: cat,
        order_index: idx,
        is_hidden: false,
        is_pinned: pinnedCategoriesList.includes(cat),
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
    const isCurrentlyPinned = pinnedCategoriesList.includes(oldName);

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
      { category_name: newName, order_index: currentIndex > -1 ? currentIndex : 0, is_hidden: false, is_pinned: isCurrentlyPinned, is_custom: true },
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
    const targetVendor = dbVendors?.find((v: any) => v.id === optionId);
    
    await supabase.from("vendors").update({ status }).eq("id", optionId);

    if (targetVendor && targetVendor.status === 'Confirmed' && status !== 'Confirmed') {
      const catName = targetVendor.category;
      
      const otherConfirmed = dbVendors?.filter(
        (v: any) => v.category === catName && v.id !== optionId && v.status === 'Confirmed'
      );

      if (!otherConfirmed || otherConfirmed.length === 0) {
        setPinnedCategoriesList(prev => prev.filter(c => c !== catName));
        await supabase.from("vendor_categories").update({ is_pinned: false }).eq("category_name", catName);
        fetchCategories(); 
      }
    }

    await fetchVendors();
  };

  const handleDeleteOption = async (optionId: string) => {
    if (!optionId) {
      alert("Error: Vendor ID is missing. Check the console.");
      return;
    }

    const targetVendor = dbVendors?.find((v: any) => v.id === optionId);

    const { error } = await supabase.from("vendors").delete().eq("id", optionId);
    
    if (error) {
      alert("Failed to delete. Check console.");
      return;
    }

    if (targetVendor && targetVendor.status === 'Confirmed') {
      const catName = targetVendor.category;
      
      const otherConfirmed = dbVendors?.filter(
        (v: any) => v.category === catName && v.id !== optionId && v.status === 'Confirmed'
      );

      if (!otherConfirmed || otherConfirmed.length === 0) {
        setPinnedCategoriesList(prev => prev.filter(c => c !== catName));
        await supabase.from("vendor_categories").update({ is_pinned: false }).eq("category_name", catName);
        fetchCategories();
      }
    }

    await fetchVendors(); 
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
            {displayCategories.map((item) => {
              const hasConfirmed = item.hasConfirmed;

              return (
                <div
                  key={item.name}
                  className={`group/category p-4 rounded-xl border transition-colors shadow-sm flex flex-col min-h-[140px] ${
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
                    <div className="flex flex-col gap-2 mb-3 w-full border-b border-slate-100 pb-2">
                      <div className="flex justify-between items-center w-full">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {/* PIN/UNPIN TOGGLE */}
                          <button
                            onClick={() => !item.hasConfirmed && handleTogglePin(item.name, item.isManuallyPinned)}
                            disabled={item.hasConfirmed}
                            className={`transition-colors p-1 rounded ${
                              item.hasConfirmed
                                ? "text-emerald-500 cursor-not-allowed opacity-80"
                                : item.isManuallyPinned 
                                  ? "text-emerald-600 hover:bg-slate-100" 
                                  : "text-slate-300 hover:text-slate-500 hover:bg-slate-100"
                            }`}
                            title={
                              item.hasConfirmed 
                                ? "Pinned automatically (Confirmed selection)" 
                                : item.isManuallyPinned 
                                  ? "Unpin category" 
                                  : "Pin category to top"
                            }
                          >
                            <Pin className={`w-3.5 h-3.5 ${item.isPinned ? "fill-emerald-600/20" : ""}`} />
                          </button>
                          
                          <h3 className="font-semibold text-slate-800 text-base truncate">{item.name}</h3>
                        </div>

                        <Badge
                          className={`${
                            hasConfirmed
                              ? "bg-emerald-100 text-emerald-700"
                              : item.options.length > 0
                              ? "bg-orange-100 text-orange-700"
                              : "bg-slate-100 text-slate-600"
                          } border-none shadow-none font-medium whitespace-nowrap ml-2`}
                        >
                          {hasConfirmed
                            ? `${item.confirmedOptions.length} Confirmed`
                            : item.options.length > 0
                            ? `${item.options.length} Options`
                            : "Not Started"}
                        </Badge>
                      </div>

                      {/* FORMATTED ACTION BAR */}
                      <div className="flex items-center justify-between text-xs pt-1">
                        <button
                          onClick={() => openDialog(item.name)}
                          className="text-emerald-700 font-medium hover:underline flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> 
                          {hasConfirmed ? "Manage" : item.options.length > 0 ? "Edit / Add Option" : "Add Options"}
                        </button>

                        <div className="flex items-center gap-2 text-slate-500">
                          <button
                            onClick={() => {
                              setEditingCategoryTitle(item.name);
                              setEditCategoryInput(item.name);
                            }}
                            className="hover:text-emerald-600 transition-colors"
                            title="Edit Category Name"
                          >
                            <Pencil className="w-3.5 h-3.5 inline" />
                          </button>
                          <span>•</span>
                          <button
                            onClick={() => handleDeleteCategory(item.name, item.options.length)}
                            className="hover:text-red-500 transition-colors"
                            title="Delete Category"
                          >
                            <Trash2 className="w-3.5 h-3.5 inline" />
                          </button>
                          <span>•</span>
                          
                          {/* MOVE CONTROLS (Group Constrained) */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleMoveCategory(item.name, 'up', item.isPinned)}
                              disabled={
                                item.isPinned 
                                  ? pinnedGroup.findIndex(c => c.name === item.name) === 0 
                                  : unpinnedGroup.findIndex(c => c.name === item.name) === 0
                              }
                              className="hover:text-emerald-600 disabled:opacity-30"
                              title="Move Up"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleMoveCategory(item.name, 'down', item.isPinned)}
                              disabled={
                                item.isPinned 
                                  ? pinnedGroup.findIndex(c => c.name === item.name) === pinnedGroup.length - 1 
                                  : unpinnedGroup.findIndex(c => c.name === item.name) === unpinnedGroup.length - 1
                              }
                              className="hover:text-emerald-600 disabled:opacity-30"
                              title="Move Down"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-1 space-y-2">
                    {/* CONFIRMED STATE */}
                    {hasConfirmed ? (
                      <div className="space-y-2">
                        {item.confirmedOptions.map((vendor) => (
                          <div
                            key={vendor.id}
                            className="bg-emerald-100/60 p-2.5 rounded-lg border border-emerald-200 space-y-1 relative group/vendor"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex flex-col min-w-0 flex-1 pr-2">
                                <div className="flex items-center gap-2 text-emerald-900 font-semibold text-sm">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                  <span className="truncate">{vendor.name}</span>
                                </div>
                                {vendor.estimatedCost ? (
                                  <span className="text-xs text-emerald-800 font-medium ml-6 flex items-center mt-0.5">
                                    ₹{vendor.estimatedCost.toLocaleString("en-IN")}
                                  </span>
                                ) : null}
                              </div>

                              <div className="flex items-center gap-1.5 flex-shrink-0 pt-0.5">
                                <button onClick={() => { openDialog(item.name); startEditing(vendor); }} className="p-1 text-emerald-700 hover:text-emerald-900 transition-colors" title="Edit Vendor">
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => handleDeleteOption(vendor.id)} className="p-1 text-red-500 hover:text-red-700 transition-colors" title="Delete Vendor">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-3 text-xs text-emerald-800 ml-6 pt-1">
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
                            
                            {vendor.notes && (
                               <div className="mt-2 text-[11px] text-emerald-800/80 bg-white/60 p-2 rounded border border-emerald-100/50">
                                 {renderTextWithLinks(vendor.notes)}
                               </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      
                      /* UNCONFIRMED MULTI-OPTION STATE */
                      <div>
                        {item.options.length > 0 ? (
                          <div className="space-y-2">
                            {item.options.map((opt) => (
                              <div key={opt.id} className="flex flex-col gap-1.5 text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100 relative group/vendor">
                                <div className="flex items-start justify-between">
                                  <div className="flex flex-col min-w-0 flex-1 pr-2">
                                    <span className="font-medium text-slate-700 truncate">{opt.name}</span>
                                    {opt.estimatedCost ? (
                                      <span className="text-[11px] text-slate-500 flex items-center font-medium mt-0.5">
                                        ₹{opt.estimatedCost.toLocaleString("en-IN")}
                                      </span>
                                    ) : null}
                                  </div>

                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className="text-[10px] text-slate-500 bg-slate-200/60 px-1.5 py-0.5 rounded">{opt.status}</span>
                                    <div className="flex items-center gap-1">
                                      <button onClick={() => { openDialog(item.name); startEditing(opt); }} className="p-1 text-slate-500 hover:text-emerald-700" title="Edit Vendor">
                                        <Pencil className="w-3.5 h-3.5" />
                                      </button>
                                      <button onClick={() => handleDeleteOption(opt.id)} className="p-1 text-slate-400 hover:text-red-600" title="Delete Vendor">
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                                
                                {opt.contactNumber && opt.contactNumber.length > 0 && (
                                  <div className="flex flex-wrap gap-3 pt-1">
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

                                {opt.notes && (
                                  <div className="mt-1 pt-1.5 border-t border-slate-200/60 text-[11px] text-slate-500">
                                    {renderTextWithLinks(opt.notes)}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 italic">No options added yet.</p>
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

          {editingOptionId ? (
            /* EDIT SINGLE VENDOR MODE WHEN PENCIL CLICKED */
            <div className="space-y-3 mt-2">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Edit Vendor</h4>
              <div className="space-y-2">
                <input
                  type="text"
                  className="w-full border border-emerald-500 p-2 rounded-lg text-sm focus:outline-none"
                  value={editOptionName}
                  onChange={(e) => setEditOptionName(e.target.value)}
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Est. Cost"
                    className="w-1/2 border border-emerald-500 p-2 rounded-lg text-sm focus:outline-none"
                    value={editEstimatedCost}
                    onChange={(e) => setEditEstimatedCost(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
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

                <textarea
                  placeholder="Notes"
                  className="w-full border border-emerald-500 p-2 rounded-lg text-sm focus:outline-none resize-none"
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                />

                <div className="flex justify-end gap-2 mt-2">
                  <button onClick={cancelEditing} className="px-3 py-1.5 text-xs bg-slate-200 text-slate-700 font-medium rounded-md hover:bg-slate-300 transition-colors">Cancel</button>
                  <button onClick={() => { saveEditedOption(editingOptionId); }} className="px-3 py-1.5 text-xs bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-700 transition-colors">Save Changes</button>
                </div>
              </div>
            </div>
          ) : (
            /* DEFAULT MODAL VIEW: CURRENT OPTIONS & ADD NEW */
            <>
              <div className="space-y-3 mt-2">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Options</h4>
                {currentCategoryData?.options.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">No options added yet.</p>
                ) : (
                  <div className="space-y-2">
                    {currentCategoryData?.options.map((opt) => (
                      <div key={opt.id} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-800">{opt.name}</span>
                          {opt.estimatedCost ? (
                            <span className="text-xs text-slate-500">₹{opt.estimatedCost.toLocaleString("en-IN")}</span>
                          ) : null}
                        </div>
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
                          <button onClick={() => startEditing(opt)} className="p-1 text-slate-400 hover:text-emerald-600 rounded bg-white border border-slate-200 transition-colors" title="Edit">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDeleteOption(opt.id)} className="p-1 text-slate-400 hover:text-red-600 rounded bg-white border border-slate-200 transition-colors" title="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
                  <Plus className="w-4 h-4 mr-1" /> Save Vendor Option
                </Button>
              </div>
            </>
          )}
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