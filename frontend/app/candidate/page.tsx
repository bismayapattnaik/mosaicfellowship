"use client";

import { Suspense, useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  startTest,
  autosaveAnswers,
  submitTest,
  getCandidateBySession,
} from "@/lib/api";
import type { CandidateTestView, TestQuestion, AnswerSubmission } from "@/lib/types";

export default function CandidateTestPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#080808]"><p className="text-zinc-500 font-mono text-xs uppercase tracking-widest animate-pulse">Loading...</p></div>}>
      <CandidateTestContent />
    </Suspense>
  );
}

function CandidateTestContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [phase, setPhase] = useState<"enter" | "instructions" | "test" | "submitted">("enter");
  const [sessionToken, setSessionToken] = useState(token);
  const [testData, setTestData] = useState<CandidateTestView | null>(null);
  const [answers, setAnswers] = useState<Record<string, AnswerSubmission>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [copyPasteDetected, setCopyPasteDetected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autosaveRef = useRef<NodeJS.Timeout | null>(null);
  const questionStartTime = useRef<number>(Date.now());

  const doAutosave = useCallback(async () => {
    if (!sessionToken || Object.keys(answers).length === 0) return;
    try {
      await autosaveAnswers({
        session_token: sessionToken,
        answers: Object.values(answers),
      });
    } catch {
      // Autosave failures are silent
    }
  }, [sessionToken, answers]);

  useEffect(() => {
    if (phase !== "test") return;
    autosaveRef.current = setInterval(doAutosave, 10000);
    return () => {
      if (autosaveRef.current) clearInterval(autosaveRef.current);
    };
  }, [phase, doAutosave]);

  useEffect(() => {
    if (phase !== "test" || timeRemaining <= 0) return;
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  async function handleStartFlow() {
    if (!sessionToken) {
      setError("Please enter your session token");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const candidate = (await getCandidateBySession(sessionToken)) as any;
      if (candidate.status === "submitted" || candidate.status === "scored") {
        setPhase("submitted");
        return;
      }
      setPhase("instructions");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleBeginTest() {
    setLoading(true);
    setError("");
    try {
      const data = (await startTest(sessionToken)) as CandidateTestView;
      setTestData(data);
      setTimeRemaining(data.time_limit_minutes * 60);
      questionStartTime.current = Date.now();
      setPhase("test");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function updateAnswer(question: TestQuestion, value: string | number) {
    const elapsed = Math.floor((Date.now() - questionStartTime.current) / 1000);
    const existing = answers[question.id];
    const timeSpent = (existing?.time_spent_seconds || 0) + elapsed;

    const submission: AnswerSubmission = {
      question_id: question.id,
      answer_text: question.question_type === "mcq" ? null : (value as string),
      selected_option_index:
        question.question_type === "mcq" ? (value as number) : null,
      time_spent_seconds: timeSpent,
    };

    setAnswers((prev) => ({ ...prev, [question.id]: submission }));
    questionStartTime.current = Date.now();
  }

  async function handleSubmit() {
    if (timerRef.current) clearInterval(timerRef.current);
    if (autosaveRef.current) clearInterval(autosaveRef.current);
    setLoading(true);
    setError("");
    try {
      await submitTest({
        session_token: sessionToken,
        answers: Object.values(answers),
        copy_paste_detected: copyPasteDetected,
      });
      setPhase("submitted");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handlePaste() {
    setCopyPasteDetected(true);
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  // --- ENTER TOKEN ---
  if (phase === "enter") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080808] bg-grid p-8">
        <div className="relative max-w-md w-full card p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-acid text-black px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest">
              Assessment Portal
            </div>
          </div>
          <h1 className="font-heading font-bold text-4xl uppercase tracking-tighter text-white mb-2">
            Beat Claude
          </h1>
          <p className="text-zinc-500 text-sm font-mono mb-6">Enter your session token to begin</p>
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}
          <input
            type="text"
            value={sessionToken}
            onChange={(e) => setSessionToken(e.target.value)}
            placeholder="SESSION TOKEN"
            className="input mb-4"
          />
          <button
            onClick={handleStartFlow}
            disabled={loading}
            className="btn-acid w-full"
          >
            {loading ? "Verifying..." : "Continue"}
          </button>
        </div>
      </div>
    );
  }

  // --- INSTRUCTIONS ---
  if (phase === "instructions") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080808] bg-grid p-8">
        <div className="relative max-w-lg w-full card p-8">
          <h1 className="font-heading font-bold text-4xl uppercase tracking-tighter text-white mb-6">
            Instructions
          </h1>
          <ul className="space-y-3 text-sm text-zinc-400 mb-8 font-mono">
            <li className="flex gap-3">
              <span className="text-acid font-bold">01</span>
              This is a timed assessment. The timer starts when you click Begin.
            </li>
            <li className="flex gap-3">
              <span className="text-acid font-bold">02</span>
              Your answers are auto-saved every 10 seconds.
            </li>
            <li className="flex gap-3">
              <span className="text-acid font-bold">03</span>
              You can navigate between questions freely.
            </li>
            <li className="flex gap-3">
              <span className="text-acid font-bold">04</span>
              Once submitted, you cannot retake the test.
            </li>
            <li className="flex gap-3">
              <span className="text-acid font-bold">05</span>
              Copy-paste activity is monitored.
            </li>
          </ul>
          <button
            onClick={handleBeginTest}
            disabled={loading}
            className="btn-acid w-full"
          >
            {loading ? "Loading test..." : "Begin Assessment"}
          </button>
        </div>
      </div>
    );
  }

  // --- SUBMITTED ---
  if (phase === "submitted") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080808] bg-grid p-8">
        <div className="relative max-w-md w-full card p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-2 border-acid flex items-center justify-center">
            <span className="text-acid text-3xl font-heading font-bold">✓</span>
          </div>
          <h1 className="font-heading font-bold text-4xl uppercase tracking-tighter text-white mb-2">
            Submitted
          </h1>
          <p className="text-zinc-500 text-sm font-mono">
            Your responses have been recorded and will be evaluated shortly.
          </p>
        </div>
      </div>
    );
  }

  // --- TEST ---
  if (!testData) return null;

  const questions = testData.questions;
  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const progress = Math.round((answeredCount / questions.length) * 100);
  const isLowTime = timeRemaining < 120;

  return (
    <div className="min-h-screen bg-[#080808]" onPaste={handlePaste}>
      {/* Header */}
      <div className="bg-[#0A0A0A] border-b border-white/10 px-6 py-3 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-heading font-bold text-sm uppercase tracking-wide text-white">
              {testData.job_title}
            </span>
            <span className="text-zinc-700">//</span>
            <span className="text-xs font-mono text-zinc-500">
              {testData.candidate_name}
            </span>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-xs font-mono text-zinc-500 uppercase">
              {answeredCount}/{questions.length}
            </div>
            <div
              className={`text-lg font-mono font-bold ${
                isLowTime ? "text-red-400 animate-pulse" : "text-acid"
              }`}
            >
              {formatTime(timeRemaining)}
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-acid text-xs px-4 py-1.5"
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="w-full h-0.5 bg-white/5">
        <div
          className="h-full bg-acid transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      {error && (
        <div className="max-w-4xl mx-auto mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Question */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="card p-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="px-2 py-0.5 border border-acid/30 text-acid text-[10px] font-mono font-bold uppercase">
              {currentQuestion.question_type.replace("_", " ")}
            </span>
            <span className="text-xs font-mono text-zinc-600 uppercase">
              Question {currentIndex + 1} of {questions.length}
            </span>
          </div>

          <p className="text-lg text-zinc-200 mb-8 whitespace-pre-wrap leading-relaxed">
            {currentQuestion.question_text}
          </p>

          {/* MCQ Options */}
          {currentQuestion.question_type === "mcq" &&
            currentQuestion.options && (
              <div className="space-y-3">
                {currentQuestion.options.map((opt, idx) => {
                  const selected =
                    answers[currentQuestion.id]?.selected_option_index === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => updateAnswer(currentQuestion, idx)}
                      className={`w-full text-left p-4 border transition-all ${
                        selected
                          ? "border-acid bg-acid/5"
                          : "border-white/10 hover:border-white/20 bg-[#080808]"
                      }`}
                    >
                      <span className={`font-mono font-bold mr-3 ${selected ? "text-acid" : "text-zinc-600"}`}>
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      <span className="text-zinc-300">{opt}</span>
                    </button>
                  );
                })}
              </div>
            )}

          {/* Text Answer */}
          {currentQuestion.question_type !== "mcq" && (
            <textarea
              value={answers[currentQuestion.id]?.answer_text || ""}
              onChange={(e) => updateAnswer(currentQuestion, e.target.value)}
              rows={8}
              placeholder="Type your answer here..."
              className="input resize-y"
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => {
              questionStartTime.current = Date.now();
              setCurrentIndex((prev) => Math.max(0, prev - 1));
            }}
            disabled={currentIndex === 0}
            className="btn-secondary text-xs disabled:opacity-30"
          >
            Previous
          </button>

          <div className="flex gap-1">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => {
                  questionStartTime.current = Date.now();
                  setCurrentIndex(idx);
                }}
                className={`w-8 h-8 text-xs font-mono font-bold transition-all ${
                  idx === currentIndex
                    ? "bg-acid text-black"
                    : answers[q.id]
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-white/5 text-zinc-600 border border-white/10"
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              questionStartTime.current = Date.now();
              setCurrentIndex((prev) =>
                Math.min(questions.length - 1, prev + 1)
              );
            }}
            disabled={currentIndex === questions.length - 1}
            className="btn-acid text-xs disabled:opacity-30"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
