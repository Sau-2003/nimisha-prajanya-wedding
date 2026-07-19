import { Sidebar } from '@/components/layout/leftsidebar';
import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'Wedding Planner',
  description: 'Manage your wedding tasks',
  manifest: '/manifest.json',
  icons: {
    apple: '/wedding-icon.png', // This fixes the icon for iPhone/iOS shortcuts
    icon: '/wedding-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Wedding Planner',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans bg-slate-50 text-slate-900 flex`}>
        {/* Note: If your file is named leftsidebar.tsx, make sure the import at the top of this file matches! */}
        <Sidebar />
        
        {/* Make content full width on mobile, and push it right on desktop */}
        <main className="flex-1 w-full md:ml-64 overflow-y-auto h-screen">
          {/* Add padding to the top on mobile so the 3-line button isn't covering your dashboard */}
          <div className="pt-16 md:pt-0">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}