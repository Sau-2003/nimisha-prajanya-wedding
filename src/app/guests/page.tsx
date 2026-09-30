"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Users, Trash2, Pencil, Check, X, FileSpreadsheet, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { useGuests } from "@/hooks/useGuests";

const TABS = [
  { 
    name: "Nimisha's Side Staying", 
    formLink: "https://docs.google.com/forms/d/e/1FAIpQLScFBiRBcWdcMJImcindFgZowuJb3DLrKHbZ5zAqLxv6FHBTqw/viewform?usp=sharing&ouid=108021249968731666581" 
  },
  { 
    name: "Prajanya's Side Staying", 
    formLink: "https://docs.google.com/forms/d/e/1FAIpQLSd1hcMj5I4TplzX1tsj65pw9UJwZ6vurnQyRTKR-Pyy_rmvyw/viewform?usp=dialog" 
  },
  { 
    name: "Sangeet", 
    formLink: "https://docs.google.com/forms/d/e/1FAIpQLSdfEPMNpl-G_8XD65yQL1J7y7dQExduNW9TLYEBaelOdYjnhg/viewform?usp=header" 
  },
  { 
    name: "Haldi", 
    formLink: "https://docs.google.com/forms/d/e/1FAIpQLSfaMDcetY_j-CK7xERXNcTsI5c12_lmzYzxx7ZjTqHTSIFj9A/viewform?usp=header" 
  },
  { 
    name: "Reception", 
    formLink: "https://docs.google.com/forms/d/e/1FAIpQLSfqcaNhDeWyOTPepyfPxIoQhLlZrWropZowTSIoNR_esXDM6g/viewform"
  },
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

const parseMobileNumbers = (mobileStr: string | null) => {
  if (!mobileStr) return [];
  return mobileStr.split(/[\s,]+/).filter(Boolean).slice(0, 6);
};

export default function GuestsPage() {
  const { guests: dbGuests, loading, fetchData } = useGuests();
  const [activeTab, setActiveTab] = useState(TABS[0].name);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  
  const [guestToDelete, setGuestToDelete] = useState<string | null>(null);

  const filteredGuests = useMemo(() => 
    dbGuests.filter((g) => g.tab_category === activeTab), 
  [dbGuests, activeTab]);

  const currentTabObj = TABS.find(t => t.name === activeTab);
  const totalPeople = filteredGuests.reduce((acc, g) => acc + (Number(g.count) || 0), 0);

  // Bulletproof side detection to recover any guests whose N/P was wiped out
  const getDerivedSide = (guest: any) => {
    if (guest.side && guest.side !== "-") return guest.side;

    if (guest.tab_category.includes("Nimisha")) return "N";
    if (guest.tab_category.includes("Prajanya")) return "P";

    const stayingMatch = dbGuests.find(g => 
      g.family === guest.family && g.tab_category.includes("Staying")
    );
    
    if (stayingMatch) {
      if (stayingMatch.tab_category.includes("Nimisha")) return "N";
      if (stayingMatch.tab_category.includes("Prajanya")) return "P";
    }
    
    return "-";
  };

  const isInEvent = (guest: any, eventName: string) => {
    return dbGuests.some(g => g.tab_category === eventName && g.family === guest.family);
  };

  const toggleEventPresence = async (guest: any, eventName: string) => {
    const existing = dbGuests.find(g => g.tab_category === eventName && g.family === guest.family);
    
    if (existing) {
      const { error } = await supabase.from("guests").delete().eq("id", existing.id);
      if (error) console.error(`Error removing from ${eventName}:`, error);
    } else {
      let determinedSide = guest.side || null;
      if (!determinedSide) {
        if (guest.tab_category.includes("Nimisha")) determinedSide = "N";
        if (guest.tab_category.includes("Prajanya")) determinedSide = "P";
      }

      const { error } = await supabase.from("guests").insert([{
        tab_category: eventName,
        family: guest.family,
        count: guest.count,
        jain: guest.jain || false,
        mobile_no: guest.mobile_no || null,
        side: determinedSide,
        arrived: guest.arrived || false,
        room_no: guest.room_no,
        arrival_date: guest.arrival_date,
        arrival_time: guest.arrival_time,
        origin_place: guest.origin_place,
        transportaion_name: guest.transportaion_name,
        hotel_name: guest.hotel_name,
        departure_date: guest.departure_date,
        departure_time: guest.departure_time,
        transportation_departure: guest.transportation_departure
      }]);
      if (error) console.error(`Error adding to ${eventName}:`, error);
    }
    fetchData(); 
  };

  const saveEdit = async (id: string) => {
    const originalGuest = dbGuests.find(g => g.id === id);
    if (!originalGuest) return;

    const joinedMobiles = (editForm.mobiles || []).filter(Boolean).join(" ");

    // FIX: Forcefully protect and set the N/P side so it doesn't get wiped out to `null` 
    // when you save from the Staying tabs (where the dropdown is hidden)
    let sideToSave = editForm.side;
    if (activeTab.includes("Nimisha")) sideToSave = "N";
    if (activeTab.includes("Prajanya")) sideToSave = "P";

    const { error } = await supabase.from("guests").update({
      room_no: editForm.room_no,
      family: editForm.family,
      count: editForm.count,
      mobile_no: joinedMobiles || null,
      arrival_time: editForm.arrival_time || null,
      departure_time: editForm.departure_time || null,
      arrival_date: editForm.arrival_date || null,
      departure_date: editForm.departure_date || null,
      origin_place: editForm.origin_place,
      transportaion_name: editForm.transportaion_name,
      transportation_departure: editForm.transportation_departure,
      hotel_name: editForm.hotel_name,
      jain: editForm.jain !== undefined ? editForm.jain : false,
      side: sideToSave || null
    }).eq("family", originalGuest.family);

    if (error) {
      console.error("Update Error:", error);
      alert(`Failed to update: ${error.message}`);
      return;
    }

    setEditingId(null);
    fetchData();
  };

  const toggleArrival = async (guest: any) => {
    const { error } = await supabase.from("guests").update({ arrived: !guest.arrived }).eq("family", guest.family);
    if (!error) fetchData();
  };

  const toggleJain = async (guest: any) => {
    const { error } = await supabase.from("guests").update({ jain: !guest.jain }).eq("family", guest.family);
    if (!error) fetchData();
  };

  const confirmDelete = async () => {
    if (!guestToDelete) return;
    const { error } = await supabase.from("guests").delete().eq("id", guestToDelete);
    if (error) alert("Failed to delete guest.");
    else fetchData();
    setGuestToDelete(null);
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
              "Name": g.family,
              "No. of People": g.count,
            };

            if (!isStaying) baseRow["N/P"] = getDerivedSide(g); 
            baseRow["Jain"] = g.jain ? "Yes" : "No";

            if (isStaying) {
              const mobiles = parseMobileNumbers(g.mobile_no);
              return {
                "Sr No": index + 1,
                "Room No": g.room_no || "-",
                "Arrived": g.arrived ? "Yes" : "No",
                "Name": g.family,
                "No. of People": g.count,
                "Jain": g.jain ? "Yes" : "No",
                "Mobile 1": mobiles[0] || "-",
                "Mobile 2": mobiles[1] || "-",
                "Mobile 3": mobiles[2] || "-",
                "Mobile 4": mobiles[3] || "-",
                "Mobile 5": mobiles[4] || "-",
                "Mobile 6": mobiles[5] || "-",
                "Arrival Date": g.arrival_date || "-",
                "Arrival Time": formatTime12hr(g.arrival_time),
                "Origin": g.origin_place || "-",
                "Transportation (Arrival)": g.transportaion_name || "-",
                "Hotel": g.hotel_name || "-",
                "Departure Date": g.departure_date || "-",
                "Departure Time": formatTime12hr(g.departure_time),
                "Transportation (Departure)": g.transportation_departure || "-",
              };
            }

            return baseRow;
          }),
      };
    });

    try {
      const response = await fetch("/api/export-guests-sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) alert("Google Sheet updated successfully!");
      else alert(await response.text());
    } catch (err) {
      console.error(err);
      alert("Failed to update Google Sheet");
    }
  };

  const startEditing = (guest: any) => {
    setEditingId(guest.id);
    const existingMobiles = parseMobileNumbers(guest.mobile_no);
    const currentSide = getDerivedSide(guest);
    
    setEditForm({
      ...guest,
      side: currentSide === "-" ? "" : currentSide,
      mobiles: Array.from({ length: 6 }, (_, i) => existingMobiles[i] || "")
    });
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
      
      <div className="flex gap-2 border-b mb-8 overflow-x-auto pb-2">
        {TABS.map((tab) => (
          <button key={tab.name} onClick={() => setActiveTab(tab.name)}
            className={`px-4 py-2 rounded-t-lg flex items-center gap-2 whitespace-nowrap ${activeTab === tab.name ? "bg-emerald-50 border-b-2 border-emerald-600 text-emerald-700" : "hover:bg-slate-50"}`}>
            {tab.name} <span className="bg-slate-200 text-xs px-2 py-0.5 rounded-full">{dbGuests.filter(g => g.tab_category === tab.name).length}</span>
          </button>
        ))}
      </div>

      <div className="border rounded-lg p-6 bg-white shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <h2 className="text-xl font-semibold">{activeTab} List</h2>
            <span className="bg-emerald-50 text-emerald-700 px-4 py-1 rounded-full font-medium text-sm">
              Total: {totalPeople} people
            </span>
            {currentTabObj?.formLink && (
              <a 
                href={currentTabObj.formLink} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button 
                  variant="outline"
                  size="sm"
                  className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" /> Open Form
                </Button>
              </a>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-700 font-semibold border-b text-left whitespace-nowrap">
                <th className="p-3">Sr No</th>
                {activeTab.includes("Staying") && <th className="p-3">Room</th>}
                {activeTab.includes("Staying") && <th className="p-3 text-center">Arrived</th>}
                <th className="p-3">Name</th>
                <th className="p-3">No. of People</th>
                {!activeTab.includes("Staying") && <th className="p-3 text-center">N/P</th>}
                <th className="p-3 text-center">Jain</th>
                {activeTab.includes("Staying") && (
                  <>
                    <th className="p-3 text-center text-emerald-700">Sangeet</th>
                    <th className="p-3 text-center text-yellow-600">Haldi</th>
                    <th className="p-3 text-center text-rose-700">Reception</th>
                    <th className="p-3">Mobile(s)</th>
                    <th className="p-3">Date of Arrival</th>
                    <th className="p-3">Arrival Time</th>
                    <th className="p-3">Origin</th>
                    <th className="p-3">Transportation (Arrival)</th>
                    <th className="p-3">Hotel</th>
                    <th className="p-3">Date of Departure</th>
                    <th className="p-3">Departure Time</th>
                    <th className="p-3">Transportation (Departure)</th>
                  </>
                )}
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredGuests.map((g, idx) => (
                <tr key={g.id} className={`border-b hover:bg-slate-50 ${g.arrived ? "text-emerald-800 line-through bg-green-50 font-medium" : ""}`}>
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
                      <td className="p-2"><input className="border w-full p-1 rounded" placeholder="Name" value={editForm.family || ''} onChange={e => setEditForm({...editForm, family: e.target.value})} /></td>
                      <td className="p-2"><input className="border w-full p-1 rounded" placeholder="Count" type="number" value={editForm.count || ''} onChange={e => setEditForm({...editForm, count: e.target.value})} /></td>
                      
                      {!activeTab.includes("Staying") && (
                        <td className="p-2">
                          <select 
                            className="border w-full p-1 rounded bg-white text-center" 
                            value={editForm.side || ''} 
                            onChange={e => setEditForm({...editForm, side: e.target.value})}
                          >
                            <option value="">-</option>
                            <option value="N">N</option>
                            <option value="P">P</option>
                          </select>
                        </td>
                      )}

                      <td className="p-3 text-center">
                        <Button
                          size="icon"
                          variant={editForm.jain ? "default" : "outline"}
                          className={editForm.jain ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                          onClick={() => setEditForm({...editForm, jain: !editForm.jain})}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      </td>
                      {activeTab.includes("Staying") && (
                        <>
                          <td className="p-3 text-center">
                            <Button size="icon" variant={isInEvent(g, "Sangeet") ? "default" : "outline"} className={isInEvent(g, "Sangeet") ? "bg-emerald-600 hover:bg-emerald-700" : ""} onClick={() => toggleEventPresence(g, "Sangeet")}>
                              <Check className="w-4 h-4" />
                            </Button>
                          </td>
                          <td className="p-3 text-center">
                            <Button size="icon" variant={isInEvent(g, "Haldi") ? "default" : "outline"} className={isInEvent(g, "Haldi") ? "bg-yellow-500 hover:bg-yellow-600" : ""} onClick={() => toggleEventPresence(g, "Haldi")}>
                              <Check className="w-4 h-4" />
                            </Button>
                          </td>
                          <td className="p-3 text-center">
                            <Button size="icon" variant={isInEvent(g, "Reception") ? "default" : "outline"} className={isInEvent(g, "Reception") ? "bg-rose-600 hover:bg-rose-700" : ""} onClick={() => toggleEventPresence(g, "Reception")}>
                              <Check className="w-4 h-4" />
                            </Button>
                          </td>
                          
                          <td className="p-2 min-w-[140px] flex flex-col gap-1">
                            {Array.from({ length: 6 }).map((_, i) => (
                              <input
                                key={i}
                                type="tel"
                                maxLength={12}
                                className="border w-full p-1 rounded text-xs"
                                placeholder={`Mobile ${i + 1}`}
                                value={editForm.mobiles?.[i] || ''}
                                onChange={e => {
                                  const sanitizedValue = e.target.value.replace(/[^0-9+]/g, '');
                                  const newMobiles = [...(editForm.mobiles || [])];
                                  newMobiles[i] = sanitizedValue;
                                  setEditForm({ ...editForm, mobiles: newMobiles });
                                }}
                              />
                            ))}
                          </td>

                          <td className="p-2">
                            <input type="date" className="border w-full p-1 rounded" value={editForm.arrival_date || ""} onChange={e => setEditForm({...editForm, arrival_date: e.target.value})} />
                          </td>
                          <td className="p-2">
                            <input type="time" className="border w-full p-1 rounded" value={editForm.arrival_time || ""} onChange={e => setEditForm({...editForm, arrival_time: e.target.value})} />
                          </td>
                          <td className="p-2"><input className="border w-full p-1 rounded" placeholder="Origin" value={editForm.origin_place || ''} onChange={e => setEditForm({...editForm, origin_place: e.target.value})} /></td>
                          <td className="p-2"><input className="border w-full p-1 rounded" placeholder="Transportation" value={editForm.transportaion_name || ''} onChange={e => setEditForm({...editForm, transportaion_name: e.target.value})} /></td>
                          <td className="p-2"><input className="border w-full p-1 rounded" placeholder="Hotel" value={editForm.hotel_name || ''} onChange={e => setEditForm({...editForm, hotel_name: e.target.value})} /></td>
                          <td className="p-2">
                            <input type="date" className="border w-full p-1 rounded" value={editForm.departure_date || ""} onChange={e => setEditForm({...editForm, departure_date: e.target.value})} />
                          </td>
                          <td className="p-2">
                            <input type="time" className="border w-full p-1 rounded" value={editForm.departure_time || ""} onChange={e => setEditForm({...editForm, departure_time: e.target.value})} />
                          </td>
                          <td className="p-2"><input className="border w-full p-1 rounded" placeholder="Transportation" value={editForm.transportation_departure || ''} onChange={e => setEditForm({...editForm, transportation_departure: e.target.value})} /></td>
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
                      
                      {!activeTab.includes("Staying") && (
                        <td className="p-3 text-center font-bold text-slate-700">
                          {getDerivedSide(g)}
                        </td>
                      )}

                      <td className="p-3 text-center">
                        <Button
                          size="icon"
                          variant={g.jain ? "default" : "outline"}
                          className={g.jain ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                          onClick={() => toggleJain(g)}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      </td>
                      {activeTab.includes("Staying") && (
                        <>
                          <td className="p-3 text-center">
                            <Button size="icon" variant={isInEvent(g, "Sangeet") ? "default" : "outline"} className={isInEvent(g, "Sangeet") ? "bg-emerald-600 hover:bg-emerald-700 border-none text-white" : "text-emerald-700"} onClick={() => toggleEventPresence(g, "Sangeet")}>
                              <Check className="w-4 h-4" />
                            </Button>
                          </td>
                          <td className="p-3 text-center">
                            <Button size="icon" variant={isInEvent(g, "Haldi") ? "default" : "outline"} className={isInEvent(g, "Haldi") ? "bg-yellow-500 hover:bg-yellow-600 border-none text-white" : "text-yellow-600"} onClick={() => toggleEventPresence(g, "Haldi")}>
                              <Check className="w-4 h-4" />
                            </Button>
                          </td>
                          <td className="p-3 text-center">
                            <Button size="icon" variant={isInEvent(g, "Reception") ? "default" : "outline"} className={isInEvent(g, "Reception") ? "bg-rose-600 hover:bg-rose-700 border-none text-white" : "text-rose-700"} onClick={() => toggleEventPresence(g, "Reception")}>
                              <Check className="w-4 h-4" />
                            </Button>
                          </td>

                          <td className="p-3 whitespace-nowrap">
                            <div className="flex flex-col gap-1">
                              {(() => {
                                const mobiles = parseMobileNumbers(g.mobile_no);
                                if (mobiles.length === 0) return <span className="text-slate-400">-</span>;
                                return mobiles.map((mobile, idx) => (
                                  <a key={idx} href={`tel:${mobile}`} className="text-emerald-700 hover:underline hover:text-emerald-900 font-medium">
                                    {mobile}
                                  </a>
                                ));
                              })()}
                            </div>
                          </td>

                          <td className="p-3 whitespace-nowrap">{g.arrival_date ? new Date(g.arrival_date).toLocaleDateString("en-GB", {day: "2-digit",month: "2-digit",year: "numeric"}).replace(/\//g, "-") : "-"}</td>
                          <td className="p-3 whitespace-nowrap">{formatTime12hr(g.arrival_time)}</td>
                          <td className="p-3">{g.origin_place || '-'}</td>
                          <td className="p-3">{g.transportaion_name || '-'}</td>
                          <td className="p-3">{g.hotel_name || '-'}</td>
                          <td className="p-3 whitespace-nowrap">{g.departure_date ? new Date(g.departure_date).toLocaleDateString("en-GB", {day: "2-digit",month: "2-digit",year: "numeric"}).replace(/\//g, "-") : "-"}</td>
                          <td className="p-3 whitespace-nowrap">{formatTime12hr(g.departure_time)}</td>
                          <td className="p-3">{g.transportation_departure || '-'}</td>
                        </>
                      )}
                      <td className="p-3 flex gap-1 justify-center">
                        <Button variant="ghost" size="sm" onClick={() => startEditing(g)}><Pencil className="w-4 h-4"/></Button>
                        <Button variant="ghost" size="sm" onClick={() => setGuestToDelete(g.id)}>
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

      <Dialog open={!!guestToDelete} onOpenChange={(open) => !open && setGuestToDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm text-slate-600">Are you sure you want to delete this item? This action cannot be undone.</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setGuestToDelete(null)}>Cancel</Button>
            <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={confirmDelete}>
              Delete Item
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}