"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Bed, Music, Sun, Utensils, Plus, Trash2 } from "lucide-react";

// The structure of a single guest entry
interface GuestEntry {
  id: string;
  family: string;
  count: number;
  roomNo?: string;
}

export default function GuestsPage() {
  // 1. Data State
  const [guests, setGuests] = useState<Record<string, GuestEntry[]>>({
    "Nimisha's Staying": [],
    "Prajanya's Side": [],
    "Sangeet": [],
    "Haldi": [],
    "Reception": [],
  });

  // 2. UI State
  const [activeTab, setActiveTab] = useState("Nimisha's Staying");
  const [addToEvents, setAddToEvents] = useState(false); // Checkbox state
  
  // 3. Form State
  const [newFamily, setNewFamily] = useState("");
  const [newCount, setNewCount] = useState("");
  const [newRoomNo, setNewRoomNo] = useState("");

  // Helper boolean: True if the current tab is one of the staying tabs
  const isStayingTab = activeTab === "Nimisha's Staying" || activeTab === "Prajanya's Side";

  const handleAddGuest = () => {
    if (!newFamily.trim() || !newCount) return;

    const baseId = Date.now().toString();
    const countNum = parseInt(newCount) || 1;

    const newEntry: GuestEntry = {
      id: baseId,
      family: newFamily.trim(),
      count: countNum,
      // Apply room number if we are on either staying tab
      roomNo: isStayingTab ? newRoomNo.trim() : undefined,
    };

    const newGuestsState = { ...guests };

    // Add to the currently selected tab
    newGuestsState[activeTab] = [...newGuestsState[activeTab], newEntry];

    // If checkbox is checked, copy them to the 3 main events
    if (addToEvents && isStayingTab) {
      const eventTabs = ["Sangeet", "Haldi", "Reception"];
      eventTabs.forEach((evt) => {
        newGuestsState[evt] = [
          ...newGuestsState[evt], 
          { id: baseId + evt, family: newFamily.trim(), count: countNum } // Room No excluded
        ];
      });
    }

    setGuests(newGuestsState);

    // Reset inputs
    setNewFamily("");
    setNewCount("");
    setNewRoomNo("");
  };

  const handleDelete = (id: string) => {
    setGuests({
      ...guests,
      [activeTab]: guests[activeTab].filter((g) => g.id !== id),
    });
  };

  // 4. Inline Edit Function
  const handleUpdateGuest = (id: string, field: keyof GuestEntry, value: string | number) => {
    setGuests({
      ...guests,
      [activeTab]: guests[activeTab].map((g) => 
        g.id === id ? { ...g, [field]: value } : g
      ),
    });
  };

  const tabs = [
    { id: "Nimisha's Staying", name: "Nimisha's Staying", icon: Bed, color: "text-blue-500" },
    { id: "Prajanya's Side", name: "Prajanya's Side", icon: Users, color: "text-indigo-500" },
    { id: "Sangeet", name: "Sangeet", icon: Music, color: "text-purple-500" },
    { id: "Haldi", name: "Haldi", icon: Sun, color: "text-amber-500" },
    { id: "Reception", name: "Reception", icon: Utensils, color: "text-rose-500" },
  ];

  const currentList = guests[activeTab];
  const totalPeople = currentList.reduce((sum, g) => sum + (Number(g.count) || 0), 0);

  return (
    <div className="p-6 md:p-12 max-w-6xl mx-auto h-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-emerald-900 flex items-center gap-3">
          <Users className="w-8 h-8 text-emerald-600" />
          Guest Management
        </h1>
        <p className="text-slate-500 mt-1">Track family headcounts and room assignments across events.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto mb-6 pb-2 border-b border-slate-200">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-t-xl font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-white border-t border-x border-slate-200 text-emerald-800 shadow-sm relative top-[1px]"
                  : "bg-slate-50 text-slate-500 hover:bg-slate-100"
              }`}
            >
              <tab.icon className={`w-4 h-4 ${isActive ? tab.color : "text-slate-400"}`} />
              {tab.name}
              <span className={`ml-2 text-xs py-0.5 px-2 rounded-full ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                {guests[tab.id].length}
              </span>
            </button>
          );
        })}
      </div>

      <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
          <CardTitle className="text-lg flex justify-between items-center text-slate-800">
            <span>{tabs.find(t => t.id === activeTab)?.name} Guest List</span>
            <span className="text-sm font-normal bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100">
              Total People: <strong>{totalPeople}</strong>
            </span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-0">
          {/* Quick Add Row */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col gap-3">
            <div className="flex flex-col md:flex-row gap-3">
              {isStayingTab && (
                <input
                  type="text"
                  placeholder="Room No (e.g. 101)"
                  className="border p-2 rounded-lg text-sm md:w-32 focus:outline-emerald-500 bg-white"
                  value={newRoomNo}
                  onChange={(e) => setNewRoomNo(e.target.value)}
                />
              )}
              <input
                type="text"
                placeholder="Family / Guest Name"
                className="border p-2 rounded-lg text-sm flex-1 focus:outline-emerald-500 bg-white"
                value={newFamily}
                onChange={(e) => setNewFamily(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddGuest()}
              />
              <input
                type="number"
                placeholder="Total People"
                className="border p-2 rounded-lg text-sm md:w-32 focus:outline-emerald-500 bg-white"
                value={newCount}
                onChange={(e) => setNewCount(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddGuest()}
                min="1"
              />
              <Button onClick={handleAddGuest} className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-2" /> Add
              </Button>
            </div>
            
            {/* Checkbox to add to all other events */}
            {isStayingTab && (
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer w-fit">
                <input 
                  type="checkbox" 
                  checked={addToEvents} 
                  onChange={(e) => setAddToEvents(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
                Automatically copy to Sangeet, Haldi, & Reception lists
              </label>
            )}
          </div>

          {/* The Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-slate-200 text-sm text-slate-500">
                  <th className="p-4 font-medium w-20 text-center">Sr No</th>
                  {isStayingTab && <th className="p-4 font-medium w-32">Room No</th>}
                  <th className="p-4 font-medium">Family Name</th>
                  <th className="p-4 font-medium w-40 text-center">No. of People</th>
                  <th className="p-4 font-medium w-20 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400 italic">
                      No guests added to this list yet.
                    </td>
                  </tr>
                ) : (
                  currentList.map((guest, index) => (
                    <tr key={guest.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                      <td className="p-4 text-center font-medium text-slate-400">{index + 1}</td>
                      
                      {/* Editable Room No */}
                      {isStayingTab && (
                        <td className="p-2">
                          <input
                            type="text"
                            value={guest.roomNo || ""}
                            onChange={(e) => handleUpdateGuest(guest.id, 'roomNo', e.target.value)}
                            placeholder="-"
                            className="w-full bg-transparent border border-transparent hover:border-slate-300 focus:border-emerald-500 focus:bg-white rounded px-2 py-1.5 transition-all outline-none text-slate-700 font-medium"
                          />
                        </td>
                      )}
                      
                      {/* Editable Family Name */}
                      <td className="p-2">
                        <input
                          type="text"
                          value={guest.family}
                          onChange={(e) => handleUpdateGuest(guest.id, 'family', e.target.value)}
                          className="w-full bg-transparent border border-transparent hover:border-slate-300 focus:border-emerald-500 focus:bg-white rounded px-2 py-1.5 transition-all outline-none text-slate-800 font-medium"
                        />
                      </td>
                      
                      {/* Editable Headcount */}
                      <td className="p-2 text-center">
                        <input
                          type="number"
                          value={guest.count}
                          onChange={(e) => handleUpdateGuest(guest.id, 'count', parseInt(e.target.value) || "")}
                          className="w-20 mx-auto text-center bg-slate-100 border border-transparent hover:border-slate-300 focus:border-emerald-500 focus:bg-white rounded px-2 py-1 transition-all outline-none text-slate-700 font-medium"
                          min="1"
                        />
                      </td>
                      
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => handleDelete(guest.id)}
                          className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          title="Remove Guest"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}