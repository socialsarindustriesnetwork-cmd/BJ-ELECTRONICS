import Link from "next/link";
import { BrandLogo } from "@bje/ui";

export function StoreFooter() {
  return (
    <footer className="commerce-footer marketplace-footer">
      <section className="footer-service-band"><article><span>🚚</span><div><strong>Nationwide delivery</strong><small>Order from anywhere in Bangladesh</small></div></article><article><span>♢</span><div><strong>Official warranty</strong><small>Brand-specific coverage and support</small></div></article><article><span>↻</span><div><strong>Customer assistance</strong><small>Help before and after purchase</small></div></article><article><span>▣</span><div><strong>Secure ordering</strong><small>Protected cart and checkout workflow</small></div></article></section>
      <section className="newsletter-band marketplace-newsletter"><div><span>BJ Electronics updates</span><strong>Get offers, buying guides and new arrivals.</strong><small>Useful product news sent occasionally.</small></div><form action="mailto:support@bjelectronics.shop" method="post" encType="text/plain"><input type="email" name="email" placeholder="Enter your email address" aria-label="Email address" required /><button type="submit">Subscribe</button></form></section>
      <div className="footer-main marketplace-footer-main">
        <div className="footer-brand"><BrandLogo inverse /><p>BJ Electronics is a modern electronics and home-appliance marketplace built around dependable products, clear availability and responsive service.</p><div className="footer-contact"><a href="mailto:support@bjelectronics.shop">support@bjelectronics.shop</a><span>Bangladesh</span><span>Sat–Thu · 9:00 AM–6:30 PM</span></div></div>
        <div><h3>Popular departments</h3><Link href="/categories?category=TV%20%26%20Entertainment">TV & entertainment</Link><Link href="/categories?category=Refrigerators%20%26%20Freezers">Refrigerators & freezers</Link><Link href="/categories?category=Air%20Conditioners">Air conditioners</Link><Link href="/categories?category=Washing%20Machines">Washing machines</Link><Link href="/categories?category=Kitchen%20Appliances">Kitchen appliances</Link></div>
        <div><h3>Technology</h3><Link href="/categories?category=Mobile%20%26%20Tablets">Mobile & tablets</Link><Link href="/categories?category=Laptops%20%26%20Computing">Laptops & computing</Link><Link href="/categories?category=Audio%20%26%20Accessories">Audio & accessories</Link><Link href="/categories?category=Small%20Appliances">Small appliances</Link><Link href="/categories?sort=discount">Current offers</Link></div>
        <div><h3>Customer service</h3><Link href="/track-order">Track an order</Link><Link href="/contact">Contact us</Link><Link href="/faq">FAQ</Link><Link href="/shipping-returns">Shipping & returns</Link><Link href="/warranty">Warranty information</Link></div>
        <div><h3>Company & policies</h3><Link href="/about">About BJ Electronics</Link><Link href="/privacy">Privacy policy</Link><Link href="/terms">Terms & conditions</Link><Link href="/cart">Shopping cart</Link><Link href="/checkout">Secure checkout</Link></div>
        <div><h3>Payments & security</h3><div className="payment-chips"><span>Cash on delivery</span><span>Bank transfer</span></div><p>Only payment methods supported by the secure checkout are displayed.</p><div className="footer-security"><span>✓ Secure cart</span><span>✓ Inventory validation</span><span>✓ Private order links</span></div></div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} BJ Electronics. All rights reserved.</span><div><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><span>Smart tech, better life.</span></div></div>
    </footer>
  );
}
