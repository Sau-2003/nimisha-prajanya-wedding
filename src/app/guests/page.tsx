// "use client";

// import { useState, useMemo } from "react";
// import { Button } from "@/components/ui/button";
// import { Plus, Trash2 } from "lucide-react";
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
//   const [newGuest, setNewGuest] = useState({ room: "", family: "", count: "", hotel: "", arrival: "", origin: "" });
//   const [copySangeet, setCopySangeet] = useState(false);
//   const [copyOther, setCopyOther] = useState(false);

//   const filteredGuests = useMemo(() => 
//     dbGuests.filter((g) => g.tab_category === activeTab), 
//   [dbGuests, activeTab]);

//   const totalPeople = filteredGuests.reduce((acc, g) => acc + (Number(g.count) || 0), 0);

//   const handleAdd = async () => {
//   if (!newGuest.family || !newGuest.count) return;

//   // Helper function to create a full guest object with defaults
//   const createGuestEntry = (category: string) => ({
//     tab_category: category,
//     family: newGuest.family,
//     count: newGuest.count,
//     room_no: category === activeTab ? newGuest.room : "", // Only keep room for the active tab
//     hotel_name: category === activeTab ? newGuest.hotel : "",
//     arrival_date: category === activeTab ? (newGuest.arrival || null) : null,
//     origin_place: category === activeTab ? newGuest.origin : ""
//   });

//   const entries = [createGuestEntry(activeTab)];

//   if (copySangeet) {
//     entries.push(createGuestEntry("Sangeet"));
//   }
  
//   if (copyOther) {
//     ["Haldi", "Reception"].forEach(evt => {
//       entries.push(createGuestEntry(evt));
//     });
//   }

//   await supabase.from("guests").insert(entries);
//   setNewGuest({ room: "", family: "", count: "", hotel: "", arrival: "", origin: "" });
//   fetchData();
// };

//   if (loading) return <div className="p-12 text-center text-emerald-600">Loading...</div>;

//   return (
//     <div className="p-8 max-w-6xl mx-auto">
//       <h1 className="text-3xl font-bold text-emerald-900 mb-2">Guest Management</h1>
//       <p className="text-slate-500 mb-8">Track family headcounts and room assignments across events.</p>

//       {/* Horizontal Tabs */}
//       <div className="flex gap-2 border-b mb-8 overflow-x-auto pb-2">
//         {TABS.map((tab) => (
//           <button 
//             key={tab.name}
//             onClick={() => setActiveTab(tab.name)}
//             className={`px-4 py-2 rounded-t-lg flex items-center gap-2 whitespace-nowrap ${activeTab === tab.name ? "bg-emerald-50 border-b-2 border-emerald-600 text-emerald-700" : "hover:bg-slate-50"}`}
//           >
//             {tab.name} <span className="bg-slate-200 text-xs px-2 py-0.5 rounded-full">{dbGuests.filter(g => g.tab_category === tab.name).length}</span>
//           </button>
//         ))}
//       </div>

//       {/* Guest List Card */}
//       <div className="border rounded-lg p-6 bg-white shadow-sm">
//         <div className="flex justify-between items-center mb-6">
//           <h2 className="text-xl font-semibold">{activeTab} Guest List</h2>
//           <span className="bg-emerald-50 text-emerald-700 px-4 py-1 rounded-full font-medium">Total People: {totalPeople}</span>
//         </div>

//         {/* Input Form */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 bg-slate-50 p-4 rounded-lg">
//           {/* Show these inputs ONLY on Staying tabs */}
//           {(activeTab.includes("Staying")) && (
//             <>
//             <input className="border p-2 rounded" placeholder="Room No" value={newGuest.room} onChange={e => setNewGuest({...newGuest, room: e.target.value})} />
//             <input className="border p-2 rounded" placeholder="Hotel" value={newGuest.hotel} onChange={e => setNewGuest({...newGuest, hotel: e.target.value})} />
//             <input type="date" className="border p-2 rounded" value={newGuest.arrival} onChange={e => setNewGuest({...newGuest, arrival: e.target.value})} />
//             <input className="border p-2 rounded" placeholder="Origin" value={newGuest.origin} onChange={e => setNewGuest({...newGuest, origin: e.target.value})} />
//             </>
//           )}
//           {/* These inputs show on ALL tabs */}
//           <input className="border p-2 rounded" placeholder="Family / Guest Name" value={newGuest.family} onChange={e => setNewGuest({...newGuest, family: e.target.value})} />
//           <input className="border p-2 rounded" placeholder="Total People" value={newGuest.count} onChange={e => setNewGuest({...newGuest, count: e.target.value})} />
//           </div>

//         {/* Checkboxes */}
//         <div className="flex gap-6 mb-6 text-sm text-slate-600">
//           <label className="flex items-center gap-2"><input type="checkbox" checked={copySangeet} onChange={e => setCopySangeet(e.target.checked)} /> Automatically copy to Sangeet list</label>
//           <label className="flex items-center gap-2"><input type="checkbox" checked={copyOther} onChange={e => setCopyOther(e.target.checked)} /> Automatically copy to Haldi & Reception</label>
//           <Button onClick={handleAdd} className="bg-emerald-600 ml-auto"><Plus className="w-4 h-4 mr-2" /> Add</Button>
//         </div>

//         {/* Table */}
//         <table className="w-full">
//           <thead>
//             <tr className="text-slate-400 text-sm border-b">
//               <th className="text-left p-3">Sr No</th>
//               {/* Conditionally show Room, Hotel, Arrival, Origin only if it is a "Staying" tab */}
//               {(activeTab.includes("Staying")) && (
//                 <>
//                 <th className="text-left p-3">Room</th>
//                 <th className="text-left p-3">Hotel</th>
//                 <th className="text-left p-3">Arrival</th>
//                 <th className="text-left p-3">Origin</th>
//                 </>
//               )}
//               <th className="text-left p-3">Family Name</th>
//               <th className="text-left p-3">People</th>
//               <th className="text-left p-3">Action</th>
//               </tr>
//               </thead>
//               <tbody>
//                 {filteredGuests.map((g, idx) => (
//                   <tr key={g.id} className="border-b">
//                     <td className="p-3 text-slate-500">{idx + 1}</td>
                    
//                     {/* Conditional cells matching the headers above */}
//                     {(activeTab.includes("Staying")) && (
//                       <>
//                       <td className="p-3">{g.room_no}</td>
//                       <td className="p-3">{g.hotel_name}</td>
//                       <td className="p-3">{g.arrival_date}</td>
//                       <td className="p-3">{g.origin_place}</td>
//                     </>
//                   )}
                  
//                   <td className="p-3 font-medium">{g.family}</td>
//                   <td className="p-3">{g.count}</td>
//                   <td className="p-3">
//                     <Button variant="ghost" size="sm" onClick={() => supabase.from("guests").delete().eq("id", g.id).then(fetchData)}>
//                       <Trash2 className="w-4 h-4 text-red-500" />
//                       </Button>
//                       </td>
//                       </tr>
//                     ))}
//               </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }






"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useGuests } from "@/hooks/useGuests";

const TABS = [
  { name: "Nimisha's Side Staying" },
  { name: "Prajanya's Side Staying" },
  { name: "Sangeet" },
  { name: "Haldi" },
  { name: "Reception" },
];

export default function GuestsPage() {
  const { guests: dbGuests, loading, fetchData } = useGuests();
  const [activeTab, setActiveTab] = useState(TABS[0].name);
  const [newGuest, setNewGuest] = useState({ room: "", family: "", count: "", hotel: "", arrival: "", origin: "" });

  const filteredGuests = useMemo(() => 
    dbGuests.filter((g) => g.tab_category === activeTab), 
  [dbGuests, activeTab]);

  const totalPeople = filteredGuests.reduce((acc, g) => acc + (Number(g.count) || 0), 0);

  // 1. Update states
const [copyAll, setCopyAll] = useState(false); // Sangeet, Haldi, Reception
const [copySelected, setCopySelected] = useState(false); // Haldi & Reception only

// 2. Updated handleAdd function
const handleAdd = async () => {
  if (!newGuest.family || !newGuest.count) return;

  const createEntry = (category: string) => ({
    tab_category: category,
    family: newGuest.family,
    count: newGuest.count,
    room_no: category === activeTab ? newGuest.room : "",
    hotel_name: category === activeTab ? newGuest.hotel : "",
    arrival_date: category === activeTab ? (newGuest.arrival || null) : null,
    origin_place: category === activeTab ? newGuest.origin : ""
  });

  const entries = [createEntry(activeTab)];

  if (copyAll) {
    ["Sangeet", "Haldi", "Reception"].forEach(evt => entries.push(createEntry(evt)));
  } else if (copySelected) {
    ["Haldi", "Reception"].forEach(evt => entries.push(createEntry(evt)));
  }

  await supabase.from("guests").insert(entries);
  setNewGuest({ room: "", family: "", count: "", hotel: "", arrival: "", origin: "" });
  fetchData();
};

  if (loading) return <div className="p-12 text-center text-emerald-600">Loading...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-emerald-900 mb-2">Guest Management</h1>
      <p className="text-slate-500 mb-8">Track family headcounts and room assignments across events.</p>

      {/* Horizontal Tabs */}
      <div className="flex gap-2 border-b mb-8 overflow-x-auto pb-2">
        {TABS.map((tab) => (
          <button 
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`px-4 py-2 rounded-t-lg flex items-center gap-2 whitespace-nowrap ${activeTab === tab.name ? "bg-emerald-50 border-b-2 border-emerald-600 text-emerald-700" : "hover:bg-slate-50"}`}
          >
            {tab.name} <span className="bg-slate-200 text-xs px-2 py-0.5 rounded-full">{dbGuests.filter(g => g.tab_category === tab.name).length}</span>
          </button>
        ))}
      </div>

      <div className="border rounded-lg p-6 bg-white shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">{activeTab} Guest List</h2>
          <span className="bg-emerald-50 text-emerald-700 px-4 py-1 rounded-full font-medium">Total People: {totalPeople}</span>
        </div>

        {/* Input Form */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-slate-50 p-4 rounded-lg">
          {activeTab.includes("Staying") && (
            <>
              <input className="border p-2 rounded" placeholder="Room No" value={newGuest.room} onChange={e => setNewGuest({...newGuest, room: e.target.value})} />
              <input className="border p-2 rounded" placeholder="Hotel" value={newGuest.hotel} onChange={e => setNewGuest({...newGuest, hotel: e.target.value})} />
              <input type="date" className="border p-2 rounded" value={newGuest.arrival} onChange={e => setNewGuest({...newGuest, arrival: e.target.value})} />
              <input className="border p-2 rounded" placeholder="Origin" value={newGuest.origin} onChange={e => setNewGuest({...newGuest, origin: e.target.value})} />
            </>
          )}
          <input className="border p-2 rounded" placeholder="Family / Guest Name" value={newGuest.family} onChange={e => setNewGuest({...newGuest, family: e.target.value})} />
          <input className="border p-2 rounded" placeholder="Total People" value={newGuest.count} onChange={e => setNewGuest({...newGuest, count: e.target.value})} />
          <Button onClick={handleAdd} className="bg-emerald-600 md:col-span-3"><Plus className="w-4 h-4 mr-2" /> Add Guest</Button>
        </div>

        {activeTab.includes("Staying") && (
  <div className="flex flex-col gap-2 mb-6 text-sm text-slate-600">
    <label className="flex items-center gap-2">
      <input type="checkbox" checked={copyAll} onChange={e => { setCopyAll(e.target.checked); setCopySelected(false); }} /> 
      Automatically copy to Sangeet, Haldi, & Reception lists
    </label>
    <label className="flex items-center gap-2">
      <input type="checkbox" checked={copySelected} onChange={e => { setCopySelected(e.target.checked); setCopyAll(false); }} /> 
      Automatically copy to Haldi & Reception lists
    </label>
  </div>
)}

        {/* Table */}
        <table className="w-full">
          <thead>
            <tr className="text-slate-400 text-sm border-b text-left">
              <th className="p-3">Sr No</th>
              {activeTab.includes("Staying") && (
                <>
                  <th className="p-3">Room</th>
                  <th className="p-3">Hotel</th>
                  <th className="p-3">Arrival</th>
                  <th className="p-3">Origin</th>
                </>
              )}
              <th className="p-3">Family Name</th>
              <th className="p-3">No. of People</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredGuests.map((g, idx) => (
              <tr key={g.id} className="border-b">
                <td className="p-3 text-slate-500">{idx + 1}</td>
                {activeTab.includes("Staying") && (
                  <>
                    <td className="p-3">{g.room_no}</td>
                    <td className="p-3">{g.hotel_name}</td>
                    <td className="p-3">{g.arrival_date}</td>
                    <td className="p-3">{g.origin_place}</td>
                  </>
                )}
                <td className="p-3 font-medium">{g.family}</td>
                <td className="p-3">{g.count}</td>
                <td className="p-3">
                  <Button variant="ghost" size="sm" onClick={() => supabase.from("guests").delete().eq("id", g.id).then(fetchData)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}