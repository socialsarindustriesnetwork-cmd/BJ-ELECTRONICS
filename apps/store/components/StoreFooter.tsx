import Link from "next/link";
import { BrandLogo } from "@bje/ui";

export function StoreFooter() {
  return (
    <footer className="commerce-footer marketplace-footer">
      <section className="newsletter-band">
        <div><strong>Get BJ Electronics offers and new-arrival updates</strong><span>Product announcements and useful buying information.</span></div>
        <form action="mailto:support@bjelectronics.shop" method="post" encType="text/plain"><input type="email" name="email" placeholder="Enter your email address" aria-label="Email address" required /><button type="submit">Subscribe</button></form>
      </section>
      <section className="marketplace-footer-assurance">
        <div><span>▱</span><strong>Delivery support</strong><small>Order fulfilment coordinated by the operations team</small></div>
        <div><span>♢</span><strong>Product warranty</strong><small>Warranty information is confirmed per product</small></div>
        <div><span>↻</span><strong>Return assistance</strong><small>Contact customer care for eligibility and guidance</small></div>
        <div><span>▣</span><strong>Secure order creation</strong><small>Inventory and prices are revalidated at checkout</small></div>
      </section>
      <div className="footer-main">
        <div className="footer-brand"><BrandLogo /><p>Your Bangladesh technology marketplace for dependable electronics, transparent availability, secure ordering and responsive support.</p><a href="mailto:support@bjelectronics.shop">support@bjelectronics.shop</a></div>
        <div><h3>Marketplace</h3><Link href="/categories">All products</Link><Link href="/categories?sort=newest">New arrivals</Link><Link href="/categories?sort=discount">Current deals</Link><Link href="/wishlist">Wishlist</Link><Link href="/cart">Shopping cart</Link></div>
        <div><h3>Categories</h3><Link href="/categories?category=Laptops">Laptops</Link><Link href="/categories?category=Earphones">Earphones</Link><Link href="/categories?category=Headphones">Headphones</Link><Link href="/categories?category=Smart%20Watches">Smart watches</Link><Link href="/categories?category=Accessories">Accessories</Link></div>
        <div><h3>Customer care</h3><Link href="/track-order">Track an order</Link><a href="mailto:support@bjelectronics.shop?subject=Product%20support">Product support</a><a href="mailto:support@bjelectronics.shop?subject=Delivery%20support">Delivery support</a><a href="mailto:support@bjelectronics.shop?subject=Returns%20and%20refunds">Returns & refunds</a><a href="mailto:support@bjelectronics.shop?subject=Business%20sales">Business sales</a></div>
        <div><h3>Payment options</h3><div className="payment-chips"><span>Cash on delivery</span><span>Bank transfer</span></div><p>Only payment methods supported by the secure checkout are displayed.</p><h3 className="footer-secondary-title">Company</h3><a href="mailto:support@bjelectronics.shop?subject=About%20BJ%20Electronics">About BJ Electronics</a><span>Privacy policy</span><span>Terms & conditions</span></div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} BJ Electronics. All rights reserved.</span><span>Smart tech, better life.</span></div>
    </footer>
  );
}
