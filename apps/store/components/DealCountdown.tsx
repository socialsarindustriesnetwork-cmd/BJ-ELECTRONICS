"use client";

import { useEffect, useState } from "react";

function remaining(target: number) {
  const distance = Math.max(0, target - Date.now());
  return {
    days: Math.floor(distance / 86_400_000),
    hours: Math.floor((distance / 3_600_000) % 24),
    minutes: Math.floor((distance / 60_000) % 60),
    seconds: Math.floor((distance / 1_000) % 60),
  };
}

export function DealCountdown() {
  const [target] = useState(() => Date.now() + 72 * 60 * 60 * 1000);
  const [time, setTime] = useState(() => remaining(target));

  useEffect(() => {
    const timer = window.setInterval(() => setTime(remaining(target)), 1_000);
    return () => window.clearInterval(timer);
  }, [target]);

  return (
    <div className="deal-countdown" aria-label={`${time.days} days ${time.hours} hours ${time.minutes} minutes remaining`}>
      <span><b>{String(time.days).padStart(2, "0")}</b><small>Days</small></span>
      <i>:</i>
      <span><b>{String(time.hours).padStart(2, "0")}</b><small>Hours</small></span>
      <i>:</i>
      <span><b>{String(time.minutes).padStart(2, "0")}</b><small>Min</small></span>
      <i>:</i>
      <span><b>{String(time.seconds).padStart(2, "0")}</b><small>Sec</small></span>
    </div>
  );
}
