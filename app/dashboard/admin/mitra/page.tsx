'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/lib/components/DashboardLayout';
import { adminAPI } from '@/lib/api/admin';

interface MitraApplicationItem {
    id: string;
    user_id: string;
    company_name: string;
    company_type: string;
    status: string;
    created_at: string;
}

interface Toast {
    message: string;
    type: 'success' | 'error' | 'info';
}

export default function AdminMitraPage() {
    const [applications, setApplications] = useState<MitraApplicationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [toast, setToast] = useState<Toast | null>(null);
    const [confirmModal, setConfirmModal] = useState<{ id: string; action: 'approve' | 'reject' } | null>(null);
    const [rejectReason, setRejectReason] = useState('');

    useEffect(() => {
        fetchApplications();
    }, []);

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const fetchApplications = async () => {
        try {
            const res = await adminAPI.listMitraApplications();
            if (res.success && res.data) {
                setApplications(res.data.applications || []);
            } else {
                setApplications([]);
            }
        } catch (error) {
            console.error('Failed to fetch applications', error);
            setApplications([]);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!confirmModal) return;
        setProcessingId(confirmModal.id);
        try {
            const res = await adminAPI.approveMitra(confirmModal.id);
            if (res.success) {
                setToast({ message: 'Application approved successfully!', type: 'success' });
                fetchApplications();
            } else {
                setToast({ message: res.error?.message || 'Failed to approve', type: 'error' });
            }
        } catch (error) {
            setToast({ message: 'Error processing request', type: 'error' });
        } finally {
            setProcessingId(null);
            setConfirmModal(null);
        }
    };

    const handleReject = async () => {
        if (!confirmModal || !rejectReason.trim()) {
            setToast({ message: 'Rejection reason is required', type: 'error' });
            return;
        }
        setProcessingId(confirmModal.id);
        try {
            const res = await adminAPI.rejectMitra(confirmModal.id, rejectReason);
            if (res.success) {
                setToast({ message: 'Application rejected', type: 'success' });
                fetchApplications();
            } else {
                setToast({ message: res.error?.message || 'Failed to reject', type: 'error' });
            }
        } catch (error) {
            setToast({ message: 'Error processing request', type: 'error' });
        } finally {
            setProcessingId(null);
            setConfirmModal(null);
            setRejectReason('');
        }
    };

    return (
        <DashboardLayout role="admin">
            <div className="space-y-6">
                {/* Toast Notification */}
                {toast && (
                    <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg border backdrop-blur-sm transition-all animate-in fade-in slide-in-from-top-2 ${toast.type === 'success' ? 'bg-green-500/20 border-green-500/30 text-green-400' :
                            toast.type === 'error' ? 'bg-red-500/20 border-red-500/30 text-red-400' :
                                'bg-blue-500/20 border-blue-500/30 text-blue-400'
                        }`}>
                        <div className="flex items-center space-x-2">
                            {toast.type === 'success' && (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                            {toast.type === 'error' && (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                            <span className="font-medium">{toast.message}</span>
                        </div>
                    </div>
                )}

                {/* Confirmation Modal */}
                {confirmModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
                            <h3 className="text-lg font-semibold text-white mb-2">
                                {confirmModal.action === 'approve' ? 'Approve Application' : 'Reject Application'}
                            </h3>
                            <p className="text-slate-400 text-sm mb-4">
                                {confirmModal.action === 'approve'
                                    ? 'Are you sure you want to approve this mitra application? The user will be granted mitra privileges.'
                                    : 'Please provide a reason for rejecting this application.'}
                            </p>
                            {confirmModal.action === 'reject' && (
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Enter rejection reason..."
                                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all mb-4"
                                    rows={3}
                                />
                            )}
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => { setConfirmModal(null); setRejectReason(''); }}
                                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmModal.action === 'approve' ? handleApprove : handleReject}
                                    disabled={processingId !== null}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${confirmModal.action === 'approve'
                                            ? 'bg-green-500 hover:bg-green-400 text-white'
                                            : 'bg-red-500 hover:bg-red-400 text-white'
                                        }`}
                                >
                                    {processingId ? 'Processing...' : confirmModal.action === 'approve' ? 'Approve' : 'Reject'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div>
                    <h1 className="text-2xl font-bold text-white">Review Mitra Applications</h1>
                    <p className="text-slate-400 mt-1">Approve or reject pending mitra applications</p>
                </div>

                <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-400 mx-auto"></div>
                        </div>
                    ) : !applications || applications.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">
                            No pending applications found.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-slate-400 text-sm border-b border-slate-700/50 bg-slate-800/50">
                                        <th className="px-6 py-3 font-medium">Company</th>
                                        <th className="px-6 py-3 font-medium">Type</th>
                                        <th className="px-6 py-3 font-medium">Applied At</th>
                                        <th className="px-6 py-3 font-medium">Status</th>
                                        <th className="px-6 py-3 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/50">
                                    {applications.map((app) => (
                                        <tr key={app.id} className="hover:bg-slate-700/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="text-white font-medium">{app.company_name}</p>
                                                <p className="text-xs text-slate-400">ID: {app.id.substring(0, 8)}...</p>
                                            </td>
                                            <td className="px-6 py-4 text-slate-300">{app.company_type}</td>
                                            <td className="px-6 py-4 text-slate-400">
                                                {new Date(app.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 bg-yellow-500/10 text-yellow-400 rounded text-xs font-medium border border-yellow-500/20">
                                                    {app.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <button
                                                    onClick={() => setConfirmModal({ id: app.id, action: 'approve' })}
                                                    disabled={processingId === app.id}
                                                    className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm font-medium transition-colors border border-green-500/30"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => setConfirmModal({ id: app.id, action: 'reject' })}
                                                    disabled={processingId === app.id}
                                                    className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-colors border border-red-500/30"
                                                >
                                                    Reject
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
