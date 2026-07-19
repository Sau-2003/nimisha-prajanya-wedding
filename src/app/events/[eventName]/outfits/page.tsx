// "use client";

// import { useState, useRef } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import { supabase } from '@/lib/supabase';
// import { Button } from '@/components/ui/button';
// import { Card } from '@/components/ui/card';
// import { Trash2, Plus, ArrowLeft } from 'lucide-react';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { useEventItems } from '@/hooks/useEventItems'; // <-- Using our new cloud hook!

// export default function OutfitPage() {
//   const { eventName } = useParams();
//   const router = useRouter();
//   const rawName = eventName ? String(eventName) : 'event';

//   // 1. Fetch data from the cloud using our real-time hook
//   const { items, loading } = useEventItems(rawName);
  
//   const [activeTab, setActiveTab] = useState("Main Look");
//   const [customTabs, setCustomTabs] = useState<string[]>([]); // To hold newly created tabs before images are added
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   // 2. Filter out only the outfit items from the database
//   // We save outfit categories as "outfit_Main Look", "outfit_Sangeet", etc.
//   const outfitItems = items.filter(item => item.category.startsWith('outfit_'));

//   // 3. Extract all unique tab names from the database + our custom empty ones
//   const dbTabs = Array.from(new Set(outfitItems.map(item => item.category.replace('outfit_', ''))));
//   const allTabs = Array.from(new Set(["Main Look", ...dbTabs, ...customTabs]));

//   // 4. Get just the images for the currently selected tab
//   const activeItems = outfitItems.filter(item => item.category === `outfit_${activeTab}`);

//   const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     // Upload image to storage
//     const { data } = await supabase.storage.from('task-images').upload(`${Date.now()}_${file.name}`, file);
    
//     if (data?.path) {
//       const { data: url } = supabase.storage.from('task-images').getPublicUrl(data.path);
      
//       // Instantly insert into the database (Syncs everywhere!)
//       await supabase.from('event_items').insert({
//         event_name: rawName,
//         category: `outfit_${activeTab}`,
//         content: url.publicUrl
//       });
//     }
//   };

//   const deleteImage = async (id: string) => {
//     // Delete just this specific image row
//     await supabase.from('event_items').delete().eq('id', id);
//   };

//   const addNewTab = () => {
//     const name = prompt("Enter new outfit category (e.g., Sangeet, Reception):");
//     if (name && name.trim()) {
//       const formattedName = name.trim();
//       setCustomTabs([...customTabs, formattedName]);
//       setActiveTab(formattedName);
//     }
//   };

//   if (loading) return <div className="p-12 text-center text-emerald-600">Loading Outfits...</div>;

//   return (
//     <div className="p-6 md:p-12 max-w-5xl mx-auto">
//       <Button variant="ghost" onClick={() => router.back()} className="mb-4 -ml-4 text-slate-500 hover:text-emerald-700">
//         <ArrowLeft className="w-4 h-4 mr-2" /> Back to {rawName.charAt(0).toUpperCase() + rawName.slice(1)} Workspace
//       </Button>
      
//       <h1 className="text-3xl font-bold mb-6 text-emerald-900 capitalize">{rawName} Outfits</h1>

//       <Tabs value={activeTab} onValueChange={setActiveTab}>
//         <TabsList className="mb-6 flex flex-wrap h-auto bg-slate-100 p-1 rounded-lg">
//           {allTabs.map(tab => (
//             <TabsTrigger key={tab} value={tab} className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
//               {tab}
//             </TabsTrigger>
//           ))}
//           <Button variant="ghost" size="sm" onClick={addNewTab} className="ml-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
//             <Plus className="w-4 h-4 mr-1"/> Add Category
//           </Button>
//         </TabsList>

//         <TabsContent value={activeTab} className="mt-0">
//           <div className="mb-6">
//             <input type="file" ref={fileInputRef} onChange={handleUpload} accept="image/*" className="hidden" />
//             <Button onClick={() => fileInputRef.current?.click()} className="bg-emerald-600 hover:bg-emerald-700 shadow-sm">
//               <Plus className="w-4 h-4 mr-2" /> Add Image to {activeTab}
//             </Button>
//           </div>

//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//             {activeItems.length === 0 ? (
//               <div className="col-span-full p-8 text-center text-slate-400 border-2 border-dashed rounded-xl bg-slate-50">
//                 No images added for {activeTab} yet.
//               </div>
//             ) : (
//               activeItems.map((item) => (
//                 <Card key={item.id} className="relative group p-2 overflow-hidden border-slate-200 shadow-sm">
//                   <img src={item.content} alt="Outfit" className="w-full h-64 object-cover rounded" />
//                   <button 
//                     onClick={() => deleteImage(item.id)}
//                     className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md"
//                   >
//                     <Trash2 className="w-4 h-4" />
//                   </button>
//                 </Card>
//               ))
//             )}
//           </div>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }




"use client";

import { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trash2, Plus, ArrowLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEventItems } from '@/hooks/useEventItems'; 

export default function OutfitPage() {
  const { eventName } = useParams();
  const router = useRouter();
  
  // FIX 1: Decode the URL so spaces don't break the sync
  const rawName = eventName ? decodeURIComponent(String(eventName)) : 'event';

  // FIX 2: Pull fetchData out of the hook so we can manually refresh
  const { items, loading, fetchData } = useEventItems(rawName);
  
  const [activeTab, setActiveTab] = useState("Main Look");
  const [customTabs, setCustomTabs] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const outfitItems = items.filter(item => item.category.startsWith('outfit_'));
  const dbTabs = Array.from(new Set(outfitItems.map(item => item.category.replace('outfit_', ''))));
  const allTabs = Array.from(new Set(["Main Look", ...dbTabs, ...customTabs]));
  const activeItems = outfitItems.filter(item => item.category === `outfit_${activeTab}`);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const { data } = await supabase.storage.from('task-images').upload(`${Date.now()}_${file.name}`, file);
    
    if (data?.path) {
      const { data: url } = supabase.storage.from('task-images').getPublicUrl(data.path);
      
      await supabase.from('event_items').insert({
        event_name: rawName,
        category: `outfit_${activeTab}`,
        content: url.publicUrl
      });
      
      // FIX 3: Force the screen to refresh instantly after upload!
      fetchData(); 
    }
  };

  const deleteImage = async (id: string) => {
    await supabase.from('event_items').delete().eq('id', id);
    
    // FIX 4: Force the screen to refresh instantly after delete!
    fetchData(); 
  };

  const addNewTab = () => {
    const name = prompt("Enter new outfit category (e.g., Sangeet, Reception):");
    if (name && name.trim()) {
      const formattedName = name.trim();
      setCustomTabs([...customTabs, formattedName]);
      setActiveTab(formattedName);
    }
  };

  if (loading) return <div className="p-12 text-center text-emerald-600">Loading Outfits...</div>;

  return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4 -ml-4 text-slate-500 hover:text-emerald-700">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to {rawName.charAt(0).toUpperCase() + rawName.slice(1)} Workspace
      </Button>
      
      <h1 className="text-3xl font-bold mb-6 text-emerald-900 capitalize">{rawName} Outfits</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 flex flex-wrap h-auto bg-slate-100 p-1 rounded-lg">
          {allTabs.map(tab => (
            <TabsTrigger key={tab} value={tab} className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
              {tab}
            </TabsTrigger>
          ))}
          <Button variant="ghost" size="sm" onClick={addNewTab} className="ml-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
            <Plus className="w-4 h-4 mr-1"/> Add Category
          </Button>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          <div className="mb-6">
            <input type="file" ref={fileInputRef} onChange={handleUpload} accept="image/*" className="hidden" />
            <Button onClick={() => fileInputRef.current?.click()} className="bg-emerald-600 hover:bg-emerald-700 shadow-sm">
              <Plus className="w-4 h-4 mr-2" /> Add Image to {activeTab}
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {activeItems.length === 0 ? (
              <div className="col-span-full p-8 text-center text-slate-400 border-2 border-dashed rounded-xl bg-slate-50">
                No images added for {activeTab} yet.
              </div>
            ) : (
              activeItems.map((item) => (
                <Card key={item.id} className="relative group p-2 overflow-hidden border-slate-200 shadow-sm">
                  <img src={item.content} alt="Outfit" className="w-full h-64 object-cover rounded" />
                  <button 
                    onClick={() => deleteImage(item.id)}
                    className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full opacity-50 group-hover:opacity-100 transition-all shadow-md"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}