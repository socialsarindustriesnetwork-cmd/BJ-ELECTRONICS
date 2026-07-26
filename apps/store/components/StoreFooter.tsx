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
        <div className="footer-brand"><BrandLogo /><p>Your trusted destination for dependable electronics, secure shopping and responsive customer care.</p><Link href="/about">Learn about BJ Electronics</Link></div>
        <div><h3>Shop</h3><Link href="/shop">All products</Link><Link href="/shop?category=Laptops">Laptops</Link><Link href="/shop?category=Earphones">Earphones</Link><Link href="/shop?category=Headphones">Headphones</Link><Link href="/shop?category=Smart%20Watches">Smart watches</Link><Link href="/shop?category=Accessories">Accessories</Link></div>
        <div><h3>Customer service</h3><Link href="/contact">Contact us</Link><Link href="/cart">Cart</Link><Link href="/checkout">Checkout</Link><Link href="/policies/shipping">Shipping & delivery</Link><Link href="/policies/returns">Return policy</Link><Link href="/policies/refunds">Refund policy</Link></div>
        <div><h3>Company information</h3><Link href="/about">About us</Link><a href="mailto:sales@bjelectronics.shop?subject=Careers">Join our team</a><Link href="/policies/privacy">Privacy policy</Link><Link href="/policies/terms">Terms & conditions</Link><a href="mailto:sales@bjelectronics.shop">Business sales</a></div>
        <div><h3>Contact & payment</h3><a href="mailto:support@bjelectronics.shop">support@bjelectronics.shop</a><p>Nationwide delivery coordination across Bangladesh.</p><div className="payment-chips"><span>COD</span><span>Bank</span><span>Secure</span><span>Verified</span></div><p>Only use payment instructions confirmed through the official order process.</p></div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} BJ Electronics. All rights reserved.</span><span>Developed and operated through the BJ Electronics commerce platform.</span></div>
    </footer>
  );
}
