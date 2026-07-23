
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  X, 
  Pin, 
  BookIcon, 
  PlusCircle, 
  MinusCircle, 
  Grid 
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { useNotes } from "@/hooks/useNotes";

// --- EXCEL TABLE EDITOR COMPONENT ---
function ExcelTableEditor({ 
  tableData, 
  onChange 
}: { 
  tableData: any; 
  onChange: (newData: string[][]) => void; 
}) {
  let grid: string[][] = [["Outfit", "Event", "Date"], ["", "", ""]];
  
  if (Array.isArray(tableData) && tableData.length > 0 && Array.isArray(tableData[0])) {
    grid = tableData;
  }

  const colCount = grid[0]?.length || 1;

  const handleCellChange = (rIdx: number, cIdx: number, val: string) => {
    const updated = grid.map((row, r) =>
      r === rIdx ? row.map((cell, c) => (c === cIdx ? val : cell)) : [...row]
    );
    onChange(updated);
  };

  const handleAddRow = () => {
    const newRow = new Array(colCount).fill("");
    onChange([...grid, newRow]);
  };

  const handleDeleteRow = (rIdx: number) => {
    if (grid.length <= 1) return;
    const updated = grid.filter((_, r) => r !== rIdx);
    onChange(updated);
  };

  const handleAddColumn = () => {
    const updated = grid.map((row, idx) => [...row, idx === 0 ? `Col ${colCount + 1}` : ""]);
    onChange(updated);
  };

  const handleDeleteColumn = (cIdx: number) => {
    if (colCount <= 1) return;
    const updated = grid.map((row) => row.filter((_, c) => c !== cIdx));
    onChange(updated);
  };

  return (
    <div className="mt-4 space-y-3">
      {/* Excel Table Action Toolbar */}
      <div className="flex items-center justify-between bg-slate-100 p-2 rounded-lg text-xs border border-slate-200">
        <span className="font-semibold text-slate-700 flex items-center gap-1.5">
          <Grid className="w-4 h-4 text-emerald-700" /> Spreadsheet
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddRow}
            className="flex items-center gap-1 px-2 py-1 bg-white hover:bg-slate-200 border rounded text-slate-700 transition"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-600" /> Row
          </button>
          <button
            type="button"
            onClick={handleAddColumn}
            className="flex items-center gap-1 px-2 py-1 bg-white hover:bg-slate-200 border rounded text-slate-700 transition"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-600" /> Column
          </button>
        </div>
      </div>

      {/* Spreadsheet Grid View */}
      <div className="overflow-x-auto rounded-lg border border-slate-300 shadow-sm bg-white">
        <table className="w-full border-collapse text-xs text-left">
          <thead>
            <tr className="bg-emerald-800 text-white">
              <th className="w-8 border border-emerald-900 px-2 py-1.5 text-center bg-emerald-900 font-mono text-[10px]">#</th>
              {grid[0].map((headerVal, cIdx) => (
                <th key={cIdx} className="border border-emerald-700 px-2 py-1.5 min-w-[120px] relative group">
                  <input
                    type="text"
                    value={headerVal || ""}
                    onChange={(e) => handleCellChange(0, cIdx, e.target.value)}
                    className="w-full bg-transparent font-semibold text-white outline-none focus:bg-emerald-700/50 rounded px-1"
                    placeholder={`Column ${cIdx + 1}`}
                  />
                  {colCount > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteColumn(cIdx)}
                      className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover:block p-0.5 bg-emerald-900 text-red-200 hover:text-red-400 rounded"
                      title="Delete Column"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </th>
              ))}
              <th className="w-10 border border-emerald-900 px-1 py-1 text-center"></th>
            </tr>
          </thead>

          <tbody>
            {grid.slice(1).map((row, rIdx) => {
              const actualRowIndex = rIdx + 1;
              return (
                <tr key={actualRowIndex} className="hover:bg-emerald-50/50 transition-colors">
                  <td className="border border-slate-200 px-2 py-1.5 text-center font-mono text-slate-400 bg-slate-50 text-[10px]">
                    {actualRowIndex}
                  </td>
                  {row.map((cellVal: any, cIdx: number) => (
                    <td key={cIdx} className="border border-slate-200 px-1 py-1">
                      <input
                        type="text"
                        value={cellVal || ""}
                        onChange={(e) => handleCellChange(actualRowIndex, cIdx, e.target.value)}
                        className="w-full px-1 py-0.5 bg-transparent outline-none focus:bg-emerald-100/60 rounded text-slate-800"
                        placeholder="Empty"
                      />
                    </td>
                  ))}
                  <td className="border border-slate-200 px-1 py-1 text-center bg-slate-50">
                    <button
                      type="button"
                      onClick={() => handleDeleteRow(actualRowIndex)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded transition"
                      title="Delete Row"
                    >
                      <MinusCircle className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- CARD COMPONENT FOR EACH INDIVIDUAL NOTE ---
function NotesCard({ gift, onDelete, onUpdate, onImageClick }: any) {
  const [title, setTitle] = useState(gift.title);
  const [content, setContent] = useState(gift.content || "");
  const [isEditing, setIsEditing] = useState(false);

  // Strictly controlled by user clicking the "Add Spreadsheet" button or if table_data explicitly has saved rows
  const [showTable, setShowTable] = useState(
    Boolean(gift.table_data && Array.isArray(gift.table_data) && gift.table_data.length > 0)
  );

  // Custom Cursor Tooltip State
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState<{ type: "item" } | { type: "image"; index: number } | null>(null);

  const isPinned = Boolean(gift.is_pinned);

  const handleTooltipMove = (e: React.MouseEvent, text: string) => {
    setMousePos({ x: e.clientX, y: e.clientY });
    if (activeTooltip !== text) setActiveTooltip(text);
  };

  const handleTooltipLeave = () => {
    setActiveTooltip(null);
  };

  const renderTextWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline break-all relative z-10 hover:text-blue-800"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Image Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    const newBase64Images = await Promise.all(
      files.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = new window.Image();
            img.onload = () => {
              const canvas = document.createElement("canvas");
              let width = img.width;
              let height = img.height;

              const MAX_WIDTH = 500;
              const MAX_HEIGHT = 500;
              if (width > height) {
                if (width > MAX_WIDTH) {
                  height = Math.round(height * (MAX_WIDTH / width));
                  width = MAX_WIDTH;
                }
              } else {
                if (height > MAX_HEIGHT) {
                  width = Math.round(width * (MAX_HEIGHT / height));
                  height = MAX_HEIGHT;
                }
              }
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext("2d");
              ctx?.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL("image/jpeg", 0.5));
            };
            img.src = event.target?.result as string;
          };
          reader.readAsDataURL(file);
        });
      })
    );

    const formattedNewImages = newBase64Images.map((url: string) => ({ url, caption: "" }));
    const currentImages = gift.images || gift.image_urls || [];
    const updatedImages = [...currentImages, ...formattedNewImages];

    onUpdate(gift.id, {
      images: updatedImages,
      image_urls: updatedImages,
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "item") {
      onDelete(gift.id);
    } else if (deleteTarget.type === "image") {
      const currentImages = gift.images || gift.image_urls || [];
      const updatedImages = currentImages.filter((_: any, i: number) => i !== deleteTarget.index);
      onUpdate(gift.id, {
        images: updatedImages,
        image_urls: updatedImages,
      });
    }
    setDeleteTarget(null);
  };

  useEffect(() => {
    setTitle(gift.title);
    setContent(gift.content || "");
    setShowTable(Boolean(gift.table_data && Array.isArray(gift.table_data) && gift.table_data.length > 0));
  }, [gift]);

  const formattedDate = gift.created_at
    ? new Date(gift.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "Just now";

  const imagesList = gift.images || gift.image_urls || [];

  return (
    <div
      className={`relative bg-white w-full rounded-xl shadow-md border overflow-hidden group transition-all duration-300 ${
        isPinned ? "border-emerald-800 ring-1 ring-emerald-800/20" : "border-slate-200"
      }`}
    >
      {/* Top Right Actions */}
      <div className="absolute top-6 right-6 flex items-center gap-2 z-20">
        <button
          type="button"
          onMouseMove={(e) => handleTooltipMove(e, isPinned ? "Unpin Note" : "Pin Note")}
          onMouseLeave={handleTooltipLeave}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onUpdate(gift.id, { is_pinned: !isPinned });
            setActiveTooltip(null);
          }}
          className={`p-2 rounded-lg transition-all shadow-sm ${
            isPinned
              ? "bg-emerald-800 text-white opacity-100 hover:bg-emerald-900"
              : "bg-slate-100 text-slate-500 opacity-50 md:group-hover:opacity-100 hover:bg-slate-200"
          }`}
        >
          <Pin className="w-4 h-4" fill={isPinned ? "currentColor" : "none"} />
        </button>

        <button
          type="button"
          onMouseMove={(e) => handleTooltipMove(e, "Delete Note")}
          onMouseLeave={handleTooltipLeave}
          onClick={(e) => {
            e.stopPropagation();
            setDeleteTarget({ type: "item" });
            setActiveTooltip(null);
          }}
          className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg opacity-50 md:group-hover:opacity-100 transition-opacity shadow-sm"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Note Header */}
      <div className="pt-6 pb-2 pl-6 md:pl-10 pr-32">
        <div className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mb-1.5 ml-1">
          {formattedDate}
        </div>
        <input
          type="text"
          className="text-xl font-sans font-semibold text-emerald-900 tracking-wide uppercase w-full bg-transparent border-b-2 border-transparent hover:border-slate-200 focus:border-emerald-600 outline-none transition-all"
          value={title}
          placeholder="NOTE TITLE..."
          onChange={(e) => setTitle(e.target.value.toUpperCase())}
          onBlur={() => onUpdate(gift.id, { title })}
        />
      </div>

      {/* Note Body */}
      <div className="w-full px-6 md:px-10 pb-6 space-y-4">
        {/* Content Textarea / Display */}
        {isEditing ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={() => {
              onUpdate(gift.id, { title, content });
              setIsEditing(false);
            }}
            rows={2}
            className="w-full resize-none border rounded-lg p-3 text-slate-700 outline-none focus:ring-2 focus:ring-emerald-600 transition-shadow"
            autoFocus
          />
        ) : (
          <div
            onClick={() => setIsEditing(true)}
            className="border border-transparent hover:border-slate-200 rounded-lg p-2 whitespace-pre-wrap break-words cursor-text min-h-[50px] transition-colors text-slate-600 text-sm"
          >
            {content ? renderTextWithLinks(content) : <span className="text-slate-400 italic">Click to add description/links...</span>}
          </div>
        )}

        {/* --- SPREADSHEET TABLE & HIDE BUTTON --- */}
        {showTable && (
          <div>
            <ExcelTableEditor
              tableData={gift.table_data}
              onChange={(newTableData) => onUpdate(gift.id, { table_data: newTableData })}
            />
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowTable(false);
                  onUpdate(gift.id, { table_data: null });
                }}
                className="text-xs text-red-600 hover:underline flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Hide Spreadsheet
              </button>
            </div>
          </div>
        )}

        {/* Multi-Image Preview Section */}
        {imagesList.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-4">
            {imagesList.map((image: any, idx: number) => {
              const imgUrl = typeof image === "string" ? image : image.url;
              const imgCaption = typeof image === "string" ? "" : image.caption || "";
              return (
                <div key={idx} className="relative inline-block group/image">
                  <img
                    src={imgUrl}
                    alt="Uploaded note graphic"
                    className="h-28 rounded-lg object-cover border border-slate-200 cursor-pointer hover:opacity-90 transition"
                    onClick={() => onImageClick(imgUrl)}
                  />
                  <input
                    type="text"
                    value={imgCaption}
                    placeholder="Caption..."
                    className="mt-1 w-full text-xs text-center border-b border-slate-200 focus:border-emerald-600 outline-none bg-transparent"
                    onChange={(e) => {
                      const updatedImages = [...imagesList];
                      if (typeof updatedImages[idx] === "string") {
                        updatedImages[idx] = { url: updatedImages[idx], caption: e.target.value };
                      } else {
                        updatedImages[idx] = { ...updatedImages[idx], caption: e.target.value };
                      }
                      onUpdate(gift.id, { images: updatedImages, image_urls: updatedImages });
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setDeleteTarget({ type: "image", index: idx })}
                    className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 opacity-0 group-hover/image:opacity-100 transition shadow"
                    title="Remove Image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Toolbar: Add Images and Add Spreadsheet Buttons In Line */}
        <div className="pt-2 flex items-center gap-2">
          <input
            type="file"
            accept="image/*"
            multiple
            id={`gift-image-${gift.id}`}
            className="hidden"
            onChange={handleImageUpload}
          />
          <label
            htmlFor={`gift-image-${gift.id}`}
            className="flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-emerald-700 cursor-pointer transition bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-md hover:bg-slate-100"
          >
            <ImageIcon className="w-4 h-4 text-emerald-600" />
            Add Images
          </label>

          {!showTable && (
            <button
              type="button"
              onClick={() => {
                setShowTable(true);
                const defaultTable = [
                  ["Outfit", "Event", "Date"],
                  ["", "Mehendi", "Morning (30)"],
                  ["", "Sangeet", "Morning (31)"],
                  ["", "Haldi", ""],
                  ["", "Reception", ""],
                  ["", "Phere", ""],
                  ["", "Vidai", ""],
                  ["", "Their Reception", ""]
                ];
                onUpdate(gift.id, { table_data: defaultTable });
              }}
              className="flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-emerald-700 cursor-pointer transition bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-md hover:bg-slate-100"
            >
              <Grid className="w-4 h-4 text-emerald-600" />
              Add Spreadsheet
            </button>
          )}
        </div>
      </div>

      {/* Tooltip */}
      {activeTooltip && (
        <div
          className="fixed z-[100] px-2 py-1 bg-slate-900 text-white text-[11px] font-medium rounded shadow-lg pointer-events-none whitespace-nowrap"
          style={{ left: mousePos.x + 12, top: mousePos.y + 16 }}
        >
          {activeTooltip}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-900">Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-2 text-slate-600">
            Are you sure you want to delete this item? This action cannot be undone.
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- MAIN PAGE ---
export default function NotePage() {
  const { notes, loading, fetchData } = useNotes();
  const [localNote, setLocalNote] = useState<any[]>([]);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

  useEffect(() => {
    if (notes) {
      const sorted = [...notes].sort((a, b) => {
        const aPinned = Boolean(a.is_pinned);
        const bPinned = Boolean(b.is_pinned);
        if (aPinned !== bPinned) return aPinned ? -1 : 1;
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      });
      setLocalNote(sorted);
    }
  }, [notes]);

  const handleAddNote = async () => {
    const newNote = {
      title: "",
      content: "",
      images: [],
      image_urls: [],
      is_pinned: false,
      table_data: null,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from("notes").insert(newNote).select().single();

    if (error) {
      alert("Error adding note: " + error.message);
      return;
    }

    if (data) {
      setLocalNote((prev) => {
        const updated = [data, ...prev];
        return updated.sort((a, b) => {
          const aPinned = Boolean(a.is_pinned);
          const bPinned = Boolean(b.is_pinned);
          if (aPinned !== bPinned) return aPinned ? -1 : 1;
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        });
      });
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
    fetchData();
  };

  const handleDelete = async (id: string) => {
    setLocalNote((prev) => prev.filter((n) => n.id !== id));
    await supabase.from("notes").delete().eq("id", id);
    fetchData();
  };

  const handleUpdate = async (id: string, updates: any) => {
    setLocalNote((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, ...updates } : n));
      return updated.sort((a, b) => {
        const aPinned = Boolean(a.is_pinned);
        const bPinned = Boolean(b.is_pinned);
        if (aPinned !== bPinned) return aPinned ? -1 : 1;
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      });
    });

    const { error } = await supabase.from("notes").update(updates).eq("id", id);
    if (error) {
      alert(error.message);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-emerald-600 font-bold">Loading Notes...</div>;
  }

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto min-h-screen space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-emerald-900 flex items-center gap-3">
            <BookIcon className="w-8 h-8 text-emerald-700" /> Notes & Spreadsheets
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Organize notes with built-in Excel tables, images, and links.
          </p>
        </div>

        <Button onClick={handleAddNote} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm">
          <Plus className="w-5 h-5 mr-2" /> Add Note Ideas
        </Button>
      </div>

      {/* Note List */}
      <div className="space-y-6">
        {localNote.length === 0 ? (
          <div className="text-center py-12 text-slate-400 italic">
            No Notes tracked yet. Click "Add Note Ideas" to get started!
          </div>
        ) : (
          localNote.map((gift: any) => (
            <NotesCard
              key={gift.id}
              gift={gift}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
              onImageClick={setFullScreenImage}
            />
          ))
        )}
      </div>

      {/* Full Screen Image Lightbox */}
      <Dialog open={!!fullScreenImage} onOpenChange={(open) => !open && setFullScreenImage(null)}>
        <DialogContent className="max-w-4xl p-1 bg-transparent border-none shadow-none [&>button]:text-white [&>button]:bg-black/50 [&>button]:rounded-full [&>button]:hover:bg-black/80">
          <DialogHeader className="sr-only">
            <DialogTitle>View Image</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center">
            {fullScreenImage && (
              <img
                src={fullScreenImage}
                alt="Full size view"
                className="w-auto h-auto max-w-full max-h-[85vh] rounded-md object-contain shadow-2xl"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}