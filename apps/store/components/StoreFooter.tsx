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
          <div className="footer-contact-list"><a href="mailto:support@bjelectronics.shop">support@bjelectronics.shop</a><span>Bangladesh</span><span>Sat–Thu · 9:00 AM–6:30 PM</span></div>
        </div>
        <div><h3>Shop</h3><Link href="/categories?category=Laptops">Laptops</Link><Link href="/categories?category=Headphones">Audio</Link><Link href="/categories?category=Smart%20Watches">Wearables</Link><Link href="/categories?category=Accessories">Accessories</Link><Link href="/categories?sort=discount">Special offers</Link></div>
        <div><h3>Customer care</h3><Link href="/contact">Contact us</Link><Link href="/cart">Shopping cart</Link><Link href="/checkout">Secure checkout</Link><a href="mailto:support@bjelectronics.shop?subject=Shipping%20support">Shipping support</a><a href="mailto:support@bjelectronics.shop?subject=Returns%20and%20refunds">Returns & refunds</a></div>
        <div><h3>Company</h3><Link href="/about">About BJ Electronics</Link><a href="mailto:support@bjelectronics.shop?subject=Careers">Careers</a><a href="mailto:sales@bjelectronics.shop?subject=Business%20sales">Business sales</a><span>Privacy policy</span><span>Terms & conditions</span></div>
        <div><h3>Payment & security</h3><div className="payment-chips"><span>VISA</span><span>MC</span><span>COD</span><span>Bank</span></div><p>Inventory, pricing and order totals are validated before fulfilment.</p><div className="footer-security-note">✓ Secure cart · ✓ Protected order processing</div></div>
      </div>

      <div className="footer-bottom"><span>© {new Date().getFullYear()} BJ Electronics. All rights reserved.</span><span>Smart tech, better life.</span></div>
    </footer>
  );
}