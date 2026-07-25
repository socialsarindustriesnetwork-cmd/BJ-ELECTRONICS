"use client";

import { useState } from "react";
import type { CommerceCart } from "@bje/database/transactions";

export function AddToCartButton({ productId, disabled }: { productId: string; disabled?: boolean }) {
  const [state, setState] = useState<"idle" | "adding" | "added" | "error">("idle");
  const [message, setMessage] = useState("");

  async function add() {
    setState("adding");
    setMessage("");
    try {
      const cartResponse = await fetch("/api/cart", { cache: "no-store" });
      const cartPayload = await cartResponse.json() as { cart?: CommerceCart; error?: string };
      if (!cartResponse.ok || !cartPayload.cart) throw new Error(cartPayload.error || "Could not load the cart.");
      const current = cartPayload.cart.lines.find((line) => line.productId === productId)?.quantity ?? 0;
      const response = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ productId, quantity: current + 1 }),
      });
      const payload = await response.json() as { cart?: CommerceCart; error?: string };
      if (!response.ok || !payload.cart) throw new Error(payload.error || "Could not add this product.");
      window.dispatchEvent(new CustomEvent("bje:cart", { detail: payload.cart.itemCount }));
      setState("added");
      setMessage("Added to cart.");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Could not add this product.");
    }
  }

  return (
    <div className="detail-cart-action">
      <button className="add-button" type="button" onClick={add} disabled={disabled || state === "adding"}>
        {disabled ? "Unavailable" : state === "adding" ? "Adding…" : state === "added" ? "Added to cart" : "Add to cart"}
      </button>
      {message ? <span className={state === "error" ? "action-message error" : "action-message"}>{message}</span> : null}
    </div>
  );
}
