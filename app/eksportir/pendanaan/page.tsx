"use client";

import { ReactNode, useEffect, useState } from "react";
import { AuthGuard } from "@/lib/components/AuthGuard";
import { DashboardLayout } from "@/lib/components/DashboardLayout";
import { mitraAPI, MitraPoolSummary, MitraInvoice } from "@/lib/api/mitra";

type StatTone = "cyan" | "amber" | "rose" | "emerald";
type BadgeTone = "amber" | "slate" | "emerald" | "cyan";

const numberId = new Intl.NumberFormat("id-ID");

function PendanaanEksportirContent() {
	const [pools, setPools] = useState<MitraPoolSummary[]>([]);
	const [invoices, setInvoices] = useState<MitraInvoice[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedPool, setSelectedPool] = useState<MitraPoolSummary | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [poolsRes, invoicesRes] = await Promise.all([
					mitraAPI.getPools(1, 20),
					mitraAPI.getActiveInvoices(),
				]);

				if (poolsRes.success && poolsRes.data) {
					setPools(poolsRes.data.pools || []);
				}

				if (invoicesRes.success && invoicesRes.data) {
					setInvoices(invoicesRes.data.invoices || []);
				}
			} catch (err) {
				console.error("Failed to fetch pendanaan data", err);
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	const activePools = pools.filter((p) => p.status === "open" || p.status === "filled" || p.status === "disbursed");
	const closedPools = pools.filter((p) => p.status === "closed" || p.status === "repaid");
	const totalFunded = pools.reduce((sum, p) => sum + (p.funded_amount || 0), 0);
	const totalTarget = pools.reduce((sum, p) => sum + (p.target_amount || 0), 0);

	if (loading) {
		return (
			<DashboardLayout role="mitra">
				<div className="flex items-center justify-center min-h-[60vh]">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
				</div>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout role="mitra">
			<div className="px-4 py-10 text-slate-100">
				<div className="mx-auto flex max-w-6xl flex-col gap-8">
					<header className="space-y-2">
						<p className="text-sm font-semibold tracking-wide text-cyan-300/80">
							Eksportir &bull; Pendanaan
						</p>
						<h1 className="text-3xl font-bold text-slate-50">
							Kelola Pendanaan Aktif
						</h1>
						<p className="max-w-3xl text-sm text-slate-400">
							Pantau status pendanaan invoice Anda, lihat detail pool, dan kelola pembayaran.
						</p>
					</header>

					<section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
						<StatCard
							label="Pool Aktif"
							value={String(activePools.length)}
							badge="On Progress"
							tone="cyan"
						/>
						<StatCard
							label="Total Target"
							value={`Rp ${numberId.format(totalTarget)}`}
							badge="Seluruh Pool"
							tone="amber"
						/>
						<StatCard
							label="Total Terdanai"
							value={`Rp ${numberId.format(totalFunded)}`}
							badge={totalTarget > 0 ? `${Math.round((totalFunded / totalTarget) * 100)}%` : '0%'}
							tone="emerald"
						/>
						<StatCard
							label="Pool Selesai"
							value={String(closedPools.length)}
							badge="Closed/Repaid"
							tone="rose"
						/>
					</section>

					<section className="grid gap-6 lg:grid-cols-3">
						<div className="lg:col-span-2 space-y-6">
							<section className="rounded-2xl border border-slate-800/80 bg-slate-950/40 p-4 shadow-inner shadow-black/20">
								<div className="mb-3 flex items-center justify-between">
									<div>
										<p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">Pool Pendanaan Aktif</p>
										<p className="text-sm text-slate-500">Daftar pool yang sedang berjalan</p>
									</div>
								</div>

								<div className="flex flex-col gap-4" style={{ minHeight: "400px" }}>
									{activePools.length === 0 ? (
										<div className="p-8 text-center text-slate-500">
											<p>Belum ada pool pendanaan aktif.</p>
										</div>
									) : (
										activePools.map((pool) => (
											<article
												key={pool.pool_id}
												className={`rounded-2xl border bg-slate-900/50 p-6 shadow-lg shadow-black/20 cursor-pointer transition-all duration-300 ${selectedPool?.pool_id === pool.pool_id
													? 'border-cyan-500/50 ring-1 ring-cyan-500/20 bg-slate-900/80 scale-[1.01]'
													: 'border-slate-800 hover:border-cyan-500/30 hover:bg-slate-900/60'
													}`}
												onClick={() => setSelectedPool(selectedPool?.pool_id === pool.pool_id ? null : pool)}
											>
												<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
													<div>
														<p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">
															Pool Aktif
														</p>
														<h2 className="mt-2 text-xl font-bold text-slate-50">
															{pool.project_title || pool.invoice_number}
														</h2>
														<p className="text-sm text-slate-400">
															{pool.buyer_company_name} &bull; {pool.buyer_country}
														</p>
													</div>
													<div className="flex flex-wrap items-center gap-2">
														<Badge tone="cyan">Grade {pool.grade}</Badge>
														<Badge tone="slate">{pool.tenor_days} hari tenor</Badge>
													</div>
												</div>

												<div className="mt-6 grid gap-4 sm:grid-cols-3">
													<Metric label="Target" value={`Rp ${numberId.format(pool.target_amount)}`} />
													<Metric
														label="Terdanai"
														value={`Rp ${numberId.format(pool.funded_amount)}`}
														note={`${pool.target_amount > 0 ? Math.round((pool.funded_amount / pool.target_amount) * 100) : 0}%`}
													/>
													<Metric
														label="Yield"
														value={`${pool.priority_interest_rate}% - ${pool.catalyst_interest_rate}%`}
														note="Priority - Catalyst"
													/>
												</div>

												<div className="mt-4">
													<div className="flex items-center justify-between text-sm mb-1">
														<span className="text-slate-400">Progress Pendanaan</span>
														<span className="text-cyan-400 font-medium">
															{pool.target_amount > 0 ? Math.round((pool.funded_amount / pool.target_amount) * 100) : 0}%
														</span>
													</div>
													<div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
														<div
															className="bg-gradient-to-r from-cyan-500 to-teal-500 h-2 rounded-full transition-all"
															style={{ width: `${pool.target_amount > 0 ? Math.min((pool.funded_amount / pool.target_amount) * 100, 100) : 0}%` }}
														/>
													</div>
												</div>

												{selectedPool?.pool_id === pool.pool_id && (
													<div className="mt-6 pt-6 border-t border-slate-700/50 animate-in fade-in slide-in-from-top-4 duration-300">
														<h3 className="text-sm font-semibold text-cyan-300 mb-4 uppercase tracking-wider">Detail Pool Pendanaan</h3>
														<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
															<div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
																<p className="text-slate-500 text-xs mb-1">Deadline</p>
																<p className="text-slate-200 font-medium whitespace-nowrap">
																	{pool.deadline ? new Date(pool.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
																</p>
															</div>
															<div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
																<p className="text-slate-500 text-xs mb-1">Status</p>
																<p className="text-slate-200 font-medium capitalize flex items-center gap-2">
																	<span className={`w-2 h-2 rounded-full ${pool.status === 'open' ? 'bg-green-400' : 'bg-slate-400'}`}></span>
																	{pool.status}
																</p>
															</div>
															<div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
																<p className="text-slate-500 text-xs mb-1">Dibuat Pada</p>
																<p className="text-slate-200 font-medium whitespace-nowrap">
																	{pool.created_at ? new Date(pool.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
																</p>
															</div>
															<div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
																<p className="text-slate-500 text-xs mb-1">Total Investor</p>
																<p className="text-slate-200 font-medium">
																	{pool.investor_count || 0} Investor
																</p>
															</div>
														</div>

														<div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
															<div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
																<div className="flex justify-between items-center mb-2">
																	<p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Priority Tranche</p>
																	<span className="text-xs px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded border border-cyan-500/20">Senior</span>
																</div>
																<div className="flex justify-between items-end">
																	<div>
																		<p className="text-2xl font-bold text-slate-200">{pool.priority_interest_rate}%</p>
																		<p className="text-xs text-slate-500">Return Rate</p>
																	</div>
																	<div className="text-right">
																		<p className="text-sm font-medium text-slate-300">Rp {numberId.format(pool.priority_funded || 0)}</p>
																		<p className="text-xs text-slate-500">dari Rp {numberId.format(pool.priority_target || 0)}</p>
																	</div>
																</div>
																<div className="mt-2 w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
																	<div
																		className="bg-cyan-500 h-full rounded-full"
																		style={{ width: `${(pool.priority_target || 0) > 0 ? ((pool.priority_funded || 0) / (pool.priority_target || 0)) * 100 : 0}%` }}
																	/>
																</div>
															</div>

															<div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
																<div className="flex justify-between items-center mb-2">
																	<p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Catalyst Tranche</p>
																	<span className="text-xs px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded border border-purple-500/20">Junior</span>
																</div>
																<div className="flex justify-between items-end">
																	<div>
																		<p className="text-2xl font-bold text-slate-200">{pool.catalyst_interest_rate}%</p>
																		<p className="text-xs text-slate-500">Return Rate</p>
																	</div>
																	<div className="text-right">
																		<p className="text-sm font-medium text-slate-300">Rp {numberId.format(pool.catalyst_funded || 0)}</p>
																		<p className="text-xs text-slate-500">dari Rp {numberId.format(pool.catalyst_target || 0)}</p>
																	</div>
																</div>
																<div className="mt-2 w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
																	<div
																		className="bg-purple-500 h-full rounded-full"
																		style={{ width: `${(pool.catalyst_target || 0) > 0 ? ((pool.catalyst_funded || 0) / (pool.catalyst_target || 0)) * 100 : 0}%` }}
																	/>
																</div>
															</div>
														</div>
													</div>
												)}
											</article>
										))
									)}
								</div>
							</section>

							{invoices.length > 0 && (
								<section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
									<h3 className="text-lg font-semibold text-slate-100 mb-4">Invoice Aktif</h3>
									<div className="overflow-x-auto">
										<table className="w-full">
											<thead>
												<tr className="text-left text-slate-400 text-sm border-b border-slate-700/50">
													<th className="pb-3 font-medium">Invoice</th>
													<th className="pb-3 font-medium">Buyer</th>
													<th className="pb-3 font-medium">Jumlah</th>
													<th className="pb-3 font-medium">Status</th>
												</tr>
											</thead>
											<tbody className="divide-y divide-slate-700/50">
												{invoices.map((inv) => (
													<tr key={inv.id} className="text-sm">
														<td className="py-3 text-cyan-400 font-medium">{inv.invoice_number}</td>
														<td className="py-3 text-slate-200">{inv.buyer_name} ({inv.buyer_country})</td>
														<td className="py-3 text-slate-300">
															{inv.currency} {numberId.format(inv.amount)}
														</td>
														<td className="py-3">
															<span className="px-2 py-1 rounded text-xs font-medium bg-cyan-500/10 text-cyan-400">
																{inv.status}
															</span>
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								</section>
							)}
						</div>

						<aside className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
							<div className="flex items-center justify-between">
								<h3 className="text-lg font-semibold text-slate-100">Pool Selesai</h3>
								<span className="text-xs text-slate-500">Closed</span>
							</div>
							{closedPools.length === 0 ? (
								<div className="p-4 text-center text-slate-500 text-sm">
									Belum ada pool yang selesai.
								</div>
							) : (
								<div className="space-y-3">
									{closedPools.map((pool) => (
										<div
											key={pool.pool_id}
											className="rounded-xl border border-slate-800 bg-slate-950/40 p-4"
										>
											<div className="flex items-start justify-between">
												<div>
													<p className="text-sm font-semibold text-slate-100">
														{pool.project_title || pool.invoice_number}
													</p>
													<p className="text-xs text-slate-400">
														{pool.buyer_company_name} &bull; {pool.buyer_country}
													</p>
												</div>
												<Badge tone="emerald">{pool.status === 'repaid' ? 'Lunas' : 'Selesai'}</Badge>
											</div>
											<div className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-300">
												<div>
													<p className="text-slate-500">Target</p>
													<p className="font-semibold">
														Rp {numberId.format(pool.target_amount)}
													</p>
												</div>
												<div>
													<p className="text-slate-500">Terdanai</p>
													<p className="font-semibold">
														Rp {numberId.format(pool.funded_amount)}
													</p>
												</div>
											</div>
										</div>
									))}
								</div>
							)}
						</aside>
					</section>
				</div>
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
		cyan: "bg-cyan-500/15 text-cyan-200 border border-cyan-500/40",
	};

	return (
		<span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${toneClass[tone]}`}>
			{children}
		</span>
	);
}
