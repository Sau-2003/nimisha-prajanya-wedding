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
  // 1. Data State (Stores the lists for all 4 events)
  const [guests, setGuests] = useState<Record<string, GuestEntry[]>>({
    staying: [],
    sangeet: [],
    haldi: [],
    reception: [],
  });

  // 2. UI State
  const [activeTab, setActiveTab] = useState("staying");
  
  // 3. Form State (For adding new rows)
  const [newFamily, setNewFamily] = useState("");
  const [newCount, setNewCount] = useState("");
  const [newRoomNo, setNewRoomNo] = useState("");

  const handleAddGuest = () => {
    if (!newFamily.trim() || !newCount) return;

    const newEntry: GuestEntry = {
      id: Date.now().toString(),
      family: newFamily.trim(),
      count: parseInt(newCount) || 1,
      roomNo: activeTab === "staying" ? newRoomNo.trim() : undefined,
    };

    setGuests({
      ...guests,
      [activeTab]: [...guests[activeTab], newEntry],
    });

    // Reset inputs after adding
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

  const tabs = [
    { id: "staying", name: "Staying", icon: Bed, color: "text-blue-500" },
    { id: "sangeet", name: "Sangeet", icon: Music, color: "text-purple-500" },
    { id: "haldi", name: "Haldi", icon: Sun, color: "text-amber-500" },
    { id: "reception", name: "Reception", icon: Utensils, color: "text-rose-500" },
  ];

  const currentList = guests[activeTab];
  const totalPeople = currentList.reduce((sum, g) => sum + g.count, 0);

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
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row gap-3">
            {activeTab === "staying" && (
              <input
                type="text"
                placeholder="Room No (e.g. 101)"
                className="border p-2 rounded-lg text-sm md:w-32 focus:outline-emerald-500"
                value={newRoomNo}
                onChange={(e) => setNewRoomNo(e.target.value)}
              />
            )}
            <input
              type="text"
              placeholder="Family / Guest Name"
              className="border p-2 rounded-lg text-sm flex-1 focus:outline-emerald-500"
              value={newFamily}
              onChange={(e) => setNewFamily(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddGuest()}
            />
            <input
              type="number"
              placeholder="Total People"
              className="border p-2 rounded-lg text-sm md:w-32 focus:outline-emerald-500"
              value={newCount}
              onChange={(e) => setNewCount(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddGuest()}
              min="1"
            />
            <Button onClick={handleAddGuest} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" /> Add
            </Button>
          </div>

          {/* The Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-slate-200 text-sm text-slate-500">
                  <th className="p-4 font-medium w-20 text-center">Sr No</th>
                  {activeTab === "staying" && <th className="p-4 font-medium w-32">Room No</th>}
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
                    <tr key={guest.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      {/* Sr No is automatically generated here using the index */}
                      <td className="p-4 text-center font-medium text-slate-500">{index + 1}</td>
                      
                      {activeTab === "staying" && (
                        <td className="p-4 font-medium text-slate-700">
                          {guest.roomNo || "-"}
                        </td>
                      )}
                      
                      <td className="p-4 font-medium text-slate-800">{guest.family}</td>
                      
                      <td className="p-4 text-center">
                        <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-medium">
                          {guest.count}
                        </span>
                      </td>
                      
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => handleDelete(guest.id)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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