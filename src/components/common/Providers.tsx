"use client";

import { useEffect } from "react";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationToaster } from "@/components/common/NotificationToaster";
import { I18nProvider } from "@/context/I18nContext";
import { requestNotifyPermission } from "@/lib/notify";

function registerSW() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((e) => {
      console.warn("SW register failed", e);
    });
  });
  setTimeout(() => requestNotifyPermission(), 2500);
}

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    registerSW();
  }, []);

  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          <>
            {children}
            <NotificationToaster />
          </>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
