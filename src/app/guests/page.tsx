"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Bed, Music, Sun, Utensils, Plus, Trash2, ArrowUpDown } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useGuests } from "@/hooks/useGuests";

export default function GuestsPage() {
  const { guests: dbGuests, loading, fetchData } = useGuests();
  const [activeTab, setActiveTab] = useState("Nimisha's Side Staying");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"family" | "count">("family");

  // New Guest State
  const [newGuest, setNewGuest] = useState({ family: "", count: "", room: "", hotel: "", arrival: "", origin: "" });

  const isStayingTab = activeTab.includes("Staying");

  // Filter & Sort Logic
  const filteredGuests = useMemo(() => {
    let list = dbGuests.filter((g) => g.tab_category === activeTab);
    
    if (search) {
      list = list.filter(g => g.family.toLowerCase().includes(search.toLowerCase()));
    }
    
    return list.sort((a, b) => {
      if (sortBy === "count") return b.count - a.count;
      return a.family.localeCompare(b.family);
    });
  }, [dbGuests, activeTab, search, sortBy]);

  const handleAddGuest = async (copyToEvents = false) => {
    if (!newGuest.family || !newGuest.count) return;

    // Define the base entry object
    const baseEntry = {
      tab_category: activeTab,
      family: newGuest.family,
      count: parseInt(newGuest.count),
      room_no: newGuest.room || "",
      hotel_name: newGuest.hotel || "",
      arrival_date: newGuest.arrival || null,
      origin_place: newGuest.origin || ""
    };

    const entries = [baseEntry];

    // If copying to event tabs, use the same object structure with default empty values
    if (copyToEvents && isStayingTab) {
      ["Sangeet", "Haldi", "Reception"].forEach(evt => {
        entries.push({
          tab_category: evt,
          family: newGuest.family,
          count: parseInt(newGuest.count),
          room_no: "", // Required to match the type
          hotel_name: "", // Required to match the type
          arrival_date: null, // Required to match the type
          origin_place: "" // Required to match the type
        });
      });
    }

    await supabase.from("guests").insert(entries);
    fetchData();
    // Reset state...
    setNewGuest({ family: "", count: "", room: "", hotel: "", arrival: "", origin: "" });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Search and Sort UI */}
      <div className="flex gap-4 mb-6">
        <input 
          placeholder="Search family..." 
          className="border p-2 rounded flex-1"
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button onClick={() => setSortBy(sortBy === "family" ? "count" : "family")}>
          <ArrowUpDown className="w-4 h-4 mr-2" /> Sort by {sortBy}
        </Button>
      </div>

      {/* Inputs for Staying Tabs */}
      {isStayingTab && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 bg-slate-50 p-4 rounded-lg">
          <input placeholder="Family Name" className="border p-2 rounded" onChange={e => setNewGuest({...newGuest, family: e.target.value})} />
          <input type="number" placeholder="Count" className="border p-2 rounded" onChange={e => setNewGuest({...newGuest, count: e.target.value})} />
          <input placeholder="Hotel" className="border p-2 rounded" onChange={e => setNewGuest({...newGuest, hotel: e.target.value})} />
          <input type="date" className="border p-2 rounded" onChange={e => setNewGuest({...newGuest, arrival: e.target.value})} />
          <input placeholder="Origin" className="border p-2 rounded" onChange={e => setNewGuest({...newGuest, origin: e.target.value})} />
          <Button onClick={() => handleAddGuest(true)}>Add & Copy</Button>
        </div>
      )}

      {/* Table Display */}
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b bg-slate-100">
            <th className="p-3">Family</th>
            <th className="p-3">Count</th>
            {isStayingTab && <>
              <th className="p-3">Hotel</th>
              <th className="p-3">Arrival</th>
              <th className="p-3">Origin</th>
            </>}
            <th className="p-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredGuests.map(g => (
            <tr key={g.id} className="border-b">
              <td className="p-3">{g.family}</td>
              <td className="p-3">{g.count}</td>
              {isStayingTab && <>
                <td className="p-3">{g.hotel_name}</td>
                <td className="p-3">{g.arrival_date}</td>
                <td className="p-3">{g.origin_place}</td>
              </>}
              <td className="p-3">
                <Button variant="ghost" onClick={() => supabase.from("guests").delete().eq("id", g.id).then(fetchData)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}