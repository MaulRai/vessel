'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthGuard } from '@/lib/components/AuthGuard';
import { DashboardLayout } from '@/lib/components/DashboardLayout';
import {
  riskQuestionnaireAPI,
  RiskQuestion,
  RiskQuestionnaireStatusResponse,
} from '@/lib/api/user';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { MarketplaceHero } from '@/lib/components/MarketplaceHero';
import Link from 'next/link';
import Image from 'next/image';

const buildDemoQuestions = (t: (key: string) => string): RiskQuestion[] => [
  {
    id: 1,
    question: t('riskAssessment.demoQ1'),
    options: [
      { value: 1, label: t('riskAssessment.demoQ1Opt1') },
      { value: 2, label: t('riskAssessment.demoQ1Opt2') },
      { value: 3, label: t('riskAssessment.demoQ1Opt3') },
    ],
  },
  {
    id: 2,
    question: t('riskAssessment.demoQ2'),
    options: [
      { value: 1, label: t('riskAssessment.demoQ2Opt1') },
      { value: 2, label: t('riskAssessment.demoQ2Opt2') },
    ],
  },
  {
    id: 3,
    question: t('riskAssessment.demoQ3'),
    options: [
      { value: 1, label: t('riskAssessment.demoQ3Opt1') },
      { value: 2, label: t('riskAssessment.demoQ3Opt2') },
    ],
  },
];

function RiskAssessmentContent() {
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const [questions, setQuestions] = useState<RiskQuestion[]>([]);
  // ... (keep state variables)
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<RiskQuestionnaireStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Check existing status first
        const statusRes = await riskQuestionnaireAPI.getStatus();
        if (statusRes.success && statusRes.data) {
          setStatus(statusRes.data);
          if (statusRes.data.completed) {
            // Already completed, redirect to dashboard
            router.push('/pendana/dashboard');
            return;
          }
        }

        // Load questions from API
        const questionsRes = await riskQuestionnaireAPI.getQuestions();
        if (questionsRes.success && questionsRes.data && questionsRes.data.questions.length > 0) {
          setQuestions(questionsRes.data.questions);
        } else {
          // Use demo questions if API fails
          setQuestions(buildDemoQuestions(t));
        }
      } catch {
        // Use demo questions on error
        setQuestions(buildDemoQuestions(t));
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleAnswerSelect = (questionId: number, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentStep <= questions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (tierOverride?: string) => {
    const tier = tierOverride || selectedTier;
    if (!tier) {
      setError(language === 'en' ? 'Please select a tier' : 'Harap pilih tier');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // If quick-select, we might not have answers, use defaults
      const response = await riskQuestionnaireAPI.submit({
        q1_answer: answers[1] || 1,
        q2_answer: answers[2] || 1,
        q3_answer: answers[3] || 1,
        selected_tier: tier,
      });

      if (response.success && response.data) {
        setStatus(response.data);
        // After successful submission, redirect to dashboard if not showing result
        // After successful submission, redirect to dashboard
        router.push('/pendana/dashboard');
      } else {
        setError(response.error?.message || t('riskAssessment.saveError') || 'Gagal menyimpan jawaban');
      }
    } catch {
      setError(t('common.errorOccurred') || 'Terjadi kesalahan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setStatus(null);
    setAnswers({});
    setSelectedTier(null);
    setCurrentStep(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  // If status is completed but we haven't redirected yet, show nothing to avoid flash
  if (status?.completed) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  // Show questionnaire or tier selection
  const isTierSelectionStep = currentStep === questions.length;
  const currentQuestion = !isTierSelectionStep ? questions[currentStep] : null;
  const totalSteps = questions.length + 1; // +1 for tier selection

  return (
    <div className="h-screen bg-slate-950 bg-[radial-gradient(circle_at_top,rgba(6,182,212,0.05)_0%,transparent_51%)] overflow-hidden flex flex-col md:flex-row">
      {/* Left Column: Context & Progress */}
      <div className="w-full md:w-5/12 lg:w-4/12 border-r border-slate-800/50 flex flex-col p-8 lg:p-12 h-full bg-slate-950/20 backdrop-blur-3xl overflow-y-auto custom-scrollbar">
        <div className="mb-8 flex items-center justify-between">
          <Image
            src="/vessel-logo.png"
            alt="VESSEL Logo"
            width={120}
            height={32}
            className="h-8 w-auto opacity-90"
          />
          <button
            type="button"
            onClick={() => setLanguage(language === 'en' ? 'id' : 'en')}
            className="inline-flex items-center rounded-full border border-cyan-500/50 bg-slate-900/50 p-1 text-[11px] font-semibold uppercase tracking-wide text-cyan-100 shadow-sm hover:border-cyan-400 transition-colors"
            aria-label={language === 'en' ? t('common.switchToIndonesian') : t('common.switchToEnglish')}
          >
            <span
              className={`px-2 py-1 rounded-full ${language === 'en' ? 'bg-cyan-400 text-slate-900 shadow' : 'text-cyan-100'}`}
            >
              {t('common.languageShort.en')}
            </span>
            <span
              className={`px-2 py-1 rounded-full ${language === 'id' ? 'bg-cyan-400 text-slate-900 shadow' : 'text-cyan-100'}`}
            >
              {t('common.languageShort.id')}
            </span>
          </button>
        </div>

        <div className="space-y-4 flex-1">
          <MarketplaceHero
            imageSrc="/assets/general/risk-management.png"
            title={t('riskAssessment.title')}
            subtitle={t('riskAssessment.subtitle')}
          />

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-black tracking-widest">
              <span className="text-slate-500">
                {isTierSelectionStep
                  ? (language === 'en' ? 'Final Step' : 'Tahap Akhir')
                  : `${t('riskAssessment.question')} ${currentStep + 1} ${t('riskAssessment.of')} ${questions.length}`}
              </span>
              <span className="text-cyan-400">{Math.round((currentStep / questions.length) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-1.5 border border-slate-800">
              <div
                className={`h-1.5 rounded-full transition-all duration-700 ease-out fill-mode-forwards ${isTierSelectionStep ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-gradient-to-r from-cyan-500 to-teal-500 shadow-[0_0_10px_rgba(6,182,212,0.3)]'}`}
                style={{ width: `${(currentStep / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Info Box */}
          <div className="p-5 bg-slate-900/60 border border-slate-800/50 rounded-2xl backdrop-blur-md">
            <div className="flex items-start space-x-4">
              <div className="mt-0.5 p-2 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-100 font-bold mb-2 uppercase tracking-tight">{t('riskAssessment.aboutTranches')}</p>
                <div className="text-[11px] text-slate-400 space-y-2 leading-relaxed">
                  <p>• {t('riskAssessment.priorityInfo')}</p>
                  <p>• {t('riskAssessment.catalystInfo')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Select - Skip Questionnaire */}
          {!isTierSelectionStep && (
            <div className="p-6 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 border border-violet-500/10 rounded-2xl text-center">
              <p className="text-[10px] text-slate-100 font-bold mb-4 uppercase tracking-[0.2em] leading-none opacity-80">
                {language === 'en' ? 'Already Know?' : 'Sudah Tahu?'}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleSubmit('priority')}
                  className="py-3 px-4 bg-slate-900/40 hover:bg-cyan-500/10 border border-slate-800 hover:border-cyan-500/50 rounded-xl text-slate-400 hover:text-cyan-400 text-[10px] font-black transition-all uppercase tracking-widest active:scale-95"
                >
                  Priority
                </button>
                <button
                  onClick={() => handleSubmit('catalyst')}
                  className="py-3 px-4 bg-slate-900/40 hover:bg-amber-500/10 border border-slate-800 hover:border-amber-500/50 rounded-xl text-slate-400 hover:text-amber-400 text-[10px] font-black transition-all uppercase tracking-widest active:scale-95"
                >
                  Catalyst
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Interaction */}
      <div className="flex-1 h-full flex items-center justify-center p-8 lg:p-16 relative overflow-y-auto">
        <div className="absolute inset-0 bg-[url('/assets/grid-pattern.svg')] opacity-[0.03] pointer-events-none" />

        <div className="max-w-2xl w-full z-10 transition-all duration-500">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs animate-in fade-in zoom-in duration-300">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {error}
              </div>
            </div>
          )}

          {/* Question Card */}
          {!isTierSelectionStep && currentQuestion ? (
            <div className="p-8 lg:p-10 bg-slate-900/30 border border-slate-800/80 rounded-[2.5rem] backdrop-blur-2xl shadow-2xl relative overflow-hidden group border-b-4 border-b-cyan-500/20">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

              <h2 className="text-2xl lg:text-3xl font-bold text-white mb-10 leading-snug tracking-tight">{currentQuestion.question}</h2>

              <div className="space-y-3">
                {currentQuestion.options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      handleAnswerSelect(currentQuestion.id, option.value);
                      setTimeout(handleNext, 400);
                    }}
                    className={`w-full p-5 lg:p-6 rounded-2xl border-2 text-left transition-all duration-300 flex items-center justify-between group/opt ${answers[currentQuestion.id] === option.value
                      ? 'bg-cyan-500/10 border-cyan-500 text-white ring-8 ring-cyan-500/5'
                      : 'bg-slate-800/20 border-slate-800/50 text-slate-400 hover:bg-slate-800/40 hover:border-slate-600'
                      }`}
                  >
                    <div className="flex items-center space-x-5">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${answers[currentQuestion.id] === option.value
                          ? 'border-cyan-400 bg-cyan-400 scale-110'
                          : 'border-slate-600 group-hover/opt:border-slate-400'
                          }`}
                      >
                        {answers[currentQuestion.id] === option.value && (
                          <svg className="w-3 h-3 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className="font-bold text-lg lg:text-xl tracking-tight transition-colors duration-300">{option.label}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex justify-between mt-10">
                <button
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${currentStep === 0
                    ? 'text-slate-600 cursor-not-allowed opacity-30 shadow-none'
                    : 'text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 shadow-lg'
                    }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                  {t('common.prev')}
                </button>
                <button
                  onClick={handleNext}
                  disabled={!answers[currentQuestion.id]}
                  className={`flex items-center gap-2 px-10 py-3 rounded-2xl text-xs font-black uppercase tracking-[0.15em] transition-all ${answers[currentQuestion.id]
                    ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-xl shadow-cyan-900/40 active:scale-95'
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    }`}
                >
                  {t('common.next')}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
          ) : (
            /* Educational Summary Step */
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out max-w-2xl mx-auto">
              <div className="text-center mb-10">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-emerald-500/30">
                  <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-3xl lg:text-4xl font-black text-white mb-4 tracking-tight uppercase">
                  {language === 'en' ? 'Assessment Completed!' : 'Asesmen Selesai!'}
                </h2>
                <p className="text-slate-400 text-lg leading-relaxed">
                  {language === 'en'
                    ? 'Based on your profile, you are eligible to participate in our funding pools.'
                    : 'Berdasarkan profil Anda, Anda berhak untuk berpartisipasi dalam funding pool kami.'}
                </p>
              </div>

              <div className="bg-slate-900/40 border border-slate-800/80 rounded-[2rem] p-8 mb-8 backdrop-blur-sm">
                <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
                  {language === 'en' ? 'Understanding Tranches' : 'Memahami Tranche'}
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Priority Info */}
                  <div className="space-y-3 p-5 rounded-2xl bg-slate-800/30 border border-slate-700/30">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-cyan-500/10 rounded-lg">
                        <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <h4 className="font-bold text-white">PRIORITY</h4>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {language === 'en'
                        ? 'Lower risk, stable returns. Priority investors are paid first when repayment occurs.'
                        : 'Risiko lebih rendah, imbal hasil stabil. Investor Priority dibayar lebih dulu saat pelunasan terjadi.'}
                    </p>
                    <div className="flex gap-2 text-[10px] font-bold text-cyan-300 uppercase mt-2">
                      <span className="px-2 py-1 bg-cyan-950/50 rounded">First Out</span>
                      <span className="px-2 py-1 bg-cyan-950/50 rounded">Stable Yield</span>
                    </div>
                  </div>

                  {/* Catalyst Info */}
                  <div className="space-y-3 p-5 rounded-2xl bg-slate-800/30 border border-slate-700/30">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-amber-500/10 rounded-lg">
                        <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <h4 className="font-bold text-white">CATALYST</h4>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {language === 'en'
                        ? 'Higher risk, higher potential returns. Acts as a buffer for Priority tranche.'
                        : 'Risiko lebih tinggi, potensi imbal hasil lebih tinggi. Berfungsi sebagai penyangga untuk tranche Priority.'}
                    </p>
                    <div className="flex gap-2 text-[10px] font-bold text-amber-300 uppercase mt-2">
                      <span className="px-2 py-1 bg-amber-950/50 rounded">First Loss</span>
                      <span className="px-2 py-1 bg-amber-950/50 rounded">High Yield</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-xs text-slate-500 italic">
                    {language === 'en'
                      ? 'You can choose your preferred tranche for every funding pool.'
                      : 'Anda dapat memilih tranche yang diinginkan pada setiap funding pool.'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <button
                  onClick={() => handleSubmit('priority')} // Defaulting to priority as requested
                  disabled={submitting}
                  className={`w-full py-5 rounded-[1.5rem] text-sm font-black uppercase tracking-[0.2em] transition-all shadow-2xl relative overflow-hidden group ${!submitting
                    ? 'bg-white text-slate-900 hover:bg-cyan-50 shadow-cyan-500/10 active:scale-98'
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    }`}
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {submitting ? t('riskAssessment.saving') : (language === 'en' ? 'Go to Dashboard' : 'Lanjut ke Dashboard')}
                    {!submitting && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>}
                  </span>
                  {!submitting && <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RiskAssessmentPage() {
  return (
    <AuthGuard allowedRoles={['investor']}>
      <RiskAssessmentContent />
    </AuthGuard>
  );
}
