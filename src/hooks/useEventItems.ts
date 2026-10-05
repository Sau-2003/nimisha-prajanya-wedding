import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export type CategoryId = 'tasks' | 'taskDone' | 'itemsNeeded' | 'itemsBrought' | 'pujaItems' | 'pujaItemsBrought' | 'games' | 'vendors' | 'ideas' | 'notes';

export type MediaItem = {
  url: string;
  type: string;
  caption?: string;
};

export type WorkspaceItem = {
  id: string;
  content: string;
  dueDate?: string;
  assignedTo?: string;
  imageUrl?: string;
  imageCaption?: string | null;
  mediaAttachments?: MediaItem[]; // <-- Supports multiple media files
  created_at: string;
  is_private?: boolean;       
  allowed_users?: string[];
};

type GroupedItems = Record<CategoryId, WorkspaceItem[]>;

export function useEventItems(eventName: string) {
  const [items, setItems] = useState<GroupedItems>({
    tasks: [], taskDone: [], itemsNeeded: [], itemsBrought: [], pujaItems: [], pujaItemsBrought: [],
    games: [], vendors: [], ideas: [], notes: []
  });
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('event_items')
      .select('*')
      .eq('event_name', eventName);

    if (error) {
      console.error("Error fetching items:", error);
      setLoading(false);
      return;
    }

    const grouped: GroupedItems = {
      tasks: [], taskDone: [], itemsNeeded: [], itemsBrought: [], pujaItems: [], pujaItemsBrought: [],
      games: [], vendors: [], ideas: [], notes: []
    };

    data?.forEach((row) => {
      const category = row.category as CategoryId;
      if (grouped[category]) {
        grouped[category].push({
          id: row.id,
          content: row.content || "",
          dueDate: row.due_date || undefined,
          assignedTo: row.assigned_to || undefined,
          imageUrl: row.image_url || undefined,
          imageCaption: row.image_caption || undefined,
          mediaAttachments: row.media_attachments || [], // <-- Mapping array
          created_at: row.created_at || "",
          is_private: row.is_private || false,
          allowed_users: row.allowed_users || [],
        });
      }
    });

    setItems(grouped);
    setLoading(false);
  }, [eventName]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const addItem = async (category: CategoryId, payload: Omit<WorkspaceItem, "id">) => {
    const { error } = await supabase
      .from("event_items")
      .insert([
        {
          event_name: eventName,
          category: category,
          content: payload.content || "No content",
          due_date: payload.dueDate || null,
          assigned_to: payload.assignedTo || null,
          image_url: payload.imageUrl || null,
          image_caption: payload.imageCaption || null,
          media_attachments: payload.mediaAttachments || [], // <-- Saving array
          is_private: payload.is_private || false,
          allowed_users: payload.allowed_users || []
        },
      ]);

    if (error) {
      console.error("DETAILED INSERT ERROR:", error.message);
      alert(`Failed to save: ${error.message}`);
      return;
    }
    
    await fetchItems();
  };

  const updateItem = async (id: string, updates: Partial<WorkspaceItem>) => {
    const dbUpdates: any = {};
    if (updates.content !== undefined) dbUpdates.content = updates.content;
    if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
    if (updates.assignedTo !== undefined) dbUpdates.assigned_to = updates.assignedTo;
    if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;
    if (updates.imageCaption !== undefined) dbUpdates.image_caption = updates.imageCaption; 
    if (updates.mediaAttachments !== undefined) dbUpdates.media_attachments = updates.mediaAttachments; // <-- Updating array
    if (updates.is_private !== undefined) dbUpdates.is_private = updates.is_private;       
    
    if (updates.allowed_users !== undefined) {
      dbUpdates.allowed_users = updates.allowed_users; 
    }

    const { error } = await supabase
      .from('event_items')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      console.error("Error updating item:", error.message);
      alert(`Failed to update: ${error.message}`);
    } else {
      await fetchItems(); 
    }
  };

  const moveItem = async (id: string, newCategory: CategoryId) => {
    await supabase.from('event_items').update({ category: newCategory }).eq('id', id);
    await fetchItems();
  };

  const deleteItem = async (id: string) => {
    await supabase.from('event_items').delete().eq('id', id);
    await fetchItems();
  };

  return { items, loading, addItem, updateItem, moveItem, deleteItem };
}