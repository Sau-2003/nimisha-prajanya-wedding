// "use client";

// import { useEffect, useState } from 'react';
// import { supabase } from '@/lib/supabase';
// import { Calendar, Check, Loader2, CalendarClock, Image as ImageIcon } from 'lucide-react';
// import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";

// const renderTextWithLinks = (text: string) => {
//   if (!text) return null;

//   const urlRegex = /(https?:\/\/[^\s]+)/g;
//   const parts = text.split(urlRegex);

//   return parts.map((part, index) => {
//     if (part.match(urlRegex)) {
//       return (
//         <a
//           key={index}
//           href={part}
//           target="_blank"
//           rel="noopener noreferrer"
//           className="text-emerald-600 hover:text-emerald-700 underline break-all"
//           onClick={(e) => e.stopPropagation()}
//         >
//           {part}
//         </a>
//       );
//     }

//     return <span key={index}>{part}</span>;
//   });
// };


// export default function DateSchedulePage() {
//   const [schedule, setSchedule] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [expandedImage, setExpandedImage] = useState<string | null>(null);

//   const fetchData = async () => {
//     setLoading(true);

//     // 1. Fetch Event Items - Include 'image_url'
//     const { data: eventData } = await supabase
//       .from('event_items')
//       .select('id, content, due_date, event_name, category, image_url')
//       .not('due_date', 'is', null)
//       .eq('category', 'tasks');

//     // 2. Fetch Global Tasks - Include 'image_url'
//     const { data: globalTasks } = await supabase
//       .from('tasks')
//       .select('id, text, due_date, status, image_url')
//       .eq('status', 'ongoing')
//       .not('due_date', 'is', null);

//     const combined = [
//       ...(eventData || []).map(item => ({
//         id: item.id,
//         content: item.content,
//         due_date: item.due_date,
//         event_name: item.event_name,
//         image_url: item.image_url,
//         isGlobal: false
//       })),
//       ...(globalTasks || []).map(task => ({
//         id: task.id,
//         content: task.text,
//         due_date: task.due_date,
//         event_name: 'master',
//         image_url: task.image_url,
//         isGlobal: true
//       }))
//     ];

//     const sorted = combined.sort((a, b) => 
//       new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
//     );

//     setSchedule(sorted);
//     setLoading(false);
//   };

//   useEffect(() => { fetchData(); }, []);

//   // Completion logic
//   const markAsDone = async (item: any) => {
//     if (item.isGlobal) {
//       await supabase.from('tasks').update({ status: 'done' }).eq('id', item.id);
//     } else {
//       await supabase.from('event_items').update({ category: 'taskDone' }).eq('id', item.id);
//     }
//     fetchData(); 
//   };

//   if (loading) return <div className="p-12 text-center text-emerald-600"><Loader2 className="animate-spin inline" /></div>;
  
//   return (
//     <div className="p-6 md:p-12 max-w-4xl mx-auto">
//       <div className="mb-8">
//         <h1 className="font-serif text-3xl font-bold text-emerald-900 flex items-center gap-3">
//           <CalendarClock className="w-8 h-8 text-emerald-600" />
//           Date Schedule
//         </h1>
//         <p className="mt-2 text-slate-500">
//           View all upcoming global and event tasks sorted by date.
//         </p>
//       </div>

//       <div className="space-y-6">
//         {Object.entries(
//           schedule.reduce((groups, item) => {
//             const date = new Date(item.due_date).toLocaleDateString("en-US", {
//               month: "short",
//               day: "numeric",
//             });
//             if (!groups[date]) groups[date] = [];
//             groups[date].push(item);
//             return groups;
//           }, {} as Record<string, any[]>)
//         ).map(([date, items]) => (
//           <div key={date}>
//             <h2 className="mb-3 text-lg font-semibold text-emerald-700">
//               {date}
//             </h2>

//             <div className="space-y-3">
//               {(items as any[]).map((item) => (
//                 <div
//                   key={item.id}
//                   className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
//                 >
//                   <Calendar className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />

//                   <div className="flex-1 min-w-0">
//                     <p className="font-semibold text-slate-800 whitespace-pre-wrap break-words">
//                       {renderTextWithLinks(item.content)}
//                     </p>
//                     <p className="text-xs capitalize text-slate-500 mt-1">
//                       {item.isGlobal ? "Global Task" : item.event_name}
//                     </p>

//                     {/* RENDER IMAGE IF IT EXISTS */}
//                     {item.image_url && (
//                       <div 
//                         className="mt-3 rounded-lg border border-slate-200 overflow-hidden w-full max-w-[120px] shadow-sm cursor-pointer hover:opacity-90 transition-opacity relative group"
//                         onClick={() => setExpandedImage(item.image_url)}
//                       >
//                         <img 
//                           src={item.image_url} 
//                           alt="Task attachment" 
//                           className="w-full h-auto object-cover" 
//                           onError={(e) => { e.currentTarget.parentElement!.style.display = 'none'; }}
//                         />
//                         <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
//                           <ImageIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 drop-shadow-md" />
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   <button
//                     onClick={() => markAsDone(item)}
//                     className="p-2 bg-emerald-50 text-emerald-600 rounded-full hover:bg-emerald-100 transition-colors shrink-0"
//                     title="Mark Done"
//                   >
//                     <Check className="w-4 h-4" />
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Expanded Image Lightbox Modal */}
//       <Dialog open={!!expandedImage} onOpenChange={(open) => !open && setExpandedImage(null)}>
//         <DialogContent 
//           className="max-w-screen-lg w-[90vw] bg-transparent border-none shadow-none flex items-center justify-center p-0 [&>button]:bg-black/50 [&>button]:text-white [&>button]:hover:bg-black/80 [&>button]:rounded-full [&>button]:p-2 focus-visible:outline-none"
//         >
//           <DialogHeader className="sr-only">
//             <DialogTitle>Image Preview</DialogTitle>
//           </DialogHeader>
//           {expandedImage && (
//             <img 
//               src={expandedImage} 
//               className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" 
//               alt="Expanded preview" 
//               onError={(e) => {
//                 e.currentTarget.style.display = 'none';
//                 setExpandedImage(null);
//               }}
//             />
//           )}
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }
// // "use client";

// // import { useEffect, useState } from 'react';
// // import { supabase } from '@/lib/supabase';
// // import { Calendar, Check, Loader2, CalendarClock } from 'lucide-react';

// // const renderTextWithLinks = (text: string) => {
// //   if (!text) return null;

// //   const urlRegex = /(https?:\/\/[^\s]+)/g;
// //   const parts = text.split(urlRegex);

// //   return parts.map((part, index) => {
// //     if (part.match(urlRegex)) {
// //       return (
// //         <a
// //           key={index}
// //           href={part}
// //           target="_blank"
// //           rel="noopener noreferrer"
// //           className="text-emerald-600 hover:text-emerald-700 underline break-all"
// //           onClick={(e) => e.stopPropagation()}
// //         >
// //           {part}
// //         </a>
// //       );
// //     }

// //     return <span key={index}>{part}</span>;
// //   });
// // };


// // export default function DateSchedulePage() {
// //   const [schedule, setSchedule] = useState<any[]>([]);
// //   const [loading, setLoading] = useState(true);

// //   const fetchData = async () => {
// //   setLoading(true);

  
// //   // 1. Fetch Event Items - ONLY 'tasks' category
// //   const { data: eventData } = await supabase
// //     .from('event_items')
// //     .select('id, content, due_date, event_name, category')
// //     .not('due_date', 'is', null)
// //     .eq('category', 'tasks'); // Important: Only fetch 'tasks'

// //   // 2. Fetch Global Tasks - ONLY 'ongoing' status
// //   const { data: globalTasks } = await supabase
// //     .from('tasks')
// //     .select('id, text, due_date, status')
// //     .eq('status', 'ongoing') // Important: Only fetch 'ongoing'
// //     .not('due_date', 'is', null);

// //     const combined = [
// //       ...(eventData || []).map(item => ({
// //         id: item.id,
// //         content: item.content,
// //         due_date: item.due_date,
// //         event_name: item.event_name,
// //         isGlobal: false
// //       })),
// //       ...(globalTasks || []).map(task => ({
// //         id: task.id,
// //         content: task.text,
// //         due_date: task.due_date,
// //         event_name: 'master',
// //         isGlobal: true
// //       }))
// //     ];

// //     const sorted = combined.sort((a, b) => 
// //       new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
// //     );

// //     setSchedule(sorted);
// //     setLoading(false);
// //   };

// //   useEffect(() => { fetchData(); }, []);

// //   // Completion logic
// //   const markAsDone = async (item: any) => {
// //   if (item.isGlobal) {
// //     // Update 'tasks' table to 'done' (so it's caught by .eq('status', 'ongoing'))
// //     await supabase.from('tasks').update({ status: 'done' }).eq('id', item.id);
// //   } else {
// //     // Update 'event_items' table to 'taskDone' (so it's caught by .eq('category', 'tasks'))
// //     await supabase.from('event_items').update({ category: 'taskDone' }).eq('id', item.id);
// //   }
// //   fetchData(); // This will now fetch without the item you just completed
// // };

// //   if (loading) return <div className="p-12 text-center text-emerald-600"><Loader2 className="animate-spin inline" /></div>;
// //     return (
// //   <div className="p-6 md:p-12 max-w-4xl mx-auto">
// //     <div className="mb-8">
// //       <h1 className="font-serif text-3xl font-bold text-emerald-900 flex items-center gap-3">
// //         <CalendarClock className="w-8 h-8 text-emerald-600" />
// //         Date Schedule
// //       </h1>
// //       <p className="mt-2 text-slate-500">
// //         View all upcoming global and event tasks sorted by date.
// //       </p>
// //     </div>

// //     <div className="space-y-6">
// //       {Object.entries(
// //         schedule.reduce((groups, item) => {
// //           const date = new Date(item.due_date).toLocaleDateString("en-US", {
// //             month: "short",
// //             day: "numeric",
// //           });
// //           if (!groups[date]) groups[date] = [];
// //           groups[date].push(item);
// //           return groups;
// //         }, {} as Record<string, any[]>)
// //       ).map(([date, items]) => (
// //         <div key={date}>
// //           <h2 className="mb-3 text-lg font-semibold text-emerald-700">
// //             {date}
// //           </h2>

// //           <div className="space-y-3">
// //             {(items as any[]).map((item) => (
// //               <div
// //                 key={item.id}
// //                 className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
// //               >
// //                 <Calendar className="w-5 h-5 text-emerald-600" />

// //                 <div className="flex-1">
// //                   <p className="font-semibold text-slate-800 whitespace-pre-wrap break-words">
// //                     {renderTextWithLinks(item.content)}
// //                   </p>
// //                   <p className="text-xs capitalize text-slate-500">
// //                     {item.isGlobal ? "Global Task" : item.event_name}
// //                   </p>
// //                 </div>

// //                 <button
// //                   onClick={() => markAsDone(item)}
// //                   className="p-2 bg-emerald-50 text-emerald-600 rounded-full hover:bg-emerald-100 transition-colors"
// //                   title="Mark Done"
// //                 >
// //                   <Check className="w-4 h-4" />
// //                 </button>
// //               </div>
// //             ))}
// //           </div>
// //         </div>
// //       ))}
// //     </div>
// //   </div>
// // )}

"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Calendar, Check, Loader2, CalendarClock, Image as ImageIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";

const renderTextWithLinks = (text: string) => {
  if (!text) return null;

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
          className="text-emerald-600 hover:text-emerald-700 underline break-all"
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </a>
      );
    }

    return <span key={index}>{part}</span>;
  });
};

export default function DateSchedulePage() {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);

    // 1. Fetch Event Items - Include 'image_url'
    const { data: eventData } = await supabase
      .from('event_items')
      .select('id, content, due_date, event_name, category, image_url')
      .not('due_date', 'is', null)
      .eq('category', 'tasks');

    // 2. Fetch Global Tasks - Include 'image_url'
    const { data: globalTasks } = await supabase
      .from('tasks')
      .select('id, text, due_date, status, image_url')
      .eq('status', 'ongoing')
      .not('due_date', 'is', null);

    const combined = [
      ...(eventData || []).map(item => ({
        id: item.id,
        content: item.content,
        due_date: item.due_date,
        event_name: item.event_name,
        image_url: item.image_url,
        isGlobal: false
      })),
      ...(globalTasks || []).map(task => ({
        id: task.id,
        content: task.text,
        due_date: task.due_date,
        event_name: 'master',
        image_url: task.image_url,
        isGlobal: true
      }))
    ];

    const sorted = combined.sort((a, b) => 
      new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    );

    setSchedule(sorted);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // Completion logic
  const markAsDone = async (item: any) => {
    if (item.isGlobal) {
      await supabase.from('tasks').update({ status: 'done' }).eq('id', item.id);
    } else {
      await supabase.from('event_items').update({ category: 'taskDone' }).eq('id', item.id);
    }
    fetchData(); 
  };

  // Helper to check if a task is overdue
  const isOverdue = (dateString: string | null) => {
    if (!dateString) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dueDate = new Date(dateString);
    dueDate.setHours(0, 0, 0, 0);
    
    return dueDate < today;
  };

  // Helper to format dates nicely
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) return <div className="p-12 text-center text-emerald-600"><Loader2 className="animate-spin inline" /></div>;
  
  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-emerald-900 flex items-center gap-3">
          <CalendarClock className="w-8 h-8 text-emerald-600" />
          Task Schedule
        </h1>
        <p className="mt-2 text-slate-500">
          View all upcoming global and event tasks sorted by date.
        </p>
      </div>

      <div className="space-y-6">
        {Object.entries(
          schedule.reduce((groups, item) => {
            const date = new Date(item.due_date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
            if (!groups[date]) groups[date] = [];
            groups[date].push(item);
            return groups;
          }, {} as Record<string, any[]>)
        ).map(([date, items]) => {
          // Check if any task in this date group is overdue
          const groupHasOverdue = (items as any[]).some(item => isOverdue(item.due_date));

          return (
            <div key={date}>
              <h2 className={`mb-3 text-lg font-semibold ${groupHasOverdue ? 'text-red-600' : 'text-emerald-700'}`}>
                {date}
              </h2>

              <div className="space-y-3">
                {(items as any[]).map((item) => {
                  const overdue = isOverdue(item.due_date);

                  return (
                    <div
                      key={item.id}
                      className={`flex items-start gap-4 rounded-xl border p-4 shadow-sm transition-colors ${
                        overdue ? 'border-red-300 bg-red-50/30' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <Calendar className={`w-5 h-5 mt-0.5 shrink-0 ${overdue ? 'text-red-500' : 'text-emerald-600'}`} />

                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold whitespace-pre-wrap break-words ${overdue ? 'text-red-900' : 'text-slate-800'}`}>
                          {renderTextWithLinks(item.content)}
                        </p>
                        <p className="text-xs capitalize text-slate-500 mt-1">
                          {item.isGlobal ? "Global Task" : item.event_name}
                        </p>

                        <p className={`text-xs flex items-center gap-1 mt-1 font-medium ${overdue ? 'text-red-600' : 'text-slate-400'}`}>
                          {overdue ? "Overdue (Due: " + formatDate(item.due_date) + ")" : "Due by " + formatDate(item.due_date)}
                        </p>

                        {/* RENDER IMAGE IF IT EXISTS */}
                        {item.image_url && (
                          <div 
                            className="mt-3 rounded-lg border border-slate-200 overflow-hidden w-full max-w-[120px] shadow-sm cursor-pointer hover:opacity-90 transition-opacity relative group"
                            onClick={() => setExpandedImage(item.image_url)}
                          >
                            <img 
                              src={item.image_url} 
                              alt="Task attachment" 
                              className="w-full h-auto object-cover" 
                              onError={(e) => { e.currentTarget.parentElement!.style.display = 'none'; }}
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                              <ImageIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 drop-shadow-md" />
                            </div>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => markAsDone(item)}
                        className="p-2 bg-emerald-50 text-emerald-600 rounded-full hover:bg-emerald-100 transition-colors shrink-0"
                        title="Mark Done"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

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
              alt="Expanded preview" 
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