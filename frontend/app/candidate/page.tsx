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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>}>
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
        <div className="max-w-md w-full bg-white rounded-lg border p-8">
          <h1 className="text-2xl font-bold mb-2">Beat Claude Assessment</h1>
          <p className="text-gray-500 mb-6">Enter your session token to begin</p>
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded text-sm">
              {error}
            </div>
          )}
          <input
            type="text"
            value={sessionToken}
            onChange={(e) => setSessionToken(e.target.value)}
            placeholder="Session token"
            className="w-full border rounded-lg px-3 py-2 mb-4"
          />
          <button
            onClick={handleStartFlow}
            disabled={loading}
            className="w-full py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 disabled:opacity-50"
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
        <div className="max-w-lg w-full bg-white rounded-lg border p-8">
          <h1 className="text-2xl font-bold mb-4">Assessment Instructions</h1>
          <ul className="space-y-3 text-sm text-gray-600 mb-6">
            <li className="flex gap-2">
              <span className="font-bold text-brand-600">1.</span>
              This is a timed assessment. The timer starts when you click "Begin".
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-brand-600">2.</span>
              Your answers are auto-saved every 10 seconds.
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-brand-600">3.</span>
              You can navigate between questions freely.
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-brand-600">4.</span>
              Once submitted, you cannot retake the test.
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-brand-600">5.</span>
              Copy-paste activity is monitored.
            </li>
          </ul>
          <button
            onClick={handleBeginTest}
            disabled={loading}
            className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
        <div className="max-w-md w-full bg-white rounded-lg border p-8 text-center">
          <div className="text-5xl mb-4">&#10003;</div>
          <h1 className="text-2xl font-bold mb-2">Assessment Submitted</h1>
          <p className="text-gray-500">
            Thank you for completing the assessment. Your responses have been
            recorded and will be evaluated shortly.
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
    <div className="min-h-screen bg-gray-50" onPaste={handlePaste}>
      {/* Header */}
      <div className="bg-white border-b px-6 py-3 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-gray-500">
              {testData.job_title}
            </span>
            <span className="mx-2 text-gray-300">|</span>
            <span className="text-sm text-gray-500">
              {testData.candidate_name}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              {answeredCount}/{questions.length} answered
            </div>
            <div
              className={`text-lg font-mono font-bold ${
                isLowTime ? "text-red-600 animate-pulse" : "text-gray-700"
              }`}
            >
              {formatTime(timeRemaining)}
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="w-full h-1 bg-gray-200">
        <div
          className="h-full bg-brand-500 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      {error && (
        <div className="max-w-4xl mx-auto mt-4 p-3 bg-red-50 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      {/* Question */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-2 py-1 bg-brand-50 text-brand-700 rounded text-xs font-medium">
              {currentQuestion.question_type.replace("_", " ")}
            </span>
            <span className="text-sm text-gray-400">
              Question {currentIndex + 1} of {questions.length}
            </span>
          </div>

          <p className="text-lg mb-6 whitespace-pre-wrap">
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
                      className={`w-full text-left p-4 rounded-lg border-2 transition ${
                        selected
                          ? "border-brand-500 bg-brand-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span className="font-medium mr-3">
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      {opt}
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
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
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
            className="px-4 py-2 border rounded-lg text-sm font-medium disabled:opacity-30 hover:bg-gray-100"
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
                className={`w-8 h-8 rounded text-xs font-medium ${
                  idx === currentIndex
                    ? "bg-brand-600 text-white"
                    : answers[q.id]
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
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
            className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium disabled:opacity-30 hover:bg-brand-700"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
