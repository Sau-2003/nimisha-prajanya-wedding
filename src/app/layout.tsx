import { Sidebar } from '@/components/layout/leftsidebar';
import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: "Nimisha & Prajanya's Wedding Planner",
  description: "Road to January 30, 2027",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans bg-slate-50 text-slate-900 flex`}>
        {/* This is what makes your Sidebar show up! */}
        <Sidebar />
        
        {/* This pushes your main dashboard content to the right so it doesn't hide behind the sidebar */}
        <main className="flex-1 ml-64 overflow-y-auto h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}