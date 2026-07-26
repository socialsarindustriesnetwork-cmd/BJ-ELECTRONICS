import Link from "next/link";
import { BrandLogo } from "@bje/ui";

export function StoreFooter() {
  return (
    <footer className="caravan-footer">
      <section className="caravan-feedback-band">
        <div><BrandLogo inverse /><p>Your feedback shapes BJ Electronics. Share thoughts about our products, customer service, website or ordering experience so the team can serve you better.</p></div>
        <a href="mailto:support@bjelectronics.shop?subject=BJ%20Electronics%20feedback">Send feedback</a>
      </section>
      <section className="caravan-footer-main">
        <div className="caravan-footer-brand"><BrandLogo /><p>Smart technology, dependable products and coordinated online service for customers across Bangladesh.</p><div className="footer-socials"><a href="mailto:support@bjelectronics.shop?subject=Facebook">f</a><a href="mailto:support@bjelectronics.shop?subject=Instagram">◎</a><a href="mailto:support@bjelectronics.shop?subject=WhatsApp">◉</a><a href="mailto:support@bjelectronics.shop?subject=YouTube">▶</a></div></div>
        <div><h3>Company information</h3><Link href="/about">About us</Link><a href="mailto:support@bjelectronics.shop?subject=Careers">Join our team</a><Link href="/terms">Terms & conditions</Link><Link href="/contact">Contact us</Link></div>
        <div><h3>Shopping information</h3><Link href="/shipping-returns">Shipping & delivery</Link><Link href="/shipping-returns">Return policy</Link><Link href="/shipping-returns">Refund assistance</Link><Link href="/terms">Ordering conditions</Link></div>
        <div><h3>Shop</h3><Link href="/categories?category=Laptops">Laptops</Link><Link href="/categories?category=Headphones">Audio</Link><Link href="/categories?category=Smart%20Watches">Smart watches</Link><Link href="/categories?category=Accessories">Accessories</Link><Link href="/categories?sort=discount">Current deals</Link></div>
        <div><h3>Contact information</h3><span>Online operations · Bangladesh</span><a href="mailto:support@bjelectronics.shop">support@bjelectronics.shop</a><span>Support hours: Sat–Thu, 9:00–18:30</span><div className="payment-chips"><span>COD</span><span>Bank</span><span>Secure</span></div></div>
      </section>
      <div className="caravan-footer-bottom"><span>© {new Date().getFullYear()} BJ Electronics. All rights reserved.</span><span>Built for secure, responsive commerce.</span></div>
    </footer>
  );
}
