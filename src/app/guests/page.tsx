"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Users, Trash2, Pencil, Check, X, FileSpreadsheet } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useGuests } from "@/hooks/useGuests";

const TABS = [
  { name: "Nimisha's Side Staying" },
  { name: "Prajanya's Side Staying" },
  { name: "Sangeet" },
  { name: "Haldi" },
  { name: "Reception" },
];

const formatTime12hr = (timeStr: string | null) => {
  if (!timeStr) return "-";
  try {
    const [hours, minutes] = timeStr.split(":");
    let h = parseInt(hours, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12; 
    return `${h}:${minutes} ${ampm}`;
  } catch {
    return timeStr; 
  }
};

export default function GuestsPage() {
  const { guests: dbGuests, loading, fetchData } = useGuests();
  const [activeTab, setActiveTab] = useState(TABS[0].name);
  
  const [newGuest, setNewGuest] = useState({ 
    room: "", mobile: "", arrivalTime: "", family: "", count: "", hotel: "", arrival: "", origin: "", transportion: ""
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
      transportaion_name: category === activeTab ? newGuest.transportion : "",
      origin_place: category === activeTab ? newGuest.origin : "",
      arrived: false
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

    setNewGuest({ room: "", family: "", count: "", mobile: "", arrivalTime: "", hotel: "", arrival: "", origin: "", transportion: "" });
    fetchData();
  };

  const saveEdit = async (id: string) => {
    const { error } = await supabase.from("guests").update({
      room_no: editForm.room_no,
      family: editForm.family,
      count: editForm.count,
      mobile_no: editForm.mobile_no || null,
      arrival_time: editForm.arrival_time || null,
      arrival_date: editForm.arrival_date || null,
      origin_place: editForm.origin_place,
      transportaion_name: editForm.transportaion_name,
      hotel_name: editForm.hotel_name
    }).eq("id", id);

    if (error) {
      console.error("Update Error:", error);
      alert(`Failed to update: ${error.message}`);
      return;
    }

    setEditingId(null);
    fetchData();
  };

  const toggleArrival = async (guest: any) => {
    const { error } = await supabase
      .from("guests")
      .update({ arrived: !guest.arrived })
      .eq("id", guest.id);

    if (!error) {
      fetchData();
    } else {
      console.error("Toggle Error:", error);
    }
  };

  const exportToGoogleSheets = async () => {
    const payload = TABS.map((tab) => {
      const isStaying = tab.name.includes("Staying");
      
      return {
        sheetName: tab.name,
        rows: dbGuests
          .filter((g) => g.tab_category === tab.name)
          .map((g, index) => {
            const baseRow: any = {
              "Sr No": index + 1,
              "Family Name": g.family,
              "No. of People": g.count,
            };

            if (isStaying) {
              return {
                "Sr No": index + 1,
                "Room No": g.room_no || "-",
                "Arrived": g.arrived ? "Yes" : "No",
                "Family Name": g.family,
                "No. of People": g.count,
                "Mobile No": g.mobile_no || "-",
                "Arrival Date": g.arrival_date || "-",
                "Arrival Time": formatTime12hr(g.arrival_time),
                "Origin": g.origin_place || "-",
                "Transportation": g.transportaion_name || "-",
                "Hotel": g.hotel_name || "-",
              };
            }

            return baseRow;
          }),
      };
    });

    try {
      const response = await fetch("/api/export-sheets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.text();

      if (response.ok) {
        alert("Google Sheet updated successfully!");
      } else {
        alert(result);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update Google Sheet");
    }
  };

  if (loading) return <div className="p-12 text-center text-emerald-600">Loading...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-emerald-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-emerald-600" />
            Guest Management
          </h1>
          <p className="mt-2 text-slate-500">
            View all guests by events.
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <a 
            href="https://docs.google.com/spreadsheets/d/1PnsOf0vpQs3I_S7ilQF7heiBwYvePVzsyz81I74czgA/edit?gid=1068383416#gid=1068383416" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full sm:w-auto"
          >
            <Button 
              variant="outline"
              className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 flex items-center justify-center gap-2 w-full"
            >
              <FileSpreadsheet className="w-4 h-4" /> Open Sheet
            </Button>
          </a>
          <Button 
            onClick={exportToGoogleSheets} 
            className="bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export to Sheets
          </Button>
        </div>
      </div>
      
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
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">{activeTab} List</h2>
            <span className="bg-emerald-50 text-emerald-700 px-4 py-1 rounded-full font-medium text-sm">
              Total: {totalPeople} people
            </span>
          </div>
        </div>

        {/* Input Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6 bg-slate-50 p-4 rounded-lg">
          <input className="border p-2 rounded bg-white w-full" placeholder="Family Name" value={newGuest.family} onChange={e => setNewGuest({...newGuest, family: e.target.value})} />
          <input className="border p-2 rounded bg-white w-full" placeholder="No. of People" type="number" value={newGuest.count} onChange={e => setNewGuest({...newGuest, count: e.target.value})} />
          
          {activeTab.includes("Staying") && (
            <>
              <input className="border p-2 rounded bg-white w-full" placeholder="Room No" value={newGuest.room} onChange={e => setNewGuest({...newGuest, room: e.target.value})} />
              <input className="border p-2 rounded bg-white w-full" placeholder="Mobile Number" value={newGuest.mobile} onChange={e => setNewGuest({...newGuest, mobile: e.target.value})} />
              
              <input 
                type="text" 
                onFocus={(e) => (e.target.type = "time")}
                onBlur={(e) => (!e.target.value ? (e.target.type = "text") : null)}
                className="border p-2 rounded bg-white w-full" 
                placeholder="Arrival Time" 
                value={newGuest.arrivalTime} 
                onChange={e => setNewGuest({...newGuest, arrivalTime: e.target.value})} 
              />
              
              <input className="border p-2 rounded bg-white w-full" placeholder="Mode of Transportation" value={newGuest.transportion} onChange={e => setNewGuest({...newGuest, transportion: e.target.value})} />
              <input className="border p-2 rounded bg-white w-full" placeholder="Hotel" value={newGuest.hotel} onChange={e => setNewGuest({...newGuest, hotel: e.target.value})} />
              <input className="border p-2 rounded bg-white w-full" placeholder="Origin" value={newGuest.origin} onChange={e => setNewGuest({...newGuest, origin: e.target.value})} />
              
              <input 
                type="text" 
                onFocus={(e) => (e.target.type = "date")}
                onBlur={(e) => (!e.target.value ? (e.target.type = "text") : null)}
                className="border p-2 rounded bg-white w-full" 
                placeholder="Arrival Date" 
                value={newGuest.arrival} 
                onChange={e => setNewGuest({...newGuest, arrival: e.target.value})} 
              />
            </>
          )}

          {activeTab.includes("Staying") && (
            <div className="sm:col-span-2 md:col-span-4 flex flex-col gap-2 my-2">
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input type="checkbox" checked={copyAll} onChange={(e) => { setCopyAll(e.target.checked); if (e.target.checked) setCopySelected(false); }} />
                Automatically copy to Sangeet, Haldi & Reception lists
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input type="checkbox" checked={copySelected} onChange={(e) => { setCopySelected(e.target.checked); if (e.target.checked) setCopyAll(false); }} />
                Automatically copy to Haldi & Reception lists
              </label>
            </div>
          )}

          <Button onClick={handleAdd} className="bg-emerald-600 hover:bg-emerald-700 sm:col-span-2 md:col-span-4 w-full">
            <Plus className="w-4 h-4 mr-2" /> Add Guest
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-700 font-semibold border-b text-left whitespace-nowrap">
                <th className="p-3">Sr No</th>
                {activeTab.includes("Staying") && <th className="p-3">Room</th>}
                {activeTab.includes("Staying") && <th className="p-3 text-center">Arrived</th>}
                <th className="p-3">Family Name</th>
                <th className="p-3">No. of People</th>
                {activeTab.includes("Staying") && (
                  <>
                    <th className="p-3">Mobile</th>
                    <th className="p-3">Date of Arrival</th>
                    <th className="p-3">Arrival Time</th>
                    <th className="p-3">Origin</th>
                    <th className="p-3">Transportation</th>
                    <th className="p-3">Hotel</th>
                  </>
                )}
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredGuests.map((g, idx) => (
                <tr key={g.id} className={`border-b hover:bg-slate-50 ${g.arrived ? "line-through text-slate-600 bg-green-50" : ""}`}>
                  {editingId === g.id ? (
                    <>
                      <td className="p-3 text-slate-500">{idx + 1}</td>
                      {activeTab.includes("Staying") && (
                        <td className="p-2"><input className="border w-full p-1 rounded" placeholder="Room No" value={editForm.room_no || ''} onChange={e => setEditForm({...editForm, room_no: e.target.value})} /></td>
                      )}
                      {activeTab.includes("Staying") && (
                        <td className="p-3 text-center">
                          <Button
                            size="icon"
                            variant={editForm.arrived ? "default" : "outline"}
                            className={editForm.arrived ? "bg-green-600 hover:bg-green-700" : ""}
                            onClick={() => setEditForm({...editForm, arrived: !editForm.arrived})}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        </td>
                      )}
                      <td className="p-2"><input className="border w-full p-1 rounded" placeholder="Family Name" value={editForm.family || ''} onChange={e => setEditForm({...editForm, family: e.target.value})} /></td>
                      <td className="p-2"><input className="border w-full p-1 rounded" placeholder="Count" type="number" value={editForm.count || ''} onChange={e => setEditForm({...editForm, count: e.target.value})} /></td>
                      {activeTab.includes("Staying") && (
                        <>
                          <td className="p-2"><input className="border w-full p-1 rounded" placeholder="Mobile" value={editForm.mobile_no || ''} onChange={e => setEditForm({...editForm, mobile_no: e.target.value})} /></td>
                          <td className="p-2">
                            <input 
                              type="date" 
                              className="border w-full p-1 rounded" 
                              value={editForm.arrival_date || ""} 
                              onChange={e => setEditForm({...editForm, arrival_date: e.target.value})} 
                            />
                          </td>
                          <td className="p-2">
                            <input 
                              type="time" 
                              className="border w-full p-1 rounded" 
                              value={editForm.arrival_time || ""} 
                              onChange={e => setEditForm({...editForm, arrival_time: e.target.value})} 
                            />
                          </td>
                          <td className="p-2"><input className="border w-full p-1 rounded" placeholder="Origin" value={editForm.origin_place || ''} onChange={e => setEditForm({...editForm, origin_place: e.target.value})} /></td>
                          <td className="p-2"><input className="border w-full p-1 rounded" placeholder="Transportation" value={editForm.transportaion_name || ''} onChange={e => setEditForm({...editForm, transportaion_name: e.target.value})} /></td>
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
                      {activeTab.includes("Staying") && <td className="p-3">{g.room_no || '-'}</td>}
                      {activeTab.includes("Staying") && (
                        <td className="p-3 text-center">
                          <Button
                            size="icon"
                            variant={g.arrived ? "default" : "outline"}
                            className={g.arrived ? "bg-green-600 hover:bg-green-700" : ""}
                            onClick={() => toggleArrival(g)}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        </td>
                      )}
                      <td className="p-3 font-medium whitespace-nowrap">{g.family}</td>
                      <td className="p-3">{g.count}</td>
                      {activeTab.includes("Staying") && (
                        <>
                          <td className="p-3 whitespace-nowrap">
                            {g.mobile_no ? (
                              <a 
                                href={`tel:${g.mobile_no}`} 
                                className="text-emerald-700 hover:underline hover:text-emerald-900 font-medium"
                              >
                                {g.mobile_no}
                              </a>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="p-3 whitespace-nowrap">{g.arrival_date ? new Date(g.arrival_date).toLocaleDateString("en-GB", {day: "2-digit",month: "2-digit",year: "numeric",}).replace(/\//g, "-") : "-"}</td>
                          <td className="p-3 whitespace-nowrap">{formatTime12hr(g.arrival_time)}</td>
                          <td className="p-3">{g.origin_place || '-'}</td>
                          <td className="p-3">{g.transportaion_name || '-'}</td>
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