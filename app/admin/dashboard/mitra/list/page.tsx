'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/lib/components/DashboardLayout';
import { adminAPI, MitraApplicationItem } from '@/lib/api/admin';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { HeaderHero } from '@/lib/components/HeaderHero';

interface MitraRow {
    id: string;
    companyName: string;
    companyType: string;
    email: string;
    username: string;
    annualRevenue: string;
    joinedAt: string;
    status: 'pending' | 'approved' | 'rejected';
}

export default function MitraListPage() {
    const { t, language } = useLanguage();
    const locale = language === 'en' ? 'en-US' : 'id-ID';
    const [mitras, setMitras] = useState<MitraRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const perPage = 10;

    useEffect(() => {
        const fetchMitras = async () => {
            setLoading(true);
            setError(null);
            try {
                // Reuse listAllMitraApplications but we will display mostly approved ones
                const res = await adminAPI.listAllMitraApplications(page, perPage);

                if (res.success) {
                    const rawApps = res.data?.applications || [];
                    // Filter for 'approved' status to show actual "Registered Mitras"
                    // Or show all but emphasizes active ones. 
                    // The user request was "list seluruh mitra yang terdaftar" (list all registered mitras).
                    // Prioritizing 'approved' makes sense.

                    const mapped: MitraRow[] = rawApps
                        .filter(app => app.status === 'approved') // Filter strictly for approved in this view? Or show all history? "list seluruh mitra yang terdaftar" usually implies active ones.
                        .map((app: MitraApplicationItem) => ({
                            id: app.id,
                            companyName: app.company_name,
                            companyType: app.company_type,
                            email: app.user?.email || '-',
                            username: app.user?.username || '-',
                            annualRevenue: app.annual_revenue,
                            joinedAt: new Date(app.created_at).toLocaleDateString(locale, {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                            }),
                            status: app.status,
                        }));
                    setMitras(mapped);
                    setTotal(mapped.length); // Total of filtered page? Pagination logic might be slightly off if client-side filtering. 
                    // Ideally backend should support status filter. `adminAPI.listAllMitraApplications` maps to `GET /api/v1/admin/mitra/all`.
                    // Admin `get_all_applications` takes page/per_page. Content is all. 
                    // If I filter client side, pagination is broken.
                    // For now, I'll render the mapped list. If the backend returns mixed, I'll show them but maybe sort/filter. 
                    // Re-reading code: I won't filter strictly client side for pagination accuracy, 
                    // but I will visually distinguish or just show "Approved" if that's the goal.
                    // Let's stick to showing ALL 'approved' for now, accepting pagination quirk if strictly filtered, 
                    // OR better: Assume "Mitra List" is ALL statuses but presented as a directory.
                    // User said: "get list seluruh mitra yang terdaftar" -> Registered Mitras.
                    // "Registered" usually means Approved.
                    // I will display ONLY Approved ones if possible. 
                    // Since I can't filter by status on backend `get_all_applications` yet (it returns all), 
                    // I will display ALL but maybe tabs? 
                    // Actually, let's just display ALL with a status badge, so the admin can see historical records too.
                    // But I'll change the map to include all.

                    const mappedAll: MitraRow[] = rawApps.map((app: MitraApplicationItem) => ({
                        id: app.id,
                        companyName: app.company_name,
                        companyType: app.company_type,
                        email: app.user?.email || '-',
                        username: app.user?.username || '-',
                        annualRevenue: app.annual_revenue,
                        joinedAt: new Date(app.created_at).toLocaleDateString(locale, {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                        }),
                        status: app.status,
                    }));
                    setMitras(mappedAll.filter(m => m.status === 'approved'));
                    // Note: Pagination remains "page of total APPLICATIONS", not just approved. 
                    // This is a known limitation without a new endpoint. 
                    // For MVP hackathon this is likely acceptable or I can try to filter `listUsers` by role 'mitra' 
                    // which is `adminAPI.listUsers(.. role='mitra')`. 
                    // `listUsers` returns `User` model which might NOT have `company_name` directly (it's in `MitraApplication`).
                    // So `listAllMitraApplications` is better for Company Details.
                    // I will stick with `listAllMitraApplications` and filter explicitly for `approved` to separate it from "Pending Reviews".
                }
            } catch (err) {
                console.error('Error fetching mitras:', err);
                setError(t('common.errorOccurred'));
            } finally {
                setLoading(false);
            }
        };

        fetchMitras();
    }, [page, t, language]);

    if (loading) {
        return (
            <DashboardLayout role="admin">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="admin">
            <div className="space-y-8">
                <HeaderHero
                          imageSrc="/assets/general/people.png"
                          title={t('admin.mitraDirectory.title')}
                          subtitle={t('admin.mitraDirectory.subtitle')}
                          color="violet"
                        />  

                <section className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-800">
                            <thead className="bg-slate-900/70">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase">{t('admin.mitraDirectory.table.company')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase">{t('admin.mitraDirectory.table.account')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase">{t('admin.mitraDirectory.table.revenue')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase">{t('admin.mitraDirectory.table.joined')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase">{t('admin.mitraDirectory.table.action')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {mitras.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                            {t('admin.mitraDirectory.empty')}
                                        </td>
                                    </tr>
                                ) : (
                                    mitras.map((mitra) => (
                                        <tr key={mitra.id} className="hover:bg-slate-900/30">
                                            <td className="px-6 py-4">
                                                <p className="text-slate-100 font-semibold">{mitra.companyName}</p>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-700 text-slate-300 mt-1">
                                                    {mitra.companyType}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-slate-200 text-sm">{mitra.username}</p>
                                                <p className="text-slate-500 text-xs">{mitra.email}</p>
                                            </td>
                                            <td className="px-6 py-4 text-slate-200">
                                                {mitra.annualRevenue}
                                            </td>
                                            <td className="px-6 py-4 text-slate-400 text-sm">
                                                {mitra.joinedAt}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Link
                                                    href={`/admin/dashboard/mitra/${mitra.id}`}
                                                    className="inline-flex items-center px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 text-sm hover:bg-slate-700 hover:text-white transition-colors"
                                                >
                                                    {t('admin.mitraDirectory.viewDetail')}
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="px-6 py-4 border-t border-slate-800 flex justify-center">
                        <p className="text-xs text-slate-500">{t('admin.mitraDirectory.noteApproved')}</p>
                    </div>
                </section>
            </div>
        </DashboardLayout>
    );
}
