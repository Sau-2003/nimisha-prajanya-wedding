// // // "use client";

// // // import Link from "next/link";
// // // import { CheckCircle2, CalendarDays } from "lucide-react";
// // // import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// // // import { differenceInDays, differenceInWeeks } from 'date-fns';

// // // const events = [
// // //   { name: 'Puja',       date: 'Jan 27, 2027', link: '/events/puja',      color: 'bg-orange-500' },  
// // //   { name: 'Mehendi',    date: 'Jan 29, 2027', link: '/events/mehendi',   color: 'bg-emerald-500' }, 
// // //   { name: 'Check In',   date: 'Jan 30, 2027', link: '/events/check-in',  color: 'bg-fuscia-900' },    
// // //   { name: 'Tilak',      date: 'Jan 30, 2027', link: '/events/tilak',     color: 'bg-yellow-900' },    
// // //   { name: 'Sangeet',    date: 'Jan 30, 2027', link: '/events/sangeet',   color: 'bg-indigo-500' },  
// // //   { name: 'Haldi',      date: 'Jan 31, 2027', link: '/events/haldi',     color: 'bg-amber-400' },   
// // //   { name: 'Phere',      date: 'Jan 31, 2027', link: '/events/phere',     color: 'bg-red-500' },     
// // //   { name: 'Reception',  date: 'Jan 31, 2027', link: '/events/reception', color: 'bg-fuchsia-600' }, 
// // //   { name: 'Pagphere',   date: 'Feb 1, 2027',  link: '/events/pagphere',  color: 'bg-cyan-500' },    
// // //   { name: 'Vidai',      date: 'Feb 1, 2027',  link: '/events/vidai',     color: 'bg-pink-400' },   
// // // ];

// // // export default function Dashboard() {
// // //   // Main Wedding Date Calculation
// // //   const targetDate = new Date('2027-01-31');
// // //   const today = new Date();
  
// // //   const daysToGo = differenceInDays(targetDate, today);
// // //   const weeksToGo = differenceInWeeks(targetDate, today);

// // //   return (
// // //     <div className="min-h-screen p-6 md:p-12 max-w-5xl mx-auto space-y-10">
      
// // //       {/* Hero Section & Countdown */}
// // //       <div className="flex flex-col md:flex-row justify-between items-center gap-8">
// // //         <div>
// // //           <h1 className="font-serif text-4xl md:text-5xl font-bold text-slate-900 mb-2">Nimisha & Prajanya</h1>
// // //           <p className="text-xl text-slate-500">January 31, 2027</p>
// // //         </div>

// // //         {/* Global Countdown Badges */}
// // //         <div className="flex gap-4">
// // //           <div className="flex flex-col items-center justify-center bg-emerald-50 border border-emerald-100 px-6 py-4 rounded-2xl shadow-sm min-w-[120px]">
// // //             <span className="text-4xl font-bold text-emerald-700">
// // //               {daysToGo > 0 ? daysToGo : 0}
// // //             </span>
// // //             <span className="text-sm font-medium text-emerald-600 uppercase tracking-wide mt-1">Days to go</span>
// // //           </div>

// // //           <div className="flex flex-col items-center justify-center bg-emerald-50 border border-emerald-100 px-6 py-4 rounded-2xl shadow-sm min-w-[120px]">
// // //             <span className="text-4xl font-bold text-emerald-700">
// // //               {weeksToGo > 0 ? weeksToGo : 0}
// // //             </span>
// // //             <span className="text-sm font-medium text-emerald-600 uppercase tracking-wide mt-1">Weeks to go</span>
// // //           </div>
// // //         </div>
// // //       </div>

// // //       {/* Event Schedule */}
// // //       <Card className="shadow-sm border-slate-200">
// // //         <CardHeader>
// // //           <CardTitle className="flex items-center gap-2 text-2xl">
// // //             <CheckCircle2 className="text-emerald-600" /> Event Schedule
// // //           </CardTitle>
// // //         </CardHeader>
// // //         <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
// // //           {events.map((evt) => (
// // //             <Link 
// // //               key={evt.name} 
// // //               href={evt.link} 
// // //               className="p-5 border border-slate-200 rounded-xl flex items-center gap-4 hover:border-emerald-500 hover:shadow-md transition-all bg-white"
// // //             >
// // //               <div className={`w-2 h-14 rounded-full ${evt.color}`}></div>
// // //               <div className="flex-1">
// // //                 <p className="text-lg font-semibold text-slate-800">{evt.name}</p>
// // //                 <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
// // //                   <CalendarDays className="w-4 h-4"/> {evt.date}
// // //                 </p>
// // //               </div>
// // //             </Link>
// // //           ))}
// // //         </CardContent>
// // //       </Card>
// // //     </div>
// // //   );
// // // }
// // "use client";

// // import { useEffect, useState } from "react";
// // import Link from "next/link";
// // import { CheckCircle2, CalendarDays } from "lucide-react";
// // import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// // import { differenceInDays, differenceInWeeks } from "date-fns";
// // import { supabase } from "@/lib/supabase";

// // const events = [
// //   { name: "Puja", date: "Jan 27, 2027", link: "/events/puja", color: "bg-orange-500" },
// //   { name: "Mehendi", date: "Jan 29, 2027", link: "/events/mehendi", color: "bg-emerald-500" },
// //   { name: "Check In", date: "Jan 30, 2027", link: "/events/check-in", color: " bg-fuchsia-900" },
// //   { name: "Tilak", date: "Jan 30, 2027", link: "/events/tilak", color: "bg-yellow-900" },
// //   { name: "Sangeet", date: "Jan 30, 2027", link: "/events/sangeet", color: "bg-indigo-500" },
// //   { name: "Haldi", date: "Jan 31, 2027", link: "/events/haldi", color: "bg-amber-400" },
// //   { name: "Phere", date: "Jan 31, 2027", link: "/events/phere", color: "bg-red-500" },
// //   { name: "Reception", date: "Jan 31, 2027", link: "/events/reception", color: "bg-fuchsia-600" },
// //   { name: "Pagphere", date: "Feb 1, 2027", link: "/events/pagphere", color: "bg-cyan-500" },
// //   { name: "Vidai", date: "Feb 1, 2027", link: "/events/vidai", color: "bg-pink-400" },
// // ];

// // export default function Dashboard() {
// //   // --- Auth States ---
// //   const [isChecking, setIsChecking] = useState(true);
// //   const [isAuthorized, setIsAuthorized] = useState(false);
// //   const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
// //   const [email, setEmail] = useState("");
// //   const [password, setPassword] = useState("");
// //   const [authLoading, setAuthLoading] = useState(false);
// //   const [authError, setAuthError] = useState<string | null>(null);
// //   const [authSuccess, setAuthSuccess] = useState<string | null>(null);

// //   // 1. Initial Authentication Check
// //   useEffect(() => {
// //     const checkUser = async () => {
// //       const {
// //         data: { user },
// //       } = await supabase.auth.getUser();

// //       if (user) {
// //         setIsAuthorized(true);
// //       }
// //       setIsChecking(false);
// //     };

// //     checkUser();
// //   }, []);

// //   // 2. Handle Sign In / Sign Up Submission
// //   const handleAuth = async (e: React.FormEvent) => {
// //     e.preventDefault();
// //     setAuthLoading(true);
// //     setAuthError(null);
// //     setAuthSuccess(null);

// //     if (authMode === "signup") {
// //       // Create a new account
// //       const { error, data } = await supabase.auth.signUp({
// //         email,
// //         password,
// //       });

// //       if (error) {
// //         setAuthError(error.message);
// //       } else {
// //         // Depending on your Supabase settings, they might need to confirm their email
// //         if (data.user?.identities?.length === 0) {
// //           setAuthError("This email is already registered. Please sign in.");
// //         } else {
// //           setAuthSuccess("Account created! You can now sign in.");
// //           setAuthMode("signin");
// //           setPassword(""); // Clear password for safety
// //         }
// //       }
// //     } else {
// //       // Sign in existing user
// //       const { error } = await supabase.auth.signInWithPassword({
// //         email,
// //         password,
// //       });

// //       if (error) {
// //         setAuthError(error.message);
// //       } else {
// //         setIsAuthorized(true);
// //       }
// //     }

// //     setAuthLoading(false);
// //   };

// //   // Main Wedding Date Calculation
// //   const targetDate = new Date("2027-01-31");
// //   const today = new Date();

// //   const daysToGo = differenceInDays(targetDate, today);
// //   const weeksToGo = differenceInWeeks(targetDate, today);

// //   // Show nothing while checking the session on initial load
// //   if (isChecking) {
// //     return null;
// //   }

// //   // --- RENDER LOGIN / SIGNUP UI IF NOT AUTHORIZED ---
// //   if (!isAuthorized) {
// //     return (
// //       <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
// //         <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
// //           <div className="text-center mb-8">
// //             <h1 className="text-2xl font-serif font-bold text-emerald-900">
// //               {authMode === "signin" ? "Welcome Back" : "Create an Account"}
// //             </h1>
// //             <p className="text-sm text-slate-500 mt-1">
// //               {authMode === "signin"
// //                 ? "Sign in to access the wedding planner"
// //                 : "Sign up with your Gmail to get started"}
// //             </p>
// //           </div>

// //           {authError && (
// //             <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
// //               {authError}
// //             </div>
// //           )}

// //           {authSuccess && (
// //             <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 text-sm rounded-lg border border-emerald-100">
// //               {authSuccess}
// //             </div>
// //           )}

// //           <form onSubmit={handleAuth} className="space-y-4">
// //             <div>
// //               <label className="block text-sm font-medium text-slate-700 mb-1">
// //                 Email Address
// //               </label>
// //               <input
// //                 type="email"
// //                 required
// //                 value={email}
// //                 onChange={(e) => setEmail(e.target.value)}
// //                 className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800"
// //                 placeholder="you@gmail.com"
// //               />
// //             </div>

// //             <div>
// //               <label className="block text-sm font-medium text-slate-700 mb-1">
// //                 Password
// //               </label>
// //               <input
// //                 type="password"
// //                 required
// //                 value={password}
// //                 onChange={(e) => setPassword(e.target.value)}
// //                 className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800"
// //                 placeholder="••••••••"
// //               />
// //             </div>

// //             <button
// //               type="submit"
// //               disabled={authLoading}
// //               className="w-full bg-emerald-600 text-white font-medium py-2.5 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
// //             >
// //               {authLoading
// //                 ? "Processing..."
// //                 : authMode === "signin"
// //                 ? "Sign In"
// //                 : "Sign Up"}
// //             </button>
// //           </form>

// //           {/* Toggle between Sign In and Sign Up */}
// //           <div className="mt-6 text-center text-sm text-slate-500">
// //             {authMode === "signin" ? "Don't have an account? " : "Already have an account? "}
// //             <button
// //               onClick={() => {
// //                 setAuthMode(authMode === "signin" ? "signup" : "signin");
// //                 setAuthError(null);
// //                 setAuthSuccess(null);
// //               }}
// //               className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline"
// //             >
// //               {authMode === "signin" ? "Sign up here" : "Sign in here"}
// //             </button>
// //           </div>
// //         </div>
// //       </div>
// //     );
// //   }

// //   // --- RENDER DASHBOARD UI IF AUTHORIZED ---
// //   return (
// //     <div className="min-h-screen p-6 md:p-12 max-w-5xl mx-auto space-y-10">
// //       {/* Hero Section & Countdown */}
// //       <div className="flex flex-col md:flex-row justify-between items-center gap-8">
// //         <div>
// //           <h1 className="font-serif text-4xl md:text-5xl font-bold text-slate-900 mb-2">
// //             Nimisha & Prajanya
// //           </h1>
// //           <p className="text-xl text-slate-500">January 31, 2027</p>
// //         </div>

// //         {/* Global Countdown Badges */}
// //         <div className="flex gap-4">
// //           <div className="flex flex-col items-center justify-center bg-emerald-50 border border-emerald-100 px-6 py-4 rounded-2xl shadow-sm min-w-[120px]">
// //             <span className="text-4xl font-bold text-emerald-700">
// //               {daysToGo > 0 ? daysToGo : 0}
// //             </span>
// //             <span className="text-sm font-medium text-emerald-600 uppercase tracking-wide mt-1">
// //               Days to go
// //             </span>
// //           </div>

// //           <div className="flex flex-col items-center justify-center bg-emerald-50 border border-emerald-100 px-6 py-4 rounded-2xl shadow-sm min-w-[120px]">
// //             <span className="text-4xl font-bold text-emerald-700">
// //               {weeksToGo > 0 ? weeksToGo : 0}
// //             </span>
// //             <span className="text-sm font-medium text-emerald-600 uppercase tracking-wide mt-1">
// //               Weeks to go
// //             </span>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Event Schedule */}
// //       <Card className="shadow-sm border-slate-200">
// //         <CardHeader>
// //           <CardTitle className="flex items-center gap-2 text-2xl">
// //             <CheckCircle2 className="text-emerald-600" /> Event Schedule
// //           </CardTitle>
// //         </CardHeader>
// //         <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
// //           {events.map((evt) => (
// //             <Link
// //               key={evt.name}
// //               href={evt.link}
// //               className="p-5 border border-slate-200 rounded-xl flex items-center gap-4 hover:border-emerald-500 hover:shadow-md transition-all bg-white"
// //             >
// //               <div className={`w-2 h-14 rounded-full ${evt.color}`}></div>
// //               <div className="flex-1">
// //                 <p className="text-lg font-semibold text-slate-800">{evt.name}</p>
// //                 <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
// //                   <CalendarDays className="w-4 h-4" /> {evt.date}
// //                 </p>
// //               </div>
// //             </Link>
// //           ))}
// //         </CardContent>
// //       </Card>
// //     </div>
// //   );
// // }
// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { CheckCircle2, CalendarDays } from "lucide-react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { differenceInDays, differenceInWeeks } from "date-fns";
// import { supabase } from "@/lib/supabase";

// const events = [
//   { name: "Puja", date: "Jan 27, 2027", link: "/events/puja", color: "bg-orange-500" },
//   { name: "Mehendi", date: "Jan 29, 2027", link: "/events/mehendi", color: "bg-emerald-500" },
//   { name: "Check In", date: "Jan 30, 2027", link: "/events/check-in", color: "bg-fuscia-900" },
//   { name: "Tilak", date: "Jan 30, 2027", link: "/events/tilak", color: "bg-yellow-900" },
//   { name: "Sangeet", date: "Jan 30, 2027", link: "/events/sangeet", color: "bg-indigo-500" },
//   { name: "Haldi", date: "Jan 31, 2027", link: "/events/haldi", color: "bg-amber-400" },
//   { name: "Phere", date: "Jan 31, 2027", link: "/events/phere", color: "bg-red-500" },
//   { name: "Reception", date: "Jan 31, 2027", link: "/events/reception", color: "bg-fuchsia-600" },
//   { name: "Pagphere", date: "Feb 1, 2027", link: "/events/pagphere", color: "bg-cyan-500" },
//   { name: "Vidai", date: "Feb 1, 2027", link: "/events/vidai", color: "bg-pink-400" },
// ];

// export default function Dashboard() {
//   // --- Auth States ---
//   const [isChecking, setIsChecking] = useState(true);
//   const [isAuthorized, setIsAuthorized] = useState(false);
//   const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [authLoading, setAuthLoading] = useState(false);
//   const [authError, setAuthError] = useState<string | null>(null);
//   const [authSuccess, setAuthSuccess] = useState<string | null>(null);

//   // 1. Initial Authentication Check (YOUR UPDATED CODE)
//   useEffect(() => {
//     const checkUser = async () => {
//       const {
//         data: { user },
//       } = await supabase.auth.getUser();

//       if (user) {
//         setIsAuthorized(true);
//       } else {
//         // If not logged in, check if we saved their email previously
//         const savedEmail = localStorage.getItem("wedding_app_email");
//         if (savedEmail) {
//           setEmail(savedEmail); // Pre-fills the email input!
//         }
//       }
//       setIsChecking(false);
//     };

//     checkUser();
//   }, []);

//   // 2. Handle Sign In / Sign Up Submission (YOUR UPDATED CODE)
//   const handleAuth = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setAuthLoading(true);
//     setAuthError(null);
//     setAuthSuccess(null);

//     if (authMode === "signup") {
//       const { error, data } = await supabase.auth.signUp({
//         email,
//         password,
//       });

//       if (error) {
//         setAuthError(error.message);
//       } else if (data.user?.identities?.length === 0) {
//         setAuthError("This email is already registered. Please sign in.");
//       } else {
//         setAuthSuccess("Account created! You can now sign in.");
//         setAuthMode("signin");
//         setPassword("");
//       }
//     } else {
//       const { error } = await supabase.auth.signInWithPassword({
//         email,
//         password,
//       });

//       if (error) {
//         setAuthError(error.message);
//       } else {
//         // SUCCESS! Save their email to the device for next time
//         localStorage.setItem("wedding_app_email", email);
//         setIsAuthorized(true);
//       }
//     }

//     setAuthLoading(false);
//   };

//   // Main Wedding Date Calculation
//   const targetDate = new Date("2027-01-31");
//   const today = new Date();

//   const daysToGo = differenceInDays(targetDate, today);
//   const weeksToGo = differenceInWeeks(targetDate, today);

//   // Show nothing while checking the session on initial load
//   if (isChecking) {
//     return null;
//   }

//   // --- RENDER LOGIN / SIGNUP UI IF NOT AUTHORIZED ---
//   if (!isAuthorized) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
//         <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
//           <div className="text-center mb-8">
//             <h1 className="text-2xl font-serif font-bold text-emerald-900">
//               {authMode === "signin" ? "Welcome Back" : "Create an Account"}
//             </h1>
//             <p className="text-sm text-slate-500 mt-1">
//               {authMode === "signin"
//                 ? "Sign in to access the wedding planner"
//                 : "Sign up with your email to get started"}
//             </p>
//           </div>

//           {authError && (
//             <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
//               {authError}
//             </div>
//           )}

//           {authSuccess && (
//             <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 text-sm rounded-lg border border-emerald-100">
//               {authSuccess}
//             </div>
//           )}

//           <form onSubmit={handleAuth} className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-slate-700 mb-1">
//                 Email Address
//               </label>
//               <input
//                 type="email"
//                 required
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 autoComplete="email"
//                 className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800"
//                 placeholder="you@email.com"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-slate-700 mb-1">
//                 Password
//               </label>
//               <input
//                 type="password"
//                 required
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 autoComplete={authMode === "signin" ? "current-password" : "new-password"}
//                 className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800"
//                 placeholder="••••••••"
//               />
//             </div>

//             <button
//               type="submit"
//               disabled={authLoading}
//               className="w-full bg-emerald-600 text-white font-medium py-2.5 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
//             >
//               {authLoading
//                 ? "Processing..."
//                 : authMode === "signin"
//                 ? "Sign In"
//                 : "Sign Up"}
//             </button>
//           </form>

//           {/* Toggle between Sign In and Sign Up */}
//           <div className="mt-6 text-center text-sm text-slate-500">
//             {authMode === "signin" ? "Don't have an account? " : "Already have an account? "}
//             <button
//               onClick={() => {
//                 setAuthMode(authMode === "signin" ? "signup" : "signin");
//                 setAuthError(null);
//                 setAuthSuccess(null);
//               }}
//               className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline"
//             >
//               {authMode === "signin" ? "Sign up here" : "Sign in here"}
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // --- RENDER DASHBOARD UI IF AUTHORIZED ---
//   return (
//     <div className="min-h-screen p-6 md:p-12 max-w-5xl mx-auto space-y-10">
//       {/* Hero Section & Countdown */}
//       <div className="flex flex-col md:flex-row justify-between items-center gap-8">
//         <div>
//           <h1 className="font-serif text-4xl md:text-5xl font-bold text-slate-900 mb-2">
//             Nimisha & Prajanya
//           </h1>
//           <p className="text-xl text-slate-500">January 31, 2027</p>
//         </div>

//         {/* Global Countdown Badges */}
//         <div className="flex gap-4">
//           <div className="flex flex-col items-center justify-center bg-emerald-50 border border-emerald-100 px-6 py-4 rounded-2xl shadow-sm min-w-[120px]">
//             <span className="text-4xl font-bold text-emerald-700">
//               {daysToGo > 0 ? daysToGo : 0}
//             </span>
//             <span className="text-sm font-medium text-emerald-600 uppercase tracking-wide mt-1">
//               Days to go
//             </span>
//           </div>

//           <div className="flex flex-col items-center justify-center bg-emerald-50 border border-emerald-100 px-6 py-4 rounded-2xl shadow-sm min-w-[120px]">
//             <span className="text-4xl font-bold text-emerald-700">
//               {weeksToGo > 0 ? weeksToGo : 0}
//             </span>
//             <span className="text-sm font-medium text-emerald-600 uppercase tracking-wide mt-1">
//               Weeks to go
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* Event Schedule */}
//       <Card className="shadow-sm border-slate-200">
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2 text-2xl">
//             <CheckCircle2 className="text-emerald-600" /> Event Schedule
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {events.map((evt) => (
//             <Link
//               key={evt.name}
//               href={evt.link}
//               className="p-5 border border-slate-200 rounded-xl flex items-center gap-4 hover:border-emerald-500 hover:shadow-md transition-all bg-white"
//             >
//               <div className={`w-2 h-14 rounded-full ${evt.color}`}></div>
//               <div className="flex-1">
//                 <p className="text-lg font-semibold text-slate-800">{evt.name}</p>
//                 <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
//                   <CalendarDays className="w-4 h-4" /> {evt.date}
//                 </p>
//               </div>
//             </Link>
//           ))}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { differenceInDays, differenceInWeeks } from "date-fns";
import { supabase } from "@/lib/supabase";

const events = [
  { name: "Puja", date: "Jan 27, 2027", link: "/events/puja", color: "bg-orange-500" },
  { name: "Mehendi", date: "Jan 29, 2027", link: "/events/mehendi", color: "bg-emerald-500" },
  { name: "Check In", date: "Jan 30, 2027", link: "/events/check-in", color: "bg-fuscia-900" },
  { name: "Tilak", date: "Jan 30, 2027", link: "/events/tilak", color: "bg-yellow-900" },
  { name: "Sangeet", date: "Jan 30, 2027", link: "/events/sangeet", color: "bg-indigo-500" },
  { name: "Haldi", date: "Jan 31, 2027", link: "/events/haldi", color: "bg-amber-400" },
  { name: "Phere", date: "Jan 31, 2027", link: "/events/phere", color: "bg-red-500" },
  { name: "Reception", date: "Jan 31, 2027", link: "/events/reception", color: "bg-fuchsia-600" },
  { name: "Pagphere", date: "Feb 1, 2027", link: "/events/pagphere", color: "bg-cyan-500" },
  { name: "Vidai", date: "Feb 1, 2027", link: "/events/vidai", color: "bg-pink-400" },
];

export default function Dashboard() {
  // --- Auth States ---
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // 1. Initial Authentication Check
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setIsAuthorized(true);
      } else {
        const savedEmail = localStorage.getItem("wedding_app_email");
        if (savedEmail) {
          setEmail(savedEmail);
        }
      }
      setIsChecking(false);
    };

    checkUser();
  }, []);

  // 2. Handle Sign In / Sign Up Submission
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    setAuthSuccess(null);

    if (authMode === "signup") {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setAuthError(error.message);
      } else if (data.user?.identities?.length === 0) {
        setAuthError("This email is already registered. Please sign in.");
      } else {
        setAuthSuccess("Account created! You can now sign in.");
        setAuthMode("signin");
        setPassword("");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthError(error.message);
      } else {
        localStorage.setItem("wedding_app_email", email);
        setIsAuthorized(true);
      }
    }

    setAuthLoading(false);
  };

  // Main Wedding Date Calculation
  const targetDate = new Date("2027-01-31");
  const today = new Date();

  const daysToGo = differenceInDays(targetDate, today);
  const weeksToGo = differenceInWeeks(targetDate, today);

  if (isChecking) {
    return null;
  }

  // --- RENDER COMPACT LOGIN / SIGNUP UI (NO SCROLL ON MOBILE) ---
  if (!isAuthorized) {
    return (
      <div className="h-[100dvh] w-screen overflow-hidden flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-sm w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-center">
          <div className="text-center mb-5">
            <h1 className="text-xl font-serif font-bold text-emerald-900">
              {authMode === "signin" ? "Welcome Back" : "Create an Account"}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {authMode === "signin"
                ? "Sign in to access the wedding planner"
                : "Sign up with your email to get started"}
            </p>
          </div>

          {authError && (
            <div className="mb-3 p-2 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">
              {authError}
            </div>
          )}

          {authSuccess && (
            <div className="mb-3 p-2 bg-emerald-50 text-emerald-700 text-xs rounded-lg border border-emerald-100">
              {authSuccess}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                placeholder="you@email.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={authMode === "signin" ? "current-password" : "new-password"}
                className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-emerald-600 text-white font-medium py-2 rounded-lg text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50 mt-1"
            >
              {authLoading
                ? "Processing..."
                : authMode === "signin"
                ? "Sign In"
                : "Sign Up"}
            </button>
          </form>

          <div className="mt-4 text-center text-xs text-slate-500">
            {authMode === "signin" ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                setAuthMode(authMode === "signin" ? "signup" : "signin");
                setAuthError(null);
                setAuthSuccess(null);
              }}
              className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline"
            >
              {authMode === "signin" ? "Sign up here" : "Sign in here"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER DASHBOARD UI IF AUTHORIZED ---
  return (
    <div className="min-h-screen p-6 md:p-12 max-w-5xl mx-auto space-y-10">
      {/* Hero Section & Countdown */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-8">
        <div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-slate-900 mb-2">
            Nimisha & Prajanya
          </h1>
          <p className="text-xl text-slate-500">January 31, 2027</p>
        </div>

        {/* Global Countdown Badges */}
        <div className="flex gap-4">
          <div className="flex flex-col items-center justify-center bg-emerald-50 border border-emerald-100 px-6 py-4 rounded-2xl shadow-sm min-w-[120px]">
            <span className="text-4xl font-bold text-emerald-700">
              {daysToGo > 0 ? daysToGo : 0}
            </span>
            <span className="text-sm font-medium text-emerald-600 uppercase tracking-wide mt-1">
              Days to go
            </span>
          </div>

          <div className="flex flex-col items-center justify-center bg-emerald-50 border border-emerald-100 px-6 py-4 rounded-2xl shadow-sm min-w-[120px]">
            <span className="text-4xl font-bold text-emerald-700">
              {weeksToGo > 0 ? weeksToGo : 0}
            </span>
            <span className="text-sm font-medium text-emerald-600 uppercase tracking-wide mt-1">
              Weeks to go
            </span>
          </div>
        </div>
      </div>

      {/* Event Schedule */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <CheckCircle2 className="text-emerald-600" /> Event Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((evt) => (
            <Link
              key={evt.name}
              href={evt.link}
              className="p-5 border border-slate-200 rounded-xl flex items-center gap-4 hover:border-emerald-500 hover:shadow-md transition-all bg-white"
            >
              <div className={`w-2 h-14 rounded-full ${evt.color}`}></div>
              <div className="flex-1">
                <p className="text-lg font-semibold text-slate-800">{evt.name}</p>
                <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                  <CalendarDays className="w-4 h-4" /> {evt.date}
                </p>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}