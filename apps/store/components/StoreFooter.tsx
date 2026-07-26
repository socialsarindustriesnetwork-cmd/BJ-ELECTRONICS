import Link from "next/link";
import { BrandLogo } from "@bje/ui";

export function StoreFooter() {
  return (
    <footer className="commerce-footer caravan-footer full-market-footer">
      <section className="newsletter-band caravan-newsletter">
        <div><strong>Get product news, offers and buying guides</strong><span>Useful BJ Electronics updates delivered occasionally.</span></div>
        <form action="mailto:support@bjelectronics.shop" method="post" encType="text/plain"><input type="email" name="email" placeholder="Enter your email address" aria-label="Email address" required /><button type="submit">Subscribe</button></form>
      </section>

      <section className="full-footer-support" aria-label="Marketplace services">
        <article><span>🚚</span><div><strong>Nationwide delivery</strong><small>Order support across Bangladesh</small></div></article>
        <article><span>✓</span><div><strong>Official warranty</strong><small>Clear product coverage</small></div></article>
        <article><span>↻</span><div><strong>Returns assistance</strong><small>Transparent support process</small></div></article>
        <article><span>▣</span><div><strong>Secure checkout</strong><small>Protected transactional ordering</small></div></article>
      </section>

      <div className="footer-main caravan-footer-main">
        <div className="footer-brand">
          <BrandLogo />
          <p>Your trusted marketplace for electronics, appliances, secure shopping and responsive customer care.</p>
          <div className="footer-contact-list"><a href="mailto:support@bjelectronics.shop">support@bjelectronics.shop</a><a href="mailto:sales@bjelectronics.shop">sales@bjelectronics.shop</a><span>Bangladesh</span><span>Customer care available Sat–Thu</span></div>
        </div>
        <div><h3>Home appliances</h3><Link href="/categories?category=TV%20%26%20Entertainment">TV & entertainment</Link><Link href="/categories?category=Refrigerators%20%26%20Freezers">Refrigerators</Link><Link href="/categories?category=Air%20Conditioners">Air conditioners</Link><Link href="/categories?category=Washing%20Machines">Washing machines</Link><Link href="/categories?category=Kitchen%20Appliances">Kitchen appliances</Link></div>
        <div><h3>Connected technology</h3><Link href="/categories?category=Phones%20%26%20Tablets">Phones & tablets</Link><Link href="/categories?category=Laptops%20%26%20Computing">Laptops & computing</Link><Link href="/categories?category=Audio%20%26%20Headphones">Audio & headphones</Link><Link href="/categories?category=Smart%20Watches%20%26%20Wearables">Wearables</Link><Link href="/categories?category=Power%20%26%20Accessories">Accessories</Link></div>
        <div><h3>Customer care</h3><Link href="/help">Help center</Link><Link href="/track-order">Track an order</Link><Link href="/contact">Contact us</Link><Link href="/faq">FAQ</Link><Link href="/shipping-returns">Shipping & returns</Link><Link href="/returns">Return support</Link><Link href="/warranty">Warranty information</Link><Link href="/business">Business sales</Link><Link href="/privacy">Privacy policy</Link><Link href="/terms">Terms & conditions</Link></div>
        <div><h3>Payment & security</h3><div className="payment-chips"><span>Cash on delivery</span><span>Bank transfer</span></div><p>Only payment methods supported by the secure checkout are displayed. Inventory, pricing and order totals are validated before fulfilment.</p><div className="footer-security-note">✓ Secure cart · ✓ Protected order processing</div></div>
      </div>

      <div className="footer-bottom"><span>© {new Date().getFullYear()} BJ Electronics. All rights reserved.</span><span>Smart tech, better life.</span></div>
    </footer>
  );
}
