"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Image as ImageIcon, Calendar, Maximize2, X, Link as LinkIcon, 
  ExternalLink, ShoppingBag, Pencil, Trash2, Loader2, Plus, FolderPlus, ChevronDown, CheckCircle2
} from "lucide-react";
import { DressIcon } from '@phosphor-icons/react';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ParsedOutfit {
  id: string;
  event_name: string;
  category: string; 
  caption: string;
  image_url: string;
  is_link: boolean;
  shopping_tab_id?: string;
}

interface OptionTab {
  id: string;
  label: string;
}

// Strictly predefined events list
const PREDEFINED_EVENTS = [
  'Puja', 
  'Mehendi', 
  'Check In', 
  'Tilak', 
  'Sangeet', 
  'Haldi', 
  'Reception', 
  'Phere', 
  'Pagphere', 
  'Vidai'
];

// --- Helper to Title Case event names for matching ---
const toTitleCase = (str: string) => {
  if (!str) return 'General';
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
};

// --- SUB-COMPONENT: Renders a single Event/Shopping Section with Upload UI ---
function EventOutfitsSection({ 
  eventName, 
  outfits, 
  activeGlobalTab,
  tabId,
  onImageClick,
  onEdit,
  onDelete,
  onAddImage,
  onAddLink,
  onDeleteSection
}: { 
  eventName: string; 
  outfits: ParsedOutfit[]; 
  activeGlobalTab: string;
  tabId?: string;
  onImageClick: (outfit: ParsedOutfit) => void;
  onEdit: (e: React.MouseEvent, outfit: ParsedOutfit) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
  onAddImage: (file: File, caption: string, sectionName: string, tabId?: string) => Promise<void>;
  onAddLink: (url: string, title: string, sectionName: string, tabId?: string) => Promise<void>;
  onDeleteSection: (sectionName: string, tabId?: string) => void;
}) {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [addingLink, setAddingLink] = useState(false);
  const [newCaption, setNewCaption] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isShoppingTab = activeGlobalTab === 'Shopping';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    await onAddImage(file, newCaption, eventName, tabId);
    setNewCaption("");
    setUploading(false);
    setShowAddMenu(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleLinkSubmit = async () => {
    if (!newLinkUrl.trim()) return;
    setAddingLink(true);
    await onAddLink(newLinkUrl, newLinkTitle, eventName, tabId);
    setNewLinkUrl("");
    setNewLinkTitle("");
    setAddingLink(false);
    setShowAddMenu(false);
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6 relative group">
      
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${isShoppingTab ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
            {isShoppingTab ? <ShoppingBag className="w-6 h-6" /> : <Calendar className="w-6 h-6" />}
          </div>
          <h2 className="text-2xl font-serif font-bold text-slate-800 tracking-wide capitalize">
            {eventName}
          </h2>
          <button 
            onClick={() => onDeleteSection(eventName, tabId)}
            className="opacity-50 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all p-1.5 ml-2"
            title={`Delete ${eventName} section`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        <Badge variant="secondary" className="bg-slate-100 text-slate-500 hover:bg-slate-200 px-3 py-1 rounded-full text-sm font-medium">
          {outfits.length} {outfits.length === 1 ? 'Item' : 'Items'}
        </Badge>
      </div>

      {/* Cards Grid */}
      {outfits.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
          No items added to {eventName} yet. Click "New Option" below to add images or links!
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
          {outfits.map((outfit) => {
            if (outfit.is_link) {
              return (
                <Card key={outfit.id} className="relative group/card p-4 border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between bg-emerald-50/30">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-emerald-700 font-semibold text-xs uppercase tracking-wide">
                      <LinkIcon className="w-3.5 h-3.5" /> Link Item
                    </div>
                    <a href={outfit.image_url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-slate-800 hover:text-emerald-700 line-clamp-3 flex items-start gap-1 break-all">
                      {outfit.caption !== 'Outfit Image' && outfit.caption !== 'Option Choice' && outfit.caption !== 'Link' ? outfit.caption : outfit.image_url}
                      <ExternalLink className="w-3 h-3 shrink-0 mt-0.5 text-slate-400" />
                    </a>
                  </div>

                  <div className="flex justify-end gap-1.5 mt-4 pt-2 border-t border-slate-100 opacity-50 group-hover/card:opacity-100 transition-all">
                    <button onClick={(e) => onEdit(e, outfit)} className="bg-white hover:bg-slate-50 text-slate-700 p-1.5 rounded-full shadow-sm transition-colors border" title="Edit Link">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={(e) => onDelete(e, outfit.id)} className="bg-red-50 hover:bg-red-500 text-red-500 hover:text-white p-1.5 rounded-full shadow-sm transition-colors border border-red-100" title="Delete Link">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </Card>
              );
            }

            return (
              <Card key={outfit.id} onClick={() => onImageClick(outfit)} className="relative group/card p-2 overflow-hidden border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow flex flex-col justify-between bg-white">
                <div>
                  <div className="relative overflow-hidden rounded">
                    {outfit.image_url ? (
                      <img src={outfit.image_url} alt={outfit.caption} className="w-full h-56 object-cover rounded group-hover/card:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="flex flex-col items-center justify-center w-full h-56 bg-slate-50 text-slate-300 rounded">
                        <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center text-white pointer-events-none">
                      <Maximize2 className="w-6 h-6" />
                    </div>
                  </div>
                  {(outfit.caption && outfit.caption !== 'Outfit Image' && outfit.caption !== 'Option Choice') && (
                    <p className="mt-2 text-xs font-medium text-slate-700 truncate px-1" title={outfit.caption}>
                      {outfit.caption}
                    </p>
                  )}
                </div>

                <div className="absolute top-3 right-3 flex gap-1.5 opacity-50 group-hover/card:opacity-100 transition-all z-10">
                  <button onClick={(e) => onEdit(e, outfit)} className="bg-white/90 hover:bg-white text-slate-700 p-1.5 rounded-full shadow-md transition-colors" title="Edit Image or Caption">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={(e) => onDelete(e, outfit.id)} className="bg-white/90 hover:bg-red-500 text-red-500 hover:text-white p-1.5 rounded-full shadow-md transition-colors" title="Delete Photo">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Toggled Upload UI */}
      {!showAddMenu ? (
        <div className="mt-6 flex justify-start">
          <Button 
            onClick={() => setShowAddMenu(true)} 
            variant="outline" 
            className="border-dashed border-emerald-300 text-emerald-700 hover:bg-emerald-50 bg-white"
          >
            <Plus className="w-4 h-4 mr-2" /> New Option
          </Button>
        </div>
      ) : (
        <div className="mt-6 p-4 pt-5 bg-slate-50 border border-slate-200 rounded-2xl relative shadow-sm">
          <button 
            onClick={() => setShowAddMenu(false)}
            className="absolute top-3 right-3 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
            title="Close Options"
          >
            <X className="w-4 h-4" />
          </button>
          
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 pl-1">Insert New Option to {eventName}</h4>
          
          <div className="flex flex-col xl:flex-row gap-4 xl:items-center">
            {/* Add Image */}
            <div className="flex flex-col sm:flex-row w-full xl:w-1/2 gap-2 items-stretch sm:items-center">
              <input type="text" placeholder="Image Caption..." value={newCaption} onChange={(e) => setNewCaption(e.target.value)} className="flex-1 border p-2 rounded-lg outline-none text-sm focus:border-emerald-500 bg-white" />
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              <Button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="bg-emerald-600 hover:bg-emerald-700 whitespace-nowrap">
                {uploading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <ImageIcon className="w-4 h-4 mr-2" />} Upload Image
              </Button>
            </div>
            
            {/* Vertical Divider (desktop) */}
            <div className="hidden xl:block w-px h-10 bg-slate-200" />
            
            {/* Add Link */}
            <div className="flex flex-col sm:flex-row w-full xl:w-1/2 gap-2 items-stretch sm:items-center">
              <input type="text" placeholder="Link Title..." value={newLinkTitle} onChange={(e) => setNewLinkTitle(e.target.value)} className="w-full sm:w-1/3 border p-2 rounded-lg outline-none text-sm focus:border-emerald-500 bg-white" />
              <input type="url" placeholder="https://..." value={newLinkUrl} onChange={(e) => setNewLinkUrl(e.target.value)} className="flex-1 border p-2 rounded-lg outline-none text-sm focus:border-emerald-500 bg-white" />
              <Button onClick={handleLinkSubmit} disabled={addingLink || !newLinkUrl} variant="outline" className="border-emerald-600 text-emerald-700 whitespace-nowrap bg-white">
                {addingLink ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <LinkIcon className="w-4 h-4 mr-2" />} Add Link
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- MAIN PAGE COMPONENT ---
export default function AllOutfitsPage() {
  const [outfits, setOutfits] = useState<ParsedOutfit[]>([]);
  const [optionTabs, setOptionTabs] = useState<OptionTab[]>([]);
  
  // State to hold empty tabs created by the user before they add items
  const [customTabs, setCustomTabs] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<ParsedOutfit | null>(null);
  const [activeTab, setActiveTab] = useState<string>("Ideas");

  // Tab Rename States
  const [editingTabName, setEditingTabName] = useState<string | null>(null);
  const [editTabInput, setEditTabInput] = useState("");

  // Local state tracking selected events per category tab
  const [selectedTabEvents, setSelectedTabEvents] = useState<Record<string, string[]>>({});

  // Delete Confirmation States
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [sectionToDelete, setSectionToDelete] = useState<{name: string, tabId?: string} | null>(null);
  const [tabToDelete, setTabToDelete] = useState<string | null>(null);

  // Edit Modal States
  const [editingItem, setEditingItem] = useState<ParsedOutfit | null>(null);
  const [editCaption, setEditCaption] = useState("");
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editPreviewUrl, setEditPreviewUrl] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch Option Tabs (Shopping Categories)
      const { data: tabsData } = await supabase.from('option_tabs').select('*').order('created_at');
      const tabLabelMap = new Map();
      if (tabsData) {
        setOptionTabs(tabsData);
        tabsData.forEach(tab => tabLabelMap.set(tab.id, tab.label));
      }

      // 2. Fetch everything
      const { data, error } = await supabase
        .from('event_items')
        .select('*')
        .or('category.like.outfit_%,category.like.outfit_link_%,category.like.option_%,category.like.shopping_link_%');
      
      if (error) {
        console.error("Error fetching data:", error);
      } else if (data) {
        const mappedData: ParsedOutfit[] = data.map((item: any) => {
          const isOption = item.category.startsWith('option_');
          const isShoppingLink = item.category.startsWith('shopping_link_');
          const isLink = item.category.startsWith('outfit_link_') || isShoppingLink;

          if (isOption || isShoppingLink) {
            const tabId = item.category.replace('option_', '').replace('shopping_link_', '');
            const actualTabLabel = tabLabelMap.get(tabId) || tabId;

            return {
              id: item.id,
              event_name: actualTabLabel, 
              category: 'Shopping',       
              caption: item.text || (isLink ? "Link" : "Option Choice"),
              image_url: item.content,
              is_link: isLink,
              shopping_tab_id: tabId
            };
          } else {
            const cleanCategory = item.category.replace('outfit_link_', '').replace('outfit_', '');
            return {
              id: item.id,
              event_name: toTitleCase(item.event_name || 'General'),
              category: cleanCategory, 
              caption: item.text || (isLink ? "Link" : "Outfit Image"),
              image_url: item.content,
              is_link: isLink
            };
          }
        });
        
        setOutfits(mappedData);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  // --- CRUD HANDLERS ---

  const handleAddOutfitTab = () => {
    const name = prompt("Enter new Outfit Category (e.g., Bride, Decor):");
    if (name && name.trim()) {
      const formatted = name.trim();
      // Ensure it renders immediately even if it has no items yet
      setCustomTabs(prev => [...prev, formatted]);
      setActiveTab(formatted);
    }
  };

  const handleRenameTab = async (oldName: string) => {
    const newName = editTabInput.trim();
    if (!newName || newName === oldName) {
      setEditingTabName(null);
      return;
    }

    const allCurrentTabs = Array.from(new Set([...outfits.map(o => o.category), ...customTabs]));
    if (allCurrentTabs.includes(newName)) {
      alert("A tab with this name already exists.");
      return;
    }

    // Update outfits items
    await supabase.from('event_items').update({ category: `outfit_${newName}` }).eq('category', `outfit_${oldName}`);
    // Update link items for this tab
    await supabase.from('event_items').update({ category: `outfit_link_${newName}` }).eq('category', `outfit_link_${oldName}`);

    setCustomTabs(prev => prev.map(t => t === oldName ? newName : t));
    if (activeTab === oldName) setActiveTab(newName);
    
    setEditingTabName(null);
    fetchAllData();
  };

  const handleDeleteTabRequest = (tabName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTabToDelete(tabName);
  };

  const confirmTabDelete = async () => {
    if (!tabToDelete) return;
    const tabName = tabToDelete;

    await supabase.from('event_items').delete().in('category', [`outfit_${tabName}`, `outfit_link_${tabName}`]);

    setCustomTabs(prev => prev.filter(t => t !== tabName));
    if (activeTab === tabName) setActiveTab('Ideas');
    
    setTabToDelete(null);
    fetchAllData();
  };

  const handleAddShoppingCategory = async () => {
    const name = prompt("Enter new Shopping Category (e.g., Lehengas, Shoes):");
    if (!name || !name.trim()) return;
    const trimmed = name.trim();
    const id = trimmed.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    const { error } = await supabase.from("option_tabs").insert({ id, label: trimmed });
    if (error) {
      alert(`Error creating shopping tab: ${error.message}`);
    } else {
      setOptionTabs(prev => [...prev, { id, label: trimmed }]);
    }
  };

  const handleAddImage = async (file: File, caption: string, sectionName: string, tabId?: string) => {
    const filename = `outfits/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
    const { data, error } = await supabase.storage.from('task-images').upload(filename, file);
    if (error) { alert(error.message); return; }

    const url = supabase.storage.from('task-images').getPublicUrl(data.path).data.publicUrl;
    const isShopping = activeTab === 'Shopping';

    const { error: dbError } = await supabase.from('event_items').insert({
      event_name: isShopping ? 'Shopping' : sectionName.toLowerCase(), // Saved lowercase for individual pages
      category: isShopping ? `option_${tabId}` : `outfit_${activeTab}`,
      text: caption.trim() || (isShopping ? 'Option Choice' : 'Outfit Image'),
      content: url
    });

    if (dbError) {
      alert(`Database Error: ${dbError.message}`);
    } else {
      fetchAllData();
    }
  };

  const handleAddLink = async (url: string, title: string, sectionName: string, tabId?: string) => {
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const isShopping = activeTab === 'Shopping';
    const { error: dbError } = await supabase.from('event_items').insert({
      event_name: isShopping ? 'Shopping' : sectionName.toLowerCase(), // Saved lowercase for individual pages
      category: isShopping ? `shopping_link_${tabId}` : `outfit_link_${activeTab}`,
      text: title.trim() || formattedUrl,
      content: formattedUrl
    });

    if (dbError) {
      alert(`Database Error: ${dbError.message}`);
    } else {
      fetchAllData();
    }
  };

  // Triggers Delete Confirmation Modal for Items
  const handleItemDeleteRequest = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); 
    setItemToDelete(id);
  };

  const confirmItemDelete = async () => {
    if (!itemToDelete) return;
    await supabase.from('event_items').delete().eq('id', itemToDelete);
    setItemToDelete(null);
    fetchAllData();
  };

  // Triggers Delete Confirmation Modal for Sections
  const handleSectionDeleteRequest = (sectionName: string, tabId?: string) => {
    setSectionToDelete({ name: sectionName, tabId });
  };

  const confirmSectionDelete = async () => {
    if (!sectionToDelete) return;
    const { name: sectionName, tabId } = sectionToDelete;

    if (activeTab === 'Shopping' && tabId) {
      await supabase.from('option_tabs').delete().eq('id', tabId);
      await supabase.from('event_items').delete().or(`category.eq.option_${tabId},category.eq.shopping_link_${tabId}`);
      setOptionTabs(prev => prev.filter(t => t.id !== tabId));
    } else {
      // If deleting the "General" section, clear out items with null, empty, or 'general' event names
      if (sectionName.toLowerCase() === 'general') {
        await supabase
          .from('event_items')
          .delete()
          .eq('category', `outfit_${activeTab}`)
          .or('event_name.is.null,event_name.eq.,event_name.eq.general');
      } else {
        await supabase
          .from('event_items')
          .delete()
          .in('event_name', [sectionName, sectionName.toLowerCase()])
          .eq('category', `outfit_${activeTab}`);
      }

      setSelectedTabEvents(prev => ({
        ...prev,
        [activeTab]: prev[activeTab]?.filter(e => e !== sectionName)
      }));
    }
    
    setSectionToDelete(null);
    fetchAllData();
  };

  // --- EDIT MODAL HANDLERS ---
  const openEditModal = (e: React.MouseEvent, item: ParsedOutfit) => {
    e.stopPropagation();
    if (item.is_link) {
      const updatedTitle = prompt("Edit Link Title:", item.caption);
      const updatedUrl = prompt("Edit URL:", item.image_url);
      if (updatedUrl !== null) {
        supabase.from('event_items').update({
          text: updatedTitle?.trim() || updatedUrl,
          content: updatedUrl.trim()
        }).eq('id', item.id).then(() => fetchAllData());
      }
      return;
    }
    setEditingItem(item);
    setEditCaption(item.caption === 'Outfit Image' || item.caption === 'Option Choice' ? '' : item.caption || '');
    setEditFile(null);
    setEditPreviewUrl(null);
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    setSavingEdit(true);

    try {
      let finalImageUrl = editingItem.image_url;
      if (editFile) {
        const { data: uploadData, error: uploadError } = await supabase.storage.from('task-images').upload(`outfits/${Date.now()}_${editFile.name.replace(/[^a-zA-Z0-9.]/g, '')}`, editFile);
        if (uploadError) { alert(`Image Upload Failed: ${uploadError.message}`); setSavingEdit(false); return; }
        if (uploadData?.path) {
          finalImageUrl = supabase.storage.from('task-images').getPublicUrl(uploadData.path).data.publicUrl;
        }
      }
      const defaultText = editingItem.category === 'Shopping' ? 'Option Choice' : 'Outfit Image';
      
      const { error } = await supabase.from('event_items').update({
        text: editCaption.trim() || defaultText,
        content: finalImageUrl
      }).eq('id', editingItem.id);

      if (error) alert(`Update Error: ${error.message}`);
      else { setEditingItem(null); fetchAllData(); }
    } catch (err) { alert("Failed to save changes."); }
    setSavingEdit(false);
  };

  // --- TABS AND RENDERING LOGIC ---
  // We merge dbTabs with customTabs so empty tabs stick around until page refresh
  let dbTabs = Array.from(new Set(outfits.map(o => o.category)));
  let allTabs = Array.from(new Set([...dbTabs, ...customTabs]));
  if (!allTabs.includes("Ideas")) allTabs.unshift("Ideas");
  if (optionTabs.length > 0 && !allTabs.includes("Shopping")) allTabs.push("Shopping");

  allTabs.sort((a, b) => {
    if (a === "Ideas") return -1;
    if (b === "Ideas") return 1;
    if (a === "Shopping") return 1;
    if (b === "Shopping") return -1;
    return a.localeCompare(b);
  });

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto space-y-8">
      
      {/* Page Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-emerald-900 flex items-center gap-3">
          <DressIcon className="w-8 h-8 text-emerald-700" />
          All Outfits & Shopping Masterlist
        </h1>
        <p className="text-slate-500 mt-2">
          Manage all planned outfits, ideas, and shopping options globally.
        </p>
      </div>

      {/* Dynamic Tabs Section */}
      {!loading && (
        <div className="flex items-center overflow-x-auto hide-scrollbar border-b border-slate-200 gap-3 px-1 pt-2">
          {allTabs.map((tab) => {
            const count = outfits.filter(o => o.category.toLowerCase() === tab.toLowerCase()).length;
            const isActive = activeTab === tab;
            const isCoreTab = tab === 'Ideas' || tab === 'Shopping';

            return (
              <div key={tab} className="relative flex items-center group">
                {editingTabName === tab ? (
                  <div className="flex items-center gap-1 bg-white border border-emerald-400 rounded-lg px-2 py-1 mb-2 z-10 shadow-sm">
                    <input
                      type="text"
                      value={editTabInput}
                      onChange={(e) => setEditTabInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleRenameTab(tab)}
                      className="text-sm outline-none w-24 bg-transparent text-slate-800"
                      autoFocus
                    />
                    <button onClick={() => handleRenameTab(tab)} className="text-emerald-600 hover:text-emerald-700 p-1 bg-emerald-50 rounded-md">
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setEditingTabName(null)} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-md">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className={`flex items-center pb-3 border-b-2 transition-colors ${isActive ? 'border-emerald-600' : 'border-transparent'}`} style={{ marginBottom: '-2px' }}>
                    <button
                      onClick={() => setActiveTab(tab)}
                      className={`whitespace-nowrap font-medium text-sm transition-colors flex items-center gap-2 outline-none ${
                        isActive ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {tab === 'Shopping' ? <ShoppingBag className="w-4 h-4 mb-0.5" /> : null}
                      {tab}
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {count}
                      </span>
                    </button>

                    {/* Edit & Delete Icons for Custom Tabs */}
                    {!isCoreTab && (
                      <div className={`flex items-center gap-0.5 ml-2 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingTabName(tab); setEditTabInput(tab); }}
                          className="p-1 rounded text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="Rename Tab"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteTabRequest(tab, e)}
                          className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Delete Tab"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          
          <Button variant="ghost" size="sm" onClick={handleAddOutfitTab} className="mb-3 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 ml-2 shadow-sm border border-emerald-100">
            <Plus className="w-4 h-4 mr-1"/> Add Category Tab
          </Button>
        </div>
      )}

      {/* Main Content */}
      {loading ? (
        <div className="py-20 text-center text-emerald-600 font-medium animate-pulse">Loading workspace...</div>
      ) : activeTab === 'Shopping' ? (
        <div className="space-y-12">
          {optionTabs.length === 0 ? (
            <div className="text-center py-16 text-slate-400 border-2 border-dashed rounded-2xl bg-slate-50">
              <FolderPlus className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              No shopping categories yet. Create one to start adding items!
            </div>
          ) : (
            optionTabs.map(tab => (
              <EventOutfitsSection 
                key={tab.id}
                eventName={tab.label}
                tabId={tab.id}
                outfits={outfits.filter(o => o.category === 'Shopping' && o.shopping_tab_id === tab.id)}
                activeGlobalTab={activeTab}
                onImageClick={setSelectedImage}
                onEdit={openEditModal}
                onDelete={handleItemDeleteRequest}
                onAddImage={handleAddImage}
                onAddLink={handleAddLink}
                onDeleteSection={handleSectionDeleteRequest}
              />
            ))
          )}
          <div className="flex justify-center mt-6">
            <Button onClick={handleAddShoppingCategory} className="bg-indigo-600 hover:bg-indigo-700 shadow-sm">
              <Plus className="w-4 h-4 mr-2" /> Add New Shopping Category
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-12">
          {(() => {
            const currentTabOutfits = outfits.filter(o => o.category.toLowerCase() === activeTab.toLowerCase());
            
            // Combine items already in DB with locally triggered empty sections
            const eventsForThisTab = Array.from(new Set([
              ...currentTabOutfits.map(o => o.event_name),
              ...(selectedTabEvents[activeTab] || [])
            ]));

            // Sort logic: PREDEFINED_EVENTS first chronologically, then alphabetical
            eventsForThisTab.sort((a, b) => {
              const indexA = PREDEFINED_EVENTS.indexOf(a);
              const indexB = PREDEFINED_EVENTS.indexOf(b);
              if (indexA !== -1 && indexB !== -1) return indexA - indexB;
              if (indexA !== -1) return -1;
              if (indexB !== -1) return 1;
              return a.localeCompare(b);
            });

            const availableEvents = PREDEFINED_EVENTS.filter(e => !eventsForThisTab.includes(e));

            return (
              <>
                {eventsForThisTab.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 border-2 border-dashed rounded-2xl bg-slate-50">
                    <FolderPlus className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                    No events added for "{activeTab}" yet. Select an event below to start building!
                  </div>
                ) : (
                  eventsForThisTab.map(ev => (
                    <EventOutfitsSection 
                      key={ev}
                      eventName={ev}
                      outfits={currentTabOutfits.filter(o => o.event_name.toLowerCase() === ev.toLowerCase())}
                      activeGlobalTab={activeTab}
                      onImageClick={setSelectedImage}
                      onEdit={openEditModal}
                      onDelete={handleItemDeleteRequest}
                      onAddImage={handleAddImage}
                      onAddLink={handleAddLink}
                      onDeleteSection={handleSectionDeleteRequest}
                    />
                  ))
                )}

                {/* Fixed Predefined Event Dropdown */}
                <div className="flex justify-center mt-6">
                  {availableEvents.length > 0 ? (
                    <div className="relative group shadow-sm rounded-lg hover:shadow transition-all">
                      <select 
                        className="appearance-none bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2.5 pl-5 pr-10 rounded-lg outline-none cursor-pointer"
                        onChange={(e) => {
                          if (e.target.value) {
                            const val = e.target.value;
                            setSelectedTabEvents(prev => ({
                              ...prev,
                              [activeTab]: [...(prev[activeTab] || []), val]
                            }));
                            e.target.value = "";
                          }
                        }}
                        defaultValue=""
                      >
                        <option value="" disabled>+ Add Predefined Event Section</option>
                        {availableEvents.map(ev => (
                          <option key={ev} value={ev} className="bg-white text-slate-800 font-medium">
                            {ev}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-emerald-100">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 italic">All standard event sections added.</p>
                  )}
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* --- EDIT CAPTION & IMAGE MODAL --- */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Item Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 my-2">
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Image Preview</label>
              <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50 h-48 flex items-center justify-center">
                <img src={editPreviewUrl || editingItem?.image_url} alt="Edit preview" className="h-full w-full object-contain" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Replace Image File</label>
              <input type="file" ref={editFileInputRef} accept="image/*" className="hidden" onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    setEditFile(file);
                    setEditPreviewUrl(URL.createObjectURL(file));
                  }
                }} />
              <Button variant="outline" onClick={() => editFileInputRef.current?.click()} className="w-full text-xs text-slate-600">
                <ImageIcon className="w-3.5 h-3.5 mr-2" />
                {editFile ? editFile.name : "Choose New Image"}
              </Button>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Caption / Title</label>
              <input type="text" placeholder="Enter caption..." value={editCaption} onChange={(e) => setEditCaption(e.target.value)} className="w-full border p-2 rounded-lg outline-none text-sm focus:border-emerald-500" />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="ghost" onClick={() => setEditingItem(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={savingEdit} className="bg-emerald-600 hover:bg-emerald-700">
              {savingEdit ? <Loader2 className="animate-spin w-4 h-4 mr-1" /> : null} Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- CONFIRM ITEM DELETE MODAL --- */}
      <Dialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm text-slate-600">Are you sure you want to delete this item? This action cannot be undone.</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setItemToDelete(null)}>Cancel</Button>
            <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={confirmItemDelete}>
              Delete Item
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- CONFIRM SECTION DELETE MODAL --- */}
      <Dialog open={!!sectionToDelete} onOpenChange={(open) => !open && setSectionToDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Section Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm text-slate-600">
              Are you sure you want to delete the <strong>"{sectionToDelete?.name}"</strong> section and all its contents? This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setSectionToDelete(null)}>Cancel</Button>
            <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={confirmSectionDelete}>
              Delete Section
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- CONFIRM TAB DELETE MODAL --- */}
      <Dialog open={!!tabToDelete} onOpenChange={(open) => !open && setTabToDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Tab Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm text-slate-600">
              Are you sure you want to delete the <strong>"{tabToDelete}"</strong> tab? All items inside this tab will be permanently deleted.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setTabToDelete(null)}>Cancel</Button>
            <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={confirmTabDelete}>
              Delete Tab
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- FULL SCREEN PHOTO LIGHTBOX --- */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-2 bg-black/95 border-none flex flex-col items-center justify-center sm:rounded-2xl">
          <DialogTitle className="sr-only">Full Screen Outfit View</DialogTitle>
          {selectedImage && (
            <div className="relative w-full max-h-[85vh] flex flex-col items-center justify-center">
              <img src={selectedImage.image_url} alt={selectedImage.caption} className="max-w-full max-h-[75vh] object-contain rounded-lg" />
              {selectedImage.caption && selectedImage.caption !== 'Outfit Image' && selectedImage.caption !== 'Option Choice' && (
                <p className="mt-3 text-sm text-slate-200 text-center font-medium bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-sm max-w-md truncate">
                  {selectedImage.caption}
                </p>
              )}
              <button onClick={() => setSelectedImage(null)} className="absolute -top-3 -right-3 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 backdrop-blur-md transition-colors" title="Close Preview">
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}