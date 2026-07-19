// "use client";

// import { useState, useEffect, useRef } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import { supabase } from '@/lib/supabase';
// import { 
//   ClipboardList, ShoppingBag, Flame, Gamepad2, 
//   Briefcase, Lightbulb, Shirt, StickyNote, IndianRupee, Plus, Trash2,
//   Check, Image as ImageIcon, RotateCcw
// } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// const CATEGORIES = [
//   { id: 'tasks', name: 'Tasks', icon: ClipboardList, color: 'text-blue-500' },
//   { id: 'taskdone', name: 'Task Done', icon: Check, color: 'text-green-600' },
//   { id: 'items', name: 'Items Needed', icon: ShoppingBag, color: 'text-pink-500' },
//   { id: 'puja', name: 'Puja Items', icon: Flame, color: 'text-orange-500' },
//   { id: 'games', name: 'Games', icon: Gamepad2, color: 'text-purple-500' },
//   { id: 'vendors', name: 'Vendors', icon: Briefcase, color: 'text-emerald-500' },
//   { id: 'ideas', name: 'Ideas', icon: Lightbulb, color: 'text-yellow-500' },
//   { id: 'outfit', name: 'Outfit', icon: Shirt, color: 'text-rose-500' },
//   { id: 'notes', name: 'Notes', icon: StickyNote, color: 'text-slate-500' },
//   { id: 'expenses', name: 'Expenses', icon: IndianRupee, color: 'text-gold-600' },
// ];

// export default function SingleEventPage() {
//   const { eventName } = useParams();
//   const router = useRouter();
//   const rawName = eventName ? String(eventName) : 'event';
//   const title = rawName.charAt(0).toUpperCase() + rawName.slice(1);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const [entries, setEntries] = useState<any>({ tasks: [], taskdone: [], outfit: [] });
//   const [isLoaded, setIsLoaded] = useState(false);
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [activeCategory, setActiveCategory] = useState<string | null>(null);
//   const [newItem, setNewItem] = useState('');

//   useEffect(() => {
//     async function loadData() {
//       const { data } = await supabase.from('event_workspaces').select('entries').eq('event_name', rawName).maybeSingle();
//       if (data?.entries) setEntries(data.entries);
//       setIsLoaded(true);
//     }
//     loadData();
//   }, [rawName]);

//   const syncToCloud = async (updatedEntries: any) => {
//     setEntries(updatedEntries);
//     await supabase.from('event_workspaces').upsert({ event_name: rawName, entries: updatedEntries });
//   };

//   const handleAddEntry = () => {
//     if (!activeCategory || !newItem.trim()) return;
//     const updatedEntries = { ...entries, [activeCategory]: [...(entries[activeCategory] || []), newItem] };
//     syncToCloud(updatedEntries);
//     setNewItem('');
//   };

//   const completeTask = (index: number) => {
//     const task = entries['tasks'][index];
//     const updatedEntries = { 
//       ...entries, 
//       tasks: entries['tasks'].filter((_: any, i: number) => i !== index),
//       taskdone: [...(entries['taskdone'] || []), task]
//     };
//     syncToCloud(updatedEntries);
//   };

//   const revertTask = (index: number) => {
//     const task = entries['taskdone'][index];
//     const updatedEntries = { 
//       ...entries, 
//       taskdone: entries['taskdone'].filter((_: any, i: number) => i !== index),
//       tasks: [...(entries['tasks'] || []), task]
//     };
//     syncToCloud(updatedEntries);
//   };

//   const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file || !activeCategory) return;
//     const { data } = await supabase.storage.from('task-images').upload(`${Date.now()}_${file.name}`, file);
//     if (data?.path) {
//       const { data: url } = supabase.storage.from('task-images').getPublicUrl(data.path);
//       const entry = `ImageLink: ${url.publicUrl} | Caption: Attachment`;
//       const updatedEntries = { ...entries, [activeCategory]: [...(entries[activeCategory] || []), entry] };
//       syncToCloud(updatedEntries);
//     }
//   };

//   const renderThumbnail = (itemString: string) => {
//     const url = itemString.split(' | ')[0].replace('ImageLink: ', '');
//     return (
//       <a href={url} target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:bg-slate-50 p-1 rounded">
//         <img src={url} alt="thumbnail" className="w-12 h-12 object-cover rounded shadow-sm border" />
//         <span className="text-sm text-blue-600 underline">View Full Image</span>
//       </a>
//     );
//   };

//   if (!isLoaded) return <div className="p-12 text-center text-emerald-600">Loading Workspace...</div>;

//   // --- PROGRESS CALCULATION LOGIC ---
//   const pendingCount = entries.tasks?.length || 0;
//   const doneCount = entries.taskdone?.length || 0;
//   const totalTasks = pendingCount + doneCount;
//   const progressPercentage = totalTasks === 0 ? 0 : Math.round((doneCount / totalTasks) * 100);

//   return (
//     <div className="p-6 md:p-12 max-w-6xl mx-auto">
      
//       {/* UPDATED HEADER WITH PERCENTAGE & PROGRESS BAR */}
//       <div className="mb-8">
//         <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
//           <h1 className="text-4xl font-bold text-emerald-900">{title} Workspace</h1>
          
//           {totalTasks > 0 && (
//             <div className="flex items-center gap-3">
//               <span className="text-sm font-semibold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
//                 {progressPercentage}% Completed
//               </span>
//               <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
//                 {doneCount} / {totalTasks} Tasks
//               </span>
//             </div>
//           )}
//         </div>

//         {/* Visual Progress Bar */}
//         {totalTasks > 0 && (
//           <div className="w-full max-w-md bg-slate-200 rounded-full h-2.5 shadow-inner">
//             <div 
//               className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500 ease-out" 
//               style={{ width: `${progressPercentage}%` }}
//             ></div>
//           </div>
//         )}
//       </div>
      
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {CATEGORIES.map(cat => {
//           const items = entries[cat.id] || [];
//           return (
//             <button 
//               key={cat.id} 
//               onClick={() => {
//                 if (cat.id === 'outfit') {
//                   router.push(`/events/${rawName}/outfits`);
//                 } else {
//                   setActiveCategory(cat.id);
//                   setIsDialogOpen(true);
//                 }
//               }} 
//               className="p-6 rounded-2xl border bg-white hover:shadow-lg transition-all text-left flex flex-col"
//             >
//               <div className="flex items-center gap-3 mb-2">
//                 <cat.icon className={`w-6 h-6 ${cat.color}`} />
//                 <h3 className="font-bold text-lg">{cat.name}</h3>
//               </div>
              
//               <div className="text-sm text-slate-500 flex-1 space-y-1">
//                 {items.length === 0 ? (
//                   <span className="italic text-slate-400">Empty</span>
//                 ) : (
//                   items.slice(0, 2).map((item: string, i: number) => (
//                     <div key={i} className="truncate">
//                       {item.startsWith('ImageLink:') ? '📷 Attached Image' : `• ${item}`}
//                     </div>
//                   ))
//                 )}
//                 {items.length > 2 && <div className="text-xs font-bold text-slate-400">+{items.length - 2} more</div>}
//               </div>
//             </button>
//           );
//         })}
//       </div>

//       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//         <DialogContent className="max-w-lg">
//           <DialogHeader><DialogTitle>Manage {activeCategory}</DialogTitle></DialogHeader>
          
//           <div className="flex gap-2 items-center">
//             <input 
//               type="text" 
//               className="flex-1 border p-2 rounded-lg" 
//               value={newItem} 
//               onChange={e => setNewItem(e.target.value)} 
//               placeholder="Type new entry here..." 
//               onKeyDown={(e) => e.key === 'Enter' && handleAddEntry()}
//             />
//             <Button onClick={handleAddEntry} className="bg-emerald-600"><Plus className="w-4 h-4 mr-1"/> Add</Button>
            
//             <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageUpload} accept="image/*" />
//             <Button variant="outline" onClick={() => fileInputRef.current?.click()}><ImageIcon className="w-4 h-4"/></Button>
//           </div>

//           <div className="mt-4 max-h-[400px] overflow-y-auto space-y-2">
//             {(entries[activeCategory || ''] || []).map((item: any, idx: number) => (
//               <div key={idx} className="flex justify-between items-center p-3 border rounded bg-slate-50">
//                 <div className="flex-1 overflow-hidden pr-4">
//                   {item.startsWith('ImageLink:') ? renderThumbnail(item) : <span className="text-sm">{item}</span>}
//                 </div>
//                 <div className="flex gap-2">
//                   {activeCategory === 'tasks' && <button onClick={() => completeTask(idx)} className="text-green-600 p-1 hover:bg-green-100 rounded"><Check className="w-4 h-4"/></button>}
//                   {activeCategory === 'taskdone' && <button onClick={() => revertTask(idx)} className="text-amber-600 p-1 hover:bg-amber-100 rounded"><RotateCcw className="w-4 h-4"/></button>}
//                   <button onClick={() => { const u = {...entries, [activeCategory!]: entries[activeCategory!].filter((_:any,i:number)=>i!==idx)}; syncToCloud(u); }} className="text-red-500 p-1 hover:bg-red-100 rounded"><Trash2 className="w-4 h-4"/></button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }



"use client";

import { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  ClipboardList, ShoppingBag, Flame, Gamepad2, 
  Briefcase, Lightbulb, Shirt, StickyNote, IndianRupee, Plus, Trash2,
  Check, Image as ImageIcon, RotateCcw, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEventItems } from '@/hooks/useEventItems'; // <-- Using our new hook!

const CATEGORIES = [
  { id: 'tasks', name: 'Tasks', icon: ClipboardList, color: 'text-blue-500' },
  { id: 'taskdone', name: 'Task Done', icon: Check, color: 'text-green-600' },
  { id: 'items', name: 'Items Needed', icon: ShoppingBag, color: 'text-pink-500' },
  { id: 'puja', name: 'Puja Items', icon: Flame, color: 'text-orange-500' },
  { id: 'games', name: 'Games', icon: Gamepad2, color: 'text-purple-500' },
  { id: 'vendors', name: 'Vendors', icon: Briefcase, color: 'text-emerald-500' },
  { id: 'ideas', name: 'Ideas', icon: Lightbulb, color: 'text-yellow-500' },
  { id: 'outfit', name: 'Outfit', icon: Shirt, color: 'text-rose-500' },
  { id: 'notes', name: 'Notes', icon: StickyNote, color: 'text-slate-500' },
  { id: 'expenses', name: 'Expenses', icon: IndianRupee, color: 'text-gold-600' },
];

[{
	"resource": "/c:/Users/saumy/nimisha-prajanya-wedding/src/app/events/[eventName]/page.tsx",
	"owner": "typescript",
	"code": "2304",
	"severity": 8,
	"message": "Cannot find name 'useParams'.",
	"source": "ts",
	"startLineNumber": 222,
	"startColumn": 25,
	"endLineNumber": 222,
	"endColumn": 34,
	"modelVersionId": 10,
	"origin": "extHost1"
},{
	"resource": "/c:/Users/saumy/nimisha-prajanya-wedding/src/app/events/[eventName]/page.tsx",
	"owner": "typescript",
	"code": "2552",
	"severity": 8,
	"message": "Cannot find name 'useRouter'. Did you mean 'router'?",
	"source": "ts",
	"startLineNumber": 223,
	"startColumn": 18,
	"endLineNumber": 223,
	"endColumn": 27,
	"relatedInformation": [
		{
			"startLineNumber": 223,
			"startColumn": 9,
			"endLineNumber": 223,
			"endColumn": 15,
			"message": "'router' is declared here.",
			"resource": "/c:/Users/saumy/nimisha-prajanya-wedding/src/app/events/[eventName]/page.tsx"
		}
	],
	"modelVersionId": 10,
	"origin": "extHost1"
},{
	"resource": "/c:/Users/saumy/nimisha-prajanya-wedding/src/app/events/[eventName]/page.tsx",
	"owner": "typescript",
	"code": "2304",
	"severity": 8,
	"message": "Cannot find name 'useRef'.",
	"source": "ts",
	"startLineNumber": 228,
	"startColumn": 24,
	"endLineNumber": 228,
	"endColumn": 30,
	"modelVersionId": 10,
	"origin": "extHost1"
},{
	"resource": "/c:/Users/saumy/nimisha-prajanya-wedding/src/app/events/[eventName]/page.tsx",
	"owner": "typescript",
	"code": "2304",
	"severity": 8,
	"message": "Cannot find name 'useEventItems'.",
	"source": "ts",
	"startLineNumber": 231,
	"startColumn": 50,
	"endLineNumber": 231,
	"endColumn": 63,
	"modelVersionId": 10,
	"origin": "extHost1"
},{
	"resource": "/c:/Users/saumy/nimisha-prajanya-wedding/src/app/events/[eventName]/page.tsx",
	"owner": "typescript",
	"code": "2304",
	"severity": 8,
	"message": "Cannot find name 'useState'.",
	"source": "ts",
	"startLineNumber": 233,
	"startColumn": 43,
	"endLineNumber": 233,
	"endColumn": 51,
	"modelVersionId": 10,
	"origin": "extHost1"
},{
	"resource": "/c:/Users/saumy/nimisha-prajanya-wedding/src/app/events/[eventName]/page.tsx",
	"owner": "typescript",
	"code": "2304",
	"severity": 8,
	"message": "Cannot find name 'useState'.",
	"source": "ts",
	"startLineNumber": 234,
	"startColumn": 47,
	"endLineNumber": 234,
	"endColumn": 55,
	"modelVersionId": 10,
	"origin": "extHost1"
},{
	"resource": "/c:/Users/saumy/nimisha-prajanya-wedding/src/app/events/[eventName]/page.tsx",
	"owner": "typescript",
	"code": "2304",
	"severity": 8,
	"message": "Cannot find name 'useState'.",
	"source": "ts",
	"startLineNumber": 235,
	"startColumn": 33,
	"endLineNumber": 235,
	"endColumn": 41,
	"modelVersionId": 10,
	"origin": "extHost1"
},{
	"resource": "/c:/Users/saumy/nimisha-prajanya-wedding/src/app/events/[eventName]/page.tsx",
	"owner": "typescript",
	"code": "7006",
	"severity": 8,
	"message": "Parameter 'item' implicitly has an 'any' type.",
	"source": "ts",
	"startLineNumber": 237,
	"startColumn": 65,
	"endLineNumber": 237,
	"endColumn": 69,
	"modelVersionId": 10,
	"origin": "extHost1"
},{
	"resource": "/c:/Users/saumy/nimisha-prajanya-wedding/src/app/events/[eventName]/page.tsx",
	"owner": "typescript",
	"code": "2304",
	"severity": 8,
	"message": "Cannot find name 'supabase'.",
	"source": "ts",
	"startLineNumber": 243,
	"startColumn": 29,
	"endLineNumber": 243,
	"endColumn": 37,
	"modelVersionId": 10,
	"origin": "extHost1"
},{
	"resource": "/c:/Users/saumy/nimisha-prajanya-wedding/src/app/events/[eventName]/page.tsx",
	"owner": "typescript",
	"code": "2304",
	"severity": 8,
	"message": "Cannot find name 'supabase'.",
	"source": "ts",
	"startLineNumber": 256,
	"startColumn": 11,
	"endLineNumber": 256,
	"endColumn": 19,
	"modelVersionId": 10,
	"origin": "extHost1"
},{
	"resource": "/c:/Users/saumy/nimisha-prajanya-wedding/src/app/events/[eventName]/page.tsx",
	"owner": "typescript",
	"code": "2304",
	"severity": 8,
	"message": "Cannot find name 'supabase'.",
	"source": "ts",
	"startLineNumber": 261,
	"startColumn": 11,
	"endLineNumber": 261,
	"endColumn": 19,
	"modelVersionId": 10,
	"origin": "extHost1"
},{
	"resource": "/c:/Users/saumy/nimisha-prajanya-wedding/src/app/events/[eventName]/page.tsx",
	"owner": "typescript",
	"code": "2304",
	"severity": 8,
	"message": "Cannot find name 'supabase'.",
	"source": "ts",
	"startLineNumber": 269,
	"startColumn": 28,
	"endLineNumber": 269,
	"endColumn": 36,
	"modelVersionId": 10,
	"origin": "extHost1"
},{
	"resource": "/c:/Users/saumy/nimisha-prajanya-wedding/src/app/events/[eventName]/page.tsx",
	"owner": "typescript",
	"code": "2304",
	"severity": 8,
	"message": "Cannot find name 'supabase'.",
	"source": "ts",
	"startLineNumber": 271,
	"startColumn": 29,
	"endLineNumber": 271,
	"endColumn": 37,
	"modelVersionId": 10,
	"origin": "extHost1"
},{
	"resource": "/c:/Users/saumy/nimisha-prajanya-wedding/src/app/events/[eventName]/page.tsx",
	"owner": "typescript",
	"code": "2304",
	"severity": 8,
	"message": "Cannot find name 'supabase'.",
	"source": "ts",
	"startLineNumber": 274,
	"startColumn": 13,
	"endLineNumber": 274,
	"endColumn": 21,
	"modelVersionId": 10,
	"origin": "extHost1"
},{
	"resource": "/c:/Users/saumy/nimisha-prajanya-wedding/src/app/events/[eventName]/page.tsx",
	"owner": "typescript",
	"code": "1005",
	"severity": 8,
	"message": "'}' expected.",
	"source": "ts",
	"startLineNumber": 295,
	"startColumn": 69,
	"endLineNumber": 295,
	"endColumn": 69,
	"relatedInformation": [
		{
			"startLineNumber": 221,
			"startColumn": 43,
			"endLineNumber": 221,
			"endColumn": 44,
			"message": "The parser expected to find a '}' to match the '{' token here.",
			"resource": "/c:/Users/saumy/nimisha-prajanya-wedding/src/app/events/[eventName]/page.tsx"
		}
	],
	"modelVersionId": 10,
	"origin": "extHost1"
}]