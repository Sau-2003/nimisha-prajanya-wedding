import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';
import AuthGuard from '@/components/AuthGuard';

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: "Wedding Planner",
  description: "Manage your wedding tasks",
  manifest: "/manifest.json",
  themeColor: "#047857",
  icons: {
    icon: "/engagement.png",
    apple: "/engagement.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Wedding Planner",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans bg-slate-50 text-slate-900 flex overflow-x-hidden min-h-[100dvh]`}>
        
        {/* 
          AuthGuard handles whether the Sidebar is rendered. 
          This main wrapper ensures content stretches full-width on mobile 
          and leaves proper room for the sidebar + mobile menu button.
        */}
        <div className="w-full min-h-[100dvh] md:ml-64 md:w-[calc(100%-16rem)] pt-16 md:pt-0 transition-all duration-300 ease-in-out flex flex-col">
          <AuthGuard>
            {children}
          </AuthGuard>
        </div>

      </body>
    </html>
  );
}