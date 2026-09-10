"use client";

import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { I18nProvider } from "@/context/I18nContext";
import { NotificationToaster } from "@/components/common/NotificationToaster";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          {children}
          <NotificationToaster />
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
