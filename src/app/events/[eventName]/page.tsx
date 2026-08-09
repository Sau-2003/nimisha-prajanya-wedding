"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from '@/lib/supabase';
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  ClipboardList, CheckCircle2, ShoppingBag, Flame, 
  Gamepad2, Store, Lightbulb, Shirt, IndianRupee, 
  ExternalLink, Plus, Trash2, Check, RotateCcw, 
  Pencil, X, Calendar, Image as ImageIcon, User, ChevronDown,
  Bold, Italic, Strikethrough, Video, AudioLines, Loader2,
  Film, Music
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEventItems, CategoryId, WorkspaceItem } from '@/hooks/useEventItems';
import { useTeamMembers } from '@/hooks/useTeamMembers';

const BUCKET_NAME = "event-media";

// --- HELPER: SMARTER MEDIA DETECTION ---
// Automatically detects video/audio from the URL if the database forgets what type it is
const guessMediaType = (url?: string, dbType?: string) => {
  if (dbType && dbType !== 'image') return dbType; 
  if (!url) return 'image';
  
  const cleanUrl = url.split('?')[0].toLowerCase();
  if (cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.webm') || cleanUrl.endsWith('.mov')) return 'video';
  if (cleanUrl.endsWith('.mp3') || cleanUrl.endsWith('.wav') || cleanUrl.endsWith('.m4a') || cleanUrl.endsWith('.aac') || cleanUrl.endsWith('.ogg')) return 'audio';
  
  return 'image';
};

// --- FLOATING TEXT FORMATTING TOOLBAR ---
function FloatingToolbar() {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setPosition(null);
        return;
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      let node = selection.anchorNode as Node | null;
      let isEditable = false;
      while (node && node !== document.body) {
        if (node.nodeType === 1 && (node as HTMLElement).getAttribute('contenteditable') === 'true') {
          isEditable = true;
          break;
        }
        node = node.parentNode;
      }

      if (isEditable && rect.width > 0) {
        setPosition({
          top: rect.top - 44, 
          left: rect.left + rect.width / 2,
        });
      } else {
        setPosition(null);
      }
    };

    document.addEventListener('selectionchange', handleSelection);
    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('keyup', handleSelection);

    return () => {
      document.removeEventListener('selectionchange', handleSelection);
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('keyup', handleSelection);
    };
  }, []);

  if (!position) return null;

  const applyFormat = (command: string) => {
    document.execCommand(command, false, undefined);
  };

  return (
    <div 
      className="fixed z-[9999] flex items-center bg-slate-900 text-white rounded-md shadow-lg p-1 gap-1 -translate-x-1/2 transition-all animate-in fade-in zoom-in-95"
      style={{ top: position.top, left: position.left }}
      onMouseDown={(e) => e.preventDefault()} 
    >
      <button onClick={() => applyFormat('bold')} className="p-1.5 hover:bg-slate-700 rounded text-white transition-colors" title="Bold">
        <Bold className="w-4 h-4" />
      </button>
      <button onClick={() => applyFormat('italic')} className="p-1.5 hover:bg-slate-700 rounded text-white transition-colors" title="Italic">
        <Italic className="w-4 h-4" />
      </button>
      <button onClick={() => applyFormat('strikeThrough')} className="p-1.5 hover:bg-slate-700 rounded text-white transition-colors" title="Strikethrough">
        <Strikethrough className="w-4 h-4" />
      </button>
    </div>
  );
}

// --- EDITABLE CELL COMPONENT FOR RICH TEXT ---
function EditableCell({ 
  value, 
  onChange, 
  onBlur,
  onKeyDown,
  placeholder, 
  className = "",
  autoFocus = false
}: { 
  value: string, 
  onChange: (val: string) => void, 
  onBlur?: () => void,
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void,
  placeholder: string,
  className?: string,
  autoFocus?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && value !== ref.current.innerHTML && document.activeElement !== ref.current) {
      ref.current.innerHTML = value || "";
    }
  }, [value]);

  useEffect(() => {
    if (autoFocus && ref.current) {
      ref.current.focus();
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(ref.current);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [autoFocus]);

  const handleInput = () => {
    if (ref.current) {
      onChange(ref.current.innerHTML);
    }
  };

  const handleBlur = () => {
    handleInput();
    if (onBlur) onBlur();
  };

  return (
    <div
      ref={ref}
      contentEditable
      onInput={handleInput}
      onBlur={handleBlur}
      onKeyDown={onKeyDown}
      className={`outline-none cursor-text empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400/60 [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic [&_strike]:line-through [&_s]:line-through ${className}`}
      data-placeholder={placeholder}
      suppressContentEditableWarning
    />
  );
}

const linkifyHtml = (htmlText: string) => {
  if (!htmlText) return "";
  const urlRegex = /(?<!href="|src=")(https?:\/\/[^\s<]+)/g;
  return htmlText.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-emerald-600 font-medium hover:underline break-all">$1</a>');
};

const stripHtml = (html: string) => {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || "";
};

// --- MAIN PAGE COMPONENT ---
export default function EventWorkspacePage() {
  const params = useParams();
  const rawEventName = (params?.eventName as string) || "Event";
  const formattedEventName = rawEventName.charAt(0).toUpperCase() + rawEventName.slice(1);

  const { items, loading, addItem, updateItem, deleteItem, moveItem } = useEventItems(rawEventName);
  const { teamMembers, addTeamMember } = useTeamMembers();

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const [activeModal, setActiveModal] = useState<CategoryId | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemText, setNewItemText] = useState("");
  const [newItemDate, setNewItemDate] = useState("");
  const [newItemAssignedTo, setNewItemAssignedTo] = useState("");
  
  const [newItemMedia, setNewItemMedia] = useState<{ url: string, type: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingTaskText, setEditingTaskText] = useState("");
  const [editingTaskDate, setEditingTaskDate] = useState("");
  const [editingAssignedTo, setEditingAssignedTo] = useState("");
  const [editingTaskMedia, setEditingTaskMedia] = useState<{ url: string, type: string } | null>(null);

  const [expandedMedia, setExpandedMedia] = useState<{ url: string, type: string } | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ categoryId: CategoryId; itemId: string } | null>(null);

  const totalTasks = (items?.tasks?.length || 0) + (items?.taskDone?.length || 0);
  const completedTasks = items?.taskDone?.length || 0;
  const percentComplete = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const handleAddItem = async () => {
    const plainTextContent = newItemText.replace(/<[^>]*>?/gm, '').trim();
    if (!activeModal || !plainTextContent || isUploading) return;
    
    const payload = {
      content: newItemText.trim(),
      dueDate: newItemDate || undefined, 
      assignedTo: newItemAssignedTo.trim() || undefined,
      imageUrl: newItemMedia?.url || undefined,
      mediaType: newItemMedia?.type || undefined, 
      created_at: new Date().toISOString() 
    };

    await addItem(activeModal, payload);

    setNewItemText("");
    setNewItemDate("");
    setNewItemAssignedTo("");
    setNewItemMedia(null);
    setShowAddForm(false);
  };

  const handleDeleteRequest = (categoryId: CategoryId, itemId: string) => {
    setItemToDelete({ categoryId, itemId });
  };

  const confirmItemDelete = async () => {
    if (!itemToDelete) return;
    await deleteItem(itemToDelete.itemId);
    setItemToDelete(null);
  };

  const handleMoveTask = async (itemId: string, toCategory: CategoryId) => {
    await moveItem(itemId, toCategory);
  };

  const startEditing = (item: WorkspaceItem & { mediaType?: string }) => {
    setEditingItemId(item.id);
    setEditingTaskText(item.content);
    setEditingTaskDate(item.dueDate || "");
    setEditingAssignedTo((item as any).assignedTo || "");
    setEditingTaskMedia(item.imageUrl ? { url: item.imageUrl, type: guessMediaType(item.imageUrl, item.mediaType) } : null);
  };

  const cancelEditing = () => setEditingItemId(null);

  const saveEditedItem = async (categoryId: CategoryId, itemId: string) => {
    const plainTextContent = editingTaskText.replace(/<[^>]*>?/gm, '').trim();
    if (!plainTextContent || isUploading) return;
    
    if (editingAssignedTo.trim()) {
      addTeamMember(editingAssignedTo.trim());
    }
    
    const payload = {
      content: editingTaskText.trim(),
      dueDate: editingTaskDate || undefined,
      assignedTo: editingAssignedTo.trim() || undefined,
      imageUrl: editingTaskMedia?.url || undefined,
      mediaType: editingTaskMedia?.type || undefined
    };

    await updateItem(itemId, payload);
    setEditingItemId(null);
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

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEditMode: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!supabase) {
      alert("Upload failed: Supabase connection is missing. Please check your .env variables.");
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `workspace/${fileName}`;
      
      const mediaType = file.type.startsWith('video/') ? 'video' 
                      : file.type.startsWith('audio/') ? 'audio' 
                      : 'image';

      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, { upsert: false });

      if (error) {
        console.error("Upload error:", error.message);
        alert(`Upload error: ${error.message}`);
        setIsUploading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      const mediaPayload = { url: publicUrl, type: mediaType };

      if (isEditMode) {
        setEditingTaskMedia(mediaPayload);
      } else {
        setNewItemMedia(mediaPayload);
      }
    } catch (error) {
      console.error("Failed to upload media:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const renderMediaPreview = (media: { url: string, type: string }, onRemove: () => void) => {
    return (
      <div className="relative h-[42px] sm:h-full aspect-[4/3] border border-emerald-200 rounded-lg overflow-hidden shadow-sm group bg-black/5 shrink-0 flex items-center justify-center">
        {media.type === 'video' && <video src={media.url} className="w-full h-full object-cover" muted />}
        {media.type === 'audio' && <div className="w-full h-full flex items-center justify-center bg-slate-100"><Music className="w-6 h-6 text-slate-400" /></div>}
        {media.type === 'image' && <img src={media.url} className="w-full h-full object-cover" alt="" />}
        
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button onClick={onRemove} className="text-white hover:text-red-400">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  const renderCardPreview = (categoryId: CategoryId) => {
    const list = items?.[categoryId] || [];
    if (list.length === 0) return <p className="text-sm text-slate-400 italic">Empty</p>;

    const sortedList = [...list].sort((a: any, b: any) => 
      new Date(b.created_at || b.createdAt || 0).getTime() - new Date(a.created_at || a.createdAt || 0).getTime()
    );

    const preview = sortedList.slice(0, 2);
    const remainder = sortedList.length - 2;

    return (
      <ul className="text-slate-600 text-sm space-y-2.5">
        {preview.map(item => {
          const overdue = categoryId === 'tasks' && isOverdue(item.dueDate || null);
          return (
            <li key={item.id} className="flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 truncate">
                  <span className="text-slate-300 mt-0.5">•</span> 
                  <span className={`truncate font-medium ${overdue ? 'text-red-600' : 'text-slate-700'}`}>
                    {stripHtml(item.content)}
                  </span>
                </div>
                {(item as any).assignedTo && (
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0 flex items-center gap-1">
                    <User className="w-2.5 h-2.5 text-emerald-600" /> {(item as any).assignedTo}
                  </span>
                )}
              </div>
              {item.dueDate && (
                <div className={`text-[10px] font-medium flex items-center gap-1 ml-4 mt-0.5 ${overdue ? 'text-red-500' : 'text-emerald-600'}`}>
                  <Calendar className="w-3 h-3" /> {overdue ? "Overdue: " : "Due by "} {formatDate(item.dueDate)}
                </div>
              )}
            </li>
          );
        })}
        {remainder > 0 && <li className="text-xs text-slate-400 mt-2 font-medium">+{remainder} more</li>}
      </ul>
    );
  };

  const workspaceCards = [
    { id: 'tasks', title: 'Tasks', icon: ClipboardList, color: 'text-blue-500', isLink: false },
    { id: 'taskDone', title: 'Task Done', icon: CheckCircle2, color: 'text-emerald-500', isLink: false },
    { id: 'outfit', title: 'Outfit', icon: Shirt, color: 'text-red-500', isLink: true, href: `/events/${rawEventName}/outfits`, subtext: 'Manage Outfits' },
    { id: 'ideas', title: 'Ideas', icon: Lightbulb, color: 'text-amber-500', isLink: false },
    { id: 'games', title: 'Games', icon: Gamepad2, color: 'text-purple-500', isLink: false },
    { id: 'itemsNeeded', title: 'Items Needed', icon: ShoppingBag, color: 'text-pink-500', isLink: false },
    { id: 'vendors', title: 'Vendors', icon: Store, color: 'text-teal-500', isLink: false },
    { id: 'pujaItems', title: 'Puja Items', icon: Flame, color: 'text-orange-500', isLink: false },
  ];

  if (loading) return <div className="p-12 text-center text-emerald-600">Loading workspace...</div>;

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-6xl mx-auto">
      
      <FloatingToolbar />

      <div className="mb-10">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
          <h1 className="text-3xl font-serif font-bold text-emerald-900">
            {formattedEventName} Workspace
          </h1>
          <div className="flex items-center gap-3">
            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
              {percentComplete}% Completed
            </span>
            <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-medium tracking-wide">
              {completedTasks} / {totalTasks} Tasks
            </span>
          </div>
        </div>
        <div className="w-full md:w-64 h-2.5 bg-slate-100 rounded-full overflow-hidden mt-3">
          <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${percentComplete}%` }}></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workspaceCards.map((card) => {
          if (card.isLink) {
            return (
              <Link 
                key={card.id} 
                href={card.href!} 
                className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-200 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <card.icon className={`w-5 h-5 ${card.color}`} />
                    <h2 className="font-bold text-slate-800 text-lg group-hover:text-emerald-600 transition-colors">
                      {card.title}
                    </h2>
                  </div>
                  {card.subtext && <p className="text-sm text-slate-400 italic">{card.subtext}</p>}
                </div>
              </Link>
            );
          }

          return (
            <button 
              key={card.id}
              onClick={() => { 
                setActiveModal(card.id as CategoryId); 
                setEditingItemId(null); 
                setShowAddForm(false);
              }}
              className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow text-left h-full flex flex-col group"
            >
              <div className="flex items-center gap-3 mb-4">
                <card.icon className={`w-5 h-5 ${card.color}`} />
                <h2 className="font-bold text-slate-800 text-lg group-hover:text-emerald-600 transition-colors">
                  {card.title}
                </h2>
              </div>
              <div className="flex-1">
                {renderCardPreview(card.id as CategoryId)}
              </div>
            </button>
          );
        })}
      </div>

      <Dialog 
        open={!!activeModal} 
        onOpenChange={(open) => {
          if (!open) {
            setActiveModal(null);
            setShowAddForm(false);
            setOpenDropdownId(null);
          }
        }}
      >
        <DialogContent 
          className="sm:max-w-xl max-h-[85vh] overflow-hidden flex flex-col"
          {...({ onOpenAutoFocus: (e: any) => e.preventDefault() } as any)}
        >
          <DialogHeader className="shrink-0">
            <DialogTitle className="capitalize text-lg font-serif">
              Manage {activeModal?.replace(/([A-Z])/g, ' $1').trim()}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto pr-2 min-h-0">
            {!showAddForm ? (
              <div 
                onClick={() => setShowAddForm(true)}
                className="w-full mt-2 border border-slate-200 bg-slate-50 hover:bg-white hover:border-emerald-400 text-slate-400 mb-4 p-3 rounded-lg flex items-center text-sm cursor-text transition-all shadow-sm"
              >
                <Plus className="w-4 h-4 mr-2 text-emerald-500 shrink-0" />
                Type new entry here...
              </div>
            ) : (
              <div className="bg-slate-50 p-4 rounded-xl border border-emerald-200 space-y-3 mt-2 mb-4 shadow-sm">
                <EditableCell
                  value={newItemText}
                  onChange={(val) => setNewItemText(val)}
                  placeholder="Type new entry here..."
                  className="w-full border border-emerald-400 p-3 rounded-lg outline-none focus:border-emerald-600 text-sm bg-white min-h-[60px]"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && window.innerWidth > 768) {
                      e.preventDefault(); 
                      handleAddItem();    
                    }
                  }}
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 h-auto sm:h-[42px]">
                  {activeModal === 'tasks' && (
                    <div className="relative h-[42px] sm:h-full">
                      <input 
                        type={newItemDate ? "date" : "text"}
                        onFocus={(e) => (e.target.type = "date")}
                        onBlur={(e) => { if (!e.target.value) e.target.type = "text"; }}
                        className="w-full h-full border px-3 rounded-lg outline-none focus:border-emerald-500 text-sm text-slate-600 bg-white"
                        placeholder="Due Date"
                        value={newItemDate}
                        onChange={(e) => setNewItemDate(e.target.value)}
                      />
                    </div>
                  )}
                  
                  {activeModal === 'tasks' && (
                    <div className="relative h-[42px] sm:h-full">
                      <div 
                        onClick={() => setOpenDropdownId(openDropdownId === 'add-new' ? null : 'add-new')}
                        className="w-full h-full border px-3 rounded-lg text-sm text-slate-700 bg-white flex items-center justify-between cursor-pointer select-none"
                      >
                        <span className="truncate">{newItemAssignedTo || "Assign To..."}</span>
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
                      </div>

                      {openDropdownId === 'add-new' && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                          <div className="p-1.5 border-b bg-slate-50 sticky top-0">
                            <input
                              type="text"
                              autoFocus
                              value={newItemAssignedTo}
                              onChange={(e) => setNewItemAssignedTo(e.target.value)}
                              placeholder="Type custom name..."
                              className="w-full text-xs px-2 py-1.5 border rounded bg-white outline-none focus:border-emerald-500 text-slate-700"
                            />
                          </div>
                          <div
                            onClick={() => { setNewItemAssignedTo(""); setOpenDropdownId(null); }}
                            className="px-3 py-2 text-xs text-slate-400 hover:bg-slate-100 cursor-pointer italic"
                          >
                            Unassigned
                          </div>
                          {teamMembers.map((member) => (
                            <div
                              key={member}
                              onClick={() => { setNewItemAssignedTo(member); setOpenDropdownId(null); }}
                              className="px-3 py-2 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer truncate"
                            >
                              {member}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Add File / Media Upload Section */}
                  {newItemMedia ? renderMediaPreview(newItemMedia, () => setNewItemMedia(null)) : (
                    <div className="relative h-[42px] sm:h-full">
                      <input 
                        type="file"
                        accept="image/*,video/*,audio/*"
                        id="add-media"
                        className="hidden"
                        onChange={(e) => handleMediaUpload(e, false)}
                        disabled={isUploading}
                      />
                      <label 
                        htmlFor="add-media" 
                        className={`flex items-center justify-center w-full h-full border border-dashed rounded-lg cursor-pointer text-sm transition-colors bg-white border-slate-300 text-slate-500 hover:bg-slate-50 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {isUploading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <div className="flex gap-1 mr-2 items-center text-slate-400">
                            <ImageIcon className="w-4 h-4" />
                            <Film className="w-4 h-4" />
                            <Music className="w-4 h-4" />
                          </div>
                        )}
                        {isUploading ? "Uploading..." : "Media"}
                      </label>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowAddForm(false);
                      setNewItemText("");
                      setNewItemDate("");
                      setNewItemAssignedTo("");
                      setNewItemMedia(null);
                      setOpenDropdownId(null);
                    }} 
                    className="px-3 py-1.5 h-9 text-slate-500 border-slate-200 text-xs"
                    disabled={isUploading}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddItem} disabled={isUploading} className="bg-emerald-600 hover:bg-emerald-700 h-9 px-4 text-xs">
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Entry
                  </Button>
                </div>
              </div>
            )}

            <div className="mt-4 space-y-3 pb-4">
              {activeModal && [...(items?.[activeModal] || [])].sort((a: any, b: any) => 
                new Date(b.created_at || b.createdAt || 0).getTime() - new Date(a.created_at || a.createdAt || 0).getTime()
              ).map((item: any) => {
                const overdue = activeModal === 'tasks' && isOverdue(item.dueDate || null);
                
                // --- FIX: Use our new smarter media detector! ---
                const itemMediaType = guessMediaType(item.imageUrl, item.mediaType);

                return (
                  <div 
                    key={item.id} 
                    className={`flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 border p-3.5 rounded-xl bg-white shadow-sm transition-colors ${overdue ? 'border-red-300 bg-red-50/30' : 'border-slate-200'}`}
                  >
                    {/* --- EDIT MODE --- */}
                    {editingItemId === item.id ? (
                      <div className="flex-1 flex flex-col gap-2 w-full">
                        <EditableCell 
                          value={editingTaskText}
                          onChange={(val) => setEditingTaskText(val)}
                          placeholder="Edit item..."
                          className="border border-emerald-500 rounded-md outline-none px-3 py-2 text-slate-700 text-sm w-full min-h-[40px] bg-white"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey && window.innerWidth > 768) {
                              e.preventDefault();
                              saveEditedItem(activeModal, item.id);
                            }
                          }}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm mt-1">
                          {activeModal === 'tasks' && (
                            <input 
                              type={editingTaskDate ? "date" : "text"}
                              onFocus={(e) => (e.target.type = "date")}
                              onBlur={(e) => { if (!e.target.value) e.target.type = "text"; }}
                              placeholder="Due Date"
                              value={editingTaskDate}
                              onChange={(e) => setEditingTaskDate(e.target.value)}
                              className="border rounded px-2 h-9 outline-none text-slate-600 bg-white w-full"
                            />
                          )}

                          {activeModal === 'tasks' && (
                            <div className="relative w-full">
                              <div 
                                onClick={() => setOpenDropdownId(openDropdownId === item.id ? null : item.id)}
                                className="text-sm border rounded px-2 h-9 text-slate-600 bg-white flex items-center justify-between cursor-pointer select-none"
                              >
                                <span className="truncate">{editingAssignedTo || "Assign to..."}</span>
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                              </div>

                              {openDropdownId === item.id && (
                                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-md shadow-xl z-50 max-h-48 overflow-y-auto">
                                  <div className="p-1 border-b bg-slate-50 sticky top-0">
                                    <input
                                      type="text"
                                      autoFocus
                                      value={editingAssignedTo}
                                      onChange={(e) => setEditingAssignedTo(e.target.value)}
                                      placeholder="Type custom name..."
                                      className="w-full text-xs px-2 py-1 border rounded bg-white outline-none focus:border-emerald-500 text-slate-700"
                                    />
                                  </div>
                                  <div
                                    onClick={() => { setEditingAssignedTo(""); setOpenDropdownId(null); }}
                                    className="px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-100 cursor-pointer italic"
                                  >
                                    Unassigned
                                  </div>
                                  {teamMembers.map((member) => (
                                    <div
                                      key={member}
                                      onClick={() => { setEditingAssignedTo(member); setOpenDropdownId(null); }}
                                      className="px-3 py-1.5 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer truncate"
                                    >
                                      {member}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Media Preview for Edit Form */}
                          {editingTaskMedia ? renderMediaPreview(editingTaskMedia, () => setEditingTaskMedia(null)) : (
                            <div className="relative h-9">
                              <input 
                                type="file"
                                accept="image/*,video/*,audio/*"
                                id={`edit-media-${item.id}`}
                                className="hidden"
                                onChange={(e) => handleMediaUpload(e, true)}
                                disabled={isUploading}
                              />
                              <label 
                                htmlFor={`edit-media-${item.id}`} 
                                className={`flex items-center justify-center w-full h-full border border-dashed rounded cursor-pointer text-slate-500 hover:bg-slate-50 text-xs ${isUploading ? 'opacity-50' : ''}`}
                              >
                                {isUploading ? (
                                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                ) : (
                                  <div className="flex gap-0.5 mr-1 items-center text-slate-400">
                                    <ImageIcon className="w-3 h-3" />
                                    <Film className="w-3 h-3" />
                                    <Music className="w-3 h-3" />
                                  </div>
                                )}
                                Media
                              </label>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex justify-end gap-2 mt-2">
                          <button onClick={cancelEditing} disabled={isUploading} className="px-3 py-1 text-xs bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200">Cancel</button>
                          <button onClick={() => saveEditedItem(activeModal, item.id)} disabled={isUploading} className="px-3 py-1 text-xs bg-emerald-600 text-white rounded-md hover:bg-emerald-700">Save</button>
                        </div>
                      </div>
                    ) : (
                      /* --- DISPLAY MODE --- */
                      <>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">
                              {item.created_at || item.createdAt ? formatDate(item.created_at || item.createdAt) : formatDate(new Date().toISOString())}
                            </span>
                            {item.assignedTo && (
                              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
                                <User className="w-3 h-3 text-emerald-600" /> {item.assignedTo}
                              </span>
                            )}
                          </div>
                          
                          <div 
                            className={`text-sm whitespace-pre-wrap break-words [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic [&_strike]:line-through [&_s]:line-through [&_a]:text-blue-600 [&_a]:underline hover:[&_a]:text-blue-800 ${activeModal === 'taskDone' ? 'line-through text-slate-400' : 'text-slate-800'}`}
                            dangerouslySetInnerHTML={{ __html: linkifyHtml(item.content) }}
                            onClick={(e) => {
                              if ((e.target as HTMLElement).tagName.toLowerCase() === 'a') {
                                e.stopPropagation();
                              }
                            }}
                          />
                          
                          {item.dueDate && (
                            <p className={`text-xs font-medium flex items-center gap-1 mt-1.5 ${overdue ? 'text-red-600' : 'text-emerald-600'}`}>
                              <Calendar className={`w-3 h-3 ${overdue ? 'text-red-500' : 'text-emerald-600'}`} /> 
                              {overdue ? "Overdue: " : "Due by "} {formatDate(item.dueDate)}
                            </p>
                          )}

                          {item.imageUrl && (
                            <div 
                              className="mt-3 overflow-hidden w-full max-w-[240px] rounded-lg border border-slate-200 shadow-sm relative cursor-pointer group hover:opacity-90 transition-opacity bg-slate-50 flex items-center justify-center"
                              onClick={() => setExpandedMedia({ url: item.imageUrl, type: itemMediaType })}
                            >
                              {itemMediaType === 'image' && (
                                <>
                                  <img src={item.imageUrl} alt="attached media" className="w-full h-auto object-cover max-h-[150px]" />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center transition-colors">
                                    <ImageIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 drop-shadow-md" />
                                  </div>
                                </>
                              )}
                              
                              {itemMediaType === 'video' && (
                                <>
                                  <video src={`${item.imageUrl}#t=0.1`} className="w-full h-auto max-h-[150px] object-cover bg-black" muted />
                                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 flex items-center justify-center transition-colors">
                                    <Film className="w-8 h-8 text-white drop-shadow-md" />
                                  </div>
                                </>
                              )}

                              {itemMediaType === 'audio' && (
                                <div className="w-full h-24 flex items-center justify-center">
                                  <Music className="w-8 h-8 text-slate-400 group-hover:scale-110 transition-transform" />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-1.5 shrink-0">
                          <button onClick={() => startEditing(item)} className="p-1.5 border border-slate-100 text-slate-400 bg-slate-50 rounded-md hover:bg-slate-100 hover:text-slate-600" title="Edit">
                            <Pencil className="w-4 h-4" />
                          </button>
                          
                          {activeModal === 'tasks' && (
                            <button onClick={() => handleMoveTask(item.id, 'taskDone')} className="p-1.5 border border-emerald-100 text-emerald-500 bg-white rounded-md hover:bg-emerald-50" title="Mark Done">
                              <Check className="w-4 h-4" />
                            </button>
                          )}

                          {activeModal === 'taskDone' && (
                            <button onClick={() => handleMoveTask(item.id, 'tasks')} className="p-1.5 border border-amber-100 text-amber-500 bg-white rounded-md hover:bg-amber-50" title="Restore to Tasks">
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}

                          <button onClick={() => handleDeleteRequest(activeModal, item.id)} className="p-1.5 border border-red-100 text-red-400 bg-white rounded-md hover:bg-red-50" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
              
              {activeModal && (!items?.[activeModal] || items[activeModal].length === 0) && (
                <p className="text-center text-slate-400 text-sm py-8 border-2 border-dashed border-slate-100 rounded-xl">No entries yet.</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- EXPANDED MEDIA MODAL --- */}
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
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center">
                <Music className="w-12 h-12 text-emerald-600" />
              </div>
              <audio src={expandedMedia.url} controls autoPlay className="w-full" />
            </div>
          )}
        </DialogContent>
      </Dialog>

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

    </div>
  );
}