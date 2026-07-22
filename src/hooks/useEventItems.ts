import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export type CategoryId = 'tasks' | 'taskDone' | 'itemsNeeded' | 'pujaItems' | 'games' | 'vendors' | 'ideas' | 'notes';

export type WorkspaceItem = {
  id: string;
  content: string;
  dueDate?: string;
  assignedTo?: string; // Added assignedTo property
  imageUrl?: string;
  created_at: string;
};

type GroupedItems = Record<CategoryId, WorkspaceItem[]>;

export function useEventItems(eventName: string) {
  const [items, setItems] = useState<GroupedItems>({
    tasks: [], taskDone: [], itemsNeeded: [], pujaItems: [], 
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
      tasks: [], taskDone: [], itemsNeeded: [], pujaItems: [], 
      games: [], vendors: [], ideas: [], notes: []
    };

    data?.forEach((row) => {
      const category = row.category as CategoryId;
      if (grouped[category]) {
        grouped[category].push({
          id: row.id,
          content: row.content || "",
          dueDate: row.due_date || undefined,
          assignedTo: row.assigned_to || undefined, // Map column
          imageUrl: row.image_url || undefined,
          created_at: row.created_at || "",
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
          assigned_to: payload.assignedTo || null, // Save assigned_to
          image_url: payload.imageUrl || null
        },
      ]);

    if (error) {
      console.error("DETAILED INSERT ERROR:", error.message);
      alert(`Failed to save: ${error.message}`);
      return;
    }
    
    fetchItems();
  };

  const updateItem = async (id: string, updates: Partial<WorkspaceItem>) => {
    const { error } = await supabase
      .from("event_items")
      .update({
        content: updates.content,
        due_date: updates.dueDate || null,
        assigned_to: updates.assignedTo || null, // Update assigned_to
        image_url: updates.imageUrl || null
      })
      .eq('id', id);
    
    if (!error) await fetchItems();
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