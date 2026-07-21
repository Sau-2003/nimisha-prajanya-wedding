"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Image as ImageIcon, Calendar, Maximize2, X, Link as LinkIcon, ExternalLink } from "lucide-react";
import { DressIcon } from '@phosphor-icons/react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface ParsedOutfit {
  id: string;
  event_name: string;
  category: string; 
  caption: string;
  image_url: string;
  is_link: boolean;
}

// --- SUB-COMPONENT: Renders a single Event Section with its own Tabs ---
function EventOutfitsSection({ 
  eventName, 
  outfits, 
  onImageClick,
  activeGlobalTab
}: { 
  eventName: string; 
  outfits: ParsedOutfit[]; 
  onImageClick: (outfit: ParsedOutfit) => void;
  activeGlobalTab: string;
}) {
  const filteredOutfits = outfits.filter(
    (outfit) => outfit.category.toLowerCase() === activeGlobalTab.toLowerCase()
  );

  if (filteredOutfits.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
      
      {/* Event Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-slate-800 tracking-wide capitalize">
            {eventName}
          </h2>
        </div>
        <Badge variant="secondary" className="bg-slate-100 text-slate-500 hover:bg-slate-200 px-3 py-1 rounded-full text-sm font-medium">
          {filteredOutfits.length} {filteredOutfits.length === 1 ? 'Item' : 'Items'}
        </Badge>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
        {filteredOutfits.map((outfit) => {
          if (outfit.is_link) {
            return (
              <Card 
                key={outfit.id} 
                className="relative group p-4 border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between bg-emerald-50/30"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-emerald-700 font-semibold text-xs uppercase tracking-wide">
                    <LinkIcon className="w-3.5 h-3.5" /> Link Item
                  </div>
                  <a 
                    href={outfit.image_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-sm font-medium text-slate-800 hover:text-emerald-700 line-clamp-3 flex items-start gap-1 break-all"
                  >
                    {outfit.caption !== 'Outfit Image' ? outfit.caption : outfit.image_url}
                    <ExternalLink className="w-3 h-3 shrink-0 mt-0.5 text-slate-400" />
                  </a>
                </div>
              </Card>
            );
          }

          return (
            <Card 
              key={outfit.id} 
              onClick={() => onImageClick(outfit)}
              className="relative group p-2 overflow-hidden border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow flex flex-col justify-between bg-white"
            >
              <div>
                <div className="relative overflow-hidden rounded">
                  {outfit.image_url ? (
                    <img src={outfit.image_url} alt={outfit.caption} className="w-full h-56 object-cover rounded group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="flex flex-col items-center justify-center w-full h-56 bg-slate-50 text-slate-300 rounded">
                      <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                      <span className="text-xs font-medium uppercase tracking-wider">No Image</span>
                    </div>
                  )}
                  
                  {/* Full-Screen Overlay Hint */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white pointer-events-none">
                    <Maximize2 className="w-6 h-6" />
                  </div>
                </div>

                {/* Image Caption */}
                {(outfit.caption && outfit.caption !== 'Outfit Image') && (
                  <p className="mt-2 text-xs font-medium text-slate-700 truncate px-1" title={outfit.caption}>
                    {outfit.caption}
                  </p>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// --- MAIN PAGE COMPONENT ---
export default function AllOutfitsPage() {
  const [outfits, setOutfits] = useState<ParsedOutfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<ParsedOutfit | null>(null);
  const [activeTab, setActiveTab] = useState<string>("Ideas");

  // Fetch ALL outfits & links across ALL events from event_items table
  useEffect(() => {
    const fetchAllOutfits = async () => {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('event_items')
        .select('*')
        .or('category.like.outfit_%,category.like.outfit_link_%');
      
      if (error) {
        console.error("Error fetching outfits:", error);
      } else if (data) {
        const mappedData: ParsedOutfit[] = data.map((item: any) => {
          const isLink = item.category.startsWith('outfit_link_');
          const cleanCategory = item.category
            .replace('outfit_link_', '')
            .replace('outfit_', '');

          return {
            id: item.id,
            event_name: item.event_name,
            category: cleanCategory, 
            caption: item.text || (isLink ? "Link" : "Outfit Image"),
            image_url: item.content,
            is_link: isLink
          };
        });
        
        setOutfits(mappedData);

        const uniqueTabs = Array.from(new Set(mappedData.map(o => o.category)));
        if (uniqueTabs.length > 0 && !uniqueTabs.includes("Ideas") && !uniqueTabs.includes(activeTab)) {
          setActiveTab(uniqueTabs[0]);
        }
      }
      setLoading(false);
    };

    fetchAllOutfits();
  }, []);

  const dynamicTabs = Array.from(new Set(outfits.map(o => o.category)));

  const groupedByEvent = outfits.reduce((acc, outfit) => {
    const eventName = outfit.event_name ? (outfit.event_name.charAt(0).toUpperCase() + outfit.event_name.slice(1)) : "General";
    if (!acc[eventName]) acc[eventName] = [];
    acc[eventName].push(outfit);
    return acc;
  }, {} as Record<string, ParsedOutfit[]>);

  const sortedEvents = Object.keys(groupedByEvent).sort();
  const hasOutfitsInActiveTab = outfits.some(o => o.category.toLowerCase() === activeTab.toLowerCase());

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto space-y-8">
      
      {/* Page Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-emerald-900 flex items-center gap-3">
          <DressIcon className="w-8 h-8 text-emerald-700" />
          All Outfits Masterlist
        </h1>
        <p className="text-slate-500 mt-2">
          View and manage all planned outfits and links grouped by event.
        </p>
      </div>

      {/* Dynamic Tabs Section */}
      {!loading && dynamicTabs.length > 0 && (
        <div className="flex overflow-x-auto hide-scrollbar border-b border-slate-200 pb-px gap-6">
          {dynamicTabs.map((tab) => {
            const count = outfits.filter(o => o.category.toLowerCase() === tab.toLowerCase()).length;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap pb-3 font-medium text-sm transition-colors relative flex items-center gap-2 ${
                  activeTab === tab 
                    ? 'text-emerald-700' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab}
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === tab 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  {count}
                </span>
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600 rounded-t-full" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Main Content */}
      {loading ? (
        <div className="py-20 text-center text-emerald-600 font-medium animate-pulse">Loading outfits & links...</div>
      ) : sortedEvents.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
          <p className="text-slate-400 italic">No outfits or links have been added to any event yet.</p>
        </div>
      ) : !hasOutfitsInActiveTab ? (
         <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
           <p className="text-slate-400 italic">No items found for "{activeTab}" across any events.</p>
         </div>
      ) : (
        <div className="space-y-12">
          {sortedEvents.map((eventName) => (
            <EventOutfitsSection 
              key={eventName}
              eventName={eventName}
              outfits={groupedByEvent[eventName]}
              onImageClick={setSelectedImage}
              activeGlobalTab={activeTab}
            />
          ))}
        </div>
      )}

      {/* --- FULL SCREEN PHOTO LIGHTBOX --- */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-2 bg-black/95 border-none flex flex-col items-center justify-center sm:rounded-2xl">
          <DialogTitle className="sr-only">Full Screen Outfit View</DialogTitle>
          {selectedImage && (
            <div className="relative w-full max-h-[85vh] flex flex-col items-center justify-center">
              <img 
                src={selectedImage.image_url} 
                alt={selectedImage.caption} 
                className="max-w-full max-h-[75vh] object-contain rounded-lg" 
              />
              
              {selectedImage.caption && selectedImage.caption !== 'Outfit Image' && (
                <p className="mt-3 text-sm text-slate-200 text-center font-medium bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-sm max-w-md truncate">
                  {selectedImage.caption}
                </p>
              )}

              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute -top-3 -right-3 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 backdrop-blur-md transition-colors"
                title="Close Preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
    </div>
  );
}