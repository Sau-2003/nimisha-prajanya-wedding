"use client";

import { useState } from "react";
import { 
  Plus, Trash2, Pencil, X, Image as ImageIcon, FolderPlus, Check, Maximize2
} from "lucide-react";
import { DressIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useOptions, OptionItem } from "@/hooks/useOptions";

export default function OptionsPage() {
  const {
    tabs,
    activeTab,
    setActiveTab,
    addTab,
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

  // New Item Input State
  const [caption, setCaption] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  // Edit Mode State
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingCaption, setEditingCaption] = useState("");
  const [editingFile, setEditingFile] = useState<File | null>(null);
  const [editingPreview, setEditingPreview] = useState<string | null>(null);

  // Handlers
  const handleAddTabSubmit = () => {
    addTab(newTabLabel);
    setNewTabLabel("");
    setIsAddingTab(false);
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
    await addOptionItem(caption, selectedFile);
    setCaption("");
    setSelectedFile(null);
    setFilePreview(null);
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

  return (
    <div className="min-h-screen p-4 md:p-10 max-w-7xl mx-auto space-y-8 md:ml-64">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif font-bold text-emerald-900 flex items-center gap-3">
          <DressIcon className="w-8 h-8 text-emerald-700" /> Options
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Organize themes, outfits, and decorations under custom tabs.
        </p>
      </div>

      {/* --- TOP TABS BAR WITH DELETE TAB OPTION --- */}
      <div className="border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <div
                key={tab.id}
                className={`group flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-emerald-900 text-white shadow-md"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <button
                  onClick={() => {
                    setActiveTab(tab.id);
                    setEditingItemId(null);
                  }}
                  className="outline-none"
                >
                  {tab.label}
                </button>

                {/* Delete Tab Icon */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTab(tab.id);
                  }}
                  className={`p-0.5 rounded-full hover:bg-black/10 transition-colors ${
                    isActive ? "text-emerald-200 hover:text-white" : "text-slate-400 hover:text-red-500"
                  }`}
                  title={`Delete ${tab.label} Tab`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}

          {/* Add New Tab */}
          {isAddingTab ? (
            <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-300 shrink-0">
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
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 shrink-0 border border-emerald-300 border-dashed"
            >
              <Plus className="w-3.5 h-3.5" /> Add Tab
            </button>
          )}
        </div>
      </div>

      {/* --- ADD NEW OPTION FORM --- */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
          {activeTab 
            ? `Add New Option to "${tabs.find((t) => t.id === activeTab)?.label || activeTab}"` 
            : "Create a Tab First to Add Options"}
        </h2>

        <div className="space-y-3">
          <textarea
            className="w-full border p-3 rounded-xl outline-none focus:border-emerald-500 text-sm resize-none"
            placeholder="Write a caption or details..."
            rows={2}
            value={caption}
            disabled={!activeTab}
            onChange={(e) => setCaption(e.target.value)}
          />

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1 relative h-11">
              <input
                type="file"
                accept="image/*"
                id="add-option-image"
                className="hidden"
                disabled={!activeTab}
                onChange={(e) => handleFileChange(e, false)}
              />
              <label
                htmlFor="add-option-image"
                className={`flex items-center justify-center w-full h-full border border-dashed rounded-xl cursor-pointer text-sm font-medium transition-colors ${
                  filePreview
                    ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                    : "bg-slate-50 border-slate-300 text-slate-500 hover:bg-slate-100"
                } ${!activeTab ? "pointer-events-none opacity-50" : ""}`}
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                {filePreview ? "Photo Selected ✓" : "Upload Image"}
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

            <Button onClick={handleCreateOption} disabled={!activeTab} className="bg-emerald-800 hover:bg-emerald-900 h-11 px-6">
              <Plus className="w-4 h-4 mr-1" /> Add Option
            </Button>
          </div>

          {filePreview && (
            <div className="relative w-28 h-28 rounded-xl overflow-hidden border border-emerald-300 mt-2 shadow-sm">
              <img src={filePreview} alt="Upload preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      </div>

      {/* --- OPTIONS GRID --- */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-4">
          Saved Choices ({items.length})
        </h2>

        {items.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
            <FolderPlus className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 text-sm font-medium">
              {activeTab ? "No options added under this tab yet." : "Please add a tab above to get started."}
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

                    <div className="relative h-9">
                      <input
                        type="file"
                        accept="image/*"
                        id={`edit-file-${item.id}`}
                        className="hidden"
                        onChange={(e) => handleFileChange(e, true)}
                      />
                      <label
                        htmlFor={`edit-file-${item.id}`}
                        className="flex items-center justify-center w-full h-full border border-dashed rounded-lg cursor-pointer text-xs text-slate-500 bg-slate-50 hover:bg-slate-100"
                      >
                        <ImageIcon className="w-3 h-3 mr-1" />
                        {editingPreview ? "Replace Image" : "Upload Image"}
                      </label>
                    </div>

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
                        {item.caption}
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
                        onClick={() => deleteOptionItem(item.id)}
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