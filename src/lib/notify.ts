type Listener = (n: { title: string; body: string; href?: string }) => void;

const listeners = new Set<Listener>();

export function onNotify(fn: Listener) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function pushNotify(n: { title: string; body: string; href?: string }) {
  listeners.forEach((fn) => fn(n));
  if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
    try {
      new Notification(n.title, { body: n.body });
    } catch {
      /* ignore */
    }
  }
}

export function requestNotifyPermission() {
  if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
    Notification.requestPermission().catch(() => {});
  }
}
