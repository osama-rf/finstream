import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { UserProvider } from "@/lib/contexts/UserContext";
import { ThemeProvider } from "@/lib/contexts/ThemeContext";
import QueryProvider from "@/lib/providers/QueryProvider";

export const metadata: Metadata = {
  title: {
    default: "منصة ركائز | المصرفية المفتوحة للمنشآت",
    template: "%s | منصة ركائز",
  },
  description: "وسيط المصرفية المفتوحة للمنشآت الصغيرة والمتوسطة — اجمع بياناتك المالية من بنوكك وحوّلها إلى تقرير ائتماني يمكّنك من التمويل",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('theme') || 'light';
                  var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var resolved = stored === 'system' ? (systemDark ? 'dark' : 'light') : stored;
                  document.documentElement.dataset.theme = resolved;
                  document.documentElement.style.colorScheme = resolved;
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="theme-shell">
        <QueryProvider>
          <ThemeProvider>
            <UserProvider>
              <Toaster position="top-right" richColors />
              {children}
            </UserProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
