"use client";

import { ReactNode, useMemo, useState } from "react";
import { AuthGuard } from "@/lib/components/AuthGuard";
import { DashboardLayout } from "@/lib/components/DashboardLayout";

type BankCode = "BCA" | "Mandiri" | "BNI";
type StatTone = "cyan" | "amber" | "rose" | "emerald";
type BadgeTone = "amber" | "slate" | "emerald";

const numberId = new Intl.NumberFormat("id-ID");

const activeInvoice = {
	code: "INV/PND/2026/001",
	buyer: "PT Samudra Niaga Sejahtera",
	product: "Kakao Beans Q1",
	tenor: 24,
	dueDate: "24 Jan 2026",
	principal: 150_000_000,
	profitShare: 4_500_000,
	bankAccounts: {
		BCA: "3908 8833 1199 00",
		Mandiri: "8877 0011 2300 55",
		BNI: "8068 1112 4455 99",
	},
};

const history = [
	{
		code: "INV/PND/2025/118",
		buyer: "PT Arunika Bahari",
		product: "Crude Palm Oil",
		principal: 120_000_000,
		profitShare: 3_100_000,
		status: "Selesai",
		settledAt: "12 Des 2025",
	},
	{
		code: "INV/PND/2025/119",
		buyer: "PT Sagara Timur",
		product: "Vanila Beans",
		principal: 98_000_000,
		profitShare: 2_800_000,
		status: "Dicairkan",
		settledAt: "18 Des 2025",
	},
];

function PendanaanEksportirContent() {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [modalStep, setModalStep] = useState<"ringkasan" | "va">("ringkasan");
	const [selectedBank, setSelectedBank] = useState<BankCode>("BCA");
	const [copied, setCopied] = useState(false);

	const totalBayar = useMemo(
		() => activeInvoice.principal + activeInvoice.profitShare,
		[]
	);

	const vaNumber = activeInvoice.bankAccounts[selectedBank];

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(vaNumber.replace(/\s/g, ""));
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		} catch (err) {
			console.error("Copy VA failed", err);
		}
	};

	const closeModal = () => {
		setIsModalOpen(false);
		setModalStep("ringkasan");
	};

	return (
		<DashboardLayout role="mitra">
			<div className="px-4 py-10 text-slate-100">
			<div className="mx-auto flex max-w-6xl flex-col gap-8">
				<header className="space-y-2">
					<p className="text-sm font-semibold tracking-wide text-cyan-300/80">
						Eksportir • Pendanaan
					</p>
					<h1 className="text-3xl font-bold text-slate-50">
						Kelola Pendanaan Aktif
					</h1>
					<p className="max-w-3xl text-sm text-slate-400">
						Pantau status pendanaan, lanjutkan pembayaran bagi hasil, dan simpan
						bukti transfer dari Virtual Account.
					</p>
				</header>

				<section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<StatCard
						label="Invoice Aktif"
						value="1"
						badge="On Progress"
						tone="cyan"
					/>
					<StatCard
						label="Outstanding Pokok"
						value={`Rp ${numberId.format(activeInvoice.principal)}`}
						badge="Belum Dibayar"
						tone="amber"
					/>
					<StatCard
						label="Bagi Hasil"
						value={`Rp ${numberId.format(activeInvoice.profitShare)}`}
						badge="Jatuh Tempo"
						tone="rose"
					/>
					<StatCard
						label="Riwayat Lunas"
						value={`${history.length}`}
						badge="Terakhir Des 2025"
						tone="emerald"
					/>
				</section>

				<section className="grid gap-6 lg:grid-cols-3">
					<div className="lg:col-span-2 space-y-6">
						<section className="rounded-2xl border border-slate-800/80 bg-slate-950/40 p-4 shadow-inner shadow-black/20">
							<div className="mb-3 flex items-center justify-between">
								<div>
									<p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">Daftar Invoice Aktif</p>
									<p className="text-sm text-slate-500">Kartu berikutnya akan muncul di bawah</p>
								</div>
							</div>

							<div className="flex flex-col gap-4" style={{ minHeight: "520px" }}>
								<article className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-lg shadow-black/20">
									<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
										<div>
											<p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">
												Invoice Aktif
											</p>
											<h2 className="mt-2 text-xl font-bold text-slate-50">
												{activeInvoice.code}
											</h2>
											<p className="text-sm text-slate-400">
												{activeInvoice.buyer} • {activeInvoice.product}
											</p>
										</div>
										<div className="flex flex-wrap items-center gap-2">
											<Badge tone="amber">Jatuh tempo {activeInvoice.dueDate}</Badge>
											<Badge tone="slate">{activeInvoice.tenor} hari tersisa</Badge>
										</div>
									</div>

									<div className="mt-6 grid gap-4 sm:grid-cols-3">
										<Metric label="Pokok" value={`Rp ${numberId.format(activeInvoice.principal)}`} />
										<Metric
											label="Bagi Hasil"
											value={`Rp ${numberId.format(activeInvoice.profitShare)}`}
											note="Fixed return"
										/>
										<Metric
											label="Total Bayar"
											value={`Rp ${numberId.format(totalBayar)}`}
											note="Ditutup di VA"
										/>
									</div>

									<div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
										<div className="space-y-1 text-sm text-slate-400">
											<p>Metode pembayaran: Virtual Account (BCA/Mandiri/BNI).</p>
											<p className="text-slate-500">
												Transaksi langsung pada VA; aplikasi tidak memproses dana.
											</p>
										</div>
										<button
											onClick={() => setIsModalOpen(true)}
											className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-cyan-600 to-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-900/30 transition hover:from-cyan-500 hover:to-teal-500"
										>
											Bayar Pendanaan
										</button>
									</div>
								</article>

							</div>
						</section>

						<article className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
							<div className="flex items-center justify-between">
								<div>
									<h3 className="text-lg font-semibold text-slate-100">Aktivitas</h3>
									<p className="text-sm text-slate-400">Catatan terkini pendanaan</p>
								</div>
								<span className="text-xs text-slate-500">24h terakhir</span>
							</div>
							<ul className="mt-4 space-y-3">
								<TimelineItem
									title="Penagihan VA diterbitkan"
									description="Sistem mengirim detail VA untuk pembayaran bagi hasil."
									time="Baru saja"
								/>
								<TimelineItem
									title="Invoice diverifikasi"
									description="Dokumen komersial disetujui dan siap dibayar."
									time="6 jam lalu"
								/>
								<TimelineItem
									title="Status Open for Investment"
									description="Dana dari pendana terserap 100%."
									time="Kemarin"
								/>
							</ul>
						</article>
					</div>

					<aside className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-semibold text-slate-100">Riwayat Pendanaan</h3>
							<span className="text-xs text-slate-500">Closed</span>
						</div>
						<div className="space-y-3">
							{history.map((item) => (
								<div
									key={item.code}
									className="rounded-xl border border-slate-800 bg-slate-950/40 p-4"
								>
									<div className="flex items-start justify-between">
										<div>
											<p className="text-sm font-semibold text-slate-100">
												{item.code}
											</p>
											<p className="text-xs text-slate-400">
												{item.buyer} • {item.product}
											</p>
										</div>
										<Badge tone="emerald">{item.status}</Badge>
									</div>
									<div className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-300">
										<div>
											<p className="text-slate-500">Pokok</p>
											<p className="font-semibold">
												Rp {numberId.format(item.principal)}
											</p>
										</div>
										<div>
											<p className="text-slate-500">Bagi Hasil</p>
											<p className="font-semibold">
												Rp {numberId.format(item.profitShare)}
											</p>
										</div>
									</div>
									<p className="mt-2 text-xs text-slate-500">
										Dicairkan: {item.settledAt}
									</p>
								</div>
							))}
						</div>
					</aside>
				</section>
			</div>

			{isModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur">
					<div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl shadow-black/50">
						<div className="flex items-start justify-between border-b border-slate-800 px-6 py-4">
							<div>
								<p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Pembayaran</p>
								<h3 className="text-xl font-semibold text-slate-50">
									{modalStep === "ringkasan" ? "Rincian Pendanaan" : "Virtual Account"}
								</h3>
								<p className="text-sm text-slate-400">{activeInvoice.code}</p>
							</div>
							<button
								onClick={closeModal}
								className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300 hover:bg-slate-700"
							>
								Tutup
							</button>
						</div>

						{modalStep === "ringkasan" && (
							<div className="space-y-6 px-6 py-6">
								<div className="grid gap-4 sm:grid-cols-2">
									<PaymentRow label="Total Bayar" value={`Rp ${numberId.format(totalBayar)}`} highlight />
								</div>

								<div className="space-y-3">
									<p className="text-sm font-semibold text-slate-200">Pilih Virtual Account</p>
									<div className="grid gap-3 sm:grid-cols-3">
										{(["BCA", "Mandiri", "BNI"] as BankCode[]).map((bank) => (
											<button
												key={bank}
												onClick={() => setSelectedBank(bank)}
												className={`flex h-full flex-col rounded-xl border p-4 text-left transition hover:border-cyan-600/60 hover:bg-cyan-900/10 ${
													selectedBank === bank
														? "border-cyan-500 bg-cyan-900/20 shadow-lg shadow-cyan-900/30"
														: "border-slate-800 bg-slate-950/60"
												}`}
											>
												<p className="text-sm font-semibold text-slate-50">{bank}</p>
												<p className="text-xs text-slate-400">Transfer VA otomatis</p>
											</button>
										))}
									</div>
								</div>

								<div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
									<button
										onClick={closeModal}
										className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-slate-600"
									>
										Batal
									</button>
									<button
										onClick={() => setModalStep("va")}
										className="rounded-lg bg-gradient-to-r from-cyan-600 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-900/30 transition hover:from-cyan-500 hover:to-teal-500"
									>
										Lanjutkan
									</button>
								</div>
							</div>
						)}

						{modalStep === "va" && (
							<div className="space-y-6 px-6 py-6">
								<div className="rounded-xl border border-slate-800 bg-slate-950/50 p-5">
									<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
										<div>
											<p className="text-sm text-slate-400">Virtual Account</p>
											<p className="text-lg font-semibold text-slate-50">{selectedBank}</p>
										</div>
										<button
											onClick={() => setModalStep("ringkasan")}
											className="text-sm font-semibold text-cyan-300 hover:text-cyan-200"
										>
											Ganti Metode
										</button>
									</div>

									<div className="mt-4 grid gap-4 sm:grid-cols-2">
										<div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
											<p className="text-xs text-slate-500">Nomor VA</p>
											<div className="mt-1 flex items-center justify-between gap-3">
												<p className="text-lg font-mono font-semibold text-slate-100">
													{vaNumber}
												</p>
												<button
													onClick={handleCopy}
													className="rounded-lg border border-cyan-500/40 px-3 py-1.5 text-xs font-semibold text-cyan-200 hover:bg-cyan-900/30"
												>
													{copied ? "Disalin" : "Salin Nomor"}
												</button>
											</div>
										</div>
										<div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
											<p className="text-xs text-slate-500">Total Nominal</p>
											<p className="mt-1 text-xl font-semibold text-slate-50">
												Rp {numberId.format(totalBayar)}
											</p>
											<p className="text-xs text-slate-500">Nilai tertutup, tidak dapat diubah</p>
										</div>
									</div>

									<div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
										<div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3">
											<div className="h-10 w-10 rounded-full bg-cyan-900/60 ring-1 ring-cyan-700/60" />
											<div>
												<p className="text-sm font-semibold text-slate-100">Timer Pembayaran</p>
												<p className="text-xs text-slate-400">Selesaikan dalam 24:00:00</p>
											</div>
										</div>
										<div className="text-xs text-slate-500">
											Transfer hanya dari rekening atas nama eksportir terdaftar.
										</div>
									</div>
								</div>

								<div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
									<button
										onClick={closeModal}
										className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-slate-600"
									>
										Tutup
									</button>
									<button
										onClick={closeModal}
										className="rounded-lg bg-gradient-to-r from-emerald-600 to-cyan-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 transition hover:from-emerald-500 hover:to-cyan-500"
									>
										Saya Sudah Transfer
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			)}
			</div>
		</DashboardLayout>
	);
}

export default function PendanaanEksportirPage() {
	return (
		<AuthGuard allowedRoles={["mitra"]}>
			<PendanaanEksportirContent />
		</AuthGuard>
	);
}

function StatCard({
	label,
	value,
	badge,
	tone,
}: {
	label: string;
	value: string;
	badge?: string;
	tone: StatTone;
}) {
	const toneClass: Record<StatTone, string> = {
		cyan: "text-cyan-300 bg-cyan-500/10 border-cyan-500/30",
		amber: "text-amber-300 bg-amber-500/10 border-amber-500/30",
		rose: "text-rose-300 bg-rose-500/10 border-rose-500/30",
		emerald: "text-emerald-300 bg-emerald-500/10 border-emerald-500/30",
	};

	return (
		<div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 shadow-inner shadow-black/10">
			<p className="text-sm text-slate-400">{label}</p>
			<p className="mt-2 text-2xl font-bold text-slate-50">{value}</p>
			{badge && (
				<span
					className={`mt-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${toneClass[tone]}`}
				>
					{badge}
				</span>
			)}
		</div>
	);
}

function Metric({ label, value, note }: { label: string; value: string; note?: string }) {
	return (
		<div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
			<p className="text-xs text-slate-500">{label}</p>
			<p className="mt-1 text-lg font-semibold text-slate-100">{value}</p>
			{note && <p className="text-xs text-slate-500">{note}</p>}
		</div>
	);
}

function Badge({ children, tone }: { children: ReactNode; tone: BadgeTone }) {
	const toneClass: Record<BadgeTone, string> = {
		amber: "bg-amber-500/15 text-amber-200 border border-amber-500/40",
		slate: "bg-slate-500/10 text-slate-200 border border-slate-700",
		emerald: "bg-emerald-500/15 text-emerald-200 border border-emerald-500/40",
	};

	return (
		<span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${toneClass[tone]}`}>
			{children}
		</span>
	);
}

function TimelineItem({
	title,
	description,
	time,
}: {
	title: string;
	description: string;
	time: string;
}) {
	return (
		<li className="flex gap-3">
			<span className="mt-1 h-2 w-2 rounded-full bg-cyan-400" />
			<div className="space-y-1">
				<p className="text-sm font-semibold text-slate-100">{title}</p>
				<p className="text-sm text-slate-400">{description}</p>
				<p className="text-xs text-slate-500">{time}</p>
			</div>
		</li>
	);
}

function PaymentRow({
	label,
	value,
	highlight,
}: {
	label: string;
	value: string;
	highlight?: boolean;
}) {
	return (
		<div
			className={`rounded-lg border p-4 ${
				highlight
					? "border-cyan-500/50 bg-cyan-900/20"
					: "border-slate-800 bg-slate-950/50"
			}`}
		>
			<p className="text-xs text-slate-500">{label}</p>
			<p className="mt-1 text-lg font-semibold text-slate-100">{value}</p>
		</div>
	);
}
