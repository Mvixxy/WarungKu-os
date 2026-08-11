"use client";

/**
 * Request browser notification permission.
 * Returns true if permission granted.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

/**
 * Show a browser notification if permission is granted.
 */
export function showNotification(title: string, body: string, tag?: string) {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  try {
    new Notification(title, {
      body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: tag ?? `warungku-${Date.now()}`,
      requireInteraction: false,
    });
  } catch {
    // Notification constructor can throw in some environments
  }
}

/**
 * Check debts and notify about due/overdue ones.
 * Call this on app load and periodically.
 */
export function checkDebtReminders(
  debts: Array<{
    borrowerName: string;
    amount: number;
    dueDate: string;
    isPaid: number;
    whatsapp?: string;
  }>
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const unpaid = debts.filter((d) => !d.isPaid);
  const dueToday = unpaid.filter((d) => {
    const due = new Date(d.dueDate);
    due.setHours(0, 0, 0, 0);
    return due.getTime() === today.getTime();
  });
  const overdue = unpaid.filter((d) => {
    const due = new Date(d.dueDate);
    due.setHours(0, 0, 0, 0);
    return due.getTime() < today.getTime();
  });

  if (dueToday.length > 0) {
    const names = dueToday.map((d) => d.borrowerName).join(", ");
    const total = dueToday.reduce((s, d) => s + d.amount, 0);
    showNotification(
      "Hutang Jatuh Tempo Hari Ini!",
      `${names} — total Rp${total.toLocaleString("id-ID")}`,
      "debt-due-today"
    );
  }

  if (overdue.length > 0) {
    const names = overdue.map((d) => d.borrowerName).join(", ");
    const total = overdue.reduce((s, d) => s + d.amount, 0);
    showNotification(
      "Hutang Sudah Jatuh Tempo!",
      `${names} — total Rp${total.toLocaleString("id-ID")} belum lunas`,
      "debt-overdue"
    );
  }
}
