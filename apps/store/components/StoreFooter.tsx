import Link from "next/link";
import { BrandLogo } from "@bje/ui";
import { NewsletterForm } from "@/components/NewsletterForm";

export function StoreFooter() {
  return (
    <footer className="commerce-footer caravan-footer">
      <section className="newsletter-band caravan-newsletter"><div><strong>Get product news, offers and buying guides</strong><span>Useful BJ Electronics updates delivered occasionally.</span></div><NewsletterForm /></section>
      <div className="footer-main caravan-footer-main">
        <div className="footer-brand"><BrandLogo /><p>Your trusted destination for dependable electronics, secure shopping and responsive customer care.</p><div className="footer-contact-list"><a href="mailto:support@bjelectronics.shop">support@bjelectronics.shop</a><span>Bangladesh</span><span>Sat–Thu · 9:00 AM–6:30 PM</span></div></div>
        <div><h3>Shop</h3><Link href="/shop">All products</Link><Link href="/shop?category=Laptops">Laptops</Link><Link href="/shop?category=Headphones">Audio</Link><Link href="/shop?category=Smart%20Watches">Wearables</Link><Link href="/shop?sort=discount">Special offers</Link></div>
        <div><h3>Customer care</h3><Link href="/track-order">Track an order</Link><Link href="/contact">Contact us</Link><Link href="/faq">FAQ</Link><Link href="/policies/shipping">Shipping & delivery</Link><Link href="/policies/returns">Return policy</Link><Link href="/policies/refunds">Refund policy</Link><Link href="/warranty">Warranty information</Link></div>
        <div><h3>Company</h3><Link href="/about">About BJ Electronics</Link><a href="mailto:support@bjelectronics.shop?subject=Careers">Careers</a><a href="mailto:sales@bjelectronics.shop?subject=Business%20sales">Business sales</a><Link href="/policies/privacy">Privacy policy</Link><Link href="/policies/terms">Terms & conditions</Link></div>
        <div><h3>Payment & security</h3><div className="payment-chips"><span>Cash on delivery</span><span>Bank transfer</span></div><p>Only payment methods supported by the secure checkout are displayed.</p><div className="footer-security-note">✓ Secure cart · ✓ Protected order processing</div></div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} BJ Electronics. All rights reserved.</span><span>Smart tech, better life.</span></div>
    </footer>
  );
}
