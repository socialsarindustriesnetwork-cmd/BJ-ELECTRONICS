import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="empty-cart" style={{ width: "min(720px, calc(100% - 36px))", margin: "80px auto" }}>
      <span>404</span>
      <p className="eyebrow">Product unavailable</p>
      <h1>This page could not be found.</h1>
      <p>The product may have been archived or the storefront address may have changed.</p>
      <Link className="shop-primary" href="/categories">Browse BJ Electronics</Link>
    </main>
  );
}
