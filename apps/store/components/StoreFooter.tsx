import Link from "next/link";
import { BrandLogo } from "@bje/ui";

export function StoreFooter() {
  return (
    <footer className="commerce-footer marketplace-footer">
      <section className="newsletter-band">
        <div><strong>Get BJ Electronics offers and new arrivals</strong><span>Useful product updates, buying guides and marketplace promotions.</span></div>
        <form action="mailto:support@bjelectronics.shop" method="post" encType="text/plain"><input type="email" name="email" placeholder="Enter your email address" aria-label="Email address" required /><button type="submit">Subscribe</button></form>
      </section>
      <section className="footer-support-strip" aria-label="Customer support services">
        <article><span>☎</span><div><strong>Customer care</strong><a href="mailto:support@bjelectronics.shop">support@bjelectronics.shop</a></div></article>
        <article><span>🚚</span><div><strong>Delivery support</strong><a href="mailto:support@bjelectronics.shop?subject=Delivery%20support">Track and manage orders</a></div></article>
        <article><span>↻</span><div><strong>Returns assistance</strong><a href="mailto:support@bjelectronics.shop?subject=Return%20request">Start a return request</a></div></article>
        <article><span>✓</span><div><strong>Product guidance</strong><a href="mailto:support@bjelectronics.shop?subject=Product%20advice">Talk to a product expert</a></div></article>
      </section>
      <div className="footer-main">
        <div className="footer-brand"><BrandLogo /><p>Your trusted marketplace for electronics, appliances, secure shopping and responsive support across Bangladesh.</p><div className="footer-social"><span>f</span><span>◎</span><span>▶</span><span>in</span></div></div>
        <div><h3>Departments</h3><Link href="/categories?category=TV%20%26%20Entertainment">TV & entertainment</Link><Link href="/categories?category=Refrigerators%20%26%20Freezers">Refrigerators</Link><Link href="/categories?category=Air%20Conditioners">Air conditioners</Link><Link href="/categories?category=Washing%20Machines">Washing machines</Link><Link href="/categories?category=Kitchen%20Appliances">Kitchen appliances</Link></div>
        <div><h3>Technology</h3><Link href="/categories?category=Phones%20%26%20Tablets">Phones & tablets</Link><Link href="/categories?category=Laptops%20%26%20Computing">Laptops & computing</Link><Link href="/categories?category=Audio%20%26%20Headphones">Audio & headphones</Link><Link href="/categories?category=Smart%20Watches%20%26%20Wearables">Smart watches</Link><Link href="/categories?category=Power%20%26%20Accessories">Accessories</Link></div>
        <div><h3>Customer service</h3><a href="mailto:support@bjelectronics.shop">Contact us</a><Link href="/cart">Shopping cart</Link><Link href="/checkout">Secure checkout</Link><a href="mailto:support@bjelectronics.shop?subject=Returns%20and%20refunds">Returns & refunds</a><a href="mailto:support@bjelectronics.shop?subject=Shipping">Delivery information</a></div>
        <div><h3>Payment & fulfilment</h3><div className="payment-chips"><span>COD</span><span>Bank</span><span>Secure</span></div><p>Supported checkout methods are cash on delivery and bank transfer. Inventory is verified again before order confirmation.</p><Link className="footer-deal-link" href="/categories?sort=discount">View current deals →</Link></div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} BJ Electronics. All rights reserved.</span><span>Smart tech, better life.</span></div>
    </footer>
  );
}
