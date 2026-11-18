"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { 
  Trash2, FileText, BookOpen, X,   
  Bold, Italic, Strikethrough, List, ListOrdered, CheckSquare, Printer, Search,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, Indent, Outdent, Undo2, Redo2,
  Mic, MicOff, Link2, Pencil, Check, ChevronUp, ChevronDown
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";

const LAST_OPENED_STORAGE_KEY = "wedding_docs_last_opened";
const URL_REGEX = /((?:https?:\/\/|www\.)[^\s<>"']+)/gi;

function normalizeUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^www\./i.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
}

function openExternalLink(rawHref: string) {
  const href = normalizeUrl(rawHref);
  if (!href) return;

  const tempLink = document.createElement("a");
  tempLink.href = href;
  tempLink.target = "_blank";
  tempLink.rel = "noopener noreferrer";
  tempLink.style.display = "none";
  document.body.appendChild(tempLink);
  tempLink.click();
  document.body.removeChild(tempLink);
}

function createLinkElement(urlText: string, displayText?: string): HTMLAnchorElement {
  const cleanUrl = urlText.replace(/[.,!?;:)]+$/, "");
  const a = document.createElement("a");
  a.href = normalizeUrl(cleanUrl);
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.className = "text-blue-600 underline hover:text-blue-800 cursor-pointer break-all";
  a.textContent = displayText || cleanUrl;
  return a;
}

function linkifyTextToFragment(text: string): DocumentFragment {
  const fragment = document.createDocumentFragment();
  const lines = text.split(/\r?\n/);

  lines.forEach((line, lineIdx) => {
    let lastIdx = 0;
    let match: RegExpExecArray | null;
    const regex = new RegExp(URL_REGEX.source, "gi");

    while ((match = regex.exec(line)) !== null) {
      const matchStart = match.index;
      const rawMatch = match[0];
      const cleanUrl = rawMatch.replace(/[.,!?;:)]+$/, "");
      const trailingPunct = rawMatch.slice(cleanUrl.length);

      if (matchStart > lastIdx) {
        fragment.appendChild(document.createTextNode(line.slice(lastIdx, matchStart)));
      }

      const linkEl = createLinkElement(cleanUrl);
      fragment.appendChild(linkEl);

      if (trailingPunct) {
        fragment.appendChild(document.createTextNode(trailingPunct));
      }

      lastIdx = matchStart + rawMatch.length;
    }

    if (lastIdx < line.length) {
      fragment.appendChild(document.createTextNode(line.slice(lastIdx)));
    } else if (lastIdx > 0 && lastIdx === line.length) {
      fragment.appendChild(document.createTextNode(" "));
    }

    if (lineIdx < lines.length - 1) {
      fragment.appendChild(document.createElement("br"));
    }
  });

  return fragment;
}

function styleAndLinkifyContainer(container: HTMLElement | DocumentFragment): boolean {
  let didModify = false;

  const existingLinks = container.querySelectorAll("a");
  existingLinks.forEach((a) => {
    const rawHref = a.getAttribute("href") || a.textContent || "";
    if (rawHref) {
      a.setAttribute("href", normalizeUrl(rawHref));
    }
    a.setAttribute("target", "_blank");
    a.setAttribute("rel", "noopener noreferrer");
    a.className = "text-blue-600 underline hover:text-blue-800 cursor-pointer break-all";
  });

  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
  const textNodesToProcess: Text[] = [];

  let currentNode = walker.nextNode();
  while (currentNode) {
    const textNode = currentNode as Text;
    const parentEl = textNode.parentElement;
    if (
      parentEl &&
      !parentEl.closest("a") &&
      new RegExp(URL_REGEX.source, "i").test(textNode.textContent || "")
    ) {
      textNodesToProcess.push(textNode);
    }
    currentNode = walker.nextNode();
  }

  textNodesToProcess.forEach((textNode) => {
    const text = textNode.textContent || "";
    const fragment = linkifyTextToFragment(text);
    textNode.parentNode?.replaceChild(fragment, textNode);
    didModify = true;
  });

  return didModify;
}

function stripSearchHighlightsFromHtml(html: string): string {
  if (!html || !html.includes("data-doc-search")) return html;
  const temp = document.createElement("div");
  temp.innerHTML = html;
  temp.querySelectorAll('mark[data-doc-search="true"]').forEach((mark) => {
    const parent = mark.parentNode;
    if (parent) {
      parent.replaceChild(document.createTextNode(mark.textContent || ""), mark);
      parent.normalize();
    }
  });
  return temp.innerHTML;
}

function clearSearchHighlightsInDom(container: HTMLElement | null) {
  if (!container) return;
  const marks = container.querySelectorAll('mark[data-doc-search="true"]');
  if (marks.length === 0) return;
  marks.forEach((mark) => {
    const parent = mark.parentNode;
    if (parent) {
      parent.replaceChild(document.createTextNode(mark.textContent || ""), mark);
    }
  });
  container.normalize();
}

function getStoredLastOpenedMap(): Record<string, number> {
  try {
    const raw = localStorage.getItem(LAST_OPENED_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLastOpenedTimestamp(docId: string, timestampMs: number = Date.now()) {
  try {
    const map = getStoredLastOpenedMap();
    map[docId] = timestampMs;
    localStorage.setItem(LAST_OPENED_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Ignore localStorage quota/privacy errors
  }
}

// --- LIST INTERCHANGEABILITY HELPERS (CHECKBOX <-> BULLET <-> NUMBERED) ---
function createTaskItemElement(innerHtml: string, checked = false): HTMLDivElement {
  const wrapper = document.createElement("div");
  wrapper.className = "flex items-start gap-2.5 my-1.5 group select-none samsung-task-item";
  const textStyle = checked
    ? 'style="text-decoration: line-through; color: #94a3b8;"'
    : "";
  wrapper.innerHTML = `
    <input 
      type="checkbox" 
      ${checked ? 'checked="checked"' : ""}
      class="w-4 h-4 mt-1 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600 shrink-0" 
      onchange="
        const textSpan = this.nextElementSibling;
        if (this.checked) {
          this.setAttribute('checked', 'checked');
          textSpan.style.textDecoration = 'line-through';
          textSpan.style.color = '#94a3b8';
        } else {
          this.removeAttribute('checked');
          textSpan.style.textDecoration = 'none';
          textSpan.style.color = '#1e293b';
        }
      "
    />
    <span 
      contenteditable="true" 
      ${textStyle}
      class="outline-none border-b border-transparent focus:border-emerald-400 text-[#1e293b] flex-1 transition-colors min-h-[1.6em]"
    >${innerHtml && innerHtml.trim() !== "" ? innerHtml : "<br/>"}</span>
  `;
  return wrapper;
}

function getSelectedBlockElements(editor: HTMLElement): HTMLElement[] {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return [];
  const range = selection.getRangeAt(0);

  const blocks: HTMLElement[] = [];
  const seen = new Set<HTMLElement>();

  const resolveItemBlock = (node: Node | null): HTMLElement | null => {
    let curr: Node | null = node;
    while (curr && curr !== editor) {
      if (curr instanceof HTMLElement) {
        if (curr.classList.contains("samsung-task-item")) return curr;
        if (curr.tagName === "LI") return curr;
        if (curr.parentElement === editor && ["DIV", "P", "H1", "H2", "H3", "BLOCKQUOTE"].includes(curr.tagName)) {
          return curr;
        }
      }
      curr = curr.parentNode;
    }
    return null;
  };

  if (range.collapsed) {
    const block = resolveItemBlock(range.startContainer);
    if (block) return [block];
    return [];
  }

  const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, null);
  let node = walker.nextNode();
  while (node) {
    if (range.intersectsNode(node)) {
      const block = resolveItemBlock(node);
      if (block && !seen.has(block)) {
        seen.add(block);
        blocks.push(block);
      }
    }
    node = walker.nextNode();
  }

  if (blocks.length === 0) {
    const startBlock = resolveItemBlock(range.startContainer);
    if (startBlock) blocks.push(startBlock);
  }

  return blocks;
}

function unwrapTaskItemToDiv(taskEl: HTMLElement): HTMLDivElement {
  const span = taskEl.querySelector("span");
  const div = document.createElement("div");
  div.innerHTML = span ? span.innerHTML : "<br/>";
  taskEl.parentNode?.replaceChild(div, taskEl);
  return div;
}

function unwrapListItemToDiv(li: HTMLElement): HTMLDivElement {
  const parentList = li.parentElement;
  const div = document.createElement("div");
  div.innerHTML = li.innerHTML || "<br/>";

  if (!parentList || (parentList.tagName !== "UL" && parentList.tagName !== "OL")) {
    li.parentNode?.replaceChild(div, li);
    return div;
  }

  const siblings = Array.from(parentList.children) as HTMLElement[];
  const idx = siblings.indexOf(li);

  if (siblings.length === 1) {
    parentList.parentNode?.replaceChild(div, parentList);
  } else if (idx === 0) {
    parentList.parentNode?.insertBefore(div, parentList);
    li.remove();
  } else if (idx === siblings.length - 1) {
    parentList.parentNode?.insertBefore(div, parentList.nextSibling);
    li.remove();
  } else {
    const afterList = document.createElement(parentList.tagName.toLowerCase());
    siblings.slice(idx + 1).forEach((s) => afterList.appendChild(s));
    parentList.parentNode?.insertBefore(div, parentList.nextSibling);
    parentList.parentNode?.insertBefore(afterList, div.nextSibling);
    li.remove();
  }

  return div;
}

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

// --- GOOGLE DOCS TOOLBAR (DESKTOP TOP BAR + MOBILE KEYBOARD-DOCKED SINGLE-ROW BAR) ---
function DocToolbar({ 
  editorRef, 
  onContentChange,
  isMobile,
  isMobileEditing,
  onFinishMobileEdit
}: { 
  editorRef: React.RefObject<HTMLDivElement | null>;
  onContentChange: (html: string) => void;
  isMobile: boolean;
  isMobileEditing: boolean;
  onFinishMobileEdit: () => void;
}) {
  const [isListening, setIsListening] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (!isMobile || typeof window === "undefined" || !window.visualViewport) return;

    const vv = window.visualViewport;
    const handleViewportResize = () => {
      const offset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      setKeyboardOffset(offset);
    };

    vv.addEventListener("resize", handleViewportResize);
    vv.addEventListener("scroll", handleViewportResize);
    handleViewportResize();

    return () => {
      vv.removeEventListener("resize", handleViewportResize);
      vv.removeEventListener("scroll", handleViewportResize);
    };
  }, [isMobile]);

  const keepFocus = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
  };

  const execCmd = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onContentChange(editorRef.current.innerHTML);
    }
  };

  // Interchangeable List Switcher: Checklist <-> Bullet List <-> Numbered List
  const handleToggleListType = (targetType: "checklist" | "bullet" | "numbered") => {
    const editor = editorRef.current;
    if (!editor) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !editor.contains(selection.anchorNode)) {
      editor.focus();
      const range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }

    const blocks = getSelectedBlockElements(editor);

    // 1. Switching to BULLET or NUMBERED list
    if (targetType === "bullet" || targetType === "numbered") {
      const cmd = targetType === "bullet" ? "insertUnorderedList" : "insertOrderedList";
      const taskBlocks = blocks.filter((b) => b.classList.contains("samsung-task-item"));

      if (taskBlocks.length > 0) {
        // Convert any selected checklist items directly into <ul> or <ol> list items
        const listTag = targetType === "bullet" ? "ul" : "ol";
        const newList = document.createElement(listTag);
        let firstLi: HTMLLIElement | null = null;

        taskBlocks.forEach((taskEl, index) => {
          const span = taskEl.querySelector("span");
          const li = document.createElement("li");
          li.innerHTML = span ? span.innerHTML : "<br/>";
          newList.appendChild(li);
          if (!firstLi) firstLi = li;

          if (index === 0) {
            taskEl.parentNode?.insertBefore(newList, taskEl);
          }
          taskEl.remove();
        });

        if (firstLi && selection) {
          const range = document.createRange();
          range.selectNodeContents(firstLi);
          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);
        }

        onContentChange(editor.innerHTML);
        return;
      }

      // Standard toggle / switch between Bullet <-> Numbered <-> Plain text
      document.execCommand(cmd, false, "");
      onContentChange(editor.innerHTML);
      return;
    }

    // 2. Switching to CHECKLIST (from plain text, bullet list, numbered list, or toggling off existing checklist)
    if (blocks.length === 0) {
      const taskEl = createTaskItemElement("<br/>", false);
      editor.appendChild(taskEl);
      const span = taskEl.querySelector("span");
      if (span && selection) {
        const range = document.createRange();
        range.setStart(span, 0);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      onContentChange(editor.innerHTML);
      return;
    }

    const allAreTasks = blocks.every((b) => b.classList.contains("samsung-task-item"));

    if (allAreTasks) {
      // Toggle OFF checklist -> revert cleanly to normal paragraphs (just like clicking Bullets twice)
      let lastDiv: HTMLDivElement | null = null;
      blocks.forEach((taskEl) => {
        lastDiv = unwrapTaskItemToDiv(taskEl);
      });
      if (lastDiv && selection) {
        const range = document.createRange();
        range.selectNodeContents(lastDiv);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      onContentChange(editor.innerHTML);
      return;
    }

    // Convert plain blocks, <li> bullet items, or <li> numbered items into interactive checkboxes
    let lastCreatedSpan: HTMLElement | null = null;

    blocks.forEach((block) => {
      if (block.classList.contains("samsung-task-item")) {
        lastCreatedSpan = block.querySelector("span");
        return;
      }

      let targetDiv: HTMLElement = block;
      if (block.tagName === "LI") {
        targetDiv = unwrapListItemToDiv(block);
      }

      const rawHtml = targetDiv.innerHTML;
      const lines = rawHtml.split(/<br\s*\/?>/i);
      const nonEmptyLines = lines.filter((l) => l.replace(/&nbsp;/g, " ").trim() !== "");
      const itemsToMake = nonEmptyLines.length > 0 ? nonEmptyLines : ["<br/>"];

      const frag = document.createDocumentFragment();
      itemsToMake.forEach((lineHtml) => {
        const taskEl = createTaskItemElement(lineHtml, false);
        const span = taskEl.querySelector("span");
        if (span) lastCreatedSpan = span;
        frag.appendChild(taskEl);
      });

      targetDiv.parentNode?.replaceChild(frag, targetDiv);
    });

    if (lastCreatedSpan && selection) {
      const range = document.createRange();
      range.selectNodeContents(lastCreatedSpan);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    onContentChange(editor.innerHTML);
  };

  const insertLink = () => {
    const selection = window.getSelection();
    const selectedText = selection ? selection.toString().trim() : '';
    const savedRange = selection && selection.rangeCount > 0 ? selection.getRangeAt(0).cloneRange() : null;

    const rawUrl = prompt("Enter URL:", "");
    if (!rawUrl) return;
    const url = normalizeUrl(rawUrl);

    if (editorRef.current && savedRange) {
      editorRef.current.focus();
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(savedRange);
    }

    if (selectedText) {
      document.execCommand('createLink', false, url);
    } else {
      const linkText = prompt("Enter link text:", url) || url;
      const html = `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline hover:text-blue-800 cursor-pointer break-all">${linkText}</a>&nbsp;`;
      document.execCommand('insertHTML', false, html);
    }

    if (editorRef.current) {
      styleAndLinkifyContainer(editorRef.current);
      onContentChange(editorRef.current.innerHTML);
    }
  };

  const toggleVoiceToText = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice to text is not supported in this browser. Please use Google Chrome, Edge, or Safari.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = navigator.language || "en-US";

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript && editorRef.current) {
        const editor = editorRef.current;
        const selection = window.getSelection();

        if (!selection || selection.rangeCount === 0 || !editor.contains(selection.anchorNode)) {
          editor.focus();
          const range = document.createRange();
          range.selectNodeContents(editor);
          range.collapse(false);
          selection?.removeAllRanges();
          selection?.addRange(range);
        }

        const textToInsert = finalTranscript.trim() + " ";
        const inserted = document.execCommand("insertText", false, textToInsert);

        if (!inserted) {
          const sel = window.getSelection();
          if (sel && sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            const textNode = document.createTextNode(textToInsert);
            range.insertNode(textNode);
            range.setStartAfter(textNode);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
          }
        }

        onContentChange(editor.innerHTML);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  if (isMobile && !isMobileEditing) {
    return null;
  }

  return (
    <div
      style={isMobile ? { bottom: `${keyboardOffset}px` } : undefined}
      className={
        isMobile
          ? "fixed left-0 right-0 z-40 bg-slate-50/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] flex items-center gap-1 overflow-x-auto no-scrollbar"
          : "flex flex-wrap items-center gap-1.5 bg-slate-50 border border-slate-200 p-2 rounded-lg text-slate-700 shadow-sm sticky top-0 z-20"
      }
    >
      {isMobile && (
        <>
          <button
            type="button"
            onMouseDown={keepFocus}
            onClick={onFinishMobileEdit}
            className="p-2 bg-emerald-600 text-white rounded-md shrink-0 flex items-center gap-1 text-xs font-medium shadow-sm active:scale-95"
            title="Done Editing"
          >
            <Check className="w-4 h-4" />
          </button>
          <div className="h-5 w-[1px] bg-slate-300 mx-1 shrink-0" />
        </>
      )}

      <button type="button" onMouseDown={keepFocus} onClick={() => execCmd('undo')} className="p-2 md:p-1.5 hover:bg-slate-200 active:bg-slate-200 rounded transition-colors shrink-0" title="Undo"><Undo2 className="w-4 h-4" /></button>
      <button type="button" onMouseDown={keepFocus} onClick={() => execCmd('redo')} className="p-2 md:p-1.5 hover:bg-slate-200 active:bg-slate-200 rounded transition-colors shrink-0" title="Redo"><Redo2 className="w-4 h-4" /></button>
      <div className="h-4 w-[1px] bg-slate-300 mx-1 shrink-0" />
      <button type="button" onMouseDown={keepFocus} onClick={() => execCmd('bold')} className="p-2 md:p-1.5 hover:bg-slate-200 active:bg-slate-200 rounded transition-colors shrink-0" title="Bold"><Bold className="w-4 h-4" /></button>
      <button type="button" onMouseDown={keepFocus} onClick={() => execCmd('italic')} className="p-2 md:p-1.5 hover:bg-slate-200 active:bg-slate-200 rounded transition-colors shrink-0" title="Italic"><Italic className="w-4 h-4" /></button>
      <button type="button" onMouseDown={keepFocus} onClick={() => execCmd('strikeThrough')} className="p-2 md:p-1.5 hover:bg-slate-200 active:bg-slate-200 rounded transition-colors shrink-0" title="Strikethrough"><Strikethrough className="w-4 h-4" /></button>
      <button type="button" onMouseDown={keepFocus} onClick={insertLink} className="p-2 md:p-1.5 hover:bg-slate-200 active:bg-slate-200 rounded transition-colors shrink-0" title="Insert Link"><Link2 className="w-4 h-4" /></button>
      <div className="h-4 w-[1px] bg-slate-300 mx-1 shrink-0" />
      <button type="button" onMouseDown={keepFocus} onClick={() => handleToggleListType("checklist")} className="p-2 md:p-1.5 hover:bg-slate-200 active:bg-slate-200 rounded transition-colors shrink-0" title="Checklist"><CheckSquare className="w-4 h-4" /></button>
      <button type="button" onMouseDown={keepFocus} onClick={() => handleToggleListType("bullet")} className="p-2 md:p-1.5 hover:bg-slate-200 active:bg-slate-200 rounded transition-colors shrink-0" title="Bullet List"><List className="w-4 h-4" /></button>
      <button type="button" onMouseDown={keepFocus} onClick={() => handleToggleListType("numbered")} className="p-2 md:p-1.5 hover:bg-slate-200 active:bg-slate-200 rounded transition-colors shrink-0" title="Numbered List"><ListOrdered className="w-4 h-4" /></button>
      <div className="h-4 w-[1px] bg-slate-300 mx-1 shrink-0" />
      <button type="button" onMouseDown={keepFocus} onClick={() => execCmd('justifyLeft')} className="p-2 md:p-1.5 hover:bg-slate-200 active:bg-slate-200 rounded transition-colors shrink-0" title="Align Left"><AlignLeft className="w-4 h-4" /></button>
      <button type="button" onMouseDown={keepFocus} onClick={() => execCmd('justifyCenter')} className="p-2 md:p-1.5 hover:bg-slate-200 active:bg-slate-200 rounded transition-colors shrink-0" title="Align Center"><AlignCenter className="w-4 h-4" /></button>
      <button type="button" onMouseDown={keepFocus} onClick={() => execCmd('justifyRight')} className="p-2 md:p-1.5 hover:bg-slate-200 active:bg-slate-200 rounded transition-colors shrink-0" title="Align Right"><AlignRight className="w-4 h-4" /></button>
      <button type="button" onMouseDown={keepFocus} onClick={() => execCmd('justifyFull')} className="p-2 md:p-1.5 hover:bg-slate-200 active:bg-slate-200 rounded transition-colors shrink-0" title="Justify"><AlignJustify className="w-4 h-4" /></button>
      <div className="h-4 w-[1px] bg-slate-300 mx-1 shrink-0" />
      <button type="button" onMouseDown={keepFocus} onClick={() => execCmd('outdent')} className="p-2 md:p-1.5 hover:bg-slate-200 active:bg-slate-200 rounded transition-colors shrink-0" title="Decrease Indent"><Outdent className="w-4 h-4" /></button>
      <button type="button" onMouseDown={keepFocus} onClick={() => execCmd('indent')} className="p-2 md:p-1.5 hover:bg-slate-200 active:bg-slate-200 rounded transition-colors shrink-0" title="Increase Indent"><Indent className="w-4 h-4" /></button>
      <div className="h-4 w-[1px] bg-slate-300 mx-1 shrink-0" />
      <button 
        type="button" 
        onMouseDown={keepFocus}
        onClick={toggleVoiceToText} 
        className={`p-2 md:p-1.5 rounded transition-colors border shadow-sm flex items-center gap-1 shrink-0 ${
          isListening 
            ? "bg-red-50 text-red-600 border-red-300 animate-pulse" 
            : "bg-white hover:bg-slate-200 border-slate-200 text-slate-700"
        }`} 
        title={isListening ? "Stop Voice Typing" : "Start Voice Typing"}
      >
        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
      </button>
      <div className="h-4 w-[1px] bg-slate-300 mx-1 shrink-0" />
      <select onChange={(e) => execCmd('fontName', e.target.value)} className="bg-white border border-slate-200 text-xs rounded px-2 py-1.5 md:py-1 outline-none hover:border-slate-300 cursor-pointer shrink-0" defaultValue="Arial" title="Font Family">
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
            if (editorRef.current) onContentChange(editorRef.current.innerHTML);
          }
        }} 
        className="bg-white border border-slate-200 text-xs rounded px-2 py-1.5 md:py-1 outline-none hover:border-slate-300 cursor-pointer shrink-0" 
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

// --- SINGLE CONTINUOUS PAGELESS GOOGLE DOCS EDITOR ---
function SinglePageDocEditor({
  docId,
  content,
  onChange,
  editorRef,
  isMobile,
  isMobileEditing,
  onMobileEditChange,
  onClearSearchHighlights
}: {
  docId: string;
  content: string;
  onChange: (html: string) => void;
  editorRef: React.RefObject<HTMLDivElement | null>;
  isMobile: boolean;
  isMobileEditing: boolean;
  onMobileEditChange: (editing: boolean) => void;
  onClearSearchHighlights: () => void;
}) {
  const loadedDocIdRef = useRef<string | null>(null);
  const touchStartPosRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastLinkOpenTimeRef = useRef<number>(0);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const isDifferentDoc = loadedDocIdRef.current !== docId;
    const currentCleanHtml = stripSearchHighlightsFromHtml(editor.innerHTML);

    if (
      isDifferentDoc ||
      editor.innerHTML === "" ||
      (content !== currentCleanHtml && document.activeElement !== editor)
    ) {
      loadedDocIdRef.current = docId;
      if (content && !content.trim().startsWith("<")) {
        editor.innerHTML = `<div>${content}</div>`;
      } else {
        editor.innerHTML = content || "<div><br/></div>";
      }

      editor.querySelectorAll<HTMLElement>('[data-page-break="true"]').forEach((el) => {
        el.style.removeProperty("margin-top");
        el.removeAttribute("data-page-break");
      });

      styleAndLinkifyContainer(editor);
    }
  }, [docId, content, editorRef]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const editor = editorRef.current;
    if (!editor) return;

    const nativeEvent = e.nativeEvent as InputEvent;
    const inputData = nativeEvent?.data || "";
    const inputType = nativeEvent?.inputType || "";

    const isClipboardChipOrUrlInsert =
      inputType === "insertFromPaste" ||
      inputType === "insertReplacementText" ||
      (inputData.length > 4 && new RegExp(URL_REGEX.source, "i").test(inputData));

    if (isClipboardChipOrUrlInsert) {
      const didLinkify = styleAndLinkifyContainer(editor);
      if (didLinkify) {
        const sel = window.getSelection();
        if (sel && editor.lastChild) {
          const range = document.createRange();
          range.selectNodeContents(editor);
          range.collapse(false);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
    }

    onChange(editor.innerHTML);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      touchStartPosRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now()
      };
    } else {
      touchStartPosRef.current = null;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStartPosRef.current || e.changedTouches.length !== 1) return;

    const dx = Math.abs(e.changedTouches[0].clientX - touchStartPosRef.current.x);
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartPosRef.current.y);
    const duration = Date.now() - touchStartPosRef.current.time;
    touchStartPosRef.current = null;

    if (dx > 10 || dy > 10 || duration > 450) return;

    const target = e.target as HTMLElement;

    if (target.tagName === "INPUT" && (target as HTMLInputElement).type === "checkbox") {
      return;
    }

    const anchor = target.closest("a") as HTMLAnchorElement | null;
    if (anchor) {
      const rawHref = anchor.getAttribute("href") || anchor.textContent || "";
      if (rawHref) {
        e.preventDefault();
        e.stopPropagation();
        lastLinkOpenTimeRef.current = Date.now();
        editorRef.current?.blur();
        onMobileEditChange(false);
        openExternalLink(rawHref);
      }
      return;
    }

    if (isMobile && !isMobileEditing) {
      onClearSearchHighlights();
      onMobileEditChange(true);
      requestAnimationFrame(() => {
        editorRef.current?.focus();
      });
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "INPUT" && (target as HTMLInputElement).type === "checkbox") {
      setTimeout(() => {
        if (editorRef.current) onChange(editorRef.current.innerHTML);
      }, 0);
      return;
    }

    const anchor = target.closest("a") as HTMLAnchorElement | null;
    if (anchor) {
      e.preventDefault();
      e.stopPropagation();
      if (Date.now() - lastLinkOpenTimeRef.current < 500) return;
      const rawHref = anchor.getAttribute("href") || anchor.textContent || "";
      if (rawHref) {
        openExternalLink(rawHref);
      }
    } else if (!isMobile) {
      editorRef.current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const clipboardData = e.clipboardData;
    const htmlData = clipboardData.getData("text/html");
    const textData =
      clipboardData.getData("text/plain") ||
      clipboardData.getData("text/uri-list") ||
      "";

    const editor = editorRef.current;
    if (!editor) return;

    let selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !editor.contains(selection.anchorNode)) {
      editor.focus();
      selection = window.getSelection();
      if (selection) {
        const fallbackRange = document.createRange();
        fallbackRange.selectNodeContents(editor);
        fallbackRange.collapse(false);
        selection.removeAllRanges();
        selection.addRange(fallbackRange);
      }
    }

    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    range.deleteContents();

    const trimmedText = textData.trim();
    const isPlainSingleUrl = /^(https?:\/\/|www\.)[^\s]+$/i.test(trimmedText);

    if (isPlainSingleUrl) {
      const fragment = linkifyTextToFragment(trimmedText);
      const lastInserted = fragment.lastChild;
      range.insertNode(fragment);
      if (lastInserted) {
        range.setStartAfter(lastInserted);
        range.collapse(true);
      }
    } else if (htmlData) {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = htmlData;
      styleAndLinkifyContainer(tempDiv);

      const fragment = document.createDocumentFragment();
      while (tempDiv.firstChild) {
        fragment.appendChild(tempDiv.firstChild);
      }
      const lastInserted = fragment.lastChild;
      range.insertNode(fragment);
      if (lastInserted) {
        range.setStartAfter(lastInserted);
        range.collapse(true);
      }
    } else if (textData) {
      const fragment = linkifyTextToFragment(textData);
      const lastInserted = fragment.lastChild;
      range.insertNode(fragment);
      if (lastInserted) {
        range.setStartAfter(lastInserted);
        range.collapse(true);
      }
    }

    selection.removeAllRanges();
    selection.addRange(range);

    onChange(editor.innerHTML);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    if (e.key === "Backspace" && selection.isCollapsed && selection.anchorOffset === 0) {
      let container: HTMLElement | null = selection.anchorNode as HTMLElement;
      
      while (container && container !== editorRef.current) {
        if (container.classList && container.classList.contains('samsung-task-item')) {
          const span = container.querySelector('span');
          if (selection.anchorNode === span || selection.anchorNode === span?.firstChild) {
            e.preventDefault();
            const normalDiv = unwrapTaskItemToDiv(container);
            
            const range = document.createRange();
            range.setStart(normalDiv, 0);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
            
            onChange(editorRef.current?.innerHTML || "");
            return;
          }
        }
        container = container.parentElement;
      }
    }

    if (e.key === "Enter") {
      let container: HTMLElement | null = selection.anchorNode as HTMLElement;
      
      while (container && container !== editorRef.current) {
        if (container.classList && container.classList.contains('samsung-task-item')) {
          break;
        }
        container = container.parentElement;
      }

      if (container && container.classList && container.classList.contains('samsung-task-item')) {
        e.preventDefault();

        const textSpan = container.querySelector('span');
        const textValue = textSpan ? textSpan.innerText.trim() : "";

        if (textValue === "") {
          const normalDiv = unwrapTaskItemToDiv(container);

          const range = document.createRange();
          range.setStart(normalDiv, 0);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);

          onChange(editorRef.current?.innerHTML || "");
          return;
        }

        const newTaskWrapper = createTaskItemElement("<br/>", false);
        container.parentNode?.insertBefore(newTaskWrapper, container.nextSibling);

        const newSpan = newTaskWrapper.querySelector('span');
        if (newSpan) {
          const range = document.createRange();
          range.setStart(newSpan, 0);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        }

        onChange(editorRef.current?.innerHTML || "");
      }
    }
  };

  return (
    <div 
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={
        isMobile
          ? "min-h-[calc(100dvh-180px)] w-full bg-white overflow-x-hidden pb-24"
          : "h-[70vh] w-full bg-white overflow-y-auto overflow-x-hidden cursor-text"
      }
    >
      <div className="w-full min-h-full bg-white px-4 py-4 md:px-14 md:py-10 max-w-[820px] mx-auto">
        <div
          ref={editorRef}
          contentEditable
          inputMode={isMobile && !isMobileEditing ? "none" : "text"}
          onFocus={() => {
            onClearSearchHighlights();
            if (isMobile) onMobileEditChange(true);
          }}
          onInput={handleInput}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          suppressContentEditableWarning
          style={{
            fontFamily: "Arial, sans-serif",
            fontSize: "16px",
            lineHeight: "1.65",
            color: "#1e293b",
            WebkitTextSizeAdjust: "100%",
            textSizeAdjust: "100%",
            minHeight: "60vh"
          }}
          className="
            w-full outline-none text-[#1e293b] cursor-text break-words
            empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400/60
            [&>div]:min-h-[1.65em] [&>p]:min-h-[1.65em] [&_li]:min-h-[1.65em]
            [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6
            [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic [&_strike]:line-through [&_s]:line-through
            [&_a]:text-blue-600 [&_a]:underline [&_a]:cursor-pointer hover:[&_a]:text-blue-800 [&_a]:py-0.5
          "
          data-placeholder={isMobile ? "Tap to start typing..." : "Start typing your document..."}
        />
      </div>
    </div>
  );
}

// --- EDITABLE TITLE COMPONENT ---
function EditableTitle({ 
  value, 
  onChange, 
  titleRef
}: { 
  value: string; 
  onChange: (val: string) => void; 
  titleRef: React.RefObject<HTMLDivElement | null>;
}) {
  useEffect(() => {
    if (titleRef.current && value !== titleRef.current.innerText && document.activeElement !== titleRef.current) {
      titleRef.current.innerText = value || "";
    }
  }, [value, titleRef]);

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
  updated_at?: string;
  last_opened_at?: string;
}

export default function WeddingDocsPage() {
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [docDeleteTarget, setDocDeleteTarget] = useState<string | null>(null);
  const [docLoading, setDocLoading] = useState(true);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileEditing, setIsMobileEditing] = useState(false);

  const [isDocSearchOpen, setIsDocSearchOpen] = useState(false);
  const [docSearchTerm, setDocSearchTerm] = useState("");
  const [matchCount, setMatchCount] = useState(0);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const docSearchInputRef = useRef<HTMLInputElement | null>(null);

  const editorRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLDivElement | null>(null);

  const [sidebarWidth, setSidebarWidth] = useState(280);
  const isResizingRef = useRef(false);

  const pendingUpdates = useRef<Record<string, Partial<DocItem>>>({});
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        setIsDocSearchOpen(true);
        setIsMobileEditing(false);
        setTimeout(() => {
          docSearchInputRef.current?.focus();
          docSearchInputRef.current?.select();
        }, 50);
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const highlightActiveMatch = useCallback((index: number) => {
    const editor = editorRef.current;
    if (!editor) return;
    const marks = Array.from(editor.querySelectorAll<HTMLElement>('mark[data-doc-search="true"]'));
    marks.forEach((mark, idx) => {
      if (idx === index) {
        mark.style.backgroundColor = "#f59e0b";
        mark.style.color = "#ffffff";
        mark.style.borderRadius = "3px";
        mark.style.padding = "0 2px";
        mark.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        mark.style.backgroundColor = "#fef08a";
        mark.style.color = "#1e293b";
        mark.style.borderRadius = "3px";
        mark.style.padding = "0 2px";
      }
    });
  }, []);

  const runInDocSearch = useCallback((term: string) => {
    const editor = editorRef.current;
    if (!editor) return;

    clearSearchHighlightsInDom(editor);

    const trimmed = term.trim();
    if (!trimmed) {
      setMatchCount(0);
      setCurrentMatchIndex(0);
      return;
    }

    const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "gi");

    const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT, null);
    const textNodes: Text[] = [];
    let current = walker.nextNode();
    while (current) {
      if ((current.textContent || "").trim().length > 0) {
        textNodes.push(current as Text);
      }
      current = walker.nextNode();
    }

    let totalMatches = 0;

    textNodes.forEach((textNode) => {
      const text = textNode.textContent || "";
      regex.lastIndex = 0;
      if (!regex.test(text)) return;

      regex.lastIndex = 0;
      const frag = document.createDocumentFragment();
      let lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
          frag.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
        }
        const mark = document.createElement("mark");
        mark.setAttribute("data-doc-search", "true");
        mark.textContent = match[0];
        frag.appendChild(mark);
        totalMatches++;
        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < text.length) {
        frag.appendChild(document.createTextNode(text.slice(lastIndex)));
      }

      textNode.parentNode?.replaceChild(frag, textNode);
    });

    setMatchCount(totalMatches);
    if (totalMatches > 0) {
      setCurrentMatchIndex(0);
      highlightActiveMatch(0);
    } else {
      setCurrentMatchIndex(0);
    }
  }, [highlightActiveMatch]);

  useEffect(() => {
    if (!isDocSearchOpen) {
      clearSearchHighlightsInDom(editorRef.current);
      setMatchCount(0);
      setCurrentMatchIndex(0);
      return;
    }
    runInDocSearch(docSearchTerm);
  }, [docSearchTerm, isDocSearchOpen, selectedDocId, runInDocSearch]);

  const goToNextMatch = () => {
    if (matchCount === 0) return;
    const nextIdx = (currentMatchIndex + 1) % matchCount;
    setCurrentMatchIndex(nextIdx);
    highlightActiveMatch(nextIdx);
  };

  const goToPrevMatch = () => {
    if (matchCount === 0) return;
    const prevIdx = (currentMatchIndex - 1 + matchCount) % matchCount;
    setCurrentMatchIndex(prevIdx);
    highlightActiveMatch(prevIdx);
  };

  const closeDocSearch = () => {
    setIsDocSearchOpen(false);
    setDocSearchTerm("");
    clearSearchHighlightsInDom(editorRef.current);
  };

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
        const openedMap = getStoredLastOpenedMap();

        const sortedDocs = [...(data as DocItem[])].sort((a, b) => {
          const aOpenTime = Math.max(
            openedMap[a.id] || 0,
            a.last_opened_at ? new Date(a.last_opened_at).getTime() : 0,
            new Date(a.updated_at || a.created_at).getTime()
          );
          const bOpenTime = Math.max(
            openedMap[b.id] || 0,
            b.last_opened_at ? new Date(b.last_opened_at).getTime() : 0,
            new Date(b.updated_at || b.created_at).getTime()
          );
          return bOpenTime - aOpenTime;
        });

        setDocs(sortedDocs);
        if (sortedDocs.length > 0) {
          setSelectedDocId(sortedDocs[0].id);
          saveLastOpenedTimestamp(sortedDocs[0].id);
        } else {
          setSelectedDocId(null);
        }
      } else {
        setDocs([]);
        setSelectedDocId(null);
      }
      setDocLoading(false);
    };

    fetchDocs();

    const channel = supabase
      .channel('wedding-docs-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'wedding_docs' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setDocs((prev) => {
              if (prev.some(d => d.id === payload.new.id)) return prev;
              return [payload.new as DocItem, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            setDocs((prev) => 
              prev.map(d => d.id === payload.new.id ? { ...d, ...(payload.new as DocItem) } : d)
            );
          } else if (payload.eventType === 'DELETE') {
            setDocs((prev) => prev.filter(d => d.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSelectDoc = useCallback((docId: string) => {
    const nowMs = Date.now();
    const nowIso = new Date(nowMs).toISOString();

    clearSearchHighlightsInDom(editorRef.current);
    setSelectedDocId(docId);
    setIsMobileEditing(false);
    saveLastOpenedTimestamp(docId, nowMs);

    setDocs((prev) => {
      const target = prev.find((d) => d.id === docId);
      if (!target) return prev;
      const updatedTarget: DocItem = {
        ...target,
        ...( "last_opened_at" in target ? { last_opened_at: nowIso } : {} )
      };
      return [updatedTarget, ...prev.filter((d) => d.id !== docId)];
    });

    const targetDoc = docs.find((d) => d.id === docId);
    if (targetDoc && !docId.startsWith("local-") && "last_opened_at" in targetDoc) {
      supabase
        .from("wedding_docs")
        .update({ last_opened_at: nowIso })
        .eq("id", docId)
        .then(() => {});
    }
  }, [docs]);

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
    const untitledCount = docs.filter(d => d.title === 'Untitled Document' || /^Untitled Document-\d+$/.test(d.title)).length;
    const newTitle = untitledCount === 0 ? 'Untitled Document' : `Untitled Document-${untitledCount}`;
    const nowMs = Date.now();
    const now = new Date(nowMs).toISOString();

    closeDocSearch();
    const newDoc = { title: newTitle, content: '<div><br/></div>', created_at: now };
    const { data, error } = await supabase.from('wedding_docs').insert([newDoc]).select().single();

    if (!error && data) {
      saveLastOpenedTimestamp(data.id, nowMs);
      setDocs(prev => [data, ...prev]);
      setSelectedDocId(data.id);
    } else {
      const fallbackId = `local-${nowMs}`;
      const fallbackDoc: DocItem = { id: fallbackId, ...newDoc, updated_at: now };
      saveLastOpenedTimestamp(fallbackId, nowMs);
      setDocs(prev => [fallbackDoc, ...prev]);
      setSelectedDocId(fallbackId);
    }
    setIsMobileDrawerOpen(false);
    setSearchQuery("");
    setIsMobileEditing(true);
    
    setTimeout(() => {
      editorRef.current?.focus();
    }, 50);
  };

  const updateDoc = (id: string, updates: Partial<DocItem>) => {
    const cleanUpdates: Partial<DocItem> = { ...updates };
    if (typeof cleanUpdates.content === "string") {
      cleanUpdates.content = stripSearchHighlightsFromHtml(cleanUpdates.content);
    }

    const nowMs = Date.now();
    const now = new Date(nowMs).toISOString();
    saveLastOpenedTimestamp(id, nowMs);

    const targetDoc = docs.find(d => d.id === id);
    const hasUpdatedAtColumn = targetDoc ? 'updated_at' in targetDoc : false;
    const hasLastOpenedColumn = targetDoc ? 'last_opened_at' in targetDoc : false;

    const dbTimestampUpdate: Partial<DocItem> = {
      ...(hasUpdatedAtColumn ? { updated_at: now } : { created_at: now }),
      ...(hasLastOpenedColumn ? { last_opened_at: now } : {})
    };

    setDocs(prev => {
      const target = prev.find(d => d.id === id);
      if (!target) return prev;
      const updatedDoc: DocItem = {
        ...target,
        ...cleanUpdates,
        ...dbTimestampUpdate,
        updated_at: now
      };
      return [updatedDoc, ...prev.filter(d => d.id !== id)];
    });
    
    if (id.startsWith('local-')) return;

    pendingUpdates.current[id] = {
      ...pendingUpdates.current[id],
      ...cleanUpdates,
      ...dbTimestampUpdate
    };

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(async () => {
      const updatesToProcess = { ...pendingUpdates.current };
      pendingUpdates.current = {};
      
      for (const docId of Object.keys(updatesToProcess)) {
        await supabase
          .from('wedding_docs')
          .update(updatesToProcess[docId])
          .eq('id', docId);
      }
    }, 1000);
  };

  const confirmDeleteDoc = async () => {
    if (!docDeleteTarget) return;
    const remaining = docs.filter(d => d.id !== docDeleteTarget);
    setDocs(remaining);

    if (!docDeleteTarget.startsWith('local-')) {
      await supabase.from('wedding_docs').delete().eq('id', docDeleteTarget);
    }
    if (selectedDocId === docDeleteTarget) {
      if (remaining.length > 0) {
        setSelectedDocId(remaining[0].id);
        saveLastOpenedTimestamp(remaining[0].id);
      } else {
        setSelectedDocId(null);
      }
    }
    setDocDeleteTarget(null);
  };

  const handlePrint = () => {
    if (!activeDoc) return;

    const rawLiveHtml = editorRef.current ? editorRef.current.innerHTML : (activeDoc.content || '');
    const cleanLiveHtml = stripSearchHighlightsFromHtml(rawLiveHtml);
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const lastModified = activeDoc.updated_at || activeDoc.created_at;
    const formattedDate = new Date(lastModified).toLocaleDateString("en-US", {
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
              margin: 20mm 20mm 22mm 20mm;
              @bottom-center {
                content: "Page " counter(page) " of " counter(pages);
                font-family: Arial, sans-serif;
                font-size: 11px;
                color: #64748b;
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
            .content a { color: #2563eb; text-decoration: underline; }
            input[type="checkbox"] { margin-right: 10px; transform: scale(1.1); accent-color: #059669; }
            .samsung-task-item { display: flex; align-items: center; margin: 6px 0; }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1>${activeDoc.title || 'Untitled Document'}</h1>
            <div class="date">Last updated: ${formattedDate}</div>
          </div>
          <div class="content">${cleanLiveHtml}</div>
          <script>
            window.onload = () => { 
              setTimeout(() => {
                window.print(); 
                window.close(); 
              }, 300);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (docLoading) return <div className="p-12 text-center text-emerald-600 font-bold">Loading Documents...</div>;

  return (
    <div className="p-0 sm:p-4 md:p-8 max-w-7xl mx-auto min-h-screen space-y-2 md:space-y-6 bg-white md:bg-transparent">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-4 px-4 pt-3 pb-2 md:p-0 md:mb-8 border-b md:border-none border-slate-100">
        <div className="w-full md:w-auto flex items-center justify-between md:block">
          <div>
            <h1 className="font-serif text-xl md:text-3xl font-bold text-emerald-900 flex items-center gap-2 md:gap-3">
              <FileText className="w-5 h-5 md:w-8 md:h-8 text-emerald-600" /> Wedding Documents
            </h1>
            <p className="hidden md:block mt-2 text-slate-500">
              Manage itineraries, notes, and planning guides.
            </p>
          </div>
          <div className="flex items-center gap-1.5 md:hidden">
            <Button variant="outline" size="sm" onClick={() => addDoc()} className="border-emerald-200 text-emerald-800 gap-1 h-8 px-2.5 text-xs font-medium">
              <FilePlusCornerIcon className="w-3.5 h-3.5 text-emerald-700" /> New
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsMobileDrawerOpen(true)} className="border-emerald-200 text-emerald-800 gap-1 h-8 px-2.5 text-xs font-medium">
              <BookOpen className="w-3.5 h-3.5 text-emerald-700" /> Docs
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:gap-6 relative items-start">
        <div className="flex-1 min-w-0 w-full bg-white md:rounded-xl md:shadow-md md:border md:border-slate-200 p-0 md:p-6 flex flex-col">
          {activeDoc ? (
            <div className="flex flex-col md:space-y-3">
              <div className="flex items-start justify-between px-4 py-2.5 md:px-0 md:py-0 md:pb-2 border-b border-slate-100 gap-2 sticky top-0 bg-white/95 backdrop-blur-sm z-20 md:static">
                <div className="flex-1 min-w-0">
                  <EditableTitle 
                    titleRef={titleRef}
                    value={activeDoc.title} 
                    onChange={(val) => updateDoc(activeDoc.id, { title: val })} 
                  />
                  <div className="text-[10px] md:text-[11px] text-slate-400 mt-0.5 md:mt-1 truncate">
                    Last updated: {new Date(activeDoc.updated_at || activeDoc.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (isDocSearchOpen) {
                        closeDocSearch();
                      } else {
                        setIsDocSearchOpen(true);
                        setIsMobileEditing(false);
                        setTimeout(() => {
                          docSearchInputRef.current?.focus();
                        }, 50);
                      }
                    }}
                    className={`gap-1.5 border-slate-200 h-8 px-2.5 text-xs font-medium transition-colors ${
                      isDocSearchOpen
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                    title="Find in Document"
                  >
                    <Search className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="hidden sm:inline">Find</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 border-slate-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 shrink-0 h-8 px-2.5 text-xs font-medium transition-colors" title="Print & Preview">
                    <Printer className="w-3.5 h-3.5 text-emerald-600" /> <span className="hidden sm:inline">Print</span>
                  </Button>
                </div>
              </div>

              {isDocSearchOpen && (
                <div className="flex items-center gap-2 px-4 py-2 md:px-3 md:py-2 bg-emerald-50/70 border-b md:border border-emerald-200 md:rounded-lg sticky top-[58px] md:static z-20">
                  <Search className="w-4 h-4 text-emerald-700 shrink-0" />
                  <input
                    ref={docSearchInputRef}
                    type="text"
                    value={docSearchTerm}
                    onChange={(e) => setDocSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (e.shiftKey) {
                          goToPrevMatch();
                        } else {
                          goToNextMatch();
                        }
                      } else if (e.key === "Escape") {
                        closeDocSearch();
                      }
                    }}
                    placeholder="Find in this document..."
                    className="flex-1 min-w-0 bg-white border border-emerald-200 rounded px-2.5 py-1 text-xs md:text-sm text-slate-800 outline-none focus:border-emerald-500"
                  />
                  <span className="text-[11px] font-medium text-slate-500 shrink-0 min-w-[54px] text-center">
                    {docSearchTerm.trim()
                      ? matchCount > 0
                        ? `${currentMatchIndex + 1} of ${matchCount}`
                        : "0 of 0"
                      : ""}
                  </span>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={goToPrevMatch}
                      disabled={matchCount === 0}
                      className="p-1 rounded hover:bg-emerald-100 disabled:opacity-40 text-slate-700"
                      title="Previous Match"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={goToNextMatch}
                      disabled={matchCount === 0}
                      className="p-1 rounded hover:bg-emerald-100 disabled:opacity-40 text-slate-700"
                      title="Next Match"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={closeDocSearch}
                      className="p-1 rounded hover:bg-emerald-100 text-slate-600 ml-0.5"
                      title="Close Search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              <DocToolbar 
                editorRef={editorRef}
                onContentChange={(val) => updateDoc(activeDoc.id, { content: val })}
                isMobile={isMobile}
                isMobileEditing={isMobileEditing}
                onFinishMobileEdit={() => {
                  setIsMobileEditing(false);
                  editorRef.current?.blur();
                }}
              />

              <div className="w-full md:rounded-lg md:border md:border-slate-200 overflow-hidden bg-white">
                <SinglePageDocEditor
                  docId={activeDoc.id}
                  editorRef={editorRef}
                  content={activeDoc.content || ""}
                  onChange={(val) => updateDoc(activeDoc.id, { content: val })}
                  isMobile={isMobile}
                  isMobileEditing={isMobileEditing}
                  onMobileEditChange={setIsMobileEditing}
                  onClearSearchHighlights={() => {
                    if (isDocSearchOpen) closeDocSearch();
                  }}
                />
              </div>

              {isMobile && !isMobileEditing && (
                <button
                  type="button"
                  onClick={() => {
                    if (isDocSearchOpen) closeDocSearch();
                    setIsMobileEditing(true);
                    requestAnimationFrame(() => {
                      const editor = editorRef.current;
                      if (!editor) return;
                      editor.focus();
                      const range = document.createRange();
                      range.selectNodeContents(editor);
                      range.collapse(false);
                      const sel = window.getSelection();
                      sel?.removeAllRanges();
                      sel?.addRange(range);
                    });
                  }}
                  className="fixed bottom-6 right-5 z-30 w-13 h-13 p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-lg flex items-center justify-center transition-all"
                  title="Edit Document"
                >
                  <Pencil className="w-5 h-5" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[65vh] text-slate-400 italic text-center px-4">
              <FileText className="w-12 h-12 text-slate-300 mb-2" />
              Create a new document using the "New" button.
            </div>
          )}
        </div>

        <div style={{ width: `${sidebarWidth}px` }} className="hidden md:flex bg-white rounded-xl shadow-md border border-slate-200 p-4 flex-col h-[84vh] relative shrink-0">
          <div onMouseDown={startResizing} className="absolute -left-2 top-0 bottom-0 w-4 cursor-ew-resize flex items-center justify-center group z-10">
            <div className="w-1 h-8 rounded-full bg-slate-200 group-hover:bg-emerald-500 transition-colors" />
          </div>
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <span className="font-serif font-bold text-emerald-900 text-sm flex items-center gap-2"><BookOpen className="w-4 h-4 text-emerald-700" /> All Documents</span>
            <Button size="sm" onClick={addDoc} className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 px-2.5"><FilePlusCornerIcon className="w-4 h-4 mr-1" /> New</Button>
          </div>
          <div className="relative mb-3">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input type="text" placeholder="Search all docs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700 focus:outline-none focus:border-emerald-400" />
          </div>
          <div className="flex-1 overflow-auto space-y-1 pr-1">
            {filteredDocs.map((doc) => (
              <div 
                key={doc.id} 
                onClick={() => { 
                  handleSelectDoc(doc.id); 
                  setTimeout(() => editorRef.current?.focus(), 50);
                }} 
                className={`group flex items-center justify-between p-2.5 rounded-lg cursor-pointer text-sm transition-all ${selectedDocId === doc.id ? 'bg-emerald-50 text-emerald-900 font-semibold border border-emerald-200 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <span className="truncate flex-1">{doc.title || 'Untitled Document'}</span>
                <button onClick={(e) => { e.stopPropagation(); setDocDeleteTarget(doc.id); }} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
        </div>

        {isMobileDrawerOpen && (
          <div className="fixed inset-0 z-50 flex bg-black/50 md:hidden animate-in fade-in">
            <div className="flex-1" onClick={() => setIsMobileDrawerOpen(false)} />
            <div className="bg-white w-4/5 max-w-xs h-full p-4 flex flex-col shadow-2xl animate-in slide-in-from-right">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                <span className="font-serif font-bold text-emerald-900 text-base flex items-center gap-2"><BookOpen className="w-5 h-5 text-emerald-700" />All Documents</span>
                <Button size="icon" variant="ghost" onClick={() => setIsMobileDrawerOpen(false)} className="h-8 w-8"><X className="w-5 h-5" /></Button>
              </div>
              <div className="relative mb-3">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input type="text" placeholder="Search all docs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700 focus:outline-none focus:border-emerald-400" />
              </div>
              <div className="flex-1 overflow-auto space-y-1 pr-1">
                {filteredDocs.map((doc) => (
                  <div 
                    key={doc.id} 
                    onClick={() => { 
                      handleSelectDoc(doc.id); 
                      setIsMobileDrawerOpen(false);
                    }} 
                    className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer text-sm transition-all ${selectedDocId === doc.id ? 'bg-emerald-50 text-emerald-900 font-semibold border border-emerald-200 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
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