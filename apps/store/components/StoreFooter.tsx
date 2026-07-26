import Link from "next/link";
import { BrandLogo } from "@bje/ui";

export function StoreFooter() {
  return (
    <footer className="caravan-footer">
      <section className="caravan-feedback">
        <div className="caravan-feedback-logo"><BrandLogo inverse /></div>
        <p>
          “At BJ Electronics, your voice shapes our journey. Share your thoughts about our service,
          products, website, or anything that can help us serve you better.”
        </p>
      </section>

      <div className="caravan-footer-grid">
        <section>
          <h2>Company information</h2>
          <Link href="/about">About us</Link>
          <a href="mailto:support@bjelectronics.shop?subject=Careers%20at%20BJ%20Electronics">Join our team</a>
          <Link href="/policies/privacy">Privacy policy</Link>
          <Link href="/contact">Contact us</Link>
        </section>

        <section>
          <h2>Shopping information</h2>
          <Link href="/policies/shipping">Shipping & delivery</Link>
          <Link href="/policies/returns">Return policy</Link>
          <Link href="/policies/refunds">Refund policy</Link>
          <Link href="/policies/terms">Terms and conditions</Link>
        </section>

        <section className="caravan-footer-contact">
          <h2>Contact info</h2>
          <span>Online electronics store serving Bangladesh</span>
          <a href="mailto:support@bjelectronics.shop">support@bjelectronics.shop</a>
          <span>Sat–Thu: 9:00–18:30</span>
          <div className="caravan-footer-social"><span>f</span><span>◎</span><span>▶</span><span>◉</span></div>
        </section>
      </div>

      <div className="caravan-footer-bottom">
        <span>Copyright © {new Date().getFullYear()} BJ Electronics. All rights reserved.</span>
        <span>Developed and operated by BJ Electronics.</span>
      </div>
    </footer>
  );
}