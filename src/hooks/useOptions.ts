import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface OptionItem {
  id: string;
  tabId: string;
  caption: string;
  imageUrl?: string;
}

export interface TabOption {
  id: string;
  label: string;
}

export function useOptions() {
  const [tabs, setTabs] = useState<TabOption[]>([]);
  const [activeTab, setActiveTab] = useState("");
  const [items, setItems] = useState<OptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);

    try {
      // Load tabs
      const { data: tabData, error: tabError } = await supabase
        .from("option_tabs")
        .select("*")
        .order("created_at");

      if (tabError) throw tabError;

      const loadedTabs: TabOption[] =
        tabData?.map((tab) => ({
          id: tab.id,
          label: tab.label,
        })) ?? [];

      setTabs(loadedTabs);

      if (loadedTabs.length > 0) {
        setActiveTab((prev) => prev || loadedTabs[0].id);
      }

      // Load items
      const { data: itemData, error: itemError } = await supabase
        .from("event_items")
        .select("*")
        .like("category", "option_%");

      if (itemError) throw itemError;

      const loadedItems: OptionItem[] =
        itemData?.map((item) => ({
          id: item.id,
          tabId: item.category.replace("option_", ""),
          caption: item.text ?? "",
          imageUrl: item.content ?? undefined,
        })) ?? [];

      setItems(loadedItems);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const addTab = async (label: string) => {
    const trimmed = label.trim();
    if (!trimmed) return;

    const id = trimmed
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    if (tabs.some((t) => t.id === id)) {
      alert("Tab already exists.");
      return;
    }

    const { error } = await supabase.from("option_tabs").insert({
      id,
      label: trimmed,
    });

    if (error) {
      alert(error.message);
      return;
    }

    const newTab = {
      id,
      label: trimmed,
    };

    setTabs((prev) => [...prev, newTab]);
    setActiveTab(id);
  };

  const deleteTab = async (tabId: string) => {
    const tab = tabs.find((t) => t.id === tabId);
    if (!tab) return;

    if (
      !confirm(
        `Delete "${tab.label}" and all options inside it?`
      )
    )
      return;

    await supabase.from("option_tabs").delete().eq("id", tabId);

    await supabase
      .from("event_items")
      .delete()
      .eq("category", `option_${tabId}`);

    const remaining = tabs.filter((t) => t.id !== tabId);

    setTabs(remaining);

    setItems((prev) =>
      prev.filter((item) => item.tabId !== tabId)
    );

    if (activeTab === tabId) {
      setActiveTab(remaining[0]?.id ?? "");
    }
  };

  const renameTab = (id: string, newLabel: string) => {
    setTabs(tabs.map(tab => tab.id === id ? { ...tab, label: newLabel } : tab));
  };

  const uploadImage = async (file: File) => {
    const filename = `options/${Date.now()}_${file.name.replace(
      /[^a-zA-Z0-9.]/g,
      ""
    )}`;

    const { data, error } = await supabase.storage
      .from("task-images")
      .upload(filename, file);

    if (error) throw error;

    const { data: url } = supabase.storage
      .from("task-images")
      .getPublicUrl(data.path);

    return url.publicUrl;
  };

  const addOptionItem = async (
    caption: string,
    imageFile?: File | null
  ) => {
    if (!activeTab) {
      alert("Please create a tab first.");
      return;
    }

    let imageUrl: string | undefined;

    if (imageFile) {
      imageUrl = await uploadImage(imageFile);
    }

    const { data, error } = await supabase
      .from("event_items")
      .insert({
        category: `option_${activeTab}`,
        text: caption || "Untitled Option",
        content: imageUrl ?? null,
      })
      .select()
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    setItems((prev) => [
      {
        id: data.id,
        tabId: activeTab,
        caption: caption || "Untitled Option",
        imageUrl,
      },
      ...prev,
    ]);
  };

  const updateOptionItem = async (
    id: string,
    caption: string,
    imageFile?: File | null,
    removeImage = false
  ) => {
    const existing = items.find((i) => i.id === id);

    if (!existing) return;

    let imageUrl = existing.imageUrl;

    if (removeImage) imageUrl = undefined;

    if (imageFile) {
      imageUrl = await uploadImage(imageFile);
    }

    const { error } = await supabase
      .from("event_items")
      .update({
        text: caption || "Untitled Option",
        content: imageUrl ?? null,
      })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              caption: caption || "Untitled Option",
              imageUrl,
            }
          : item
      )
    );
  };

  const deleteOptionItem = async (id: string) => {
    await supabase.from("event_items").delete().eq("id", id);

    setItems((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  return {
    tabs,
    activeTab,
    setActiveTab,
    renameTab,
    loading,
    selectedPhoto,
    setSelectedPhoto,
    addTab,
    deleteTab,
    addOptionItem,
    updateOptionItem,
    deleteOptionItem,
    items: items.filter((item) => item.tabId === activeTab),
  };
}