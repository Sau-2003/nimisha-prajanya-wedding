"use client";

import { useState } from "react";
import { 
  Plus, Trash2, Pencil, X, Image as ImageIcon, FolderPlus, Check, Maximize2, ShoppingBag 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useOptions, OptionItem } from "@/hooks/useOptions";

export default function OptionsPage() {
  const {
    tabs,
    activeTab,
    setActiveTab,
    addTab,
    renameTab,
    deleteTab,
    items,
    addOptionItem,
    updateOptionItem,
    deleteOptionItem,
    selectedPhoto,
    setSelectedPhoto,
  } = useOptions();

  // New Tab Input State
  const [isAddingTab, setIsAddingTab] = useState(false);
  const [newTabLabel, setNewTabLabel] = useState("");

  // Edit Tab State
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingTabLabel, setEditingTabLabel] = useState("");

  // Toggle for Add Option Section Modal/Drawer/Dropdown
  const [isAddingOptionOpen, setIsAddingOptionOpen] = useState(false);

  // New Item Input State
  const [caption, setCaption] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  // New Link Input States
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [addingLink, setAddingLink] = useState(false);

  // Edit Mode State
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingCaption, setEditingCaption] = useState("");
  const [editingFile, setEditingFile] = useState<File | null>(null);
  const [editingPreview, setEditingPreview] = useState<string | null>(null);

  // Unified Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState<
    | { type: 'item'; id: string }
    | { type: 'tab'; id: string; label: string }
    | null
  >(null);

  // Handlers
  const handleAddTabSubmit = () => {
    if (!newTabLabel.trim()) return;
    addTab(newTabLabel.trim());
    setNewTabLabel("");
    setIsAddingTab(false);
  };

  const handleRenameTabSubmit = (id: string) => {
    if (editingTabLabel.trim() && renameTab) {
      renameTab(id, editingTabLabel.trim());
    }
    setEditingTabId(null);
    setEditingTabLabel("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (isEdit) {
        setEditingFile(file);
        setEditingPreview(URL.createObjectURL(file));
      } else {
        setSelectedFile(file);
        setFilePreview(URL.createObjectURL(file));
      }
    }
  };

  const handleCreateOption = async () => {
    if (!selectedFile && !caption.trim()) return; 
    await addOptionItem(caption, selectedFile);
    setCaption("");
    setSelectedFile(null);
    setFilePreview(null);
    setIsAddingOptionOpen(false); // Close form after submission
  };

  const handleAddLink = async () => {
    if (!newLinkUrl.trim()) return; 
    setAddingLink(true);
    try {
      const formattedCaption = newLinkTitle.trim() 
        ? `${newLinkTitle.trim()}: ${newLinkUrl.trim()}` 
        : newLinkUrl.trim();
      
      await addOptionItem(formattedCaption, selectedFile);
      setNewLinkTitle("");
      setNewLinkUrl("");
      setSelectedFile(null);
      setFilePreview(null);
      setIsAddingOptionOpen(false); // Close form after submission
    } finally {
      setAddingLink(false);
    }
  };

  const startEditing = (item: OptionItem) => {
    setEditingItemId(item.id);
    setEditingCaption(item.caption);
    setEditingPreview(item.imageUrl || null);
    setEditingFile(null);
  };

  const saveEdit = async (id: string) => {
    await updateOptionItem(id, editingCaption, editingFile, !editingPreview);
    setEditingItemId(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'item') {
      await deleteOptionItem(deleteTarget.id);
    } else if (deleteTarget.type === 'tab') {
      await deleteTab(deleteTarget.id);
    }

    setDeleteTarget(null);
  };

  return (
    <div className="min-h-screen p-4 md:p-10 max-w-7xl mx-auto space-y-8 md:ml-64">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif font-bold text-emerald-900 flex items-center gap-3">
          <ShoppingBag className="w-8 h-8 text-emerald-700" /> Shoping
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Organize themes, outfits, and decorations under custom tabs.
        </p>
      </div>

      {/* --- TAB CONTROLS & TABS LIST --- */}
      <div className="space-y-4">
        {/* Top Action Bar (Add Tab / Insert Option) */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Add New Tab */}
          {isAddingTab ? (
            <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-300 w-max">
              <input
                type="text"
                placeholder="Tab Name..."
                value={newTabLabel}
                onChange={(e) => setNewTabLabel(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTabSubmit()}
                className="text-xs px-2.5 py-1.5 border rounded-lg outline-none bg-white w-32"
                autoFocus
              />
              <Button size="sm" onClick={handleAddTabSubmit} className="bg-emerald-700 h-7 text-xs px-2.5">
                Add
              </Button>
              <button onClick={() => setIsAddingTab(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingTab(true)}
              className="flex items-center w-max gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 border-dashed"
            >
              <Plus className="w-3.5 h-3.5" /> Add Tab
            </button>
          )}

          {/* Action Button to Open Insert Form */}
          {activeTab && (
            <Button 
              onClick={() => setIsAddingOptionOpen(!isAddingOptionOpen)}
              className="bg-emerald-800 hover:bg-emerald-900 text-white shrink-0 shadow-sm w-max"
            >
              <Plus className="w-4 h-4 mr-2" /> 
              {isAddingOptionOpen ? "Close Form" : "Insert Image / Link"}
            </Button>
          )}
        </div>

        {/* Tabs List */}
        <div className="border-b border-slate-200 pb-3 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const isEditingThisTab = editingTabId === tab.id;

            return (
              <div
                key={tab.id}
                className={`group flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-emerald-900 text-white shadow-md"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {isEditingThisTab ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={editingTabLabel}
                      onChange={(e) => setEditingTabLabel(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleRenameTabSubmit(tab.id)}
                      className="text-xs px-2 py-1 border rounded-md outline-none text-slate-900 w-28 bg-white"
                      autoFocus
                    />
                    <button
                      onClick={() => handleRenameTabSubmit(tab.id)}
                      className="p-1 text-emerald-600 hover:text-emerald-700 bg-white rounded-md"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingTabId(null)}
                      className="p-1 text-slate-400 hover:text-slate-600 bg-white rounded-md"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setActiveTab(tab.id);
                        setEditingItemId(null);
                      }}
                      className="outline-none"
                    >
                      {tab.label}
                    </button>

                    {/* Edit Tab Icon */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTabId(tab.id);
                        setEditingTabLabel(tab.label);
                      }}
                      className={`p-0.5 rounded-full hover:bg-black/10 transition-colors ${
                        isActive ? "text-emerald-200 hover:text-white" : "text-slate-400 hover:text-slate-700"
                      }`}
                      title={`Edit ${tab.label} Tab`}
                    >
                      <Pencil className="w-3 h-3" />
                    </button>

                    {/* Delete Tab Icon */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget({ type: 'tab', id: tab.id, label: tab.label });
                      }}
                      className={`p-0.5 rounded-full hover:bg-black/10 transition-colors ${
                        isActive ? "text-emerald-200 hover:text-white" : "text-slate-400 hover:text-red-500"
                      }`}
                      title={`Delete ${tab.label} Tab`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* --- ADD NEW OPTION FORM (Image OR Link) --- */}
      {isAddingOptionOpen && activeTab && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              {`Insert Image / Link into "${tabs.find((t) => t.id === activeTab)?.label || activeTab}"`}
            </h2>
            <button 
              onClick={() => setIsAddingOptionOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Step 1: Image Upload Selector (Now Optional) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1 relative h-11">
                <input
                  type="file"
                  accept="image/*"
                  id="add-option-image"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, false)}
                />
                <label
                  htmlFor="add-option-image"
                  className={`flex items-center justify-center w-full h-full border border-dashed rounded-xl cursor-pointer text-sm font-medium transition-colors ${
                    filePreview
                      ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                      : "bg-slate-50 border-slate-300 text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  {filePreview ? "Photo Selected ✓" : "Upload Image (Optional)"}
                </label>

                {filePreview && (
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setFilePreview(null);
                    }}
                    className="absolute -top-2 -right-2 bg-red-100 text-red-500 rounded-full p-1 hover:bg-red-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {filePreview && (
              <div className="relative w-28 h-28 rounded-xl overflow-hidden border border-emerald-300 shadow-sm">
                <img src={filePreview} alt="Upload preview" className="w-full h-full object-cover" />
              </div>
            )}

            {/* Captions & Details - Always available */}
            <div className="space-y-3">
              <textarea
                className="w-full border p-3 rounded-xl outline-none focus:border-emerald-500 text-sm resize-none bg-white"
                placeholder="Write a caption or details (Optional if adding a link)..."
                rows={2}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />

              <div className="flex justify-end">
                <Button 
                  onClick={handleCreateOption} 
                  disabled={!filePreview && !caption.trim()} 
                  className="bg-emerald-800 hover:bg-emerald-900 h-11 px-6"
                >
                  <Plus className="w-4 h-4 mr-1" /> Save Image/Text Option
                </Button>
              </div>
            </div>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink-0 mx-4 text-slate-400 text-xs uppercase font-semibold">OR Add Link</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            {/* Link Input Row - Always available */}
            <div className="bg-slate-50 border p-4 rounded-xl flex flex-col md:flex-row gap-3 items-stretch md:items-center">
              <input 
                type="text" 
                placeholder="Link title/label (optional)..."
                value={newLinkTitle}
                onChange={(e) => setNewLinkTitle(e.target.value)}
                className="w-full md:w-1/3 border p-2 rounded-lg bg-white outline-none text-sm focus:border-emerald-500"
              />
              <input 
                type="url" 
                placeholder="Paste link here (e.g., amazon.in/...)"
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
                className="flex-1 border p-2 rounded-lg bg-white outline-none text-sm focus:border-emerald-500"
              />
              <Button 
                onClick={handleAddLink} 
                disabled={addingLink || !newLinkUrl.trim()}
                variant="outline"
                className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 whitespace-nowrap"
              >
                Save Link
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* --- OPTIONS GRID --- */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-4">
          Saved Choices ({items.length})
        </h2>

        {items.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
            <FolderPlus className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 text-sm font-medium">
              {activeTab ? "No options added under this tab yet." : "Please select or add a tab above to get started."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between transition-all hover:shadow-md"
              >
                {editingItemId === item.id ? (
                  <div className="space-y-3">
                    <textarea
                      value={editingCaption}
                      onChange={(e) => setEditingCaption(e.target.value)}
                      className="w-full border p-2 text-xs rounded-lg outline-none focus:border-emerald-500 resize-none"
                      rows={3}
                    />

                    {editingPreview && (
                      <div className="relative w-full h-36 rounded-lg overflow-hidden border">
                        <img src={editingPreview} alt="Edit preview" className="w-full h-full object-cover" />
                        <button
                          onClick={() => {
                            setEditingFile(null);
                            setEditingPreview(null);
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => setEditingItemId(null)}
                        className="px-3 py-1.5 text-xs bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => saveEdit(item.id)}
                        className="px-3 py-1.5 text-xs bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {item.imageUrl && (
                        <div 
                          onClick={() => setSelectedPhoto(item.imageUrl || null)}
                          className="relative group cursor-pointer w-full h-48 rounded-xl overflow-hidden border border-slate-100"
                        >
                          <img 
                            src={item.imageUrl} 
                            alt="Option Choice" 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <Maximize2 className="w-6 h-6" />
                          </div>
                        </div>
                      )}
                      <p className="text-sm text-slate-700 whitespace-pre-wrap break-words">
                        {item.caption.split(/(https?:\/\/[^\s]+)/g).map((part, index) =>
                          /^https?:\/\/[^\s]+$/.test(part) ? (
                            <a
                              key={index}
                              href={part}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-600 underline hover:text-emerald-700 break-all"
                            >
                              {part}
                            </a>
                          ) : (
                            part
                          )
                        )}
                      </p>
                    </div>

                    <div className="flex justify-end gap-1.5 mt-4 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => startEditing(item)}
                        className="p-1.5 border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-50 hover:text-slate-700"
                        title="Edit Option"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ type: 'item', id: item.id })}
                        className="p-1.5 border border-red-100 text-red-400 rounded-lg hover:bg-red-50 hover:text-red-600"
                        title="Delete Option"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- UNIFIED DELETE CONFIRMATION MODAL --- */}
      <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-900">Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-2 text-slate-600">
            {deleteTarget?.type === 'item' 
              ? "Are you sure you want to delete this item? This action cannot be undone."
              : `Are you sure you want to delete the "${deleteTarget?.label}" tab and all its items? This action cannot be undone.`
            }
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white" 
              onClick={handleConfirmDelete}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- FULL SCREEN LIGHTBOX --- */}
      <Dialog open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl p-2 bg-black/90 border-none flex items-center justify-center">
          {selectedPhoto && (
            <div className="relative w-full max-h-[85vh] flex items-center justify-center">
              <img src={selectedPhoto} alt="Full view" className="max-w-full max-h-[85vh] object-contain rounded-lg" />
              <button 
                onClick={() => setSelectedPhoto(null)}
                className="absolute -top-3 -right-3 bg-white/20 hover:bg-white/40 text-white rounded-full p-2"
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