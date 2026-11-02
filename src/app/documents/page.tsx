"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { 
  Trash2, FileText, BookOpen, X,  
  Bold, Italic, Strikethrough, List, ListOrdered, CheckSquare, Printer, Search 
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";

// --- FILE PLUS CORNER SVG ICON ---
function FilePlusCornerIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="11" x2="12" y2="17" />
      <line x1="9" y1="14" x2="15" y2="14" />
    </svg>
  );
}

// --- DOCS FORMATTING TOOLBAR ---
function DocToolbar() {
  const execCmd = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
  };

  const insertSamsungCheckbox = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);

    const selectedText = selection.toString().trim();
    const lines = selectedText ? selectedText.split(/\r?\n/).filter(l => l.trim() !== "") : ["Task item"];

    const fragment = document.createDocumentFragment();

    lines.forEach((lineText) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'flex items-center gap-2.5 my-1.5 group select-none samsung-task-item';
      wrapper.innerHTML = `
        <input 
          type="checkbox" 
          class="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600" 
          onchange="
            const textSpan = this.nextElementSibling;
            if (this.checked) {
              textSpan.style.textDecoration = 'line-through';
              textSpan.style.color = '#94a3b8';
            } else {
              textSpan.style.textDecoration = 'none';
              textSpan.style.color = '#334155';
            }
          "
        />
        <span 
          contenteditable="true" 
          class="outline-none border-b border-transparent focus:border-emerald-400 text-slate-700 flex-1 transition-colors"
        >${lineText}</span>
      `;
      fragment.appendChild(wrapper);
    });

    range.deleteContents();
    range.insertNode(fragment);
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 border border-slate-200 p-2 rounded-lg mb-4 text-slate-700 shadow-sm">
      <button 
        type="button" 
        onClick={() => execCmd('bold')} 
        className="p-1.5 hover:bg-slate-200 rounded transition-colors" 
        title="Bold"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button 
        type="button" 
        onClick={() => execCmd('italic')} 
        className="p-1.5 hover:bg-slate-200 rounded transition-colors" 
        title="Italic"
      >
        <Italic className="w-4 h-4" />
      </button>
      <button 
        type="button" 
        onClick={() => execCmd('strikeThrough')} 
        className="p-1.5 hover:bg-slate-200 rounded transition-colors" 
        title="Strikethrough"
      >
        <Strikethrough className="w-4 h-4" />
      </button>

      <div className="h-4 w-[1px] bg-slate-300 mx-1" />

      <button 
        type="button" 
        onClick={() => execCmd('insertUnorderedList')} 
        className="p-1.5 hover:bg-slate-200 rounded transition-colors" 
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </button>
      <button 
        type="button" 
        onClick={() => execCmd('insertOrderedList')} 
        className="p-1.5 hover:bg-slate-200 rounded transition-colors" 
        title="Numbered List"
      >
        <ListOrdered className="w-4 h-4" />
      </button>
      <button 
        type="button" 
        onClick={insertSamsungCheckbox} 
        className="p-1.5 hover:bg-slate-200 rounded transition-colors" 
        title="Insert Checklist (Samsung Notes Style)"
      >
        <CheckSquare className="w-4 h-4" /> 
      </button>

      <div className="h-4 w-[1px] bg-slate-300 mx-1" />

      {/* Distinct Font Families */}
      <select 
        onChange={(e) => execCmd('fontName', e.target.value)} 
        className="bg-white border border-slate-200 text-xs rounded px-2 py-1 outline-none hover:border-slate-300 cursor-pointer"
        defaultValue="Arial"
        title="Font Family"
      >
        <option value="Arial">Arial</option>
        <option value="Times New Roman">Times New Roman</option>
        <option value="Georgia">Georgia</option>
        <option value="Courier New">Courier New</option>
        <option value="Verdana">Verdana</option>
        <option value="Trebuchet MS">Trebuchet MS</option>
      </select>

      {/* Explicit Font Size Selector in Pixels */}
      <select 
        onChange={(e) => {
          const selection = window.getSelection();
          if (!selection || selection.rangeCount === 0) return;
          const parentEl = selection.anchorNode?.parentElement;
          if (parentEl) {
            (parentEl as HTMLElement).style.fontSize = e.target.value;
          }
        }} 
        className="bg-white border border-slate-200 text-xs rounded px-2 py-1 outline-none hover:border-slate-300 cursor-pointer"
        defaultValue="16px"
        title="Font Size"
      >
        <option value="12px">12px</option>
        <option value="14px">14px</option>
        <option value="16px">16px (Normal)</option>
        <option value="18px">18px</option>
        <option value="20px">20px</option>
        <option value="24px">24px (Heading)</option>
        <option value="32px">32px (Title)</option>
      </select>
    </div>
  );
}

// --- EDITABLE CELL COMPONENT ---
function EditableCell({ 
  value, 
  onChange, 
  onBlur,
  placeholder, 
  className = "",
  autoFocus = false
}: { 
  value: string, 
  onChange: (val: string) => void, 
  onBlur?: () => void,
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
      className={`outline-none cursor-text empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400/60 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic [&_strike]:line-through [&_s]:line-through ${className}`}
      data-placeholder={placeholder}
      suppressContentEditableWarning
    />
  );
}

interface DocItem {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export default function WeddingDocsPage() {
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [docDeleteTarget, setDocDeleteTarget] = useState<string | null>(null);
  const [docLoading, setDocLoading] = useState(true);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Resizable Sidebar Width State (Desktop)
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const isResizingRef = useRef(false);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizingRef.current = true;
    document.addEventListener("mousemove", resize);
    document.addEventListener("mouseup", stopResizing);
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (!isResizingRef.current) return;
    const newWidth = window.innerWidth - e.clientX - 32;
    if (newWidth >= 200 && newWidth <= 500) {
      setSidebarWidth(newWidth);
    }
  }, []);

  const stopResizing = useCallback(() => {
    isResizingRef.current = false;
    document.removeEventListener("mousemove", resize);
    document.removeEventListener("mouseup", stopResizing);
  }, [resize]);

  useEffect(() => {
    const fetchDocs = async () => {
      setDocLoading(true);
      const { data, error } = await supabase
        .from('wedding_docs')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setDocs(data);
        if (data.length > 0 && !selectedDocId) {
          setSelectedDocId(data[0].id);
        }
      } else {
        console.error("Error fetching docs:", error?.message || error);
        setDocs([
          {
            id: 'local-1',
            title: 'Welcome Document',
            content: 'Database sync offline or table missing. You can still type notes here!',
            created_at: new Date().toISOString()
          }
        ]);
        setSelectedDocId('local-1');
      }
      setDocLoading(false);
    };
    fetchDocs();
  }, []);

  const activeDoc = useMemo(() => {
    return docs.find(d => d.id === selectedDocId) || null;
  }, [docs, selectedDocId]);

  const filteredDocs = useMemo(() => {
    if (!searchQuery.trim()) return docs;
    const query = searchQuery.toLowerCase();
    return docs.filter(d => 
      d.title.toLowerCase().includes(query) || 
      d.content.toLowerCase().includes(query)
    );
  }, [docs, searchQuery]);

  const addDoc = async () => {
    const untitledCount = docs.filter(d => 
      d.title === 'Untitled Document' || /^Untitled Document-\d+$/.test(d.title)
    ).length;

    const newTitle = untitledCount === 0 ? 'Untitled Document' : `Untitled Document-${untitledCount}`;

    const newDoc = {
      title: newTitle,
      content: '',
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('wedding_docs')
      .insert([newDoc])
      .select()
      .single();

    if (!error && data) {
      setDocs(prev => [data, ...prev]);
      setSelectedDocId(data.id);
    } else {
      const fallbackDoc = {
        id: `local-${Date.now()}`,
        ...newDoc
      };
      setDocs(prev => [fallbackDoc, ...prev]);
      setSelectedDocId(fallbackDoc.id);
    }
    setIsMobileDrawerOpen(false);
    setSearchQuery("");
  };

  const updateDoc = async (id: string, updates: Partial<DocItem>) => {
    setDocs(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
    
    if (!id.startsWith('local-')) {
      const { error } = await supabase
        .from('wedding_docs')
        .update(updates)
        .eq('id', id);

      if (error) console.error("Error updating document:", error);
    }
  };

  const confirmDeleteDoc = async () => {
    if (!docDeleteTarget) return;
    setDocs(prev => prev.filter(d => d.id !== docDeleteTarget));
    
    if (!docDeleteTarget.startsWith('local-')) {
      await supabase.from('wedding_docs').delete().eq('id', docDeleteTarget);
    }

    if (selectedDocId === docDeleteTarget) {
      const remaining = docs.filter(d => d.id !== docDeleteTarget);
      setSelectedDocId(remaining.length > 0 ? remaining[0].id : null);
    }
    setDocDeleteTarget(null);
  };

  const handlePrint = () => {
    if (!activeDoc) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>${activeDoc.title || 'Untitled Document'}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
            h1 { font-size: 24px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 5px; color: #065f46; }
            .date { font-size: 12px; color: #64748b; margin-bottom: 25px; }
            .content { font-size: 15px; }
            input[type="checkbox"] { margin-right: 8px; transform: scale(1.1); }
            .samsung-task-item { display: flex; align-items: center; margin: 8px 0; }
          </style>
        </head>
        <body>
          <h1>${activeDoc.title || 'Untitled Document'}</h1>
          <div class="date">Last updated: ${new Date(activeDoc.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
          <div class="content">${activeDoc.content || ''}</div>
          <script>
            window.onload = () => { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (docLoading) return <div className="p-12 text-center text-emerald-600 font-bold">Loading Documents...</div>;

  return (
    <div className="p-4 md:p-12 max-w-6xl mx-auto min-h-screen space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-emerald-900 flex items-center gap-2">
            <FileText className="w-6 h-6 md:w-8 md:h-8 text-emerald-700" /> Wedding Documents
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Manage itineraries, notes, and planning guides.
          </p>
          <div className="mt-2.5 flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => addDoc()}
              className="md:hidden border-emerald-200 text-emerald-800 gap-1.5 h-8 text-xs font-medium"
            >
              <FilePlusCornerIcon className="w-4 h-4 text-emerald-700" /> New Document
            </Button>
            {/* Mobile Button to toggle right-side documents drawer */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsMobileDrawerOpen(true)}
              className="md:hidden border-emerald-200 text-emerald-800 gap-1.5 h-8 text-xs font-medium"
            >
              <BookOpen className="w-4 h-4 text-emerald-700" /> Documents
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 relative items-start">
        {/* Docs Editor Workspace (Left / Main) */}
        <div className="flex-1 w-full bg-white rounded-xl shadow-md border border-slate-100 p-4 md:p-6 flex flex-col h-[75vh]">
          {activeDoc ? (
            <div className="flex flex-col h-full space-y-4">
              <div className="flex items-start justify-between pb-3 border-b border-slate-100 gap-2">
                <div className="flex-1">
                  <EditableCell
                    value={activeDoc.title}
                    onChange={(val) => updateDoc(activeDoc.id, { title: val })}
                    placeholder="Document Title..."
                    className="text-xl md:text-2xl font-serif font-bold text-emerald-900 w-full bg-transparent focus:outline-none"
                  />
                  <div className="text-[11px] text-slate-400 mt-1">
                    Last updated: {new Date(activeDoc.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handlePrint}
                  className="gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50 shrink-0"
                  title="Print Document"
                >
                  <Printer className="w-4 h-4 text-slate-500" /> Print
                </Button>
              </div>

              {/* Enhanced Formatting Toolbar */}
              <DocToolbar />

              <div className="flex-1 overflow-auto">
                <EditableCell
                  value={activeDoc.content || ""}
                  onChange={(val) => updateDoc(activeDoc.id, { content: val })}
                  placeholder="Start typing your notes..."
                  className="w-full h-full min-h-[350px] outline-none text-slate-700 leading-relaxed text-sm md:text-base"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 italic text-center px-4">
              <FileText className="w-12 h-12 text-slate-300 mb-2" />
              Select a document from the sidebar or create a new one to begin.
            </div>
          )}
        </div>

        {/* Resizable Sidebar (Right - Desktop) */}
        <div 
          style={{ width: `${sidebarWidth}px` }}
          className="hidden md:flex bg-white rounded-xl shadow-md border border-slate-100 p-4 flex-col h-[75vh] relative shrink-0"
        >
          {/* Drag Handle on Left Edge of Sidebar */}
          <div 
            onMouseDown={startResizing}
            className="absolute -left-2 top-0 bottom-0 w-4 cursor-ew-resize flex items-center justify-center group z-10"
            title="Drag to resize sidebar"
          >
            <div className="w-1 h-8 rounded-full bg-slate-200 group-hover:bg-emerald-500 transition-colors" />
          </div>

          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <span className="font-serif font-bold text-emerald-900 text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-700" /> Documents
            </span>
            <Button size="sm" onClick={addDoc} className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 px-2.5">
              <FilePlusCornerIcon className="w-4 h-4 mr-1" /> New
            </Button>
          </div>

          {/* Search Input */}
          <div className="relative mb-3">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700 focus:outline-none focus:border-emerald-400"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ×
              </button>
            )}
          </div>

          <div className="flex-1 overflow-auto space-y-1 pr-1">
            {filteredDocs.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs italic">
                {searchQuery ? "No matching documents." : "No documents yet."}
              </div>
            ) : (
              filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDocId(doc.id)}
                  className={`group flex items-center justify-between p-2.5 rounded-lg cursor-pointer text-sm transition-all ${
                    selectedDocId === doc.id 
                      ? 'bg-emerald-50 text-emerald-900 font-semibold border border-emerald-200 shadow-sm' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate flex-1">{doc.title || 'Untitled Document'}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDocDeleteTarget(doc.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-1 transition-opacity"
                    title="Delete Document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Mobile Documents Drawer (Right Slide-In) */}
        {isMobileDrawerOpen && (
          <div className="fixed inset-0 z-50 flex bg-black/50 md:hidden animate-in fade-in">
            {/* 1. This empty flex-1 div comes first, pushing the drawer to the right */}
            <div className="flex-1" onClick={() => setIsMobileDrawerOpen(false)} />
            
            {/* 2. Drawer content aligns on the right edge */}
            <div className="bg-white w-4/5 max-w-xs h-full p-4 flex flex-col shadow-2xl animate-in slide-in-from-right">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                <span className="font-serif font-bold text-emerald-900 text-base flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-700" /> Documents
                </span>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="ghost" onClick={() => setIsMobileDrawerOpen(false)} className="h-8 w-8">
                    <X className="w-5 h-5" />
                  </Button>
                </div>            
              </div>

              {/* Mobile Search Input */}
              <div className="relative mb-3">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700 focus:outline-none focus:border-emerald-400"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    ×
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-auto space-y-1 pr-1">
                {filteredDocs.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs italic">
                    {searchQuery ? "No matching documents." : "No documents yet."}
                  </div>
                ) : (
                  filteredDocs.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => {
                        setSelectedDocId(doc.id);
                        setIsMobileDrawerOpen(false);
                      }}
                      className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer text-sm transition-all ${
                        selectedDocId === doc.id 
                          ? 'bg-emerald-50 text-emerald-900 font-semibold border border-emerald-200 shadow-sm' 
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate flex-1">{doc.title || 'Untitled Document'}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDocDeleteTarget(doc.id);
                        }}
                        className="text-slate-400 hover:text-red-500 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialog for Document Deletion */}
      <Dialog open={!!docDeleteTarget} onOpenChange={(open) => !open && setDocDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-900">Confirm Document Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-2 text-slate-600">
            Are you sure you want to delete this document? This action cannot be undone.
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDocDeleteTarget(null)}>Cancel</Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={confirmDeleteDoc}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}