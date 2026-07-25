"use client";

import Image from "next/image";
import { useEffect, useState, type SVGProps } from "react";

type IconName = "home" | "orders" | "products" | "inventory" | "customers" | "marketing" | "storefront" | "analytics" | "team" | "integrations" | "settings" | "search" | "bell" | "sun" | "moon" | "menu" | "plus" | "arrow" | "more" | "chevron" | "spark" | "calendar" | "download";

const iconPaths: Record<IconName, React.ReactNode> = {
  home: <><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></>,
  orders: <><path d="M6 3h12l1 18H5L6 3Z"/><path d="M9 7a3 3 0 0 0 6 0"/></>,
  products: <><path d="m12 2 8 4.5v9L12 20l-8-4.5v-9L12 2Z"/><path d="m4.5 6.8 7.5 4.3 7.5-4.3"/><path d="M12 20v-8.9"/></>,
  inventory: <><path d="M4 5h16v15H4z"/><path d="M8 5V2h8v3"/><path d="M8 10h8"/></>,
  customers: <><circle cx="9" cy="8" r="3"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="9" r="2"/><path d="M16 14.5A4.5 4.5 0 0 1 21 19"/></>,
  marketing: <><path d="m3 11 12-6v14L3 13v-2Z"/><path d="M7 14v6h4v-4"/><path d="M18 8a4 4 0 0 1 0 8"/></>,
  storefront: <><path d="M3 9h18l-2-6H5L3 9Z"/><path d="M5 9v11h14V9"/><path d="M9 20v-6h6v6"/><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/></>,
  analytics: <><path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/></>,
  team: <><circle cx="8" cy="8" r="3"/><circle cx="17" cy="8" r="3"/><path d="M2 20a6 6 0 0 1 12 0"/><path d="M12 20a6 6 0 0 1 10 0"/></>,
  integrations: <><path d="M8 3v4"/><path d="M16 3v4"/><path d="M5 7h14v4a7 7 0 0 1-14 0V7Z"/><path d="M12 18v3"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>, bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
  sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>, moon: <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z"/>,
  menu: <path d="M4 6h16M4 12h16M4 18h16"/>, plus: <path d="M12 5v14M5 12h14"/>, arrow: <path d="m9 18 6-6-6-6"/>, more: <><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>, chevron: <path d="m9 6 6 6-6 6"/>,
  spark: <><path d="m12 3 1.2 4.8L18 9l-4.8 1.2L12 15l-1.2-4.8L6 9l4.8-1.2L12 3Z"/><path d="m19 15 .6 2.4L22 18l-2.4.6L19 21l-.6-2.4L16 18l2.4-.6L19 15Z"/></>, calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>, download: <><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></>,
};

function Icon({ name, size = 20, ...props }: SVGProps<SVGSVGElement> & { name: IconName; size?: number }) { return <svg aria-hidden="true" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>{iconPaths[name]}</svg>; }

const navigation: { label: string; icon: IconName; badge?: string }[] = [
  { label: "Overview", icon: "home" }, { label: "Orders", icon: "orders", badge: "148" }, { label: "Products", icon: "products" }, { label: "Inventory", icon: "inventory", badge: "12" }, { label: "Customers", icon: "customers" }, { label: "Marketing", icon: "marketing" }, { label: "Storefront", icon: "storefront" }, { label: "Analytics", icon: "analytics" },
];
const adminNavigation: { label: string; icon: IconName }[] = [{ label: "Team & roles", icon: "team" }, { label: "Integrations", icon: "integrations" }, { label: "Settings", icon: "settings" }];
const metrics = [
  { label: "Gross sales", value: "$128,420", change: "+12.8%", trend: "up", helper: "vs. previous period" }, { label: "Orders", value: "1,842", change: "+8.4%", trend: "up", helper: "148 awaiting action" }, { label: "Average order", value: "$69.72", change: "+3.1%", trend: "up", helper: "across all channels" }, { label: "Refunds", value: "$3,182", change: "-1.6%", trend: "down", helper: "2.48% of sales" },
];
const orders = [
  { id: "#BJE-10482", customer: "Aarav Rahman", items: 3, total: "$1,249.00", payment: "Paid", fulfilment: "Processing", time: "6 min ago" }, { id: "#BJE-10481", customer: "Nabila Hasan", items: 1, total: "$799.00", payment: "Paid", fulfilment: "Packed", time: "18 min ago" }, { id: "#BJE-10480", customer: "Sakib Ahmed", items: 2, total: "$428.50", payment: "Pending", fulfilment: "On hold", time: "31 min ago" }, { id: "#BJE-10479", customer: "Mariam Chowdhury", items: 4, total: "$2,106.00", payment: "Paid", fulfilment: "Shipped", time: "52 min ago" }, { id: "#BJE-10478", customer: "Farhan Karim", items: 1, total: "$189.00", payment: "Refunded", fulfilment: "Returned", time: "1 hr ago" },
];
const inventoryAlerts = [{ product: "NovaBook Pro 14", sku: "NBP14-512-SL", stock: 4, location: "Main warehouse" }, { product: "Pulse ANC Headphones", sku: "PAH-02-BK", stock: 7, location: "Main warehouse" }, { product: "Arc 65W GaN Charger", sku: "ARC65-WH", stock: 9, location: "Dhaka showroom" }];

function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => { const saved = localStorage.getItem("bj-theme"); const next = saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches; document.documentElement.dataset.theme = next ? "dark" : "light"; setDark(next); }, []);
  const toggle = () => { const next = !dark; setDark(next); document.documentElement.dataset.theme = next ? "dark" : "light"; localStorage.setItem("bj-theme", next ? "dark" : "light"); };
  return <button className="icon-button" onClick={toggle} aria-label={dark ? "Use light theme" : "Use dark theme"}><Icon name={dark ? "sun" : "moon"} size={18}/></button>;
}

function RevenueChart() {
  const points = "0,140 44,123 88,130 132,93 176,103 220,68 264,78 308,47 352,59 396,26 440,43 484,18 528,31 572,8";
  return <div className="chart-shell" role="img" aria-label="Revenue increased over the last 30 days"><div className="chart-grid"/><svg viewBox="0 0 572 160" preserveAspectRatio="none" className="chart-svg"><defs><linearGradient id="revenueFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="var(--brand-blue)" stopOpacity=".28"/><stop offset="1" stopColor="var(--brand-blue)" stopOpacity="0"/></linearGradient><linearGradient id="revenueLine" x1="0" x2="1"><stop offset="0" stopColor="var(--brand-blue)"/><stop offset="1" stopColor="var(--brand-red)"/></linearGradient></defs><polygon points={`${points} 572,160 0,160`} fill="url(#revenueFill)"/><polyline points={points} fill="none" stroke="url(#revenueLine)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/><circle cx="572" cy="8" r="5" fill="var(--brand-red)"/></svg><div className="chart-axis"><span>Jul 1</span><span>Jul 8</span><span>Jul 15</span><span>Jul 22</span><span>Today</span></div></div>;
}

export default function DashboardPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  return <div className="app-shell">
    <button className={`mobile-backdrop ${menuOpen ? "visible" : ""}`} aria-label="Close navigation" onClick={() => setMenuOpen(false)}/>
    <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
      <div className="brand-lockup"><Image className="logo-light" src="/brand/logos/bj-electronics-horizontal.svg" alt="BJ Electronics" width={234} height={72} priority/><Image className="logo-dark" src="/brand/logos/bj-electronics-horizontal-dark.svg" alt="BJ Electronics" width={234} height={72} priority/></div>
      <div className="workspace-switcher"><span className="workspace-mark">BJ</span><span><strong>BJ Electronics</strong><small>Primary store</small></span><Icon name="chevron" size={16}/></div>
      <nav aria-label="Main navigation"><p className="nav-label">Workspace</p>{navigation.map((item,index)=><button key={item.label} className={`nav-item ${index===0?"active":""}`}><Icon name={item.icon} size={19}/><span>{item.label}</span>{item.badge&&<em>{item.badge}</em>}</button>)}<p className="nav-label admin-label">Administration</p>{adminNavigation.map(item=><button key={item.label} className="nav-item"><Icon name={item.icon} size={19}/><span>{item.label}</span></button>)}</nav>
      <div className="sidebar-footer"><div className="user-avatar">RA</div><span><strong>Rafi Admin</strong><small>Super administrator</small></span><Icon name="more" size={18}/></div>
    </aside>
    <div className="main-column"><header className="topbar"><button className="icon-button mobile-menu" onClick={()=>setMenuOpen(true)} aria-label="Open navigation"><Icon name="menu"/></button><div className="breadcrumb"><span>Admin</span><Icon name="chevron" size={14}/><strong>Overview</strong></div><button className="global-search"><Icon name="search" size={18}/><span>Search products, orders, customers...</span><kbd>⌘ K</kbd></button><div className="topbar-actions"><ThemeToggle/><button className="icon-button notification-button" aria-label="Notifications"><Icon name="bell" size={18}/><span/></button><button className="avatar-button">RA</button></div></header>
      <main className="content-area">
        <section className="page-heading"><div><p className="eyebrow">Saturday, July 25</p><h1>Good afternoon, Rafi</h1><p>Here is what is happening across BJ Electronics today.</p></div><div className="heading-actions"><button className="secondary-button"><Icon name="download" size={17}/> Export</button><button className="primary-button"><Icon name="plus" size={18}/> Add product</button></div></section>
        <section className="metrics-grid" aria-label="Business metrics">{metrics.map(metric=><article className="metric-card" key={metric.label}><div className="metric-top"><span>{metric.label}</span><button aria-label={`More options for ${metric.label}`}><Icon name="more" size={18}/></button></div><strong>{metric.value}</strong><div className="metric-bottom"><b className={metric.trend}>{metric.change}</b><span>{metric.helper}</span></div></article>)}</section>
        <section className="dashboard-grid"><article className="panel revenue-panel"><div className="panel-header"><div><p className="panel-kicker">Performance</p><h2>Revenue overview</h2></div><div className="panel-actions"><button className="filter-button"><Icon name="calendar" size={16}/> Last 30 days</button><button className="icon-button"><Icon name="more" size={18}/></button></div></div><div className="revenue-summary"><strong>$128,420</strong><span><b>+12.8%</b> compared with previous period</span></div><RevenueChart/></article>
          <article className="panel attention-panel"><div className="panel-header"><div><p className="panel-kicker">Operations</p><h2>Needs attention</h2></div><button className="text-button">View all <Icon name="arrow" size={15}/></button></div><div className="attention-list"><div><span className="attention-icon blue"><Icon name="orders" size={19}/></span><p><strong>148 orders</strong><small>Awaiting fulfilment</small></p><b>148</b></div><div><span className="attention-icon red"><Icon name="inventory" size={19}/></span><p><strong>12 products</strong><small>Low inventory warning</small></p><b>12</b></div><div><span className="attention-icon amber"><Icon name="orders" size={19}/></span><p><strong>7 payments</strong><small>Require manual review</small></p><b>7</b></div><div><span className="attention-icon green"><Icon name="customers" size={19}/></span><p><strong>21 messages</strong><small>Customer support queue</small></p><b>21</b></div></div></article></section>
        <section className="lower-grid"><article className="panel orders-panel"><div className="panel-header"><div><p className="panel-kicker">Commerce</p><h2>Recent orders</h2></div><button className="text-button">View all orders <Icon name="arrow" size={15}/></button></div><div className="table-scroll"><table><thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Fulfilment</th><th>Placed</th><th/></tr></thead><tbody>{orders.map(order=><tr key={order.id}><td><strong className="order-id">{order.id}</strong></td><td>{order.customer}</td><td>{order.items}</td><td><strong>{order.total}</strong></td><td><span className={`status ${order.payment.toLowerCase()}`}>{order.payment}</span></td><td><span className="fulfilment-status">{order.fulfilment}</span></td><td className="muted-cell">{order.time}</td><td><button className="row-action" aria-label={`Open ${order.id}`}><Icon name="more" size={18}/></button></td></tr>)}</tbody></table></div></article>
          <article className="panel inventory-panel"><div className="panel-header"><div><p className="panel-kicker">Inventory</p><h2>Low stock</h2></div><button className="text-button">Inventory <Icon name="arrow" size={15}/></button></div><div className="inventory-list">{inventoryAlerts.map(item=><div key={item.sku}><span className="product-thumb"><Icon name="products" size={20}/></span><p><strong>{item.product}</strong><small>{item.sku} · {item.location}</small></p><span className="stock-count"><strong>{item.stock}</strong><small>left</small></span></div>)}</div><button className="restock-button"><Icon name="spark" size={18}/> Create restock plan</button></article></section>
      </main>
    </div>
  </div>;
}
