import { WorkspaceItem } from './useEventItems'; // Import your existing interface

// Define an interface for the schedule item that includes event_name
export interface ScheduleItem extends WorkspaceItem {
  event_name: string;
  due_date: string;
}

export function sortSchedule(allItems: ScheduleItem[]) {
  return [...allItems]
    .filter((item: ScheduleItem) => item.due_date)
    .sort((a: ScheduleItem, b: ScheduleItem) => {
      // 1. Sort by Date
      const dateA = new Date(a.due_date).getTime();
      const dateB = new Date(b.due_date).getTime();
      
      const dateComparison = dateA - dateB;
      
      if (dateComparison !== 0) return dateComparison;
      
      // 2. Sort by Event Name
      return a.event_name.localeCompare(b.event_name);
    });
}