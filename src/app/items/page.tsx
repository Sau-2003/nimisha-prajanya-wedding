"use client";

import { useState, useEffect } from "react";
import { supabase } from '@/lib/supabase';
import Link from "next/link";
import { 
  PaperBag, Check, RotateCcw, Trash2, Calendar, 
  User, Image as ImageIcon, Music, Play, 
  ShoppingCart, PackageCheck, ArrowLeft, Loader2,
  ShoppingBag
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
  return htmlText.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-emerald-600 font-medium hover:underline break-all">$1</a>');
};

const formatEventName = (rawName: string) => {
  if (!rawName) return "Unknown Event";
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
  
  const [expandedMedia, setExpandedMedia] = useState<{ url: string, type: string } | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const fetchGlobalPujaItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('event_items')
      .select('*')
      .in('category', ['pujaItems', 'pujaItemsBrought'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching itemsitems:", error);
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
    // Optimistic UI update
    setItems(prev => prev.map(item => item.id === id ? { ...item, category: newCategory } : item));
    
    const { error } = await supabase
      .from('event_items')
      .update({ category: newCategory })
      .eq('id', id);

    if (error) {
      alert("Failed to update item status.");
      fetchGlobalPujaItems(); // Revert on failure
    }
  };

  const confirmItemDelete = async () => {
    if (!itemToDelete) return;
    
    // Optimistic UI update
    setItems(prev => prev.filter(item => item.id !== itemToDelete));
    const targetId = itemToDelete;
    setItemToDelete(null);

    const { error } = await supabase
      .from('event_items')
      .delete()
      .eq('id', targetId);

    if (error) {
      alert("Failed to delete item.");
      fetchGlobalPujaItems(); // Revert on failure
    }
  };

  const neededList = items.filter(i => i.category === 'pujaItems');
  const broughtList = items.filter(i => i.category === 'pujaItemsBrought');
  const displayList = activeTab === 'needed' ? neededList : broughtList;

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">
      
      {/* Header section */}
      <div className="mb-8">
        {/* <Link href="/" className="inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </Link> */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-emerald-900 flex items-center gap-3">
            <PaperBag className="w-8 h-8 text-emerald-600" />
            Master Items List
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            All items consolidated across every event.
          </p>
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
              <PaperBag className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-sm">No items found in this list.</p>
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
                      
                      {/* Metdata Row (Event Name & Date) */}
                      <div className="flex flex-wrap justify-between items-center gap-2 mb-2.5">
                        <Link href={`/events/${item.event_name.toLowerCase().replace(/\s+/g, '-')}`} className="bg-orange-100/80 hover:bg-orange-200 text-orange-700 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors border border-orange-200">
                          {formatEventName(item.event_name)}
                        </Link>
                        
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
            <p className="text-sm text-slate-600">Are you sure you want to delete this itemsitem? This action will remove it globally across the event.</p>
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