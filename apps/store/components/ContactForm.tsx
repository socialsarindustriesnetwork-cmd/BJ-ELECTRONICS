"use client";

import { useState, type FormEvent } from "react";

type ContactFields = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  topic: string;
  message: string;
};

const initialFields: ContactFields = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  topic: "Product question",
  message: "",
};

export function ContactForm() {
  const [fields, setFields] = useState(initialFields);

  function update<K extends keyof ContactFields>(key: K, value: ContactFields[K]) {
    setFields((current) => ({ ...current, [key]: value }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const subject = `[${fields.topic}] BJ Electronics customer message`;
    const body = [
      `Name: ${fields.firstName} ${fields.lastName}`,
      `Email: ${fields.email}`,
      `Phone: ${fields.phone || "Not provided"}`,
      `Topic: ${fields.topic}`,
      "",
      fields.message,
    ].join("\n");
    window.location.assign(`mailto:support@bjelectronics.shop?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <label>First name<input value={fields.firstName} onChange={(event) => update("firstName", event.target.value)} autoComplete="given-name" required /></label>
      <label>Last name<input value={fields.lastName} onChange={(event) => update("lastName", event.target.value)} autoComplete="family-name" required /></label>
      <label>Phone number<input value={fields.phone} onChange={(event) => update("phone", event.target.value)} type="tel" autoComplete="tel" /></label>
      <label>Email address<input value={fields.email} onChange={(event) => update("email", event.target.value)} type="email" autoComplete="email" required /></label>
      <label className="full">Topic<select value={fields.topic} onChange={(event) => update("topic", event.target.value)}><option>Product question</option><option>Order support</option><option>Warranty</option><option>Return or refund</option><option>Business sales</option><option>Website feedback</option></select></label>
      <label className="full">Message<textarea value={fields.message} onChange={(event) => update("message", event.target.value)} required placeholder="Describe the product, order number or support request." /></label>
      <button type="submit">Prepare email message</button>
    </form>
  );
}
