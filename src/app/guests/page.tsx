// "use client";

// import { useState, useMemo } from "react";
// import { Button } from "@/components/ui/button";
// import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
// import { supabase } from "@/lib/supabase";
// import { useGuests } from "@/hooks/useGuests";

// const TABS = [
//   { name: "Nimisha's Side Staying" },
//   { name: "Prajanya's Side Staying" },
//   { name: "Sangeet" },
//   { name: "Haldi" },
//   { name: "Reception" },
// ];

// export default function GuestsPage() {
//   const { guests: dbGuests, loading, fetchData } = useGuests();
//   const [activeTab, setActiveTab] = useState(TABS[0].name);
  
//   const [newGuest, setNewGuest] = useState({ 
//     room: "", mobile: "", arrivalTime: "", family: "", count: "", hotel: "", arrival: "", origin: "" 
//   });
  
//   const [copyAll, setCopyAll] = useState(false);
//   const [copySelected, setCopySelected] = useState(false);
  
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [editForm, setEditForm] = useState<any>({});

//   const filteredGuests = useMemo(() => 
//     dbGuests.filter((g) => g.tab_category === activeTab), 
//   [dbGuests, activeTab]);

//   const totalPeople = filteredGuests.reduce((acc, g) => acc + (Number(g.count) || 0), 0);

//   const handleAdd = async () => {
//     if (!newGuest.family || !newGuest.count) {
//       alert("Please fill in both Family Name and No. of People.");
//       return;
//     }

//     const createEntry = (category: string) => ({
//       tab_category: category,
//       family: newGuest.family,
//       count: newGuest.count,
//       room_no: category === activeTab ? newGuest.room : "",
//       mobile_no: category === activeTab ? (newGuest.mobile || null) : null,
//       arrival_time: category === activeTab ? (newGuest.arrivalTime || null) : null,
//       hotel_name: category === activeTab ? newGuest.hotel : "",
//       arrival_date: category === activeTab ? (newGuest.arrival || null) : null,
//       origin_place: category === activeTab ? newGuest.origin : ""
//     });

//     const entries = [createEntry(activeTab)];
//     if (copyAll) ["Sangeet", "Haldi", "Reception"].forEach(evt => entries.push(createEntry(evt)));
//     else if (copySelected) ["Haldi", "Reception"].forEach(evt => entries.push(createEntry(evt)));

//     const { error } = await supabase.from("guests").insert(entries);
    
//     if (error) {
//       console.error("Supabase Insert Error:", error);
//       alert(`Failed to add guest: ${error.message}`);
//       return; 
//     }

//     setNewGuest({ room: "", mobile: "", arrivalTime: "", family: "", count: "", hotel: "", arrival: "", origin: "" });
//     fetchData();
//   };

//   const saveEdit = async (id: string) => {
//     await supabase.from("guests").update(editForm).eq("id", id);
//     setEditingId(null);
//     fetchData();
//   };

//   if (loading) return <div className="p-12 text-center text-emerald-600">Loading...</div>;

//   return (
//     <div className="p-8 max-w-6xl mx-auto">
//       <h1 className="text-3xl font-bold text-emerald-900 mb-2">Guest Management</h1>
      
//       {/* Tabs */}
//       <div className="flex gap-2 border-b mb-8 overflow-x-auto pb-2">
//         {TABS.map((tab) => (
//           <button key={tab.name} onClick={() => setActiveTab(tab.name)}
//             className={`px-4 py-2 rounded-t-lg flex items-center gap-2 whitespace-nowrap ${activeTab === tab.name ? "bg-emerald-50 border-b-2 border-emerald-600 text-emerald-700" : "hover:bg-slate-50"}`}>
//             {tab.name} <span className="bg-slate-200 text-xs px-2 py-0.5 rounded-full">{dbGuests.filter(g => g.tab_category === tab.name).length}</span>
//           </button>
//         ))}
//       </div>

//       <div className="border rounded-lg p-6 bg-white shadow-sm">
//         <div className="flex justify-between items-center mb-6">
//           <h2 className="text-xl font-semibold">{activeTab} List</h2>
//           <span className="bg-emerald-50 text-emerald-700 px-4 py-1 rounded-full font-medium">Total: {totalPeople} people</span>
//         </div>

//         {/* Input Form */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-slate-50 p-4 rounded-lg">
//           <input className="border p-2 rounded bg-white" placeholder="Family Name" value={newGuest.family} onChange={e => setNewGuest({...newGuest, family: e.target.value})} />
//           <input className="border p-2 rounded bg-white" placeholder="No. of People" type="number" value={newGuest.count} onChange={e => setNewGuest({...newGuest, count: e.target.value})} />
          
//           {activeTab.includes("Staying") && (
//             <>
//               <input className="border p-2 rounded bg-white" placeholder="Room No" value={newGuest.room} onChange={e => setNewGuest({...newGuest, room: e.target.value})} />
//               <input className="border p-2 rounded bg-white" placeholder="Mobile Number" value={newGuest.mobile} onChange={e => setNewGuest({...newGuest, mobile: e.target.value})} />
              
//               {/* Working Placeholder for Arrival Time */}
//               <input 
//                 type="text" 
//                 onFocus={(e) => (e.target.type = "time")}
//                 onBlur={(e) => (!e.target.value ? (e.target.type = "text") : null)}
//                 className="border p-2 rounded bg-white" 
//                 placeholder="Arrival Time" 
//                 value={newGuest.arrivalTime} 
//                 onChange={e => setNewGuest({...newGuest, arrivalTime: e.target.value})} 
//               />
              
//               <input className="border p-2 rounded bg-white" placeholder="Hotel" value={newGuest.hotel} onChange={e => setNewGuest({...newGuest, hotel: e.target.value})} />
//               <input className="border p-2 rounded bg-white" placeholder="Origin" value={newGuest.origin} onChange={e => setNewGuest({...newGuest, origin: e.target.value})} />
              
//               {/* Working Placeholder for Arrival Date */}
//               <input 
//                 type="text" 
//                 onFocus={(e) => (e.target.type = "date")}
//                 onBlur={(e) => (!e.target.value ? (e.target.type = "text") : null)}
//                 className="border p-2 rounded bg-white" 
//                 placeholder="Arrival Date" 
//                 value={newGuest.arrival} 
//                 onChange={e => setNewGuest({...newGuest, arrival: e.target.value})} 
//               />
//             </>
//           )}

//           {activeTab.includes("Staying") && (
//             <div className="md:col-span-4 flex flex-col gap-2 my-2">
//               <label className="flex items-center gap-2 text-sm text-slate-600">
//                 <input type="checkbox" checked={copyAll} onChange={(e) => { setCopyAll(e.target.checked); if (e.target.checked) setCopySelected(false); }} />
//                 Automatically copy to Sangeet, Haldi & Reception lists
//               </label>
//               <label className="flex items-center gap-2 text-sm text-slate-600">
//                 <input type="checkbox" checked={copySelected} onChange={(e) => { setCopySelected(e.target.checked); if (e.target.checked) setCopyAll(false); }} />
//                 Automatically copy to Haldi & Reception lists
//               </label>
//             </div>
//           )}

//           <Button onClick={handleAdd} className="bg-emerald-600 md:col-span-4"><Plus className="w-4 h-4 mr-2" /> Add Guest</Button>
//         </div>

//         {/* Table */}
//         <div className="overflow-x-auto">
//           <table className="w-full text-sm">
//             <thead>
//               <tr className="text-slate-400 border-b text-left whitespace-nowrap">
//                 <th className="p-3">Sr No</th>
//                 {activeTab.includes("Staying") && (
//                   <>
//                     <th className="p-3">Room</th>
//                     <th className="p-3">Mobile</th>
//                     <th className="p-3">Arrival Time</th>
//                   </>
//                 )}
//                 <th className="p-3">Family Name</th>
//                 <th className="p-3">No. of People</th>
//                 {activeTab.includes("Staying") && (
//                   <>
//                     <th className="p-3">Date of Arrival</th>
//                     <th className="p-3">Origin</th>
//                     <th className="p-3">Hotel</th>
//                   </>
//                 )}
//                 <th className="p-3 text-center">Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredGuests.map((g, idx) => (
//                 <tr key={g.id} className="border-b hover:bg-slate-50">
//                   {editingId === g.id ? (
//                     <>
//                       <td className="p-3 text-slate-500">{idx + 1}</td>
//                       {activeTab.includes("Staying") && (
//                         <>
//                           <td className="p-2"><input className="border w-full p-1 rounded" placeholder="Room No" value={editForm.room_no} onChange={e => setEditForm({...editForm, room_no: e.target.value})} /></td>
//                           <td className="p-2"><input className="border w-full p-1 rounded" placeholder="Mobile" value={editForm.mobile_no} onChange={e => setEditForm({...editForm, mobile_no: e.target.value})} /></td>
//                           <td className="p-2">
//                             <input 
//                               type="time" 
//                               className="border w-full p-1 rounded" 
//                               value={editForm.arrival_time || ""} 
//                               onChange={e => setEditForm({...editForm, arrival_time: e.target.value})} 
//                             />
//                           </td>
//                         </>
//                       )}
//                       <td className="p-2"><input className="border w-full p-1 rounded" placeholder="Family Name" value={editForm.family} onChange={e => setEditForm({...editForm, family: e.target.value})} /></td>
//                       <td className="p-2"><input className="border w-full p-1 rounded" placeholder="Count" type="number" value={editForm.count} onChange={e => setEditForm({...editForm, count: e.target.value})} /></td>
//                       {activeTab.includes("Staying") && (
//                         <>
//                           <td className="p-2">
//                             <input 
//                               type="date" 
//                               className="border w-full p-1 rounded" 
//                               value={editForm.arrival_date || ""} 
//                               onChange={e => setEditForm({...editForm, arrival_date: e.target.value})} 
//                             />
//                           </td>
//                           <td className="p-2"><input className="border w-full p-1 rounded" placeholder="Origin" value={editForm.origin_place} onChange={e => setEditForm({...editForm, origin_place: e.target.value})} /></td>
//                           <td className="p-2"><input className="border w-full p-1 rounded" placeholder="Hotel" value={editForm.hotel_name} onChange={e => setEditForm({...editForm, hotel_name: e.target.value})} /></td>
//                         </>
//                       )}
//                       <td className="p-2 flex gap-1 justify-center">
//                         <Button size="sm" onClick={() => saveEdit(g.id)}><Check className="w-4 h-4"/></Button>
//                         <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}><X className="w-4 h-4"/></Button>
//                       </td>
//                     </>
//                   ) : (
//                     <>
//                       <td className="p-3 text-slate-500">{idx + 1}</td>
//                       {activeTab.includes("Staying") && (
//                         <>
//                           <td className="p-3">{g.room_no}</td>
//                           <td className="p-3">{g.mobile_no}</td>
//                           <td className="p-3">{g.arrival_time}</td>
//                         </>
//                       )}
//                       <td className="p-3 font-medium whitespace-nowrap">{g.family}</td>
//                       <td className="p-3">{g.count}</td>
//                       {activeTab.includes("Staying") && (
//                         <>
//                           <td className="p-3 whitespace-nowrap">{g.arrival_date ? new Date(g.arrival_date).toLocaleDateString("en-GB") : "-"}</td>
//                           <td className="p-3">{g.origin_place}</td>
//                           <td className="p-3">{g.hotel_name}</td>
//                         </>
//                       )}
//                       <td className="p-3 flex gap-1 justify-center">
//                         <Button variant="ghost" size="sm" onClick={() => { setEditingId(g.id); setEditForm(g); }}><Pencil className="w-4 h-4"/></Button>
//                         <Button variant="ghost" size="sm" onClick={() => supabase.from("guests").delete().eq("id", g.id).then(fetchData)}>
//                           <Trash2 className="w-4 h-4 text-red-500" />
//                         </Button>
//                       </td>
//                     </>
//                   )}
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }


"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useGuests } from "@/hooks/useGuests";

const TABS = [
  { name: "Nimisha's Side Staying" },
  { name: "Prajanya's Side Staying" },
  { name: "Sangeet" },
  { name: "Haldi" },
  { name: "Reception" },
];

// Helper function to convert "14:30" to "2:30 PM"
const formatTime12hr = (timeStr: string | null) => {
  if (!timeStr) return "-";
  try {
    const [hours, minutes] = timeStr.split(":");
    let h = parseInt(hours, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12; // Convert 0 to 12 for midnight
    return `${h}:${minutes} ${ampm}`;
  } catch {
    return timeStr; // Fallback just in case
  }
};

export default function GuestsPage() {
  const { guests: dbGuests, loading, fetchData } = useGuests();
  const [activeTab, setActiveTab] = useState(TABS[0].name);
  
  const [newGuest, setNewGuest] = useState({ 
    room: "", mobile: "", arrivalTime: "", family: "", count: "", hotel: "", arrival: "", origin: "" 
  });
  
  const [copyAll, setCopyAll] = useState(false);
  const [copySelected, setCopySelected] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  const filteredGuests = useMemo(() => 
    dbGuests.filter((g) => g.tab_category === activeTab), 
  [dbGuests, activeTab]);

  const totalPeople = filteredGuests.reduce((acc, g) => acc + (Number(g.count) || 0), 0);

  const handleAdd = async () => {
    if (!newGuest.family || !newGuest.count) {
      alert("Please fill in both Family Name and No. of People.");
      return;
    }

    const createEntry = (category: string) => ({
      tab_category: category,
      family: newGuest.family,
      count: newGuest.count,
      room_no: category === activeTab ? newGuest.room : "",
      mobile_no: category === activeTab ? (newGuest.mobile || null) : null,
      arrival_time: category === activeTab ? (newGuest.arrivalTime || null) : null,
      hotel_name: category === activeTab ? newGuest.hotel : "",
      arrival_date: category === activeTab ? (newGuest.arrival || null) : null,
      origin_place: category === activeTab ? newGuest.origin : ""
    });

    const entries = [createEntry(activeTab)];
    if (copyAll) ["Sangeet", "Haldi", "Reception"].forEach(evt => entries.push(createEntry(evt)));
    else if (copySelected) ["Haldi", "Reception"].forEach(evt => entries.push(createEntry(evt)));

    const { error } = await supabase.from("guests").insert(entries);
    
    if (error) {
      console.error("Supabase Insert Error:", error);
      alert(`Failed to add guest: ${error.message}`);
      return; 
    }

    setNewGuest({ room: "", mobile: "", arrivalTime: "", family: "", count: "", hotel: "", arrival: "", origin: "" });
    fetchData();
  };

  const saveEdit = async (id: string) => {
    await supabase.from("guests").update({
      room_no: editForm.room_no,
      mobile_no: editForm.mobile_no || null,
      arrival_time: editForm.arrival_time || null,
      family: editForm.family,
      count: editForm.count,
      arrival_date: editForm.arrival_date || null,
      origin_place: editForm.origin_place,
      hotel_name: editForm.hotel_name
    }).eq("id", id);
    setEditingId(null);
    fetchData();
  };

  if (loading) return <div className="p-12 text-center text-emerald-600">Loading...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-emerald-900 mb-2">Guest Management</h1>
      
      {/* Tabs */}
      <div className="flex gap-2 border-b mb-8 overflow-x-auto pb-2">
        {TABS.map((tab) => (
          <button key={tab.name} onClick={() => setActiveTab(tab.name)}
            className={`px-4 py-2 rounded-t-lg flex items-center gap-2 whitespace-nowrap ${activeTab === tab.name ? "bg-emerald-50 border-b-2 border-emerald-600 text-emerald-700" : "hover:bg-slate-50"}`}>
            {tab.name} <span className="bg-slate-200 text-xs px-2 py-0.5 rounded-full">{dbGuests.filter(g => g.tab_category === tab.name).length}</span>
          </button>
        ))}
      </div>

      <div className="border rounded-lg p-6 bg-white shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">{activeTab} List</h2>
          <span className="bg-emerald-50 text-emerald-700 px-4 py-1 rounded-full font-medium">Total: {totalPeople} people</span>
        </div>

        {/* Input Form */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-slate-50 p-4 rounded-lg">
          <input className="border p-2 rounded bg-white" placeholder="Family Name" value={newGuest.family} onChange={e => setNewGuest({...newGuest, family: e.target.value})} />
          <input className="border p-2 rounded bg-white" placeholder="No. of People" type="number" value={newGuest.count} onChange={e => setNewGuest({...newGuest, count: e.target.value})} />
          
          {activeTab.includes("Staying") && (
            <>
              <input className="border p-2 rounded bg-white" placeholder="Room No" value={newGuest.room} onChange={e => setNewGuest({...newGuest, room: e.target.value})} />
              <input className="border p-2 rounded bg-white" placeholder="Mobile Number" value={newGuest.mobile} onChange={e => setNewGuest({...newGuest, mobile: e.target.value})} />
              
              <input 
                type="text" 
                onFocus={(e) => (e.target.type = "time")}
                onBlur={(e) => (!e.target.value ? (e.target.type = "text") : null)}
                className="border p-2 rounded bg-white" 
                placeholder="Arrival Time" 
                value={newGuest.arrivalTime} 
                onChange={e => setNewGuest({...newGuest, arrivalTime: e.target.value})} 
              />
              
              <input className="border p-2 rounded bg-white" placeholder="Hotel" value={newGuest.hotel} onChange={e => setNewGuest({...newGuest, hotel: e.target.value})} />
              <input className="border p-2 rounded bg-white" placeholder="Origin" value={newGuest.origin} onChange={e => setNewGuest({...newGuest, origin: e.target.value})} />
              
              <input 
                type="text" 
                onFocus={(e) => (e.target.type = "date")}
                onBlur={(e) => (!e.target.value ? (e.target.type = "text") : null)}
                className="border p-2 rounded bg-white" 
                placeholder="Arrival Date" 
                value={newGuest.arrival} 
                onChange={e => setNewGuest({...newGuest, arrival: e.target.value})} 
              />
            </>
          )}

          {activeTab.includes("Staying") && (
            <div className="md:col-span-4 flex flex-col gap-2 my-2">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" checked={copyAll} onChange={(e) => { setCopyAll(e.target.checked); if (e.target.checked) setCopySelected(false); }} />
                Automatically copy to Sangeet, Haldi & Reception lists
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" checked={copySelected} onChange={(e) => { setCopySelected(e.target.checked); if (e.target.checked) setCopyAll(false); }} />
                Automatically copy to Haldi & Reception lists
              </label>
            </div>
          )}

          <Button onClick={handleAdd} className="bg-emerald-600 md:col-span-4"><Plus className="w-4 h-4 mr-2" /> Add Guest</Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 border-b text-left whitespace-nowrap">
                <th className="p-3">Sr No</th>
                {activeTab.includes("Staying") && (
                  <>
                    <th className="p-3">Room</th>
                    <th className="p-3">Mobile</th>
                    <th className="p-3">Arrival Time</th>
                  </>
                )}
                <th className="p-3">Family Name</th>
                <th className="p-3">No. of People</th>
                {activeTab.includes("Staying") && (
                  <>
                    <th className="p-3">Date of Arrival</th>
                    <th className="p-3">Origin</th>
                    <th className="p-3">Hotel</th>
                  </>
                )}
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredGuests.map((g, idx) => (
                <tr key={g.id} className="border-b hover:bg-slate-50">
                  {editingId === g.id ? (
                    <>
                      <td className="p-3 text-slate-500">{idx + 1}</td>
                      {activeTab.includes("Staying") && (
                        <>
                          <td className="p-2"><input className="border w-full p-1 rounded" placeholder="Room No" value={editForm.room_no || ''} onChange={e => setEditForm({...editForm, room_no: e.target.value})} /></td>
                          <td className="p-2"><input className="border w-full p-1 rounded" placeholder="Mobile" value={editForm.mobile_no || ''} onChange={e => setEditForm({...editForm, mobile_no: e.target.value})} /></td>
                          <td className="p-2">
                            <input 
                              type="time" 
                              className="border w-full p-1 rounded" 
                              value={editForm.arrival_time || ""} 
                              onChange={e => setEditForm({...editForm, arrival_time: e.target.value})} 
                            />
                          </td>
                        </>
                      )}
                      <td className="p-2"><input className="border w-full p-1 rounded" placeholder="Family Name" value={editForm.family || ''} onChange={e => setEditForm({...editForm, family: e.target.value})} /></td>
                      <td className="p-2"><input className="border w-full p-1 rounded" placeholder="Count" type="number" value={editForm.count || ''} onChange={e => setEditForm({...editForm, count: e.target.value})} /></td>
                      {activeTab.includes("Staying") && (
                        <>
                          <td className="p-2">
                            <input 
                              type="date" 
                              className="border w-full p-1 rounded" 
                              value={editForm.arrival_date || ""} 
                              onChange={e => setEditForm({...editForm, arrival_date: e.target.value})} 
                            />
                          </td>
                          <td className="p-2"><input className="border w-full p-1 rounded" placeholder="Origin" value={editForm.origin_place || ''} onChange={e => setEditForm({...editForm, origin_place: e.target.value})} /></td>
                          <td className="p-2"><input className="border w-full p-1 rounded" placeholder="Hotel" value={editForm.hotel_name || ''} onChange={e => setEditForm({...editForm, hotel_name: e.target.value})} /></td>
                        </>
                      )}
                      <td className="p-2 flex gap-1 justify-center">
                        <Button size="sm" onClick={() => saveEdit(g.id)}><Check className="w-4 h-4"/></Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}><X className="w-4 h-4"/></Button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-3 text-slate-500">{idx + 1}</td>
                      {activeTab.includes("Staying") && (
                        <>
                          <td className="p-3">{g.room_no || '-'}</td>
                          <td className="p-3">{g.mobile_no || '-'}</td>
                          {/* APPLYING 12HR FORMAT HERE */}
                          <td className="p-3 whitespace-nowrap">{formatTime12hr(g.arrival_time)}</td>
                        </>
                      )}
                      <td className="p-3 font-medium whitespace-nowrap">{g.family}</td>
                      <td className="p-3">{g.count}</td>
                      {activeTab.includes("Staying") && (
                        <>
                          <td className="p-3 whitespace-nowrap">{g.arrival_date ? new Date(g.arrival_date).toLocaleDateString("en-GB") : "-"}</td>
                          <td className="p-3">{g.origin_place || '-'}</td>
                          <td className="p-3">{g.hotel_name || '-'}</td>
                        </>
                      )}
                      <td className="p-3 flex gap-1 justify-center">
                        <Button variant="ghost" size="sm" onClick={() => { setEditingId(g.id); setEditForm(g); }}><Pencil className="w-4 h-4"/></Button>
                        <Button variant="ghost" size="sm" onClick={() => supabase.from("guests").delete().eq("id", g.id).then(fetchData)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}