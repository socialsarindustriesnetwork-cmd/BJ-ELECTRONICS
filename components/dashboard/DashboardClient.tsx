"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type SVGProps } from "react";
import type { AuthUser } from "@/lib/auth-types";
import styles from "./dashboard.module.css";

type IconName =
  | "home" | "orders" | "products" | "inventory" | "customers" | "marketing"
  | "storefront" | "analytics" | "team" | "integrations" | "settings" | "search"
  | "bell" | "sun" | "moon" | "menu" | "plus" | "download" | "logout" | "shield"
  | "chevron" | "more" | "arrow";

const paths: Record<IconName, React.ReactNode> = {
  home: <><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></>,
  orders: <><path d="M6 3h12l1 18H5L6 3Z"/><path d="M9 7a3 3 0 0 0 6 0"/></>,
  products: <><path d="m12 2 8 4.5v9L12 20l-8-4.5v-9L12 2Z"/><path d="m4.5 6.8 7.5 4.3 7.5-4.3"/><path d="M12 20v-8.9"/></>,
  inventory: <><path d="M4 5h16v15H4z"/><path d="M8 5V2h8v3"/><path d="M8 10h8"/></>,
  customers: <><circle cx="9" cy="8" r="3"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="9" r="2"/><path d="M16 14.5A4.5 4.5 0 0 1 21 19"/></>,
  marketing: <><path d="m3 11 12-6v14L3 13v-2Z"/><path d="M7 14v6h4v-4"/></>,
  storefront: <><path d="M3 9h18l-2-6H5L3 9Z"/><path d="M5 9v11h14V9"/><path d="M9 20v-6h6v6"/></>,
  analytics: <><path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/></>,
  team: <><circle cx="8" cy="8" r="3"/><circle cx="17" cy="8" r="3"/><path d="M2 20a6 6 0 0 1 12 0"/><path d="M12 20a6 6 0 0 1 10 0"/></>,
  integrations: <><path d="M8 3v4M16 3v4"/><path d="M5 7h14v4a7 7 0 0 1-14 0V7Z"/><path d="M12 18v3"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"/></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
  sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4"/></>,
  moon: <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z"/>,
  menu: <path d="M4 6h16M4 12h16M4 18h16"/>,
  plus: <path d="M12 5v14M5 12h14"/>,
  download: <><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></>,
  logout: <><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/><path d="M14 3h7v18h-7"/></>,
  shield: <><path d="M12 2 4 5v6c0 5 3.4 9 8 11 4.6-2 8-6 8-11V5l-8-3Z"/><path d="m9 12 2 2 4-5"/></>,
  chevron: <path d="m9 6 6 6-6 6"/>,
  more: <><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>,
  arrow: <path d="m9 18 6-6-6-6"/>,
};

function Icon({ name, size = 20, ...props }: SVGProps<SVGSVGElement> & { name: IconName; size?: number }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width={size} height={size} fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {paths[name]}
    </svg>
  );
}

const navigation: { label: string; icon: IconName; badge?: string }[] = [
  { label: "Overview", icon: "home" },
  { label: "Orders", icon: "orders", badge: "148" },
  { label: "Products", icon: "products" },
  { label: "Inventory", icon: "inventory", badge: "12" },
  { label: "Customers", icon: "customers" },
  { label: "Marketing", icon: "marketing" },
  { label: "Storefront", icon: "storefront" },
  { label: "Analytics", icon: "analytics" },
];

const adminNavigation: { label: string; icon: IconName }[] = [
  { label: "Team & roles", icon: "team" },
  { label: "Integrations", icon: "integrations" },
  { label: "Settings", icon: "settings" },
];

const metrics = [
  { label: "Gross sales", value: "$128,420", change: "+12.8%", positive: true, helper: "vs. previous period" },
  { label: "Orders", value: "1,842", change: "+8.4%", positive: true, helper: "148 awaiting action" },
  { label: "Average order", value: "$69.72", change: "+3.1%", positive: true, helper: "across all channels" },
  { label: "Refunds", value: "$3,182", change: "-1.6%", positive: true, helper: "2.48% of sales" },
];

const orders = [
  { id: "#BJE-10482", customer: "Aarav Rahman", items: 3, total: "$1,249.00", payment: "Paid", fulfilment: "Processing", time: "6 min ago" },
  { id: "#BJE-10481", customer: "Nabila Hasan", items: 1, total: "$799.00", payment: "Paid", fulfilment: "Packed", time: "18 min ago" },
  { id: "#BJE-10480", customer: "Sakib Ahmed", items: 2, total: "$428.50", payment: "Pending", fulfilment: "On hold", time: "31 min ago" },
  { id: "#BJE-10479", customer: "Mariam Chowdhury", items: 4, total: "$2,106.00", payment: "Paid", fulfilment: "Shipped", time: "52 min ago" },
];

const inventoryAlerts = [
  { product: "NovaBook Pro 14", sku: "NBP14-512-SL", stock: 4 },
  { product: "Pulse ANC Headphones", sku: "PAH-02-BK", stock: 7 },
  { product: "Arc 65W GaN Charger", sku: "ARC65-WH", stock: 9 },
];

function initials(name: string): string {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "BJ";
}

function roleLabel(role: AuthUser["role"]): string {
  return role.toLowerCase().split("_").map((part) => part[0].toUpperCase() + part.slice(1)).join(" ");
}

function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem("bj-theme");
    const next = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.dataset.theme = next ? "dark" : "light";
    setDark(next);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    localStorage.setItem("bj-theme", next ? "dark" : "light");
  }

  return (
    <button className={styles.iconButton} onClick={toggle} aria-label={dark ? "Use light theme" : "Use dark theme"}>
      <Icon name={dark ? "sun" : "moon"} size={18} />
    </button>
  );
}

function RevenueChart() {
  const points = "0,144 42,127 84,133 126,96 168,104 210,72 252,80 294,49 336,61 378,31 420,44 462,22 504,34 546,11";
  return (
    <div className={styles.chart} role="img" aria-label="Revenue increased during the last 30 days">
      <div className={styles.chartGrid} />
      <svg viewBox="0 0 546 160" preserveAspectRatio="none">
        <defs>
          <linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="var(--brand-blue)" stopOpacity=".3" />
            <stop offset="1" stopColor="var(--brand-blue)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="chart-line" x1="0" x2="1">
            <stop offset="0" stopColor="var(--brand-blue)" />
            <stop offset="1" stopColor="var(--brand-red)" />
          </linearGradient>
        </defs>
        <polygon points={`${points} 546,160 0,160`} fill="url(#chart-fill)" />
        <polyline points={points} fill="none" stroke="url(#chart-line)" strokeWidth="4" strokeLinecap="round" />
        <circle cx="546" cy="11" r="5" fill="var(--brand-red)" />
      </svg>
      <div className={styles.chartAxis}><span>Jul 1</span><span>Jul 8</span><span>Jul 15</span><span>Jul 22</span><span>Today</span></div>
    </div>
  );
}

export function DashboardClient({ user }: { user: AuthUser }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const userInitials = useMemo(() => initials(user.name), [user.name]);

  async function signOut() {
    setSigningOut(true);
    try {
      await fetch("/api/auth/sign-out", { method: "POST" });
    } finally {
      router.replace("/sign-in");
      router.refresh();
    }
  }

  return (
    <div className={styles.shell}>
      <button className={`${styles.backdrop} ${menuOpen ? styles.backdropVisible : ""}`} onClick={() => setMenuOpen(false)} aria-label="Close navigation" />

      <aside className={`${styles.sidebar} ${menuOpen ? styles.sidebarOpen : ""}`}>
        <div className={styles.logo}>
          <Image className={styles.logoLight} src="/brand/logos/bj-electronics-horizontal.svg" alt="BJ Electronics" width={234} height={72} priority />
          <Image className={styles.logoDark} src="/brand/logos/bj-electronics-horizontal-dark.svg" alt="BJ Electronics" width={234} height={72} priority />
        </div>

        <button className={styles.workspace}>
          <span className={styles.workspaceMark}>BJ</span>
          <span><strong>BJ Electronics</strong><small>Primary store</small></span>
          <Icon name="chevron" size={15} />
        </button>

        <nav aria-label="Primary navigation">
          <p className={styles.navLabel}>Workspace</p>
          {navigation.map((item, index) => (
            <button key={item.label} className={`${styles.navItem} ${index === 0 ? styles.navActive : ""}`}>
              <Icon name={item.icon} size={19} /><span>{item.label}</span>{item.badge && <em>{item.badge}</em>}
            </button>
          ))}
          <p className={styles.navLabel}>Administration</p>
          {adminNavigation.map((item) => (
            <button key={item.label} className={styles.navItem}>
              <Icon name={item.icon} size={19} /><span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <span className={styles.userAvatar}>{userInitials}</span>
          <span><strong>{user.name}</strong><small>{roleLabel(user.role)}</small></span>
          <button onClick={() => setProfileOpen((value) => !value)} aria-label="Account menu"><Icon name="more" size={18} /></button>
          {profileOpen && (
            <div className={styles.profileMenu}>
              <div><strong>{user.email}</strong><small>Authenticated session</small></div>
              <button onClick={signOut} disabled={signingOut}><Icon name="logout" size={16} />{signingOut ? "Signing out..." : "Sign out"}</button>
            </div>
          )}
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <button className={`${styles.iconButton} ${styles.mobileMenu}`} onClick={() => setMenuOpen(true)} aria-label="Open navigation"><Icon name="menu" /></button>
          <div className={styles.breadcrumb}><span>Admin</span><Icon name="chevron" size={13} /><strong>Overview</strong></div>
          <button className={styles.search}><Icon name="search" size={18} /><span>Search products, orders, customers...</span><kbd>⌘ K</kbd></button>
          <div className={styles.topActions}>
            <ThemeToggle />
            <button className={`${styles.iconButton} ${styles.notification}`} aria-label="Notifications"><Icon name="bell" size={18} /><span /></button>
            <button className={styles.avatarButton} onClick={() => setProfileOpen((value) => !value)}>{userInitials}</button>
          </div>
        </header>

        <main className={styles.content}>
          <section className={styles.heading}>
            <div><p className={styles.eyebrow}>Secure administration session</p><h1>Good afternoon, {user.name.split(" ")[0]}</h1><p>Here is what is happening across BJ Electronics today.</p></div>
            <div className={styles.headingActions}><button className={styles.secondaryButton}><Icon name="download" size={17} />Export</button><button className={styles.primaryButton}><Icon name="plus" size={17} />Add product</button></div>
          </section>

          <section className={styles.securityStrip}>
            <div className={styles.securityBadge}><Icon name="shield" size={18} /></div>
            <div><strong>Authentication is active</strong><span>Signed in as {user.email} with {roleLabel(user.role)} access.</span></div>
            <span className={styles.secureState}>Protected</span>
          </section>

          <section className={styles.metrics}>
            {metrics.map((metric) => (
              <article key={metric.label} className={styles.metricCard}>
                <div><span>{metric.label}</span><button aria-label={`More options for ${metric.label}`}><Icon name="more" size={17} /></button></div>
                <strong>{metric.value}</strong>
                <p><b className={metric.positive ? styles.positive : styles.negative}>{metric.change}</b><span>{metric.helper}</span></p>
              </article>
            ))}
          </section>

          <section className={styles.dashboardGrid}>
            <article className={styles.panel}>
              <div className={styles.panelHeader}><div><span className={styles.panelKicker}>Performance</span><h2>Revenue overview</h2></div><button className={styles.rangeButton}>Last 30 days <Icon name="chevron" size={14} /></button></div>
              <RevenueChart />
            </article>

            <article className={styles.panel}>
              <div className={styles.panelHeader}><div><span className={styles.panelKicker}>Live operations</span><h2>Needs attention</h2></div></div>
              <div className={styles.attentionList}>
                <button><span className={styles.attentionIcon}>!</span><span><strong>148 orders</strong><small>Awaiting fulfilment</small></span><Icon name="arrow" size={16} /></button>
                <button><span className={styles.attentionIcon}>↻</span><span><strong>7 returns</strong><small>Require approval</small></span><Icon name="arrow" size={16} /></button>
                <button><span className={styles.attentionIcon}>$</span><span><strong>3 payments</strong><small>Failed processing</small></span><Icon name="arrow" size={16} /></button>
              </div>
            </article>
          </section>

          <section className={styles.lowerGrid}>
            <article className={styles.panel}>
              <div className={styles.panelHeader}><div><span className={styles.panelKicker}>Commerce</span><h2>Recent orders</h2></div><button className={styles.textButton}>View all</button></div>
              <div className={styles.tableWrap}>
                <table>
                  <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Fulfilment</th><th>Created</th></tr></thead>
                  <tbody>{orders.map((order) => (
                    <tr key={order.id}><td><strong>{order.id}</strong></td><td>{order.customer}</td><td>{order.items}</td><td><strong>{order.total}</strong></td><td><span className={`${styles.status} ${order.payment === "Paid" ? styles.statusSuccess : styles.statusWarning}`}>{order.payment}</span></td><td><span className={styles.status}>{order.fulfilment}</span></td><td>{order.time}</td></tr>
                  ))}</tbody>
                </table>
              </div>
            </article>

            <article className={styles.panel}>
              <div className={styles.panelHeader}><div><span className={styles.panelKicker}>Stock control</span><h2>Low inventory</h2></div><button className={styles.textButton}>View all</button></div>
              <div className={styles.stockList}>{inventoryAlerts.map((item) => (
                <div key={item.sku}><span className={styles.productMark}>{item.product.slice(0, 2).toUpperCase()}</span><span><strong>{item.product}</strong><small>{item.sku}</small></span><b>{item.stock} left</b></div>
              ))}</div>
            </article>
          </section>
        </main>
      </div>
    </div>
  );
}
