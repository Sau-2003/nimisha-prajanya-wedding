"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  ClipboardList, CheckCircle2, ShoppingBag, Flame, 
  Gamepad2, Store, Lightbulb, Shirt, FileText, 
  IndianRupee, ExternalLink, Plus, Trash2, Check, 
  RotateCcw, Pencil, X, Calendar, Image as ImageIcon
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEventItems, CategoryId, WorkspaceItem } from '@/hooks/useEventItems';

export default function EventWorkspacePage() {
  const params = useParams();
  const rawEventName = (params?.eventName as string) || "Event";
  const formattedEventName = rawEventName.charAt(0).toUpperCase() + rawEventName.slice(1);

  // 1. Data State (Now managed by the custom hook)
  const { items, loading, addItem, updateItem, deleteItem, moveItem } = useEventItems(rawEventName);

  // 2. Modal Add/View State
  const [activeModal, setActiveModal] = useState<CategoryId | null>(null);
  const [newItemText, setNewItemText] = useState("");
  const [newItemDate, setNewItemDate] = useState("");
  const [newItemImage, setNewItemImage] = useState<string | null>(null);

  // 3. Edit Mode State
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingTaskText, setEditingTaskText] = useState("");
  const [editingTaskDate, setEditingTaskDate] = useState("");
  const [editingTaskImage, setEditingTaskImage] = useState<string | null>(null);

  // Progress Bar Calculations
  const totalTasks = (items.tasks?.length || 0) + (items.taskDone?.length || 0);
  const completedTasks = items.taskDone?.length || 0;
  const percentComplete = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  // --- ACTIONS (Delegated to Hook) ---

  const handleAddItem = async () => {
    if (!activeModal || !newItemText.trim()) return;

    await addItem(activeModal, {
      content: newItemText.trim(),
      dueDate: newItemDate || undefined,
      imageUrl: newItemImage || undefined,
    });

    // Clear the form
    setNewItemText("");
    setNewItemDate("");
    setNewItemImage(null);
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
    setEditingTaskImage(item.imageUrl || null);
  };

  const cancelEditing = () => setEditingItemId(null);

  const saveEditedItem = async (categoryId: CategoryId, itemId: string) => {
    if (!editingTaskText.trim()) return;
    
    await updateItem(itemId, {
      content: editingTaskText.trim(),
      dueDate: editingTaskDate || undefined,
      imageUrl: editingTaskImage || undefined
    });
    
    setEditingItemId(null);
  };

  // --- HELPERS ---

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEditMode: boolean) => {
    if (e.target.files && e.target.files[0]) {
      const imageUrl = URL.createObjectURL(e.target.files[0]);
      if (isEditMode) {
        setEditingTaskImage(imageUrl);
      } else {
        setNewItemImage(imageUrl);
      }
    }
  };

  const renderCardPreview = (categoryId: CategoryId) => {
    const list = items[categoryId] || [];
    if (list.length === 0) return <p className="text-sm text-slate-400 italic">Empty</p>;

    const preview = list.slice(0, 2);
    const remainder = list.length - 2;

    return (
      <ul className="text-slate-600 text-sm space-y-2">
        {preview.map(item => (
          <li key={item.id} className="flex items-start gap-2">
            <span className="text-slate-300">•</span> 
            <span className="truncate">{item.content}</span>
          </li>
        ))}
        {remainder > 0 && <li className="text-xs text-slate-400 mt-2 font-medium">+{remainder} more</li>}
      </ul>
    );
  };

  if (loading) return <div className="p-12 text-center text-emerald-600">Loading workspace...</div>;

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-6xl mx-auto">
      
      {/* Header Section */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
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

        <div className="w-full md:w-1/2 h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${percentComplete}%` }}></div>
        </div>
      </div>

      {/* Grid Workspace */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { id: 'tasks', title: 'Tasks', icon: ClipboardList, color: 'text-blue-500' },
          { id: 'taskDone', title: 'Task Done', icon: CheckCircle2, color: 'text-emerald-500' },
          { id: 'itemsNeeded', title: 'Items Needed', icon: ShoppingBag, color: 'text-pink-500' },
          { id: 'pujaItems', title: 'Puja Items', icon: Flame, color: 'text-orange-500' },
          { id: 'games', title: 'Games', icon: Gamepad2, color: 'text-purple-500' },
          { id: 'vendors', title: 'Vendors', icon: Store, color: 'text-teal-500' },
          { id: 'ideas', title: 'Ideas', icon: Lightbulb, color: 'text-amber-500' },
          { id: 'notes', title: 'Notes', icon: FileText, color: 'text-slate-500' },
        ].map((card) => (
          <button 
            key={card.id}
            onClick={() => { setActiveModal(card.id as CategoryId); setEditingItemId(null); }}
            className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow text-left h-full flex flex-col group"
          >
            <div className="flex items-center gap-3 mb-4">
              <card.icon className={`w-5 h-5 ${card.color}`} />
              <h2 className="font-bold text-slate-800 text-lg group-hover:text-emerald-600 transition-colors">{card.title}</h2>
            </div>
            <div className="flex-1">
              {renderCardPreview(card.id as CategoryId)}
            </div>
          </button>
        ))}

        <Link href={`/events/${rawEventName}/outfits`} className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow text-left h-full flex flex-col group">
          <div className="flex items-center gap-3 mb-4">
            <Shirt className="w-5 h-5 text-red-500" />
            <h2 className="font-bold text-slate-800 text-lg group-hover:text-emerald-600 transition-colors">Outfit</h2>
          </div>
          <p className="text-sm text-slate-400 italic">Manage Outfits</p>
        </Link>

        <Link href="/budget" className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-200 transition-all flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <IndianRupee className="w-5 h-5 text-slate-800" />
            <h2 className="font-bold text-slate-800 text-lg">Expenses</h2>
          </div>
          <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
        </Link>
      </div>

      {/* MODAL */}
      <Dialog open={!!activeModal} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="capitalize text-lg font-serif">
              Manage {activeModal?.replace(/([A-Z])/g, ' $1').trim()}
            </DialogTitle>
          </DialogHeader>
          
          {/* Add New Item Form */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 mt-2">
            <textarea 
            className="w-full border p-2.5 rounded-lg outline-none focus:border-emerald-500 text-sm resize-none"
            placeholder="Type new entry here... (Desktop: Shift + Enter for new line)"
            rows={2}
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                // Detect if the user is on a touch device (mobile/tablet)
              const isTouchDevice = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
              if (!isTouchDevice) {
                e.preventDefault(); // Prevent new line
                handleAddItem();    // Submit form
              }
              }
            }}
            />

            <div className="flex gap-2 h-[42px]">
              {activeModal === 'tasks' && (
                <input 
                  type="date"
                  className="w-1/3 border px-3 rounded-lg outline-none focus:border-emerald-500 text-sm text-slate-600"
                  placeholder="Date of Completion"
                  value={newItemDate}
                  onChange={(e) => setNewItemDate(e.target.value)}
                />
              )}
              
              <div className="flex-1 relative h-full">
                <input 
                  type="file"
                  accept="image/*"
                  id="add-image"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, false)}
                />
                <label 
                  htmlFor="add-image" 
                  className={`flex items-center justify-center w-full h-full border border-dashed rounded-lg cursor-pointer text-sm transition-colors ${newItemImage ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'}`}
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  {newItemImage ? "Image Attached ✓" : "Upload Image"}
                </label>
                {newItemImage && (
                   <button onClick={() => setNewItemImage(null)} className="absolute -top-2 -right-2 bg-red-100 text-red-500 rounded-full p-1 hover:bg-red-200">
                     <X className="w-3 h-3" />
                   </button>
                )}
              </div>

              <Button onClick={handleAddItem} className="bg-emerald-600 hover:bg-emerald-700 h-full">
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>
          </div>

          {/* List Items */}
          <div className="mt-4 space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {activeModal && items[activeModal]?.map((item) => (
              <div key={item.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 border border-slate-200 p-3.5 rounded-xl bg-white shadow-sm">
                
                {/* --- EDIT MODE --- */}
                {editingItemId === item.id ? (
                  <div className="flex-1 flex flex-col gap-2 w-full">
                    <textarea 
                    value={editingTaskText}
                    onChange={(e) => setEditingTaskText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        const isTouchDevice = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
                        if (!isTouchDevice) {
                          e.preventDefault();
                          saveEditedItem(activeModal, item.id);
                        }
                      }
                    }}
                    className="border border-emerald-500 rounded-md outline-none px-2 py-2 text-slate-700 text-sm w-full resize-none" rows={3}
                    />
                    
                    <div className="flex gap-2 text-sm h-8 mt-1">
                      <input 
                        type="date"
                        value={editingTaskDate}
                        onChange={(e) => setEditingTaskDate(e.target.value)}
                        className="border rounded px-2 outline-none w-1/3 text-slate-600"
                      />
                      <div className="flex-1 relative">
                        <input 
                          type="file"
                          accept="image/*"
                          id={`edit-image-${item.id}`}
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, true)}
                        />
                        <label 
                          htmlFor={`edit-image-${item.id}`} 
                          className="flex items-center justify-center w-full h-full border border-dashed rounded cursor-pointer text-slate-500 hover:bg-slate-50"
                        >
                          <ImageIcon className="w-3 h-3 mr-1" />
                          {editingTaskImage ? "Change Image" : "Upload Image"}
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2 mt-2">
                      {editingTaskImage && (
                        <button onClick={() => setEditingTaskImage(null)} className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded-md hover:bg-red-100 mr-auto">Remove Image</button>
                      )}
                      <button onClick={cancelEditing} className="px-3 py-1 text-xs bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200">Cancel</button>
                      <button onClick={() => saveEditedItem(activeModal, item.id)} className="px-3 py-1 text-xs bg-emerald-600 text-white rounded-md hover:bg-emerald-700">Save</button>
                    </div>
                  </div>
                ) : (
                  
                /* --- DISPLAY MODE --- */
                  <>
                    <div className="flex-1">
                      {/* Added whitespace-pre-wrap to respect new lines from Shift+Enter */}
                      <p className={`text-sm text-slate-800 whitespace-pre-wrap break-words ${activeModal === 'taskDone' ? 'line-through text-slate-400' : ''}`}>
                        {item.content}
                      </p>
                      
                      {item.dueDate && (
                        <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-1.5">
                          <Calendar className="w-3 h-3" /> Due: {formatDate(item.dueDate)}
                        </p>
                      )}

                      {item.imageUrl && (
                        <div className="mt-3 rounded-lg border border-slate-200 overflow-hidden w-full max-w-[150px] shadow-sm">
                          <img src={item.imageUrl} alt="Attached item" className="w-full h-auto object-cover" />
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
            ))}
            
            {activeModal && (!items[activeModal] || items[activeModal].length === 0) && (
              <p className="text-center text-slate-400 text-sm py-8 border-2 border-dashed border-slate-100 rounded-xl">No entries yet.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}















// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import { useParams } from "next/navigation";
// import { 
//   ClipboardList, CheckCircle2, ShoppingBag, Flame, 
//   Gamepad2, Store, Lightbulb, Shirt, FileText, 
//   IndianRupee, ExternalLink, Plus, Trash2, Check, 
//   RotateCcw, Pencil, X, Calendar, Image as ImageIcon
// } from "lucide-react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { useEventItems, CategoryId, WorkspaceItem } from '@/hooks/useEventItems';

// export default function EventWorkspacePage() {
//   const params = useParams();
//   const rawEventName = (params?.eventName as string) || "Event";
//   const formattedEventName = rawEventName.charAt(0).toUpperCase() + rawEventName.slice(1);

//   // 1. Data State (Now managed by the custom hook)
//   const { items, loading, addItem, updateItem, deleteItem, moveItem } = useEventItems(rawEventName);

//   // 2. Modal Add/View State
//   const [activeModal, setActiveModal] = useState<CategoryId | null>(null);
//   const [newItemText, setNewItemText] = useState("");
//   const [newItemDate, setNewItemDate] = useState("");
//   const [newItemImage, setNewItemImage] = useState<string | null>(null);

//   // 3. Edit Mode State
//   const [editingItemId, setEditingItemId] = useState<string | null>(null);
//   const [editingTaskText, setEditingTaskText] = useState("");
//   const [editingTaskDate, setEditingTaskDate] = useState("");
//   const [editingTaskImage, setEditingTaskImage] = useState<string | null>(null);

//   // Progress Bar Calculations
//   const totalTasks = (items.tasks?.length || 0) + (items.taskDone?.length || 0);
//   const completedTasks = items.taskDone?.length || 0;
//   const percentComplete = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

//   // --- ACTIONS (Delegated to Hook) ---

// const handleAddItem = async () => {
//   if (!activeModal || !newItemText.trim()) return;

//   await addItem(activeModal, {
//     content: newItemText.trim(),
//     dueDate: newItemDate || undefined,
//     imageUrl: newItemImage || undefined,
//   });

//   // Clear the form
//   setNewItemText("");
//   setNewItemDate("");
//   setNewItemImage(null);
// };

//   const handleDeleteItem = async (categoryId: CategoryId, itemId: string) => {
//     await deleteItem(itemId);
//   };

//   const handleMoveTask = async (itemId: string, toCategory: CategoryId) => {
//     await moveItem(itemId, toCategory);
//   };

//   const startEditing = (item: WorkspaceItem) => {
//     setEditingItemId(item.id);
//     setEditingTaskText(item.content);
//     setEditingTaskDate(item.dueDate || "");
//     setEditingTaskImage(item.imageUrl || null);
//   };

//   const cancelEditing = () => setEditingItemId(null);

//   const saveEditedItem = async (categoryId: CategoryId, itemId: string) => {
//     if (!editingTaskText.trim()) return;
    
//     await updateItem(itemId, {
//       content: editingTaskText.trim(),
//       dueDate: editingTaskDate || undefined,
//       imageUrl: editingTaskImage || undefined
//     });
    
//     setEditingItemId(null);
//   };

//   // --- HELPERS ---

//   const formatDate = (dateString: string) => {
//     if (!dateString) return "";
//     return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
//   };

//   const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEditMode: boolean) => {
//     if (e.target.files && e.target.files[0]) {
//       const imageUrl = URL.createObjectURL(e.target.files[0]);
//       if (isEditMode) {
//         setEditingTaskImage(imageUrl);
//       } else {
//         setNewItemImage(imageUrl);
//       }
//     }
//   };

//   const renderCardPreview = (categoryId: CategoryId) => {
//     const list = items[categoryId] || [];
//     if (list.length === 0) return <p className="text-sm text-slate-400 italic">Empty</p>;

//     const preview = list.slice(0, 2);
//     const remainder = list.length - 2;

//     return (
//       <ul className="text-slate-600 text-sm space-y-2">
//         {preview.map(item => (
//           <li key={item.id} className="flex items-start gap-2">
//             <span className="text-slate-300">•</span> 
//             <span className="truncate">{item.content}</span>
//           </li>
//         ))}
//         {remainder > 0 && <li className="text-xs text-slate-400 mt-2 font-medium">+{remainder} more</li>}
//       </ul>
//     );
//   };

//   if (loading) return <div className="p-12 text-center text-emerald-600">Loading workspace...</div>;

//   return (
//     <div className="min-h-screen p-6 md:p-12 max-w-6xl mx-auto">
      
//       {/* Header Section */}
//       <div className="mb-10">
//         <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
//           <h1 className="text-3xl font-serif font-bold text-emerald-900">
//             {formattedEventName} Workspace
//           </h1>
//           <div className="flex items-center gap-3">
//             <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
//               {percentComplete}% Completed
//             </span>
//             <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-medium tracking-wide">
//               {completedTasks} / {totalTasks} Tasks
//             </span>
//           </div>
//         </div>

//         <div className="w-full md:w-1/2 h-2.5 bg-slate-100 rounded-full overflow-hidden">
//           <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${percentComplete}%` }}></div>
//         </div>
//       </div>

//       {/* Grid Workspace */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {[
//           { id: 'tasks', title: 'Tasks', icon: ClipboardList, color: 'text-blue-500' },
//           { id: 'taskDone', title: 'Task Done', icon: CheckCircle2, color: 'text-emerald-500' },
//           { id: 'itemsNeeded', title: 'Items Needed', icon: ShoppingBag, color: 'text-pink-500' },
//           { id: 'pujaItems', title: 'Puja Items', icon: Flame, color: 'text-orange-500' },
//           { id: 'games', title: 'Games', icon: Gamepad2, color: 'text-purple-500' },
//           { id: 'vendors', title: 'Vendors', icon: Store, color: 'text-teal-500' },
//           { id: 'ideas', title: 'Ideas', icon: Lightbulb, color: 'text-amber-500' },
//           { id: 'notes', title: 'Notes', icon: FileText, color: 'text-slate-500' },
//         ].map((card) => (
//           <button 
//             key={card.id}
//             onClick={() => { setActiveModal(card.id as CategoryId); setEditingItemId(null); }}
//             className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow text-left h-full flex flex-col group"
//           >
//             <div className="flex items-center gap-3 mb-4">
//               <card.icon className={`w-5 h-5 ${card.color}`} />
//               <h2 className="font-bold text-slate-800 text-lg group-hover:text-emerald-600 transition-colors">{card.title}</h2>
//             </div>
//             <div className="flex-1">
//               {renderCardPreview(card.id as CategoryId)}
//             </div>
//           </button>
//         ))}

//         <Link href={`/events/${rawEventName}/outfits`} className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow text-left h-full flex flex-col group">
//           <div className="flex items-center gap-3 mb-4">
//             <Shirt className="w-5 h-5 text-red-500" />
//             <h2 className="font-bold text-slate-800 text-lg group-hover:text-emerald-600 transition-colors">Outfit</h2>
//           </div>
//           <p className="text-sm text-slate-400 italic">Manage Outfits</p>
//         </Link>

//         <Link href="/budget" className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-200 transition-all flex items-center justify-between group">
//           <div className="flex items-center gap-3">
//             <IndianRupee className="w-5 h-5 text-slate-800" />
//             <h2 className="font-bold text-slate-800 text-lg">Expenses</h2>
//           </div>
//           <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
//         </Link>
//       </div>

//       {/* MODAL */}
//       <Dialog open={!!activeModal} onOpenChange={(open) => !open && setActiveModal(null)}>
//         <DialogContent className="sm:max-w-xl">
//           <DialogHeader>
//             <DialogTitle className="capitalize text-lg font-serif">
//               Manage {activeModal?.replace(/([A-Z])/g, ' $1').trim()}
//             </DialogTitle>
//           </DialogHeader>
          
//           {/* Add New Item Form */}
//           <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 mt-2">
//             <input 
//               className="w-full border p-2.5 rounded-lg outline-none focus:border-emerald-500 text-sm"
//               placeholder="Type new entry here..."
//               value={newItemText}
//               onChange={(e) => setNewItemText(e.target.value)}
//               onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
//             />
//             <div className="flex gap-2 h-[42px]">
//               {activeModal === 'tasks' && (
//                 <input 
//                   type="date"
//                   className="w-1/3 border px-3 rounded-lg outline-none focus:border-emerald-500 text-sm text-slate-600"
//                   placeholder="Date of Completion"
//                   value={newItemDate}
//                   onChange={(e) => setNewItemDate(e.target.value)}
//                 />
//               )}
              
//               <div className="flex-1 relative h-full">
//                 <input 
//                   type="file"
//                   accept="image/*"
//                   id="add-image"
//                   className="hidden"
//                   onChange={(e) => handleImageUpload(e, false)}
//                 />
//                 <label 
//                   htmlFor="add-image" 
//                   className={`flex items-center justify-center w-full h-full border border-dashed rounded-lg cursor-pointer text-sm transition-colors ${newItemImage ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'}`}
//                 >
//                   <ImageIcon className="w-4 h-4 mr-2" />
//                   {newItemImage ? "Image Attached ✓" : "Upload Image"}
//                 </label>
//                 {newItemImage && (
//                    <button onClick={() => setNewItemImage(null)} className="absolute -top-2 -right-2 bg-red-100 text-red-500 rounded-full p-1 hover:bg-red-200">
//                      <X className="w-3 h-3" />
//                    </button>
//                 )}
//               </div>

//               <Button onClick={handleAddItem} className="bg-emerald-600 hover:bg-emerald-700 h-full">
//                 <Plus className="w-4 h-4 mr-1" /> Add
//               </Button>
//             </div>
//           </div>

//           {/* List Items */}
//           <div className="mt-4 space-y-3 max-h-[400px] overflow-y-auto pr-2">
//             {activeModal && items[activeModal]?.map((item) => (
//               <div key={item.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 border border-slate-200 p-3.5 rounded-xl bg-white shadow-sm">
                
//                 {/* --- EDIT MODE --- */}
//                 {editingItemId === item.id ? (
//                   <div className="flex-1 flex flex-col gap-2 w-full">
//                     <input 
//                       value={editingTaskText}
//                       onChange={(e) => setEditingTaskText(e.target.value)}
//                       className="border-b border-emerald-500 outline-none px-1 py-1 text-slate-700 text-sm"
//                     />
//                     <div className="flex gap-2 text-sm h-8 mt-1">
//                       <input 
//                         type="date"
//                         value={editingTaskDate}
//                         onChange={(e) => setEditingTaskDate(e.target.value)}
//                         className="border rounded px-2 outline-none w-1/3 text-slate-600"
//                       />
//                       <div className="flex-1 relative">
//                         <input 
//                           type="file"
//                           accept="image/*"
//                           id={`edit-image-${item.id}`}
//                           className="hidden"
//                           onChange={(e) => handleImageUpload(e, true)}
//                         />
//                         <label 
//                           htmlFor={`edit-image-${item.id}`} 
//                           className="flex items-center justify-center w-full h-full border border-dashed rounded cursor-pointer text-slate-500 hover:bg-slate-50"
//                         >
//                           <ImageIcon className="w-3 h-3 mr-1" />
//                           {editingTaskImage ? "Change Image" : "Upload Image"}
//                         </label>
//                       </div>
//                     </div>
                    
//                     <div className="flex justify-end gap-2 mt-2">
//                       {editingTaskImage && (
//                         <button onClick={() => setEditingTaskImage(null)} className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded-md hover:bg-red-100 mr-auto">Remove Image</button>
//                       )}
//                       <button onClick={cancelEditing} className="px-3 py-1 text-xs bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200">Cancel</button>
//                       <button onClick={() => saveEditedItem(activeModal, item.id)} className="px-3 py-1 text-xs bg-emerald-600 text-white rounded-md hover:bg-emerald-700">Save</button>
//                     </div>
//                   </div>
//                 ) : (
                  
//                 /* --- DISPLAY MODE --- */
//                   <>
//                     <div className="flex-1">
//                       <p className={`text-sm text-slate-800 ${activeModal === 'taskDone' ? 'line-through text-slate-400' : ''}`}>
//                         {item.content}
//                       </p>
                      
//                       {item.dueDate && (
//                         <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-1.5">
//                           <Calendar className="w-3 h-3" /> Due: {formatDate(item.dueDate)}
//                         </p>
//                       )}

//                       {item.imageUrl && (
//                         <div className="mt-3 rounded-lg border border-slate-200 overflow-hidden w-full max-w-[150px] shadow-sm">
//                           <img src={item.imageUrl} alt="Attached item" className="w-full h-auto object-cover" />
//                         </div>
//                       )}
//                     </div>

//                     <div className="flex gap-1.5 shrink-0">
//                       <button onClick={() => startEditing(item)} className="p-1.5 border border-slate-100 text-slate-400 bg-slate-50 rounded-md hover:bg-slate-100 hover:text-slate-600" title="Edit">
//                         <Pencil className="w-4 h-4" />
//                       </button>
                      
//                       {activeModal === 'tasks' && (
//                         <button onClick={() => handleMoveTask(item.id, 'taskDone')} className="p-1.5 border border-emerald-100 text-emerald-500 bg-white rounded-md hover:bg-emerald-50" title="Mark Done">
//                           <Check className="w-4 h-4" />
//                         </button>
//                       )}

//                       {activeModal === 'taskDone' && (
//                         <button onClick={() => handleMoveTask(item.id, 'tasks')} className="p-1.5 border border-amber-100 text-amber-500 bg-white rounded-md hover:bg-amber-50" title="Restore to Tasks">
//                           <RotateCcw className="w-4 h-4" />
//                         </button>
//                       )}

//                       <button onClick={() => handleDeleteItem(activeModal, item.id)} className="p-1.5 border border-red-100 text-red-400 bg-white rounded-md hover:bg-red-50" title="Delete">
//                         <Trash2 className="w-4 h-4" />
//                       </button>
//                     </div>
//                   </>
//                 )}
//               </div>
//             ))}
            
//             {activeModal && (!items[activeModal] || items[activeModal].length === 0) && (
//               <p className="text-center text-slate-400 text-sm py-8 border-2 border-dashed border-slate-100 rounded-xl">No entries yet.</p>
//             )}
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }










