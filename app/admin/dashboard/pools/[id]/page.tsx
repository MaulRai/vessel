'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { DashboardLayout } from '@/lib/components/DashboardLayout';
import { adminAPI, FundingPool } from '@/lib/api/admin';

export default function AdminPoolDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const [pool, setPool] = useState<FundingPool | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPool = async () => {
            try {
                // Admin API uses same endpoint structure for detail generally, or specialized. 
                // Reusing pool list structure or creating dedicated getPool needed?
                // FundingService has get_pool public. adminAPI doesn't explicit expose getPoolById admin-side yet?
                // Actually adminAPI.getAllPools is list. We need getPoolDetail.
                // Let's check api/admin.ts again. It has getAllPools but maybe not getPool(id).
                // Wait, 'getPoolDetail' exists in backend handlers/funding.rs but mapped to /marketplace/{id}/detail.
                // Admin likely needs full visibility. 
                // For now, I can use the public /api/v1/pools/{id} which provides public data, 
                // assuming admin token allows access or it's public. 
                // Actually, backend has `get_pool` at `/api/v1/pools/{id}`. Let's use a simple fetch or extend adminAPI.

                // Extending logic locally for now or assuming we can fetch generic pool info.
                // adminAPI doesn't have getPool(id). I'll use a direct fetch or assume I should add it.
                // Given complexity, I will try to fetch from the public endpoint for now as it contains most info.
                const token = localStorage.getItem('vessel_access_token');
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/pools/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await res.json();
                if (data.success) {
                    setPool(data.data.pool); // response wrapper might vary, checking backend structure
                    // Backend `get_pool` returns `FundingPoolResponse` which has `pool`, `invoice` etc. 
                    // Let's assume data.data is the response object.

                    // Actually, backend: `Ok(HttpResponse::Ok().json(ApiResponse::success(pool, ...)))`
                    // `get_pool` returns `FundingPoolResponse`.
                    // So data.data IS FundingPoolResponse.
                    // My state expects `FundingPool`. The response wraps it.
                    if (data.data.pool) {
                        setPool({
                            ...data.data.pool,
                            invoice: data.data.invoice,
                            // calculate percentages locally or use response
                            priority_percentage_funded: data.data.priority_percentage_funded,
                            catalyst_percentage_funded: data.data.catalyst_percentage_funded
                        });
                    }
                }
            } catch (err) {
                console.error('Failed to load pool', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPool();
    }, [id]);

    if (loading) {
        return (
            <DashboardLayout role="admin">
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (!pool) {
        return (
            <DashboardLayout role="admin">
                <div className="text-center py-20">
                    <h2 className="text-xl text-slate-300">Pool tidak ditemukan</h2>
                    <Link href="/admin/dashboard/pools" className="text-cyan-400 hover:text-cyan-300 mt-4 inline-block">
                        Kembali ke Daftar
                    </Link>
                </div>
            </DashboardLayout>
        );
    }

    const priorityPct = pool.priority_target > 0 ? (pool.priority_funded / pool.priority_target) * 100 : 0;
    const catalystPct = pool.catalyst_target > 0 ? (pool.catalyst_funded / pool.catalyst_target) * 100 : 0;
    const totalPct = pool.target_amount > 0 ? (pool.funded_amount / pool.target_amount) * 100 : 0;

    return (
        <DashboardLayout role="admin">
            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <Link href="/admin/dashboard/pools" className="text-slate-400 hover:text-slate-200 text-sm mb-2 inline-flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Kembali
                        </Link>
                        <h1 className="text-3xl font-bold text-slate-50 flex items-center gap-3">
                            Funding Pool #{pool.id.slice(0, 8)}
                            <span className={`text-base px-3 py-1 rounded-full border ${pool.status === 'open' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                                pool.status === 'filled' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                                    'bg-slate-700/50 text-slate-400 border-slate-600'
                                }`}>
                                {pool.status.toUpperCase()}
                            </span>
                        </h1>
                    </div>

                    <div className="flex gap-3">
                        {pool.status === 'filled' && (
                            <button
                                onClick={() => { adminAPI.disbursePool(pool.id).then(() => window.location.reload()) }}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors"
                            >
                                Disburse Funds
                            </button>
                        )}
                        {pool.status === 'open' && (
                            <button
                                onClick={() => { if (confirm('Are you sure you want to close this pool?')) adminAPI.closePool(pool.id).then(() => window.location.reload()) }}
                                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-medium transition-colors"
                            >
                                Close Pool
                            </button>
                        )}
                    </div>
                </div>

                {/* Progress Overview */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                    <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-6">Funding Progress</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-slate-300">Total Funded</span>
                                <span className="text-emerald-400 font-mono">{totalPct.toFixed(1)}%</span>
                            </div>
                            <p className="text-3xl font-bold text-slate-50 font-mono">
                                {pool.pool_currency} {pool.funded_amount.toLocaleString()}
                                <span className="text-sm text-slate-500 font-normal ml-2">/ {pool.target_amount.toLocaleString()}</span>
                            </p>
                            <div className="w-full bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
                                <div className="bg-emerald-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${totalPct}%` }} />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-cyan-300">Priority Tranche (Senior)</span>
                                <span className="text-cyan-400 font-mono">{priorityPct.toFixed(1)}%</span>
                            </div>
                            <p className="text-2xl font-bold text-slate-200 font-mono">
                                {pool.priority_funded.toLocaleString()}
                                <span className="text-xs text-slate-500 font-normal ml-2">/ {pool.priority_target.toLocaleString()}</span>
                            </p>
                            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
                                <div className="bg-cyan-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${priorityPct}%` }} />
                            </div>
                            <p className="text-xs text-slate-500 mt-2">Interest: {pool.priority_interest_rate}% p.a.</p>
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-violet-300">Catalyst Tranche (Junior)</span>
                                <span className="text-violet-400 font-mono">{catalystPct.toFixed(1)}%</span>
                            </div>
                            <p className="text-2xl font-bold text-slate-200 font-mono">
                                {pool.catalyst_funded.toLocaleString()}
                                <span className="text-xs text-slate-500 font-normal ml-2">/ {pool.catalyst_target.toLocaleString()}</span>
                            </p>
                            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
                                <div className="bg-violet-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${catalystPct}%` }} />
                            </div>
                            <p className="text-xs text-slate-500 mt-2">Interest: {pool.catalyst_interest_rate}% p.a.</p>
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Pool Details</h3>
                        <dl className="space-y-4">
                            <div className="flex justify-between py-2 border-b border-slate-800/50">
                                <dt className="text-slate-400">Created At</dt>
                                <dd className="text-slate-200">{new Date(pool.created_at).toLocaleString('id-ID')}</dd>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-800/50">
                                <dt className="text-slate-400">Opened At</dt>
                                <dd className="text-slate-200">{pool.opened_at ? new Date(pool.opened_at).toLocaleString('id-ID') : '-'}</dd>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-800/50">
                                <dt className="text-slate-400">Deadline</dt>
                                <dd className="text-slate-200">{pool.deadline ? new Date(pool.deadline).toLocaleDateString('id-ID') : '-'}</dd>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-800/50">
                                <dt className="text-slate-400">Investor Count</dt>
                                <dd className="text-slate-200">{pool.investor_count}</dd>
                            </div>
                        </dl>
                    </div>

                    {pool.invoice && (
                        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 h-fit">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Underlying Invoice</h3>
                                <Link href={`/admin/dashboard/invoices/${pool.invoice_id}`} className="text-xs text-cyan-400 hover:underline">
                                    View Invoice
                                </Link>
                            </div>
                            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                                <p className="text-lg font-bold text-slate-200">{pool.invoice.invoice_number}</p>
                                <p className="text-sm text-slate-400 mb-3">{pool.invoice.buyer_name}</p>
                                <div className="flex gap-2">
                                    <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300">
                                        {pool.invoice.currency} {pool.invoice.amount.toLocaleString()}
                                    </span>
                                    <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300">
                                        Due: {new Date(pool.invoice.due_date).toLocaleDateString('id-ID')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
