"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface Item {
  id: string;
  name: string;
  caption?: string;
}

export interface Category {
  id: string;
  name: string;
  caption?: string;
  items: Item[];
}

export interface Tab {
  id: string;
  tab_name: string;
  caption?: string;
  categories: Category[];
}

export function useMenus() {
  const [menus, setMenus] = useState<Tab[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMenus = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("menus").select("*").order("created_at", { ascending: true });
    if (error) {
      console.error("Error fetching menus from Supabase:", error);
    } else if (data) {
      setMenus(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  const addTab = async (tab_name: string, caption = "") => {
    const { data, error } = await supabase
      .from("menus")
      .insert([{ tab_name, caption, categories: [] }])
      .select();

    if (error) {
      console.error("Error adding tab to Supabase:", error);
      return null;
    }

    await fetchMenus();
    return data && data.length > 0 ? data[0] : null;
  };

  const updateTab = async (id: string, updates: Partial<Tab>) => {
    const { error } = await supabase
      .from("menus")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error("Error updating tab in Supabase:", error);
    } else {
      setMenus((prev) =>
        prev.map((tab) => (tab.id === id ? { ...tab, ...updates } : tab))
      );
    }
  };

  const deleteTab = async (id: string) => {
    const { error } = await supabase.from("menus").delete().eq("id", id);
    if (error) {
      console.error("Error deleting tab from Supabase:", error);
    } else {
      setMenus((prev) => prev.filter((tab) => tab.id !== id));
    }
  };

  return { menus, loading, addTab, updateTab, deleteTab, refetch: fetchMenus };
}