"use client";

import { useMemo, useState } from "react";

const numberId = new Intl.NumberFormat("id-ID");

export default function PencairanDanaPage() {
	const saldoTertahan = 0;
	const biayaAdmin = 2500;
	const [nominal, setNominal] = useState(0);
	const [pin, setPin] = useState("");
	const [snackbar, setSnackbar] = useState<string | null>(null);

	const bankInfo = useMemo(
		() => ({ bank: "BCA", rekening: "3908 8833 1199" }),
		[]
	);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (nominal < 10000) {
			setSnackbar("Minimal penarikan IDRX 10.000");
			return;
		}

		if (nominal > saldoTertahan) {
			setSnackbar("Uang Anda tidak mencukupi");
			return;
		}

		// Mock success path
		setSnackbar("Permintaan penarikan diproses");
	};

	return (
		<div className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
			<div className="mx-auto flex max-w-3xl flex-col gap-6">
				<header className="space-y-2">
					<p className="text-sm font-semibold tracking-wide text-cyan-300/80">Pendana • Pencairan Dana</p>
					<h1 className="text-3xl font-bold text-slate-50">Tarik Dana</h1>
					<p className="text-sm text-slate-400">Dana akan dikirim ke rekening terdaftar Anda.</p>
				</header>

				<section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-inner shadow-black/20">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-slate-400">Saldo Tertahan</p>
							<p className="text-2xl font-bold text-slate-50">IDRX {numberId.format(saldoTertahan)}</p>
						</div>
						<div className="rounded-full bg-slate-800 px-4 py-2 text-xs text-slate-300">
							Biaya Admin: IDRX {numberId.format(biayaAdmin)}
						</div>
					</div>
				</section>

				<form onSubmit={handleSubmit} className="space-y-5">
					<div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-inner shadow-black/20 space-y-5">
						<div className="space-y-2">
							<label className="text-sm font-semibold text-slate-200">Nominal Penarikan</label>
							<input
								type="number"
								min={10000}
								max={saldoTertahan}
								value={nominal || ""}
								onChange={(e) => setNominal(parseInt(e.target.value || "0", 10))}
								placeholder="Masukkan nominal (min IDRX 10.000)"
								className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
							/>
							<p className="text-xs text-slate-500">Min IDRX 10.000 • Maks sesuai saldo</p>
						</div>

						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<label className="text-sm font-semibold text-slate-200">Rekening Tujuan</label>
								<div className="flex items-center gap-2 text-xs text-slate-500">
									<span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-slate-300">🔒</span>
									<span>Ganti rekening di profil</span>
								</div>
							</div>
							<div className="rounded-lg border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-200">
								<p className="font-semibold">{bankInfo.bank}</p>
								<p className="text-slate-300">{bankInfo.rekening}</p>
								<p className="text-xs text-slate-500 mt-1">Dana akan dikirim ke rekening terdaftar Anda.</p>
							</div>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-semibold text-slate-200">PIN Konfirmasi</label>
							<input
								type="password"
								value={pin}
								onChange={(e) => setPin(e.target.value)}
								placeholder="Masukkan PIN"
								className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
							/>
							<p className="text-xs text-slate-500">PIN sementara bebas diisi.</p>
						</div>

						<div className="space-y-1 text-sm text-slate-400">
							<div className="flex items-center justify-between">
								<span>Total Penarikan</span>
								<span className="font-semibold text-slate-100">IDRX {numberId.format(Math.max(nominal - biayaAdmin, 0))}</span>
							</div>
							<div className="flex items-center justify-between text-xs text-slate-500">
								<span>Biaya Admin</span>
								<span>IDRX {numberId.format(biayaAdmin)}</span>
							</div>
						</div>

						<button
							type="submit"
							className="w-full rounded-lg bg-linear-to-r from-cyan-600 to-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-900/30 transition hover:from-cyan-500 hover:to-teal-500"
						>
							Tarik Dana
						</button>
					</div>
				</form>

				{snackbar && (
					<div className="fixed bottom-6 right-6 rounded-lg bg-slate-900 border border-slate-700 px-4 py-3 text-sm text-slate-100 shadow-xl shadow-black/40">
						{snackbar}
					</div>
				)}
			</div>
		</div>
	);
}
