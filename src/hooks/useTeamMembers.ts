"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

const DEFAULT_TEAM_MEMBERS = ["Manish", "Vini", "Saumya", "Nimisha"];

export function useTeamMembers() {
  const [teamMembers, setTeamMembers] = useState<string[]>(DEFAULT_TEAM_MEMBERS);
  const [loading, setLoading] = useState(true);

  const fetchTeamMembers = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('team_members').select('*');
      if (error) {
        // If table doesn't exist yet, fallback to defaults smoothly
        setTeamMembers(DEFAULT_TEAM_MEMBERS);
        setLoading(false);
        return;
      }
      if (data && data.length > 0) {
        setTeamMembers(data.map((row: any) => row.name));
      } else {
        // Seed defaults if empty
        for (const name of DEFAULT_TEAM_MEMBERS) {
          await supabase.from('team_members').insert([{ name }]);
        }
        setTeamMembers(DEFAULT_TEAM_MEMBERS);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);

  const addTeamMember = async (name: string) => {
    const trimmed = name.trim();
    if (trimmed && !teamMembers.includes(trimmed)) {
      const updated = [...teamMembers, trimmed];
      setTeamMembers(updated);
      await supabase.from('team_members').insert([{ name: trimmed }]);
    }
  };

  const updateTeamMember = async (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (trimmed && !teamMembers.includes(trimmed)) {
      setTeamMembers(prev => prev.map(m => m === oldName ? trimmed : m));
      await supabase.from('team_members').update({ name: trimmed }).eq('name', oldName);
    }
  };

  const deleteTeamMember = async (name: string) => {
    setTeamMembers(prev => prev.filter(m => m !== name));
    await supabase.from('team_members').delete().eq('name', name);
  };

  return { teamMembers, loading, addTeamMember, updateTeamMember, deleteTeamMember, refreshTeam: fetchTeamMembers };
}