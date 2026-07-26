"use client";

import { useState, type FormEvent } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const subject = "BJ Electronics newsletter subscription";
    const body = `Please add this address to the BJ Electronics product news and offers list:\n\n${email}`;
    window.location.assign(`mailto:support@bjelectronics.shop?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  }
  return <form onSubmit={submit}><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Enter your email address" aria-label="Email address" required /><button type="submit">Subscribe</button></form>;
}
