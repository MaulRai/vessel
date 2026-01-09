'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterKredensialPage() {
	const [nik, setNik] = useState('');
	const [fullName, setFullName] = useState('');
	const [bank, setBank] = useState('');
	const [accountNumber, setAccountNumber] = useState('');
	const [ktpFile, setKtpFile] = useState<File | null>(null);
	const [selfieFile, setSelfieFile] = useState<File | null>(null);
	const [message, setMessage] = useState<string | null>(null);
	const router = useRouter();

	const banks = ['BCA', 'Bank Mandiri', 'BRI', 'BNI', 'CIMB Niaga', 'Permata', 'Danamon'];

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (nik.length !== 16) {
			setMessage('NIK harus 16 digit.');
			return;
		}
		if (!ktpFile || !selfieFile) {
			setMessage('Unggah foto KTP dan selfie dengan KTP.');
			return;
		}
		if (!bank || !accountNumber) {
			setMessage('Lengkapi data rekening pencairan dana.');
			return;
		}

		setMessage('Data tersimpan. Lanjutkan ke langkah berikutnya.');
		console.log('Credential submission', { nik, fullName, bank, accountNumber, ktpFile, selfieFile });
		router.push('/login');
	};

	const renderFileName = (file: File | null) => (file ? file.name : 'Belum ada file');

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-10 px-4">
			<div className="max-w-5xl mx-auto space-y-6">
				<div className="flex items-center gap-3 text-sm text-slate-400">
					<Link href="/register" className="text-cyan-400 hover:text-cyan-300 font-semibold">
						Kembali ke pendaftaran
					</Link>
					<span className="text-slate-600">•</span>
					<span>Kredensial & Rekening Pencairan</span>
				</div>

				<header className="space-y-2">
					<p className="text-sm text-cyan-300/80 font-semibold tracking-wide">Langkah selanjutnya</p>
					<h1 className="text-3xl font-bold text-slate-50">Lengkapi kredensial dan rekening pencairan</h1>
					<p className="text-slate-400 max-w-2xl">
						Unggah identitas dan tentukan rekening tujuan pencairan dana. Nama pada identitas harus sesuai dengan nama pemilik rekening.
					</p>
				</header>

				{message && (
					<div className="bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 flex items-center justify-between">
						<span>{message}</span>
						<button onClick={() => setMessage(null)} className="text-slate-400 hover:text-slate-200 text-xs font-semibold">
							Tutup
						</button>
					</div>
				)}

				<form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-2">
					<section className="space-y-4 bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
						<div className="flex items-center justify-between">
							<div>
								<h2 className="text-lg font-semibold text-slate-100">Identitas</h2>
								<p className="text-sm text-slate-400">Unggah KTP dan selfie sesuai identitas.</p>
							</div>
						</div>

						<div className="space-y-3">
							<label className="block text-sm font-medium text-slate-200">Upload foto KTP (JPG/PNG)</label>
							<label className="border border-dashed border-slate-700 rounded-xl p-4 flex justify-between items-center cursor-pointer bg-slate-950/40 hover:border-cyan-600/60">
								<div>
									<p className="text-slate-100 text-sm font-semibold">Pilih file</p>
									<p className="text-xs text-slate-500">{renderFileName(ktpFile)}</p>
								</div>
								<input
									type="file"
									accept="image/*"
									className="hidden"
									onChange={(e) => setKtpFile(e.target.files?.[0] ?? null)}
								/>
								<span className="text-xs text-cyan-300">Unggah</span>
							</label>
						</div>

						<div className="space-y-3">
							<label className="block text-sm font-medium text-slate-200">Selfie dengan KTP (JPG/PNG)</label>
							<label className="border border-dashed border-slate-700 rounded-xl p-4 flex justify-between items-center cursor-pointer bg-slate-950/40 hover:border-cyan-600/60">
								<div>
									<p className="text-slate-100 text-sm font-semibold">Pilih file</p>
									<p className="text-xs text-slate-500">{renderFileName(selfieFile)}</p>
								</div>
								<input
									type="file"
									accept="image/*"
									className="hidden"
									onChange={(e) => setSelfieFile(e.target.files?.[0] ?? null)}
								/>
								<span className="text-xs text-cyan-300">Unggah</span>
							</label>
						</div>

						<div className="grid gap-4 sm:grid-cols-2">
							<div>
								<label htmlFor="nik" className="block text-sm font-medium text-slate-200 mb-2">
									NIK
								</label>
								<input
									id="nik"
									type="text"
									inputMode="numeric"
									maxLength={16}
									value={nik}
									onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
									className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-slate-100 placeholder:text-slate-500"
									placeholder="16 digit NIK"
									required
								/>
							</div>
							<div>
								<label htmlFor="fullName" className="block text-sm font-medium text-slate-200 mb-2">
									Nama lengkap
								</label>
								<input
									id="fullName"
									type="text"
									value={fullName}
									onChange={(e) => setFullName(e.target.value)}
									className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-slate-100 placeholder:text-slate-500"
									placeholder="Sesuai KTP"
									required
								/>
								<p className="text-xs text-slate-500 mt-2">Nama harus sama dengan rekening bank nanti.</p>
							</div>
						</div>
					</section>

					<section className="space-y-4 bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
						<div className="flex items-center justify-between">
							<div>
								<h2 className="text-lg font-semibold text-slate-100">Rekening pencairan dana</h2>
								<p className="text-sm text-slate-400">Pastikan data sesuai dengan pemilik identitas.</p>
							</div>
						</div>

						<div className="grid gap-4 sm:grid-cols-2">
							<div>
								<label htmlFor="bank" className="block text-sm font-medium text-slate-200 mb-2">
									Pilih bank
								</label>
								<select
									id="bank"
									value={bank}
									onChange={(e) => setBank(e.target.value)}
									className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
									required
								>
									<option value="" disabled>
										Pilih bank
									</option>
									{banks.map((name) => (
										<option key={name} value={name}>
											{name}
										</option>
									))}
								</select>
							</div>
							<div>
								<label htmlFor="accountNumber" className="block text-sm font-medium text-slate-200 mb-2">
									Nomor rekening
								</label>
								<input
									id="accountNumber"
									type="text"
									inputMode="numeric"
									value={accountNumber}
									onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
									className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-slate-100 placeholder:text-slate-500"
									placeholder="Masukkan nomor rekening"
									required
								/>
							</div>
						</div>

						<div className="p-4 bg-cyan-950/30 border border-cyan-800/30 rounded-lg text-sm text-slate-100">
							Rekening ini akan menjadi satu-satunya tujuan pencairan dana demi keamanan. Kamu bisa mengubahnya nanti di bagian profile.
						</div>

						<div className="pt-2 flex flex-wrap gap-3">
							<button
								type="submit"
								className="px-5 py-3 rounded-lg bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-semibold hover:from-cyan-500 hover:to-teal-500"
							>
								Simpan & Lanjutkan
							</button>
							<Link href="/" className="px-5 py-3 rounded-lg border border-slate-700 text-slate-200 hover:border-slate-500">
								Nanti saja
							</Link>
						</div>
					</section>
				</form>
			</div>
		</div>
	);
}
