import Link from "next/link";

const navLinks = [
  { href: "/login", label: "Masuk" },
  { href: "/register", label: "Daftar Perusahaan" },
  { href: "/register/profil-bisnis", label: "Profil Bisnis" },
  { href: "/pendana/pendanaan/buat", label: "Buat Pendanaan" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 px-4 py-16 text-slate-100">
      <main className="mx-auto flex max-w-2xl flex-col gap-8 rounded-3xl border border-slate-800 bg-slate-900/60 p-10 shadow-2xl shadow-black/30">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">VESSEL</p>
          <h1 className="mt-4 text-3xl font-bold text-slate-50">Navigasi Cepat</h1>
          <p className="mt-2 text-sm text-slate-400">
            Pilih halaman yang ingin diakses. Daftar di bawah mengacu pada endpoint yang sudah tersedia.
          </p>
        </div>

        <nav>
          <ul className="divide-y divide-slate-800 rounded-2xl border border-slate-800 bg-slate-950/40">
            {navLinks.map((link) => (
              <li key={link.href} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="text-base font-semibold text-slate-100">{link.label}</p>
                  <p className="text-xs text-slate-500">{link.href}</p>
                </div>
                <Link
                  href={link.href}
                  className="rounded-full border border-cyan-500/50 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/10"
                >
                  Buka
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </main>
    </div>
  );
}
