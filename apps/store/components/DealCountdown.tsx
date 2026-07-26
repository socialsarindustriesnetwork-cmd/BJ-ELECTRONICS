"use client";

import { useEffect, useState } from "react";

function remainingToday(): number {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return Math.max(0, end.getTime() - now.getTime());
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function DealCountdown() {
  const [remaining, setRemaining] = useState(remainingToday);

  useEffect(() => {
    const timer = window.setInterval(() => setRemaining(remainingToday()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const hours = Math.floor(remaining / 3_600_000);
  const minutes = Math.floor((remaining % 3_600_000) / 60_000);
  const seconds = Math.floor((remaining % 60_000) / 1000);

  return (
    <div className="deal-countdown" aria-label={`Deals refresh in ${hours} hours, ${minutes} minutes and ${seconds} seconds`}>
      <span>Refreshes in</span>
      <strong>{pad(hours)}</strong><i>:</i><strong>{pad(minutes)}</strong><i>:</i><strong>{pad(seconds)}</strong>
    </div>
  );
}
