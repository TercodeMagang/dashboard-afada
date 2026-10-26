import { useState, useEffect, useRef, ElementType,  } from "react"
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
import SeatingPage from "../pages/SeatingPage"
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
  | "create-invitation"
  | "seating"

type AuthTab = "login" | "register"
type UserInfo = { id?: number; name: string; email: string; phone: string; role: string }
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

// ✅ Sidebar berbasis role: pengguna biasa tidak melihat menu admin
const ADMIN_ROLES = ["admin utama", "admin", "editor", "marketing", "viewer"]
const isAdminRole = (role: string) => ADMIN_ROLES.includes((role ?? "").toLowerCase())
const navFor = (role: string) =>
  SIDEBAR_NAV.filter(({ label }) => isAdminRole(role) || (label !== "Akses Admin" && label !== "Akses Pengguna"))
// ✅ KABEL IDENTITAS: tambahkan ?user_id= ke permintaan baca supaya backend menyaring per pemilik
const withUser = (url: string, u: { id?: number }) =>
  u?.id ? `${url}${url.includes("?") ? "&" : "?"}user_id=${u.id}` : url
const EDITOR_TABS = [
  { icon: Layout, label: "Halaman" },
  { icon: Palette, label: "Tema" },
  { icon: Image, label: "Background" },
  { icon: Type, label: "Font" },
  { icon: Music, label: "Musik" },
  { icon: Camera, label: "Foto" },
]
const PAGES_LIST = ["Opening", "Mempelai", "Akad", "Resepsi", "Galeri", "RSVP", "Ucapan", "Penutup"]
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
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validasi dasar di frontend sebelum kirim ke backend
    if (tab === "register" && name.length < 3) {
      toast.error("Nama minimal 3 karakter!")
      return
    }
    if (!email.includes("@")) {
      toast.error("Format email tidak valid!")
      return
    }
    if (password.length < 6) {
      toast.error("Password minimal 6 karakter!")
      return
    }

    setLoading(true)
    try {
      // 1) Cek dulu akun lokal (buatan dari menu Akses Pengguna / Akses Admin di dashboard)
      const localAccount = userAccounts.find(a => a.email.toLowerCase() === email.toLowerCase() && a.password === password)
      if (localAccount) {
        setUser({ id: localAccount.id, name: localAccount.name, email: localAccount.email, phone: "081234567890", role: localAccount.role ?? "Pengguna" })
        toast.success(`Selamat datang, ${localAccount.name}!`)
        setTimeout(() => setPage("dashboard"), 1000)
        return
      }

      const adminAccount = adminAccounts.find(a => a.email.toLowerCase() === email.toLowerCase() && a.password === password)
      if (adminAccount) {
        setUser({ id: adminAccount.id, name: adminAccount.name, email: adminAccount.email, phone: "081234567890", role: adminAccount.role ?? "Admin" })
        toast.success(`Selamat datang, ${adminAccount.name}! (${adminAccount.role})`)
        setTimeout(() => setPage("dashboard"), 1000)
        return
      }

      // 2) Tentukan URL dan Payload berdasarkan Tab (Login atau Register)
      const isRegister = tab === "register"
      const url = isRegister
        ? "http://localhost:5000/api/auth/register"
        : "http://localhost:5000/api/auth/login"

      const payload = isRegister
        ? { name, email, password }
        : { email, password }

      // 3) Panggil Backend NestJS
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (data.success) {
        // Kalau Register berhasil, kita langsung auto-login agar UX lebih mulus
        const userData = data.user
        setUser({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          phone: "081234567890",
          role: userData.role ?? "Pengguna"
        })

        toast.success(data.message || (isRegister ? "Registrasi berhasil! Selamat datang." : "Login berhasil!"))
        setTimeout(() => setPage("dashboard"), 1000)
      } else {
        toast.error(data.message || "Gagal memproses akun.")
      }
    } catch (error) {
      console.error("Gagal terhubung ke backend:", error)
      toast.error("Tidak dapat terhubung ke server. Pastikan backend NestJS berjalan di port 5000!")
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
          <blockquote className="font-serif text-2xl italic leading-relaxed mb-5">"Hari spesial Anda layak mendapat undangan yang sama spesialnya."</blockquote>
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
            {/* ✅ Munculkan input nama khusus untuk tab Register */}
            {tab === "register" && (
              <div>
                <label className="text-sm font-medium mb-1.5 block">Nama Lengkap</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Nama lengkap Anda"
                  required
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-xl text-sm outline-none focus:border-primary transition-colors"
                />
              </div>
            )}

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
                {tab === "login" && <button type="button" className="text-xs text-primary hover:underline">Lupa password?</button>}
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
              {loading ? "Memproses..." : (tab === "register" ? "Daftar Sekarang" : "Masuk")}
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
          {navFor(user.role).map(({ icon: Icon, label }) => (
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
  const isAdmin = isAdminRole(user.role)
  // ✅ State untuk hapus undangan
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null)
  const [previewInv, setPreviewInv] = useState<any | null>(null)
  const [deleting, setDeleting] = useState(false)
  useEffect(() => {
    fetch(withUser('http://localhost:5000/api/invitations', user))
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

  // ✅ Logika sama seperti header dashboard: admin → editor, pengguna → checkout frontend
  const handleCreateInvitation = () => {
    const role = (user.role ?? "").toLowerCase()
    // ✅ BARU: admin masuk ke form data undangan dulu (bukan langsung editor)
    if (role.includes("admin")) {
      setPage("create-invitation")
    } else {
      window.location.href = "http://localhost:5173/?page=checkout"
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
          {navFor(user.role).map(({ icon: Icon, label }) => (
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
          <button onClick={handleCreateInvitation} className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-xs font-medium flex items-center gap-1.5 hover:bg-primary/90 transition-all hover:shadow-[0_2px_12px_rgba(196,149,74,0.35)]">
            <Plus className="w-3.5 h-3.5" /> Buat Undangan
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-5">
          <div className="bg-card rounded-2xl p-5 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Undangan Saya</h3>
              <button onClick={handleCreateInvitation} className="text-xs text-primary flex items-center gap-1 hover:underline">
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
                        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-colors flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 px-2">
                          <button onClick={(e) => { e.stopPropagation(); setPreviewInv(inv) }} className="px-2.5 py-1.5 bg-white text-foreground rounded-full text-xs shadow-md hover:bg-muted transition-colors flex items-center gap-1"><Eye className="w-3 h-3" /> Preview</button>
                          <button onClick={(e) => { e.stopPropagation(); openEditor(inv) }} className="px-2.5 py-1.5 bg-primary text-primary-foreground rounded-full text-xs shadow-md hover:bg-primary/90 transition-colors">Edit</button>
                          <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(`http://localhost:5173/?undangan=${inv.id}`); toast.success("Link undangan disalin! Bagikan ke tamu Anda.") }} className="px-2.5 py-1.5 bg-white text-foreground rounded-full text-xs shadow-md hover:bg-muted transition-colors flex items-center gap-1"><Share2 className="w-3 h-3" /> Bagikan</button>
                          <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(inv) }} className="px-2.5 py-1.5 bg-red-500 text-white rounded-full text-xs shadow-md hover:bg-red-600 transition-colors flex items-center gap-1"><Trash2 className="w-3 h-3" /> Hapus</button>
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
                <button onClick={handleCreateInvitation} className="border-2 border-dashed border-border rounded-xl min-h-[120px] flex flex-col items-center justify-center gap-2 hover:border-primary hover:text-primary transition-colors text-muted-foreground">
                  <Plus className="w-6 h-6" />
                  <span className="text-xs">Buat Undangan Baru</span>
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

            {/* ✅ BARU: modal preview ponsel — memuat halaman publik asli lewat iframe */}
      {previewInv && (
        <div className="fixed inset-0 z-50 bg-foreground/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPreviewInv(null)}>
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPreviewInv(null)} className="absolute -top-3 -right-3 z-10 w-9 h-9 bg-card rounded-full shadow-lg flex items-center justify-center hover:bg-muted transition-colors">
              <X className="w-4 h-4" />
            </button>
            <div className="w-[320px] h-[640px] bg-foreground rounded-[2.6rem] p-2.5 shadow-2xl">
              <div className="relative w-full h-full bg-background rounded-[2rem] overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-foreground rounded-b-2xl z-10" />
                <iframe
                  src={`http://localhost:5173/?undangan=${previewInv.id}&preview=1`}
                  className="w-full h-full border-0"
                  title="Preview Undangan"
                />
              </div>
            </div>
            <p className="text-center text-[11px] text-muted-foreground mt-3">Preview interaktif — klik "Buka Undangan" lalu gulir di dalam ponsel</p>
          </div>
        </div>
      )}
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
  const [showAddModal, setShowAddModal] = useState(false)
  const [newGuest, setNewGuest] = useState({ name: "", whatsapp: "", table_number: "", rsvp_status: "Masih Ragu" })
  const [savingGuest, setSavingGuest] = useState(false)
  const [editingGuest, setEditingGuest] = useState<any | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null)
  const [deleting, setDeleting] = useState(false)
  // ✅ data tamu asli dari backend (tabel guests)
  const [guests, setGuests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const loadGuests = async () => {
    try {
      const res = await fetch(withUser('http://localhost:5000/api/guests', user))
      const data = await res.json()
      if (data.success) setGuests(data.data)
    } catch (error) {
      console.error('Gagal mengambil data tamu:', error)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { loadGuests() }, [])
  // ✅ Waktu relatif dari created_at
  const timeAgo = (iso: string) => {
    if (!iso) return "-"
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "Baru saja"
    if (mins < 60) return `${mins} mnt lalu`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours} jam lalu`
    return `${Math.floor(hours / 24)} hari lalu`
  }
  const filteredGuests = guests.filter(g => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === "Semua" || g.rsvp_status === filter
    return matchSearch && matchFilter
  })
  const getStatusColor = (status: string) => {
    if (status === "Hadir") return "bg-green-50 text-green-600 border-green-200"
    if (status === "Tidak Hadir") return "bg-red-50 text-red-500 border-red-200"
    return "bg-yellow-50 text-yellow-600 border-yellow-200"
  }
  // ✅ FUNGSI SIMPAN TAMU — wajib DI DALAM komponen supaya melihat semua state
  // ✅ SIMPAN TAMU (buat baru ATAU edit) ke database
  const handleSaveGuest = async () => {
    if (!newGuest.name.trim()) { toast.error("Nama tamu wajib diisi!"); return }
    setSavingGuest(true)
    try {
      const isEdit = !!editingGuest
      const url = isEdit ? `http://localhost:5000/api/guests/${editingGuest.id}` : "http://localhost:5000/api/guests"
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newGuest.name,
          whatsapp: newGuest.whatsapp || null,
          table_number: newGuest.table_number || null,
          rsvp_status: newGuest.rsvp_status || "Masih Ragu",
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(isEdit ? `Perubahan tamu "${newGuest.name}" disimpan!` : `Tamu "${newGuest.name}" berhasil ditambahkan!`)
        setNewGuest({ name: "", whatsapp: "", table_number: "", rsvp_status: "Masih Ragu" })
        setEditingGuest(null)
        setShowAddModal(false)
        loadGuests()
      } else {
        toast.error(data.message || "Gagal menyimpan tamu.")
      }
    } catch (e) {
      console.error(e)
      toast.error("Gagal terhubung ke server.")
    } finally {
      setSavingGuest(false)
    }
  }
  // ✅ Buka modal dalam mode edit
  const openEditGuest = (g: any) => {
    setEditingGuest(g)
    setNewGuest({ name: g.name ?? "", whatsapp: g.whatsapp ?? "", table_number: g.table_number ?? "", rsvp_status: g.rsvp_status ?? "Masih Ragu" })
    setShowAddModal(true)
  }
  // ✅ Hapus tamu dari database
  const handleDeleteGuest = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`http://localhost:5000/api/guests/${deleteTarget.id}`, { method: "DELETE" })
      const data = await res.json()
      if (data.success) {
        toast.success(`Tamu "${deleteTarget.name}" dihapus.`)
        setDeleteTarget(null)
        loadGuests()
      } else {
        toast.error(data.message || "Gagal menghapus tamu.")
      }
    } catch (e) {
      console.error(e)
      toast.error("Gagal terhubung ke server.")
    } finally {
      setDeleting(false)
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
          {navFor(user.role).map(({ icon: Icon, label }) => (
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
          <button onClick={() => { setEditingGuest(null); setNewGuest({ name: "", whatsapp: "", table_number: "", rsvp_status: "Masih Ragu" }); setShowAddModal(true) }} className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-xs font-medium flex items-center gap-1.5 hover:bg-primary/90 transition-all">
            <Plus className="w-3.5 h-3.5" /> Tambah Tamu
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[
              { label: "Total Tamu", value: loading ? "…" : guests.length, color: "text-blue-500 bg-blue-50", icon: Users },
              { label: "Hadir", value: loading ? "…" : guests.filter(g => g.rsvp_status === "Hadir").length, color: "text-green-500 bg-green-50", icon: CheckCircle2 },
              { label: "Tidak Hadir", value: loading ? "…" : guests.filter(g => g.rsvp_status === "Tidak Hadir").length, color: "text-red-500 bg-red-50", icon: XCircle },
              { label: "Masih Ragu", value: loading ? "…" : guests.filter(g => g.rsvp_status === "Masih Ragu").length, color: "text-yellow-500 bg-yellow-50", icon: Clock },
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
                {["Semua", "Hadir", "Tidak Hadir", "Masih Ragu"].map(f => (
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
                  {loading ? (
                    <tr><td colSpan={6} className="py-12 text-center text-muted-foreground text-sm">Memuat data tamu...</td></tr>
                  ) : (
                    filteredGuests.map((guest, i) => (
                      <tr key={guest.id} className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                        <td className="px-4 py-3 text-xs font-medium whitespace-nowrap">{guest.name}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground font-mono whitespace-nowrap">{guest.whatsapp ?? "-"}</td>
                        <td className="px-4 py-3"><span className={`text-[10px] font-medium px-2.5 py-1 rounded-full border ${getStatusColor(guest.rsvp_status)}`}>{guest.rsvp_status}</span></td>
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{timeAgo(guest.created_at)}</td>
                        <td className="px-4 py-3 text-xs whitespace-nowrap">{guest.table_number ?? "-"}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 whitespace-nowrap">
                            <button onClick={() => openEditGuest(guest)} className="text-[10px] text-primary hover:underline">Edit</button>
                            <button onClick={() => setDeleteTarget(guest)} className="text-[10px] text-red-500 hover:underline">Hapus</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {!loading && filteredGuests.length === 0 && <div className="py-12 text-center text-muted-foreground text-sm">Tidak ada tamu ditemukan</div>}
            </div>
          </div>
        </main>
      </div>
      {/* ✅ MODAL TAMBAH TAMU — di dalam root div komponen */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card rounded-2xl border border-border p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">{editingGuest ? "Edit Tamu" : "Tambah Tamu Baru"}</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage("seating")} className="px-4 py-2 border border-border bg-card rounded-full text-xs font-medium flex items-center gap-1.5 hover:border-primary hover:text-primary transition-all">
                  <MapPin className="w-3.5 h-3.5" /> Denah Meja
                </button>
                <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-xs font-medium flex items-center gap-1.5 hover:bg-primary/90 transition-all">
                  <Plus className="w-3.5 h-3.5" /> Tambah Tamu
                </button>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium mb-1.5 block">Nama Tamu <span className="text-red-500">*</span></label>
                <input value={newGuest.name} onChange={e => setNewGuest({ ...newGuest, name: e.target.value })} placeholder="Contoh: Budi Santoso" className="w-full px-3.5 py-2.5 bg-muted border border-border rounded-lg text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block">Nomor WhatsApp</label>
                <input value={newGuest.whatsapp} onChange={e => setNewGuest({ ...newGuest, whatsapp: e.target.value })} placeholder="Contoh: 08123456789" className="w-full px-3.5 py-2.5 bg-muted border border-border rounded-lg text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block">Nomor Meja</label>
                <input value={newGuest.table_number} onChange={e => setNewGuest({ ...newGuest, table_number: e.target.value })} placeholder="Contoh: Meja 1" className="w-full px-3.5 py-2.5 bg-muted border border-border rounded-lg text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block">Status RSVP</label>
                <select value={newGuest.rsvp_status} onChange={e => setNewGuest({ ...newGuest, rsvp_status: e.target.value })} className="w-full px-3.5 py-2.5 bg-muted border border-border rounded-lg text-sm outline-none focus:border-primary">
                  <option>Masih Ragu</option>
                  <option>Hadir</option>
                  <option>Tidak Hadir</option>
                  <option>Belum Konfirmasi</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => { setShowAddModal(false); setEditingGuest(null) }} disabled={savingGuest} className="px-4 py-2 border border-border rounded-lg text-xs hover:bg-muted transition-colors disabled:opacity-50">Batal</button>
              <button onClick={handleSaveGuest} disabled={savingGuest} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
                {savingGuest ? "Menyimpan..." : editingGuest ? "Simpan Perubahan" : "Simpan Tamu"}
              </button>
            </div>
          </div>
        </div>
      )}
      <ConfirmDeleteDialog
        open={!!deleteTarget}
        title="Hapus Tamu?"
        description={`Tamu "${deleteTarget?.name ?? ""}" akan dihapus permanen dari daftar tamu undangan Anda.`}
        busy={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteGuest}
      />
    </div>
  )
}


/// ─── RSVP PAGE ──────────────────────────────────────────────────────────────
function RSVPPage({ setPage, activeMenu, setActiveMenu, user }: {
  setPage: (p: Page) => void
  activeMenu: string
  setActiveMenu: (m: string) => void
  user: UserInfo
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [filter, setFilter] = useState("Semua")
  // ✅ BARU: data RSVP asli dari backend (tabel rsvps)
  const [rsvps, setRsvps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetch(withUser('http://localhost:5000/api/rsvps', user))
      .then(response => response.json())
      .then(data => {
        if (data.success) setRsvps(data.data)
        setLoading(false)
      })
      .catch(error => {
        console.error('Gagal mengambil data RSVP:', error)
        setLoading(false)
      })
  }, [])
  // ✅ Waktu relatif dari created_at
  const timeAgo = (iso: string) => {
    if (!iso) return "-"
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "Baru saja"
    if (mins < 60) return `${mins} mnt lalu`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours} jam lalu`
    return `${Math.floor(hours / 24)} hari lalu`
  }
  const filteredRSVP = rsvps.filter(r => filter === "Semua" || r.attendance_status === filter)
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
          {navFor(user.role).map(({ icon: Icon, label }) => (
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
          {/* ✅ Kartu statistik dari data asli */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[
              { label: "Total RSVP", value: loading ? "…" : rsvps.length, color: "text-blue-500 bg-blue-50", icon: MessageCircle },
              { label: "Hadir", value: loading ? "…" : rsvps.filter(r => r.attendance_status === "Hadir").length, color: "text-green-500 bg-green-50", icon: CheckCircle2 },
              { label: "Tidak Hadir", value: loading ? "…" : rsvps.filter(r => r.attendance_status === "Tidak Hadir").length, color: "text-red-500 bg-red-50", icon: XCircle },
              { label: "Masih Ragu", value: loading ? "…" : rsvps.filter(r => r.attendance_status === "Masih Ragu").length, color: "text-yellow-500 bg-yellow-50", icon: Clock },
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
              {loading ? (
                <div className="py-12 text-center text-muted-foreground text-sm">Memuat data RSVP...</div>
              ) : filteredRSVP.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-sm">Tidak ada RSVP ditemukan</div>
              ) : (
                filteredRSVP.map((rsvp) => (
                  <div key={rsvp.id} className="p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-xs font-semibold text-primary flex-shrink-0">{String(rsvp.name ?? "?").split(" ").map((n: string) => n[0]).join("").substring(0, 2)}</div>
                        <div>
                          <p className="text-sm font-semibold">{rsvp.name}</p>
                          <p className="text-[10px] text-muted-foreground">{timeAgo(rsvp.created_at)} • {rsvp.number_of_guests > 0 ? `${rsvp.number_of_guests} orang` : 'Tanpa tamu'}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full border ${getStatusColor(rsvp.attendance_status)}`}>{rsvp.attendance_status}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed pl-12 italic">"{rsvp.message}"</p>
                  </div>
                ))
              )}
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
  // ✅ BARU: data amplop asli dari backend (tabel digital_envelopes)
  const [envelopes, setEnvelopes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetch(withUser('http://localhost:5000/api/envelopes', user))
      .then(response => response.json())
      .then(data => {
        if (data.success) setEnvelopes(data.data)
        setLoading(false)
      })
      .catch(error => {
        console.error('Gagal mengambil data amplop:', error)
        setLoading(false)
      })
  }, [])
  // ✅ amount dari Postgres (decimal) datang sebagai string → konversi
  const toNumber = (v: any) => Number(v) || 0
  // ✅ Tanggal singkat Indonesia
  const fmtTanggal = (iso: string) => {
    if (!iso) return "-"
    return new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
  }
  const filteredEnvelopes = envelopes.filter(e => filter === "Semua" || e.withdrawal_status === filter)
  const totalAmount = envelopes.reduce((sum, e) => sum + toNumber(e.amount), 0)
  const withdrawnAmount = envelopes.filter(e => e.withdrawal_status === "Ditarik").reduce((sum, e) => sum + toNumber(e.amount), 0)
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
          {navFor(user.role).map(({ icon: Icon, label }) => (
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
          {/* ✅ Kartu statistik dari data asli */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[
              { label: "Total Amplop", value: loading ? "…" : envelopes.length, color: "text-blue-500 bg-blue-50", icon: Gift },
              { label: "Total Dana", value: loading ? "…" : fmt(totalAmount), color: "text-green-500 bg-green-50", icon: TrendingUp },
              { label: "Sudah Ditarik", value: loading ? "…" : fmt(withdrawnAmount), color: "text-purple-500 bg-purple-50", icon: CheckCircle2 },
              { label: "Belum Ditarik", value: loading ? "…" : fmt(totalAmount - withdrawnAmount), color: "text-yellow-500 bg-yellow-50", icon: Clock },
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
              {loading ? (
                <div className="py-12 text-center text-muted-foreground text-sm">Memuat data amplop...</div>
              ) : filteredEnvelopes.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-sm">Tidak ada data amplop ditemukan</div>
              ) : (
                filteredEnvelopes.map((env) => (
                  <div key={env.id} className="p-4 hover:bg-muted/30 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-xs font-semibold text-primary flex-shrink-0">{String(env.sender_name ?? "?").split(" ").map((n: string) => n[0]).join("").substring(0, 2)}</div>
                      <div>
                        <p className="text-sm font-semibold">{env.sender_name}</p>
                        <p className="text-[10px] text-muted-foreground">{fmtTanggal(env.created_at)} • "{env.message}"</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="text-sm font-bold text-primary">{fmt(toNumber(env.amount))}</p>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${env.withdrawal_status === "Ditarik" ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"}`}>{env.withdrawal_status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}


// ─── QR CHECK-IN PAGE ───────────────────────────────────────────────────────
function QRCheckInPage({ setPage, activeMenu, setActiveMenu, user }: {
  setPage: (p: Page) => void
  activeMenu: string
  setActiveMenu: (m: string) => void
  user: UserInfo
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("Semua")
  // ✅ BARU: data tamu asli dari backend (tabel guests)
  const [guests, setGuests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [checkingIn, setCheckingIn] = useState<number | null>(null)
  useEffect(() => {
    fetch('http://localhost:5000/api/guests')
      .then(r => r.json())
      .then(data => {
        if (data.success) setGuests(data.data)
        setLoading(false)
      })
      .catch(error => {
        console.error('Gagal mengambil data tamu:', error)
        setLoading(false)
      })
  }, [])
  // ✅ BARU: tombol Check-In → PATCH ke backend → update tabel guests
  const handleCheckIn = async (guest: any) => {
    if (guest.check_in_status === "Sudah Check-In") {
      toast.info(`${guest.name} sudah check-in sebelumnya.`)
      return
    }
    setCheckingIn(guest.id)
    try {
      const res = await fetch(`http://localhost:5000/api/guests/${guest.id}/checkin`, { method: "PATCH" })
      const data = await res.json()
      if (data.success) {
        // ✅ Update state lokal supaya UI langsung berubah tanpa reload
        setGuests(prev => prev.map(g =>
          g.id === guest.id
            ? { ...g, check_in_status: "Sudah Check-In", check_in_time: data.data.check_in_time }
            : g
        ))
        toast.success(data.message)
      } else {
        toast.info(data.message || "Gagal check-in.")
      }
    } catch (error) {
      console.error("Gagal check-in:", error)
      toast.error("Tidak dapat terhubung ke server.")
    } finally {
      setCheckingIn(null)
    }
  }
  // ✅ Format waktu check-in
  const fmtTime = (iso: string) => {
    if (!iso) return "-"
    return new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
  }
  const filteredGuests = guests.filter(g => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === "Semua" || g.check_in_status === filter
    return matchSearch && matchFilter
  })
  const checkedInCount = guests.filter(g => g.check_in_status === "Sudah Check-In").length
  const pendingCount = guests.filter(g => g.check_in_status === "Belum Check-In").length
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
          {navFor(user.role).map(({ icon: Icon, label }) => (
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
          {/* ✅ Kartu statistik dihitung dari data asli */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[
              { label: "Total Tamu", value: loading ? "…" : guests.length, color: "text-blue-500 bg-blue-50", icon: Users },
              { label: "Sudah Check-In", value: loading ? "…" : checkedInCount, color: "text-green-500 bg-green-50", icon: CheckCircle2 },
              { label: "Belum Check-In", value: loading ? "…" : pendingCount, color: "text-yellow-500 bg-yellow-50", icon: Clock },
              { label: "Persentase", value: loading ? "…" : guests.length > 0 ? `${Math.round((checkedInCount / guests.length) * 100)}%` : "0%", color: "text-primary bg-primary/10", icon: TrendingUp },
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
                    {["Nama Tamu", "Meja", "Status", "Waktu", "QR", "Aksi"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} className="py-12 text-center text-muted-foreground text-sm">Memuat data tamu...</td></tr>
                  ) : (
                    filteredGuests.map((guest, i) => (
                      <tr key={guest.id} className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                        <td className="px-4 py-3 text-xs font-medium whitespace-nowrap">{guest.name}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{guest.table_number ?? "-"}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full border whitespace-nowrap ${guest.check_in_status === "Sudah Check-In" ? "bg-green-50 text-green-600 border-green-200" : "bg-yellow-50 text-yellow-600 border-yellow-200"}`}>{guest.check_in_status}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{fmtTime(guest.check_in_time)}</td>
                        <td className="px-4 py-3"><div className="w-8 h-8 bg-white border border-border rounded flex items-center justify-center"><QrCode className="w-5 h-5 text-foreground" /></div></td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleCheckIn(guest)}
                            disabled={checkingIn === guest.id}
                            className={`text-[10px] font-medium px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${guest.check_in_status === "Sudah Check-In"
                              ? "text-muted-foreground bg-muted border border-border cursor-default"
                              : "text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-60"
                              }`}
                          >
                            {checkingIn === guest.id ? "Proses..." : guest.check_in_status === "Sudah Check-In" ? "✓ Sudah" : "Check-In"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {!loading && filteredGuests.length === 0 && <div className="py-12 text-center text-muted-foreground text-sm">Tidak ada tamu ditemukan</div>}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}


/// ─── DOMAIN PAGE ────────────────────────────────────────────────────────────
type CustomDomain = {
  id: number
  name: string
  status: "pending" | "active" | "rejected"
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
  const [customDomains, setCustomDomains] = useState<CustomDomain[]>([])
  const [verifyingId, setVerifyingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Berhasil disalin ke clipboard!")
  }

  // ✅ LANGKAH 3A: muat domain milik user ini dari database
  const loadDomains = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/domains")
      const data = await res.json()
      if (data.success) {
        // Filter: hanya domain milik user yang sedang login
        const mine = (data.data || [])
          .filter((r: any) => r.user_id === user.id)
          .map((r: any) => ({
            id: r.id,
            name: r.domain_name,
            status: r.status === "active" ? "active" : (r.status === "rejected" ? "rejected" : "pending"),
            addedAt: new Date(r.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }),
          }))
        setCustomDomains(mine)
      }
    } catch (e) {
      console.error("Gagal memuat domain:", e)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { loadDomains() }, [user.id])

  // ✅ LANGKAH 3B: tambah domain → simpan ke database dengan status "pending"
  const handleAddDomain = async () => {
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
    if (!user.id) { toast.error("Akun tidak terhubung ke database. Silakan login ulang."); return }

    try {
      const res = await fetch("http://localhost:5000/api/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id, domain_name: name }),
      })
      const data = await res.json()
      if (data.success) {
        setCustomDomain("")
        toast.success(`Domain ${name} ditambahkan! Pasang record DNS lalu verifikasi.`)
        loadDomains()
      } else {
        toast.error(data.message || "Gagal menambahkan domain.")
      }
    } catch (e) {
      console.error(e)
      toast.error("Tidak dapat terhubung ke server.")
    }
  }

  // ✅ LANGKAH 3C: verifikasi DNS → update status jadi "active" di database
  const handleVerify = async (id: number) => {
    const domain = customDomains.find(d => d.id === id)
    if (!domain) return
    setVerifyingId(id)
    try {
      const res = await fetch(`http://localhost:5000/api/domains/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "active", dns_verified: true, ssl_enabled: true, ssl_status: "active" }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Domain ${domain.name} terverifikasi! SSL/HTTPS aktif.`)
        loadDomains()
      } else {
        toast.error(data.message || "Verifikasi gagal.")
      }
    } catch (e) {
      console.error(e)
      toast.error("Tidak dapat terhubung ke server.")
    } finally {
      setVerifyingId(null)
    }
  }

  // ✅ LANGKAH 3D: hapus domain dari database
  const handleRemove = async (id: number) => {
    const domain = customDomains.find(d => d.id === id)
    if (!domain) return
    try {
      const res = await fetch(`http://localhost:5000/api/domains/${id}`, { method: "DELETE" })
      const data = await res.json()
      if (data.success) {
        toast.info(`Domain ${domain.name} dihapus.`)
        loadDomains()
      } else {
        toast.error(data.message || "Gagal menghapus domain.")
      }
    } catch (e) {
      console.error(e)
      toast.error("Tidak dapat terhubung ke server.")
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
          {navFor(user.role).map(({ icon: Icon, label }) => (
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

            {/* ── 3) Daftar Domain Kustom (dari database) ── */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border flex items-center gap-3">
                <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center"><Globe className="w-4 h-4 text-primary" /></div>
                <div>
                  <h3 className="text-sm font-semibold">Daftar Domain Kustom</h3>
                  <p className="text-[11px] text-muted-foreground">
                    {loading ? "Memuat..." : `${customDomains.length} domain • ${customDomains.filter(d => d.status === "active").length} aktif`}
                  </p>
                </div>
              </div>
              {loading ? (
                <div className="py-10 text-center text-muted-foreground text-xs">Memuat domain...</div>
              ) : customDomains.length === 0 ? (
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
  const handleSaveProfile = async () => {
    if (profile.name.length < 3) { toast.error("Nama minimal 3 karakter!"); return }
    if (!profile.email.includes("@")) { toast.error("Email tidak valid!"); return }

    // Pastikan akun punya ID dari database (akun demo tidak punya ID)
    if (!user.id) {
      toast.error("Akun ini tidak terhubung ke database. Silakan logout dan login ulang dengan akun terdaftar.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          email: profile.email,
          phone: profile.phone
        })
      })
      const data = await res.json()

      if (data.success) {
        // Update state lokal supaya nama di sidebar langsung berubah
        setUser({ ...user, name: profile.name, email: profile.email, phone: profile.phone })
        toast.success("Profil berhasil disimpan ke database!")
      } else {
        toast.error(data.message || "Gagal menyimpan profil (email mungkin sudah dipakai akun lain).")
      }
    } catch (e) {
      console.error("Gagal menyimpan profil:", e)
      toast.error("Tidak dapat terhubung ke server. Pastikan backend berjalan!")
    }
  }
  const handleChangePassword = async () => {
    if (passwords.old.length < 6) { toast.error("Password lama minimal 6 karakter!"); return }
    if (passwords.new.length < 6) { toast.error("Password baru minimal 6 karakter!"); return }
    if (passwords.new !== passwords.confirm) { toast.error("Konfirmasi password tidak cocok!"); return }
    if (!user.id) { toast.error("Akun tidak terhubung ke database."); return }

    try {
      // 1. Verifikasi password lama dulu lewat endpoint login
      const checkRes = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, password: passwords.old })
      })
      const checkData = await checkRes.json()

      if (!checkData.success) {
        toast.error("Password lama salah!")
        return
      }

      // 2. Kalau benar, update password baru ke database
      const res = await fetch(`http://localhost:5000/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwords.new })
      })
      const data = await res.json()

      if (data.success) {
        toast.success("Password berhasil diperbarui di database!")
        setPasswords({ old: "", new: "", confirm: "" }) // Kosongkan form
      } else {
        toast.error(data.message || "Gagal mengubah password.")
      }
    } catch (e) {
      console.error("Gagal mengganti password:", e)
      toast.error("Tidak dapat terhubung ke server.")
    }
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
          {navFor(user.role).map(({ icon: Icon, label }) => (
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

/// ─── DASHBOARD PAGE ─────────────────────────────────────────────────────────
function DashboardPage({ setPage, activeMenu, setActiveMenu, user, openEditor }: {
  setPage: (p: Page) => void
  activeMenu: string
  setActiveMenu: (m: string) => void
  user: UserInfo
  openEditor: (inv?: any) => void
}) {
  const [invitations, setInvitations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [txLoading, setTxLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null)
  const [deleting, setDeleting] = useState(false)
  useEffect(() => {
    fetch(withUser("http://localhost:5000/api/invitations", user))
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
  useEffect(() => {
    fetch(withUser('http://localhost:5000/api/dashboard/summary', user))
      .then(response => response.json())
      .then(data => {
        if (data.success) setSummary(data.data)
      })
      .catch(error => {
        console.error('Gagal mengambil ringkasan:', error)
      })
  }, [])
  useEffect(() => {
    fetch(withUser('http://localhost:5000/api/transactions', user))
      .then(response => response.json())
      .then(data => {
        if (data.success) setTransactions(data.data)
        setTxLoading(false)
      })
      .catch(error => {
        console.error('Gagal mengambil transaksi:', error)
        setTxLoading(false)
      })
  }, [])
  const fmtAngka = (n: number) => n.toLocaleString("id-ID")
  const fmtRingkas = (n: number) => {
    if (n >= 1000000) return `Rp ${(n / 1000000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} jt`
    if (n >= 1000) return `Rp ${(n / 1000).toLocaleString("id-ID", { maximumFractionDigits: 0 })} rb`
    return fmt(n)
  }
  const timeAgo = (iso: string) => {
    if (!iso) return "-"
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "Baru saja"
    if (mins < 60) return `${mins} mnt lalu`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours} jam lalu`
    return `${Math.floor(hours / 24)} hari lalu`
  }
  const fmtTanggal = (iso: string | null) => {
    if (!iso) return "-"
    return new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
  }
  const toNum = (v: any) => Number(v) || 0
  const txPaid = transactions.filter(t => t.status === "Paid")
  const txPending = transactions.filter(t => t.status === "Pending")
  const txFailed = transactions.filter(t => t.status === "Failed" || t.status === "Expired")
  const totalPendapatan = txPaid.reduce((sum, t) => sum + toNum(t.total_amount), 0)
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
  // ✅ Logika tombol "+ Buat Undangan" berdasarkan role login
  const handleCreateInvitation = () => {
    const role = (user.role ?? "").toLowerCase()
    if (role.includes("admin")) {
      setPage("create-invitation")
    } else {
      window.location.href = "http://localhost:5173/?page=checkout"
    }
  }
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [txFilter, setTxFilter] = useState("Semua")
  const [txSearch, setTxSearch] = useState("")
  const isAdmin = isAdminRole(user.role)
  const handleMenu = (label: string) => {
    setActiveMenu(label)
    if (label === "Dashboard") { setPage("dashboard"); setSidebarOpen(false) }
    else if (label === "Template") { setPage("templates"); setSidebarOpen(false) }
    else if (label === "Undangan Saya") { setPage("my-invitations"); setSidebarOpen(false) }
    else if (label === "Edit Undangan") { toast.info("Edit undangan yang sudah ada saat ini"); setPage("editor"); setSidebarOpen(false) }
    else if (label === "Data Tamu") { setPage("guest-data"); setSidebarOpen(false) }
    else if (label === "RSVP") { setPage("rsvp"); setSidebarOpen(false) }
    else if (label === "Amplop Digital") { setPage("digital-envelope"); setSidebarOpen(false) }
    else if (label === "QR Check-In") { setPage("qr-checkin"); setSidebarOpen(false) }
    else if (label === "Domain") { setPage("domain"); setSidebarOpen(false) }
    else if (label === "Pengaturan") { setPage("settings"); setSidebarOpen(false) }
    else if (label === "Akses Admin") { setPage("admin-access"); setSidebarOpen(false) }
    else if (label === "Akses Pengguna") { setPage("user-access"); setSidebarOpen(false) }
    else if (label === "Transaksi") { setPage("dashboard"); setSidebarOpen(false) }
    else { toast.info(`Halaman ${label} akan segera hadir!`); setSidebarOpen(false) }
  }

  // ✅ GRAFIK ASLI: pendapatan per hari dari transaksi Paid (7 hari terakhir)
  const buildRevenueChart = () => {
    const days: { key: string; label: string; total: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      days.push({
        key: d.toISOString().slice(0, 10),
        label: d.toLocaleDateString("id-ID", { weekday: "short" }),
        total: 0,
      })
    }
    transactions.forEach(t => {
      if ((t.status ?? "").toLowerCase() !== "paid") return
      const dateStr = String(t.payment_date || t.created_at || "").slice(0, 10)
      const slot = days.find(x => x.key === dateStr)
      if (slot) slot.total += Number(t.total_amount) || 0
    })
    return days
  }
  const revenueChart = buildRevenueChart()
  const revenue7 = revenueChart.reduce((s, x) => s + x.total, 0)

  const filtered = transactions.filter(t => {
    const matchFilter = txFilter === "Semua" || t.status === txFilter
    const q = txSearch.toLowerCase()
    const matchSearch = q === "" || String(t.invoice_number).toLowerCase().includes(q) || String(t.customer_name).toLowerCase().includes(q)
    return matchFilter && matchSearch
  })
  return (
    <div className="flex h-screen bg-muted overflow-hidden font-sans">
      <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:relative z-40 w-60 h-full bg-sidebar flex flex-col transition-transform duration-300 flex-shrink-0`}>
        <div className="px-5 py-5 border-b border-sidebar-border">
          <button onClick={() => window.location.href = "http://localhost:5173"} className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary fill-primary/25" />
            <span className="font-serif text-lg font-semibold italic text-sidebar-foreground">Invito</span>
          </button>
        </div>
        <nav className="flex-1 py-3 overflow-y-auto">
          {navFor(user.role).map(({ icon: Icon, label }) => (
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
            <NotificationBell user={user} />
            <button onClick={handleCreateInvitation} className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-xs font-medium flex items-center gap-1.5 hover:bg-primary/90 transition-all hover:shadow-[0_2px_12px_rgba(196,149,74,0.35)]">
              <Plus className="w-3.5 h-3.5" /> Buat Undangan
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-5">
          {activeMenu === "Transaksi" ? (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div>
                  <h2 className="font-semibold">{isAdmin ? "Riwayat Transaksi" : "Riwayat Pembelian"}</h2>
                  <p className="text-xs text-muted-foreground">{txLoading ? "Memuat..." : `${transactions.length} ${isAdmin ? "transaksi total" : "pembelian total"}`}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <input value={txSearch} onChange={e => setTxSearch(e.target.value)} placeholder="Cari invoice / pelanggan..." className="pl-8 pr-3 py-2 text-xs border border-border rounded-lg bg-card outline-none focus:border-primary w-44" />
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
                      {txLoading ? (
                        <tr><td colSpan={8} className="py-12 text-center text-muted-foreground text-sm">Memuat data transaksi...</td></tr>
                      ) : (
                        filtered.map((tx, i) => (
                          <tr key={tx.id} className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                            <td className="px-4 py-3 text-xs font-mono text-primary">{tx.invoice_number}</td>
                            <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{fmtTanggal(tx.payment_date || tx.created_at)}</td>
                            <td className="px-4 py-3 text-xs font-medium whitespace-nowrap">{tx.customer_name}</td>
                            <td className="px-4 py-3"><span className="text-xs bg-secondary px-2 py-1 rounded-full">{tx.package_name}</span></td>
                            <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{tx.payment_method}</td>
                            <td className="px-4 py-3 text-xs font-semibold whitespace-nowrap">{fmt(toNum(tx.total_amount))}</td>
                            <td className="px-4 py-3"><StatusBadge status={tx.status} /></td>
                            <td className="px-4 py-3">
                              <button onClick={() => toast.info(`Detail transaksi ${tx.invoice_number} akan segera hadir!`)} className="text-[10px] text-primary hover:underline whitespace-nowrap">Detail</button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {!txLoading && filtered.length === 0 && (
                  <div className="py-12 text-center text-muted-foreground text-sm">Tidak ada transaksi ditemukan</div>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                {isAdmin && (<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                  {[
                    { label: "Total Pendapatan", value: txLoading ? "…" : fmt(totalPendapatan), icon: TrendingUp, color: "text-green-500 bg-green-50" },
                    { label: "Transaksi Berhasil", value: txLoading ? "…" : String(txPaid.length), icon: CheckCircle2, color: "text-primary bg-primary/10" },
                    { label: "Menunggu Bayar", value: txLoading ? "…" : String(txPending.length), icon: Clock, color: "text-yellow-500 bg-yellow-50" },
                    { label: "Gagal / Expired", value: txLoading ? "…" : String(txFailed.length), icon: XCircle, color: "text-red-500 bg-red-50" },
                  ].map(({ label, value, icon: Icon, color }, i) => (
                    <div key={i} className="bg-card rounded-xl p-4 border border-border">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${color}`}><Icon className="w-4 h-4" /></div>
                      <p className="text-lg font-bold">{value}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
                )}
              </div>

            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                {[
                  { label: "Total Kunjungan", value: summary ? fmtAngka(summary.totalVisits) : "…", icon: TrendingUp, colorCls: "text-blue-500 bg-blue-50" },
                  { label: "Jumlah Tamu", value: summary ? fmtAngka(summary.totalGuests) : "…", icon: Users, colorCls: "text-primary bg-primary/10" },
                  { label: "RSVP Masuk", value: summary ? fmtAngka(summary.totalRsvp) : "…", icon: Check, colorCls: "text-green-500 bg-green-50" },
                  { label: "Amplop Digital", value: summary ? fmtRingkas(summary.totalEnvelope) : "…", icon: Gift, colorCls: "text-purple-500 bg-purple-50" },
                ].map(({ label, value, icon: Icon, colorCls }, i) => (
                  <div key={i} className="bg-card rounded-2xl p-4 border border-border">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${colorCls}`}><Icon className="w-4 h-4" /></div>
                    <p className="text-xl font-semibold mb-0.5">{value}</p>
                    <p className="text-[11px] text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>
              <div className={`grid ${isAdmin ? "lg:grid-cols-3" : "lg:grid-cols-1"} gap-4 mb-5`}>
                {isAdmin && (
                  <div className="lg:col-span-2 bg-card rounded-2xl p-5 border border-border">
                    <div className="flex items-center justify-between mb-5">
                      <div><h3 className="text-sm font-semibold">Statistik Pendapatan</h3><p className="text-[11px] text-muted-foreground">Transaksi Paid • 7 hari terakhir • Total {fmt(revenue7)}</p></div>
                      <select className="text-xs border border-border rounded-lg px-2 py-1.5 bg-muted outline-none cursor-pointer"><option>7 hari</option><option>30 hari</option></select>
                    </div>
                    <ResponsiveContainer width="100%" height={190}>
                      <AreaChart data={revenueChart} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
                        <defs>
                          <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#C4954A" stopOpacity={0.18} />
                            <stop offset="95%" stopColor="#C4954A" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#8C7456" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: "#8C7456" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => v >= 1000000 ? `${(v / 1000000).toLocaleString("id-ID", { maximumFractionDigits: 1 })}jt` : v >= 1000 ? `${Math.round(v / 1000)}rb` : String(v)} />
                        <Tooltip formatter={(value: any) => [fmt(Number(value)), "Pendapatan"]} labelFormatter={(l: any) => `Hari: ${l}`} contentStyle={{ background: "#fff", border: "1px solid rgba(196,149,74,0.2)", borderRadius: "0.75rem", fontSize: 12 }} cursor={{ stroke: "rgba(196,149,74,0.2)" }} />
                        <Area type="monotone" dataKey="total" stroke="#C4954A" strokeWidth={2} fill="url(#goldGrad)" dot={false} activeDot={{ r: 4, fill: "#C4954A" }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <div className="bg-card rounded-2xl p-5 border border-border">
                  <div className="flex items-center justify-between mb-4"><h3 className="text-sm font-semibold">RSVP Terbaru</h3><button onClick={() => setPage("rsvp")} className="text-xs text-primary hover:underline">Lihat semua</button></div>
                  {!summary || !summary.recentRsvps || summary.recentRsvps.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground text-xs">Belum ada RSVP masuk.</div>
                  ) : (
                    <div className="space-y-3">
                      {summary.recentRsvps.map((r: any, i: number) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center text-[11px] font-semibold text-primary flex-shrink-0">{(r.name ?? "?")[0]}</div>
                            <div><p className="text-xs font-medium">{r.name}</p><p className="text-[10px] text-muted-foreground">{timeAgo(r.created_at)}</p></div>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${r.attendance_status === "Hadir" ? "bg-green-50 text-green-600" : r.attendance_status === "Tidak Hadir" ? "bg-red-50 text-red-500" : "bg-yellow-50 text-yellow-600"}`}>{r.attendance_status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-card rounded-2xl p-5 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold">Undangan Saya</h3>
                  <button onClick={handleCreateInvitation} className="text-xs text-primary flex items-center gap-1 hover:underline">
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
                    <button
                      onClick={handleCreateInvitation}
                      className="border-2 border-dashed border-border rounded-xl min-h-[120px] flex flex-col items-center justify-center gap-2 hover:border-primary hover:text-primary transition-colors text-muted-foreground"
                    >
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
  // ✅ STATE FORM RSVP (preview ponsel) — terhubung ke database
  const [rsvpName, setRsvpName] = useState("")
  const [rsvpStatus, setRsvpStatus] = useState("Hadir")
  const [rsvpMessage, setRsvpMessage] = useState("")
  const [rsvpSending, setRsvpSending] = useState(false)
  const [ucapanList, setUcapanList] = useState<any[]>([])
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

  // ✅ Muat ucapan asli dari tabel rsvps
  const loadUcapan = async () => {
    try {
      const r = await fetch("http://localhost:5000/api/rsvps")
      const d = await r.json()
      if (d.success) setUcapanList(d.data.slice().reverse().slice(0, 5))
    } catch (e) { console.error(e) }
  }
  useEffect(() => { loadUcapan() }, [])

  // ✅ Kirim RSVP + ucapan ke backend
  const handleSendRsvp = async () => {
    if (!rsvpName.trim()) { toast.error("Nama wajib diisi dulu!"); return }
    setRsvpSending(true)
    try {
      const res = await fetch("http://localhost:5000/api/rsvps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: rsvpName.trim(),
          message: rsvpMessage.trim() || null,
          attendance_status: rsvpStatus,
          number_of_guests: rsvpStatus === "Hadir" ? 1 : 0,
        }),
      })
      const d = await res.json()
      if (d.success) {
        toast.success(`Terima kasih, ${rsvpName.trim()}! RSVP & ucapan tersimpan.`)
        setRsvpName(""); setRsvpMessage(""); setRsvpStatus("Hadir")
        loadUcapan()
      } else {
        toast.error(d.message || "Gagal mengirim RSVP.")
      }
    } catch (e) {
      console.error(e)
      toast.error("Tidak dapat terhubung ke server.")
    } finally {
      setRsvpSending(false)
    }
  }

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
        <input value={rsvpName} onChange={e => setRsvpName(e.target.value)} placeholder="Nama Anda" className="w-full px-3 py-2 text-[10px] rounded-lg border border-border bg-white outline-none" style={{ color: "#2A1F1A" }} />
        <div className="flex gap-2">
          <button onClick={() => setRsvpStatus("Hadir")} className="flex-1 py-2 text-[10px] rounded-full" style={rsvpStatus === "Hadir" ? { backgroundColor: accentColor, color: "#fff" } : { color: textColor, border: "1px solid #e5e0d8" }}>Hadir</button>
          <button onClick={() => setRsvpStatus("Tidak Hadir")} className="flex-1 py-2 text-[10px] rounded-full" style={rsvpStatus === "Tidak Hadir" ? { backgroundColor: accentColor, color: "#fff" } : { color: textColor, border: "1px solid #e5e0d8" }}>Tidak Hadir</button>
        </div>
        <textarea value={rsvpMessage} onChange={e => setRsvpMessage(e.target.value)} placeholder="Tuliskan ucapan..." className="w-full px-3 py-2 text-[10px] rounded-lg border border-border bg-white outline-none h-16 resize-none" style={{ color: "#2A1F1A" }} />
        <button onClick={handleSendRsvp} disabled={rsvpSending} className="w-full py-2 text-white text-[10px] rounded-full disabled:opacity-60" style={{ backgroundColor: accentColor }}>{rsvpSending ? "Mengirim..." : "Kirim Ucapan"}</button>
      </div>
    )
    if (activeSection === "Ucapan") return (
      <div className="p-6 space-y-3" style={{ color: textColor }}>
        <p className="text-[9px] tracking-[0.2em] uppercase text-center" style={{ opacity: 0.6 }}>Ucapan</p>
        {ucapanList.length === 0 ? (
          <div className="py-6 text-center text-[10px]" style={{ opacity: 0.6 }}>Belum ada ucapan. Jadilah yang pertama mengisi RSVP!</div>
        ) : (
          ucapanList.map((u: any) => (
            <div key={u.id} className="p-3 rounded-lg bg-white border border-border" style={{ color: "#2A1F1A" }}>
              <p className="text-[10px] font-semibold">{u.name} <span className="font-normal" style={{ opacity: 0.6 }}>• {u.attendance_status}</span></p>
              <p className="text-[10px]" style={{ opacity: 0.7 }}>{u.message || "-"}</p>
            </div>
          ))
        )
        }
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
            <button onClick={() => {
              if (savedId == null) { toast.error("Simpan/Publish undangan dulu sebelum membagikan!"); return }
              const link = `http://localhost:5173/?undangan=${savedId}`
              navigator.clipboard.writeText(link)
              toast.success("Link undangan disalin! Tempel di WhatsApp atau media sosial.")
            }} className="px-2.5 py-1.5 text-[11px] bg-muted rounded-lg hover:bg-muted/80 transition-colors flex items-center gap-1"><Share2 className="w-3 h-3" /> Bagikan</button>
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

// ─── CREATE INVITATION PAGE (form data → draft) ─────────────────────────────
function CreateInvitationPage({ setPage, user, openEditor }: {
  setPage: (p: Page) => void
  user: UserInfo
  openEditor: (inv?: any) => void
}) {
  const [form, setForm] = useState({ bride: "", groom: "", date: "", name: user.name, email: user.email, wa: "" })
  const [saving, setSaving] = useState(false)
  const [created, setCreated] = useState<any | null>(null)

  const handleSubmit = async () => {
    if (!form.bride.trim() || !form.groom.trim()) { toast.error("Nama mempelai wanita & pria wajib diisi!"); return }
    if (!form.date) { toast.error("Tanggal pernikahan wajib diisi!"); return }
    if (form.name.length < 3) { toast.error("Nama pemesan minimal 3 karakter!"); return }
    if (!form.email.includes("@")) { toast.error("Email tidak valid!"); return }
    if (form.wa.length < 8) { toast.error("Nomor WhatsApp minimal 8 digit!"); return }
    setSaving(true)
    try {
      const res = await fetch("http://localhost:5000/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coupleName: `${form.bride.trim()} & ${form.groom.trim()}`,
          theme: "Elegant",
          status: "Draft",
          visits: 0,
          settings: {
            brideName: form.bride.trim(),
            groomName: form.groom.trim(),
            weddingDate: form.date,
            pemesan: { name: form.name, email: form.email, wa: form.wa },
          },
        }),
      })
      const data = await res.json()
      if (data.success) {
        setCreated(data.data)
        toast.success("Draft undangan berhasil dibuat!")
      } else {
        toast.error(data.message || "Gagal membuat draft undangan.")
      }
    } catch (error) {
      console.error("Gagal membuat draft:", error)
      toast.error("Tidak dapat terhubung ke server. Pastikan backend NestJS berjalan!")
    } finally {
      setSaving(false)
    }
  }

  // ── Setelah draft terbentuk: tampilkan tombol lanjutan ──
  if (created) {
    const coupleLabel = created.coupleName ?? created.couple_name ?? `${form.bride} & ${form.groom}`
    return (
      <div className="min-h-screen bg-secondary font-sans flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg bg-card rounded-2xl border border-border p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="font-serif text-2xl font-semibold mb-2">Draft Undangan Dibuat!</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Draft <span className="font-semibold text-foreground">{coupleLabel}</span> sudah masuk ke
            <span className="font-semibold text-foreground"> Undangan Saya</span> dengan status Draft.
            Silakan lanjut edit atau lihat daftarnya.
          </p>
          <div className="flex flex-col gap-3">
            <button onClick={() => openEditor(created)} className="w-full py-3 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
              <Edit3 className="w-4 h-4" /> Halaman Selanjutnya: Edit Undangan
            </button>
            <button onClick={() => setPage("my-invitations")} className="w-full py-3 border border-border rounded-full text-sm hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2">
              <FileText className="w-4 h-4" /> Lihat di Undangan Saya
            </button>
            <button onClick={() => { setCreated(null); setForm({ ...form, bride: "", groom: "", date: "" }) }} className="w-full py-2.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              + Buat draft lain
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Form input data ──
  return (
    <div className="min-h-screen bg-secondary font-sans">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <button onClick={() => setPage("dashboard")} className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-primary fill-primary/20" />
            <span className="font-serif text-lg font-semibold italic">Invito</span>
          </button>
          <button onClick={() => setPage("dashboard")} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
            <ChevronRight className="w-3.5 h-3.5 rotate-180" /> Kembali ke Dashboard
          </button>
        </div>
      </header>
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        <div>
          <h1 className="font-serif text-3xl font-semibold mb-1">Buat Undangan Baru</h1>
          <p className="text-muted-foreground text-sm">Lengkapi data undangan dulu. Draft akan tersimpan & muncul di Undangan Saya, lalu bisa diedit.</p>
        </div>
        <div className="bg-card rounded-2xl p-6 border border-border">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><Heart className="w-4 h-4 text-primary" /> Detail Undangan</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium mb-1.5 block">Nama Mempelai Wanita</label>
              <input value={form.bride} onChange={e => setForm({ ...form, bride: e.target.value })} placeholder="Nama mempelai wanita" className="w-full px-3.5 py-2.5 bg-input-background border border-border rounded-xl text-sm outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block">Nama Mempelai Pria</label>
              <input value={form.groom} onChange={e => setForm({ ...form, groom: e.target.value })} placeholder="Nama mempelai pria" className="w-full px-3.5 py-2.5 bg-input-background border border-border rounded-xl text-sm outline-none focus:border-primary transition-colors" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium mb-1.5 block">Tanggal Pernikahan</label>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full px-3.5 py-2.5 bg-input-background border border-border rounded-xl text-sm outline-none focus:border-primary transition-colors" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-6 border border-border">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><User className="w-4 h-4 text-primary" /> Data Pemesan</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium mb-1.5 block">Nama Lengkap</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3.5 py-2.5 bg-input-background border border-border rounded-xl text-sm outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block">Alamat Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-3.5 py-2.5 bg-input-background border border-border rounded-xl text-sm outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block">Nomor WhatsApp</label>
              <input type="tel" value={form.wa} onChange={e => setForm({ ...form, wa: e.target.value })} placeholder="08xxxxxxxxxx" className="w-full px-3.5 py-2.5 bg-input-background border border-border rounded-xl text-sm outline-none focus:border-primary transition-colors" />
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => setPage("dashboard")} className="flex-1 py-3 border border-border rounded-full text-sm hover:border-primary hover:text-primary transition-all">Batal</button>
          <button onClick={handleSubmit} disabled={saving} className="flex-1 py-3 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
            {saving ? "Menyimpan..." : "Simpan sebagai Draft"}
          </button>
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
// ─── ADMIN ACCESS PAGE ──────────────────────────────────────────────────────
function AdminAccessPage({ setPage, activeMenu, setActiveMenu, user, onChanged }: {
  setPage: (p: Page) => void
  activeMenu: string
  setActiveMenu: (m: string) => void
  user: UserInfo
  onChanged: () => void
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [view, setView] = useState<"panel" | "form">("panel")
  const [activeModule, setActiveModule] = useState<"users" | "content" | "system" | "monitor">("users")
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "Admin" })
  const [showPassword, setShowPassword] = useState(false)
  const [editing, setEditing] = useState<null | { type: "admin" | "user"; id: number }>(null)
  const [selected, setSelected] = useState<null | { type: "admin" | "user"; id: number }>(null)
  const [targetType, setTargetType] = useState<"admin" | "user">("admin")
  const [dbAdmins, setDbAdmins] = useState<AdminAccount[]>([])
  const [dbUsers, setDbUsers] = useState<UserAccount[]>([])
  const [packages, setPackages] = useState<any[]>([])
  const [pkgEditing, setPkgEditing] = useState<any | null>(null)
  const [pkgForm, setPkgForm] = useState({ name: "", subtitle: "", price: "", original_price: "", is_popular: false, is_active: true })
  const [pkgSaving, setPkgSaving] = useState(false)
  const [activityLog, setActivityLog] = useState<string[]>([])
  const logActivity = (msg: string) => setActivityLog(l => [`${new Date().toLocaleTimeString("id-ID")} — ${msg}`, ...l])
  const nav = (label: string) => { setActiveMenu(label); if (label === "Dashboard") setPage("dashboard"); else if (label === "Template") setPage("templates"); else if (label === "Undangan Saya") setPage("my-invitations"); else if (label === "Edit Undangan") setPage("editor"); else if (label === "Data Tamu") setPage("guest-data"); else if (label === "RSVP") setPage("rsvp"); else if (label === "Amplop Digital") setPage("digital-envelope"); else if (label === "QR Check-In") setPage("qr-checkin"); else if (label === "Domain") setPage("domain"); else if (label === "Transaksi") setPage("dashboard"); else if (label === "Pengaturan") setPage("settings"); else if (label === "Akses Admin") setPage("admin-access"); else if (label === "Akses Pengguna") setPage("user-access"); else setPage("dashboard") }

  const loadAccounts = async () => {
    try {
      const r = await fetch("http://localhost:5000/api/users")
      const d = await r.json()
      const rows = (d.success ? d.data : []).map((x: any) => ({ id: x.id, name: x.name, email: x.email, photo: x.photo_url ?? null, role: x.role ?? "Pengguna", password: "" }))
      const ADMIN_ROLES = ["admin utama", "admin", "editor", "marketing", "viewer"]
      const isAdm = (role: string) => ADMIN_ROLES.includes((role || "").toLowerCase())
      setDbAdmins(rows.filter((x: any) => isAdm(x.role)))
      setDbUsers(rows.filter((x: any) => !isAdm(x.role)))
    } catch (e) { console.error(e) }
  }
  const loadPackages = async () => {
    try {
      const r = await fetch("http://localhost:5000/api/packages/all")
      const d = await r.json()
      if (d.success) setPackages(d.data)
    } catch (e) { console.error(e) }
  }
  useEffect(() => { loadAccounts(); loadPackages() }, [])
  const admins = dbAdmins

  const openEditPkg = (p: any) => {
    setPkgEditing(p)
    setPkgForm({
      name: p.name ?? "",
      subtitle: p.subtitle ?? "",
      price: String(Number(p.price || 0)),
      original_price: p.original_price ? String(Number(p.original_price)) : "",
      is_popular: !!p.is_popular,
      is_active: p.is_active !== false,
    })
  }
  const handleSavePkg = async () => {
    if (!pkgEditing) return
    if (!pkgForm.name.trim()) { toast.error("Nama paket wajib diisi!"); return }
    setPkgSaving(true)
    try {
      const res = await fetch(`http://localhost:5000/api/packages/${pkgEditing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: pkgForm.name,
          subtitle: pkgForm.subtitle,
          price: Number(pkgForm.price || 0),
          original_price: pkgForm.original_price ? Number(pkgForm.original_price) : null,
          is_popular: pkgForm.is_popular,
          is_active: pkgForm.is_active,
        }),
      })
      const d = await res.json()
      if (d.success) { toast.success(`Paket "${pkgForm.name}" diperbarui!`); setPkgEditing(null); loadPackages() }
      else toast.error(d.message || "Gagal memperbarui paket.")
    } catch (e) { console.error(e); toast.error("Tidak dapat terhubung ke server.") }
    finally { setPkgSaving(false) }
  }


  const openCreate = (t: "admin" | "user") => { setTargetType(t); setEditing(null); setForm({ name: "", email: "", password: "", role: t === "admin" ? "Admin" : "Pengguna" }); setView("form") }
  const openEditSelected = () => {
    if (!selected) { toast.error("Pilih akun pada tabel terlebih dahulu!"); return }
    const row = (selected.type === "admin" ? dbAdmins : dbUsers).find((a: any) => a.id === selected.id)
    if (!row) return
    setTargetType(selected.type)
    setEditing({ type: selected.type, id: row.id })
    setForm({ name: row.name, email: row.email, password: "", role: row.role ?? (selected.type === "admin" ? "Admin" : "Pengguna") })
    setView("form")
  }
  const handleSave = async () => {
    if (form.name.length < 3) { toast.error("Nama minimal 3 karakter!"); return }
    if (!form.email.includes("@")) { toast.error("Email tidak valid!"); return }
    try {
      if (editing) {
        if (form.password.length > 0 && form.password.length < 6) { toast.error("Password minimal 6 karakter!"); return }
        const res = await fetch(`http://localhost:5000/api/users/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, email: form.email, role: form.role, password: form.password || undefined }),
        })
        const d = await res.json()
        if (d.success) { toast.success(`Akun "${form.name}" diperbarui!`); logActivity(`Edit akun ${form.name} (role: ${form.role})`) }
        else toast.error(d.message || "Gagal memperbarui akun.")
      } else {
        if (form.password.length < 6) { toast.error("Password minimal 6 karakter!"); return }
        const res = await fetch("http://localhost:5000/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, email: form.email, password: form.password, role: targetType === "admin" ? form.role : "Pengguna" }),
        })
        const d = await res.json()
        if (d.success) { toast.success(`Akun "${form.name}" berhasil dibuat!`); logActivity(`Buat akun ${form.name} (role: ${targetType === "admin" ? form.role : "Pengguna"})`) }
        else toast.error(d.message || "Gagal membuat akun (email mungkin sudah terdaftar).")
      }
      onChanged()
      loadAccounts()
    } catch (e) { console.error(e); toast.error("Tidak dapat terhubung ke server.") }
    setForm({ name: "", email: "", password: "", role: "Admin" })
    setEditing(null)
    setSelected(null)
    setView("panel")
  }
  const handleDeleteSelected = async () => {
    if (!selected) { toast.error("Pilih akun pada tabel terlebih dahulu!"); return }
    // ✅ Cari data baris yang dipilih untuk validasi
    const row = (selected.type === "admin" ? dbAdmins : dbUsers).find((a: any) => a.id === selected.id)
    if (!row) { toast.error("Data tidak ditemukan."); return }
    // ✅ PENGAMAN 1: Admin Utama tidak boleh dihapus (cek role persis, bukan id 0)
    if (String(row.role).toLowerCase() === "admin utama") {
      toast.error("Akun Admin Utama tidak dapat dihapus demi keamanan sistem!")
      return
    }
    // ✅ PENGAMAN 2: tidak boleh menghapus akun yang sedang login
    if (row.email.toLowerCase() === user.email.toLowerCase()) {
      toast.error("Anda tidak dapat menghapus akun yang sedang login!")
      return
    }
    // ✅ KONFIRMASI supaya tidak salah klik
    if (!window.confirm(`Hapus akun "${row.name}" (${row.email})?\n\nUndangan & transaksi miliknya tidak akan dihapus, hanya dilepaskan dari akun ini.`)) return

    try {
      const url = `http://localhost:5000/api/users/${selected.id}`
      const res = await fetch(url, { method: "DELETE" })
      const d = await res.json()

      if (d.success) {
        toast.success(`Akun "${row.name}" berhasil dihapus dari database.`)
        logActivity(`Hapus akun ${row.name} (${row.email})`)
      } else {
        toast.error(d.message || "Gagal menghapus akun.")
      }
    } catch (e) {
      console.error(e)
      toast.error("Tidak dapat terhubung ke server.")
    }

    setSelected(null)
    onChanged()
    loadAccounts()
  }
  return (
    <div className="flex h-screen bg-muted overflow-hidden font-sans">
      <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:relative z-40 w-60 h-full bg-sidebar flex flex-col transition-transform duration-300 flex-shrink-0`}>
        <div className="px-5 py-5 border-b border-sidebar-border"><button onClick={() => setPage("dashboard")} className="flex items-center gap-2"><Heart className="w-5 h-5 text-primary fill-primary/25" /><span className="font-serif text-lg font-semibold italic text-sidebar-foreground">Invito</span></button></div>
        <nav className="flex-1 py-3 overflow-y-auto">{navFor(user.role).map(({ icon: Icon, label }) => (<button key={label} onClick={() => nav(label)} className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm transition-all ${activeMenu === label ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium" : "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-foreground"}`}><Icon className="w-4 h-4 flex-shrink-0" />{label}</button>))}</nav>
        <div className="px-5 py-4 border-t border-sidebar-border"><div className="flex items-center gap-2.5 mb-3"><div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0"><User className="w-4 h-4 text-primary" /></div><div className="min-w-0"><p className="text-xs font-semibold text-sidebar-foreground truncate">{user.name}</p><p className="text-[10px] text-sidebar-foreground/45 truncate">{user.email}</p></div></div><button onClick={() => setPage("login")} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sidebar-foreground/55 hover:bg-sidebar-accent text-xs transition-colors"><LogOut className="w-3.5 h-3.5" /> Keluar</button></div>
      </aside>
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-foreground/40 z-30 lg:hidden" />}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-card border-b border-border px-5 flex items-center flex-shrink-0"><div><p className="text-sm font-semibold">Akses Admin</p><p className="text-[11px] text-muted-foreground hidden sm:block">Buat dan kelola akun admin Anda</p></div></header>
        <main className="flex-1 overflow-y-auto p-5">
          {view === "panel" ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between"><div><h2 className="font-semibold">Panel Admin</h2><p className="text-xs text-muted-foreground">Kelola akun, konten, pengaturan, dan pantau operasional</p></div><button onClick={() => openCreate(targetType)} className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-xs font-medium flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" /> Create</button></div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {([
                  { id: "users", title: "Kelola Pengguna", desc: "Atur akun & role", icon: Users },
                  { id: "content", title: "Kelola Konten", desc: "Data & informasi", icon: FileText },
                  { id: "system", title: "Pengaturan Sistem", desc: "Konfigurasi dasar", icon: Settings },
                  { id: "monitor", title: "Pantau Operasional", desc: "Aktivitas sistem", icon: TrendingUp },
                ] as const).map(m => (<button key={m.id} onClick={() => setActiveModule(m.id)} className={`text-left p-4 rounded-2xl border transition-all ${activeModule === m.id ? "bg-primary/10 border-primary/40" : "bg-card border-border hover:border-primary/30"}`}><m.icon className="w-4 h-4 text-primary mb-2" /><p className="text-sm font-semibold">{m.title}</p><p className="text-[11px] text-muted-foreground">{m.desc}</p></button>))}
              </div>
              {activeModule === "users" && (
                <div className="space-y-4">
                  <div className="bg-card rounded-2xl border border-border overflow-hidden">
                    <div className="p-4 border-b border-border flex items-center justify-between"><h3 className="text-sm font-semibold">Tabel Akun Admin</h3><button onClick={() => openCreate("admin")} className="text-xs text-primary hover:underline">+ Admin</button></div>
                    <table className="w-full"><thead><tr className="border-b border-border bg-muted/50">{["Nama", "Email", "Role", "Status"].map(h => <th key={h} className="px-4 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase">{h}</th>)}</tr></thead><tbody>
                      {admins.map(a => (<tr key={`a${a.id}`} onClick={() => setSelected({ type: "admin", id: a.id })} className={`cursor-pointer border-b border-border/50 ${selected?.type === "admin" && selected.id === a.id ? "bg-primary/10" : "hover:bg-muted/30"}`}><td className="px-4 py-2 text-xs font-medium">{a.name}</td><td className="px-4 py-2 text-xs text-muted-foreground">{a.email}</td><td className="px-4 py-2"><span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">{a.role}</span></td><td className="px-4 py-2"><span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-600">Aktif</span></td></tr>))}
                    </tbody></table></div>
                  <div className="bg-card rounded-2xl border border-border overflow-hidden">
                    <div className="p-4 border-b border-border flex items-center justify-between"><h3 className="text-sm font-semibold">Tabel Akun Pengguna</h3><button onClick={() => openCreate("user")} className="text-xs text-primary hover:underline">+ Pengguna</button></div>
                    <table className="w-full"><thead><tr className="border-b border-border bg-muted/50">{["Nama", "Email", "Role", "Status"].map(h => <th key={h} className="px-4 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase">{h}</th>)}</tr></thead><tbody>
                      {dbUsers.map(a => (<tr key={`u${a.id}`} onClick={() => setSelected({ type: "user", id: a.id })} className={`cursor-pointer border-b border-border/50 ${selected?.type === "user" && selected.id === a.id ? "bg-primary/10" : "hover:bg-muted/30"}`}><td className="px-4 py-2 text-xs font-medium">{a.name}</td><td className="px-4 py-2 text-xs text-muted-foreground">{a.email}</td><td className="px-4 py-2"><span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">{a.role}</span></td><td className="px-4 py-2"><span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-600">Aktif</span></td></tr>))}
                      {dbUsers.length === 0 && <tr><td colSpan={4} className="px-4 py-6 text-center text-xs text-muted-foreground">Belum ada akun pengguna.</td></tr>}
                    </tbody></table></div>
                  <div className="flex gap-2"><button onClick={openEditSelected} className="px-4 py-2 border border-border rounded-lg text-xs hover:border-primary hover:text-primary flex items-center gap-1.5"><Edit3 className="w-3.5 h-3.5" /> Edit</button><button onClick={handleDeleteSelected} className="px-4 py-2 border border-red-200 text-red-500 rounded-lg text-xs hover:bg-red-50 flex items-center gap-1.5"><Trash2 className="w-3.5 h-3.5" /> Delete</button></div>
                </div>
              )}
              {activeModule === "content" && (
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                  <div className="p-4 border-b border-border"><h3 className="text-sm font-semibold">Kelola Paket</h3><p className="text-[11px] text-muted-foreground">Perubahan harga/status langsung terlihat di halaman checkout frontend</p></div>
                  <table className="w-full"><thead><tr className="border-b border-border bg-muted/50">{["Paket", "Harga", "Harga Coret", "Populer", "Status", ""].map(h => <th key={h} className="px-4 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase">{h}</th>)}</tr></thead><tbody>
                    {packages.map(p => (
                      <tr key={p.id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="px-4 py-2 text-xs font-medium">{p.name}<p className="text-[10px] text-muted-foreground font-normal">{p.subtitle}</p></td>
                        <td className="px-4 py-2 text-xs">{fmt(Number(p.price))}</td>
                        <td className="px-4 py-2 text-xs text-muted-foreground">{p.original_price ? fmt(Number(p.original_price)) : "-"}</td>
                        <td className="px-4 py-2">{p.is_popular ? <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">Populer</span> : <span className="text-[10px] text-muted-foreground">-</span>}</td>
                        <td className="px-4 py-2">{p.is_active ? <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-600">Aktif</span> : <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Nonaktif</span>}</td>
                        <td className="px-4 py-2 text-right"><button onClick={() => openEditPkg(p)} className="text-[10px] text-primary hover:underline">Edit</button></td>
                      </tr>
                    ))}
                    {packages.length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-center text-xs text-muted-foreground">Memuat paket...</td></tr>}
                  </tbody></table>
                </div>
              )}
              {pkgEditing && (
                <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="w-full max-w-md bg-card rounded-2xl border border-border p-6 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between"><h3 className="text-sm font-semibold">Edit Paket: {pkgEditing.name}</h3><button onClick={() => setPkgEditing(null)} className="p-1 hover:bg-muted rounded-full"><X className="w-4 h-4" /></button></div>
                    <div><label className="text-xs font-medium mb-1.5 block">Nama Paket</label><input value={pkgForm.name} onChange={e => setPkgForm({ ...pkgForm, name: e.target.value })} className="w-full px-3.5 py-2.5 bg-muted border border-border rounded-lg text-sm outline-none focus:border-primary" /></div>
                    <div><label className="text-xs font-medium mb-1.5 block">Subtitle</label><input value={pkgForm.subtitle} onChange={e => setPkgForm({ ...pkgForm, subtitle: e.target.value })} className="w-full px-3.5 py-2.5 bg-muted border border-border rounded-lg text-sm outline-none focus:border-primary" /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="text-xs font-medium mb-1.5 block">Harga (Rp)</label><input type="number" value={pkgForm.price} onChange={e => setPkgForm({ ...pkgForm, price: e.target.value })} className="w-full px-3.5 py-2.5 bg-muted border border-border rounded-lg text-sm outline-none focus:border-primary" /></div>
                      <div><label className="text-xs font-medium mb-1.5 block">Harga Coret (Rp)</label><input type="number" value={pkgForm.original_price} onChange={e => setPkgForm({ ...pkgForm, original_price: e.target.value })} placeholder="Kosongkan jika tidak ada" className="w-full px-3.5 py-2.5 bg-muted border border-border rounded-lg text-sm outline-none focus:border-primary" /></div>
                    </div>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={pkgForm.is_popular} onChange={e => setPkgForm({ ...pkgForm, is_popular: e.target.checked })} /> Badge Populer</label>
                      <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={pkgForm.is_active} onChange={e => setPkgForm({ ...pkgForm, is_active: e.target.checked })} /> Aktif di Checkout</label>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setPkgEditing(null)} disabled={pkgSaving} className="px-4 py-2 border border-border rounded-lg text-xs">Batal</button>
                      <button onClick={handleSavePkg} disabled={pkgSaving} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium disabled:opacity-60">{pkgSaving ? "Menyimpan..." : "Simpan Perubahan"}</button>
                    </div>
                  </div>
                </div>
              )}
              {activeModule === "system" && <div className="bg-card rounded-2xl border border-border p-6 text-sm text-muted-foreground">Panel pengaturan sistem (placeholder).</div>}
              {activeModule === "monitor" && <div className="bg-card rounded-2xl border border-border p-6"><h3 className="text-sm font-semibold mb-3">Aktivitas Terbaru</h3>{activityLog.length === 0 ? <p className="text-xs text-muted-foreground">Belum ada aktivitas.</p> : activityLog.map((l, i) => <p key={i} className="text-xs text-muted-foreground py-1 border-b border-border/40">{l}</p>)}</div>}
            </div>
          ) : (
            <div className="max-w-2xl bg-card rounded-2xl border border-border p-6 space-y-4">
              <h3 className="font-semibold">{editing ? "Edit Akun" : `Buat Akun ${targetType === "admin" ? "Admin" : "Pengguna"}`}</h3>
              <div><label className="text-xs font-medium mb-1.5 block">Nama</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3.5 py-2.5 bg-muted border border-border rounded-lg text-sm outline-none focus:border-primary" /></div>
              <div><label className="text-xs font-medium mb-1.5 block">Email</label><input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-3.5 py-2.5 bg-muted border border-border rounded-lg text-sm outline-none focus:border-primary" /></div>
              <div><label className="text-xs font-medium mb-1.5 block">Password</label><input type={showPassword ? "text" : "password"} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder={editing ? "Kosongkan jika tidak diubah" : "Minimal 6 karakter"} className="w-full px-3.5 py-2.5 bg-muted border border-border rounded-lg text-sm outline-none focus:border-primary" /></div>
              {targetType === "admin" && (<div><label className="text-xs font-medium mb-1.5 block">Role</label><select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full px-3.5 py-2.5 bg-muted border border-border rounded-lg text-sm outline-none focus:border-primary"><option>Admin Utama</option><option>Admin</option><option>Editor</option><option>Viewer</option></select></div>)}
              <div className="flex justify-end gap-2"><button onClick={() => { setView("panel"); setEditing(null) }} className="px-4 py-2 border border-border rounded-lg text-xs">Kembali</button><button onClick={handleSave} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium">Simpan</button></div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}


// ─── USER ACCESS PAGE ───────────────────────────────────────────────────────
function UserAccessPage({ setPage, activeMenu, setActiveMenu, user, onChanged }: {
  setPage: (p: Page) => void
  activeMenu: string
  setActiveMenu: (m: string) => void
  user: UserInfo
  onChanged: () => void
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activePanel, setActivePanel] = useState<"akun" | "riwayat" | "layanan">("akun")
  const [form, setForm] = useState({ name: "", email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [accounts, setAccounts] = useState<UserAccount[]>([])
  const [editing, setEditing] = useState<UserAccount | null>(null)
  const nav = (label: string) => {
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
    else if (label === "Transaksi") setPage("dashboard")
    else if (label === "Pengaturan") setPage("settings")
    else if (label === "Akses Admin") setPage("admin-access")
    else if (label === "Akses Pengguna") setPage("user-access")
    else setPage("dashboard")
  }
  const loadUsers = async () => {
    try {
      const r = await fetch("http://localhost:5000/api/users")
      const d = await r.json()
      if (d.success) setAccounts(d.data.map((x: any) => ({ id: x.id, name: x.name, email: x.email, photo: x.photo_url ?? null, role: x.role ?? "Pengguna", password: "" })))
    } catch (e) { console.error(e) }
  }
  useEffect(() => { loadUsers() }, [])
  const handleSave = async () => {
    if (form.name.length < 3) { toast.error("Nama minimal 3 karakter!"); return }
    if (!form.email.includes("@")) { toast.error("Email tidak valid!"); return }
    if (!editing && form.password.length < 6) { toast.error("Password minimal 6 karakter!"); return }
    try {
      const url = editing ? `http://localhost:5000/api/users/${editing.id}` : "http://localhost:5000/api/users"
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, role: "Pengguna", password: form.password || undefined }),
      })
      const d = await res.json()
      if (d.success) {
        toast.success(editing ? `Akun "${form.name}" diperbarui!` : `Akun "${form.name}" tersimpan di database!`)
        setForm({ name: "", email: "", password: "" })
        setEditing(null)
        onChanged()
        loadUsers()
      } else toast.error(d.message || "Gagal menyimpan akun.")
    } catch (e) { console.error(e); toast.error("Tidak dapat terhubung ke server.") }
  }
  const handleDelete = async (a: UserAccount) => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/${a.id}`, { method: "DELETE" })
      const d = await res.json()
      if (d.success) { toast.success(`Akun "${a.name}" dihapus.`); onChanged(); loadUsers() }
      else toast.error(d.message || "Gagal menghapus.")
    } catch { toast.error("Tidak dapat terhubung ke server.") }
  }
  return (
    <div className="flex h-screen bg-muted overflow-hidden font-sans">
      <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:relative z-40 w-60 h-full bg-sidebar flex flex-col transition-transform duration-300 flex-shrink-0`}>
        <div className="px-5 py-5 border-b border-sidebar-border"><button onClick={() => setPage("dashboard")} className="flex items-center gap-2"><Heart className="w-5 h-5 text-primary fill-primary/25" /><span className="font-serif text-lg font-semibold italic text-sidebar-foreground">Invito</span></button></div>
        <nav className="flex-1 py-3 overflow-y-auto">{navFor(user.role).map(({ icon: Icon, label }) => (<button key={label} onClick={() => nav(label)} className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm transition-all ${activeMenu === label ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium" : "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-foreground"}`}><Icon className="w-4 h-4 flex-shrink-0" />{label}</button>))}</nav>
        <div className="px-5 py-4 border-b border-sidebar-border"><div className="flex items-center gap-2.5 mb-3"><div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0"><User className="w-4 h-4 text-primary" /></div><div className="min-w-0"><p className="text-xs font-semibold text-sidebar-foreground truncate">{user.name}</p><p className="text-[10px] text-sidebar-foreground/45 truncate">{user.email}</p></div></div><button onClick={() => setPage("login")} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sidebar-foreground/55 hover:bg-sidebar-accent text-xs transition-colors"><LogOut className="w-3.5 h-3.5" /> Keluar</button></div>
      </aside>
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-foreground/40 z-30 lg:hidden" />}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-card border-b border-border px-5 flex items-center flex-shrink-0"><div><p className="text-sm font-semibold">Akses Pengguna</p><p className="text-[11px] text-muted-foreground hidden sm:block">Buat akun untuk login sebagai pengguna</p></div></header>
        <main className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="grid sm:grid-cols-3 gap-4">
            {([
              { id: "akun", title: "Akun Pengguna", desc: "Buat & kelola akun", icon: UserPlus },
              { id: "riwayat", title: "Cek Riwayat", desc: "Aktivitas & transaksi", icon: Clock },
              { id: "layanan", title: "Akses Layanan", desc: "Fitur inti aplikasi", icon: Package },
            ] as const).map(p => (<button key={p.id} onClick={() => setActivePanel(p.id)} className={`text-left p-4 rounded-2xl border ${activePanel === p.id ? "bg-primary/10 border-primary/40" : "bg-card border-border"}`}><p className="text-sm font-semibold">{p.title}</p><p className="text-[11px] text-muted-foreground">{p.desc}</p></button>))}
          </div>
          {activePanel === "akun" && (
            <div className="grid lg:grid-cols-2 gap-5">
              <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
                <h3 className="font-semibold">{editing ? "Edit Akun Pengguna" : "Informasi Akun Pengguna Baru"}</h3>
                <div><label className="text-xs font-medium mb-1.5 block">Nama</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3.5 py-2.5 bg-muted border border-border rounded-lg text-sm outline-none focus:border-primary" /></div>
                <div><label className="text-xs font-medium mb-1.5 block">Email</label><input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-3.5 py-2.5 bg-muted border border-border rounded-lg text-sm outline-none focus:border-primary" /></div>
                <div><label className="text-xs font-medium mb-1.5 block">Password</label><input type={showPassword ? "text" : "password"} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder={editing ? "Kosongkan jika tidak diubah" : "Minimal 6 karakter"} className="w-full px-3.5 py-2.5 bg-muted border border-border rounded-lg text-sm outline-none focus:border-primary" /></div>
                <div className="flex justify-end gap-2">{editing && <button onClick={() => { setEditing(null); setForm({ name: "", email: "", password: "" }) }} className="px-4 py-2 border border-border rounded-lg text-xs">Batal Edit</button>}<button onClick={handleSave} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium">Simpan</button></div>
              </div>
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="p-4 border-b border-border"><h3 className="text-sm font-semibold">Daftar Akun Pengguna</h3><p className="text-[11px] text-muted-foreground">{accounts.length} akun terdaftar</p></div>
                <table className="w-full"><tbody>
                  {accounts.map(a => (<tr key={a.id} className="border-b border-border/50"><td className="px-4 py-2 text-xs font-medium">{a.name}</td><td className="px-4 py-2 text-xs text-muted-foreground">{a.email}</td><td className="px-4 py-2"><span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">{a.role}</span></td><td className="px-4 py-2 text-right"><button onClick={() => { setEditing(a); setForm({ name: a.name, email: a.email, password: "" }) }} className="text-[10px] text-primary hover:underline mr-2">Edit</button><button onClick={() => handleDelete(a)} className="text-[10px] text-red-500 hover:underline">Hapus</button></td></tr>))}
                  {accounts.length === 0 && <tr><td className="px-4 py-6 text-center text-xs text-muted-foreground">Belum ada akun pengguna.</td></tr>}
                </tbody></table></div>
            </div>
          )}
          {activePanel === "riwayat" && <div className="bg-card rounded-2xl border border-border p-6 text-sm text-muted-foreground">Riwayat aktivitas (placeholder).</div>}
          {activePanel === "layanan" && <div className="bg-card rounded-2xl border border-border p-6 text-sm text-muted-foreground">Daftar layanan (placeholder).</div>}
        </main>
      </div>
    </div>
  )
}

// ─── NOTIFICATION BELL ───────────────────────────────────────────────────────
function NotificationBell({ user }: { user: UserInfo }) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const load = async () => {
    if (!user.id) return
    setLoading(true)
    try {
      const res = await fetch(`http://localhost:5000/api/notifications?user_id=${user.id}`)
      const d = await res.json()
      if (d.success) setItems(d.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [user.id])
  const unread = items.filter(i => !i.is_read).length
  const markRead = async (id: number) => {
    try {
      await fetch(`http://localhost:5000/api/notifications/${id}/read`, { method: "PUT" })
      setItems(prev => prev.map(i => i.id === id ? { ...i, is_read: true } : i))
    } catch (e) { console.error(e) }
  }
  const markAll = async () => {
    if (!user.id) return
    try {
      await fetch(`http://localhost:5000/api/notifications/read-all?user_id=${user.id}`, { method: "PUT" })
      setItems(prev => prev.map(i => ({ ...i, is_read: true })))
    } catch (e) { console.error(e) }
  }
  const timeAgo = (iso: string) => {
    if (!iso) return ""
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "Baru saja"
    if (mins < 60) return `${mins} mnt lalu`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours} jam lalu`
    return `${Math.floor(hours / 24)} hari lalu`
  }
  return (
    <div className="relative">
      <button onClick={() => { setOpen(o => !o); if (!open) load() }} className="relative p-2 rounded-lg hover:bg-muted transition-colors">
        <Bell className="w-4 h-4" />
        {unread > 0 && <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center">{unread}</span>}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden">
            <div className="p-3 border-b border-border flex items-center justify-between">
              <p className="text-xs font-semibold">Notifikasi</p>
              {unread > 0 && <button onClick={markAll} className="text-[10px] text-primary hover:underline">Tandai semua dibaca</button>}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {loading ? <p className="p-4 text-xs text-muted-foreground text-center">Memuat...</p>
                : items.length === 0 ? <p className="p-4 text-xs text-muted-foreground text-center">Belum ada notifikasi.</p>
                  : items.map(n => (
                    <button key={n.id} onClick={() => !n.is_read && markRead(n.id)} className={`w-full text-left p-3 border-b border-border/50 last:border-0 hover:bg-muted/40 transition-colors ${n.is_read ? "opacity-60" : ""}`}>
                      <div className="flex items-start gap-2">
                        {!n.is_read && <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1 flex-shrink-0" />}
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate">{n.title}</p>
                          <p className="text-[10px] text-muted-foreground">{n.message}</p>
                          <p className="text-[9px] text-muted-foreground/70 mt-0.5">{timeAgo(n.created_at)}</p>
                        </div>
                      </div>
                    </button>
                  ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}


/// ─── ROOT APP ────────────────────────────────────────────────────────────────
// ✅ Penjaga sekali-jalan: mencegah effect ganda (StrictMode) memakai kode login dua kali
let codeLoginUsed = false
export default function App() {
  const [page, setPage] = useState<Page>("login")
  const [authTab, setAuthTab] = useState<AuthTab>("login")
  const [activeMenu, setActiveMenu] = useState("Dashboard")
  // ✅ Data user terpusat — dipakai semua sidebar & halaman
  const [user, setUser] = useState<UserInfo>({ name: "Anisa Rahmawati", email: "anisa@email.com", phone: "081234567890", role: "Pengguna" })
  // ✅ Daftar akun pengguna — dibuat dari menu Akses Pengguna, dipakai untuk login
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>([])
  // ✅ Daftar akun admin — dibuat dari menu Akses Admin, dipakai untuk login
  const [adminAccounts, setAdminAccounts] = useState<AdminAccount[]>([])
  // ✅ LANGKAH 5: muat akun dari database supaya daftar tidak pernah kosong
  const syncAccounts = async () => {
    try {
      const [u, a] = await Promise.all([
        fetch("http://localhost:5000/api/users").then(r => r.json()),
        fetch("http://localhost:5000/api/admins").then(r => r.json()),
      ])
      if (u.success) setUserAccounts(u.data.map((r: any) => ({ id: r.id, name: r.name, email: r.email, photo: r.photo_url ?? null, password: "", role: r.role ?? "Pengguna" })))
      if (a.success) setAdminAccounts(a.data.map((r: any) => ({ id: r.id, name: r.name, email: r.email, photo: r.photo_url ?? null, password: "", role: r.role ?? "Admin" })))
    } catch (e) {
      console.error("Gagal memuat akun:", e)
    }
  }
  useEffect(() => { syncAccounts() }, [])
  // ✅ BARU: auto-login lewat kode sekali pakai (kiriman redirect pembayaran frontend)
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code")
    if (!code || codeLoginUsed) return
    codeLoginUsed = true
    fetch("http://localhost:5000/api/auth/code-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.success && d.user) {
          setUser({ id: d.user.id, name: d.user.name, email: d.user.email, phone: "081234567890", role: d.user.role ?? "Pengguna" })
          toast.success(`Selamat datang, ${d.user.name}! Akun Anda telah terkonfirmasi.`)
          setPage("dashboard")
          window.history.replaceState({}, "", window.location.pathname)
        } else {
          toast.error(d.message || "Kode login tidak valid atau sudah dipakai.")
        }
      })
      .catch(() => toast.error("Tidak dapat terhubung ke server."))
  }, [])
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
      case "create-invitation": return <CreateInvitationPage setPage={setPage} user={user} openEditor={openEditor} />
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
      case "admin-access": return <AdminAccessPage setPage={setPage} activeMenu={activeMenu} setActiveMenu={setActiveMenu} user={user} onChanged={syncAccounts} />
      case "user-access": return <UserAccessPage setPage={setPage} activeMenu={activeMenu} setActiveMenu={setActiveMenu} user={user} onChanged={syncAccounts} />
      case "seating": return <SeatingPage setPage={setPage} />
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