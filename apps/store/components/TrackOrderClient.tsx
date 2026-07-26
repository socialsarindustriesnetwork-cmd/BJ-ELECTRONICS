"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function TrackOrderClient() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedOrder = orderNumber.trim().toUpperCase();
    const normalizedToken = token.trim().toLowerCase();
    if (!normalizedOrder) {
      setError("Enter the order number shown on your confirmation page.");
      return;
    }
    if (!/^[a-f0-9]{64}$/.test(normalizedToken)) {
      setError("Enter the complete private tracking token from your order link.");
      return;
    }
    setError("");
    router.push(`/orders/${encodeURIComponent(normalizedOrder)}?token=${encodeURIComponent(normalizedToken)}`);
  }

  return (
    <form className="track-order-form" onSubmit={submit} noValidate>
      <label>
        Order number
        <input value={orderNumber} onChange={(event) => setOrderNumber(event.target.value)} placeholder="Example: BJE-2026-000001" autoComplete="off" required />
      </label>
      <label>
        Private tracking token
        <input value={token} onChange={(event) => setToken(event.target.value)} placeholder="64-character token from your confirmation link" autoComplete="off" required />
      </label>
      {error ? <div className="form-error" role="alert">{error}</div> : null}
      <button type="submit">Open order status</button>
    </form>
  );
}
