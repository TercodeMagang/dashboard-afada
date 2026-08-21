import { useState, useEffect, useRef } from "react"
import { motion } from "motion/react"
import {
  Heart, Menu, X, Globe, Music, Users, MapPin,
  QrCode, Edit3, Layout, Type, Image, Palette, Settings,
  LogOut, Eye, Share2, MessageCircle, Clock, Gift, Camera, Home,
  FileText, Bell, Headphones, Check, ArrowRight,
  User, UserPlus, TrendingUp, ChevronRight, Plus,
  Play,
  CreditCard, Wallet, Building2, Download, RefreshCw,
  CheckCircle2, XCircle, AlertCircle, Copy, Mail, Pause, Upload, Trash2,
  Shield, Search, Receipt, Package, Lock
} from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Toaster, toast } from "sonner"
// ─── TYPE DEFINITIONS ────────────────────────────────────────────────────────
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
  | "templates"
  | "my-invitations"
  | "guest-data"
  | "rsvp"
  | "digital-envelope"
  | "qr-checkin"
  | "domain"
  | "settings"
  | "admin-access"
  | "user-access"

type AuthTab = "login" | "register"
type UserInfo = { name: string; email: string; phone: string }
type UserAccount = { id: number; name: string; email: string; photo: string | null; password: string; role?: string }
// ── DATA CONSTANTS ──────────────────────────────────────────────────────────
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
  { icon: Shield, label: "Akses Admin" },
  { icon: UserPlus, label: "Akses Pengguna" },
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
const THEMES = [
  { name: "Elegant", img: "1519225421980-715cb0215aed" },
  { name: "Floral", img: "1550005809-91ad75fb315f" },
  { name: "Minimalist", img: "1464366400600-7168b8af9bc3" },
  { name: "Modern", img: "1469371670807-013ccf25f16a" },
  { name: "Traditional", img: "1583939003579-730e3918a45a" },
  { name: "Luxury", img: "1519741497674-611481863552" },
]
// Helper untuk cari gambar berdasarkan nama tema
// Helper untuk cari gambar berdasarkan nama tema
const getThemeImage = (themeName: string) => {
  const theme = THEMES.find(t => t.name.toLowerCase() === themeName?.toLowerCase())
  return theme ? `https://images.unsplash.com/photo-${theme.img}?w=400&h=200&fit=crop&auto=format` : null
}
// ✅ Daftar nama tema — dipakai editor & saat memuat undangan tersimpan
const THEME_NAMES = THEMES.map(t => t.name)
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

// ─── DIALOG KONFIRMASI HAPUS ─────────────────────────────────────────────────
function ConfirmDeleteDialog({ open, title, description, busy, onCancel, onConfirm }: {
  open: boolean
  title: string
  description: string
  busy: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-card rounded-2xl border border-border p-6 shadow-2xl">
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6 text-red-500" />
        </div>
        <h3 className="text-sm font-semibold text-center mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground text-center leading-relaxed mb-5">{description}</p>
        <div className="flex gap-2">
          <button onClick={onCancel} disabled={busy} className="flex-1 py-2.5 border border-border rounded-lg text-xs hover:bg-muted transition-colors disabled:opacity-60">Batal</button>
          <button onClick={onConfirm} disabled={busy} className="flex-1 py-2.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition-colors disabled:opacity-60">{busy ? "Menghapus..." : "Ya, Hapus"}</button>
        </div>
      </div>
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

/// ─── AUTH PAGE ────────────────────────────────────────────────────────────────
function AuthPage({ setPage, initialTab, setUser, userAccounts, adminAccounts }: {
  setPage: (p: Page) => void
  initialTab: AuthTab
  setUser: (u: UserInfo) => void
  userAccounts: UserAccount[]
  adminAccounts: AdminAccount[]
}) {
  const [tab] = useState<AuthTab>(initialTab)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // ✅ 1) Cek dulu akun yang dibuat dari menu "Akses Pengguna" (lokal)
      const localAccount = userAccounts.find(
        a => a.email.toLowerCase() === email.toLowerCase() && a.password === password
      )
      if (localAccount) {
        setUser({ name: localAccount.name, email: localAccount.email, phone: "081234567890" })
        toast.success(`Selamat datang, ${localAccount.name}!`)
        setTimeout(() => {
          setPage("dashboard")
        }, 1000)
        return
      }
      // ✅ 1b) BARU: cek akun yang dibuat dari menu "Akses Admin"
      const adminAccount = adminAccounts.find(
        a => a.email.toLowerCase() === email.toLowerCase() && a.password === password
      )
      if (adminAccount) {
        setUser({ name: adminAccount.name, email: adminAccount.email, phone: "081234567890" })
        toast.success(`Selamat datang, ${adminAccount.name}! (${adminAccount.role})`)
        setTimeout(() => {
          setPage("dashboard")
        }, 1000)
        return
      }
      // ✅ 2) Jika tidak ketemu, cek ke backend NestJS (akun demo)
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()
      if (data.success) {
        setUser({ name: data.user.name, email: data.user.email, phone: "081234567890" })
        toast.success(data.message || (tab === "register" ? "Registrasi berhasil!" : "Login berhasil!"))
        setTimeout(() => {
          setPage("dashboard")
        }, 1000)
      } else {
        toast.error(data.message || "Email atau password salah")
      }
    } catch (error) {
      console.error("Gagal terhubung ke backend:", error)
      toast.error("Tidak dapat terhubung ke server. Pastikan backend NestJS sedang berjalan!")
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="min-h-screen bg-secondary flex font-sans">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=900&h=1200&fit=crop&auto=format" alt="wedding" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/20 via-foreground/35 to-foreground/70" />
        <div className="relative z-10 flex flex-col p-12 text-white">
          <button onClick={() => window.location.href = "http://localhost:5173"} className="flex items-center gap-2 mb-auto">
            <Heart className="w-5 h-5 text-primary fill-primary/30" />
            <span className="font-serif text-xl font-semibold italic">Invito</span>
          </button>
          <blockquote className="font-serif text-2xl italic leading-relaxed mb-5">&ldquo;Hari spesial Anda layak mendapat undangan yang sama spesialnya.&rdquo;</blockquote>
          <div className="flex -space-x-2 mb-2">
            {["1438761681033-6461ffad8d80", "1494790108755-2616b612b977", "150700321169-0a1dd7228f2d"].map((id, i) => (
              <img key={i} src={`https://images.unsplash.com/photo-${id}?w=40&h=40&fit=crop&auto=format`} className="w-8 h-8 rounded-full border-2 border-white object-cover" alt="user" />
            ))}
          </div>
          <p className="text-sm text-white/65">10.000+ pasangan telah mempercayai kami</p>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <button onClick={() => window.location.href = "http://localhost:5173"} className="flex items-center gap-2 mb-8 lg:hidden">
            <Heart className="w-5 h-5 text-primary fill-primary/30" />
            <span className="font-serif text-xl font-semibold italic">Invito</span>
          </button>
          <div className="mb-8">
            <h2 className="font-serif text-3xl font-semibold mb-1.5">Selamat Datang Kembali</h2>
            <p className="text-muted-foreground text-sm">Masuk ke akun Invito Anda</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="nama@email.com"
                required
                className="w-full px-4 py-3 bg-input-background border border-border rounded-xl text-sm outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-sm font-medium">Password</label>
                <button type="button" className="text-xs text-primary hover:underline">Lupa password?</button>
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 bg-input-background border border-border rounded-xl text-sm outline-none focus:border-primary transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-all hover:shadow-[0_4px_16px_rgba(196,149,74,0.4)] mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Memeriksa..." : "Masuk"}
            </button>
          </form>
          <div className="mt-6 p-3 bg-muted/60 border border-border rounded-xl text-center">
            <p className="text-[11px] text-muted-foreground">
              Akun demo: <span className="font-mono font-semibold text-foreground">anisa@email.com</span> / <span className="font-mono font-semibold text-foreground">password123</span>
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">atau akun yang dibuat lewat menu <span className="font-semibold text-foreground">Akses Pengguna</span> / <span className="font-semibold text-foreground">Akses Admin</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}

/// ─── TEMPLATES PAGE ─────────────────────────────────────────────────────────
function TemplatesPage({ setPage, activeMenu, setActiveMenu, user }: {
  setPage: (p: Page) => void
  activeMenu: string
  setActiveMenu: (m: string) => void
  user: UserInfo
}) {
  const themes = [
    { name: "Elegant", img: "1519225421980-715cb0215aed", badge: "Populer" },
    { name: "Floral", img: "1550005809-91ad75fb315f", badge: "" },
    { name: "Minimalist", img: "1464366400600-7168b8af9bc3", badge: "Baru" },
    { name: "Modern", img: "1469371670807-013ccf25f16a", badge: "" },
    { name: "Traditional", img: "1583939003579-730e3918a45a", badge: "" },
    { name: "Luxury", img: "1519741497674-611481863552", badge: "Premium" },
  ]
  const handleNav = (label: string) => {
    setActiveMenu(label)
    if (label === "Dashboard") setPage("dashboard")
    else if (label === "Template") setPage("templates")
    else if (label === "Undangan Saya") setPage("my-invitations")
    else if (label === "Edit Undangan") setPage("editor")
    else if (label === "Data Tamu") setPage("guest-data")
    else if (label === "RSVP") setPage("rsvp")
    else if (label === "Amplop Digital") setPage("digital-envelope")
    else if (label === "QR Check-In") setPage("qr-checkin")
    else if (label === "Domain") setPage("domain")
    else if (label === "Pengaturan") setPage("settings")
    else if (label === "Akses Admin") setPage("admin-access")
    else if (label === "Akses Pengguna") setPage("user-access")
    else if (label === "Transaksi") {
      setPage("dashboard")
    }
  }
  return (
    <div className="flex h-screen bg-muted overflow-hidden font-sans">
      <aside className="fixed lg:relative z-40 w-60 h-full bg-sidebar flex flex-col flex-shrink-0">
        <div className="px-5 py-5 border-b border-sidebar-border">
          <button onClick={() => setPage("dashboard")} className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary fill-primary/25" />
            <span className="font-serif text-lg font-semibold italic text-sidebar-foreground">Invito</span>
          </button>
        </div>
        <nav className="flex-1 py-3 overflow-y-auto">
          {SIDEBAR_NAV.map(({ icon: Icon, label }) => (
            <button key={label} onClick={() => handleNav(label)} className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm transition-all ${label === "Template" ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium" : "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-foreground"}`}>
              <Icon className="w-4 h-4 flex-shrink-0" />{label}
            </button>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-sidebar-border">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0"><User className="w-4 h-4 text-primary" /></div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-sidebar-foreground truncate">{user.name}</p>
              <p className="text-[10px] text-sidebar-foreground/45 truncate">{user.email}</p>
            </div>
          </div>
          <button onClick={() => setPage("login")} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sidebar-foreground/55 hover:bg-sidebar-accent hover:text-sidebar-foreground text-xs transition-colors">
            <LogOut className="w-3.5 h-3.5" /> Keluar
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-card border-b border-border px-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-sm font-semibold">Template</p>
              <p className="text-[11px] text-muted-foreground hidden sm:block">Pilih tema undangan impianmu</p>
            </div>
          </div>
          <button onClick={() => setPage("dashboard")} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
            <ChevronRight className="w-3.5 h-3.5 rotate-180" /> Kembali
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-5">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {themes.map(({ name, img, badge }, i) => (
              <div key={i} className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-lg transition-all">
                <div className="relative h-48 overflow-hidden">
                  <img src={`https://images.unsplash.com/photo-${img}?w=600&h=400&fit=crop&auto=format`} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {badge && <div className="absolute top-3 left-3 px-2.5 py-1 bg-primary text-primary-foreground rounded-full text-[10px] font-medium">{badge}</div>}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2">{name}</h3>
                  <p className="text-xs text-muted-foreground mb-3">24 variasi tersedia</p>
                  {/* ✅ PERUBAHAN: tidak lagi ke checkout — hanya alert "fungsi akan segera hadir" */}
                  <button onClick={() => toast.info("Fungsi akan segera hadir!")} className="w-full py-2 bg-primary text-primary-foreground rounded-full text-sm hover:bg-primary/90 transition-colors">Gunakan Tema</button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}

// ─── MY INVITATIONS PAGE ─────────────────────────────────────────────────────
function MyInvitationsPage({ setPage, activeMenu, setActiveMenu, user, openEditor }: {
  setPage: (p: Page) => void
  activeMenu: string
  setActiveMenu: (m: string) => void
  user: UserInfo
  openEditor: (inv?: any) => void
}) {
  const [invitations, setInvitations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  // ✅ State untuk hapus undangan
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null)
  const [deleting, setDeleting] = useState(false)
  useEffect(() => {
    fetch('http://localhost:5000/api/invitations')
      .then(response => response.json())
      .then(data => {
        if (data.success) setInvitations(data.data)
        setLoading(false)
      })
      .catch(error => {
        console.error('Gagal mengambil data:', error)
        setLoading(false)
      })
  }, [])
  // ✅ Hapus undangan dari database (DELETE ke backend)
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`http://localhost:5000/api/invitations/${deleteTarget.id}`, { method: "DELETE" })
      const data = await res.json()
      if (data.success) {
        setInvitations(prev => prev.filter((i: any) => i.id !== deleteTarget.id))
        toast.success(`Undangan "${deleteTarget.coupleName}" berhasil dihapus dari database!`)
      } else {
        toast.error(data.message || "Gagal menghapus undangan.")
      }
    } catch (error) {
      console.error("Gagal menghapus dari backend:", error)
      toast.error("Tidak dapat terhubung ke server. Pastikan backend NestJS berjalan!")
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }
  const handleNav = (label: string) => {
    setActiveMenu(label)
    if (label === "Dashboard") setPage("dashboard")
    else if (label === "Template") setPage("templates")
    else if (label === "Undangan Saya") setPage("my-invitations")
    else if (label === "Edit Undangan") setPage("editor")
    else if (label === "Data Tamu") setPage("guest-data")
    else if (label === "RSVP") setPage("rsvp")
    else if (label === "Amplop Digital") setPage("digital-envelope")
    else if (label === "QR Check-In") setPage("qr-checkin")
    else if (label === "Domain") setPage("domain")
    else if (label === "Pengaturan") setPage("settings")
    else if (label === "Akses Admin") setPage("admin-access")
    else if (label === "Akses Pengguna") setPage("user-access")
    else if (label === "Transaksi") setPage("dashboard")
    setSidebarOpen(false)
  }
  return (
    <div className="flex h-screen bg-muted overflow-hidden font-sans">
      <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:relative z-40 w-60 h-full bg-sidebar flex flex-col transition-transform duration-300 flex-shrink-0`}>
        <div className="px-5 py-5 border-b border-sidebar-border">
          <button onClick={() => setPage("dashboard")} className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary fill-primary/25" />
            <span className="font-serif text-lg font-semibold italic text-sidebar-foreground">Invito</span>
          </button>
        </div>
        <nav className="flex-1 py-3 overflow-y-auto">
          {SIDEBAR_NAV.map(({ icon: Icon, label }) => (
            <button key={label} onClick={() => handleNav(label)} className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm transition-all ${label === "Undangan Saya" ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium" : "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-foreground"}`}>
              <Icon className="w-4 h-4 flex-shrink-0" />{label}
            </button>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-sidebar-border">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0"><User className="w-4 h-4 text-primary" /></div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-sidebar-foreground truncate">{user.name}</p>
              <p className="text-[10px] text-sidebar-foreground/45 truncate">{user.email}</p>
            </div>
          </div>
          <button onClick={() => setPage("login")} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sidebar-foreground/55 hover:bg-sidebar-accent hover:text-sidebar-foreground text-xs transition-colors">
            <LogOut className="w-3.5 h-3.5" /> Keluar
          </button>
        </div>
      </aside>
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-foreground/40 z-30 lg:hidden" />}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-card border-b border-border px-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-1.5 rounded-lg hover:bg-muted transition-colors"><Menu className="w-5 h-5" /></button>
            <div>
              <p className="text-sm font-semibold">Undangan Saya</p>
              <p className="text-[11px] text-muted-foreground hidden sm:block">Kelola semua undangan digital Anda</p>
            </div>
          </div>
          <button onClick={() => setPage("checkout")} className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-xs font-medium flex items-center gap-1.5 hover:bg-primary/90 transition-all hover:shadow-[0_2px_12px_rgba(196,149,74,0.35)]">
            <Plus className="w-3.5 h-3.5" /> Buat Undangan
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-5">
          <div className="bg-card rounded-2xl p-5 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Undangan Saya</h3>
              <button onClick={() => setPage("checkout")} className="text-xs text-primary flex items-center gap-1 hover:underline">
                <Plus className="w-3 h-3" /> Buat baru
              </button>
            </div>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground text-sm">Memuat data undangan...</div>
            ) : invitations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">Belum ada undangan. Yuk buat yang pertama!</div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {invitations.map((inv: any) => {
                  const themeImage = getThemeImage(inv.theme)
                  return (
                    <div key={inv.id} className="border border-border rounded-xl overflow-hidden group hover:shadow-md transition-all">
                      <div className="h-28 relative overflow-hidden">
                        {themeImage ? (
                          <img src={themeImage} alt={inv.theme} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-secondary to-accent/40" />
                        )}
                        <div className="absolute inset-0 bg-foreground/20 group-hover:bg-foreground/10 transition-colors flex items-center justify-center">
                          <p className="font-serif text-base text-white drop-shadow-lg">{inv.coupleName}</p>
                        </div>
                        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                          <button onClick={(e) => { e.stopPropagation(); openEditor(inv) }} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-full text-xs shadow-md hover:bg-primary/90 transition-colors">Edit</button>
                          {/* ✅ BARU: tombol Hapus dengan konfirmasi */}
                          <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(inv) }} className="px-3 py-1.5 bg-red-500 text-white rounded-full text-xs shadow-md hover:bg-red-600 transition-colors">Hapus</button>
                        </div>
                      </div>
                      <div className="px-3.5 py-2.5 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium">{inv.theme}</p>
                          <p className="text-[10px] text-muted-foreground">{inv.visits} kunjungan</p>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${inv.status === "Published" ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"}`}>{inv.status}</span>
                      </div>
                    </div>
                  )
                })}
                <button onClick={() => setPage("checkout")} className="border-2 border-dashed border-border rounded-xl min-h-[120px] flex flex-col items-center justify-center gap-2 hover:border-primary hover:text-primary transition-colors text-muted-foreground">
                  <Plus className="w-6 h-6" />
                  <span className="text-xs">Buat Undangan Baru</span>
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
      {/* ✅ BARU: dialog peringatan hapus */}
      <ConfirmDeleteDialog
        open={deleteTarget !== null}
        title="Hapus Undangan?"
        description={`Undangan "${deleteTarget?.coupleName}" akan dihapus permanen dari database. Tindakan ini tidak dapat dibatalkan.`}
        busy={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}


// ─── GUEST DATA PAGE ─────────────────────────────────────────────────────────
function GuestDataPage({ setPage, activeMenu, setActiveMenu, user }: {
  setPage: (p: Page) => void
  activeMenu: string
  setActiveMenu: (m: string) => void
  user: UserInfo
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("Semua")
  const MOCK_GUESTS = [
    { id: 1, name: "Budi Santoso", whatsapp: "081234567890", status: "Hadir", time: "2 jam lalu", table: "Meja 1" },
    { id: 2, name: "Siti Aminah", whatsapp: "089876543210", status: "Tidak Hadir", time: "5 jam lalu", table: "-" },
    { id: 3, name: "Andi Pratama", whatsapp: "085678901234", status: "Belum Konfirmasi", time: "-", table: "-" },
    { id: 4, name: "Dewi Lestari", whatsapp: "081122334455", status: "Hadir", time: "1 hari lalu", table: "Meja 2" },
    { id: 5, name: "Rizky Ramadhan", whatsapp: "087788990011", status: "Hadir", time: "1 hari lalu", table: "Meja 1" },
  ]
  const filteredGuests = MOCK_GUESTS.filter(g => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === "Semua" || g.status === filter
    return matchSearch && matchFilter
  })
  const getStatusColor = (status: string) => {
    if (status === "Hadir") return "bg-green-50 text-green-600 border-green-200"
    if (status === "Tidak Hadir") return "bg-red-50 text-red-500 border-red-200"
    return "bg-yellow-50 text-yellow-600 border-yellow-200"
  }
  const handleNav = (label: string) => {
    setActiveMenu(label)
    if (label === "Dashboard") setPage("dashboard")
    else if (label === "Template") setPage("templates")
    else if (label === "Undangan Saya") setPage("my-invitations")
    else if (label === "Edit Undangan") setPage("editor")
    else if (label === "Data Tamu") setPage("guest-data")
    else if (label === "RSVP") setPage("rsvp")
    else if (label === "Amplop Digital") setPage("digital-envelope")
    else if (label === "QR Check-In") setPage("qr-checkin")
    else if (label === "Domain") setPage("domain")
    else if (label === "Pengaturan") setPage("settings")
    else if (label === "Akses Admin") setPage("admin-access")
    else if (label === "Akses Pengguna") setPage("user-access")
    else if (label === "Transaksi") setPage("dashboard")
    setSidebarOpen(false)
  }
  return (
    <div className="flex h-screen bg-muted overflow-hidden font-sans">
      <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:relative z-40 w-60 h-full bg-sidebar flex flex-col transition-transform duration-300 flex-shrink-0`}>
        <div className="px-5 py-5 border-b border-sidebar-border">
          <button onClick={() => setPage("dashboard")} className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary fill-primary/25" />
            <span className="font-serif text-lg font-semibold italic text-sidebar-foreground">Invito</span>
          </button>
        </div>
        <nav className="flex-1 py-3 overflow-y-auto">
          {SIDEBAR_NAV.map(({ icon: Icon, label }) => (
            <button key={label} onClick={() => handleNav(label)} className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm transition-all ${label === "Data Tamu" ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium" : "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-foreground"}`}>
              <Icon className="w-4 h-4 flex-shrink-0" />{label}
            </button>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-sidebar-border">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0"><User className="w-4 h-4 text-primary" /></div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-sidebar-foreground truncate">{user.name}</p>
              <p className="text-[10px] text-sidebar-foreground/45 truncate">{user.email}</p>
            </div>
          </div>
          <button onClick={() => setPage("login")} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sidebar-foreground/55 hover:bg-sidebar-accent hover:text-sidebar-foreground text-xs transition-colors">
            <LogOut className="w-3.5 h-3.5" /> Keluar
          </button>
        </div>
      </aside>
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-foreground/40 z-30 lg:hidden" />}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-card border-b border-border px-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-1.5 rounded-lg hover:bg-muted transition-colors"><Menu className="w-5 h-5" /></button>
            <div>
              <p className="text-sm font-semibold">Data Tamu</p>
              <p className="text-[11px] text-muted-foreground hidden sm:block">Kelola daftar tamu undangan Anda</p>
            </div>
          </div>
          <button onClick={() => toast.info("Fitur tambah tamu akan segera hadir!")} className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-xs font-medium flex items-center gap-1.5 hover:bg-primary/90 transition-all">
            <Plus className="w-3.5 h-3.5" /> Tambah Tamu
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[
              { label: "Total Tamu", value: MOCK_GUESTS.length, color: "text-blue-500 bg-blue-50", icon: Users },
              { label: "Hadir", value: MOCK_GUESTS.filter(g => g.status === "Hadir").length, color: "text-green-500 bg-green-50", icon: CheckCircle2 },
              { label: "Tidak Hadir", value: MOCK_GUESTS.filter(g => g.status === "Tidak Hadir").length, color: "text-red-500 bg-red-50", icon: XCircle },
              { label: "Belum Konfirmasi", value: MOCK_GUESTS.filter(g => g.status === "Belum Konfirmasi").length, color: "text-yellow-500 bg-yellow-50", icon: Clock },
            ].map(({ label, value, color, icon: Icon }, i) => (
              <div key={i} className="bg-card rounded-xl p-4 border border-border">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${color}`}><Icon className="w-4 h-4" /></div>
                <p className="text-lg font-bold">{value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </div>
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-xs">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama tamu..." className="pl-8 pr-3 py-2 text-xs border border-border rounded-lg bg-muted outline-none focus:border-primary w-full" />
              </div>
              <div className="flex bg-muted rounded-lg overflow-hidden border border-border">
                {["Semua", "Hadir", "Tidak Hadir", "Belum Konfirmasi"].map(f => (
                  <button key={f} onClick={() => setFilter(f)} className={`px-3 py-2 text-[11px] transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/80"}`}>{f}</button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    {["Nama Tamu", "WhatsApp", "Status", "Waktu RSVP", "Meja", ""].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredGuests.map((guest, i) => (
                    <tr key={guest.id} className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                      <td className="px-4 py-3 text-xs font-medium whitespace-nowrap">{guest.name}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground font-mono whitespace-nowrap">{guest.whatsapp}</td>
                      <td className="px-4 py-3"><span className={`text-[10px] font-medium px-2.5 py-1 rounded-full border ${getStatusColor(guest.status)}`}>{guest.status}</span></td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{guest.time}</td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap">{guest.table}</td>
                      <td className="px-4 py-3"><button onClick={() => toast.info("Fitur detail tamu akan segera hadir!")} className="text-[10px] text-primary hover:underline whitespace-nowrap">Detail</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredGuests.length === 0 && <div className="py-12 text-center text-muted-foreground text-sm">Tidak ada tamu ditemukan</div>}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}


// ─── RSVP PAGE ──────────────────────────────────────────────────────────────
function RSVPPage({ setPage, activeMenu, setActiveMenu, user }: {
  setPage: (p: Page) => void
  activeMenu: string
  setActiveMenu: (m: string) => void
  user: UserInfo
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [filter, setFilter] = useState("Semua")
  const MOCK_RSVP = [
    { id: 1, name: "Budi Santoso", status: "Hadir", message: "Selamat menempuh hidup baru! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah.", time: "2 jam lalu", guests: 2 },
    { id: 2, name: "Siti Aminah", status: "Tidak Hadir", message: "Mohon maaf tidak bisa hadir karena ada acara keluarga di luar kota. Doa terbaik untuk kalian!", time: "5 jam lalu", guests: 0 },
    { id: 3, name: "Andi Pratama", status: "Hadir", message: "Happy wedding bro! Ditunggu traktirannya.", time: "1 hari lalu", guests: 1 },
    { id: 4, name: "Dewi Lestari", status: "Hadir", message: "Selamat ya Dew! Cantik banget undangannya.", time: "1 hari lalu", guests: 3 },
    { id: 5, name: "Rizky Ramadhan", status: "Masih Ragu", message: "Insya Allah hadir ya, lagi konfirmasi jadwal dulu.", time: "2 hari lalu", guests: 1 },
  ]
  const filteredRSVP = MOCK_RSVP.filter(r => filter === "Semua" || r.status === filter)
  const getStatusColor = (status: string) => {
    if (status === "Hadir") return "bg-green-50 text-green-600 border-green-200"
    if (status === "Tidak Hadir") return "bg-red-50 text-red-500 border-red-200"
    return "bg-yellow-50 text-yellow-600 border-yellow-200"
  }
  const handleNav = (label: string) => {
    setActiveMenu(label)
    if (label === "Dashboard") setPage("dashboard")
    else if (label === "Template") setPage("templates")
    else if (label === "Undangan Saya") setPage("my-invitations")
    else if (label === "Edit Undangan") setPage("editor")
    else if (label === "Data Tamu") setPage("guest-data")
    else if (label === "RSVP") setPage("rsvp")
    else if (label === "Amplop Digital") setPage("digital-envelope")
    else if (label === "QR Check-In") setPage("qr-checkin")
    else if (label === "Domain") setPage("domain")
    else if (label === "Pengaturan") setPage("settings")
    else if (label === "Akses Admin") setPage("admin-access")
    else if (label === "Akses Pengguna") setPage("user-access")
    else if (label === "Transaksi") setPage("dashboard")
    setSidebarOpen(false)
  }
  return (
    <div className="flex h-screen bg-muted overflow-hidden font-sans">
      <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:relative z-40 w-60 h-full bg-sidebar flex flex-col transition-transform duration-300 flex-shrink-0`}>
        <div className="px-5 py-5 border-b border-sidebar-border">
          <button onClick={() => setPage("dashboard")} className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary fill-primary/25" />
            <span className="font-serif text-lg font-semibold italic text-sidebar-foreground">Invito</span>
          </button>
        </div>
        <nav className="flex-1 py-3 overflow-y-auto">
          {SIDEBAR_NAV.map(({ icon: Icon, label }) => (
            <button key={label} onClick={() => handleNav(label)} className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm transition-all ${label === "RSVP" ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium" : "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-foreground"}`}>
              <Icon className="w-4 h-4 flex-shrink-0" />{label}
            </button>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-sidebar-border">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0"><User className="w-4 h-4 text-primary" /></div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-sidebar-foreground truncate">{user.name}</p>
              <p className="text-[10px] text-sidebar-foreground/45 truncate">{user.email}</p>
            </div>
          </div>
          <button onClick={() => setPage("login")} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sidebar-foreground/55 hover:bg-sidebar-accent hover:text-sidebar-foreground text-xs transition-colors">
            <LogOut className="w-3.5 h-3.5" /> Keluar
          </button>
        </div>
      </aside>
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-foreground/40 z-30 lg:hidden" />}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-card border-b border-border px-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-1.5 rounded-lg hover:bg-muted transition-colors"><Menu className="w-5 h-5" /></button>
            <div>
              <p className="text-sm font-semibold">RSVP & Ucapan</p>
              <p className="text-[11px] text-muted-foreground hidden sm:block">Lihat konfirmasi dan ucapan dari tamu</p>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[
              { label: "Total RSVP", value: MOCK_RSVP.length, color: "text-blue-500 bg-blue-50", icon: MessageCircle },
              { label: "Hadir", value: MOCK_RSVP.filter(r => r.status === "Hadir").length, color: "text-green-500 bg-green-50", icon: CheckCircle2 },
              { label: "Tidak Hadir", value: MOCK_RSVP.filter(r => r.status === "Tidak Hadir").length, color: "text-red-500 bg-red-50", icon: XCircle },
              { label: "Masih Ragu", value: MOCK_RSVP.filter(r => r.status === "Masih Ragu").length, color: "text-yellow-500 bg-yellow-50", icon: Clock },
            ].map(({ label, value, color, icon: Icon }, i) => (
              <div key={i} className="bg-card rounded-xl p-4 border border-border">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${color}`}><Icon className="w-4 h-4" /></div>
                <p className="text-lg font-bold">{value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </div>
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold">Daftar Ucapan</h3>
              <div className="flex bg-muted rounded-lg overflow-hidden border border-border">
                {["Semua", "Hadir", "Tidak Hadir", "Masih Ragu"].map(f => (
                  <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 text-[11px] transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/80"}`}>{f}</button>
                ))}
              </div>
            </div>
            <div className="divide-y divide-border/50 max-h-[500px] overflow-y-auto">
              {filteredRSVP.map((rsvp) => (
                <div key={rsvp.id} className="p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-xs font-semibold text-primary flex-shrink-0">{rsvp.name.split(' ').map(n => n[0]).join('').substring(0, 2)}</div>
                      <div>
                        <p className="text-sm font-semibold">{rsvp.name}</p>
                        <p className="text-[10px] text-muted-foreground">{rsvp.time} • {rsvp.guests > 0 ? `${rsvp.guests} orang` : 'Tanpa tamu'}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full border ${getStatusColor(rsvp.status)}`}>{rsvp.status}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed pl-12 italic">"{rsvp.message}"</p>
                </div>
              ))}
              {filteredRSVP.length === 0 && <div className="py-12 text-center text-muted-foreground text-sm">Tidak ada RSVP ditemukan</div>}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

// ─── DIGITAL ENVELOPE PAGE ───────────────────────────────────────────────────
function DigitalEnvelopePage({ setPage, activeMenu, setActiveMenu, user }: {
  setPage: (p: Page) => void
  activeMenu: string
  setActiveMenu: (m: string) => void
  user: UserInfo
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [filter, setFilter] = useState("Semua")
  const MOCK_ENVELOPES = [
    { id: 1, name: "Budi Santoso", amount: 500000, date: "12 Jan 2025", status: "Ditarik", message: "Selamat menempuh hidup baru!" },
    { id: 2, name: "Siti Aminah", amount: 250000, date: "12 Jan 2025", status: "Ditarik", message: "Mohon maaf tidak bisa hadir." },
    { id: 3, name: "Andi Pratama", amount: 1000000, date: "11 Jan 2025", status: "Belum Ditarik", message: "Happy wedding bro!" },
    { id: 4, name: "Dewi Lestari", amount: 300000, date: "11 Jan 2025", status: "Ditarik", message: "Selamat ya Dew!" },
    { id: 5, name: "Rizky Ramadhan", amount: 150000, date: "10 Jan 2025", status: "Belum Ditarik", message: "Semoga sakinah mawaddah warahmah." },
  ]
  const filteredEnvelopes = MOCK_ENVELOPES.filter(e => filter === "Semua" || e.status === filter)
  const totalAmount = MOCK_ENVELOPES.reduce((sum, e) => sum + e.amount, 0)
  const withdrawnAmount = MOCK_ENVELOPES.filter(e => e.status === "Ditarik").reduce((sum, e) => sum + e.amount, 0)
  const handleNav = (label: string) => {
    setActiveMenu(label)
    if (label === "Dashboard") setPage("dashboard")
    else if (label === "Template") setPage("templates")
    else if (label === "Undangan Saya") setPage("my-invitations")
    else if (label === "Edit Undangan") setPage("editor")
    else if (label === "Data Tamu") setPage("guest-data")
    else if (label === "RSVP") setPage("rsvp")
    else if (label === "Amplop Digital") setPage("digital-envelope")
    else if (label === "QR Check-In") setPage("qr-checkin")
    else if (label === "Domain") setPage("domain")
    else if (label === "Pengaturan") setPage("settings")
    else if (label === "Akses Admin") setPage("admin-access")
    else if (label === "Akses Pengguna") setPage("user-access")
    else if (label === "Transaksi") setPage("dashboard")
    setSidebarOpen(false)
  }
  return (
    <div className="flex h-screen bg-muted overflow-hidden font-sans">
      <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:relative z-40 w-60 h-full bg-sidebar flex flex-col transition-transform duration-300 flex-shrink-0`}>
        <div className="px-5 py-5 border-b border-sidebar-border">
          <button onClick={() => setPage("dashboard")} className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary fill-primary/25" />
            <span className="font-serif text-lg font-semibold italic text-sidebar-foreground">Invito</span>
          </button>
        </div>
        <nav className="flex-1 py-3 overflow-y-auto">
          {SIDEBAR_NAV.map(({ icon: Icon, label }) => (
            <button key={label} onClick={() => handleNav(label)} className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm transition-all ${label === "Amplop Digital" ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium" : "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-foreground"}`}>
              <Icon className="w-4 h-4 flex-shrink-0" />{label}
            </button>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-sidebar-border">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0"><User className="w-4 h-4 text-primary" /></div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-sidebar-foreground truncate">{user.name}</p>
              <p className="text-[10px] text-sidebar-foreground/45 truncate">{user.email}</p>
            </div>
          </div>
          <button onClick={() => setPage("login")} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sidebar-foreground/55 hover:bg-sidebar-accent hover:text-sidebar-foreground text-xs transition-colors">
            <LogOut className="w-3.5 h-3.5" /> Keluar
          </button>
        </div>
      </aside>
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-foreground/40 z-30 lg:hidden" />}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-card border-b border-border px-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-1.5 rounded-lg hover:bg-muted transition-colors"><Menu className="w-5 h-5" /></button>
            <div>
              <p className="text-sm font-semibold">Amplop Digital</p>
              <p className="text-[11px] text-muted-foreground hidden sm:block">Kelola hadiah dan ucapan dari tamu</p>
            </div>
          </div>
          <button onClick={() => toast.info("Fitur tarik dana akan segera hadir!")} className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-xs font-medium flex items-center gap-1.5 hover:bg-primary/90 transition-all">
            <Gift className="w-3.5 h-3.5" /> Tarik Dana
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[
              { label: "Total Amplop", value: MOCK_ENVELOPES.length, color: "text-blue-500 bg-blue-50", icon: Gift },
              { label: "Total Dana", value: fmt(totalAmount), color: "text-green-500 bg-green-50", icon: TrendingUp },
              { label: "Sudah Ditarik", value: fmt(withdrawnAmount), color: "text-purple-500 bg-purple-50", icon: CheckCircle2 },
              { label: "Belum Ditarik", value: fmt(totalAmount - withdrawnAmount), color: "text-yellow-500 bg-yellow-50", icon: Clock },
            ].map(({ label, value, color, icon: Icon }, i) => (
              <div key={i} className="bg-card rounded-xl p-4 border border-border">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${color}`}><Icon className="w-4 h-4" /></div>
                <p className="text-lg font-bold">{value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </div>
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold">Riwayat Amplop</h3>
              <div className="flex bg-muted rounded-lg overflow-hidden border border-border">
                {["Semua", "Ditarik", "Belum Ditarik"].map(f => (
                  <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 text-[11px] transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/80"}`}>{f}</button>
                ))}
              </div>
            </div>
            <div className="divide-y divide-border/50 max-h-[500px] overflow-y-auto">
              {filteredEnvelopes.map((env) => (
                <div key={env.id} className="p-4 hover:bg-muted/30 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-xs font-semibold text-primary flex-shrink-0">{env.name.split(' ').map(n => n[0]).join('').substring(0, 2)}</div>
                    <div>
                      <p className="text-sm font-semibold">{env.name}</p>
                      <p className="text-[10px] text-muted-foreground">{env.date} • "{env.message}"</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="text-sm font-bold text-primary">{fmt(env.amount)}</p>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${env.status === "Ditarik" ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"}`}>{env.status}</span>
                  </div>
                </div>
              ))}
              {filteredEnvelopes.length === 0 && <div className="py-12 text-center text-muted-foreground text-sm">Tidak ada data amplop ditemukan</div>}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}


// ─── QR CHECK-IN PAGE ────────────────────────────────────────────────────────
function QRCheckInPage({ setPage, activeMenu, setActiveMenu, user }: {
  setPage: (p: Page) => void
  activeMenu: string
  setActiveMenu: (m: string) => void
  user: UserInfo
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("Semua")
  const MOCK_GUESTS = [
    { id: 1, name: "Budi Santoso", table: "Meja 1", status: "Sudah Check-In", time: "14:30" },
    { id: 2, name: "Siti Aminah", table: "Meja 2", status: "Belum Check-In", time: "-" },
    { id: 3, name: "Andi Pratama", table: "Meja 1", status: "Sudah Check-In", time: "14:15" },
    { id: 4, name: "Dewi Lestari", table: "Meja 3", status: "Belum Check-In", time: "-" },
    { id: 5, name: "Rizky Ramadhan", table: "Meja 2", status: "Sudah Check-In", time: "15:00" },
  ]
  const filteredGuests = MOCK_GUESTS.filter(g => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === "Semua" || g.status === filter
    return matchSearch && matchFilter
  })
  const checkedInCount = MOCK_GUESTS.filter(g => g.status === "Sudah Check-In").length
  const pendingCount = MOCK_GUESTS.filter(g => g.status === "Belum Check-In").length
  const handleNav = (label: string) => {
    setActiveMenu(label)
    if (label === "Dashboard") setPage("dashboard")
    else if (label === "Template") setPage("templates")
    else if (label === "Undangan Saya") setPage("my-invitations")
    else if (label === "Edit Undangan") setPage("editor")
    else if (label === "Data Tamu") setPage("guest-data")
    else if (label === "RSVP") setPage("rsvp")
    else if (label === "Amplop Digital") setPage("digital-envelope")
    else if (label === "QR Check-In") setPage("qr-checkin")
    else if (label === "Domain") setPage("domain")
    else if (label === "Pengaturan") setPage("settings")
    else if (label === "Akses Admin") setPage("admin-access")
    else if (label === "Akses Pengguna") setPage("user-access")
    else if (label === "Transaksi") setPage("dashboard")
    setSidebarOpen(false)
  }
  return (
    <div className="flex h-screen bg-muted overflow-hidden font-sans">
      <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:relative z-40 w-60 h-full bg-sidebar flex flex-col transition-transform duration-300 flex-shrink-0`}>
        <div className="px-5 py-5 border-b border-sidebar-border">
          <button onClick={() => setPage("dashboard")} className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary fill-primary/25" />
            <span className="font-serif text-lg font-semibold italic text-sidebar-foreground">Invito</span>
          </button>
        </div>
        <nav className="flex-1 py-3 overflow-y-auto">
          {SIDEBAR_NAV.map(({ icon: Icon, label }) => (
            <button key={label} onClick={() => handleNav(label)} className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm transition-all ${label === "QR Check-In" ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium" : "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-foreground"}`}>
              <Icon className="w-4 h-4 flex-shrink-0" />{label}
            </button>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-sidebar-border">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0"><User className="w-4 h-4 text-primary" /></div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-sidebar-foreground truncate">{user.name}</p>
              <p className="text-[10px] text-sidebar-foreground/45 truncate">{user.email}</p>
            </div>
          </div>
          <button onClick={() => setPage("login")} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sidebar-foreground/55 hover:bg-sidebar-accent hover:text-sidebar-foreground text-xs transition-colors">
            <LogOut className="w-3.5 h-3.5" /> Keluar
          </button>
        </div>
      </aside>
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-foreground/40 z-30 lg:hidden" />}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-card border-b border-border px-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-1.5 rounded-lg hover:bg-muted transition-colors"><Menu className="w-5 h-5" /></button>
            <div>
              <p className="text-sm font-semibold">QR Check-In</p>
              <p className="text-[11px] text-muted-foreground hidden sm:block">Scan QR tamu di lokasi acara</p>
            </div>
          </div>
          <button onClick={() => toast.info("Fitur scan QR kamera akan segera hadir!")} className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-xs font-medium flex items-center gap-1.5 hover:bg-primary/90 transition-all">
            <QrCode className="w-3.5 h-3.5" /> Scan QR
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[
              { label: "Total Tamu", value: MOCK_GUESTS.length, color: "text-blue-500 bg-blue-50", icon: Users },
              { label: "Sudah Check-In", value: checkedInCount, color: "text-green-500 bg-green-50", icon: CheckCircle2 },
              { label: "Belum Check-In", value: pendingCount, color: "text-yellow-500 bg-yellow-50", icon: Clock },
              { label: "Persentase", value: `${Math.round((checkedInCount / MOCK_GUESTS.length) * 100)}%`, color: "text-purple-500 bg-purple-50", icon: TrendingUp },
            ].map(({ label, value, color, icon: Icon }, i) => (
              <div key={i} className="bg-card rounded-xl p-4 border border-border">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${color}`}><Icon className="w-4 h-4" /></div>
                <p className="text-lg font-bold">{value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </div>
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-xs">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama tamu..." className="pl-8 pr-3 py-2 text-xs border border-border rounded-lg bg-muted outline-none focus:border-primary w-full" />
              </div>
              <div className="flex bg-muted rounded-lg overflow-hidden border border-border">
                {["Semua", "Sudah Check-In", "Belum Check-In"].map(f => (
                  <button key={f} onClick={() => setFilter(f)} className={`px-3 py-2 text-[11px] transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/80"}`}>{f}</button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    {["Nama Tamu", "Meja", "Status", "Waktu", "QR Code", ""].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredGuests.map((guest, i) => (
                    <tr key={guest.id} className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                      <td className="px-4 py-3 text-xs font-medium whitespace-nowrap">{guest.name}</td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap">{guest.table}</td>
                      <td className="px-4 py-3"><span className={`text-[10px] font-medium px-2.5 py-1 rounded-full border ${guest.status === "Sudah Check-In" ? "bg-green-50 text-green-600 border-green-200" : "bg-yellow-50 text-yellow-600 border-yellow-200"}`}>{guest.status}</span></td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{guest.time}</td>
                      <td className="px-4 py-3"><div className="w-8 h-8 bg-white border border-border rounded flex items-center justify-center"><QrCode className="w-5 h-5 text-foreground" /></div></td>
                      <td className="px-4 py-3">
                        <button onClick={() => { if (guest.status === "Belum Check-In") { toast.success(`${guest.name} berhasil di-check-in!`) } else { toast.info(`${guest.name} sudah check-in.`) } }} className="text-[10px] text-primary hover:underline whitespace-nowrap">{guest.status === "Belum Check-In" ? "Check-In" : "Detail"}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredGuests.length === 0 && <div className="py-12 text-center text-muted-foreground text-sm">Tidak ada tamu ditemukan</div>}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}


// ─── DOMAIN PAGE ────────────────────────────────────────────────────────────
type CustomDomain = {
  id: number
  name: string
  status: "pending" | "active"
  addedAt: string
}

function DomainPage({ setPage, activeMenu, setActiveMenu, user }: {
  setPage: (p: Page) => void
  activeMenu: string
  setActiveMenu: (m: string) => void
  user: UserInfo
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [customDomain, setCustomDomain] = useState("")
  // ✅ OPSI A: daftar domain kustom + status verifikasi
  const [customDomains, setCustomDomains] = useState<CustomDomain[]>([])
  const [verifyingId, setVerifyingId] = useState<number | null>(null)

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Berhasil disalin ke clipboard!")
  }

  // ✅ Tambah domain kustom → masuk daftar dengan status "Menunggu Verifikasi"
  const handleAddDomain = () => {
    const name = customDomain.trim().toLowerCase()
    if (!name) { toast.error("Silakan masukkan nama domain terlebih dahulu!"); return }
    if (!/^(?!-)[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(name)) {
      toast.error("Format domain tidak valid (contoh: anisadanraka.com)")
      return
    }
    if (customDomains.some(d => d.name === name)) {
      toast.error("Domain ini sudah ditambahkan sebelumnya!")
      return
    }
    const addedAt = new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
    setCustomDomains(prev => [...prev, { id: Date.now(), name, status: "pending", addedAt }])
    setCustomDomain("")
    toast.success(`Domain ${name} ditambahkan! Pasang record DNS lalu verifikasi.`)
  }

  // ✅ Simulasi cek DNS → setelah ~2 detik status jadi Aktif + SSL
  const handleVerify = (id: number) => {
    const domain = customDomains.find(d => d.id === id)
    if (!domain) return
    setVerifyingId(id)
    setTimeout(() => {
      setCustomDomains(prev => prev.map(d => d.id === id ? { ...d, status: "active" } : d))
      setVerifyingId(null)
      toast.success(`Domain ${domain.name} terverifikasi! SSL/HTTPS aktif.`)
    }, 1800)
  }

  const handleRemove = (id: number) => {
    const domain = customDomains.find(d => d.id === id)
    setCustomDomains(prev => prev.filter(d => d.id !== id))
    if (domain) toast.info(`Domain ${domain.name} dihapus.`)
  }

  const handleNav = (label: string) => {
    setActiveMenu(label)
    if (label === "Dashboard") setPage("dashboard")
    else if (label === "Template") setPage("templates")
    else if (label === "Undangan Saya") setPage("my-invitations")
    else if (label === "Edit Undangan") setPage("editor")
    else if (label === "Data Tamu") setPage("guest-data")
    else if (label === "RSVP") setPage("rsvp")
    else if (label === "Amplop Digital") setPage("digital-envelope")
    else if (label === "QR Check-In") setPage("qr-checkin")
    else if (label === "Domain") setPage("domain")
    else if (label === "Pengaturan") setPage("settings")
    else if (label === "Akses Admin") setPage("admin-access")
    else if (label === "Akses Pengguna") setPage("user-access")
    else if (label === "Transaksi") setPage("dashboard")
    setSidebarOpen(false)
  }

  const pendingDomains = customDomains.filter(d => d.status === "pending")

  return (
    <div className="flex h-screen bg-muted overflow-hidden font-sans">
      <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:relative z-40 w-60 h-full bg-sidebar flex flex-col transition-transform duration-300 flex-shrink-0`}>
        <div className="px-5 py-5 border-b border-sidebar-border">
          <button onClick={() => setPage("dashboard")} className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary fill-primary/25" />
            <span className="font-serif text-lg font-semibold italic text-sidebar-foreground">Invito</span>
          </button>
        </div>
        <nav className="flex-1 py-3 overflow-y-auto">
          {SIDEBAR_NAV.map(({ icon: Icon, label }) => (
            <button key={label} onClick={() => handleNav(label)} className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm transition-all ${label === "Domain" ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium" : "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-foreground"}`}>
              <Icon className="w-4 h-4 flex-shrink-0" />{label}
            </button>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-sidebar-border">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0"><User className="w-4 h-4 text-primary" /></div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-sidebar-foreground truncate">{user.name}</p>
              <p className="text-[10px] text-sidebar-foreground/45 truncate">{user.email}</p>
            </div>
          </div>
          <button onClick={() => setPage("login")} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sidebar-foreground/55 hover:bg-sidebar-accent hover:text-sidebar-foreground text-xs transition-colors">
            <LogOut className="w-3.5 h-3.5" /> Keluar
          </button>
        </div>
      </aside>
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-foreground/40 z-30 lg:hidden" />}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-card border-b border-border px-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-1.5 rounded-lg hover:bg-muted transition-colors"><Menu className="w-5 h-5" /></button>
            <div>
              <p className="text-sm font-semibold">Pengaturan Domain</p>
              <p className="text-[11px] text-muted-foreground hidden sm:block">Atur alamat website undangan Anda</p>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-5">
          <div className="max-w-4xl mx-auto space-y-5">
            {/* ── 1) Domain Aktif Saat Ini (subdomain default) ── */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0"><Globe className="w-5 h-5 text-green-600" /></div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold mb-1">Domain Aktif Saat Ini</h3>
                  <p className="text-xs text-muted-foreground mb-3">Undangan Anda saat ini dapat diakses melalui alamat berikut:</p>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg border border-border">
                    <span className="text-sm font-mono text-primary flex-1 truncate">https://anisa-raka.invito.id</span>
                    <span className="text-[10px] px-2 py-1 bg-green-50 text-green-600 rounded-full border border-green-200">Aktif</span>
                    <button onClick={() => handleCopy("https://anisa-raka.invito.id")} className="text-xs text-primary hover:underline flex items-center gap-1"><Copy className="w-3 h-3" /> Salin</button>
                  </div>
                </div>
              </div>
            </div>

            {/* ── 2) Tambahkan Domain Kustom ── */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0"><Globe className="w-5 h-5 text-primary" /></div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold mb-1">Tambahkan Domain Kustom</h3>
                  <p className="text-xs text-muted-foreground mb-3">Gunakan domain pribadi Anda (misal: anisadanraka.com)</p>
                  <div className="flex gap-2">
                    <input value={customDomain} onChange={e => setCustomDomain(e.target.value)} placeholder="Masukkan domain kustom Anda..." className="flex-1 px-4 py-2.5 text-sm border border-border rounded-lg bg-muted outline-none focus:border-primary transition-colors" />
                    <button onClick={handleAddDomain} className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-all">Tambah Domain</button>
                  </div>
                </div>
              </div>
            </div>

            {/* ── 3) Daftar Domain Kustom (OPSI A) ── */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border flex items-center gap-3">
                <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center"><Globe className="w-4 h-4 text-primary" /></div>
                <div>
                  <h3 className="text-sm font-semibold">Daftar Domain Kustom</h3>
                  <p className="text-[11px] text-muted-foreground">{customDomains.length} domain • {customDomains.filter(d => d.status === "active").length} aktif</p>
                </div>
              </div>
              {customDomains.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground text-xs">Belum ada domain kustom. Tambahkan domain pribadi Anda di atas, lalu pasang record DNS & verifikasi.</div>
              ) : (
                <div>
                  {customDomains.map(d => (
                    <div key={d.id} className="p-4 flex flex-col lg:flex-row lg:items-center gap-3 border-b border-border/50 last:border-0">
                      <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center flex-shrink-0"><Globe className="w-4 h-4 text-muted-foreground" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold font-mono truncate">{d.name}</p>
                        <p className="text-[10px] text-muted-foreground">Ditambahkan {d.addedAt}</p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {d.status === "active" ? (
                          <>
                            <span className="text-[10px] px-2 py-1 bg-green-50 text-green-600 rounded-full border border-green-200">Aktif</span>
                            <span className="text-[10px] px-2 py-1 bg-green-50 text-green-600 rounded-full border border-green-200 flex items-center gap-1"><Shield className="w-3 h-3" /> SSL</span>
                          </>
                        ) : (
                          <span className="text-[10px] px-2 py-1 bg-yellow-50 text-yellow-600 rounded-full border border-yellow-200">Menunggu Verifikasi</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {d.status === "pending" && (
                          <button onClick={() => handleVerify(d.id)} disabled={verifyingId === d.id} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-[11px] font-medium hover:bg-primary/90 transition-colors flex items-center gap-1.5 disabled:opacity-60">
                            <RefreshCw className={`w-3 h-3 ${verifyingId === d.id ? "animate-spin" : ""}`} />
                            {verifyingId === d.id ? "Memverifikasi..." : "Verifikasi DNS"}
                          </button>
                        )}
                        <button onClick={() => handleRemove(d.id)} className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-[11px] hover:bg-red-100 transition-colors flex items-center gap-1.5">
                          <Trash2 className="w-3 h-3" /> Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── 4) Pengaturan DNS (panduan record) ── */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0"><Settings className="w-5 h-5 text-blue-600" /></div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold mb-1">Pengaturan DNS</h3>
                  <p className="text-xs text-muted-foreground">Tambahkan record berikut di panel DNS penyedia domain Anda (berlaku untuk semua domain kustom):</p>
                </div>
              </div>
              {pendingDomains.length > 0 && (
                <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-yellow-700">
                    Domain menunggu verifikasi: <span className="font-semibold font-mono">{pendingDomains.map(d => d.name).join(", ")}</span>. Pasang record di bawah ini di registrar Anda, lalu klik <span className="font-semibold">Verifikasi DNS</span> di daftar domain.
                  </p>
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Type</th>
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Name / Host</th>
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Value / Target</th>
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground">TTL</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="px-4 py-3 font-mono font-bold">CNAME</td>
                      <td className="px-4 py-3 font-mono">www</td>
                      <td className="px-4 py-3 font-mono text-primary">cname.invito.id</td>
                      <td className="px-4 py-3">3600</td>
                      <td className="px-4 py-3 text-right"><button onClick={() => handleCopy("cname.invito.id")} className="text-primary hover:underline flex items-center gap-1 ml-auto"><Copy className="w-3 h-3" /> Salin</button></td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono font-bold">A</td>
                      <td className="px-4 py-3 font-mono">@</td>
                      <td className="px-4 py-3 font-mono text-primary">104.21.45.123</td>
                      <td className="px-4 py-3">3600</td>
                      <td className="px-4 py-3 text-right"><button onClick={() => handleCopy("104.21.45.123")} className="text-primary hover:underline flex items-center gap-1 ml-auto"><Copy className="w-3 h-3" /> Salin</button></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-yellow-700">Perubahan DNS mungkin memerlukan waktu 1x24 jam untuk propagasi sepenuhnya. Pastikan SSL/HTTPS aktif setelah domain terhubung.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

// ── SETTINGS PAGE ───────────────────────────────────────────────────────────
function SettingsPage({ setPage, activeMenu, setActiveMenu, user, setUser }: {
  setPage: (p: Page) => void
  activeMenu: string
  setActiveMenu: (m: string) => void
  user: UserInfo
  setUser: (u: UserInfo) => void
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  // ✅ Isi form mengikuti data user yang sedang login
  const [profile, setProfile] = useState({ name: user.name, email: user.email, phone: user.phone })
  const [passwords, setPasswords] = useState({ old: "", new: "", confirm: "" })
  const [notifications, setNotifications] = useState({ email: true, whatsapp: true, marketing: false })
  const handleSaveProfile = () => {
    if (profile.name.length < 3) { toast.error("Nama minimal 3 karakter!"); return }
    if (!profile.email.includes("@")) { toast.error("Email tidak valid!"); return }
    // ✅ PERUBAHAN: update data user terpusat → semua sidebar ikut berubah
    setUser({ name: profile.name, email: profile.email, phone: profile.phone })
    toast.success("Profil berhasil diperbarui!")
  }
  const handleChangePassword = () => {
    if (passwords.old.length < 6) { toast.error("Password lama minimal 6 karakter!"); return }
    if (passwords.new.length < 6) { toast.error("Password baru minimal 6 karakter!"); return }
    if (passwords.new !== passwords.confirm) { toast.error("Konfirmasi password tidak cocok!"); return }
    toast.success("Password berhasil diperbarui!")
    setPasswords({ old: "", new: "", confirm: "" })
  }
  const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button onClick={onChange} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${checked ? "bg-primary" : "bg-muted border border-border"}`}>
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm ${checked ? "translate-x-4.5" : "translate-x-0.5"}`} />
    </button>
  )
  const handleNav = (label: string) => {
    setActiveMenu(label)
    if (label === "Dashboard") setPage("dashboard")
    else if (label === "Template") setPage("templates")
    else if (label === "Undangan Saya") setPage("my-invitations")
    else if (label === "Edit Undangan") setPage("editor")
    else if (label === "Data Tamu") setPage("guest-data")
    else if (label === "RSVP") setPage("rsvp")
    else if (label === "Amplop Digital") setPage("digital-envelope")
    else if (label === "QR Check-In") setPage("qr-checkin")
    else if (label === "Domain") setPage("domain")
    else if (label === "Pengaturan") setPage("settings")
    else if (label === "Akses Admin") setPage("admin-access")
    else if (label === "Akses Pengguna") setPage("user-access")
    else if (label === "Transaksi") setPage("dashboard")
    setSidebarOpen(false)
  }
  return (
    <div className="flex h-screen bg-muted overflow-hidden font-sans">
      <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:relative z-40 w-60 h-full bg-sidebar flex flex-col transition-transform duration-300 flex-shrink-0`}>
        <div className="px-5 py-5 border-b border-sidebar-border">
          <button onClick={() => setPage("dashboard")} className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary fill-primary/25" />
            <span className="font-serif text-lg font-semibold italic text-sidebar-foreground">Invito</span>
          </button>
        </div>
        <nav className="flex-1 py-3 overflow-y-auto">
          {SIDEBAR_NAV.map(({ icon: Icon, label }) => (
            <button key={label} onClick={() => handleNav(label)} className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm transition-all ${label === "Pengaturan" ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium" : "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-foreground"}`}>
              <Icon className="w-4 h-4 flex-shrink-0" />{label}
            </button>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-sidebar-border">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0"><User className="w-4 h-4 text-primary" /></div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-sidebar-foreground truncate">{user.name}</p>
              <p className="text-[10px] text-sidebar-foreground/45 truncate">{user.email}</p>
            </div>
          </div>
          <button onClick={() => setPage("login")} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sidebar-foreground/55 hover:bg-sidebar-accent hover:text-sidebar-foreground text-xs transition-colors">
            <LogOut className="w-3.5 h-3.5" /> Keluar
          </button>
        </div>
      </aside>
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-foreground/40 z-30 lg:hidden" />}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-card border-b border-border px-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-1.5 rounded-lg hover:bg-muted transition-colors"><Menu className="w-5 h-5" /></button>
            <div>
              <p className="text-sm font-semibold">Pengaturan</p>
              <p className="text-[11px] text-muted-foreground hidden sm:block">Kelola profil dan keamanan akun Anda</p>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-5">
          <div className="max-w-3xl mx-auto space-y-5">
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0"><User className="w-5 h-5 text-primary" /></div>
                <div>
                  <h3 className="text-sm font-semibold">Informasi Profil</h3>
                  <p className="text-xs text-muted-foreground">Perbarui data diri Anda</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium mb-1.5 block">Nama Lengkap</label>
                  <input value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} className="w-full px-4 py-2.5 text-sm border border-border rounded-lg bg-muted outline-none focus:border-primary transition-colors" />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block">Alamat Email</label>
                  <input value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} className="w-full px-4 py-2.5 text-sm border border-border rounded-lg bg-muted outline-none focus:border-primary transition-colors" />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block">Nomor WhatsApp</label>
                  <input value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} className="w-full px-4 py-2.5 text-sm border border-border rounded-lg bg-muted outline-none focus:border-primary transition-colors" />
                </div>
              </div>
              <div className="mt-5 flex justify-end">
                <button onClick={handleSaveProfile} className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-all">Simpan Perubahan</button>
              </div>
            </div>
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0"><Lock className="w-5 h-5 text-blue-600" /></div>
                <div>
                  <h3 className="text-sm font-semibold">Keamanan Akun</h3>
                  <p className="text-xs text-muted-foreground">Ganti password untuk melindungi akun</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium mb-1.5 block">Password Lama</label>
                  <input type="password" value={passwords.old} onChange={e => setPasswords({ ...passwords, old: e.target.value })} placeholder="••••••••" className="w-full px-4 py-2.5 text-sm border border-border rounded-lg bg-muted outline-none focus:border-primary transition-colors" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium mb-1.5 block">Password Baru</label>
                    <input type="password" value={passwords.new} onChange={e => setPasswords({ ...passwords, new: e.target.value })} placeholder="••••••••" className="w-full px-4 py-2.5 text-sm border border-border rounded-lg bg-muted outline-none focus:border-primary transition-colors" />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1.5 block">Konfirmasi Password</label>
                    <input type="password" value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} placeholder="••••••••" className="w-full px-4 py-2.5 text-sm border border-border rounded-lg bg-muted outline-none focus:border-primary transition-colors" />
                  </div>
                </div>
              </div>
              <div className="mt-5 flex justify-end">
                <button onClick={handleChangePassword} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all">Perbarui Password</button>
              </div>
            </div>
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0"><Bell className="w-5 h-5 text-purple-600" /></div>
                <div>
                  <h3 className="text-sm font-semibold">Preferensi Notifikasi</h3>
                  <p className="text-xs text-muted-foreground">Atur bagaimana kami menghubungi Anda</p>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { label: "Notifikasi Email", desc: "Terima update status undangan via email", key: "email" as const, icon: Mail },
                  { label: "Notifikasi WhatsApp", desc: "Terima notifikasi RSVP dan Amplop via WA", key: "whatsapp" as const, icon: MessageCircle },
                  { label: "Info & Promo", desc: "Terima tips dan penawaran spesial dari Invito", key: "marketing" as const, icon: Gift },
                ].map(({ label, desc, key, icon: Icon }) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/50">
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs font-semibold">{label}</p>
                        <p className="text-[10px] text-muted-foreground">{desc}</p>
                      </div>
                    </div>
                    <ToggleSwitch checked={notifications[key]} onChange={() => setNotifications({ ...notifications, [key]: !notifications[key] })} />
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-card rounded-2xl p-6 border border-red-200">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0"><AlertCircle className="w-5 h-5 text-red-600" /></div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-red-600">Zona Berbahaya</h3>
                  <p className="text-xs text-muted-foreground mb-3">Tindakan di bawah ini tidak dapat dibatalkan.</p>
                  <button onClick={() => toast.error("Fitur hapus akun dinonaktifkan untuk demo.")} className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-medium hover:bg-red-100 transition-all">Hapus Akun Saya</button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

// ─── DASHBOARD PAGE ─────────────────────────────────────────────────────────
function DashboardPage({ setPage, activeMenu, setActiveMenu, user, openEditor }: {
  setPage: (p: Page) => void
  activeMenu: string
  setActiveMenu: (m: string) => void
  user: UserInfo
  openEditor: (inv?: any) => void
}) {
  const [invitations, setInvitations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  // ✅ State untuk hapus undangan
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null)
  const [deleting, setDeleting] = useState(false)
  // Ambil data dari Backend saat komponen pertama kali dimuat
  useEffect(() => {
    fetch('http://localhost:5000/api/invitations')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setInvitations(data.data)
        }
        setLoading(false)
      })
      .catch(error => {
        console.error('Gagal mengambil data:', error)
        setLoading(false)
      })
  }, [])
  // ✅ Hapus undangan dari database (DELETE ke backend)
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`http://localhost:5000/api/invitations/${deleteTarget.id}`, { method: "DELETE" })
      const data = await res.json()
      if (data.success) {
        setInvitations(prev => prev.filter((i: any) => i.id !== deleteTarget.id))
        toast.success(`Undangan "${deleteTarget.coupleName}" berhasil dihapus dari database!`)
      } else {
        toast.error(data.message || "Gagal menghapus undangan.")
      }
    } catch (error) {
      console.error("Gagal menghapus dari backend:", error)
      toast.error("Tidak dapat terhubung ke server. Pastikan backend NestJS berjalan!")
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [txFilter, setTxFilter] = useState("Semua")
  const handleMenu = (label: string) => {
    setActiveMenu(label)
    if (label === "Dashboard") {
      setPage("dashboard")
      setSidebarOpen(false)
    } else if (label === "Template") {
      setPage("templates")
      setSidebarOpen(false)
    } else if (label === "Undangan Saya") {
      setPage("my-invitations")
      setSidebarOpen(false)
    } else if (label === "Edit Undangan") {
      // ✅ Sidebar tetap membuka editor baru (tanpa memuat undangan lama)
      toast.info("Edit undangan yang sudah ada saat ini")
      setPage("editor")
      setSidebarOpen(false)
    } else if (label === "Data Tamu") {
      setPage("guest-data")
      setSidebarOpen(false)
    } else if (label === "RSVP") {
      setPage("rsvp")
      setSidebarOpen(false)
    } else if (label === "Amplop Digital") {
      setPage("digital-envelope")
      setSidebarOpen(false)
    } else if (label === "QR Check-In") {
      setPage("qr-checkin")
      setSidebarOpen(false)
    } else if (label === "Domain") {
      setPage("domain")
      setSidebarOpen(false)
    } else if (label === "Pengaturan") {
      setPage("settings")
      setSidebarOpen(false)
    } else if (label === "Akses Admin") {
      setPage("admin-access")
      setSidebarOpen(false)
    } else if (label === "Akses Pengguna") {
      setPage("user-access")
      setSidebarOpen(false)
    } else if (label === "Transaksi") {
      // Tetap di dashboard tapi tampilkan view transaksi
      setPage("dashboard")
      setSidebarOpen(false)
    } else {
      toast.info(`Halaman ${label} akan segera hadir!`)
      setSidebarOpen(false)
    }
  }
  const filtered = txFilter === "Semua" ? MOCK_TRANSACTIONS : MOCK_TRANSACTIONS.filter(t => t.status === txFilter)
  return (
    <div className="flex h-screen bg-muted overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:relative z-40 w-60 h-full bg-sidebar flex flex-col transition-transform duration-300 flex-shrink-0`}>
        <div className="px-5 py-5 border-b border-sidebar-border">
          <button onClick={() => window.location.href = "http://localhost:5173"} className="flex items-center gap-2">
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
              <p className="text-xs font-semibold text-sidebar-foreground truncate">{user.name}</p>
              <p className="text-[10px] text-sidebar-foreground/45 truncate">{user.email}</p>
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
              <p className="text-[11px] text-muted-foreground hidden sm:block">Selamat datang, {user.name.split(" ")[0]}!</p>
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
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold">Undangan Saya</h3>
                  <button onClick={() => window.location.href = "http://localhost:5174"} className="text-xs text-primary flex items-center gap-1 hover:underline">
                    <Plus className="w-3 h-3" /> Buat baru
                  </button>
                </div>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">Memuat data undangan...</div>
                ) : invitations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">Belum ada undangan. Yuk buat yang pertama!</div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {invitations.map((inv: any) => {
                      const themeImage = getThemeImage(inv.theme)
                      return (
                        <div key={inv.id} className="border border-border rounded-xl overflow-hidden group hover:shadow-md transition-all">
                          <div className="h-28 relative overflow-hidden">
                            {themeImage ? (
                              <img
                                src={themeImage}
                                alt={inv.theme}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-secondary to-accent/40" />
                            )}
                            <div className="absolute inset-0 bg-foreground/20 group-hover:bg-foreground/10 transition-colors flex items-center justify-center">
                              <p className="font-serif text-base text-white drop-shadow-lg">{inv.coupleName}</p>
                            </div>
                            <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  openEditor(inv)
                                }}
                                className="px-3 py-1.5 bg-primary text-primary-foreground rounded-full text-xs shadow-md hover:bg-primary/90 transition-colors"
                              >
                                Edit
                              </button>
                              {/* ✅ BARU: tombol Hapus dengan konfirmasi */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setDeleteTarget(inv)
                                }}
                                className="px-3 py-1.5 bg-red-500 text-white rounded-full text-xs shadow-md hover:bg-red-600 transition-colors"
                              >
                                Hapus
                              </button>
                            </div>
                          </div>
                          <div className="px-3.5 py-2.5 flex items-center justify-between">
                            <div>
                              <p className="text-xs font-medium">{inv.theme}</p>
                              <p className="text-[10px] text-muted-foreground">{inv.visits} kunjungan</p>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${inv.status === "Published" ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"}`}>
                              {inv.status}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                    {/* Tombol Buat Baru */}
                    <button onClick={() => window.location.href = "http://localhost:5174"}
                      className="border-2 border-dashed border-border rounded-xl min-h-[120px] flex flex-col items-center justify-center gap-2 hover:border-primary hover:text-primary transition-colors text-muted-foreground">
                      <Plus className="w-6 h-6" />
                      <span className="text-xs">Buat Undangan Baru</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
      {/* ✅ BARU: dialog peringatan hapus */}
      <ConfirmDeleteDialog
        open={deleteTarget !== null}
        title="Hapus Undangan?"
        description={`Undangan "${deleteTarget?.coupleName}" akan dihapus permanen dari database. Tindakan ini tidak dapat dibatalkan.`}
        busy={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}

// ─── EDITOR PAGE ──────────────────────────────────────────────────────────────
const EDITOR_FONTS = [
  { name: "Playfair Display", family: "'Playfair Display', serif" },
  { name: "Cormorant Garamond", family: "'Cormorant Garamond', serif" },
  { name: "Great Vibes", family: "'Great Vibes', cursive" },
  { name: "Lora", family: "'Lora', serif" },
  { name: "Montserrat", family: "'Montserrat', sans-serif" },
]

function EditorPage({ setPage, initialInvitation }: { setPage: (p: Page) => void; initialInvitation?: any }) {
  // ✅ Settings tersimpan (kalau ada) — null-safe (baris lama settings null tetap aman)
  const s = initialInvitation?.settings ?? {}
  const [activeTab, setActiveTab] = useState("Tema")
  const [activeSection, setActiveSection] = useState("Opening")
  // ✅ Tema mengikuti nama yang tersimpan (kalau tidak cocok → tema pertama)
  const [selectedTheme, setSelectedTheme] = useState(() => {
    const idx = THEME_NAMES.indexOf(initialInvitation?.theme)
    return idx >= 0 ? idx : 0
  })
  // ✅ State editor — semuanya terhubung ke preview ponsel (diisi dari database)
  const [background, setBackground] = useState<string | null>(s.background ?? null)
  const [customFonts, setCustomFonts] = useState<{ name: string; family: string }[]>(
    s.selectedFont && !EDITOR_FONTS.some(f => f.name === s.selectedFont)
      ? [{ name: s.selectedFont, family: `'${s.selectedFont}'` }]
      : []
  )
  const [selectedFont, setSelectedFont] = useState<string>(s.selectedFont ?? "Playfair Display")
  const [fontSize, setFontSize] = useState<number>(s.fontSize ?? 28)
  const [bgColor, setBgColor] = useState<string>(s.bgColor ?? "#FAF8F4")
  const [textColor, setTextColor] = useState<string>(s.textColor ?? "#2A1F1A")
  const [accentColor, setAccentColor] = useState<string>(s.accentColor ?? "#C4954A")
  const [musicUrl, setMusicUrl] = useState<string | null>(null)
  const [musicName, setMusicName] = useState<string>(s.musicName ?? "")
  const [musicPlaying, setMusicPlaying] = useState(false)
  const [bridePhoto, setBridePhoto] = useState<string | null>(s.bridePhoto ?? null)
  const [groomPhoto, setGroomPhoto] = useState<string | null>(s.groomPhoto ?? null)
  const [couplePhotos, setCouplePhotos] = useState<{ id: number; url: string }[]>(s.couplePhotos ?? [])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  // ✅ ID undangan tersimpan (null = buat baru; terisi = Simpan jadi PUT/update)
  const [savedId, setSavedId] = useState<number | null>(initialInvitation?.id ?? null)
  const [saving, setSaving] = useState(false)
  // ✅ State untuk hapus undangan dari editor
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const themeNames = THEME_NAMES
  const themeImage = getThemeImage(themeNames[selectedTheme])
  const allFonts = [...EDITOR_FONTS, ...customFonts]
  const fontFamily = allFonts.find(f => f.name === selectedFont)?.family ?? "'Playfair Display', serif"
  // Muat Google Fonts supaya pilihan font benar-benar terlihat di preview
  useEffect(() => {
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Cormorant+Garamond:wght@400;600&family=Great+Vibes&family=Lora:wght@400;600&family=Montserrat:wght@400;600&display=swap"
    document.head.appendChild(link)
    return () => { document.head.removeChild(link) }
  }, [])
  // ✅ Kabari pengguna kalau editor memuat undangan tersimpan
  useEffect(() => {
    if (initialInvitation) {
      toast.success(`Undangan "${initialInvitation.coupleName}" dimuat dari database!`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  // Berhentikan audio saat komponen ditutup
  useEffect(() => {
    return () => { audioRef.current?.pause() }
  }, [])
  const readImage = (file: File, cb: (url: string) => void) => {
    const reader = new FileReader()
    reader.onload = () => cb(reader.result as string)
    reader.readAsDataURL(file)
  }
  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) { toast.error("File harus berupa gambar!"); return }
    readImage(file, url => { setBackground(url); toast.success("Background terpasang di preview!") })
    e.target.value = ""
  }
  const handleFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!/\.(ttf|otf|woff|woff2)$/i.test(file.name)) { toast.error("Format font harus .ttf, .otf, .woff, atau .woff2!"); return }
    try {
      const buffer = await file.arrayBuffer()
      const familyName = `Custom-${file.name.replace(/\.[^/.]+$/, "")}`
      const face = new FontFace(familyName, buffer)
      await face.load()
      document.fonts.add(face)
      setCustomFonts(prev => [...prev.filter(f => f.name !== familyName), { name: familyName, family: `'${familyName}'` }])
      setSelectedFont(familyName)
      toast.success(`Font "${familyName}" siap dipakai!`)
    } catch {
      toast.error("Gagal memuat font. Pastikan file valid.")
    }
    e.target.value = ""
  }
  const handleMusicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("audio/")) { toast.error("File harus berupa audio!"); return }
    audioRef.current?.pause()
    if (musicUrl) URL.revokeObjectURL(musicUrl)
    setMusicUrl(URL.createObjectURL(file))
    setMusicName(file.name)
    setMusicPlaying(false)
    toast.success("Musik berhasil diupload!")
    e.target.value = ""
  }
  const toggleMusic = () => {
    const audio = audioRef.current
    if (!audio || !musicUrl) return
    if (musicPlaying) {
      audio.pause()
      setMusicPlaying(false)
      toast.info("Musik dimatikan.")
    } else {
      audio.play()
        .then(() => { setMusicPlaying(true); toast.success("Musik diputar.") })
        .catch(() => toast.error("Gagal memutar musik."))
    }
  }
  const removeMusic = () => {
    audioRef.current?.pause()
    if (musicUrl) URL.revokeObjectURL(musicUrl)
    setMusicUrl(null)
    setMusicName("")
    setMusicPlaying(false)
    toast.info("Musik dihapus.")
  }
  const handleBridePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) { toast.error("File harus berupa gambar!"); return }
    readImage(file, url => { setBridePhoto(url); toast.success("Foto mempelai wanita terpasang!") })
    e.target.value = ""
  }
  const handleGroomPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) { toast.error("File harus berupa gambar!"); return }
    readImage(file, url => { setGroomPhoto(url); toast.success("Foto mempelai pria terpasang!") })
    e.target.value = ""
  }
  const handleCouplePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).filter(f => f.type.startsWith("image/"))
    if (files.length === 0) { toast.error("File harus berupa gambar!"); e.target.value = ""; return }
    const added: { id: number; url: string }[] = []
    let done = 0
    files.forEach((f, i) => {
      readImage(f, url => {
        added.push({ id: Date.now() + i, url })
        done++
        if (done === files.length) {
          setCouplePhotos(prev => [...prev, ...added])
          toast.success(`${files.length} foto pasangan ditambahkan!`)
        }
      })
    })
    e.target.value = ""
  }
  // ✅ SIMPAN / PUBLISH ke backend NestJS (data benar-benar masuk database)
  const handleSave = async (status: "Draft" | "Published") => {
    setSaving(true)
    const payload = {
      coupleName: initialInvitation?.coupleName ?? "Anisa & Raka",
      theme: themeNames[selectedTheme],
      status,
      visits: initialInvitation?.visits ?? 0,
      settings: {
        background,
        selectedFont,
        fontSize,
        bgColor,
        textColor,
        accentColor,
        musicName,
        bridePhoto,
        groomPhoto,
        couplePhotos,
      },
    }
    try {
      const url = savedId == null ? "http://localhost:5000/api/invitations" : `http://localhost:5000/api/invitations/${savedId}`
      const res = await fetch(url, {
        method: savedId == null ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) {
        if (savedId == null) setSavedId(data.data.id)
        toast.success(status === "Published" ? "Undangan dipublish & tersimpan di database!" : "Perubahan tersimpan di database!")
      } else {
        toast.error(data.message || "Gagal menyimpan undangan.")
      }
    } catch (error) {
      console.error("Gagal menyimpan ke backend:", error)
      toast.error("Tidak dapat terhubung ke server. Pastikan backend NestJS berjalan!")
    } finally {
      setSaving(false)
    }
  }
  // ✅ BARU: HAPUS undangan dari database (DELETE ke backend), lalu kembali ke dashboard
  const handleDelete = async () => {
    if (savedId == null) return
    setDeleting(true)
    try {
      const res = await fetch(`http://localhost:5000/api/invitations/${savedId}`, { method: "DELETE" })
      const data = await res.json()
      if (data.success) {
        toast.success("Undangan berhasil dihapus dari database!")
        setPage("dashboard")
      } else {
        toast.error(data.message || "Gagal menghapus undangan.")
      }
    } catch (error) {
      console.error("Gagal menghapus dari backend:", error)
      toast.error("Tidak dapat terhubung ke server. Pastikan backend NestJS berjalan!")
    } finally {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }
  // ✅ PREVIEW PONSEL — menyesuaikan semua pengaturan
  const renderPreview = () => {
    const heroStyle: React.CSSProperties | undefined = background
      ? { backgroundImage: `url(${background})`, backgroundSize: "cover", backgroundPosition: "center" }
      : undefined
    const title = (size?: number) => (
      <h2 className="font-serif font-semibold" style={{ fontFamily, fontSize: `${size ?? fontSize}px`, lineHeight: 1.2 }}>Anisa & Raka</h2>
    )
    if (activeSection === "Opening") return (
      <>
        <div className="relative">
          <div className="w-full h-44 bg-secondary flex items-center justify-center overflow-hidden" style={heroStyle}>
            {!background && (themeImage ? <img src={themeImage} alt="tema" className="w-full h-full object-cover" /> : <span className="text-muted-foreground">Theme Preview</span>)}
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white pointer-events-none" />
        </div>
        <div className="px-6 pb-6 -mt-3 text-center" style={{ color: textColor }}>
          <p className="text-[9px] tracking-[0.2em] uppercase mb-1" style={{ opacity: 0.6 }}>The Wedding of</p>
          {title()}
          <div className="w-14 h-px mx-auto my-3" style={{ backgroundColor: accentColor, opacity: 0.5 }} />
          <p className="text-[10px]" style={{ opacity: 0.7 }}>Sabtu, 12 Januari 2025</p>
          <p className="text-[10px] mb-4" style={{ opacity: 0.7 }}>Ballroom Hotel Mulia, Jakarta</p>
          <div className="flex items-center justify-center gap-1.5 mb-5 rounded-full py-2 px-4" style={{ backgroundColor: `${accentColor}14` }}>
            <Clock className="w-3 h-3" style={{ color: accentColor }} /><span className="text-[10px] font-medium" style={{ color: accentColor }}>30 hari lagi</span>
          </div>
          <button className="w-full py-2.5 text-white text-[11px] rounded-full font-medium" style={{ backgroundColor: accentColor }}>Buka Undangan</button>
        </div>
      </>
    )
    if (activeSection === "Mempelai") return (
      <div className="p-6 text-center space-y-5" style={{ color: textColor }}>
        <p className="text-[9px] tracking-[0.2em] uppercase" style={{ opacity: 0.6 }}>Mempelai</p>
        {title(Math.min(fontSize, 22))}
        <div className="flex flex-col items-center gap-2">
          {bridePhoto ? <img src={bridePhoto} alt="wanita" className="w-20 h-20 rounded-full object-cover border-2" style={{ borderColor: accentColor }} /> : <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center"><User className="w-7 h-7" style={{ color: accentColor }} /></div>}
          <p className="text-sm font-semibold" style={{ fontFamily }}>Anisa Rahmawati</p>
          <p className="text-[10px]" style={{ opacity: 0.6 }}>Putri pertama dari Bpk. Rahman & Ibu Sari</p>
        </div>
        <p className="font-serif text-xl" style={{ fontFamily, color: accentColor }}>&</p>
        <div className="flex flex-col items-center gap-2">
          {groomPhoto ? <img src={groomPhoto} alt="pria" className="w-20 h-20 rounded-full object-cover border-2" style={{ borderColor: accentColor }} /> : <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center"><User className="w-7 h-7" style={{ color: accentColor }} /></div>}
          <p className="text-sm font-semibold" style={{ fontFamily }}>Raka Pratama</p>
          <p className="text-[10px]" style={{ opacity: 0.6 }}>Putra kedua dari Bpk. Budi & Ibu Dewi</p>
        </div>
      </div>
    )
    if (activeSection === "Akad" || activeSection === "Resepsi") return (
      <div className="p-6 text-center space-y-3" style={{ color: textColor }}>
        <p className="text-[9px] tracking-[0.2em] uppercase" style={{ opacity: 0.6 }}>{activeSection}</p>
        {title(Math.min(fontSize, 22))}
        <div className="w-14 h-px mx-auto" style={{ backgroundColor: accentColor, opacity: 0.5 }} />
        <p className="text-[11px] font-medium">Sabtu, 12 Januari 2025</p>
        <p className="text-[10px]" style={{ opacity: 0.6 }}>{activeSection === "Akad" ? "Pukul 08.00 WIB" : "Pukul 11.00 – 15.00 WIB"}</p>
        <p className="text-[10px] mb-2" style={{ opacity: 0.6 }}>Ballroom Hotel Mulia, Jakarta</p>
        <button className="w-full py-2 text-white text-[10px] rounded-full flex items-center justify-center gap-1" style={{ backgroundColor: accentColor }}><MapPin className="w-3 h-3" /> Lihat Lokasi</button>
      </div>
    )
    if (activeSection === "Galeri") return (
      <div className="p-6" style={{ color: textColor }}>
        <p className="text-[9px] tracking-[0.2em] uppercase text-center mb-4" style={{ opacity: 0.6 }}>Galeri</p>
        {couplePhotos.length === 0 ? (
          <div className="py-10 text-center text-[10px]" style={{ opacity: 0.5 }}>Belum ada foto galeri.<br />Upload lewat panel Foto.</div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {couplePhotos.map(p => <img key={p.id} src={p.url} alt="galeri" className="w-full aspect-square object-cover rounded-lg" />)}
          </div>
        )}
      </div>
    )
    if (activeSection === "RSVP") return (
      <div className="p-6 space-y-3" style={{ color: textColor }}>
        <p className="text-[9px] tracking-[0.2em] uppercase text-center" style={{ opacity: 0.6 }}>RSVP</p>
        <input placeholder="Nama Anda" className="w-full px-3 py-2 text-[10px] rounded-lg border border-border bg-white outline-none" />
        <div className="flex gap-2">
          <button className="flex-1 py-2 text-white text-[10px] rounded-full" style={{ backgroundColor: accentColor }}>Hadir</button>
          <button className="flex-1 py-2 text-[10px] rounded-full border border-border" style={{ color: textColor }}>Tidak Hadir</button>
        </div>
        <textarea placeholder="Tuliskan ucapan..." className="w-full px-3 py-2 text-[10px] rounded-lg border border-border bg-white outline-none h-16 resize-none" />
        <button className="w-full py-2 text-white text-[10px] rounded-full" style={{ backgroundColor: accentColor }}>Kirim Ucapan</button>
      </div>
    )
    if (activeSection === "Ucapan") return (
      <div className="p-6 space-y-3" style={{ color: textColor }}>
        <p className="text-[9px] tracking-[0.2em] uppercase text-center" style={{ opacity: 0.6 }}>Ucapan</p>
        {[{ n: "Dewi Sartika", m: "Selamat menempuh hidup baru!" }, { n: "Budi Santoso", m: "Bahagia selalu kalian!" }].map((u, i) => (
          <div key={i} className="p-3 rounded-lg bg-white border border-border">
            <p className="text-[10px] font-semibold">{u.n}</p>
            <p className="text-[10px]" style={{ opacity: 0.7 }}>{u.m}</p>
          </div>
        ))}
      </div>
    )
    // Penutup
    return (
      <div className="p-8 text-center space-y-3" style={{ color: textColor }}>
        <p className="text-[10px] leading-relaxed" style={{ opacity: 0.7 }}>Terima kasih atas doa dan restu Anda. Sampai jumpa di hari bahagia kami!</p>
        <div className="w-14 h-px mx-auto" style={{ backgroundColor: accentColor, opacity: 0.5 }} />
        {title(18)}
      </div>
    )
  }
  return (
    <div className="flex h-screen bg-muted overflow-hidden font-sans">
      {/* ── Sidebar kiri: tab editor ── */}
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
                {themeNames.map((name, i) => {
                  const img = getThemeImage(name)
                  return (
                    <button key={i} onClick={() => setSelectedTheme(i)} className={`relative rounded-xl overflow-hidden aspect-[3/4] border-2 transition-all ${selectedTheme === i ? "border-primary" : "border-transparent hover:border-primary/30"}`}>
                      {img ? <img src={img} alt={name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-secondary" />}
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-foreground/60 to-transparent p-2">
                        <p className="text-white text-[10px] font-medium">{name}</p>
                      </div>
                      {selectedTheme === i && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
              <p className="text-[10px] text-muted-foreground mt-3">Foto tema yang dipilih tampil di preview ponsel.</p>
            </div>
          )}
          {activeTab === "Background" && (
            <div className="space-y-3">
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">Background</p>
              <div className="rounded-xl overflow-hidden border border-border aspect-[3/4] bg-secondary flex items-center justify-center">
                {background ? <img src={background} alt="background" className="w-full h-full object-cover" /> : <Image className="w-6 h-6 text-muted-foreground" />}
              </div>
              <label htmlFor="upload-background" className="w-full py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                <Upload className="w-3.5 h-3.5" /> Upload Background
              </label>
              <input id="upload-background" type="file" accept="image/*" className="hidden" onChange={handleBackgroundUpload} />
              {background && (
                <button onClick={() => { setBackground(null); toast.info("Background dihapus.") }} className="w-full py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs hover:bg-red-100 transition-colors flex items-center justify-center gap-1.5">
                  <Trash2 className="w-3.5 h-3.5" /> Hapus Background
                </button>
              )}
              <p className="text-[10px] text-muted-foreground">Gambar menggantikan area atas preview ponsel.</p>
            </div>
          )}
          {activeTab === "Font" && (
            <div className="space-y-2">
              <p className="text-[10px] text-muted-foreground mb-3 font-semibold uppercase tracking-widest">Pilih Font</p>
              {allFonts.map(f => (
                <button key={f.name} onClick={() => { setSelectedFont(f.name); toast.success(`Font "${f.name}" dipakai.`) }} className={`w-full flex items-center gap-3 p-2.5 rounded-xl border transition-all ${selectedFont === f.name ? "bg-primary/10 border-primary/25" : "border-transparent hover:bg-muted"}`}>
                  <span className="text-lg w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0" style={{ fontFamily: f.family }}>Aa</span>
                  <span className="text-xs font-medium truncate">{f.name}</span>
                  {selectedFont === f.name && <Check className="w-3 h-3 text-primary ml-auto flex-shrink-0" />}
                </button>
              ))}
              <label htmlFor="upload-font" className="w-full py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                <Upload className="w-3.5 h-3.5" /> Upload Font Custom
              </label>
              <input id="upload-font" type="file" accept=".ttf,.otf,.woff,.woff2" className="hidden" onChange={handleFontUpload} />
              <p className="text-[10px] text-muted-foreground">Format: .ttf, .otf, .woff, .woff2</p>
            </div>
          )}
          {activeTab === "Musik" && (
            <div className="space-y-3">
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">Musik Latar</p>
              <label htmlFor="upload-musik" className="w-full py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                <Upload className="w-3.5 h-3.5" /> Upload Musik
              </label>
              <input id="upload-musik" type="file" accept="audio/*" className="hidden" onChange={handleMusicUpload} />
              {musicUrl ? (
                <div className="p-3 rounded-xl border border-border bg-muted/50 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"><Music className="w-4 h-4 text-primary" /></div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{musicName}</p>
                      <p className="text-[10px] text-muted-foreground">{musicPlaying ? "Sedang diputar" : "Berhenti"}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={toggleMusic} className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${musicPlaying ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}>
                      {musicPlaying ? <><Pause className="w-3.5 h-3.5" /> Matikan</> : <><Play className="w-3.5 h-3.5" /> Putar</>}
                    </button>
                    <button onClick={removeMusic} className="px-3 py-2 bg-muted border border-border rounded-lg text-xs hover:bg-muted/80 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                  <audio ref={audioRef} src={musicUrl} loop />
                </div>
              ) : (
                <p className="text-[10px] text-muted-foreground">
                  {musicName
                    ? `Musik tersimpan: "${musicName}". Upload ulang file audio untuk memutar di preview.`
                    : "Belum ada musik. Upload file audio (mp3/wav) untuk preview."}
                </p>
              )}
            </div>
          )}
          {activeTab === "Foto" && (
            <div className="space-y-4">
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">Foto Mempelai</p>
              <div className="flex items-center gap-3 p-2.5 rounded-xl border border-border">
                {bridePhoto ? <img src={bridePhoto} alt="wanita" className="w-10 h-10 rounded-full object-cover flex-shrink-0" /> : <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0"><User className="w-4 h-4 text-muted-foreground" /></div>}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium">Mempelai Wanita</p>
                  <label htmlFor="upload-bride" className="text-[10px] text-primary cursor-pointer hover:underline">{bridePhoto ? "Ganti foto" : "Upload foto"}</label>
                </div>
                {bridePhoto && <button onClick={() => setBridePhoto(null)} className="text-red-500 flex-shrink-0"><X className="w-3.5 h-3.5" /></button>}
              </div>
              <input id="upload-bride" type="file" accept="image/*" className="hidden" onChange={handleBridePhoto} />
              <div className="flex items-center gap-3 p-2.5 rounded-xl border border-border">
                {groomPhoto ? <img src={groomPhoto} alt="pria" className="w-10 h-10 rounded-full object-cover flex-shrink-0" /> : <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0"><User className="w-4 h-4 text-muted-foreground" /></div>}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium">Mempelai Pria</p>
                  <label htmlFor="upload-groom" className="text-[10px] text-primary cursor-pointer hover:underline">{groomPhoto ? "Ganti foto" : "Upload foto"}</label>
                </div>
                {groomPhoto && <button onClick={() => setGroomPhoto(null)} className="text-red-500 flex-shrink-0"><X className="w-3.5 h-3.5" /></button>}
              </div>
              <input id="upload-groom" type="file" accept="image/*" className="hidden" onChange={handleGroomPhoto} />
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">Foto Pasangan (Galeri)</p>
              <label htmlFor="upload-couple" className="w-full py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                <Plus className="w-3.5 h-3.5" /> Tambah Foto Pasangan
              </label>
              <input id="upload-couple" type="file" accept="image/*" multiple className="hidden" onChange={handleCouplePhotos} />
              {couplePhotos.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {couplePhotos.map(p => (
                    <div key={p.id} className="relative group">
                      <img src={p.url} alt="pasangan" className="w-full aspect-square object-cover rounded-lg" />
                      <button onClick={() => setCouplePhotos(prev => prev.filter(x => x.id !== p.id))} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-[10px] text-muted-foreground">Boleh pilih lebih dari satu foto sekaligus.</p>
            </div>
          )}
        </div>
      </div>
      {/* ── Tengah: preview ponsel ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-12 bg-card border-b border-border px-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setPage("dashboard")} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"><ChevronRight className="w-3.5 h-3.5 rotate-180" />Dashboard</button>
            <span className="text-muted-foreground/30 select-none">|</span>
            <div className="flex items-center gap-1.5"><Heart className="w-3.5 h-3.5 text-primary fill-primary/20" /><span className="text-xs font-semibold">Anisa & Raka</span></div>
          </div>
          <div className="flex items-center gap-1.5">
            <button className="px-2.5 py-1.5 text-[11px] border border-border rounded-lg hover:bg-muted transition-colors flex items-center gap-1"><Eye className="w-3 h-3" /> Preview</button>
            <button onClick={() => handleSave("Draft")} disabled={saving} className="px-2.5 py-1.5 text-[11px] border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-60">{saving ? "Menyimpan..." : "Simpan"}</button>
            <button className="px-2.5 py-1.5 text-[11px] bg-muted rounded-lg hover:bg-muted/80 transition-colors flex items-center gap-1"><Share2 className="w-3 h-3" /> Bagikan</button>
            {/* ✅ BARU: tombol Hapus (muncul hanya jika undangan sudah tersimpan) */}
            {savedId != null && (
              <button onClick={() => setConfirmDelete(true)} disabled={saving || deleting} className="px-2.5 py-1.5 text-[11px] bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1 disabled:opacity-60">
                <Trash2 className="w-3 h-3" /> Hapus
              </button>
            )}
            <button onClick={() => handleSave("Published")} disabled={saving} className="px-3.5 py-1.5 text-[11px] bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-60">Publish</button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-6 flex items-start justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-[280px] bg-foreground rounded-[2.5rem] p-3 shadow-2xl">
              <div className="w-full rounded-[2rem] overflow-hidden min-h-[560px]" style={{ backgroundColor: bgColor, color: textColor }}>
                {renderPreview()}
              </div>
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              {PAGES_LIST.map(s => (
                <button key={s} onClick={() => setActiveSection(s)} className={`px-3 py-1 text-[11px] rounded-full transition-all ${activeSection === s ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:border-primary"}`}>{s}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* ── Kanan: pengaturan elemen (terhubung ke preview) ── */}
      <div className="w-60 bg-card border-l border-border flex-shrink-0 overflow-y-auto">
        <div className="px-4 py-3.5 border-b border-border"><h3 className="text-xs font-semibold">Pengaturan Elemen</h3></div>
        <div className="p-4 space-y-5">
          {[{ label: "Warna Background", value: bgColor, set: setBgColor }, { label: "Warna Teks", value: textColor, set: setTextColor }, { label: "Warna Aksen", value: accentColor, set: setAccentColor }].map(c => (
            <div key={c.label}>
              <label className="text-[10px] text-muted-foreground mb-2 block font-semibold uppercase tracking-wide">{c.label}</label>
              <div className="flex items-center gap-2">
                <label className="w-7 h-7 rounded-lg border border-border shadow-sm cursor-pointer relative overflow-hidden" style={{ backgroundColor: c.value }}>
                  <input type="color" value={c.value} onChange={e => c.set(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                </label>
                <span className="text-[11px] font-mono bg-muted px-2 py-1 rounded-lg uppercase">{c.value}</span>
              </div>
            </div>
          ))}
          <div>
            <label className="text-[10px] text-muted-foreground mb-2 block font-semibold uppercase tracking-wide">Font Judul</label>
            <select value={selectedFont} onChange={e => setSelectedFont(e.target.value)} className="w-full text-xs border border-border rounded-lg px-3 py-2 bg-muted outline-none focus:border-primary cursor-pointer">
              {allFonts.map(f => <option key={f.name} value={f.name}>{f.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground mb-2 block font-semibold uppercase tracking-wide">Ukuran Font <span className="font-normal normal-case text-foreground">{fontSize}px</span></label>
            <input type="range" min="16" max="48" value={fontSize} onChange={e => setFontSize(Number(e.target.value))} className="w-full accent-primary" />
          </div>
        </div>
      </div>
      {/* ✅ BARU: dialog peringatan hapus */}
      <ConfirmDeleteDialog
        open={confirmDelete}
        title="Hapus Undangan?"
        description="Undangan ini akan dihapus permanen dari database. Tindakan ini tidak dapat dibatalkan."
        busy={deleting}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
      />
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
// ─── PAYMENT METHOD PAGE ─────────────────────────────────────────────────────
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
// ─── PAYMENT SUCCESS PAGE ────────────────────────────────────────────────────
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

// ─── ADMIN ACCESS PAGE ───────────────────────────────────────────────────────
type AdminAccount = {
  id: number
  name: string
  email: string
  photo: string | null
  role: string
  password: string
}
type AdminModule = "users" | "content" | "system" | "monitor"
function AdminAccessPage({ setPage, activeMenu, setActiveMenu, user, accounts, setAccounts, adminAccounts, setAdminAccounts }: {
  setPage: (p: Page) => void
  activeMenu: string
  setActiveMenu: (m: string) => void
  user: UserInfo
  accounts: UserAccount[]
  setAccounts: (a: UserAccount[]) => void
  adminAccounts: AdminAccount[]
  setAdminAccounts: (a: AdminAccount[]) => void
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  // ✅ "panel" = tabel & modul admin (tampil pertama kali), "form" = buat/edit akun
  const [view, setView] = useState<"panel" | "form">("panel")
  const [activeModule, setActiveModule] = useState<AdminModule>("users")
  // ✅ Tipe akun yang dibuat lewat tombol Create (admin / pengguna)
  const [createType, setCreateType] = useState<"admin" | "user">("admin")
  const [showCreateMenu, setShowCreateMenu] = useState(false)
  // ✅ PERBAIKAN: Admin Utama = akun yang sedang login (turunan) + akun admin buatan tersimpan di App (awet & bisa login)
  const admins: AdminAccount[] = [
    { id: 1, name: user.name, email: user.email, photo: null, role: "Admin Utama", password: "" },
    ...adminAccounts,
  ]
  // ✅ Form kini punya field role
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "Admin" })
  const [showPassword, setShowPassword] = useState(false)
  const [photo, setPhoto] = useState<string | null>(null)
  const [editing, setEditing] = useState<{ type: "admin" | "user"; id: number } | null>(null)
  const [selected, setSelected] = useState<{ type: "admin" | "user"; id: number } | null>(null)
  // ✅ Modul Kelola Konten
  const [contentItems, setContentItems] = useState([
    { id: 1, name: "Undangan Anisa & Raka", kind: "Undangan", active: true },
    { id: 2, name: "Tema Elegant", kind: "Tema", active: true },
    { id: 3, name: "Tema Luxury", kind: "Tema", active: false },
    { id: 4, name: "Halaman RSVP", kind: "Halaman", active: true },
  ])
  // ✅ Modul Pengaturan Sistem
  const [system, setSystem] = useState({ maintenance: false, twoFA: true, publicReg: true, timeout: 30 })
  // ✅ Modul Pantau Operasional
  const [activity, setActivity] = useState([
    { id: 1, time: "09:12", actor: user.name, action: "Login ke panel admin" },
    { id: 2, time: "09:05", actor: "Sistem", action: "Backup harian selesai" },
    { id: 3, time: "08:47", actor: "Sistem", action: "Sinkronisasi data undangan" },
  ])
  const MODULES: { id: AdminModule; title: string; desc: string; icon: any }[] = [
    { id: "users", title: "Kelola Pengguna", desc: "Atur akun, peran (roles), dan izin akses pengguna", icon: Users },
    { id: "content", title: "Kelola Konten", desc: "Tambah, ubah, atau hapus data dan informasi", icon: FileText },
    { id: "system", title: "Pengaturan Sistem", desc: "Konfigurasi dasar aplikasi dan keamanan", icon: Settings },
    { id: "monitor", title: "Pantau Operasional", desc: "Lihat aktivitas sistem secara langsung", icon: TrendingUp },
  ]
  // ✅ Akun yang sedang dikerjakan di form (untuk edit ikut tipe akun yang dipilih)
  const targetType: "admin" | "user" = editing ? editing.type : createType
  const roleOptions = targetType === "admin"
    ? ["Admin Utama", "Admin", "Editor", "Marketing", "Viewer"]
    : ["Pengguna", "VIP"]
  const logActivity = (action: string) => {
    const time = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    setActivity(prev => [{ id: Date.now(), time, actor: user.name, action }, ...prev])
  }
  const initials = (name: string) => name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
  const selectedName = selected
    ? (selected.type === "admin" ? admins.find(a => a.id === selected.id)?.name : accounts.find(a => a.id === selected.id)?.name) ?? ""
    : ""
  const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button onClick={onChange} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${checked ? "bg-primary" : "bg-muted border border-border"}`}>
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm ${checked ? "translate-x-4.5" : "translate-x-0.5"}`} />
    </button>
  )
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) { toast.error("File harus berupa gambar!"); return }
    if (file.size > 2 * 1024 * 1024) { toast.error("Ukuran foto maksimal 2MB!"); return }
    const reader = new FileReader()
    reader.onload = () => { setPhoto(reader.result as string); toast.success("Foto profil siap disimpan!") }
    reader.readAsDataURL(file)
    e.target.value = ""
  }
  // ✅ Create: pilih dulu tipe akun (admin / pengguna) dari dropdown
  const startCreate = (type: "admin" | "user") => {
    setEditing(null)
    setCreateType(type)
    setForm({ name: "", email: "", password: "", role: type === "admin" ? "Admin" : "Pengguna" })
    setPhoto(null)
    setShowPassword(false)
    setShowCreateMenu(false)
    setView("form")
  }
  // ✅ Pojok kiri bawah: edit akun yang dipilih di tabel (role ikut termuat)
  const openEditSelected = () => {
    if (!selected) { toast.error("Pilih akun pada tabel terlebih dahulu!"); return }
    // ✅ Admin Utama mengikuti akun login → tidak bisa diedit
    if (selected.type === "admin" && selected.id === 1) { toast.info("Admin Utama mengikuti akun yang sedang login dan tidak dapat diedit."); return }
    const source = selected.type === "admin" ? admins.find(a => a.id === selected.id) : accounts.find(a => a.id === selected.id)
    if (!source) return
    setEditing(selected)
    setForm({
      name: source.name,
      email: source.email,
      password: "",
      role: (source as any).role ?? (selected.type === "admin" ? "Admin" : "Pengguna"),
    })
    setPhoto(source.photo)
    setShowPassword(false)
    setView("form")
  }
  const handleSave = () => {
    if (form.name.length < 3) { toast.error("Nama minimal 3 karakter!"); return }
    if (!form.email.includes("@")) { toast.error("Email tidak valid!"); return }
    if (editing) {
      if (form.password.length > 0 && form.password.length < 6) { toast.error("Password minimal 6 karakter!"); return }
      if (editing.type === "admin") {
        if (editing.id === 1) { toast.info("Admin Utama mengikuti akun yang sedang login dan tidak dapat diedit."); return }
        if (admins.some(a => a.email.toLowerCase() === form.email.toLowerCase() && a.id !== editing.id)) { toast.error("Email sudah digunakan akun admin lain!"); return }
        setAdminAccounts(adminAccounts.map(a => a.id === editing.id ? { ...a, name: form.name, email: form.email, photo, role: form.role, password: form.password || a.password } : a))
      } else {
        if (accounts.some(a => a.email.toLowerCase() === form.email.toLowerCase() && a.id !== editing.id)) { toast.error("Email sudah digunakan akun pengguna lain!"); return }
        setAccounts(accounts.map(a => a.id === editing.id ? { ...a, name: form.name, email: form.email, photo, password: form.password || a.password, role: form.role } : a))
      }
      toast.success(`Akun "${form.name}" berhasil diperbarui!`)
      logActivity(`Mengedit akun ${form.name} (role: ${form.role})`)
    } else {
      if (form.password.length < 6) { toast.error("Password minimal 6 karakter!"); return }
      if (admins.some(a => a.email.toLowerCase() === form.email.toLowerCase()) || accounts.some(a => a.email.toLowerCase() === form.email.toLowerCase())) {
        toast.error("Email sudah digunakan akun lain!")
        return
      }
      if (targetType === "admin") {
        // ✅ PERBAIKAN: password ikut disimpan → akun admin bisa dipakai login
        setAdminAccounts([...adminAccounts, { id: Date.now(), name: form.name, email: form.email, photo, role: form.role, password: form.password }])
        toast.success(`Akun admin "${form.name}" berhasil dibuat! Sekarang bisa dipakai untuk login.`)
        logActivity(`Membuat akun admin ${form.name} (role: ${form.role})`)
      } else {
        setAccounts([...accounts, { id: Date.now(), name: form.name, email: form.email, photo, password: form.password, role: form.role }])
        toast.success(`Akun pengguna "${form.name}" berhasil dibuat!`)
        logActivity(`Membuat akun pengguna ${form.name} (role: ${form.role})`)
      }
    }
    setForm({ name: "", email: "", password: "", role: "Admin" })
    setPhoto(null)
    setEditing(null)
    setSelected(null)
    setView("panel")
  }
  const handleDeleteSelected = () => {
    if (!selected) { toast.error("Pilih akun pada tabel terlebih dahulu!"); return }
    if (selected.type === "admin") {
      const target = admins.find(a => a.id === selected.id)
      if (!target) return
      if (target.role === "Admin Utama") { toast.error("Admin Utama tidak dapat dihapus!"); return }
      setAdminAccounts(adminAccounts.filter(a => a.id !== selected.id))
      toast.success(`Akun admin "${target.name}" telah dihapus.`)
      logActivity(`Menghapus akun admin ${target.name}`)
    } else {
      const target = accounts.find(a => a.id === selected.id)
      if (!target) return
      setAccounts(accounts.filter(a => a.id !== selected.id))
      toast.success(`Akun pengguna "${target.name}" telah dihapus.`)
      logActivity(`Menghapus akun pengguna ${target.name}`)
    }
    setSelected(null)
  }
  const handleNav = (label: string) => {
    setActiveMenu(label)
    if (label === "Dashboard") setPage("dashboard")
    else if (label === "Template") setPage("templates")
    else if (label === "Undangan Saya") setPage("my-invitations")
    else if (label === "Edit Undangan") setPage("editor")
    else if (label === "Data Tamu") setPage("guest-data")
    else if (label === "RSVP") setPage("rsvp")
    else if (label === "Amplop Digital") setPage("digital-envelope")
    else if (label === "QR Check-In") setPage("qr-checkin")
    else if (label === "Domain") setPage("domain")
    else if (label === "Pengaturan") setPage("settings")
    else if (label === "Akses Admin") setPage("admin-access")
    else if (label === "Akses Pengguna") setPage("user-access")
    else if (label === "Transaksi") setPage("dashboard")
    setSidebarOpen(false)
  }
  return (
    <div className="flex h-screen bg-muted overflow-hidden font-sans">
      <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:relative z-40 w-60 h-full bg-sidebar flex flex-col transition-transform duration-300 flex-shrink-0`}>
        <div className="px-5 py-5 border-b border-sidebar-border">
          <button onClick={() => setPage("dashboard")} className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary fill-primary/25" />
            <span className="font-serif text-lg font-semibold italic text-sidebar-foreground">Invito</span>
          </button>
        </div>
        <nav className="flex-1 py-3 overflow-y-auto">
          {SIDEBAR_NAV.map(({ icon: Icon, label }) => (
            <button key={label} onClick={() => handleNav(label)} className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm transition-all ${label === "Akses Admin" ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium" : "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-foreground"}`}>
              <Icon className="w-4 h-4 flex-shrink-0" />{label}
            </button>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-sidebar-border">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0"><User className="w-4 h-4 text-primary" /></div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-sidebar-foreground truncate">{user.name}</p>
              <p className="text-[10px] text-sidebar-foreground/45 truncate">{user.email}</p>
            </div>
          </div>
          <button onClick={() => setPage("login")} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sidebar-foreground/55 hover:bg-sidebar-accent hover:text-sidebar-foreground text-xs transition-colors">
            <LogOut className="w-3.5 h-3.5" /> Keluar
          </button>
        </div>
      </aside>
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-foreground/40 z-30 lg:hidden" />}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-card border-b border-border px-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-1.5 rounded-lg hover:bg-muted transition-colors"><Menu className="w-5 h-5" /></button>
            <div>
              <p className="text-sm font-semibold">Akses Admin</p>
              <p className="text-[11px] text-muted-foreground hidden sm:block">{view === "panel" ? "Buat dan kelola akun admin Anda" : editing ? `Edit akun ${editing.type === "admin" ? "admin" : "pengguna"}` : createType === "admin" ? "Lengkapi data untuk membuat akun admin baru" : "Lengkapi data untuk membuat akun pengguna baru"}</p>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-5">
          {view === "panel" ? (
            <div className="max-w-5xl mx-auto space-y-5">
              {/* ── Header panel + tombol Create dengan dropdown pilihan tipe akun ── */}
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold">Panel Admin</h2>
                  <p className="text-xs text-muted-foreground">Kelola akun, konten, pengaturan, dan pantau operasional sistem</p>
                </div>
                <div className="relative flex-shrink-0">
                  <button onClick={() => setShowCreateMenu(!showCreateMenu)} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-all flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" /> Create
                  </button>
                  {showCreateMenu && <div className="fixed inset-0 z-10" onClick={() => setShowCreateMenu(false)} />}
                  {showCreateMenu && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-20">
                      <p className="px-4 pt-3 pb-1.5 text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">Tambah akun baru</p>
                      <button onClick={() => startCreate("admin")} className="w-full px-4 py-2.5 text-xs flex items-center gap-2.5 hover:bg-muted transition-colors">
                        <Shield className="w-3.5 h-3.5 text-primary flex-shrink-0" /> Akun Admin
                      </button>
                      <button onClick={() => startCreate("user")} className="w-full px-4 py-2.5 text-xs flex items-center gap-2.5 hover:bg-muted transition-colors border-t border-border/50">
                        <UserPlus className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" /> Akun Pengguna
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {/* ── 4 kartu fungsi utama admin ── */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {MODULES.map(({ id, title, desc, icon: Icon }) => (
                  <button key={id} onClick={() => setActiveModule(id)} className={`text-left p-4 rounded-2xl border transition-all ${activeModule === id ? "bg-primary/10 border-primary/30" : "bg-card border-border hover:border-primary/30"}`}>
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${activeModule === id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-semibold mb-0.5">{title}</p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">{desc}</p>
                  </button>
                ))}
              </div>
              {/* ── Modul: Kelola Pengguna (tabel admin + tabel pengguna) ── */}
              {activeModule === "users" && (
                <div className="space-y-5">
                  <div className="bg-card rounded-2xl border border-border overflow-hidden">
                    <div className="p-4 border-b border-border flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center"><Shield className="w-4 h-4 text-primary" /></div>
                        <div>
                          <h3 className="text-sm font-semibold">Tabel Akun Admin</h3>
                          <p className="text-[11px] text-muted-foreground">{admins.length} akun admin terdaftar</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-muted-foreground hidden md:block">Klik baris untuk memilih akun</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border bg-muted/50">
                            {["Nama", "Email", "Role", "Status"].map(h => (
                              <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {admins.map(a => (
                            <tr key={a.id} onClick={() => setSelected({ type: "admin", id: a.id })} className={`cursor-pointer border-b border-border/50 transition-colors ${selected?.type === "admin" && selected.id === a.id ? "bg-primary/10" : "hover:bg-muted/30"}`}>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2.5">
                                  {a.photo ? (
                                    <img src={a.photo} alt={a.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                                  ) : (
                                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-[10px] font-semibold text-primary flex-shrink-0">{initials(a.name)}</div>
                                  )}
                                  <span className="text-xs font-medium whitespace-nowrap">{a.name}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{a.email}</td>
                              <td className="px-4 py-3">
                                <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full border whitespace-nowrap ${a.role === "Admin Utama" ? "bg-primary/10 text-primary border-primary/25" : "bg-blue-50 text-blue-600 border-blue-200"}`}>{a.role}</span>
                              </td>
                              <td className="px-4 py-3"><span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-600 whitespace-nowrap">Aktif</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="bg-card rounded-2xl border border-border overflow-hidden">
                    <div className="p-4 border-b border-border flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center"><UserPlus className="w-4 h-4 text-blue-600" /></div>
                        <div>
                          <h3 className="text-sm font-semibold">Tabel Akun Pengguna</h3>
                          <p className="text-[11px] text-muted-foreground">{accounts.length} akun pengguna terdaftar</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-muted-foreground hidden md:block">Klik baris untuk memilih akun</span>
                    </div>
                    {accounts.length === 0 ? (
                      <div className="py-10 text-center text-muted-foreground text-xs">Belum ada akun pengguna. Dibuat lewat menu Akses Pengguna atau tombol Create.</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-border bg-muted/50">
                              {["Nama", "Email", "Role", "Status"].map(h => (
                                <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {accounts.map(a => (
                              <tr key={a.id} onClick={() => setSelected({ type: "user", id: a.id })} className={`cursor-pointer border-b border-border/50 transition-colors ${selected?.type === "user" && selected.id === a.id ? "bg-primary/10" : "hover:bg-muted/30"}`}>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2.5">
                                    {a.photo ? (
                                      <img src={a.photo} alt={a.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                                    ) : (
                                      <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-[10px] font-semibold text-blue-600 flex-shrink-0">{initials(a.name)}</div>
                                    )}
                                    <span className="text-xs font-medium whitespace-nowrap">{a.name}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{a.email}</td>
                                <td className="px-4 py-3"><span className="text-[10px] font-medium px-2.5 py-1 rounded-full border bg-blue-50 text-blue-600 border-blue-200 whitespace-nowrap">{a.role ?? "Pengguna"}</span></td>
                                <td className="px-4 py-3"><span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-600 whitespace-nowrap">Aktif</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                  {/* ── Pojok kiri bawah: Edit & Delete ── */}
                  <div className="flex items-center gap-2">
                    <button onClick={openEditSelected} className="px-4 py-2 border border-border rounded-lg text-xs hover:border-primary hover:text-primary transition-colors flex items-center gap-1.5">
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button onClick={handleDeleteSelected} className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs hover:bg-red-100 transition-colors flex items-center gap-1.5">
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                    {selected && <span className="text-[11px] text-muted-foreground">Terpilih: <span className="font-semibold text-foreground">{selectedName}</span></span>}
                  </div>
                </div>
              )}
              {/* ── Modul: Kelola Konten ── */}
              {activeModule === "content" && (
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                  <div className="p-4 border-b border-border flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center"><FileText className="w-4 h-4 text-primary" /></div>
                      <div>
                        <h3 className="text-sm font-semibold">Kelola Konten</h3>
                        <p className="text-[11px] text-muted-foreground">{contentItems.length} konten dalam sistem</p>
                      </div>
                    </div>
                    <button onClick={() => { setContentItems([...contentItems, { id: Date.now(), name: `Konten Baru ${contentItems.length + 1}`, kind: "Halaman", active: true }]); toast.success("Konten baru ditambahkan!"); logActivity("Menambahkan konten baru") }} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-[11px] font-medium hover:bg-primary/90 transition-colors flex items-center gap-1">
                      <Plus className="w-3 h-3" /> Tambah
                    </button>
                  </div>
                  <div>
                    {contentItems.map(item => (
                      <div key={item.id} className="px-4 py-3 flex items-center justify-between gap-3 border-b border-border/50 last:border-0">
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate">{item.name}</p>
                          <p className="text-[10px] text-muted-foreground">{item.kind} • {item.active ? "Aktif" : "Nonaktif"}</p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <ToggleSwitch checked={item.active} onChange={() => { setContentItems(contentItems.map(c => c.id === item.id ? { ...c, active: !c.active } : c)); logActivity(`${item.active ? "Menonaktifkan" : "Mengaktifkan"} konten ${item.name}`) }} />
                          <button onClick={() => { setContentItems(contentItems.filter(c => c.id !== item.id)); toast.success(`Konten "${item.name}" dihapus.`); logActivity(`Menghapus konten ${item.name}`) }} className="text-red-500 hover:text-red-600 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* ── Modul: Pengaturan Sistem ── */}
              {activeModule === "system" && (
                <div className="bg-card rounded-2xl p-6 border border-border">
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0"><Settings className="w-5 h-5 text-blue-600" /></div>
                    <div>
                      <h3 className="text-sm font-semibold">Pengaturan Sistem</h3>
                      <p className="text-xs text-muted-foreground">Konfigurasi dasar aplikasi dan keamanan</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: "Mode Maintenance", desc: "Tutup sementara akses publik ke undangan", key: "maintenance" as const },
                      { label: "Two-Factor Authentication", desc: "Wajibkan verifikasi tambahan saat login admin", key: "twoFA" as const },
                      { label: "Registrasi Publik", desc: "Izinkan pembuatan akun pengguna baru", key: "publicReg" as const },
                    ].map(({ label, desc, key }) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/50">
                        <div>
                          <p className="text-xs font-semibold">{label}</p>
                          <p className="text-[10px] text-muted-foreground">{desc}</p>
                        </div>
                        <ToggleSwitch checked={system[key]} onChange={() => setSystem({ ...system, [key]: !system[key] })} />
                      </div>
                    ))}
                    <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                      <p className="text-xs font-semibold mb-1.5">Session Timeout (menit)</p>
                      <input type="number" min={5} max={120} value={system.timeout} onChange={e => setSystem({ ...system, timeout: Number(e.target.value) })} className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-muted outline-none focus:border-primary transition-colors" />
                    </div>
                  </div>
                  <div className="mt-5 flex justify-end">
                    <button onClick={() => { toast.success("Pengaturan sistem disimpan!"); logActivity("Memperbarui pengaturan sistem") }} className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-all">Simpan Pengaturan</button>
                  </div>
                </div>
              )}
              {/* ── Modul: Pantau Operasional ── */}
              {activeModule === "monitor" && (
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                  <div className="p-4 border-b border-border flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center"><TrendingUp className="w-4 h-4 text-green-600" /></div>
                      <div>
                        <h3 className="text-sm font-semibold">Pantau Operasional</h3>
                        <p className="text-[11px] text-muted-foreground">Aktivitas sistem secara langsung</p>
                      </div>
                    </div>
                    <span className="flex items-center gap-1.5 text-[10px] text-green-600 font-medium">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Live
                    </span>
                  </div>
                  <div className="divide-y divide-border/50">
                    {activity.map(log => (
                      <div key={log.id} className="px-4 py-3 flex items-center gap-3">
                        <span className="text-[10px] font-mono text-muted-foreground flex-shrink-0">{log.time}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate">{log.action}</p>
                          <p className="text-[10px] text-muted-foreground">oleh {log.actor}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ── VIEW FORM: buat / edit akun ── */
            <div className="max-w-3xl mx-auto space-y-5">
              {/* ── Kartu Foto Profil ── */}
              <div className="bg-card rounded-2xl p-6 border border-border">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0"><Camera className="w-5 h-5 text-primary" /></div>
                  <div>
                    <h3 className="text-sm font-semibold">Foto Profil {editing ? "Akun" : targetType === "admin" ? "Admin Baru" : "Pengguna Baru"}</h3>
                    <p className="text-xs text-muted-foreground">Upload foto profil (JPG/PNG, maks. 2MB)</p>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <div className="relative flex-shrink-0">
                    {photo ? (
                      <img src={photo} alt="Foto profil" className="w-20 h-20 rounded-full object-cover border-2 border-primary" />
                    ) : (
                      <div className="w-20 h-20 bg-primary/15 rounded-full flex items-center justify-center border-2 border-dashed border-primary/40">
                        <User className="w-8 h-8 text-primary" />
                      </div>
                    )}
                    <label htmlFor="upload-foto" className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors shadow-md">
                      <Camera className="w-3.5 h-3.5 text-white" />
                    </label>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-3">Foto akan dipakai sebagai profil akun yang Anda {editing ? "edit" : "buat"}.</p>
                    <div className="flex gap-2">
                      <label htmlFor="upload-foto" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-all cursor-pointer flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5" /> Pilih Foto
                      </label>
                      {photo && (
                        <button onClick={() => setPhoto(null)} className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-medium hover:bg-red-100 transition-all">
                          Hapus Foto
                        </button>
                      )}
                    </div>
                    <input id="upload-foto" type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                  </div>
                </div>
              </div>
              {/* ── Kartu Form Akun ── */}
              <div className="bg-card rounded-2xl p-6 border border-border">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0"><Shield className="w-5 h-5 text-blue-600" /></div>
                  <div>
                    <h3 className="text-sm font-semibold">{editing ? "Edit Akun" : targetType === "admin" ? "Informasi Akun Admin Baru" : "Informasi Akun Pengguna Baru"}</h3>
                    <p className="text-xs text-muted-foreground">{editing ? "Perbarui data akun yang dipilih" : targetType === "admin" ? "Lengkapi data untuk membuat akun admin baru" : "Lengkapi data untuk membuat akun pengguna baru"}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium mb-1.5 block">Nama</label>
                    <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder={targetType === "admin" ? "Nama lengkap admin baru" : "Nama lengkap pengguna baru"} className="w-full px-4 py-2.5 text-sm border border-border rounded-lg bg-muted outline-none focus:border-primary transition-colors" />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1.5 block">Email</label>
                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="nama@email.com" className="w-full px-4 py-2.5 text-sm border border-border rounded-lg bg-muted outline-none focus:border-primary transition-colors" />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1.5 block">Role</label>
                    <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full px-4 py-2.5 text-sm border border-border rounded-lg bg-muted outline-none focus:border-primary transition-colors cursor-pointer">
                      {roleOptions.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <p className="text-[10px] text-muted-foreground mt-1">{targetType === "admin" ? "Tentukan peran & izin akses akun admin ini." : "Tentukan tipe akun pengguna ini."}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1.5 block">Password</label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder={editing ? "Kosongkan jika tidak diubah" : "Minimal 6 karakter"} className="w-full px-4 py-2.5 pr-11 text-sm border border-border rounded-lg bg-muted outline-none focus:border-primary transition-colors" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                {/* ── Tombol Kembali (ke panel Akses Admin) / Batal / Simpan ── */}
                <div className="mt-5 flex flex-col sm:flex-row justify-end gap-2">
                  <button onClick={() => { setView("panel"); setEditing(null); setShowCreateMenu(false) }} className="px-5 py-2.5 border border-border rounded-lg text-sm hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5 rotate-180" /> Kembali
                  </button>
                  <button onClick={() => { setView("panel"); setEditing(null); setForm({ name: "", email: "", password: "", role: "Admin" }); setPhoto(null); toast.info("Perubahan dibatalkan.") }} className="px-5 py-2.5 bg-muted border border-border rounded-lg text-sm hover:bg-muted/80 transition-all">
                    Batal
                  </button>
                  <button onClick={handleSave} className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-all flex items-center justify-center gap-1.5">
                    <Plus className="w-4 h-4" /> Simpan
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

/// ─── USER ACCESS PAGE ────────────────────────────────────────────────────────
type UserPanel = "akun" | "riwayat" | "layanan"

function UserAccessPage({ setPage, activeMenu, setActiveMenu, user, accounts, setAccounts }: {
  setPage: (p: Page) => void
  activeMenu: string
  setActiveMenu: (m: string) => void
  user: UserInfo
  accounts: UserAccount[]
  setAccounts: (a: UserAccount[]) => void
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  // ✅ Panel aktif: akun / riwayat / layanan
  const [activePanel, setActivePanel] = useState<UserPanel>("akun")
  // Form kosong — untuk membuat akun pengguna BARU
  const [form, setForm] = useState({ name: "", email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [photo, setPhoto] = useState<string | null>(null)
  // ✅ Filter untuk panel Cek Riwayat
  const [historyFilter, setHistoryFilter] = useState("Semua")

  // ✅ Data riwayat (dummy) — aktivitas, transaksi, status pesanan
  const USER_HISTORY = [
    { id: 1, type: "Transaksi", title: "Pembayaran Paket Standard", detail: "INV-20250112-001 • BCA Virtual Account", date: "12 Jan 2025", status: "Berhasil", amount: "Rp 199.000" },
    { id: 2, type: "Pesanan", title: "Undangan Anisa & Raka", detail: "Paket Standard • Aktif s/d 12 Jan 2026", date: "12 Jan 2025", status: "Aktif", amount: null },
    { id: 3, type: "Aktivitas", title: "Login ke akun", detail: "Perangkat: Chrome • Jakarta", date: "11 Jan 2025", status: "Berhasil", amount: null },
    { id: 4, type: "Transaksi", title: "Pembayaran Paket Basic", detail: "INV-20250103-005 • BNI Virtual Account", date: "3 Jan 2025", status: "Gagal", amount: "Rp 99.000" },
    { id: 5, type: "Aktivitas", title: "Mengubah password", detail: "Keamanan akun diperbarui", date: "28 Des 2024", status: "Berhasil", amount: null },
    { id: 6, type: "Pesanan", title: "Undangan Lia & Yusuf", detail: "Paket Basic • Masa aktif habis", date: "25 Des 2024", status: "Selesai", amount: null },
  ]
  const filteredHistory = historyFilter === "Semua" ? USER_HISTORY : USER_HISTORY.filter(h => h.type === historyFilter)
  const historyStatusColor = (status: string) => {
    if (status === "Berhasil" || status === "Aktif" || status === "Selesai") return "bg-green-50 text-green-600 border-green-200"
    if (status === "Gagal") return "bg-red-50 text-red-500 border-red-200"
    return "bg-yellow-50 text-yellow-600 border-yellow-200"
  }
  const historyIcon = (type: string) => {
    if (type === "Transaksi") return CreditCard
    if (type === "Pesanan") return Package
    return Clock
  }

  // ✅ Unduh data sebagai file CSV sungguhan
  const downloadCSV = (filename: string, rows: string[][]) => {
    const csv = rows.map(r => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`${filename} berhasil diunduh!`)
  }

  // ✅ 3 kartu panel pengguna
  const PANELS: { id: UserPanel; title: string; desc: string; icon: any }[] = [
    { id: "akun", title: "Akun Pengguna", desc: "Buat & kelola akun untuk login sebagai pengguna", icon: UserPlus },
    { id: "riwayat", title: "Cek Riwayat", desc: "Lihat aktivitas, transaksi, dan status pesanan", icon: Clock },
    { id: "layanan", title: "Akses Layanan", desc: "Gunakan fitur inti & unduh data penting", icon: Package },
  ]

  // ✅ Fitur inti aplikasi (klik → langsung buka halaman terkait)
  const SERVICES = [
    { label: "Buat Undangan", desc: "Mulai undangan digital baru", icon: Plus, action: () => setPage("checkout") },
    { label: "Edit Undangan", desc: "Ubah tema & isi undangan", icon: Edit3, action: () => setPage("editor") },
    { label: "Data Tamu", desc: "Kelola daftar tamu undangan", icon: Users, action: () => setPage("guest-data") },
    { label: "RSVP & Ucapan", desc: "Lihat konfirmasi tamu", icon: MessageCircle, action: () => setPage("rsvp") },
    { label: "Amplop Digital", desc: "Kelola hadiah dari tamu", icon: Gift, action: () => setPage("digital-envelope") },
    { label: "QR Check-In", desc: "Scan tamu di lokasi acara", icon: QrCode, action: () => setPage("qr-checkin") },
  ]

  // ✅ Unduh data penting
  const DOWNLOADS = [
    { label: "Data Tamu (CSV)", desc: "Seluruh daftar tamu & status RSVP", icon: Users, action: () => downloadCSV("data-tamu.csv", [["Nama", "WhatsApp", "Status"], ["Budi Santoso", "081234567890", "Hadir"], ["Siti Aminah", "089876543210", "Tidak Hadir"], ["Andi Pratama", "085678901234", "Belum Konfirmasi"]]) },
    { label: "Riwayat Transaksi (CSV)", desc: "Rekap pembayaran & pesanan", icon: Receipt, action: () => downloadCSV("riwayat-transaksi.csv", [["Invoice", "Tanggal", "Paket", "Total", "Status"], ["INV-20250112-001", "12 Jan 2025", "Standard", "199000", "Paid"], ["INV-20250103-005", "3 Jan 2025", "Basic", "99000", "Failed"]]) },
    { label: "Bukti Pendaftaran (PDF)", desc: "Dokumen ringkasan akun Anda", icon: FileText, action: () => toast.info("Fitur unduh PDF akan segera hadir!") },
  ]

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) { toast.error("File harus berupa gambar!"); return }
    if (file.size > 2 * 1024 * 1024) { toast.error("Ukuran foto maksimal 2MB!"); return }
    const reader = new FileReader()
    reader.onload = () => { setPhoto(reader.result as string); toast.success("Foto profil siap disimpan!") }
    reader.readAsDataURL(file)
    e.target.value = ""
  }
  const handleSave = () => {
    if (form.name.length < 3) { toast.error("Nama minimal 3 karakter!"); return }
    if (!form.email.includes("@")) { toast.error("Email tidak valid!"); return }
    if (form.password.length < 6) { toast.error("Password minimal 6 karakter!"); return }
    if (accounts.some(a => a.email.toLowerCase() === form.email.toLowerCase())) { toast.error("Email sudah digunakan akun pengguna lain!"); return }
    setAccounts([...accounts, { id: Date.now(), name: form.name, email: form.email, photo, password: form.password }])
    toast.success(`Akun pengguna "${form.name}" berhasil dibuat!`)
    setForm({ name: "", email: "", password: "" })
    setPhoto(null)
    setShowPassword(false)
  }
  const handleCancel = () => {
    setForm({ name: "", email: "", password: "" })
    setPhoto(null)
    setShowPassword(false)
    toast.info("Formulir dikosongkan.")
  }
  const handleDelete = (acc: UserAccount) => {
    setAccounts(accounts.filter(a => a.id !== acc.id))
    toast.success(`Akun pengguna "${acc.name}" telah dihapus.`)
  }
  const handleNav = (label: string) => {
    setActiveMenu(label)
    if (label === "Dashboard") setPage("dashboard")
    else if (label === "Template") setPage("templates")
    else if (label === "Undangan Saya") setPage("my-invitations")
    else if (label === "Edit Undangan") setPage("editor")
    else if (label === "Data Tamu") setPage("guest-data")
    else if (label === "RSVP") setPage("rsvp")
    else if (label === "Amplop Digital") setPage("digital-envelope")
    else if (label === "QR Check-In") setPage("qr-checkin")
    else if (label === "Domain") setPage("domain")
    else if (label === "Pengaturan") setPage("settings")
    else if (label === "Akses Admin") setPage("admin-access")
    else if (label === "Akses Pengguna") setPage("user-access")
    else if (label === "Transaksi") setPage("dashboard")
    setSidebarOpen(false)
  }

  return (
    <div className="flex h-screen bg-muted overflow-hidden font-sans">
      <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:relative z-40 w-60 h-full bg-sidebar flex flex-col transition-transform duration-300 flex-shrink-0`}>
        <div className="px-5 py-5 border-b border-sidebar-border">
          <button onClick={() => setPage("dashboard")} className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary fill-primary/25" />
            <span className="font-serif text-lg font-semibold italic text-sidebar-foreground">Invito</span>
          </button>
        </div>
        <nav className="flex-1 py-3 overflow-y-auto">
          {SIDEBAR_NAV.map(({ icon: Icon, label }) => (
            <button key={label} onClick={() => handleNav(label)} className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm transition-all ${label === "Akses Pengguna" ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium" : "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-foreground"}`}>
              <Icon className="w-4 h-4 flex-shrink-0" />{label}
            </button>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-sidebar-border">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0"><User className="w-4 h-4 text-primary" /></div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-sidebar-foreground truncate">{user.name}</p>
              <p className="text-[10px] text-sidebar-foreground/45 truncate">{user.email}</p>
            </div>
          </div>
          <button onClick={() => setPage("login")} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sidebar-foreground/55 hover:bg-sidebar-accent hover:text-sidebar-foreground text-xs transition-colors">
            <LogOut className="w-3.5 h-3.5" /> Keluar
          </button>
        </div>
      </aside>
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-foreground/40 z-30 lg:hidden" />}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-card border-b border-border px-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-1.5 rounded-lg hover:bg-muted transition-colors"><Menu className="w-5 h-5" /></button>
            <div>
              <p className="text-sm font-semibold">Akses Pengguna</p>
              <p className="text-[11px] text-muted-foreground hidden sm:block">{activePanel === "akun" ? "Buat akun untuk login sebagai pengguna" : activePanel === "riwayat" ? "Aktivitas, transaksi, dan status pesanan Anda" : "Fitur inti aplikasi & unduh data penting"}</p>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-5">
          <div className="max-w-5xl mx-auto space-y-5">
            {/* ── Header panel + 3 kartu panel ── */}
            <div>
              <h2 className="text-sm font-semibold">Panel Pengguna</h2>
              <p className="text-xs text-muted-foreground">Kelola akun, cek riwayat, dan akses layanan aplikasi</p>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {PANELS.map(({ id, title, desc, icon: Icon }) => (
                <button key={id} onClick={() => setActivePanel(id)} className={`text-left p-4 rounded-2xl border transition-all ${activePanel === id ? "bg-primary/10 border-primary/30" : "bg-card border-border hover:border-primary/30"}`}>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${activePanel === id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-semibold mb-0.5">{title}</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{desc}</p>
                </button>
              ))}
            </div>

            {/* ── PANEL: AKUN PENGGUNA (isi lama, tetap utuh) ── */}
            {activePanel === "akun" && (
              <>
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 flex items-start gap-3">
                  <UserPlus className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700">Akun yang dibuat di halaman ini digunakan untuk <strong>login sebagai Pengguna</strong> melalui halaman masuk — berbeda dengan Akses Admin yang khusus untuk akun admin.</p>
                </div>
                <div className="bg-card rounded-2xl p-6 border border-border">
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0"><Camera className="w-5 h-5 text-primary" /></div>
                    <div>
                      <h3 className="text-sm font-semibold">Foto Profil Pengguna Baru</h3>
                      <p className="text-xs text-muted-foreground">Upload foto profil (JPG/PNG, maks. 2MB)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="relative flex-shrink-0">
                      {photo ? (
                        <img src={photo} alt="Foto profil" className="w-20 h-20 rounded-full object-cover border-2 border-primary" />
                      ) : (
                        <div className="w-20 h-20 bg-primary/15 rounded-full flex items-center justify-center border-2 border-dashed border-primary/40">
                          <User className="w-8 h-8 text-primary" />
                        </div>
                      )}
                      <label htmlFor="upload-foto-user" className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors shadow-md">
                        <Camera className="w-3.5 h-3.5 text-white" />
                      </label>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-3">Foto akan dipakai sebagai profil akun pengguna baru yang Anda buat.</p>
                      <div className="flex gap-2">
                        <label htmlFor="upload-foto-user" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-all cursor-pointer flex items-center gap-1.5">
                          <Camera className="w-3.5 h-3.5" /> Pilih Foto
                        </label>
                        {photo && (
                          <button onClick={() => setPhoto(null)} className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-medium hover:bg-red-100 transition-all">
                            Hapus Foto
                          </button>
                        )}
                      </div>
                      <input id="upload-foto-user" type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                    </div>
                  </div>
                </div>
                <div className="bg-card rounded-2xl p-6 border border-border">
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0"><UserPlus className="w-5 h-5 text-blue-600" /></div>
                    <div>
                      <h3 className="text-sm font-semibold">Informasi Akun Pengguna Baru</h3>
                      <p className="text-xs text-muted-foreground">Akun ini dapat digunakan untuk login sebagai pengguna</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium mb-1.5 block">Nama</label>
                      <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nama lengkap pengguna baru" className="w-full px-4 py-2.5 text-sm border border-border rounded-lg bg-muted outline-none focus:border-primary transition-colors" />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1.5 block">Email</label>
                      <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="nama@email.com" className="w-full px-4 py-2.5 text-sm border border-border rounded-lg bg-muted outline-none focus:border-primary transition-colors" />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1.5 block">Password</label>
                      <div className="relative">
                        <input type={showPassword ? "text" : "password"} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Minimal 6 karakter" className="w-full px-4 py-2.5 pr-11 text-sm border border-border rounded-lg bg-muted outline-none focus:border-primary transition-colors" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-col sm:flex-row justify-end gap-2">
                    <button onClick={() => setPage("dashboard")} className="px-5 py-2.5 border border-border rounded-lg text-sm hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-1.5">
                      <ChevronRight className="w-3.5 h-3.5 rotate-180" /> Kembali
                    </button>
                    <button onClick={handleCancel} className="px-5 py-2.5 bg-muted border border-border rounded-lg text-sm hover:bg-muted/80 transition-all">
                      Batal
                    </button>
                    <button onClick={handleSave} className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-all flex items-center justify-center gap-1.5">
                      <Plus className="w-4 h-4" /> Simpan
                    </button>
                  </div>
                </div>
                <div className="bg-card rounded-2xl p-6 border border-border">
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0"><Users className="w-5 h-5 text-green-600" /></div>
                    <div>
                      <h3 className="text-sm font-semibold">Daftar Akun Pengguna</h3>
                      <p className="text-xs text-muted-foreground">{accounts.length} akun pengguna terdaftar</p>
                    </div>
                  </div>
                  {accounts.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground text-xs">Belum ada akun pengguna. Buat akun pertama Anda melalui formulir di atas.</div>
                  ) : (
                    <div className="space-y-2.5">
                      {accounts.map(a => (
                        <div key={a.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl border border-border/50">
                          {a.photo ? (
                            <img src={a.photo} alt={a.name} className="w-10 h-10 rounded-full object-cover border-2 border-primary flex-shrink-0" />
                          ) : (
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-xs font-semibold text-primary flex-shrink-0">
                              {a.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate">{a.name}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{a.email}</p>
                          </div>
                          <span className="text-[10px] font-medium px-2.5 py-1 rounded-full border bg-blue-50 text-blue-600 border-blue-200 flex-shrink-0">{a.role ?? "Pengguna"}</span>
                          <button onClick={() => handleDelete(a)} className="text-[10px] text-red-500 hover:underline flex-shrink-0">Hapus</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ── PANEL: CEK RIWAYAT ── */}
            {activePanel === "riwayat" && (
              <div className="space-y-5">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Total Transaksi", value: USER_HISTORY.filter(h => h.type === "Transaksi").length, icon: CreditCard, color: "text-blue-500 bg-blue-50" },
                    { label: "Pesanan Aktif", value: USER_HISTORY.filter(h => h.type === "Pesanan" && h.status === "Aktif").length, icon: Package, color: "text-primary bg-primary/10" },
                    { label: "Aktivitas", value: USER_HISTORY.filter(h => h.type === "Aktivitas").length, icon: Clock, color: "text-green-500 bg-green-50" },
                  ].map(({ label, value, icon: Icon, color }, i) => (
                    <div key={i} className="bg-card rounded-xl p-4 border border-border">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${color}`}><Icon className="w-4 h-4" /></div>
                      <p className="text-lg font-bold">{value}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                  <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center"><Clock className="w-4 h-4 text-primary" /></div>
                      <div>
                        <h3 className="text-sm font-semibold">Riwayat Anda</h3>
                        <p className="text-[11px] text-muted-foreground">Aktivitas, transaksi, dan status pesanan sebelumnya</p>
                      </div>
                    </div>
                    <div className="flex bg-muted rounded-lg overflow-hidden border border-border">
                      {["Semua", "Transaksi", "Pesanan", "Aktivitas"].map(f => (
                        <button key={f} onClick={() => setHistoryFilter(f)} className={`px-3 py-1.5 text-[11px] transition-colors ${historyFilter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/80"}`}>{f}</button>
                      ))}
                    </div>
                  </div>
                  <div className="divide-y divide-border/50">
                    {filteredHistory.map(h => {
                      const Icon = historyIcon(h.type)
                      return (
                        <div key={h.id} className="p-4 flex items-center gap-3">
                          <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center flex-shrink-0"><Icon className="w-4 h-4 text-muted-foreground" /></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate">{h.title}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{h.detail} • {h.date}</p>
                          </div>
                          {h.amount && <span className="text-xs font-semibold flex-shrink-0">{h.amount}</span>}
                          <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full border flex-shrink-0 ${historyStatusColor(h.status)}`}>{h.status}</span>
                        </div>
                      )
                    })}
                    {filteredHistory.length === 0 && <div className="py-10 text-center text-muted-foreground text-xs">Tidak ada riwayat untuk filter ini.</div>}
                  </div>
                </div>
              </div>
            )}

            {/* ── PANEL: AKSES LAYANAN ── */}
            {activePanel === "layanan" && (
              <div className="space-y-5">
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                  <div className="p-4 border-b border-border flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center"><Package className="w-4 h-4 text-primary" /></div>
                    <div>
                      <h3 className="text-sm font-semibold">Fitur Inti Aplikasi</h3>
                      <p className="text-[11px] text-muted-foreground">Klik untuk langsung membuka fitur</p>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
                    {SERVICES.map(({ label, desc, icon: Icon, action }, i) => (
                      <button key={i} onClick={action} className="text-left p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all">
                        <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center mb-2"><Icon className="w-4 h-4 text-primary" /></div>
                        <p className="text-xs font-semibold mb-0.5">{label}</p>
                        <p className="text-[10px] text-muted-foreground">{desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                  <div className="p-4 border-b border-border flex items-center gap-3">
                    <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center"><Download className="w-4 h-4 text-green-600" /></div>
                    <div>
                      <h3 className="text-sm font-semibold">Unduh Data Penting</h3>
                      <p className="text-[11px] text-muted-foreground">Data diunduh dalam format CSV</p>
                    </div>
                  </div>
                  <div className="divide-y divide-border/50">
                    {DOWNLOADS.map(({ label, desc, icon: Icon, action }, i) => (
                      <div key={i} className="p-4 flex items-center gap-3">
                        <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center flex-shrink-0"><Icon className="w-4 h-4 text-muted-foreground" /></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold">{label}</p>
                          <p className="text-[10px] text-muted-foreground">{desc}</p>
                        </div>
                        <button onClick={action} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-[11px] font-medium hover:bg-primary/90 transition-colors flex items-center gap-1.5 flex-shrink-0">
                          <Download className="w-3 h-3" /> Unduh
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

/// ─── ROOT APP ────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState<Page>("login")
  const [authTab, setAuthTab] = useState<AuthTab>("login")
  const [activeMenu, setActiveMenu] = useState("Dashboard")
  // ✅ Data user terpusat — dipakai semua sidebar & halaman
  const [user, setUser] = useState<UserInfo>({ name: "Anisa Rahmawati", email: "anisa@email.com", phone: "081234567890" })
  // ✅ Daftar akun pengguna — dibuat dari menu Akses Pengguna, dipakai untuk login
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>([])
  // ✅ Daftar akun admin — dibuat dari menu Akses Admin, dipakai untuk login
  const [adminAccounts, setAdminAccounts] = useState<AdminAccount[]>([])
  // ✅ BARU: undangan yang sedang diedit (null = buat baru)
  const [editingInvitation, setEditingInvitation] = useState<any>(null)
  const openEditor = (inv: any = null) => {
    setEditingInvitation(inv)
    setPage("editor")
  }
  // Reset saat pindah halaman → buka editor lewat menu sidebar selalu mulai baru
  useEffect(() => {
    if (page !== "editor") setEditingInvitation(null)
  }, [page])
  const render = () => {
    switch (page) {
      case "login": return <AuthPage setPage={setPage} initialTab={authTab} setUser={setUser} userAccounts={userAccounts} adminAccounts={adminAccounts} />
      case "dashboard": return <DashboardPage setPage={setPage} activeMenu={activeMenu} setActiveMenu={setActiveMenu} user={user} openEditor={openEditor} />
      case "editor": return <EditorPage setPage={setPage} initialInvitation={editingInvitation} />
      case "checkout": return <CheckoutPage setPage={setPage} />
      case "payment-method": return <PaymentMethodPage setPage={setPage} />
      case "payment-waiting": return <PaymentWaitingPage setPage={setPage} />
      case "payment-success": return <PaymentSuccessPage setPage={setPage} />
      case "payment-failed": return <PaymentFailedPage setPage={setPage} />
      case "templates": return <TemplatesPage setPage={setPage} activeMenu={activeMenu} setActiveMenu={setActiveMenu} user={user} />
      case "my-invitations": return <MyInvitationsPage setPage={setPage} activeMenu={activeMenu} setActiveMenu={setActiveMenu} user={user} openEditor={openEditor} />
      case "guest-data": return <GuestDataPage setPage={setPage} activeMenu={activeMenu} setActiveMenu={setActiveMenu} user={user} />
      case "rsvp": return <RSVPPage setPage={setPage} activeMenu={activeMenu} setActiveMenu={setActiveMenu} user={user} />
      case "digital-envelope": return <DigitalEnvelopePage setPage={setPage} activeMenu={activeMenu} setActiveMenu={setActiveMenu} user={user} />
      case "qr-checkin": return <QRCheckInPage setPage={setPage} activeMenu={activeMenu} setActiveMenu={setActiveMenu} user={user} />
      case "domain": return <DomainPage setPage={setPage} activeMenu={activeMenu} setActiveMenu={setActiveMenu} user={user} />
      case "settings": return <SettingsPage setPage={setPage} activeMenu={activeMenu} setActiveMenu={setActiveMenu} user={user} setUser={setUser} />
      case "admin-access": return <AdminAccessPage setPage={setPage} activeMenu={activeMenu} setActiveMenu={setActiveMenu} user={user} accounts={userAccounts} setAccounts={setUserAccounts} adminAccounts={adminAccounts} setAdminAccounts={setAdminAccounts} />
      case "user-access": return <UserAccessPage setPage={setPage} activeMenu={activeMenu} setActiveMenu={setActiveMenu} user={user} accounts={userAccounts} setAccounts={setUserAccounts} />
      default: return <DashboardPage setPage={setPage} activeMenu={activeMenu} setActiveMenu={setActiveMenu} user={user} openEditor={openEditor} />
    }
  }
  return (
    <>
      {render()}
      <Toaster position="top-center" richColors />
    </>
  )
}