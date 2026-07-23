"use client";

import { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Plus, X, FileText, Edit2, Check, Trash2, ChevronRight, FileSpreadsheet, ExternalLink, SquareMenu, Eye
} from 'lucide-react';
import { useMenus, Tab } from '@/hooks/useMenus';

const PREDEFINED_MENU: Record<string, string[]> = {
  "Welcome Drink": ["Shirley Temple", "Virgin Watermelon Margarita", "Mint Mojito", "Fruit Punch", "Mango Mule", "Strawberry Watermelon Margarita"],
  "Soup": ["Tomato Soup", "Sweet Corn Soup", "Cream Of Mushroom Soup", "Manchow Soup", "Hot N Sour Soup"],
  "Salad": ["Garden Fresh Salad", "Pasta Salad", "Russian Salad", "Cucumber Salad"],
  "Starter": ["Paneer Banjara Tikka", "Hara Bhara Kebab", "Paneer 65", "Spring Roll", "Crispy Corn"],
  "Oriental & Thai Food Counter": ["Veg Hakka Noodles", "Veg Manchurian Gravy", "Veg Fried Rice"],
  "Continental Food Counter": ["Baked Vegetables", "Penne Arabiata Pasta", "Macaroni Alfredo"],
  "Chat Counter": ["Dahi Poori", "Aloo Tikki", "Pani Poori", "Dahi Bhalla"],
  "South Indian": ["Idley With Sambhar & Chutney", "Masala Dosa", "Plain Dosa"],
  "Paneer Dish": ["Paneer Butter Masala", "Kadhai Paneer", "Palak Paneer", "Matar Paneer"],
  "Sabji": ["Mix Vegetable", "Malai Kofta", "Bhindi-Do-Pyaza"],
  "Dal/Kadhi": ["Yello Dal Tadka", "Dal Makhani", "Panjabi Kadhi"],
  "Rice": ["Steam Rice", "Jeera Rice", "Vegetable Biryani"],
  "Assorted Indian Breads": ["Roti", "Naan", "Paratha", "Miss Roti", "Lachha Paratha"],
  "Indian Dessert": ["Gulab Jamun", "Gajar Ka Halwa", "Rasmalai", "Jalebi"],
  "Choice Of Ice-Cream": ["Vanilla", "Strawberry", "Butter Scotch", "Mango"]
};

export default function MenuPage() {
  const { menus, loading, addTab, updateTab, deleteTab } = useMenus();
  
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editTabName, setEditTabName] = useState("");
  const [editTabCaption, setEditTabCaption] = useState("");

  const [selectedCategoryName, setSelectedCategoryName] = useState("");
  const [customCategoryName, setCustomCategoryName] = useState("");
  const [categoryCaption, setCategoryCaption] = useState("");

  const [newItemNames, setNewItemNames] = useState<{ [categoryId: string]: string }>({});
  const [newItemCaptions, setNewItemCaptions] = useState<{ [categoryId: string]: string }>({});

  // Safely set active tab on load if none selected
  useMemo(() => {
    if (!activeTabId && menus.length > 0) {
      setActiveTabId(menus[0].id);
    }
  }, [menus, activeTabId]);

  const activeTab = menus.find(t => t.id === activeTabId);

  const handleAddTab = async () => {
    const defaultName = `New Menu ${menus.length + 1}`;
    const newTab = await addTab(defaultName);
    
    if (newTab) {
      setActiveTabId(newTab.id);
      setEditingTabId(newTab.id);
      setEditTabName(""); 
      setEditTabCaption("");
    }
  };

  const handleDeleteTab = async (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteTab(tabId);
    if (activeTabId === tabId) setActiveTabId(null);
  };

  const saveTabName = async (tabId: string) => {
    const tabToUpdate = menus.find(t => t.id === tabId);
    if (!tabToUpdate) return;

    const newName = editTabName.trim() || tabToUpdate.tab_name;
    const newCaption = editTabCaption !== undefined ? editTabCaption.trim() : (tabToUpdate.caption || "");

    await updateTab(tabId, { tab_name: newName, caption: newCaption });
    setEditingTabId(null);
  };

  const handleAddCategory = async () => {
    const categoryToAdd = customCategoryName.trim() || selectedCategoryName;
    if (!activeTab || !categoryToAdd) return;
    
    const newCategories = [...activeTab.categories, { 
      id: crypto.randomUUID(), 
      name: categoryToAdd, 
      caption: categoryCaption.trim(), 
      items: [] 
    }];

    await updateTab(activeTab.id, { categories: newCategories });
    
    setSelectedCategoryName("");
    setCustomCategoryName("");
    setCategoryCaption("");
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!activeTab) return;
    const newCategories = activeTab.categories.filter(c => c.id !== categoryId);
    await updateTab(activeTab.id, { categories: newCategories });
  };

  const handleAddItem = async (categoryId: string) => {
    const itemName = newItemNames[categoryId];
    const itemCaption = newItemCaptions[categoryId];
    
    if (!activeTab || !itemName?.trim()) return;

    const newCategories = activeTab.categories.map(cat => {
      if (cat.id === categoryId) {
        return { 
          ...cat, 
          items: [...cat.items, { id: crypto.randomUUID(), name: itemName, caption: itemCaption?.trim() }] 
        };
      }
      return cat;
    });

    await updateTab(activeTab.id, { categories: newCategories });
    setNewItemNames({ ...newItemNames, [categoryId]: "" });
    setNewItemCaptions({ ...newItemCaptions, [categoryId]: "" });
  };

  const handleDeleteItem = async (categoryId: string, itemId: string) => {
    if (!activeTab) return;
    const newCategories = activeTab.categories.map(cat => {
      if (cat.id === categoryId) {
        return { ...cat, items: cat.items.filter(i => i.id !== itemId) };
      }
      return cat;
    });
    await updateTab(activeTab.id, { categories: newCategories });
  };

  const exportToGoogleSheets = async () => {
    const payload = menus.map((tab) => {
      const rows: any[] = [];
      
      tab.categories.forEach(cat => {
        rows.push({
          "Dish/Category": `[CATEGORY] ${cat.name}`,
          "Notes/Caption": cat.caption || "-"
        });

        cat.items.forEach(item => {
          rows.push({
            "Dish/Category": item.name,
            "Notes/Caption": item.caption || "-"
          });
        });

        rows.push({ "Dish/Category": "", "Notes/Caption": "" });
      });

      return {
        sheetName: tab.tab_name,
        rows: rows
      };
    });

    try {
      const response = await fetch("/api/export-menu-sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.text();
      if (response.ok) {
        alert("Menu Exported to Google Sheet successfully!");
      } else {
        alert(result);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to export Google Sheet");
    }
  };

  if (loading) return <div className="p-12 text-center text-emerald-600">Loading Menus...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-emerald-900 flex items-center gap-3">
            <SquareMenu className="w-8 h-8 text-emerald-600" />
            Menu Management
          </h1>
          <p className="mt-2 text-slate-500">
            Build event menus.
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <a 
            href="/VEG DETAIL MENU 2026-27.pdf" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full sm:w-auto"
          >
            <Button variant="outline" className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 w-full flex gap-2">
              <Eye className="w-4 h-4" /> View PDF Menu
            </Button>
          </a>
          <a 
            href="https://docs.google.com/spreadsheets/d/1e108RDQAQ8-F1ScoI7z4bqSXKmgI1k7B/edit?gid=784207240#gid=784207240" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full sm:w-auto"
          >
            <Button variant="outline" className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 w-full flex gap-2">
              <ExternalLink className="w-4 h-4" /> Masterlist
            </Button>
          </a>
          <a 
            href="https://docs.google.com/spreadsheets/d/14CeBV-yiLB2vkl6QvBkyIksxhe8IU4ygU1YlEWPZULE/edit?gid=0#gid=0" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full sm:w-auto"
          >
            <Button variant="outline" className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 w-full flex gap-2">
              <FileSpreadsheet className="w-4 h-4" /> Open Detailed Menu
            </Button>
          </a>
          <Button onClick={exportToGoogleSheets} className="bg-emerald-700 hover:bg-emerald-800 text-white w-full sm:w-auto flex gap-2">
            <FileSpreadsheet className="w-4 h-4" /> Export to Sheets
          </Button>
        </div>
      </div>

      {/* Tabs Layout - Restored horizontal scrolling for desktop and mobile */}
      <div className="flex items-center gap-2 border-b mb-8 overflow-x-auto pb-2 scrollbar-thin">
        {menus.map(tab => (
          <div 
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            onDoubleClick={(e) => { e.stopPropagation(); setEditingTabId(tab.id); setEditTabName(tab.tab_name); setEditTabCaption(tab.caption || ""); }}
            className={`px-4 py-2 rounded-t-lg flex items-center gap-2 whitespace-nowrap cursor-pointer group flex-shrink-0 ${
              activeTabId === tab.id ? "bg-emerald-50 border-b-2 border-emerald-600 text-emerald-700 shadow-sm" : "hover:bg-slate-50 border-transparent text-slate-600"
            }`}
          >
            {editingTabId === tab.id ? (
              <div className="flex flex-col gap-1 py-1">
                <div className="flex items-center gap-2">
                  <input 
                    autoFocus
                    placeholder={tab.tab_name}
                    value={editTabName}
                    onChange={(e) => setEditTabName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveTabName(tab.id)}
                    className="px-2 py-1 text-sm border rounded outline-none border-emerald-300 w-36 bg-white text-slate-800"
                  />
                  <button onClick={() => saveTabName(tab.id)} className="p-1 hover:text-emerald-600"><Check className="w-4 h-4" /></button>
                </div>
                <input 
                  placeholder="Tab caption/notes..."
                  value={editTabCaption}
                  onChange={(e) => setEditTabCaption(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveTabName(tab.id)}
                  className="px-2 py-0.5 text-xs border rounded outline-none border-slate-300 bg-white text-slate-600"
                />
              </div>
            ) : (
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium select-none">{tab.tab_name}</span>
                  <span className="bg-slate-200 text-xs px-2 py-0.5 rounded-full text-slate-700">
                    {tab.categories.reduce((acc, cat) => acc + cat.items.length, 0)} Items
                  </span>
                  
                  <button 
                    onClick={(e) => { e.stopPropagation(); setEditingTabId(tab.id); setEditTabName(tab.tab_name); setEditTabCaption(tab.caption || ""); }}
                    className="p-1 text-slate-400 hover:text-emerald-600 opacity-50 md:opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button onClick={(e) => handleDeleteTab(tab.id, e)} className="p-1 text-slate-400 hover:text-red-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {tab.caption && (
                  <span className="text-[11px] text-slate-500">{tab.caption}</span>
                )}
              </div>
            )}
          </div>
        ))}
        <button onClick={handleAddTab} className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg whitespace-nowrap flex-shrink-0">
          <Plus className="w-4 h-4" /> Add Menu Tab
        </button>
      </div>

      {/* Active Tab Content */}
      <div className="border rounded-lg bg-white shadow-sm min-h-[500px]">
        {!activeTab ? (
          <div className="flex flex-col items-center justify-center h-[500px] text-slate-400">
            <FileText className="w-12 h-12 mb-4 text-slate-300" />
            <p>No menu tab selected.</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="space-y-8">
              {activeTab.categories.map(category => {
                const predefinedItems = PREDEFINED_MENU[category.name] || [];
                return (
                  <div key={category.id} className="border border-slate-200 rounded-lg overflow-hidden">
                    {/* Category Header */}
                    <div className="bg-slate-50 px-4 py-3 flex justify-between items-start border-b border-slate-200">
                      <div>
                        <h3 className="font-semibold text-emerald-900 flex items-center gap-2 text-lg">
                          <ChevronRight className="w-5 h-5 text-emerald-600" />
                          {category.name}
                        </h3>
                        {category.caption && <p className="text-sm text-slate-500 ml-7 mt-1">{category.caption}</p>}
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteCategory(category.id)} className="text-slate-400 hover:text-red-500 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Category Items */}
                    <div className="p-4 bg-white">
                      <ul className="space-y-2 mb-4">
                        {category.items.map(item => (
                          <li key={item.id} className="flex items-start justify-between group px-4 py-3 hover:bg-slate-50 border border-transparent hover:border-slate-100 rounded-md transition-colors">
                            <div>
                              <span className="text-[15px] font-medium text-slate-800">{item.name}</span>
                              {item.caption && <p className="text-xs text-slate-500 mt-1">{item.caption}</p>}
                            </div>
                            <button onClick={() => handleDeleteItem(category.id, item.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                              <X className="w-4 h-4" />
                            </button>
                          </li>
                        ))}
                      </ul>

                      {/* Add Item Row */}
                      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 mt-4">
                        <div className="flex-1 flex flex-col sm:flex-row gap-2 w-full">
                          {predefinedItems.length > 0 ? (
                            <select 
                              value={newItemNames[category.id] || ""}
                              onChange={(e) => setNewItemNames({...newItemNames, [category.id]: e.target.value})}
                              className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                              <option value="">-- Select dish from menu --</option>
                              {predefinedItems.map(item => <option key={item} value={item}>{item}</option>)}
                            </select>
                          ) : null}
                          
                          <input 
                            type="text"
                            placeholder={predefinedItems.length > 0 ? "Or type custom dish..." : "Type dish name..."}
                            value={newItemNames[category.id] || ""}
                            onChange={(e) => setNewItemNames({...newItemNames, [category.id]: e.target.value})}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddItem(category.id)}
                            className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>

                        <input 
                          type="text"
                          placeholder="Note / Caption (optional)"
                          value={newItemCaptions[category.id] || ""}
                          onChange={(e) => setNewItemCaptions({...newItemCaptions, [category.id]: e.target.value})}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddItem(category.id)}
                          className="w-full lg:w-64 px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />

                        <Button onClick={() => handleAddItem(category.id)} className="w-full lg:w-auto bg-emerald-100 text-emerald-800 hover:bg-emerald-200">
                          <Plus className="w-4 h-4 mr-2" /> Add Dish
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add New Category Section */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <h4 className="text-sm font-semibold text-slate-800 mb-4">Add Menu Category</h4>
              <div className="flex flex-col gap-3 max-w-3xl bg-slate-50 p-5 rounded-lg border border-slate-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <select 
                    value={selectedCategoryName}
                    onChange={(e) => { setSelectedCategoryName(e.target.value); setCustomCategoryName(""); }}
                    className="flex-1 w-full px-3 py-2 text-sm border border-slate-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">-- Predefined Category --</option>
                    {Object.keys(PREDEFINED_MENU).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>

                  <span className="text-slate-400 text-xs font-semibold px-2">OR</span>

                  <input 
                    type="text"
                    placeholder="Custom category name..."
                    value={customCategoryName}
                    onChange={(e) => { setCustomCategoryName(e.target.value); setSelectedCategoryName(""); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                    className="flex-1 w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-1">
                  <input 
                    type="text"
                    placeholder="Category Note / Caption (optional, e.g., 'Served 8pm-10pm')"
                    value={categoryCaption}
                    onChange={(e) => setCategoryCaption(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                    className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <Button onClick={handleAddCategory} className="bg-slate-800 hover:bg-slate-900 text-white w-full sm:w-auto">
                    Add Category
                  </Button>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}