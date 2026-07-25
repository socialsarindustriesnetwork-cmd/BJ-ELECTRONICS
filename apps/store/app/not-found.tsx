import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="empty-state" style={{ width: "min(720px, calc(100% - 36px))", margin: "80px auto" }}>
      <p className="eyebrow">404 · Product unavailable</p>
      <h1>This product could not be found.</h1>
      <p>It may have been archived or its storefront URL may have changed.</p>
      <Link className="primary-link" href="/">Return to BJ Electronics</Link>
    </main>
  );
}
