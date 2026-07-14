import { useState } from "react"
import { motion } from "motion/react"
import {
  Heart, Menu, X, Smartphone, Globe, Music, Users, MapPin,
  QrCode, Edit3, Layout, Type, Image, Palette, Settings,
  LogOut, Eye, Share2, MessageCircle, Clock, Gift, Camera, Home,
  FileText, Bell, Headphones, Check, ArrowRight, Layers,
  Zap, User, TrendingUp, ChevronRight, Monitor, Plus, Sparkles,
  Play, Instagram, Facebook, Twitter,
  CreditCard, Wallet, Building2, Store, Download, RefreshCw,
  CheckCircle2, XCircle, AlertCircle, Copy, Phone, Mail,
  Shield, Search, Filter, Receipt, Star, Package
} from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Toaster, toast } from "sonner"

// ─── TYPE DEFINITIONS ─────────────────────────────────────────────────────────

type Page =
  | "dashboard"
  | "editor"
  | "checkout"
  | "payment-method"
  | "payment-waiting"
  | "payment-success"
  | "payment-failed"
  | "login"
  | "register"

type AuthTab = "login" | "register"

// ─── DATA CONSTANTS ──────────────────────────────────────────────────────────

const SIDEBAR_NAV = [
  { icon: Home, label: "Dashboard" },
  { icon: Layout, label: "Template" },
  { icon: FileText, label: "Undangan Saya" },
  { icon: Edit3, label: "Edit Undangan" },
  { icon: Users, label: "Data Tamu" },
  { icon: MessageCircle, label: "RSVP" },
  { icon: Gift, label: "Amplop Digital" },
  { icon: QrCode, label: "QR Check-In" },
  { icon: Globe, label: "Domain" },
  { icon: Receipt, label: "Transaksi" },
  { icon: Settings, label: "Pengaturan" },
]

const EDITOR_TABS = [
  { icon: Layout, label: "Halaman" },
  { icon: Palette, label: "Tema" },
  { icon: Image, label: "Background" },
  { icon: Type, label: "Font" },
  { icon: Music, label: "Musik" },
  { icon: Camera, label: "Foto" },
]

const PAGES_LIST = ["Opening", "Mempelai", "Akad", "Resepsi", "Galeri", "RSVP", "Ucapan", "Penutup"]

const CHART_DATA = [
  { day: "Sen", views: 120 },
  { day: "Sel", views: 185 },
  { day: "Rab", views: 148 },
  { day: "Kam", views: 220 },
  { day: "Jum", views: 390 },
  { day: "Sab", views: 530 },
  { day: "Min", views: 447 },
]

const PACKAGES = [
  {
    id: "basic",
    name: "Basic",
    subtitle: "Untuk pasangan yang ingin memulai",
    price: 99000,
    originalPrice: null as number | null,
    features: ["1 tema pilihan", "Link undangan digital", "RSVP & ucapan tamu", "Galeri foto 10 item", "Tanpa custom domain", "Berlaku 6 bulan"],
    popular: false,
    color: "border-border",
  },
  {
    id: "standard",
    name: "Standard",
    subtitle: "Paling populer untuk pasangan",
    price: 199000,
    originalPrice: 299000 as number | null,
    features: ["Semua tema + custom", "Custom domain .id", "RSVP & amplop digital", "Galeri foto & video tak terbatas", "Musik latar", "Hitung mundur & Google Maps", "Berlaku 1 tahun"],
    popular: true,
    color: "border-primary",
  },
  {
    id: "premium",
    name: "Premium",
    subtitle: "Pengalaman undangan paling lengkap",
    price: 349000,
    originalPrice: 499000 as number | null,
    features: ["Semua fitur Standard", "Live streaming", "QR Code Check-In", "Layar sapa & counter", "Custom nama tamu", "Support prioritas 24/7", "Berlaku selamanya"],
    popular: false,
    color: "border-border",
  },
]

const MOCK_TRANSACTIONS = [
  { id: "INV-20250112-001", date: "12 Jan 2025", package: "Premium", customer: "Anisa & Raka", method: "BCA Virtual Account", amount: 349000, status: "Paid" },
  { id: "INV-20250110-002", date: "10 Jan 2025", package: "Standard", customer: "Dewi & Fandi", method: "GoPay", amount: 199000, status: "Paid" },
  { id: "INV-20250108-003", date: "8 Jan 2025", package: "Basic", customer: "Rina & Ahmad", method: "QRIS", amount: 99000, status: "Expired" },
  { id: "INV-20250105-004", date: "5 Jan 2025", package: "Premium", customer: "Maya & Bimo", method: "OVO", amount: 349000, status: "Pending" },
  { id: "INV-20250103-005", date: "3 Jan 2025", package: "Standard", customer: "Sari & Deni", method: "BNI Virtual Account", amount: 199000, status: "Failed" },
  { id: "INV-20241228-006", date: "28 Des 2024", package: "Premium", customer: "Hani & Rizki", method: "Mandiri Virtual Account", amount: 349000, status: "Paid" },
  { id: "INV-20241225-007", date: "25 Des 2024", package: "Basic", customer: "Lia & Yusuf", method: "ShopeePay", amount: 99000, status: "Paid" },
]

const fmt = (n: number) => "Rp " + n.toLocaleString("id-ID")

// ─── UTILITY COMPONENTS ───────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, string> = {
    Paid: "bg-green-50 text-green-600 border-green-200",
    Pending: "bg-yellow-50 text-yellow-600 border-yellow-200",
    Expired: "bg-gray-100 text-gray-500 border-gray-200",
    Failed: "bg-red-50 text-red-500 border-red-200",
  }
  return (
    <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full border ${cfg[status] ?? cfg.Expired}`}>
      {status}
    </span>
  )
}

function BankChip({ code, bg, fg }: { code: string; bg: string; fg: string }) {
  return (
    <div
      className="px-2 py-1 rounded-md text-[10px] font-bold tracking-wide flex-shrink-0"
      style={{ backgroundColor: bg, color: fg, minWidth: 40, textAlign: "center" }}
    >
      {code}
    </div>
  )
}

// ─── NAVBAR ──────────────────────────────────────────────────────────────────

function Navbar({ setPage, setAuthTab }: { setPage: (p: Page) => void; setAuthTab: (t: AuthTab) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <button onClick={() => setPage("dashboard")} className="flex items-center gap-2 group">
          <Heart className="w-5 h-5 text-primary fill-primary/20 group-hover:fill-primary/50 transition-all" />
          <span className="font-serif text-xl font-semibold italic">Invito</span>
        </button>
        <div className="hidden md:flex items-center gap-3">
          <button onClick={() => { setAuthTab("login"); setPage("login") }} className="px-4 py-2 text-sm text-foreground hover:text-primary transition-colors">
            Keluar
          </button>
        </div>
        <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
    </nav>
  )
}

// ─── AUTH PAGE ────────────────────────────────────────────────────────────────

function AuthPage({ setPage, initialTab }: { setPage: (p: Page) => void; initialTab: AuthTab }) {
  const [tab, setTab] = useState<AuthTab>(initialTab)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")

  return (
    <div className="min-h-screen bg-secondary flex font-sans">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=900&h=1200&fit=crop&auto=format" alt="wedding" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/20 via-foreground/35 to-foreground/70" />
        <div className="relative z-10 flex flex-col p-12 text-white">
          <button onClick={() => window.location.href = "https://invito.id"} className="flex items-center gap-2 mb-auto">
            <Heart className="w-5 h-5 text-primary fill-primary/30" />
            <span className="font-serif text-xl font-semibold italic">Invito</span>
          </button>
          <blockquote className="font-serif text-2xl italic leading-relaxed mb-5">&ldquo;Hari spesial Anda layak mendapat undangan yang sama spesialnya.&rdquo;</blockquote>
          <div className="flex -space-x-2 mb-2">
            {["1438761681033-6461ffad8d80", "1494790108755-2616b612b977", "1507003211169-0a1dd7228f2d"].map((id, i) => (
              <img key={i} src={`https://images.unsplash.com/photo-${id}?w=40&h=40&fit=crop&auto=format`} className="w-8 h-8 rounded-full border-2 border-white object-cover" alt="user" />
            ))}
          </div>
          <p className="text-sm text-white/65">10.000+ pasangan telah mempercayai kami</p>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <button onClick={() => window.location.href = "https://invito.id"} className="flex items-center gap-2 mb-8 lg:hidden">
            <Heart className="w-5 h-5 text-primary fill-primary/30" />
            <span className="font-serif text-xl font-semibold italic">Invito</span>
          </button>
          <div className="mb-8">
            <h2 className="font-serif text-3xl font-semibold mb-1.5">{tab === "login" ? "Selamat Datang Kembali" : "Mulai Perjalananmu"}</h2>
            <p className="text-muted-foreground text-sm">{tab === "login" ? "Masuk ke akun Invito Anda" : "Buat akun gratis dan buat undangan impian"}</p>
          </div>
          <div className="flex bg-muted rounded-xl p-1 mb-6">
            <button onClick={() => setTab("login")} className={`flex-1 py-2.5 text-sm rounded-lg transition-all ${tab === "login" ? "bg-card shadow-sm font-semibold" : "text-muted-foreground"}`}>Masuk</button>
            <button onClick={() => setTab("register")} className={`flex-1 py-2.5 text-sm rounded-lg transition-all ${tab === "register" ? "bg-card shadow-sm font-semibold" : "text-muted-foreground"}`}>Daftar</button>
          </div>
          <button className="w-full flex items-center justify-center gap-3 py-3.5 border border-border rounded-xl mb-5 hover:bg-muted transition-colors text-sm font-medium">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
            Lanjutkan dengan Google
          </button>
          <div className="flex items-center gap-3 mb-5"><div className="flex-1 h-px bg-border" /><span className="text-xs text-muted-foreground">atau</span><div className="flex-1 h-px bg-border" /></div>
          <div className="space-y-4">
            {tab === "register" && (
              <div>
                <label className="text-sm font-medium mb-1.5 block">Nama Lengkap</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Masukkan nama lengkap Anda" className="w-full px-4 py-3 bg-input-background border border-border rounded-xl text-sm outline-none focus:border-primary transition-colors" />
              </div>
            )}
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="nama@email.com" className="w-full px-4 py-3 bg-input-background border border-border rounded-xl text-sm outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-sm font-medium">Password</label>
                {tab === "login" && <button className="text-xs text-primary hover:underline">Lupa password?</button>}
              </div>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3 bg-input-background border border-border rounded-xl text-sm outline-none focus:border-primary transition-colors" />
            </div>
            <button onClick={() => setPage("dashboard")} className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-all hover:shadow-[0_4px_16px_rgba(196,149,74,0.4)] mt-2">
              {tab === "login" ? "Masuk" : "Buat Akun Gratis"}
            </button>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-6">
            {tab === "login" ? "Belum punya akun? " : "Sudah punya akun? "}
            <button onClick={() => setTab(tab === "login" ? "register" : "login")} className="text-primary hover:underline font-semibold">
              {tab === "login" ? "Daftar sekarang" : "Masuk di sini"}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── DASHBOARD PAGE ──────────────────────────────────────────────────────────

function DashboardPage({ setPage }: { setPage: (p: Page) => void }) {
  const [activeMenu, setActiveMenu] = useState("Dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [txFilter, setTxFilter] = useState("Semua")

  const handleMenu = (label: string) => {
    setActiveMenu(label)
    if (label === "Edit Undangan") setPage("editor")
    setSidebarOpen(false)
  }

  const filtered = txFilter === "Semua" ? MOCK_TRANSACTIONS : MOCK_TRANSACTIONS.filter(t => t.status === txFilter)

  return (
    <div className="flex h-screen bg-muted overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:relative z-40 w-60 h-full bg-sidebar flex flex-col transition-transform duration-300 flex-shrink-0`}>
        <div className="px-5 py-5 border-b border-sidebar-border">
          <button onClick={() => window.location.href = "https://invito.id"} className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary fill-primary/25" />
            <span className="font-serif text-lg font-semibold italic text-sidebar-foreground">Invito</span>
          </button>
        </div>
        <nav className="flex-1 py-3 overflow-y-auto">
          {SIDEBAR_NAV.map(({ icon: Icon, label }) => (
            <button key={label} onClick={() => handleMenu(label)} className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm transition-all ${activeMenu === label ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium" : "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-foreground"}`}>
              <Icon className="w-4 h-4 flex-shrink-0" />{label}
            </button>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-sidebar-border">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0"><User className="w-4 h-4 text-primary" /></div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-sidebar-foreground truncate">Anisa Rahmawati</p>
              <p className="text-[10px] text-sidebar-foreground/45 truncate">anisa@email.com</p>
            </div>
          </div>
          <button onClick={() => setPage("login")} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sidebar-foreground/55 hover:bg-sidebar-accent hover:text-sidebar-foreground text-xs transition-colors">
            <LogOut className="w-3.5 h-3.5" /> Keluar
          </button>
        </div>
      </aside>

      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-foreground/40 z-30 lg:hidden" />}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-card border-b border-border px-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-1.5 rounded-lg hover:bg-muted transition-colors"><Menu className="w-5 h-5" /></button>
            <div>
              <p className="text-sm font-semibold">{activeMenu}</p>
              <p className="text-[11px] text-muted-foreground hidden sm:block">Selamat datang, Anisa!</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-lg hover:bg-muted transition-colors"><Bell className="w-4 h-4" /><span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full" /></button>
            <button onClick={() => setPage("checkout")} className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-xs font-medium flex items-center gap-1.5 hover:bg-primary/90 transition-all hover:shadow-[0_2px_12px_rgba(196,149,74,0.35)]">
              <Plus className="w-3.5 h-3.5" /> Buat Undangan
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-5">
          {activeMenu === "Transaksi" ? (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div>
                  <h2 className="font-semibold">Riwayat Transaksi</h2>
                  <p className="text-xs text-muted-foreground">{MOCK_TRANSACTIONS.length} transaksi total</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <input placeholder="Cari transaksi..." className="pl-8 pr-3 py-2 text-xs border border-border rounded-lg bg-card outline-none focus:border-primary w-40" />
                  </div>
                  <div className="flex bg-card border border-border rounded-lg overflow-hidden">
                    {["Semua", "Paid", "Pending", "Expired", "Failed"].map(f => (
                      <button key={f} onClick={() => setTxFilter(f)} className={`px-2.5 py-2 text-[11px] transition-colors ${txFilter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>{f}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        {["No. Invoice", "Tanggal", "Pelanggan", "Paket", "Metode Bayar", "Total", "Status", ""].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((tx, i) => (
                        <tr key={tx.id} className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                          <td className="px-4 py-3 text-xs font-mono text-primary">{tx.id}</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{tx.date}</td>
                          <td className="px-4 py-3 text-xs font-medium whitespace-nowrap">{tx.customer}</td>
                          <td className="px-4 py-3"><span className="text-xs bg-secondary px-2 py-1 rounded-full">{tx.package}</span></td>
                          <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{tx.method}</td>
                          <td className="px-4 py-3 text-xs font-semibold whitespace-nowrap">{fmt(tx.amount)}</td>
                          <td className="px-4 py-3"><StatusBadge status={tx.status} /></td>
                          <td className="px-4 py-3">
                            <button className="text-[10px] text-primary hover:underline whitespace-nowrap">Detail</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filtered.length === 0 && (
                  <div className="py-12 text-center text-muted-foreground text-sm">Tidak ada transaksi ditemukan</div>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                {[
                  { label: "Total Pendapatan", value: "Rp 1.343.000", icon: TrendingUp, color: "text-green-500 bg-green-50" },
                  { label: "Transaksi Berhasil", value: "4", icon: CheckCircle2, color: "text-primary bg-primary/10" },
                  { label: "Menunggu Bayar", value: "1", icon: Clock, color: "text-yellow-500 bg-yellow-50" },
                  { label: "Transaksi Gagal", value: "2", icon: XCircle, color: "text-red-500 bg-red-50" },
                ].map(({ label, value, icon: Icon, color }, i) => (
                  <div key={i} className="bg-card rounded-xl p-4 border border-border">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${color}`}><Icon className="w-4 h-4" /></div>
                    <p className="text-lg font-bold">{value}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                {[
                  { label: "Total Kunjungan", value: "2.847", change: "+12%", icon: TrendingUp, colorCls: "text-blue-500 bg-blue-50" },
                  { label: "Jumlah Tamu", value: "248", change: "+8 baru", icon: Users, colorCls: "text-primary bg-primary/10" },
                  { label: "RSVP Masuk", value: "186", change: "75%", icon: Check, colorCls: "text-green-500 bg-green-50" },
                  { label: "Amplop Digital", value: "Rp 12,4jt", change: "+450rb", icon: Gift, colorCls: "text-purple-500 bg-purple-50" },
                ].map(({ label, value, change, icon: Icon, colorCls }, i) => (
                  <div key={i} className="bg-card rounded-2xl p-4 border border-border">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colorCls}`}><Icon className="w-4 h-4" /></div>
                      <span className="text-[10px] text-green-600 bg-green-50 rounded-full">{change}</span>
                    </div>
                    <p className="text-xl font-semibold mb-0.5">{value}</p>
                    <p className="text-[11px] text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>
              <div className="grid lg:grid-cols-3 gap-4 mb-5">
                <div className="lg:col-span-2 bg-card rounded-2xl p-5 border border-border">
                  <div className="flex items-center justify-between mb-5">
                    <div><h3 className="text-sm font-semibold">Statistik Kunjungan</h3><p className="text-[11px] text-muted-foreground">7 hari terakhir</p></div>
                    <select className="text-xs border border-border rounded-lg px-2 py-1.5 bg-muted outline-none cursor-pointer"><option>7 hari</option><option>30 hari</option></select>
                  </div>
                  <ResponsiveContainer width="100%" height={190}>
                    <AreaChart data={CHART_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                      <defs>
                        <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#C4954A" stopOpacity={0.18} />
                          <stop offset="95%" stopColor="#C4954A" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#8C7456" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#8C7456" }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: "#fff", border: "1px solid rgba(196,149,74,0.2)", borderRadius: "0.75rem", fontSize: 12 }} cursor={{ stroke: "rgba(196,149,74,0.2)" }} />
                      <Area type="monotone" dataKey="views" stroke="#C4954A" strokeWidth={2} fill="url(#goldGrad)" dot={false} activeDot={{ r: 4, fill: "#C4954A" }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-card rounded-2xl p-5 border border-border">
                  <div className="flex items-center justify-between mb-4"><h3 className="text-sm font-semibold">RSVP Terbaru</h3><button className="text-xs text-primary hover:underline">Lihat semua</button></div>
                  <div className="space-y-3">
                    {[
                      { name: "Dewi Sartika", status: "Hadir", time: "5 mnt lalu" },
                      { name: "Ahmad Fauzi", status: "Hadir", time: "12 mnt lalu" },
                      { name: "Rina Kusuma", status: "Tidak Hadir", time: "1 jam lalu" },
                      { name: "Budi Santoso", status: "Hadir", time: "2 jam lalu" },
                      { name: "Maya Putri", status: "Hadir", time: "3 jam lalu" },
                    ].map(({ name, status, time }, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center text-[11px] font-semibold text-primary flex-shrink-0">{name[0]}</div>
                          <div><p className="text-xs font-medium">{name}</p><p className="text-[10px] text-muted-foreground">{time}</p></div>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${status === "Hadir" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>{status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-2xl p-5 border border-border">
                <div className="flex items-center justify-between mb-4"><h3 className="text-sm font-semibold">Undangan Saya</h3><button onClick={() => setPage("checkout")} className="text-xs text-primary flex items-center gap-1 hover:underline"><Plus className="w-3 h-3" /> Buat baru</button></div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { title: "Anisa & Raka", theme: "Elegant", status: "Published", visits: "2.847" },
                    { title: "Draft Undangan 2", theme: "Floral", status: "Draft", visits: "—" },
                  ].map(({ title, theme, status, visits }, i) => (
                    <div key={i} className="border border-border rounded-xl overflow-hidden group hover:shadow-md transition-all">
                      <div className="h-28 bg-gradient-to-br from-secondary to-accent/40 flex items-center justify-center relative">
                        <p className="font-serif text-base">{title}</p>
                        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <button onClick={() => setPage("editor")} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-full text-xs shadow-md">Edit</button>
                        </div>
                      </div>
                      <div className="px-3.5 py-2.5 flex items-center justify-between">
                        <div><p className="text-xs font-medium">{theme}</p><p className="text-[10px] text-muted-foreground">{visits} kunjungan</p></div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${status === "Published" ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"}`}>{status}</span>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setPage("checkout")} className="border-2 border-dashed border-border rounded-xl min-h-[120px] flex flex-col items-center justify-center gap-2 hover:border-primary hover:text-primary transition-colors text-muted-foreground">
                    <Plus className="w-6 h-6" /><span className="text-xs">Buat Undangan Baru</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

// ─── EDITOR PAGE ──────────────────────────────────────────────────────────────

function EditorPage({ setPage }: { setPage: (p: Page) => void }) {
  const [activeTab, setActiveTab] = useState("Tema")
  const [activeSection, setActiveSection] = useState("Opening")
  const [selectedTheme, setSelectedTheme] = useState(0)
  return (
    <div className="flex h-screen bg-muted overflow-hidden font-sans">
      <div className="w-64 bg-card border-r border-border flex flex-col flex-shrink-0">
        <div className="flex border-b border-border overflow-x-auto">
          {EDITOR_TABS.map(({ icon: Icon, label }) => (
            <button key={label} onClick={() => setActiveTab(label)} className={`flex flex-col items-center gap-1 px-3.5 py-3 flex-shrink-0 text-[10px] transition-colors ${activeTab === label ? "text-primary border-b-2 border-primary bg-primary/5" : "text-muted-foreground hover:text-foreground"}`}>
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === "Halaman" && (
            <div>
              <p className="text-[10px] text-muted-foreground mb-3 font-semibold uppercase tracking-widest">Urutan Halaman</p>
              <div className="space-y-1.5">
                {PAGES_LIST.map((pg, i) => (
                  <div key={pg} onClick={() => setActiveSection(pg)} className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all ${activeSection === pg ? "bg-primary/10 border border-primary/25" : "border border-transparent hover:bg-muted"}`}>
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-semibold flex-shrink-0 ${activeSection === pg ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{i + 1}</div>
                    <span className="text-xs font-medium">{pg}</span>
                    {activeSection === pg && <Check className="w-3 h-3 text-primary ml-auto flex-shrink-0" />}
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === "Tema" && (
            <div>
              <p className="text-[10px] text-muted-foreground mb-3 font-semibold uppercase tracking-widest">Pilih Tema</p>
              <div className="grid grid-cols-2 gap-2">
                {["Elegant", "Floral", "Minimalist", "Modern", "Traditional", "Luxury"].map((name, i) => (
                  <button key={i} onClick={() => setSelectedTheme(i)} className={`relative rounded-xl overflow-hidden aspect-[3/4] border-2 transition-all ${selectedTheme === i ? "border-primary" : "border-transparent hover:border-primary/30"}`}>
                    <div className="w-full h-full bg-secondary" />
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-foreground/60 to-transparent p-2"><p className="text-white text-[10px] font-medium">{name}</p></div>
                    {selectedTheme === i && <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
                  </button>
                ))}
              </div>
            </div>
          )}
          {activeTab !== "Halaman" && activeTab !== "Tema" && (
            <div className="flex flex-col items-center justify-center h-36 text-muted-foreground text-center gap-2">
              <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
                {activeTab === "Background" && <Image className="w-5 h-5" />}
                {activeTab === "Font" && <Type className="w-5 h-5" />}
                {activeTab === "Musik" && <Music className="w-5 h-5" />}
                {activeTab === "Foto" && <Camera className="w-5 h-5" />}
              </div>
              <p className="text-xs">Panel {activeTab}</p>
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-12 bg-card border-b border-border px-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setPage("dashboard")} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"><ChevronRight className="w-3.5 h-3.5 rotate-180" />Dashboard</button>
            <span className="text-muted-foreground/30 select-none">|</span>
            <div className="flex items-center gap-1.5"><Heart className="w-3.5 h-3.5 text-primary fill-primary/20" /><span className="text-xs font-semibold">Anisa & Raka</span></div>
          </div>
          <div className="flex items-center gap-1.5">
            <button className="px-2.5 py-1.5 text-[11px] border border-border rounded-lg hover:bg-muted transition-colors flex items-center gap-1"><Eye className="w-3 h-3" /> Preview</button>
            <button className="px-2.5 py-1.5 text-[11px] border border-border rounded-lg hover:bg-muted transition-colors">Simpan</button>
            <button className="px-2.5 py-1.5 text-[11px] bg-muted rounded-lg hover:bg-muted/80 transition-colors flex items-center gap-1"><Share2 className="w-3 h-3" /> Bagikan</button>
            <button className="px-3.5 py-1.5 text-[11px] bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium">Publish</button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-6 flex items-start justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-[280px] bg-foreground rounded-[2.5rem] p-3 shadow-2xl">
              <div className="w-full bg-background rounded-[2rem] overflow-hidden min-h-[560px]">
                <div className="relative">
                  <div className="w-full h-44 bg-secondary flex items-center justify-center">
                    <span className="text-muted-foreground">Theme Preview</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white" />
                </div>
                <div className="px-6 pb-6 -mt-3 text-center">
                  <p className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground mb-1">The Wedding of</p>
                  <h2 className="font-serif text-2xl font-semibold mb-1">Anisa & Raka</h2>
                  <div className="w-14 h-px bg-primary/35 mx-auto my-3" />
                  <p className="text-[10px] text-muted-foreground">Sabtu, 12 Januari 2025</p>
                  <p className="text-[10px] text-muted-foreground mb-4">Ballroom Hotel Mulia, Jakarta</p>
                  <div className="flex items-center justify-center gap-1.5 mb-5 bg-primary/8 rounded-full py-2 px-4">
                    <Clock className="w-3 h-3 text-primary" /><span className="text-[10px] text-primary font-medium">30 hari lagi</span>
                  </div>
                  <button className="w-full py-2.5 bg-primary text-white text-[11px] rounded-full font-medium">Buka Undangan</button>
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              {PAGES_LIST.slice(0, 5).map(s => (
                <button key={s} onClick={() => setActiveSection(s)} className={`px-3 py-1 text-[11px] rounded-full transition-all ${activeSection === s ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:border-primary"}`}>{s}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="w-60 bg-card border-l border-border flex-shrink-0 overflow-y-auto">
        <div className="px-4 py-3.5 border-b border-border"><h3 className="text-xs font-semibold">Pengaturan Elemen</h3></div>
        <div className="p-4 space-y-5">
          {[{ label: "Warna Background", value: "#FAF8F4" }, { label: "Warna Teks", value: "#2A1F1A" }, { label: "Warna Aksen", value: "#C4954A" }].map(({ label, value }, i) => (
            <div key={i}>
              <label className="text-[10px] text-muted-foreground mb-2 block font-semibold uppercase tracking-wide">{label}</label>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg border border-border shadow-sm" style={{ backgroundColor: value }} />
                <span className="text-[11px] font-mono bg-muted px-2 py-1 rounded-lg">{value}</span>
              </div>
            </div>
          ))}
          <div>
            <label className="text-[10px] text-muted-foreground mb-2 block font-semibold uppercase tracking-wide">Font Judul</label>
            <select className="w-full text-xs border border-border rounded-lg px-3 py-2 bg-muted outline-none focus:border-primary cursor-pointer">
              <option>Playfair Display</option><option>Cormorant Garamond</option><option>Great Vibes</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground mb-2 block font-semibold uppercase tracking-wide">Ukuran Font <span className="font-normal normal-case text-foreground">28px</span></label>
            <input type="range" min="16" max="48" defaultValue="28" className="w-full accent-primary" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── CHECKOUT PAGE ────────────────────────────────────────────────────────────

function CheckoutPage({ setPage }: { setPage: (p: Page) => void }) {
  const [selectedPkg, setSelectedPkg] = useState("standard")
  const [form, setForm] = useState({ name: "", email: "", wa: "", bride: "", groom: "", date: "" })
  const pkg = PACKAGES.find(p => p.id === selectedPkg)!

  return (
    <div className="min-h-screen bg-secondary font-sans">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <button onClick={() => setPage("dashboard")} className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-primary fill-primary/20" />
            <span className="font-serif text-lg font-semibold italic">Invito</span>
          </button>
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5 text-primary font-medium"><div className="w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-[10px]">1</div>Pilih Paket</div>
            <div className="w-8 h-px bg-border" />
            <div className="flex items-center gap-1.5"><div className="w-5 h-5 bg-muted rounded-full flex items-center justify-center text-[10px]">2</div>Metode Bayar</div>
            <div className="w-8 h-px bg-border" />
            <div className="flex items-center gap-1.5"><div className="w-5 h-5 bg-muted rounded-full flex items-center justify-center text-[10px]">3</div>Konfirmasi</div>
          </div>
          <button onClick={() => setPage("dashboard")} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"><ChevronRight className="w-3.5 h-3.5 rotate-180" />Kembali</button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-semibold mb-1">Pilih Paket & Checkout</h1>
          <p className="text-muted-foreground text-sm">Pilih paket yang sesuai dengan kebutuhan Anda</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h2 className="font-semibold mb-4 flex items-center gap-2"><Package className="w-4 h-4 text-primary" />Pilih Paket</h2>
              <div className="space-y-3">
                {PACKAGES.map((p) => (
                  <label key={p.id} onClick={() => setSelectedPkg(p.id)} className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedPkg === p.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                    <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${selectedPkg === p.id ? "border-primary bg-primary" : "border-muted-foreground/30"}`}>
                      {selectedPkg === p.id && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-semibold text-sm">{p.name}</span>
                        {p.popular && <span className="px-1.5 py-0.5 bg-primary text-primary-foreground rounded text-[9px] font-medium">POPULER</span>}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{p.subtitle}</p>
                      <div className="flex flex-wrap gap-1">
                        {p.features.slice(0, 3).map((f, i) => <span key={i} className="text-[10px] bg-muted px-2 py-0.5 rounded-full">{f}</span>)}
                        {p.features.length > 3 && <span className="text-[10px] text-muted-foreground">+{p.features.length - 3} lainnya</span>}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {p.originalPrice && <p className="text-[10px] text-muted-foreground line-through">{fmt(p.originalPrice)}</p>}
                      <p className="font-bold text-foreground">{fmt(p.price)}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border">
              <h2 className="font-semibold mb-4 flex items-center gap-2"><Heart className="w-4 h-4 text-primary" />Detail Undangan</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { label: "Nama Mempelai Wanita", key: "bride", placeholder: "Nama mempelai wanita" },
                  { label: "Nama Mempelai Pria", key: "groom", placeholder: "Nama mempelai pria" },
                  { label: "Tanggal Pernikahan", key: "date", placeholder: "", type: "date" },
                ].map(({ label, key, placeholder, type }) => (
                  <div key={key} className={key === "date" ? "sm:col-span-2" : ""}>
                    <label className="text-xs font-medium mb-1.5 block">{label}</label>
                    <input type={type ?? "text"} placeholder={placeholder} value={(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} className="w-full px-3.5 py-2.5 bg-input-background border border-border rounded-xl text-sm outline-none focus:border-primary transition-colors" />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border">
              <h2 className="font-semibold mb-4 flex items-center gap-2"><User className="w-4 h-4 text-primary" />Data Pemesan</h2>
              <div className="space-y-4">
                {[
                  { label: "Nama Lengkap", key: "name", placeholder: "Masukkan nama lengkap", type: "text" },
                  { label: "Alamat Email", key: "email", placeholder: "nama@email.com", type: "email" },
                  { label: "Nomor WhatsApp", key: "wa", placeholder: "08xxxxxxxxxx", type: "tel" },
                ].map(({ label, key, placeholder, type }) => (
                  <div key={key}>
                    <label className="text-xs font-medium mb-1.5 block">{label}</label>
                    <input type={type} placeholder={placeholder} value={(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} className="w-full px-3.5 py-2.5 bg-input-background border border-border rounded-xl text-sm outline-none focus:border-primary transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-20 lg:self-start">
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h2 className="font-semibold mb-5">Ringkasan Pesanan</h2>
              <div className="bg-gradient-to-br from-secondary to-accent/20 rounded-xl p-4 mb-5 border border-primary/15">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Paket dipilih</p>
                    <p className="font-serif font-semibold">{pkg.name}</p>
                  </div>
                  <span className="text-xs bg-primary/15 text-primary rounded-full px-2 py-0.5">Aktif</span>
                </div>
                <p className="text-xs text-muted-foreground">{pkg.subtitle}</p>
              </div>
              <div className="space-y-2.5 mb-5 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Harga paket</span><span>{fmt(pkg.price)}</span></div>
                {pkg.originalPrice && <div className="flex justify-between text-xs"><span className="text-muted-foreground">Hemat</span><span className="text-green-600">-{fmt(pkg.originalPrice - pkg.price)}</span></div>}
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Biaya layanan</span><span>Gratis</span></div>
                <div className="h-px bg-border" />
                <div className="flex justify-between font-bold"><span>Total Pembayaran</span><span className="text-primary">{fmt(pkg.price)}</span></div>
              </div>
              <button onClick={() => setPage("payment-method")} className="w-full py-3.5 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-all hover:shadow-[0_4px_16px_rgba(196,149,74,0.4)] flex items-center justify-center gap-2">
                Lanjut ke Pembayaran <ArrowRight className="w-4 h-4" />
              </button>
              <div className="mt-4 flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-1"><Shield className="w-3 h-3" />Pembayaran aman</div>
                <div className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Xendit secured</div>
              </div>
            </div>

            <div className="mt-4 bg-card rounded-xl p-4 border border-border">
              <p className="text-xs font-semibold mb-2">Fitur Paket {pkg.name}</p>
              <ul className="space-y-1.5">
                {pkg.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground"><Check className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />{f}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── PAYMENT METHOD PAGE ──────────────────────────────────────────────────────

function PaymentMethodPage({ setPage }: { setPage: (p: Page) => void }) {
  const [activeGroup, setActiveGroup] = useState("va")
  const [selected, setSelected] = useState<string | null>(null)
  const pkg = PACKAGES[1]

  const PAYMENT_GROUPS = [
    {
      id: "va",
      label: "Virtual Account",
      icon: Building2,
      items: [
        { code: "BCA", name: "BCA Virtual Account", fee: "Gratis", bg: "#003D6E", fg: "#FFFFFF" },
        { code: "BNI", name: "BNI Virtual Account", fee: "Gratis", bg: "#E65C00", fg: "#FFFFFF" },
        { code: "BRI", name: "BRI Virtual Account", fee: "Gratis", bg: "#003F87", fg: "#FFFFFF" },
      ],
    },
    {
      id: "ewallet",
      label: "E-Wallet",
      icon: Wallet,
      items: [
        { code: "GOPAY", name: "GoPay", fee: "Gratis", badge: "Populer", bg: "#00AED6", fg: "#FFFFFF" },
        { code: "OVO", name: "OVO", fee: "Gratis", bg: "#4C3494", fg: "#FFFFFF" },
        { code: "DANA", name: "DANA", fee: "Gratis", bg: "#118EEA", fg: "#FFFFFF" },
      ],
    },
    {
      id: "qris",
      label: "QRIS",
      icon: QrCode,
      items: [
        { code: "QRIS", name: "QRIS", fee: "Gratis", badge: "Semua E-Wallet", bg: "#CC0000", fg: "#FFFFFF" },
      ],
    },
  ]

  const group = PAYMENT_GROUPS.find(g => g.id === activeGroup)!

  return (
    <div className="min-h-screen bg-secondary font-sans">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <button onClick={() => window.location.href = "https://invito.id"} className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-primary fill-primary/20" />
            <span className="font-serif text-lg font-semibold italic">Invito</span>
          </button>
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5 text-muted-foreground"><div className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center"><Check className="w-3 h-3" /></div>Pilih Paket</div>
            <div className="w-8 h-px bg-border" />
            <div className="flex items-center gap-1.5 text-primary font-medium"><div className="w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-[10px]">2</div>Metode Bayar</div>
            <div className="w-8 h-px bg-border" />
            <div className="flex items-center gap-1.5"><div className="w-5 h-5 bg-muted rounded-full flex items-center justify-center text-[10px]">3</div>Konfirmasi</div>
          </div>
          <button onClick={() => setPage("checkout")} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"><ChevronRight className="w-3.5 h-3.5 rotate-180" />Kembali</button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-semibold mb-1">Pilih Metode Pembayaran</h1>
          <p className="text-muted-foreground text-sm">Powered by <span className="font-semibold text-foreground">Xendit</span> — Pembayaran aman & terpercaya</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="flex overflow-x-auto border-b border-border">
                {PAYMENT_GROUPS.map(({ id, label, icon: Icon }) => (
                  <button key={id} onClick={() => { setActiveGroup(id); setSelected(null) }} className={`flex items-center gap-2 px-4 py-3.5 text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${activeGroup === id ? "text-primary border-b-2 border-primary bg-primary/5" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
                    <Icon className="w-3.5 h-3.5" />{label}
                  </button>
                ))}
              </div>

              <div className="p-5">
                <p className="text-xs text-muted-foreground mb-4">Pilih {group.label} yang ingin Anda gunakan:</p>
                <div className="space-y-2.5">
                  {group.items.map((item) => (
                    <label key={item.code} onClick={() => setSelected(item.code)} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${selected === item.code ? "border-primary bg-primary/5" : "border-border hover:border-primary/30 hover:bg-muted/30"}`}>
                      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${selected === item.code ? "border-primary bg-primary" : "border-muted-foreground/30"}`}>
                        {selected === item.code && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <BankChip code={item.code} bg={item.bg} fg={item.fg} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.name}</p>
                        {item.badge && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{item.badge}</span>}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-muted-foreground">Biaya admin</p>
                        <p className="text-xs font-medium">{item.fee}</p>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="mt-5 p-4 bg-secondary rounded-xl border border-border">
                  <p className="text-xs font-semibold mb-2">Cara Pembayaran {group.label}:</p>
                  <ol className="space-y-1.5">
                    {activeGroup === "va" && ["Salin nomor Virtual Account yang diberikan", "Buka aplikasi mobile banking atau ATM", "Pilih menu Transfer ke Virtual Account", "Masukkan nomor VA dan konfirmasi pembayaran"].map((s, i) => <li key={i} className="text-xs text-muted-foreground flex gap-2"><span className="text-primary font-medium flex-shrink-0">{i + 1}.</span>{s}</li>)}
                    {activeGroup === "ewallet" && ["Tap tombol 'Bayar Sekarang'", "Anda akan diarahkan ke aplikasi e-wallet", "Konfirmasi pembayaran di aplikasi e-wallet", "Kembali ke halaman ini setelah selesai"].map((s, i) => <li key={i} className="text-xs text-muted-foreground flex gap-2"><span className="text-primary font-medium flex-shrink-0">{i + 1}.</span>{s}</li>)}
                    {activeGroup === "qris" && ["Tap tombol 'Bayar Sekarang'", "QR Code akan ditampilkan di layar", "Buka aplikasi e-wallet atau bank Anda", "Scan QR Code dan konfirmasi pembayaran"].map((s, i) => <li key={i} className="text-xs text-muted-foreground flex gap-2"><span className="text-primary font-medium flex-shrink-0">{i + 1}.</span>{s}</li>)}
                  </ol>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-20 lg:self-start">
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h2 className="font-semibold mb-5">Ringkasan Pembayaran</h2>
              <div className="bg-gradient-to-br from-secondary to-accent/20 rounded-xl p-4 mb-5 border border-primary/15">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center"><Package className="w-4 h-4 text-primary" /></div>
                  <div><p className="text-xs text-muted-foreground">Paket</p><p className="font-semibold text-sm">{pkg.name}</p></div>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex justify-between"><span>Harga paket</span><span>{fmt(pkg.price)}</span></div>
                  <div className="flex justify-between text-green-600"><span>Diskon</span><span>-{fmt(pkg.originalPrice! - pkg.price)}</span></div>
                </div>
                <div className="mt-3 pt-3 border-t border-primary/15 flex justify-between font-bold text-sm">
                  <span>Total</span><span className="text-primary">{fmt(pkg.price)}</span>
                </div>
              </div>

              {selected && (
                <div className="mb-4 p-3 bg-primary/8 rounded-xl border border-primary/20 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium">Metode dipilih</p>
                    <p className="text-xs text-muted-foreground">{group.items.find(i => i.code === selected)?.name}</p>
                  </div>
                </div>
              )}

              <button
                onClick={() => { if (selected) setPage("payment-waiting"); else toast.error("Pilih metode pembayaran terlebih dahulu") }}
                className={`w-full py-3.5 rounded-full text-sm font-medium transition-all flex items-center justify-center gap-2 ${selected ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_4px_16px_rgba(196,149,74,0.4)]" : "bg-muted text-muted-foreground cursor-not-allowed"}`}
              >
                {selected ? <><CreditCard className="w-4 h-4" />Bayar Sekarang</> : "Pilih Metode Dulu"}
              </button>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-[9px] text-muted-foreground">
                <div className="flex items-center gap-1"><Shield className="w-3 h-3" />SSL Encrypted</div>
                <div className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Xendit Secured</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── PAYMENT WAITING PAGE ─────────────────────────────────────────────────────

function PaymentWaitingPage({ setPage }: { setPage: (p: Page) => void }) {
  const pkg = PACKAGES[1]

  return (
    <div className="min-h-screen bg-secondary font-sans">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <button onClick={() => window.location.href = "https://invito.id"} className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-primary fill-primary/20" />
            <span className="font-serif text-lg font-semibold italic">Invito</span>
          </button>
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 bg-yellow-50 text-yellow-600 border border-yellow-200 px-3 py-1 rounded-full">
              <Clock className="w-3 h-3" /> Menunggu Pembayaran
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-yellow-50 border-2 border-yellow-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
          <h1 className="font-serif text-3xl font-semibold mb-2">Selesaikan Pembayaran</h1>
          <p className="text-muted-foreground text-sm">Selesaikan pembayaran sebelum waktu habis</p>
        </div>

        <div className="bg-card rounded-2xl p-6 border border-border mb-5 flex flex-col items-center">
          <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">Batas Waktu Pembayaran</p>
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-xl font-mono font-bold text-primary">23</div>
              <span className="text-[10px] text-muted-foreground mt-1">Jam</span>
            </div>
            <span className="text-primary font-bold text-xl mb-4">:</span>
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-xl font-mono font-bold text-primary">59</div>
              <span className="text-[10px] text-muted-foreground mt-1">Menit</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">Pembayaran akan otomatis dibatalkan jika melewati batas waktu</p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 mb-5">
          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm">BCA Virtual Account</h2>
              <BankChip code="BCA" bg="#003D6E" fg="#FFFFFF" />
            </div>
            <p className="text-xs text-muted-foreground mb-3">Nomor Virtual Account:</p>
            <div className="flex items-center gap-3 p-3.5 bg-secondary rounded-xl border border-border mb-4">
              <span className="font-mono font-bold text-lg tracking-wider flex-1">8808 8088 5050 1234</span>
              <button onClick={() => { navigator.clipboard.writeText("8808808850501234"); toast.success("Nomor VA berhasil disalin!") }} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all">
                <Copy className="w-3 h-3" /> Salin
              </button>
            </div>
            <div className="text-xs space-y-1.5 text-muted-foreground">
              <p className="font-medium text-foreground mb-2">Cara Bayar:</p>
              {["Buka aplikasi BCA Mobile atau m-BCA", "Pilih m-Transfer → BCA Virtual Account", "Masukkan nomor VA di atas", "Konfirmasi pembayaran"].map((s, i) => (
                <div key={i} className="flex gap-2"><span className="text-primary font-medium w-4 flex-shrink-0">{i + 1}.</span>{s}</div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 border border-border">
            <h2 className="font-semibold text-sm mb-4">Detail Pesanan</h2>
            <div className="space-y-3 text-sm mb-5">
              <div className="flex justify-between"><span className="text-muted-foreground">No. Invoice</span><span className="font-mono text-xs text-primary">INV-20250112-001</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Nama</span><span className="font-medium">Anisa Rahmawati</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Mempelai</span><span className="font-medium">Anisa & Raka</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Paket</span><span>{pkg.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Metode</span><span>BCA Virtual Account</span></div>
              <div className="h-px bg-border" />
              <div className="flex justify-between font-bold"><span>Total Bayar</span><span className="text-primary">{fmt(pkg.price)}</span></div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setPage("payment-success")} className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-full text-xs font-medium hover:bg-primary/90 transition-all">
                Cek Status
              </button>
              <button className="flex-1 py-2.5 border border-border rounded-full text-xs hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-1">
                <Download className="w-3 h-3" />Instruksi
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 p-4 bg-yellow-50 rounded-xl border border-yellow-200 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-yellow-700">Jangan tutup halaman ini. Undangan Anda akan aktif otomatis setelah pembayaran berhasil dikonfirmasi. Proses verifikasi maksimal 1×24 jam.</p>
        </div>
      </div>
    </div>
  )
}

// ─── PAYMENT SUCCESS PAGE ─────────────────────────────────────────────────────

function PaymentSuccessPage({ setPage }: { setPage: (p: Page) => void }) {
  const pkg = PACKAGES[1]
  return (
    <div className="min-h-screen bg-secondary font-sans flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}>
          <div className="text-center mb-8">
            <div className="relative inline-block mb-5">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 bg-green-100 rounded-full opacity-40" />
            </div>
            <h1 className="font-serif text-3xl font-semibold text-foreground mb-2">Pembayaran Berhasil!</h1>
            <p className="text-muted-foreground text-sm">Terima kasih, undangan Anda sedang diproses</p>
          </div>

          <div className="bg-card rounded-2xl border border-border overflow-hidden mb-5">
            <div className="bg-gradient-to-r from-green-50 to-primary/5 px-6 py-4 border-b border-border">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">No. Invoice</p>
                <p className="text-xs font-mono font-bold text-primary">INV-20250112-001</p>
              </div>
            </div>
            <div className="p-6 space-y-3 text-sm">
              {[
                { label: "Status", value: <StatusBadge status="Paid" /> },
                { label: "Tanggal Bayar", value: "12 Januari 2025, 14:32 WIB" },
                { label: "Mempelai", value: "Anisa & Raka" },
                { label: "Paket", value: pkg.name },
                { label: "Metode Bayar", value: "BCA Virtual Account" },
                { label: "Total Bayar", value: <span className="font-bold text-primary">{fmt(pkg.price)}</span> },
              ].map(({ label, value }, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-primary/8 rounded-xl border border-primary/20 flex items-start gap-3 mb-6">
            <Heart className="w-4 h-4 text-primary flex-shrink-0 mt-0.5 fill-primary/20" />
            <div>
              <p className="text-xs font-medium text-primary mb-0.5">Undangan sedang diproses</p>
              <p className="text-xs text-muted-foreground">Kami akan mengirimkan notifikasi ke email <strong>anisa@email.com</strong> dan WhatsApp setelah undangan Anda siap dalam 1×24 jam.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => setPage("dashboard")} className="flex-1 py-3.5 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-all hover:shadow-[0_4px_16px_rgba(196,149,74,0.4)] flex items-center justify-center gap-2">
              <Eye className="w-4 h-4" />Lihat Undangan Saya
            </button>
            <button className="flex-1 py-3.5 border border-border rounded-full text-sm hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />Unduh Bukti Bayar
            </button>
          </div>

          <button onClick={() => window.location.href = "https://invito.id"} className="w-full mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors text-center py-2">
            Kembali ke Beranda
          </button>
        </motion.div>
      </div>
    </div>
  )
}

// ─── PAYMENT FAILED PAGE ──────────────────────────────────────────────────────

function PaymentFailedPage({ setPage }: { setPage: (p: Page) => void }) {
  const [reason, setReason] = useState<"failed" | "expired">("expired")
  return (
    <div className="min-h-screen bg-secondary font-sans flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex justify-center mb-6">
            <div className="flex bg-card rounded-lg border border-border p-1">
              <button onClick={() => setReason("expired")} className={`px-3 py-1.5 text-xs rounded-md transition-all ${reason === "expired" ? "bg-yellow-50 text-yellow-600 border border-yellow-200" : "text-muted-foreground"}`}>Kadaluarsa</button>
              <button onClick={() => setReason("failed")} className={`px-3 py-1.5 text-xs rounded-md transition-all ${reason === "failed" ? "bg-red-50 text-red-500 border border-red-200" : "text-muted-foreground"}`}>Gagal</button>
            </div>
          </div>

          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
              {reason === "expired" ? <Clock className="w-12 h-12 text-yellow-500" /> : <XCircle className="w-12 h-12 text-red-500" />}
            </div>
            <h1 className="font-serif text-3xl font-semibold mb-2">
              {reason === "expired" ? "Pembayaran Kadaluarsa" : "Pembayaran Gagal"}
            </h1>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              {reason === "expired"
                ? "Batas waktu pembayaran telah habis. Pesanan Anda dibatalkan secara otomatis."
                : "Terjadi kesalahan saat memproses pembayaran Anda. Silakan coba lagi."}
            </p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6 mb-5">
            <h3 className="font-semibold text-sm mb-3">Detail Transaksi</h3>
            <div className="space-y-2.5 text-sm">
              {[
                { label: "No. Invoice", value: <span className="font-mono text-xs text-muted-foreground">INV-20250112-001</span> },
                { label: "Status", value: <StatusBadge status={reason === "expired" ? "Expired" : "Failed"} /> },
                { label: "Paket", value: "Standard" },
                { label: "Jumlah", value: fmt(199000) },
                { label: "Alasan", value: <span className="text-xs text-red-500">{reason === "expired" ? "Waktu pembayaran habis (24 jam)" : "Transaksi ditolak oleh bank"}</span> },
              ].map(({ label, value }, i) => (
                <div key={i} className="flex justify-between items-center"><span className="text-muted-foreground">{label}</span>{value}</div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 mb-5">
            <button onClick={() => setPage("payment-method")} className="w-full py-3.5 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-all hover:shadow-[0_4px_16px_rgba(196,149,74,0.4)] flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" />Coba Lagi dengan Metode Lain
            </button>
            <button onClick={() => setPage("payment-waiting")} className="w-full py-3.5 border border-border rounded-full text-sm hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" />Gunakan Metode Sama
            </button>
          </div>

          <div className="p-5 bg-card rounded-2xl border border-border">
            <p className="text-xs font-semibold mb-3 flex items-center gap-2"><Headphones className="w-4 h-4 text-primary" />Butuh Bantuan?</p>
            <p className="text-xs text-muted-foreground mb-3">Hubungi tim customer service kami jika Anda mengalami masalah pembayaran.</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-border rounded-full text-xs hover:border-primary hover:text-primary transition-all">
                <MessageCircle className="w-3.5 h-3.5" />WhatsApp CS
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-border rounded-full text-xs hover:border-primary hover:text-primary transition-all">
                <Mail className="w-3.5 h-3.5" />Email Support
              </button>
            </div>
            <p className="text-center text-[10px] text-muted-foreground mt-3">Tersedia Senin–Sabtu, 08.00–21.00 WIB</p>
          </div>

          <button onClick={() => window.location.href = "https://invito.id"} className="w-full mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors text-center py-2">
            Kembali ke Beranda
          </button>
        </motion.div>
      </div>
    </div>
  )
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState<Page>("dashboard")
  const [authTab, setAuthTab] = useState<AuthTab>("login")

  const render = () => {
    switch (page) {
      case "login": return <AuthPage setPage={setPage} initialTab={authTab} />
      case "dashboard": return <DashboardPage setPage={setPage} />
      case "editor": return <EditorPage setPage={setPage} />
      case "checkout": return <CheckoutPage setPage={setPage} />
      case "payment-method": return <PaymentMethodPage setPage={setPage} />
      case "payment-waiting": return <PaymentWaitingPage setPage={setPage} />
      case "payment-success": return <PaymentSuccessPage setPage={setPage} />
      case "payment-failed": return <PaymentFailedPage setPage={setPage} />
      default: return <DashboardPage setPage={setPage} />
    }
  }

  return (
    <>
      {render()}
      <Toaster position="top-center" richColors />
    </>
  )
}