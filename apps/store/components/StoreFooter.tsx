import Link from "next/link";
import { BrandLogo } from "@bje/ui";

export function StoreFooter() {
  return (
    <footer className="commerce-footer marketplace-footer">
      <section className="marketplace-support-strip">
        <article><span>☎</span><div><strong>Need product advice?</strong><small>Talk with our customer support team.</small></div><a href="mailto:support@bjelectronics.shop">Get help</a></article>
        <article><span>▦</span><div><strong>Business purchasing</strong><small>Request coordinated product support.</small></div><Link href="/business">Business sales</Link></article>
        <article><span>↻</span><div><strong>Order assistance</strong><small>Use your private order link or contact support.</small></div><Link href="/help">Help center</Link></article>
      </section>

      <section className="newsletter-band marketplace-newsletter">
        <div><span>Deals, new arrivals and useful updates</span><strong>Stay connected with BJ Electronics</strong><small>Product updates and buying guidance, without inbox clutter.</small></div>
        <form action="mailto:support@bjelectronics.shop" method="post" encType="text/plain"><input type="email" name="email" placeholder="Enter your email address" aria-label="Email address" required /><button type="submit">Subscribe</button></form>
      </section>

      <div className="footer-main marketplace-footer-main">
        <div className="footer-brand"><BrandLogo /><p>Your trusted destination for dependable electronics, secure shopping and responsive customer care across Bangladesh.</p><div className="footer-contact-list"><a href="mailto:support@bjelectronics.shop">support@bjelectronics.shop</a><a href="mailto:sales@bjelectronics.shop">sales@bjelectronics.shop</a><span>Bangladesh</span></div></div>
        <div><h3>Shop departments</h3><Link href="/categories?category=Laptops">Laptops</Link><Link href="/categories?category=Earphones">Earphones</Link><Link href="/categories?category=Headphones">Headphones</Link><Link href="/categories?category=Smart%20Watches">Smart watches</Link><Link href="/categories?category=Speakers">Speakers</Link><Link href="/categories?category=Accessories">Accessories</Link></div>
        <div><h3>Customer service</h3><Link href="/help">Help center</Link><Link href="/returns">Returns & refunds</Link><Link href="/warranty">Warranty support</Link><Link href="/cart">Shopping cart</Link><Link href="/checkout">Secure checkout</Link><a href="mailto:support@bjelectronics.shop?subject=Delivery%20support">Delivery information</a></div>
        <div><h3>About BJ Electronics</h3><Link href="/about">About us</Link><Link href="/business">Business sales</Link><a href="mailto:support@bjelectronics.shop?subject=Careers">Careers</a><Link href="/privacy">Privacy policy</Link><Link href="/terms">Terms & conditions</Link><a href="https://admin.bjelectronics.shop">Administration</a></div>
        <div><h3>Payment & security</h3><div className="payment-chips marketplace-payment-chips"><span>COD</span><span>BANK</span><span>SSL</span><span>SECURE</span></div><p>Current checkout supports cash on delivery and bank transfer. Inventory and pricing are verified before order creation.</p><div className="footer-security-badge"><span>✓</span><div><strong>Protected checkout</strong><small>Transactional order processing</small></div></div></div>
      </div>

      <div className="footer-bottom marketplace-footer-bottom"><span>© {new Date().getFullYear()} BJ Electronics. All rights reserved.</span><div><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><a href="mailto:support@bjelectronics.shop">Support</a></div><span>Smart tech, better life.</span></div>
    </footer>
  );
}
