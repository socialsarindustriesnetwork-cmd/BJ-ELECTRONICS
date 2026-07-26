import Link from "next/link";
import { BrandLogo } from "@bje/ui";

export function StoreFooter() {
  return (
    <footer className="commerce-footer caravan-footer">
      <section className="newsletter-band caravan-newsletter">
        <div><strong>Get product news, offers and buying guides</strong><span>Useful BJ Electronics updates delivered occasionally.</span></div>
        <form action="mailto:support@bjelectronics.shop" method="post" encType="text/plain"><input type="email" name="email" placeholder="Enter your email address" aria-label="Email address" required /><button type="submit">Subscribe</button></form>
      </section>

      <div className="footer-main caravan-footer-main">
        <div className="footer-brand">
          <BrandLogo />
          <p>Your trusted destination for dependable electronics, secure shopping and responsive customer care.</p>
          <div className="footer-contact-list"><a href="mailto:support@bjelectronics.shop">support@bjelectronics.shop</a><a href="mailto:sales@bjelectronics.shop">sales@bjelectronics.shop</a><span>Bangladesh</span><span>Sat–Thu · 9:00 AM–6:30 PM</span></div>
        </div>
        <div><h3>Shop</h3><Link href="/categories">All products</Link><Link href="/categories?category=Laptops">Laptops</Link><Link href="/categories?category=Headphones">Audio</Link><Link href="/categories?category=Smart%20Watches">Wearables</Link><Link href="/categories?sort=discount">Special offers</Link></div>
        <div><h3>Customer care</h3><Link href="/help">Help center</Link><Link href="/track-order">Track an order</Link><Link href="/contact">Contact us</Link><Link href="/faq">FAQ</Link><Link href="/shipping-returns">Shipping & returns</Link><Link href="/returns">Return support</Link><Link href="/warranty">Warranty information</Link></div>
        <div><h3>Company</h3><Link href="/about">About BJ Electronics</Link><Link href="/business">Business sales</Link><a href="mailto:support@bjelectronics.shop?subject=Careers">Careers</a><Link href="/privacy">Privacy policy</Link><Link href="/terms">Terms & conditions</Link></div>
        <div><h3>Payment & security</h3><div className="payment-chips"><span>Cash on delivery</span><span>Bank transfer</span></div><p>Only payment methods supported by the secure checkout are displayed.</p><div className="footer-security-note">✓ Secure cart · ✓ Protected order processing</div></div>
      </div>

      <div className="footer-bottom"><span>© {new Date().getFullYear()} BJ Electronics. All rights reserved.</span><span>Smart tech, better life.</span></div>
    </footer>
  );
}
