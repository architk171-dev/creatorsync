export function track(event: string, properties?: Record<string, any>) {
  try {
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, properties }),
    }).catch(() => {});
  } catch {}
}
