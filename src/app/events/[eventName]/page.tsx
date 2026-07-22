"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  ClipboardList, CheckCircle2, ShoppingBag, Flame, 
  Gamepad2, Store, Lightbulb, Shirt, IndianRupee, 
  ExternalLink, Plus, Trash2, Check, RotateCcw, 
  Pencil, X, Calendar, Image as ImageIcon, User, ChevronDown
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEventItems, CategoryId, WorkspaceItem } from '@/hooks/useEventItems';
import { useTeamMembers } from '@/hooks/useTeamMembers';

// --- HELPER: Parse URLs into clickable links ---
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

export default function EventWorkspacePage() {
  const params = useParams();
  const rawEventName = (params?.eventName as string) || "Event";
  const formattedEventName = rawEventName.charAt(0).toUpperCase() + rawEventName.slice(1);

  // 1. Data States 
  const { items, loading, addItem, updateItem, deleteItem, moveItem } = useEventItems(rawEventName);
  
  // Custom Hook replaces localStorage for sharing state with Global Task Board
  const { teamMembers, addTeamMember } = useTeamMembers();

  // Dropdown UI State
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // 2. Modal Add/View State
  const [activeModal, setActiveModal] = useState<CategoryId | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemText, setNewItemText] = useState("");
  const [newItemDate, setNewItemDate] = useState("");
  const [newItemAssignedTo, setNewItemAssignedTo] = useState("");
  const [newItemImage, setNewItemImage] = useState<string | null>(null);

  // 3. Edit Mode State
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingTaskText, setEditingTaskText] = useState("");
  const [editingTaskDate, setEditingTaskDate] = useState("");
  const [editingAssignedTo, setEditingAssignedTo] = useState("");
  const [editingTaskImage, setEditingTaskImage] = useState<string | null>(null);

  // 4. Image Preview State
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  // Progress Bar Calculations
  const totalTasks = (items.tasks?.length || 0) + (items.taskDone?.length || 0);
  const completedTasks = items.taskDone?.length || 0;
  const percentComplete = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  // --- ACTIONS ---
  const handleAddItem = async () => {
    if (!activeModal || !newItemText.trim()) return;
    
    const payload = {
      content: newItemText.trim(),
      dueDate: newItemDate || undefined, 
      assignedTo: newItemAssignedTo.trim() || undefined,
      imageUrl: newItemImage || undefined, 
      created_at: new Date().toISOString() 
    };

    await addItem(activeModal, payload);

    setNewItemText("");
    setNewItemDate("");
    setNewItemAssignedTo("");
    setNewItemImage(null);
    setShowAddForm(false);
  };

  const handleDeleteItem = async (categoryId: CategoryId, itemId: string) => {
    await deleteItem(itemId);
  };

  const handleMoveTask = async (itemId: string, toCategory: CategoryId) => {
    await moveItem(itemId, toCategory);
  };

  const startEditing = (item: WorkspaceItem) => {
    setEditingItemId(item.id);
    setEditingTaskText(item.content);
    setEditingTaskDate(item.dueDate || "");
    setEditingAssignedTo((item as any).assignedTo || "");
    setEditingTaskImage(item.imageUrl || null);
  };

  const cancelEditing = () => setEditingItemId(null);

  const saveEditedItem = async (categoryId: CategoryId, itemId: string) => {
    if (!editingTaskText.trim()) return;
    
    // Save new assignee to global hook automatically if it's a new name
    if (editingAssignedTo.trim()) {
      addTeamMember(editingAssignedTo.trim());
    }
    
    const payload = {
      content: editingTaskText.trim(),
      dueDate: editingTaskDate || undefined,
      assignedTo: editingAssignedTo.trim() || undefined,
      imageUrl: editingTaskImage || undefined
    };

    await updateItem(itemId, payload);
    setEditingItemId(null);
  };

  // --- HELPERS ---
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

  // COMPRESSED IMAGE UPLOAD
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEditMode: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_SIZE = 500; 
        let width = img.width;
        let height = img.height;

        if (width > height && width > MAX_SIZE) {
          height *= MAX_SIZE / width;
          width = MAX_SIZE;
        } else if (height > MAX_SIZE) {
          width *= MAX_SIZE / height;
          height = MAX_SIZE;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.5);
        
        if (isEditMode) {
          setEditingTaskImage(compressedBase64);
        } else {
          setNewItemImage(compressedBase64);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleTextareaResize = (e: React.ChangeEvent<HTMLTextAreaElement> | React.KeyboardEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    target.style.height = "auto";
    target.style.height = `${target.scrollHeight}px`;
  };

  const renderCardPreview = (categoryId: CategoryId) => {
    const list = items[categoryId] || [];
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
                  <span className={`truncate font-medium ${overdue ? 'text-red-600' : 'text-slate-700'}`}>{item.content}</span>
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
    { id: 'expenses', title: 'Expenses', icon: IndianRupee, color: 'text-slate-800', isLink: true, href: '/budget', showExternalIcon: true },
  ];

  if (loading) return <div className="p-12 text-center text-emerald-600">Loading workspace...</div>;

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-6xl mx-auto">
      
      {/* Header Section */}
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

      {/* Grid Workspace */}
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
                {card.showExternalIcon && (
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors self-end mt-2" />
                )}
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

      {/* Main Workspace Modal */}
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
            {/* Add New Item Toggle/Form */}
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
                <textarea 
                  autoFocus
                  className="w-full border border-emerald-400 p-2.5 rounded-lg outline-none focus:border-emerald-600 text-sm resize-none overflow-hidden bg-white"
                  placeholder="Type new entry here... "
                  rows={2}
                  value={newItemText}
                  onChange={(e) => {
                    setNewItemText(e.target.value);
                    handleTextareaResize(e);
                  }}
                  ref={(el) => {
                    if (el) {
                      el.style.height = "auto";
                      el.style.height = `${el.scrollHeight}px`;
                    }
                  }}
                  onKeyDown={(e) => {
                    // Only submit on desktop when Enter is pressed without Shift.
                    // On mobile, let Enter create a new line naturally.
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

                  {/* Thumbnail Preview for Add Form */}
                  {newItemImage ? (
                    <div className="relative h-[42px] sm:h-full aspect-[4/3] border border-emerald-200 rounded-lg overflow-hidden shadow-sm group bg-black/5 shrink-0 flex items-center justify-center">
                      <img 
                        src={newItemImage} 
                        className="w-full h-full object-cover" 
                        alt="" 
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button onClick={() => setNewItemImage(null)} className="text-white hover:text-red-400">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative h-[42px] sm:h-full">
                      <input 
                        type="file"
                        accept="image/*"
                        id="add-image"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, false)}
                      />
                      <label 
                        htmlFor="add-image" 
                        className="flex items-center justify-center w-full h-full border border-dashed rounded-lg cursor-pointer text-sm transition-colors bg-white border-slate-300 text-slate-500 hover:bg-slate-50"
                      >
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Image
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
                      setNewItemImage(null);
                      setOpenDropdownId(null);
                    }} 
                    className="px-3 py-1.5 h-9 text-slate-500 border-slate-200 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddItem} className="bg-emerald-600 hover:bg-emerald-700 h-9 px-4 text-xs">
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Entry
                  </Button>
                </div>
              </div>
            )}

            {/* List Items */}
            <div className="mt-4 space-y-3 pb-4">
              {activeModal && [...(items[activeModal] || [])].sort((a: any, b: any) => 
                new Date(b.created_at || b.createdAt || 0).getTime() - new Date(a.created_at || a.createdAt || 0).getTime()
              ).map((item: any) => {
                const overdue = activeModal === 'tasks' && isOverdue(item.dueDate || null);
                return (
                  <div 
                    key={item.id} 
                    className={`flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 border p-3.5 rounded-xl bg-white shadow-sm transition-colors ${overdue ? 'border-red-300 bg-red-50/30' : 'border-slate-200'}`}
                  >
                    
                    {/* --- EDIT MODE --- */}
                    {editingItemId === item.id ? (
                      <div className="flex-1 flex flex-col gap-2 w-full">
                        <textarea 
                          value={editingTaskText}
                          onChange={(e) => {
                            setEditingTaskText(e.target.value);
                            handleTextareaResize(e);
                          }}
                          ref={(el) => {
                            if (el) {
                              el.style.height = "auto";
                              el.style.height = `${el.scrollHeight}px`;
                            }
                          }}
                          onKeyDown={(e) => {
                            // Only submit on desktop when Enter is pressed without Shift.
                            if (e.key === 'Enter' && !e.shiftKey && window.innerWidth > 768) {
                              e.preventDefault();
                              saveEditedItem(activeModal, item.id);
                            }
                          }}
                          className="border border-emerald-500 rounded-md outline-none px-3 py-2 text-slate-700 text-sm w-full resize-none overflow-hidden" 
                          rows={1}
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
                          
                          {/* Thumbnail Preview for Edit Form */}
                          {editingTaskImage ? (
                            <div className="h-9 rounded border border-emerald-200 relative overflow-hidden group flex items-center justify-center shrink-0">
                              <img 
                                src={editingTaskImage} 
                                className="w-full h-full object-cover" 
                                alt="" 
                                onError={(e) => (e.currentTarget.style.display = 'none')}
                              />
                              <button onClick={() => setEditingTaskImage(null)} className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="relative h-9">
                              <input 
                                type="file"
                                accept="image/*"
                                id={`edit-image-${item.id}`}
                                className="hidden"
                                onChange={(e) => handleImageUpload(e, true)}
                              />
                              <label 
                                htmlFor={`edit-image-${item.id}`} 
                                className="flex items-center justify-center w-full h-full border border-dashed rounded cursor-pointer text-slate-500 hover:bg-slate-50 text-xs"
                              >
                                <ImageIcon className="w-3 h-3 mr-1" />
                                Image
                              </label>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex justify-end gap-2 mt-2">
                          <button onClick={cancelEditing} className="px-3 py-1 text-xs bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200">Cancel</button>
                          <button onClick={() => saveEditedItem(activeModal, item.id)} className="px-3 py-1 text-xs bg-emerald-600 text-white rounded-md hover:bg-emerald-700">Save</button>
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
                          
                          <p className={`text-sm whitespace-pre-wrap break-words ${activeModal === 'taskDone' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                            {renderTextWithLinks(item.content)}
                          </p>
                          
                          {item.dueDate && (
                            <p className={`text-xs font-medium flex items-center gap-1 mt-1.5 ${overdue ? 'text-red-600' : 'text-emerald-600'}`}>
                              <Calendar className={`w-3 h-3 ${overdue ? 'text-red-500' : 'text-emerald-600'}`} /> 
                              {overdue ? "Overdue: " : "Due by "} {formatDate(item.dueDate)}
                            </p>
                          )}

                          {item.imageUrl && (
                            <div 
                              className="mt-3 rounded-lg border border-slate-200 overflow-hidden w-full max-w-[150px] shadow-sm cursor-pointer hover:opacity-90 transition-opacity relative group"
                              onClick={() => setExpandedImage(item.imageUrl)}
                            >
                              <img 
                                src={item.imageUrl} 
                                alt="" 
                                className="w-full h-auto object-cover" 
                                onError={(e) => {
                                  e.currentTarget.parentElement!.style.display = 'none';
                                }}
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                <ImageIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 drop-shadow-md" />
                              </div>
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

                          <button onClick={() => handleDeleteItem(activeModal, item.id)} className="p-1.5 border border-red-100 text-red-400 bg-white rounded-md hover:bg-red-50" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
              
              {activeModal && (!items[activeModal] || items[activeModal].length === 0) && (
                <p className="text-center text-slate-400 text-sm py-8 border-2 border-dashed border-slate-100 rounded-xl">No entries yet.</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Expanded Image Lightbox Modal */}
      <Dialog open={!!expandedImage} onOpenChange={(open) => !open && setExpandedImage(null)}>
        <DialogContent 
          className="max-w-screen-lg w-[90vw] bg-transparent border-none shadow-none flex items-center justify-center p-0 [&>button]:bg-black/50 [&>button]:text-white [&>button]:hover:bg-black/80 [&>button]:rounded-full [&>button]:p-2 focus-visible:outline-none"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Image Preview</DialogTitle>
          </DialogHeader>
          {expandedImage && (
            <img 
              src={expandedImage} 
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" 
              alt="" 
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                setExpandedImage(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}