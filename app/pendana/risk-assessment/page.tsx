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

function RiskAssessmentContent() {
  const router = useRouter();
  const [questions, setQuestions] = useState<RiskQuestion[]>([]);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
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
            // Already completed, show result
            setLoading(false);
            return;
          }
        }

        // Load questions
        const questionsRes = await riskQuestionnaireAPI.getQuestions();
        if (questionsRes.success && questionsRes.data) {
          setQuestions(questionsRes.data.questions);
        } else {
          setError('Gagal memuat pertanyaan');
        }
      } catch (err) {
        setError('Terjadi kesalahan');
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
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== questions.length) {
      setError('Harap jawab semua pertanyaan');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await riskQuestionnaireAPI.submit({
        q1_answer: answers[1],
        q2_answer: answers[2],
        q3_answer: answers[3],
      });

      if (res.success && res.data) {
        setStatus(res.data);
      } else {
        setError(res.error?.message || 'Gagal menyimpan jawaban');
      }
    } catch (err) {
      setError('Terjadi kesalahan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setStatus(null);
    setAnswers({});
    setCurrentStep(0);
  };

  if (loading) {
    return (
      <DashboardLayout role="investor">
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Show result if completed
  if (status?.completed) {
    return (
      <DashboardLayout role="investor">
        <div className="max-w-2xl mx-auto">
          <div className="p-8 bg-slate-800/30 border border-slate-700/50 rounded-xl backdrop-blur-sm text-center">
            <div
              className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
                status.catalyst_unlocked
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}
            >
              {status.catalyst_unlocked ? (
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              )}
            </div>

            <h1 className="text-2xl font-bold text-white mb-2">
              {status.catalyst_unlocked ? 'Catalyst Tranche Terbuka!' : 'Assessment Selesai'}
            </h1>

            <p className="text-slate-400 mb-6">{status.message}</p>

            <div className="p-4 bg-slate-700/30 rounded-lg mb-6">
              <h3 className="text-sm font-medium text-slate-300 mb-3">Akses Tranche Anda:</h3>
              <div className="flex justify-center gap-4">
                <div className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 rounded-lg">
                  <span className="text-cyan-400 font-medium">Priority Tranche</span>
                  <p className="text-xs text-slate-400 mt-1">Return lebih rendah, risiko lebih kecil</p>
                </div>
                <div
                  className={`px-4 py-2 rounded-lg ${
                    status.catalyst_unlocked
                      ? 'bg-teal-500/20 border border-teal-500/30'
                      : 'bg-slate-600/20 border border-slate-600/30'
                  }`}
                >
                  <span
                    className={`font-medium ${
                      status.catalyst_unlocked ? 'text-teal-400' : 'text-slate-500'
                    }`}
                  >
                    Catalyst Tranche
                  </span>
                  <p className="text-xs text-slate-400 mt-1">
                    {status.catalyst_unlocked ? 'Return lebih tinggi, risiko lebih besar' : 'Terkunci'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={handleRetake}
                className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm font-medium text-slate-200 transition-all"
              >
                Ulangi Assessment
              </button>
              <button
                onClick={() => router.push('/pendana/marketplace')}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 rounded-lg text-sm font-medium text-white transition-all"
              >
                Mulai Investasi
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show questionnaire
  const currentQuestion = questions[currentStep];
  const isLastQuestion = currentStep === questions.length - 1;
  const allAnswered = Object.keys(answers).length === questions.length;

  return (
    <DashboardLayout role="investor">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Risk Assessment</h1>
          <p className="text-slate-400">
            Jawab pertanyaan berikut untuk menentukan profil risiko investasi Anda
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
            <span>Pertanyaan {currentStep + 1} dari {questions.length}</span>
            <span>{Math.round(((currentStep + 1) / questions.length) * 100)}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-cyan-500 to-teal-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Question Card */}
        {currentQuestion && (
          <div className="p-6 bg-slate-800/30 border border-slate-700/50 rounded-xl backdrop-blur-sm">
            <h2 className="text-lg font-semibold text-white mb-6">{currentQuestion.question}</h2>

            <div className="space-y-3">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswerSelect(currentQuestion.id, option.value)}
                  className={`w-full p-4 rounded-lg border text-left transition-all ${
                    answers[currentQuestion.id] === option.value
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-white'
                      : 'bg-slate-700/30 border-slate-600/50 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        answers[currentQuestion.id] === option.value
                          ? 'border-cyan-400 bg-cyan-400'
                          : 'border-slate-500'
                      }`}
                    >
                      {answers[currentQuestion.id] === option.value && (
                        <svg className="w-3 h-3 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <span>{option.label}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentStep === 0
                    ? 'text-slate-500 cursor-not-allowed'
                    : 'text-slate-300 hover:text-white bg-slate-700/50 hover:bg-slate-700'
                }`}
              >
                Sebelumnya
              </button>

              {isLastQuestion ? (
                <button
                  onClick={handleSubmit}
                  disabled={!allAnswered || submitting}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                    allAnswered && !submitting
                      ? 'bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white'
                      : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {submitting ? 'Menyimpan...' : 'Kirim Jawaban'}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={!answers[currentQuestion.id]}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                    answers[currentQuestion.id]
                      ? 'bg-cyan-500 hover:bg-cyan-400 text-white'
                      : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Selanjutnya
                </button>
              )}
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 p-4 bg-slate-800/20 border border-slate-700/30 rounded-lg">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-cyan-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm text-slate-300 font-medium">Tentang Tranche</p>
              <p className="text-xs text-slate-400 mt-1">
                <strong>Priority Tranche (Senior)</strong>: Mendapat pembayaran terlebih dahulu dengan return lebih rendah.
                <br />
                <strong>Catalyst Tranche (Junior)</strong>: Mendapat return lebih tinggi namun dibayar setelah Priority.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function RiskAssessmentPage() {
  return (
    <AuthGuard allowedRoles={['investor']}>
      <RiskAssessmentContent />
    </AuthGuard>
  );
}
