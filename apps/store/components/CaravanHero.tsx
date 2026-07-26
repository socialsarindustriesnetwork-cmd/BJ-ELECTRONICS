"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Product } from "@bje/database";

const slides = [
  {
    kicker: "Smart technology, better life",
    title: "Reliable electronics for everyday performance.",
    copy: "Shop dependable laptops, audio, wearables, monitors and accessories with live stock and secure checkout.",
    href: "/shop",
    action: "Shop now",
    theme: "blue",
  },
  {
    kicker: "Connected work and play",
    title: "Powerful products. Responsive support.",
    copy: "Discover technology selected for productivity, entertainment and life on the move across Bangladesh.",
    href: "/categories?sort=newest",
    action: "Explore new arrivals",
    theme: "red",
  },
  {
    kicker: "Confidence with every order",
    title: "Live inventory and protected checkout.",
    copy: "Product availability and pricing are verified before an order is accepted and inventory is reserved.",
    href: "/policies/shipping",
    action: "How delivery works",
    theme: "dark",
  },
] as const;

export function CaravanHero({ featuredProduct }: { featuredProduct?: Product }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setActive((value) => (value + 1) % slides.length), 7000);
    return () => window.clearInterval(timer);
  }, []);

  const slide = slides[active];

  return (
    <section className={`caravan-hero theme-${slide.theme}`} aria-label="Featured promotions">
      <button className="caravan-hero-arrow previous" type="button" aria-label="Previous slide" onClick={() => setActive((active + slides.length - 1) % slides.length)}>‹</button>
      <div className="caravan-hero-copy">
        <span>{slide.kicker}</span>
        <h1>{slide.title}</h1>
        <p>{slide.copy}</p>
        <div className="caravan-hero-actions">
          <Link href={slide.href}>{slide.action}</Link>
          {featuredProduct ? <Link className="secondary" href={`/products/${featuredProduct.slug}`}>Featured product</Link> : null}
        </div>
      </div>
      <div className="caravan-hero-art" aria-hidden="true">
        <div className="caravan-device-screen"><i /><i /><i /><strong>BJ</strong></div>
        <div className="caravan-device-base" />
        <div className="caravan-floating-card one"><small>Live inventory</small><strong>{featuredProduct?.name ?? "Latest technology"}</strong></div>
        <div className="caravan-floating-card two"><small>Secure checkout</small><strong>Protected orders</strong></div>
      </div>
      <button className="caravan-hero-arrow next" type="button" aria-label="Next slide" onClick={() => setActive((active + 1) % slides.length)}>›</button>
      <div className="caravan-hero-dots" aria-label="Choose promotion">
        {slides.map((item, index) => <button key={item.title} type="button" className={index === active ? "active" : ""} aria-label={`Show slide ${index + 1}`} onClick={() => setActive(index)} />)}
      </div>
    </section>
  );
}