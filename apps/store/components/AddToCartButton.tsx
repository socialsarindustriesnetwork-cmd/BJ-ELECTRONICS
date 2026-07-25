"use client";

import { useState } from "react";

export function AddToCartButton({ productId, disabled }: { productId: string; disabled?: boolean }) {
  const [added, setAdded] = useState(false);

  function add() {
    let cart: Record<string, number> = {};
    try {
      cart = JSON.parse(localStorage.getItem("bje-cart") ?? "{}") as Record<string, number>;
    } catch {
      cart = {};
    }
    cart[productId] = (cart[productId] ?? 0) + 1;
    localStorage.setItem("bje-cart", JSON.stringify(cart));
    setAdded(true);
  }

  return (
    <button className="add-button" type="button" onClick={add} disabled={disabled}>
      {disabled ? "Unavailable" : added ? "Added to cart" : "Add to cart"}
    </button>
  );
}
