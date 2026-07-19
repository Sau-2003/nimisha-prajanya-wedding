import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export type CategoryId = 'tasks' | 'taskDone' | 'itemsNeeded' | 'pujaItems' | 'games' | 'vendors' | 'ideas' | 'notes';

export type WorkspaceItem = {
  id: string;
  content: string;
  dueDate?: string;
  imageUrl?: string; 
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
          imageUrl: row.image_url || undefined,
        });
      }
    });

    setItems(grouped);
    setLoading(false);
  }, [eventName]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  // FIXED addItem function
  const addItem = async (category: CategoryId, payload: Omit<WorkspaceItem, "id">) => {
  console.log("Attempting to insert:", { event_name: eventName, category, content: payload.content });
  
  const { data, error } = await supabase
    .from("event_items")
    .insert([
      {
        event_name: eventName,
        category: category,
        content: payload.content || "No content", // Ensure a value is sent
        due_date: payload.dueDate || null,
        image_url: payload.imageUrl || null
      },
    ])
    .select();

  if (error) {
    console.error("DETAILED INSERT ERROR:", error); // This will tell us if it's a field error
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


