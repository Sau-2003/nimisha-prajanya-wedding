"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { 
  Trash2, FileText, BookOpen, X,  
  Bold, Italic, Strikethrough, List, ListOrdered, CheckSquare, Printer, Search,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, Indent, Outdent
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";

// Exact A4 dimensions at 96 DPI (210mm x 297mm)
const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;
const PRINT_MARGIN_PX = 76; // 20mm print margin
const BOTTOM_GREY_BAR_PX = 32; // Visual shading strip at the bottom
const PAGE_STRIDE = A4_HEIGHT_PX + BOTTOM_GREY_BAR_PX;

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
function DocToolbar({ onFormat }: { onFormat: () => void }) {
  const execCmd = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    onFormat();
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
              this.setAttribute('checked', 'checked');
              textSpan.style.textDecoration = 'line-through';
              textSpan.style.color = '#94a3b8';
            } else {
              this.removeAttribute('checked');
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
    onFormat();
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 border border-slate-200 p-2 rounded-lg text-slate-700 shadow-sm sticky top-0 z-20">
      <button type="button" onClick={() => execCmd('bold')} className="p-1.5 hover:bg-slate-200 rounded transition-colors" title="Bold"><Bold className="w-4 h-4" /></button>
      <button type="button" onClick={() => execCmd('italic')} className="p-1.5 hover:bg-slate-200 rounded transition-colors" title="Italic"><Italic className="w-4 h-4" /></button>
      <button type="button" onClick={() => execCmd('strikeThrough')} className="p-1.5 hover:bg-slate-200 rounded transition-colors" title="Strikethrough"><Strikethrough className="w-4 h-4" /></button>
      <div className="h-4 w-[1px] bg-slate-300 mx-1" />
      <button type="button" onClick={() => execCmd('justifyLeft')} className="p-1.5 hover:bg-slate-200 rounded transition-colors" title="Align Left"><AlignLeft className="w-4 h-4" /></button>
      <button type="button" onClick={() => execCmd('justifyCenter')} className="p-1.5 hover:bg-slate-200 rounded transition-colors" title="Align Center"><AlignCenter className="w-4 h-4" /></button>
      <button type="button" onClick={() => execCmd('justifyRight')} className="p-1.5 hover:bg-slate-200 rounded transition-colors" title="Align Right"><AlignRight className="w-4 h-4" /></button>
      <button type="button" onClick={() => execCmd('justifyFull')} className="p-1.5 hover:bg-slate-200 rounded transition-colors" title="Justify"><AlignJustify className="w-4 h-4" /></button>
      <div className="h-4 w-[1px] bg-slate-300 mx-1" />
      <button type="button" onClick={() => execCmd('outdent')} className="p-1.5 hover:bg-slate-200 rounded transition-colors" title="Decrease Indent"><Outdent className="w-4 h-4" /></button>
      <button type="button" onClick={() => execCmd('indent')} className="p-1.5 hover:bg-slate-200 rounded transition-colors" title="Increase Indent"><Indent className="w-4 h-4" /></button>
      <div className="h-4 w-[1px] bg-slate-300 mx-1" />
      <button type="button" onClick={() => execCmd('insertUnorderedList')} className="p-1.5 hover:bg-slate-200 rounded transition-colors" title="Bullet List"><List className="w-4 h-4" /></button>
      <button type="button" onClick={() => execCmd('insertOrderedList')} className="p-1.5 hover:bg-slate-200 rounded transition-colors" title="Numbered List"><ListOrdered className="w-4 h-4" /></button>
      <button type="button" onClick={insertSamsungCheckbox} className="p-1.5 hover:bg-slate-200 rounded transition-colors" title="Insert Checklist"><CheckSquare className="w-4 h-4" /></button>
      <div className="h-4 w-[1px] bg-slate-300 mx-1" />
      <select onChange={(e) => execCmd('fontName', e.target.value)} className="bg-white border border-slate-200 text-xs rounded px-2 py-1 outline-none hover:border-slate-300 cursor-pointer max-w-[90px] sm:max-w-none" defaultValue="Arial" title="Font Family">
        <option value="Arial">Arial</option>
        <option value="Times New Roman">Times New Roman</option>
        <option value="Georgia">Georgia</option>
        <option value="Courier New">Courier New</option>
        <option value="Verdana">Verdana</option>
        <option value="Trebuchet MS">Trebuchet MS</option>
      </select>
      <select 
        onChange={(e) => {
          const selection = window.getSelection();
          if (!selection || selection.rangeCount === 0) return;
          const parentEl = selection.anchorNode?.parentElement;
          if (parentEl) {
            (parentEl as HTMLElement).style.fontSize = e.target.value;
            onFormat();
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

// --- A4 SCALED PRINT-LAYOUT EDITOR (MOBILE & DESKTOP PERFECT) ---
function WordPaginatedEditor({
  docId,
  content,
  onChange,
  editorRef,
  recalculateRef
}: {
  docId: string;
  content: string;
  onChange: (html: string) => void;
  editorRef: React.RefObject<HTMLDivElement | null>;
  recalculateRef: React.MutableRefObject<() => void>;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const pageStackRef = useRef<HTMLDivElement>(null);
  const loadedDocIdRef = useRef<string | null>(null);

  const [pageCount, setPageCount] = useState(1);
  const [scale, setScale] = useState(1);

  // Measure available width and compute mobile scale factor
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;

    const updateScale = () => {
      // 16px to allow for a small 8px padding on left/right on mobile screens
      const availableWidth = vp.clientWidth - 16;
      if (availableWidth <= 0) return;
      
      // If screen is smaller than A4, zoom out. If larger, stay at 100%.
      const newScale = availableWidth < A4_WIDTH_PX ? availableWidth / A4_WIDTH_PX : 1;
      setScale(newScale);
    };

    updateScale();
    const ro = new ResizeObserver(updateScale);
    ro.observe(vp);
    return () => ro.disconnect();
  }, []);

  const normalizeRootTextNodes = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const sel = window.getSelection();
    const childNodes = Array.from(editor.childNodes);

    childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE && (node.textContent || "").trim().length > 0) {
        const isFocused = sel && sel.rangeCount > 0 && sel.anchorNode === node;
        const offset = isFocused ? sel.anchorOffset : 0;

        const div = document.createElement("div");
        editor.insertBefore(div, node);
        div.appendChild(node);

        if (isFocused && sel) {
          const range = document.createRange();
          range.setStart(node, offset);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
    });
  }, [editorRef]);

  const recalculatePages = useCallback(() => {
    const editor = editorRef.current;
    const stack = pageStackRef.current;
    if (!editor || !stack) return;

    normalizeRootTextNodes();

    const prevPushed = editor.querySelectorAll<HTMLElement>('[data-page-break="true"]');
    prevPushed.forEach((el) => {
      el.style.removeProperty("margin-top");
      el.removeAttribute("data-page-break");
    });

    const stackRect = stack.getBoundingClientRect();
    // Because stack is scaled, we must un-scale the bounding rects to calculate against the true 1123px height
    const currentScale = scale || 1; 

    const getBlocks = (): HTMLElement[] => {
      const list: HTMLElement[] = [];
      Array.from(editor.children).forEach((child) => {
        const el = child as HTMLElement;
        if (el.tagName === "UL" || el.tagName === "OL") {
          Array.from(el.children).forEach((li) => {
            if (li instanceof HTMLElement) list.push(li);
          });
        } else {
          list.push(el);
        }
      });
      return list;
    };

    let blocks = getBlocks();
    let maxPageIdx = 0;

    for (let i = 0; i < blocks.length; i++) {
      const el = blocks[i];
      const rect = el.getBoundingClientRect();
      // True position in the unscaled 1123px dimension
      const elTop = (rect.top - stackRect.top) / currentScale;
      const elBottom = (rect.bottom - stackRect.top) / currentScale;

      const pageIdx = Math.max(0, Math.floor(elTop / PAGE_STRIDE));
      const pagePrintableTop = pageIdx * PAGE_STRIDE + PRINT_MARGIN_PX;
      const pagePrintableBottom = pageIdx * PAGE_STRIDE + (A4_HEIGHT_PX - PRINT_MARGIN_PX);

      if (elBottom > pagePrintableBottom) {
        if (elTop > pagePrintableTop + 32) {
          const nextPageIdx = pageIdx + 1;
          const nextPagePrintableTop = nextPageIdx * PAGE_STRIDE + PRINT_MARGIN_PX;
          const pushAmount = Math.ceil(nextPagePrintableTop - elTop);

          el.style.marginTop = `${pushAmount}px`;
          el.setAttribute("data-page-break", "true");
          maxPageIdx = Math.max(maxPageIdx, nextPageIdx);
        } 
        else if (el.childNodes.length === 1 && el.firstChild?.nodeType === Node.TEXT_NODE) {
          const textNode = el.firstChild as Text;
          const text = textNode.data;
          if (text.length > 1) {
            const testRange = document.createRange();
            let low = 1;
            let high = text.length;
            let splitIdx = -1;
            const targetBottomClient = stackRect.top + (pagePrintableBottom * currentScale);

            while (low <= high) {
              const mid = Math.floor((low + high) / 2);
              testRange.setStart(textNode, 0);
              testRange.setEnd(textNode, mid);
              const r = testRange.getBoundingClientRect();
              if (r.bottom <= targetBottomClient) {
                splitIdx = mid;
                low = mid + 1;
              } else {
                high = mid - 1;
              }
            }

            if (splitIdx > 0 && splitIdx < text.length) {
              const lastSpace = text.lastIndexOf(" ", splitIdx);
              if (lastSpace > splitIdx - 32 && lastSpace > 0) splitIdx = lastSpace;

              const sel = window.getSelection();
              const isCursorInNode = sel && sel.rangeCount > 0 && sel.anchorNode === textNode;
              const cursorOffset = isCursorInNode ? sel.anchorOffset : -1;

              const firstPart = text.slice(0, splitIdx);
              const rawSecondPart = text.slice(splitIdx);
              const trimmedSecondPart = rawSecondPart.replace(/^\s+/, "");
              const removedSpaces = rawSecondPart.length - trimmedSecondPart.length;

              textNode.data = firstPart;

              const nextDiv = document.createElement("div");
              nextDiv.className = el.className;
              const newTextNode = document.createTextNode(trimmedSecondPart);
              nextDiv.appendChild(newTextNode);
              el.parentNode?.insertBefore(nextDiv, el.nextSibling);

              if (isCursorInNode && sel && cursorOffset >= splitIdx) {
                const newRange = document.createRange();
                const nextOffset = Math.max(0, Math.min(newTextNode.length, cursorOffset - splitIdx - removedSpaces));
                newRange.setStart(newTextNode, nextOffset);
                newRange.collapse(true);
                sel.removeAllRanges();
                sel.addRange(newRange);
              }

              blocks = getBlocks();
            }
          }
        }
      } else {
        maxPageIdx = Math.max(maxPageIdx, pageIdx);
      }
    }

    if (blocks.length > 0) {
      const lastEl = blocks[blocks.length - 1];
      const lastBottom = (lastEl.getBoundingClientRect().bottom - stackRect.top) / currentScale;
      const lastPageIdx = Math.max(0, Math.floor((lastBottom - 4) / PAGE_STRIDE));
      maxPageIdx = Math.max(maxPageIdx, lastPageIdx);
    }

    setPageCount(maxPageIdx + 1);
  }, [editorRef, normalizeRootTextNodes, scale]);

  useEffect(() => {
    recalculateRef.current = recalculatePages;
  }, [recalculatePages, recalculateRef]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const isDifferentDoc = loadedDocIdRef.current !== docId;
    if (isDifferentDoc || (content !== editor.innerHTML && document.activeElement !== editor)) {
      loadedDocIdRef.current = docId;
      if (content && !content.trim().startsWith("<")) {
        editor.innerHTML = `<div>${content}</div>`;
      } else {
        editor.innerHTML = content || "<div><br/></div>";
      }
      requestAnimationFrame(() => recalculatePages());
    }
  }, [docId, content, editorRef, recalculatePages]);

  useEffect(() => {
    requestAnimationFrame(() => recalculatePages());
  }, [scale, recalculatePages]);

  const handleInput = () => {
    const editor = editorRef.current;
    if (!editor) return;
    recalculatePages();
    onChange(editor.innerHTML);
  };

  const totalUnscaledHeight = pageCount * PAGE_STRIDE;

  return (
    // Viewport provides scrolling and a grey background outside the document bounds
    <div 
      ref={viewportRef}
      onClick={() => editorRef.current?.focus()}
      className="h-[65vh] md:h-[70vh] w-full bg-slate-200/80 overflow-y-auto overflow-x-hidden flex justify-center py-4 cursor-text"
    >
      {/* 
        This wrapper dictates the physical scrolling height and width of the scaled document.
        Because scale() shrinks visually but not physically, this stops massive white space on mobile.
      */}
      <div 
        style={{
          width: `${A4_WIDTH_PX * scale}px`,
          height: `${totalUnscaledHeight * scale}px`
        }}
        className="relative shrink-0"
      >
        <div
          ref={pageStackRef}
          style={{
            width: `${A4_WIDTH_PX}px`,
            height: `${totalUnscaledHeight}px`,
            transform: `scale(${scale})`,
            transformOrigin: "top left"
          }}
          className="relative"
        >
          {/* Background A4 Pages with Grey Shading ONLY at the Bottom of Each Page */}
          <div className="absolute inset-0 pointer-events-none z-0 flex flex-col">
            {Array.from({ length: pageCount }).map((_, idx) => (
              <div key={idx} className="w-full shrink-0 flex flex-col">
                <div
                  style={{ height: `${A4_HEIGHT_PX}px` }}
                  className="w-full bg-white relative border-x border-t border-slate-300 shadow-sm"
                >
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[11px] font-sans text-slate-400 select-none">
                    Page {idx + 1} of {pageCount}
                  </div>
                </div>
                <div
                  style={{ height: `${BOTTOM_GREY_BAR_PX}px` }}
                  className="w-full bg-slate-200/80 border-b border-slate-300 shadow-[inset_0_3px_5px_-2px_rgba(0,0,0,0.12)]"
                />
              </div>
            ))}
          </div>

          {/* Foreground Editable Document Body (100% Width, scaled visually) */}
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            suppressContentEditableWarning
            style={{
              fontFamily: "Arial, sans-serif",
              fontSize: "16px",
              lineHeight: "1.6",
              paddingTop: `${PRINT_MARGIN_PX}px`,
              paddingBottom: `${PRINT_MARGIN_PX + BOTTOM_GREY_BAR_PX}px`,
              paddingLeft: `${PRINT_MARGIN_PX}px`,
              paddingRight: `${PRINT_MARGIN_PX}px`,
              minHeight: `${totalUnscaledHeight}px`
            }}
            className="
              relative z-10 w-full outline-none text-[#1e293b] cursor-text break-words
              empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400/60
              [&>div]:min-h-[1.6em] [&>p]:min-h-[1.6em] [&_li]:min-h-[1.6em]
              [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6
              [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic [&_strike]:line-through [&_s]:line-through
            "
            data-placeholder="Start typing your document..."
          />
        </div>
      </div>
    </div>
  );
}

// --- EDITABLE TITLE COMPONENT ---
function EditableTitle({ 
  value, 
  onChange, 
  autoFocus = false,
  titleRef
}: { 
  value: string; 
  onChange: (val: string) => void; 
  autoFocus?: boolean;
  titleRef: React.RefObject<HTMLDivElement | null>;
}) {
  useEffect(() => {
    if (titleRef.current && value !== titleRef.current.innerText && document.activeElement !== titleRef.current) {
      titleRef.current.innerText = value || "";
    }
  }, [value, titleRef]);

  useEffect(() => {
    if (autoFocus && titleRef.current) {
      titleRef.current.focus();
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(titleRef.current);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [autoFocus, titleRef]);

  return (
    <div
      ref={titleRef}
      contentEditable
      onInput={() => titleRef.current && onChange(titleRef.current.innerText)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          titleRef.current?.blur();
        }
      }}
      className="text-lg md:text-2xl font-serif font-bold text-emerald-900 w-full bg-transparent outline-none cursor-text empty:before:content-['Document_Title...'] empty:before:text-slate-400/60"
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
  const [isNewDocCreated, setIsNewDocCreated] = useState(false);

  const editorRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLDivElement | null>(null);
  const recalculateRef = useRef<() => void>(() => {});

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

      if (!error && data && data.length > 0) {
        setDocs(data);
        setSelectedDocId(data[0].id);
      } else {
        const defaultDoc = {
          id: 'local-1',
          title: 'Welcome Document',
          content: '<div>Start typing your wedding notes and itineraries here...</div>',
          created_at: new Date().toISOString()
        };
        setDocs([defaultDoc]);
        setSelectedDocId(defaultDoc.id);
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
      (d.title || "").toLowerCase().includes(query) || 
      (d.content || "").toLowerCase().includes(query)
    );
  }, [docs, searchQuery]);

  const addDoc = async () => {
    setIsNewDocCreated(false);
    const untitledCount = docs.filter(d => d.title === 'Untitled Document' || /^Untitled Document-\d+$/.test(d.title)).length;
    const newTitle = untitledCount === 0 ? 'Untitled Document' : `Untitled Document-${untitledCount}`;

    const newDoc = { title: newTitle, content: '<div><br/></div>', created_at: new Date().toISOString() };
    const { data, error } = await supabase.from('wedding_docs').insert([newDoc]).select().single();

    if (!error && data) {
      setDocs(prev => [data, ...prev]);
      setSelectedDocId(data.id);
    } else {
      const fallbackDoc = { id: `local-${Date.now()}`, ...newDoc };
      setDocs(prev => [fallbackDoc, ...prev]);
      setSelectedDocId(fallbackDoc.id);
    }
    setIsMobileDrawerOpen(false);
    setSearchQuery("");
    setTimeout(() => setIsNewDocCreated(true), 50);
  };

  const updateDoc = async (id: string, updates: Partial<DocItem>) => {
    if (updates.title !== undefined && isNewDocCreated) setIsNewDocCreated(false);
    setDocs(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
    
    if (!id.startsWith('local-')) {
      await supabase.from('wedding_docs').update(updates).eq('id', id);
    }
  };

  const confirmDeleteDoc = async () => {
    if (!docDeleteTarget) return;
    setDocs(prev => prev.filter(d => d.id !== docDeleteTarget));
    if (!docDeleteTarget.startsWith('local-')) await supabase.from('wedding_docs').delete().eq('id', docDeleteTarget);
    if (selectedDocId === docDeleteTarget) {
      const remaining = docs.filter(d => d.id !== docDeleteTarget);
      setSelectedDocId(remaining.length > 0 ? remaining[0].id : null);
    }
    setDocDeleteTarget(null);
  };

  const handlePrint = () => {
    if (!activeDoc) return;
    recalculateRef.current();

    const liveHtml = editorRef.current ? editorRef.current.innerHTML : (activeDoc.content || '');
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const formattedDate = new Date(activeDoc.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });

    printWindow.document.write(`
      <html>
        <head>
          <title>${activeDoc.title || 'Untitled Document'}</title>
          <style>
            @page { 
              size: A4 portrait; 
              margin: 20mm;
              @bottom-center {
                content: "Page " counter(page) " of " counter(pages);
                font-family: Arial, sans-serif;
                font-size: 11px;
                color: #94a3b8;
              }
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            body { 
              font-family: Arial, sans-serif; 
              font-size: 16px;
              color: #1e293b; 
              line-height: 1.6; 
              margin: 0; 
              padding: 0;
            }
            
            /* --- INJECTED PRINT HEADER --- */
            .print-header {
              text-align: center;
              border-bottom: 2px solid #e2e8f0;
              padding-bottom: 12px;
              margin-bottom: 24px;
            }
            .print-header h1 { 
              font-size: 24px; 
              font-weight: bold;
              margin: 0 0 4px 0; 
              color: #065f46; 
              line-height: 1.375;
            }
            .print-header .date { 
              font-size: 12px; 
              color: #64748b; 
            }
            
            /* --- DOCUMENT CONTENT --- */
            .content { 
              font-size: 16px; 
              line-height: 1.6;
              word-wrap: break-word;
            }
            .content > div, .content > p, .content li {
              min-height: 1.6em;
            }
            .content ul { list-style-type: disc; padding-left: 24px; margin: 0; }
            .content ol { list-style-type: decimal; padding-left: 24px; margin: 0; }
            input[type="checkbox"] { margin-right: 10px; transform: scale(1.1); accent-color: #059669; }
            .samsung-task-item { display: flex; align-items: center; margin: 6px 0; }
            
            /* Print breaks match mobile/desktop auto-breaks exactly */
            [data-page-break="true"] {
              page-break-before: always !important;
              break-before: page !important;
              margin-top: 0 !important;
            }
          </style>
        </head>
        <body>
          <!-- TITLE BLOCK ON FIRST PRINTED PAGE -->
          <div class="print-header">
            <h1>${activeDoc.title || 'Untitled Document'}</h1>
            <div class="date">Last updated: ${formattedDate}</div>
          </div>
          
          <div class="content">${liveHtml}</div>
          <script>window.onload = () => { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (docLoading) return <div className="p-12 text-center text-emerald-600 font-bold">Loading Documents...</div>;

  return (
    <div className="p-2 sm:p-4 md:p-8 max-w-7xl mx-auto min-h-screen space-y-4 md:space-y-6">
      <div className="flex items-center justify-between pb-3 md:pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-emerald-900 flex items-center gap-2">
            <FileText className="w-5 h-5 md:w-8 md:h-8 text-emerald-700" /> Wedding Documents
          </h1>
          <p className="text-[11px] sm:text-xs md:text-sm text-slate-500 mt-0.5">
            Manage itineraries, notes, and planning guides.
          </p>
          <div className="mt-2.5 flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => addDoc()} className="md:hidden border-emerald-200 text-emerald-800 gap-1.5 h-8 text-xs font-medium">
              <FilePlusCornerIcon className="w-4 h-4 text-emerald-700" /> New Document
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsMobileDrawerOpen(true)} className="md:hidden border-emerald-200 text-emerald-800 gap-1.5 h-8 text-xs font-medium">
              <BookOpen className="w-4 h-4 text-emerald-700" /> Documents
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:gap-6 relative items-start">
        {/* Main Document Editor Column */}
        <div className="flex-1 min-w-0 w-full bg-white rounded-xl shadow-md border border-slate-200 p-2 sm:p-4 md:p-6 flex flex-col">
          {activeDoc ? (
            <div className="flex flex-col space-y-3">
              <div className="flex items-start justify-between pb-2 border-b border-slate-100 gap-2">
                <div className="flex-1 min-w-0">
                  <EditableTitle 
                    titleRef={titleRef}
                    value={activeDoc.title} 
                    onChange={(val) => updateDoc(activeDoc.id, { title: val })} 
                    autoFocus={isNewDocCreated} 
                  />
                  <div className="text-[10px] md:text-[11px] text-slate-400 mt-1 truncate">
                    Last updated: {new Date(activeDoc.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50 shrink-0 h-8 text-xs" title="Print Document">
                  <Printer className="w-3.5 h-3.5 text-slate-500" /> Print
                </Button>
              </div>

              <DocToolbar onFormat={() => recalculateRef.current()} />

              <div className="w-full rounded-lg border border-slate-200 overflow-hidden bg-white">
                <WordPaginatedEditor
                  docId={activeDoc.id}
                  editorRef={editorRef}
                  recalculateRef={recalculateRef}
                  content={activeDoc.content || ""}
                  onChange={(val) => updateDoc(activeDoc.id, { content: val })}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[65vh] text-slate-400 italic text-center px-4">
              <FileText className="w-12 h-12 text-slate-300 mb-2" />
              Select a document to begin.
            </div>
          )}
        </div>

        {/* Desktop Documents Sidebar */}
        <div style={{ width: `${sidebarWidth}px` }} className="hidden md:flex bg-white rounded-xl shadow-md border border-slate-200 p-4 flex-col h-[84vh] relative shrink-0">
          <div onMouseDown={startResizing} className="absolute -left-2 top-0 bottom-0 w-4 cursor-ew-resize flex items-center justify-center group z-10">
            <div className="w-1 h-8 rounded-full bg-slate-200 group-hover:bg-emerald-500 transition-colors" />
          </div>
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <span className="font-serif font-bold text-emerald-900 text-sm flex items-center gap-2"><BookOpen className="w-4 h-4 text-emerald-700" /> Documents</span>
            <Button size="sm" onClick={addDoc} className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 px-2.5"><FilePlusCornerIcon className="w-4 h-4 mr-1" /> New</Button>
          </div>
          <div className="relative mb-3">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700 focus:outline-none focus:border-emerald-400" />
          </div>
          <div className="flex-1 overflow-auto space-y-1 pr-1">
            {filteredDocs.map((doc) => (
              <div key={doc.id} onClick={() => { if (selectedDocId !== doc.id) setIsNewDocCreated(false); setSelectedDocId(doc.id); }} className={`group flex items-center justify-between p-2.5 rounded-lg cursor-pointer text-sm transition-all ${selectedDocId === doc.id ? 'bg-emerald-50 text-emerald-900 font-semibold border border-emerald-200 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
                <span className="truncate flex-1">{doc.title || 'Untitled Document'}</span>
                <button onClick={(e) => { e.stopPropagation(); setDocDeleteTarget(doc.id); }} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Documents Drawer */}
        {isMobileDrawerOpen && (
          <div className="fixed inset-0 z-50 flex bg-black/50 md:hidden animate-in fade-in">
            <div className="flex-1" onClick={() => setIsMobileDrawerOpen(false)} />
            <div className="bg-white w-4/5 max-w-xs h-full p-4 flex flex-col shadow-2xl animate-in slide-in-from-right">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                <span className="font-serif font-bold text-emerald-900 text-base flex items-center gap-2"><BookOpen className="w-5 h-5 text-emerald-700" /> Documents</span>
                <Button size="icon" variant="ghost" onClick={() => setIsMobileDrawerOpen(false)} className="h-8 w-8"><X className="w-5 h-5" /></Button>
              </div>
              <div className="relative mb-3">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700 focus:outline-none focus:border-emerald-400" />
              </div>
              <div className="flex-1 overflow-auto space-y-1 pr-1">
                {filteredDocs.map((doc) => (
                  <div key={doc.id} onClick={() => { if (selectedDocId !== doc.id) setIsNewDocCreated(false); setSelectedDocId(doc.id); setIsMobileDrawerOpen(false); }} className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer text-sm transition-all ${selectedDocId === doc.id ? 'bg-emerald-50 text-emerald-900 font-semibold border border-emerald-200 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
                    <span className="truncate flex-1">{doc.title || 'Untitled Document'}</span>
                    <button onClick={(e) => { e.stopPropagation(); setDocDeleteTarget(doc.id); }} className="text-slate-400 hover:text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <Dialog open={!!docDeleteTarget} onOpenChange={(open) => !open && setDocDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="text-xl font-semibold text-slate-900">Confirm Document Deletion</DialogTitle></DialogHeader>
          <div className="py-2 text-slate-600">Are you sure you want to delete this document? This action cannot be undone.</div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDocDeleteTarget(null)}>Cancel</Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={confirmDeleteDoc}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}