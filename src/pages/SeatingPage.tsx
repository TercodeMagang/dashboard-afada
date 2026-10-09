// ─── SEATING / DENAH MEJA (drag & drop) ─────────────────────────────────────
// ✅ Refactoring bertahap: fitur baru hidup di file sendiri
import { useEffect, useState, type DragEvent } from "react"
import { ChevronRight, Plus, Users, GripVertical } from "lucide-react"
import { toast } from "sonner"

const API = "http://localhost:5000"

type Guest = {
    id: number
    name: string
    whatsapp: string | null
    table_number: string | null
    rsvp_status: string
}

export default function SeatingPage({ setPage }: { setPage: (p: any) => void }) {
    const [guests, setGuests] = useState<Guest[]>([])
    const [loading, setLoading] = useState(true)
    const [tables, setTables] = useState<string[]>([])
    const [dragId, setDragId] = useState<number | null>(null)
    const [dropTarget, setDropTarget] = useState<string | null>(null)

    const load = async () => {
        try {
            const r = await fetch(`${API}/api/guests`)
            const d = await r.json()
            if (d.success) {
                setGuests(d.data)
                const unique = Array.from(new Set(d.data.map((g: Guest) => g.table_number).filter(Boolean))) as string[]
                setTables(prev => {
                    const merged = Array.from(new Set([...prev, ...unique]))
                    return merged.length ? merged : ["Meja 1", "Meja 2", "Meja 3"]
                })
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => { load() }, [])

    // ✅ Simpan penempatan meja ke database (PUT /api/guests/:id)
    const assignTable = async (guestId: number, table: string | null) => {
        const guest = guests.find(g => g.id === guestId)
        if (!guest || guest.table_number === table) return
        setGuests(prev => prev.map(g => (g.id === guestId ? { ...g, table_number: table } : g)))
        try {
            const res = await fetch(`${API}/api/guests/${guestId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ table_number: table }),
            })
            const d = await res.json()
            if (d.success) {
                toast.success(table ? `${guest.name} → ${table}` : `${guest.name} dikembalikan ke daftar belum ditempatkan`)
            } else {
                toast.error(d.message || "Gagal memindahkan tamu.")
                load()
            }
        } catch (e) {
            console.error(e)
            toast.error("Gagal terhubung ke server.")
            load()
        }
    }

    const addTable = () => {
        let n = tables.length + 1
        while (tables.includes(`Meja ${n}`)) n++
        const name = `Meja ${n}`
        setTables(prev => [...prev, name])
        toast.success(`${name} ditambahkan.`)
    }

    const unassigned = guests.filter(g => !g.table_number)
    const byTable = (t: string) => guests.filter(g => g.table_number === t)

    const dropProps = (table: string | null) => ({
        onDragOver: (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setDropTarget(table ?? "__unassigned__") },
        onDragLeave: () => setDropTarget(null),
        onDrop: (e: DragEvent<HTMLDivElement>) => {
            e.preventDefault()
            const id = dragId
            setDropTarget(null)
            setDragId(null)
            if (id != null) assignTable(id, table)
        },
    })

    const GuestChip = ({ g }: { g: Guest }) => (
        <div
            draggable
            onDragStart={() => setDragId(g.id)}
            onDragEnd={() => { setDragId(null); setDropTarget(null) }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] cursor-grab active:cursor-grabbing bg-card ${dragId === g.id ? "opacity-40 border-primary" : "border-border hover:border-primary/40"}`}
        >
            <GripVertical className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            <span className="font-medium truncate">{g.name}</span>
            <span className={`ml-auto text-[9px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${g.rsvp_status === "Hadir" ? "bg-green-50 text-green-600" : g.rsvp_status === "Tidak Hadir" ? "bg-red-50 text-red-500" : "bg-yellow-50 text-yellow-600"}`}>{g.rsvp_status}</span>
        </div>
    )

    return (
        <div className="min-h-screen bg-muted font-sans">
            <header className="h-14 bg-card border-b border-border px-5 flex items-center justify-between sticky top-0 z-40">
                <div className="flex items-center gap-3">
                    <button onClick={() => setPage("guest-data")} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                        <ChevronRight className="w-3.5 h-3.5 rotate-180" /> Data Tamu
                    </button>
                    <span className="text-muted-foreground/30 select-none">|</span>
                    <div>
                        <p className="text-sm font-semibold">Denah & Meja Tamu</p>
                        <p className="text-[11px] text-muted-foreground hidden sm:block">Seret kartu tamu ke meja untuk mengatur tempat duduk</p>
                    </div>
                </div>
                <button onClick={addTable} className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-xs font-medium flex items-center gap-1.5 hover:bg-primary/90 transition-all">
                    <Plus className="w-3.5 h-3.5" /> Tambah Meja
                </button>
            </header>

            <main className="p-5 space-y-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: "Total Tamu", value: loading ? "…" : guests.length },
                        { label: "Sudah Ditempatkan", value: loading ? "…" : guests.length - unassigned.length },
                        { label: "Belum Ditempatkan", value: loading ? "…" : unassigned.length },
                        { label: "Jumlah Meja", value: tables.length },
                    ].map((s, i) => (
                        <div key={i} className="bg-card rounded-xl p-4 border border-border">
                            <p className="text-lg font-bold">{s.value}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
                        </div>
                    ))}
                </div>

                <div {...dropProps(null)} className={`bg-card rounded-2xl border-2 border-dashed p-4 transition-colors ${dropTarget === "__unassigned__" ? "border-primary bg-primary/5" : "border-border"}`}>
                    <div className="flex items-center gap-2 mb-3">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <h3 className="text-xs font-semibold">Belum Ditempatkan ({unassigned.length})</h3>
                    </div>
                    <div className="flex flex-wrap gap-2 min-h-[40px]">
                        {unassigned.map(g => <GuestChip key={g.id} g={g} />)}
                        {unassigned.length === 0 && <p className="text-[11px] text-muted-foreground">Semua tamu sudah punya meja. 🎉</p>}
                    </div>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {tables.map(t => (
                        <div key={t} {...dropProps(t)} className={`bg-card rounded-2xl border-2 p-4 transition-colors ${dropTarget === t ? "border-primary bg-primary/5" : "border-border"}`}>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xs font-semibold">{t} ({byTable(t).length})</h3>
                                <span className="text-[9px] text-muted-foreground">kapasitas 8–10</span>
                            </div>
                            <div className="space-y-2 min-h-[60px]">
                                {byTable(t).map(g => <GuestChip key={g.id} g={g} />)}
                                {byTable(t).length === 0 && <p className="text-[11px] text-muted-foreground text-center py-3">Seret tamu ke sini</p>}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    )
}