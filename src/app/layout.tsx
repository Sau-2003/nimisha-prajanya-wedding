import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';
import AuthGuard from '@/components/AuthGuard'; // <-- Import the new guard

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
      <body className={`${inter.variable} ${playfair.variable} font-sans bg-slate-50 text-slate-900 flex`}>
        {/* The AuthGuard will now handle deciding whether to show the Sidebar or not */}
        <AuthGuard>
          {children}
        </AuthGuard>
      </body>
    </html>
  );
}