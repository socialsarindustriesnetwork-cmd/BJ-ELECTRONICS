import Link from "next/link";
import { BrandLogo } from "@bje/ui";

export function StoreFooter() {
  return (
    <footer className="commerce-footer">
      <section className="newsletter-band">
        <div><strong>Stay updated with the latest deals & new arrivals</strong><span>Useful product updates, not inbox clutter.</span></div>
        <form action="mailto:support@bjelectronics.shop" method="post" encType="text/plain"><input type="email" name="email" placeholder="Enter your email" aria-label="Email address" required /><button type="submit">Subscribe</button></form>
      </section>
      <div className="footer-main">
        <div className="footer-brand"><BrandLogo /><p>Your trusted destination for dependable electronics, secure shopping and responsive customer care.</p></div>
        <div><h3>Shop</h3><Link href="/categories?category=Laptops">Laptops</Link><Link href="/categories?category=Earphones">Earphones</Link><Link href="/categories?category=Headphones">Headphones</Link><Link href="/categories?category=Smart%20Watches">Smart watches</Link><Link href="/categories?category=Speakers">Speakers</Link></div>
        <div><h3>Customer service</h3><a href="mailto:support@bjelectronics.shop">Contact us</a><Link href="/cart">Cart</Link><Link href="/checkout">Checkout</Link><a href="mailto:support@bjelectronics.shop?subject=Returns%20and%20refunds">Returns & refunds</a><a href="mailto:support@bjelectronics.shop?subject=Shipping">Shipping information</a></div>
        <div><h3>Company</h3><a href="mailto:support@bjelectronics.shop?subject=About%20BJ%20Electronics">About us</a><a href="mailto:support@bjelectronics.shop?subject=Careers">Careers</a><a href="mailto:support@bjelectronics.shop?subject=Business%20sales">Business sales</a><span>Privacy policy</span><span>Terms & conditions</span></div>
        <div><h3>Payment methods</h3><div className="payment-chips"><span>VISA</span><span>MC</span><span>PayPal</span><span>Apple Pay</span></div><p>Payments are confirmed securely before fulfilment.</p></div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} BJ Electronics. All rights reserved.</span><span>Smart tech, better life.</span></div>
    </footer>
  );
}
