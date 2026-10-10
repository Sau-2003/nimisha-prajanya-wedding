"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from '@/lib/supabase';
import Link from "next/link";
import { 
  Flame, Check, RotateCcw, Trash2, Calendar, 
  User, Image as ImageIcon, Music, Play, 
  ShoppingCart, PackageCheck, Loader2, Filter, Plus, Pencil,
  Users, ArrowUpDown
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { defaultEvents } from "@/components//layout/leftsidebar";

// --- TEAM MEMBERS HOOK ---
const DEFAULT_TEAM_MEMBERS = ["Manish", "Vini", "Saumya", "Nimisha"];

export function useTeamMembers() {
  const [teamMembers, setTeamMembers] = useState<string[]>(DEFAULT_TEAM_MEMBERS);
  const [loadingTeam, setLoadingTeam] = useState(true);

  const fetchTeamMembers = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('team_members').select('*');
      if (error) {
        setTeamMembers(DEFAULT_TEAM_MEMBERS);
        setLoadingTeam(false);
        return;
      }
      if (data && data.length > 0) {
        setTeamMembers(data.map((row: any) => row.name));
      } else {
        for (const name of DEFAULT_TEAM_MEMBERS) {
          await supabase.from('team_members').insert([{ name }]);
        }
        setTeamMembers(DEFAULT_TEAM_MEMBERS);
      }
    } catch (err) {
      console.error(err);
    }
    setLoadingTeam(false);
  }, []);

  useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);

  return { teamMembers, loadingTeam };
}

const slugify = (text: string) => text.trim().toLowerCase().replace(/\s+/g, '-');

const guessMediaType = (url?: string, dbType?: string) => {
  if (dbType && dbType !== 'image') return dbType; 
  if (!url) return 'image';
  
  const cleanUrl = url.split('?')[0].toLowerCase();
  if (cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.webm') || cleanUrl.endsWith('.mov')) return 'video';
  if (cleanUrl.endsWith('.mp3') || cleanUrl.endsWith('.wav') || cleanUrl.endsWith('.m4a') || cleanUrl.endsWith('.aac') || cleanUrl.endsWith('.ogg')) return 'audio';
  
  return 'image';
};

const linkifyHtml = (htmlText: string) => {
  if (!htmlText) return "";
  const urlRegex = /(?<!href="|src=")(https?:\/\/[^\s<]+)/g;
  return htmlText.replace(urlRegex, '<a href="\$1" target="_blank" rel="noopener noreferrer" class="text-emerald-600 font-medium hover:underline break-all">\$1</a>');
};

const formatEventName = (rawName: string) => {
  if (!rawName || rawName === 'general') return "General";
  return rawName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

const formatDate = (dateString: string) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const isOverdue = (dateString: string | null) => {
  if (!dateString) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(dateString);
  dueDate.setHours(0, 0, 0, 0);
  return dueDate < today;
};

type GlobalPujaItem = {
  id: string;
  event_name: string;
  category: 'pujaItems' | 'pujaItemsBrought';
  content: string;
  dueDate?: string;
  assignedTo?: string;
  imageUrl?: string;
  mediaType?: string;
  created_at: string;
};

export default function GlobalPujaPage() {
  const [items, setItems] = useState<GlobalPujaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'needed' | 'brought'>('needed');
  
  // View states
  const [selectedEvent, setSelectedEvent] = useState<string>('all'); 
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all'); 
  const [sortBy, setSortBy] = useState<'newest' | 'dueDate' | 'assignee' | 'event'>('newest'); 
  
  const [expandedMedia, setExpandedMedia] = useState<{ url: string, type: string } | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Form States 
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null); 
  
  const [selectedEventType, setSelectedEventType] = useState('general');
  const [customEventName, setCustomEventName] = useState('');
  
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState<'pujaItems' | 'pujaItemsBrought'>('pujaItems');
  const [formDueDate, setFormDueDate] = useState('');
  const [formAssignedTo, setFormAssignedTo] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');

  // Use the team members hook
  const { teamMembers } = useTeamMembers();

  const fetchGlobalPujaItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('event_items')
      .select('*')
      .in('category', ['pujaItems', 'pujaItemsBrought'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching puja items:", error);
    } else {
      const formattedData = (data || []).map(row => ({
        id: row.id,
        event_name: row.event_name,
        category: row.category,
        content: row.content || "",
        dueDate: row.due_date || undefined,
        assignedTo: row.assigned_to || undefined,
        imageUrl: row.image_url || undefined,
        mediaType: row.media_type || undefined,
        created_at: row.created_at || "",
      })) as GlobalPujaItem[];
      
      setItems(formattedData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGlobalPujaItems();
  }, []);

  const moveItem = async (id: string, newCategory: 'pujaItems' | 'pujaItemsBrought') => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, category: newCategory } : item));
    
    const { error } = await supabase
      .from('event_items')
      .update({ category: newCategory })
      .eq('id', id);

    if (error) {
      alert("Failed to update item status.");
      fetchGlobalPujaItems();
    }
  };

  const confirmItemDelete = async () => {
    if (!itemToDelete) return;
    
    setItems(prev => prev.filter(item => item.id !== itemToDelete));
    const targetId = itemToDelete;
    setItemToDelete(null);

    const { error } = await supabase
      .from('event_items')
      .delete()
      .eq('id', targetId);

    if (error) {
      alert("Failed to delete item.");
      fetchGlobalPujaItems();
    }
  };

  const resetForm = () => {
    setEditingItemId(null);
    setSelectedEventType('general');
    setCustomEventName('');
    setFormContent('');
    setFormDueDate('');
    setFormAssignedTo('');
    setFormImageUrl('');
    setIsFormDialogOpen(false);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const eventToUse = selectedEventType === 'custom' ? customEventName : selectedEventType;
    if (!eventToUse.trim() || !formContent.trim()) return;

    setIsSaving(true);
    
    const formattedEventName = slugify(eventToUse);
    
    const payload: any = {
      event_name: formattedEventName,
      category: formCategory,
      content: formContent.trim(),
      due_date: formDueDate || null,
      assigned_to: formAssignedTo.trim() || null,
      image_url: formImageUrl.trim() || null
    };

    let response;
    
    if (editingItemId) {
      response = await supabase
        .from('event_items')
        .update(payload)
        .eq('id', editingItemId)
        .select();
    } else {
      response = await supabase
        .from('event_items')
        .insert([payload])
        .select();
    }

    const { data, error } = response;

    if (error) {
      alert(`Database Error: ${error.message}`);
      console.error("Supabase error details:", error);
    } else if (data && data.length > 0) {
      const savedItem: GlobalPujaItem = {
        id: data[0].id,
        event_name: data[0].event_name,
        category: data[0].category,
        content: data[0].content || "",
        dueDate: data[0].due_date || undefined,
        assignedTo: data[0].assigned_to || undefined,
        imageUrl: data[0].image_url || undefined,
        mediaType: undefined, 
        created_at: data[0].created_at || new Date().toISOString(),
      };
      
      if (editingItemId) {
        setItems(prev => prev.map(item => item.id === editingItemId ? savedItem : item));
      } else {
        setItems(prev => [savedItem, ...prev]);
      }
      
      resetForm();
    }
    
    setIsSaving(false);
  };

  const openAddDialog = () => {
    resetForm();
    if (selectedEvent === 'all') {
      setSelectedEventType('general');
    } else {
      const isDefault = defaultEvents.some(e => slugify(e.name) === selectedEvent);
      if (isDefault) {
        const originalEvt = defaultEvents.find(e => slugify(e.name) === selectedEvent);
        setSelectedEventType(originalEvt?.name || selectedEvent);
      } else if (selectedEvent === 'general') {
        setSelectedEventType('general');
      } else {
        setSelectedEventType('custom');
        setCustomEventName(selectedEvent);
      }
    }
    
    // Auto-select assignee if filtered
    if (selectedAssignee !== 'all' && selectedAssignee !== 'unassigned') {
      setFormAssignedTo(selectedAssignee);
    }

    setFormCategory(activeTab === 'needed' ? 'pujaItems' : 'pujaItemsBrought');
    setIsFormDialogOpen(true);
  };

  const openEditDialog = (item: GlobalPujaItem) => {
    setEditingItemId(item.id);
    
    const isDefault = defaultEvents.some(e => slugify(e.name) === item.event_name);
    if (isDefault) {
      const originalEvt = defaultEvents.find(e => slugify(e.name) === item.event_name);
      setSelectedEventType(originalEvt?.name || item.event_name);
    } else if (item.event_name === 'general') {
      setSelectedEventType('general');
    } else {
      setSelectedEventType('custom');
      setCustomEventName(formatEventName(item.event_name));
    }

    setFormCategory(item.category);
    setFormContent(item.content);
    setFormDueDate(item.dueDate || '');
    setFormAssignedTo(item.assignedTo || '');
    setFormImageUrl(item.imageUrl || '');
    
    setIsFormDialogOpen(true);
  };

  const uniqueEvents = Array.from(new Set(items.map(item => item.event_name))).sort();

  // 1. FILTER ITEMS
  let processedItems = selectedEvent === 'all' 
    ? [...items] 
    : items.filter(item => item.event_name === selectedEvent);

  if (selectedAssignee !== 'all') {
    if (selectedAssignee === 'unassigned') {
      processedItems = processedItems.filter(item => !item.assignedTo);
    } else {
      processedItems = processedItems.filter(item => item.assignedTo === selectedAssignee);
    }
  }

  // 2. SORT ITEMS
  processedItems.sort((a, b) => {
    if (sortBy === 'dueDate') {
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else if (sortBy === 'assignee') {
      const nameA = a.assignedTo?.toLowerCase() || 'zzzz'; 
      const nameB = b.assignedTo?.toLowerCase() || 'zzzz';
      return nameA.localeCompare(nameB);
    } else if (sortBy === 'event') {
      return a.event_name.localeCompare(b.event_name);
    } else {
      // Default: newest
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const neededList = processedItems.filter(i => i.category === 'pujaItems');
  const broughtList = processedItems.filter(i => i.category === 'pujaItemsBrought');
  const displayList = activeTab === 'needed' ? neededList : broughtList;

  return (
    <div className="min-h-screen p-4 md:p-12 max-w-5xl mx-auto">
      
      {/* Header section */}
      <div className="mb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="shrink-0 overflow-hidden">
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-emerald-900 flex items-center gap-2.5">
            <Flame className="w-6 h-6 md:w-8 md:h-8 text-emerald-600 shrink-0" />
            <span className="truncate">Master Puja List</span>
          </h1>
          {/* Forced Single Line Subtitle */}
          <p className="text-slate-500 text-[11px] md:text-sm mt-1 md:mt-2 whitespace-nowrap overflow-hidden text-ellipsis">
            Consolidated view of all puja requirements across your events.
          </p>
        </div>

        {/* Compact Filters & Sort */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Event Filter */}
          <div className="flex items-center gap-1.5 bg-white px-2 py-1.5 rounded-lg border border-slate-200 shadow-sm min-w-0">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-700 outline-none cursor-pointer focus:ring-0 truncate w-full"
            >
              <option value="all">All Events</option>
              {uniqueEvents.map(eventName => (
                <option key={eventName} value={eventName}>
                  {formatEventName(eventName)}
                </option>
              ))}
            </select>
          </div>

          {/* Assignee Filter */}
          <div className="flex items-center gap-1.5 bg-white px-2 py-1.5 rounded-lg border border-slate-200 shadow-sm min-w-0">
            <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-700 outline-none cursor-pointer focus:ring-0 truncate w-full"
            >
              <option value="all">All People</option>
              <option value="unassigned">Unassigned</option>
              {teamMembers.map(member => (
                <option key={member} value={member}>{member}</option>
              ))}
            </select>
          </div>

          {/* Sort Menu */}
          <div className="flex items-center gap-1.5 bg-white px-2 py-1.5 rounded-lg border border-slate-200 shadow-sm min-w-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs font-medium text-slate-700 outline-none cursor-pointer focus:ring-0 truncate w-full"
            >
              <option value="newest">Newest</option>
              <option value="dueDate">Due Date</option>
              <option value="assignee">Assignee</option>
              <option value="event">Event</option>
            </select>
          </div>

          <Button 
            onClick={openAddDialog}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm flex items-center gap-1.5 py-1.5 px-3 h-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Add</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('needed')}
            className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === 'needed' 
                ? 'border-orange-500 text-orange-700 bg-orange-50/40' 
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <ShoppingCart className="w-4 h-4 text-orange-500" />
            To Buy ({neededList.length})
          </button>
          <button
            onClick={() => setActiveTab('brought')}
            className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === 'brought' 
                ? 'border-emerald-500 text-emerald-700 bg-emerald-50/40' 
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <PackageCheck className="w-4 h-4 text-emerald-500" />
            Brought ({broughtList.length})
          </button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 bg-slate-50/50 min-h-[400px]">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
            </div>
          ) : displayList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400">
              <Flame className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-sm">No items found matching your filters.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayList.map(item => {
                const overdue = isOverdue(item.dueDate || null) && activeTab === 'needed';
                const itemMediaType = guessMediaType(item.imageUrl, item.mediaType);
                const isCompleted = activeTab === 'brought';

                return (
                  <div 
                    key={item.id} 
                    className={`flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 border p-4 rounded-xl bg-white shadow-sm transition-colors ${overdue ? 'border-red-300 bg-red-50/30' : 'border-slate-200'}`}
                  >
                    <div className="flex-1 min-w-0">
                      
                      {/* Metdata Row */}
                      <div className="flex flex-wrap justify-between items-center gap-2 mb-2.5">
                        
                        {item.event_name === 'general' ? (
                          <span className="bg-slate-200 text-slate-600 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors border border-slate-300">
                            General
                          </span>
                        ) : (
                          <Link href={`/events/${item.event_name.toLowerCase().replace(/\s+/g, '-')}`} className="bg-orange-100/80 hover:bg-orange-200 text-orange-700 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors border border-orange-200">
                            {formatEventName(item.event_name)}
                          </Link>
                        )}
                        
                        <div className="flex items-center gap-2">
                          {item.assignedTo && (
                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1">
                              <User className="w-3 h-3 text-orange-500" /> {item.assignedTo}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">
                            {formatDate(item.created_at)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Item Content */}
                      <div 
                        className={`text-sm whitespace-pre-wrap break-words [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic [&_strike]:line-through [&_s]:line-through [&_a]:text-blue-600 [&_a]:underline hover:[&_a]:text-blue-800 ${isCompleted ? 'line-through text-slate-400' : 'text-slate-800 font-medium'}`}
                        dangerouslySetInnerHTML={{ __html: linkifyHtml(item.content) }}
                        onClick={(e) => {
                          if ((e.target as HTMLElement).tagName.toLowerCase() === 'a') {
                            e.stopPropagation();
                          }
                        }}
                      />
                      
                      {item.dueDate && (
                        <p className={`text-xs font-medium flex items-center gap-1 mt-2 ${isCompleted ? 'text-slate-400' : overdue ? 'text-red-600' : 'text-orange-600'}`}>
                          <Calendar className={`w-3 h-3 ${isCompleted ? 'text-slate-400' : overdue ? 'text-red-500' : 'text-orange-500'}`} /> 
                          {overdue ? "Overdue: " : "Needed by "} {formatDate(item.dueDate)}
                        </p>
                      )}

                      {/* Media Display */}
                      {item.imageUrl && (
                        <div 
                          className="mt-3 overflow-hidden w-full max-w-[200px] rounded-lg border border-slate-200 shadow-sm relative cursor-pointer group hover:opacity-90 transition-opacity bg-slate-50 flex items-center justify-center"
                          onClick={() => setExpandedMedia({ url: item.imageUrl!, type: itemMediaType })}
                        >
                          {itemMediaType === 'image' && (
                            <>
                              <img src={item.imageUrl} alt="attached media" className="w-full h-auto object-cover max-h-[120px]" />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center transition-colors">
                                <ImageIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 drop-shadow-md" />
                              </div>
                            </>
                          )}
                          
                          {itemMediaType === 'video' && (
                            <>
                              <video src={`${item.imageUrl}#t=0.1`} className="w-full h-auto max-h-[120px] object-cover bg-black" muted />
                              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 flex items-center justify-center transition-colors">
                                <Play className="w-8 h-8 text-white drop-shadow-md" />
                              </div>
                            </>
                          )}

                          {itemMediaType === 'audio' && (
                            <div className="w-full h-20 flex items-center justify-center">
                              <Play className="w-8 h-8 text-slate-400 group-hover:scale-110 transition-transform" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1.5 shrink-0 sm:mt-8">
                      {activeTab === 'needed' ? (
                        <button onClick={() => moveItem(item.id, 'pujaItemsBrought')} className="p-2 border border-emerald-100 text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors shadow-sm" title="Mark as Brought">
                          <Check className="w-4 h-4" />
                        </button>
                      ) : (
                        <button onClick={() => moveItem(item.id, 'pujaItems')} className="p-2 border border-amber-100 text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors shadow-sm" title="Move back to To Buy">
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}

                      <button onClick={() => openEditDialog(item)} className="p-2 border border-blue-100 text-blue-500 bg-white rounded-lg hover:bg-blue-50 transition-colors shadow-sm" title="Edit">
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button onClick={() => setItemToDelete(item.id)} className="p-2 border border-red-100 text-red-500 bg-white rounded-lg hover:bg-red-50 transition-colors shadow-sm" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Item Dialog */}
      <Dialog 
        open={isFormDialogOpen} 
        onOpenChange={(open) => {
          if (!open) resetForm();
          setIsFormDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItemId ? "Edit Puja Item" : "Add Puja Item"}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSaveItem} className="space-y-4 mt-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Event *</label>
              <select 
                value={selectedEventType}
                onChange={(e) => setSelectedEventType(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="general">General (Not related to a specific event)</option>
                <optgroup label="Wedding Events">
                  {defaultEvents.map(evt => (
                    <option key={evt.name} value={evt.name}>{evt.name}</option>
                  ))}
                </optgroup>
                <option value="custom">Other / Custom Event...</option>
              </select>

              {selectedEventType === 'custom' && (
                <input 
                  type="text" 
                  required
                  value={customEventName}
                  onChange={(e) => setCustomEventName(e.target.value)}
                  placeholder="Enter custom event name"
                  className="w-full mt-2 p-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 animate-in fade-in slide-in-from-top-2 duration-200"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Item Description *</label>
              <textarea 
                required
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder="What do you need?"
                className="w-full p-2.5 border border-slate-200 rounded-lg text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select 
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as 'pujaItems' | 'pujaItemsBrought')}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="pujaItems">To Buy (Needed)</option>
                  <option value="pujaItemsBrought">Already Brought</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                <input 
                  type="date" 
                  value={formDueDate}
                  onChange={(e) => setFormDueDate(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Assign To</label>
                <select 
                  value={formAssignedTo}
                  onChange={(e) => setFormAssignedTo(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Unassigned</option>
                  {teamMembers.map(member => (
                    <option key={member} value={member}>{member}</option>
                  ))}
                  
                  {formAssignedTo && !teamMembers.includes(formAssignedTo) && (
                    <option value={formAssignedTo}>{formAssignedTo} (Legacy)</option>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Image/Media URL</label>
                <input 
                  type="url" 
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button type="button" variant="ghost" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[100px]">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Item"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Media Expansion Dialog */}
      <Dialog open={!!expandedMedia} onOpenChange={(open) => !open && setExpandedMedia(null)}>
        <DialogContent 
          className="max-w-screen-lg w-[90vw] bg-transparent border-none shadow-none flex items-center justify-center p-0 [&>button]:bg-black/50 [&>button]:text-white [&>button]:hover:bg-black/80 [&>button]:rounded-full [&>button]:p-2 focus-visible:outline-none"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Media Preview</DialogTitle>
          </DialogHeader>
          
          {expandedMedia?.type === 'image' && (
            <img 
              src={expandedMedia.url} 
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" 
              alt="Expanded preview" 
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                setExpandedMedia(null);
              }}
            />
          )}

          {expandedMedia?.type === 'video' && (
            <video 
              src={expandedMedia.url} 
              controls 
              autoPlay 
              className="max-w-full max-h-[85vh] rounded-lg shadow-2xl bg-black" 
            />
          )}

          {expandedMedia?.type === 'audio' && (
            <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-6 w-full max-w-md">
              <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center">
                <Music className="w-12 h-12 text-orange-600" />
              </div>
              <audio src={expandedMedia.url} controls autoPlay className="w-full" />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm text-slate-600">Are you sure you want to delete this puja item? This action will remove it globally across the event.</p>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="ghost" onClick={() => setItemToDelete(null)}>Cancel</Button>
            <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={confirmItemDelete}>
              Delete Item
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}