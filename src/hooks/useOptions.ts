import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

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

const DEFAULT_TABS: TabOption[] = [
  { id: "decorations", label: "Decorations" },
];

export function useOptions() {
  const [tabs, setTabs] = useState<TabOption[]>(DEFAULT_TABS);
  const [activeTab, setActiveTab] = useState<string>("decorations");
  const [items, setItems] = useState<OptionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // 1. Fetch items from Supabase database on load
  useEffect(() => {
    async function fetchOptions() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('event_items')
          .select('*')
          .like('category', 'option_%');

        if (!error && data) {
          // Map DB items to OptionItem interface
          const mappedItems: OptionItem[] = data.map((item) => ({
            id: item.id,
            tabId: item.category.replace('option_', ''),
            caption: item.text || '',
            imageUrl: item.content || undefined,
          }));

          setItems(mappedItems);

          // Extract unique tabs from existing database records
          const dbTabIds = Array.from(new Set(mappedItems.map((i) => i.tabId)));
          const dynamicTabs: TabOption[] = dbTabIds.map((tabId) => ({
            id: tabId,
            label: tabId.charAt(0).toUpperCase() + tabId.slice(1).replace(/-/g, ' '),
          }));

          // Merge default tabs with dynamic DB tabs avoiding duplicates
          setTabs((prev) => {
            const combined = [...prev];
            dynamicTabs.forEach((dt) => {
              if (!combined.some((t) => t.id === dt.id)) {
                combined.push(dt);
              }
            });
            return combined;
          });
        }
      } catch (err) {
        console.error("Failed to load options:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOptions();
  }, []);

  // 2. Add New Tab
  const addTab = (label: string) => {
    const trimmed = label.trim();
    if (!trimmed) return;
    const newId = trimmed.toLowerCase().replace(/\s+/g, "-");

    if (tabs.some((t) => t.id === newId)) {
      alert("A tab with this name already exists.");
      return;
    }

    setTabs((prev) => [...prev, { id: newId, label: trimmed }]);
    setActiveTab(newId);
  };

  // 3. Delete Tab & Clean up items inside it
  const deleteTab = async (tabId: string) => {
    const tabToDelete = tabs.find((t) => t.id === tabId);
    if (!tabToDelete) return;

    if (confirm(`Are you sure you want to delete the "${tabToDelete.label}" tab and all options inside it?`)) {
      const remainingTabs = tabs.filter((t) => t.id !== tabId);
      setTabs(remainingTabs);
      setItems((prev) => prev.filter((item) => item.tabId !== tabId));

      if (activeTab === tabId) {
        setActiveTab(remainingTabs.length > 0 ? remainingTabs[0].id : "");
      }

      // Delete from Supabase DB
      await supabase
        .from('event_items')
        .delete()
        .eq('category', `option_${tabId}`);
    }
  };

  // 4. Upload image & save new Option
  const addOptionItem = async (caption: string, imageFile?: File | null) => {
    if (!activeTab) {
      alert("Please select or create a tab first.");
      return;
    }
    if (!caption.trim() && !imageFile) return;

    let uploadedImageUrl: string | undefined = undefined;

    if (imageFile) {
      try {
        const { data, error: uploadError } = await supabase.storage
          .from('task-images')
          .upload(`options/${Date.now()}_${imageFile.name.replace(/[^a-zA-Z0-9.]/g, '')}`, imageFile);

        if (uploadError) {
          alert(`Storage Error: ${uploadError.message}`);
          return;
        }

        if (data?.path) {
          const { data: urlData } = supabase.storage.from('task-images').getPublicUrl(data.path);
          uploadedImageUrl = urlData.publicUrl;
        }
      } catch (err) {
        console.error("Upload failed:", err);
      }
    }

    // Save entry to Supabase DB
    const { data: dbData, error: dbError } = await supabase
      .from('event_items')
      .insert({
        category: `option_${activeTab}`,
        text: caption.trim() || 'Untitled Option',
        content: uploadedImageUrl || null,
      })
      .select()
      .single();

    if (dbError) {
      alert(`Database Error: ${dbError.message}`);
      return;
    }

    const newItem: OptionItem = {
      id: dbData ? dbData.id : Date.now().toString(),
      tabId: activeTab,
      caption: caption.trim() || "Untitled Option",
      imageUrl: uploadedImageUrl,
    };

    setItems((prev) => [newItem, ...prev]);
  };

  // 5. Update existing option
  const updateOptionItem = async (id: string, caption: string, imageFile?: File | null, removeImage = false) => {
    let updatedUrl: string | undefined = undefined;

    if (imageFile) {
      try {
        const { data, error: uploadError } = await supabase.storage
          .from('task-images')
          .upload(`options/${Date.now()}_${imageFile.name.replace(/[^a-zA-Z0-9.]/g, '')}`, imageFile);

        if (!uploadError && data?.path) {
          const { data: urlData } = supabase.storage.from('task-images').getPublicUrl(data.path);
          updatedUrl = urlData.publicUrl;
        }
      } catch (err) {
        console.error("Upload error during update:", err);
      }
    }

    const existingItem = items.find((i) => i.id === id);
    let finalUrl = existingItem?.imageUrl;
    if (removeImage) finalUrl = undefined;
    if (updatedUrl) finalUrl = updatedUrl;

    // Update in Supabase DB
    await supabase
      .from('event_items')
      .update({
        text: caption.trim() || "Untitled Option",
        content: finalUrl || null,
      })
      .eq('id', id);

    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return {
          ...item,
          caption: caption.trim() || "Untitled Option",
          imageUrl: finalUrl,
        };
      })
    );
  };

  // 6. Delete option
  const deleteOptionItem = async (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    await supabase.from('event_items').delete().eq('id', id);
  };

  return {
    tabs,
    activeTab,
    setActiveTab,
    addTab,
    deleteTab,
    items: items.filter((item) => item.tabId === activeTab),
    loading,
    addOptionItem,
    updateOptionItem,
    deleteOptionItem,
    selectedPhoto,
    setSelectedPhoto,
  };
}