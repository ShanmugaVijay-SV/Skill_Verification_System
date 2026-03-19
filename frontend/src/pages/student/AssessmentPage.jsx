import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../utils/axiosInstance";
import QuestionCard from "../../components/QuestionCard";
import ProgressBar from "../../components/ProgressBar";
import AssessmentTimer from "../../components/AssessmentTimer";

function AssessmentPage() {
  const { domainId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [domain, setDomain] = useState(null);
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [securityWarnings, setSecurityWarnings] = useState(0);
  const [securityMessage, setSecurityMessage] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));
  const [hasEnteredFullscreen, setHasEnteredFullscreen] = useState(Boolean(document.fullscreenElement));
  const [issueType, setIssueType] = useState("Incorrect Answer");
  const [issueDescription, setIssueDescription] = useState("");
  const [issueSubmitting, setIssueSubmitting] = useState(false);
  const [issueMessage, setIssueMessage] = useState("");
  const [issueStatusMessage, setIssueStatusMessage] = useState("");
  const [showIssueForm, setShowIssueForm] = useState(false);

  const autoSubmitTriggeredRef = useRef(false);
  const lastTabSwitchAtRef = useRef(0);

  const TIME_LIMIT_MINUTES = 60; // 60 minutes for assessment
  const MAX_SECURITY_WARNINGS = 3;

  const requestFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    }
  };

  // Prevent navigation during assessment
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'Are you sure you want to leave? Your assessment progress will be lost.';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Keep assessment in fullscreen mode and track exits.
  useEffect(() => {
    const handleFullscreenChange = () => {
      const currentlyFullscreen = Boolean(document.fullscreenElement);
      setIsFullscreen(currentlyFullscreen);

      if (currentlyFullscreen) {
        setHasEnteredFullscreen(true);
      }

      if (
        !currentlyFullscreen &&
        hasEnteredFullscreen &&
        !loading &&
        questions.length > 0 &&
        !submitting &&
        !autoSubmitTriggeredRef.current
      ) {
        // If fullscreen exited due to a recent tab switch, count only the tab-switch warning.
        const exitedFromRecentTabSwitch = Date.now() - lastTabSwitchAtRef.current < 2000;
        if (exitedFromRecentTabSwitch) {
          return;
        }

        handleFullscreenExitAutoSubmit();
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [hasEnteredFullscreen, loading, questions.length, submitting]);

  // Detect tab/app switching via page visibility.
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (
        document.hidden &&
        !loading &&
        questions.length > 0 &&
        !submitting &&
        !autoSubmitTriggeredRef.current
      ) {
        const now = Date.now();
        // Some browsers can dispatch rapid visibility changes for one user action.
        if (now - lastTabSwitchAtRef.current < 1200) {
          return;
        }

        lastTabSwitchAtRef.current = now;
        issueSecurityWarning("Tab switch detected.");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loading, questions.length, submitting]);

  // Block copy actions and text selection shortcuts during assessment.
  useEffect(() => {
    const preventDefault = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && ["c", "x", "v", "a"].includes(key)) {
        e.preventDefault();
      }
    };

    document.addEventListener("copy", preventDefault);
    document.addEventListener("cut", preventDefault);
    document.addEventListener("paste", preventDefault);
    document.addEventListener("contextmenu", preventDefault);
    document.addEventListener("selectstart", preventDefault);
    document.addEventListener("dragstart", preventDefault);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("copy", preventDefault);
      document.removeEventListener("cut", preventDefault);
      document.removeEventListener("paste", preventDefault);
      document.removeEventListener("contextmenu", preventDefault);
      document.removeEventListener("selectstart", preventDefault);
      document.removeEventListener("dragstart", preventDefault);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Fetch questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch domain details
        const domainresponse = await axios.get(`/domains/${domainId}`);
        setDomain(domainresponse.data.data);

        // Fetch questions
        const response = await axios.get(`/questions/${domainId}`);
        if (response.data.status === "success") {
          setQuestions(response.data.data);
        } else if (response.status === 400) {
          setError("Cooldown period active. You must wait 72 hours before retaking this assessment.");
        }
      } catch (err) {
        if (err.response?.status === 400) {
          const nextDate = err.response.data.nextAttemptDate;
          const hoursRemaining = err.response.data.hoursRemaining;
          setError(
            `Cooldown period active! You can retake this assessment in ${hoursRemaining} hours (${new Date(nextDate).toLocaleString()})`
          );
        } else {
          setError("Failed to load assessment. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [domainId]);

  // Handle answer selection
  const handleAnswerSelect = (answer) => {
    const currentQuestion = questions[currentQuestionIndex];
    setAnswers({
      ...answers,
      [currentQuestion.id]: answer
    });
  };

  // Navigate to next question
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // Navigate to previous question
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Go to specific question
  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index);
    setNavigationOpen(false);
    setShowIssueForm(false);
    setIssueMessage("");
  };

  // Handle time up
  const handleTimeUp = () => {
    alert("Time's up! Your assessment will be submitted.");
    submitAssessment();
  };

  const issueSecurityWarning = (reason) => {
    if (submitting || autoSubmitTriggeredRef.current) return;

    setSecurityWarnings((prev) => {
      const next = prev + 1;

      if (next >= MAX_SECURITY_WARNINGS) {
        setSecurityMessage(
          `Tab-switch limit reached (${next}/${MAX_SECURITY_WARNINGS}). Assessment is being submitted automatically.`
        );
        autoSubmitTriggeredRef.current = true;
        submitAssessment();
      } else {
        setSecurityMessage(
          `${reason} Warning ${next}/${MAX_SECURITY_WARNINGS}. After ${MAX_SECURITY_WARNINGS} tab-switch warnings, the assessment ends automatically.`
        );
      }

      return next;
    });
  };

  const handleFullscreenExitAutoSubmit = () => {
    if (submitting || autoSubmitTriggeredRef.current) return;

    autoSubmitTriggeredRef.current = true;
    setSecurityMessage("Fullscreen mode was exited. Assessment is being submitted automatically.");
    submitAssessment();
  };

  // Submit assessment
  const submitAssessment = async () => {
    if (submitting) return;

    try {
      setSubmitting(true);

      // Format answers for submission
      const formattedAnswers = questions.map((q) => ({
        questionId: q.id,
        selectedAnswer: answers[q.id] || null
      }));

      const response = await axios.post("/assessment/submit", {
        domainId: parseInt(domainId),
        answers: formattedAnswers
      });

      if (response.data.status === "success") {
        if (document.fullscreenElement) {
          try {
            await document.exitFullscreen();
          } catch (fsError) {
            // Ignore fullscreen exit failures during navigation.
          }
        }

        // Navigate to results page with data - map backend field names to frontend expectations
        const resultData = response.data.data;
        const resultsToPass = {
          domainId: parseInt(domainId),
          score: resultData.score,
          total_questions: resultData.total,
          percentage: resultData.percentage,
          result: resultData.result,
          level: resultData.level,
          certificate_path: resultData.certificate,
          domain_name: domain?.name,
          timestamp: new Date().toISOString()
        };
        
        // Store in localStorage as backup in case navigation state is lost
        localStorage.setItem("lastAssessmentResult", JSON.stringify(resultsToPass));
        
        navigate("/student/results", {
          state: {
            results: resultsToPass
          }
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit assessment");
    } finally {
      setSubmitting(false);
    }
  };

  // Confirm submission
  const handleSubmitClick = () => {
    const answeredCount = Object.keys(answers).length;
    const totalCount = questions.length;
    const unanswered = totalCount - answeredCount;

    let confirmMessage = `You have answered ${answeredCount} out of ${totalCount} questions.`;

    if (unanswered > 0) {
      confirmMessage += `\n\n⚠️ ${unanswered} question(s) left unanswered.`;
    }

    confirmMessage += "\n\nAre you sure you want to submit?";

    if (window.confirm(confirmMessage)) {
      submitAssessment();
    }
  };

  const handleReportIssue = async (e) => {
    e.preventDefault();
    setIssueStatusMessage("");

    if (!issueDescription.trim() || issueDescription.trim().length < 10) {
      setIssueMessage("Please provide at least 10 characters describing the issue.");
      return;
    }

    try {
      setIssueSubmitting(true);
      setIssueMessage("");

      await axios.post("/assessment/question-report", {
        domainId: parseInt(domainId),
        questionId: currentQuestion.id,
        issueType,
        description: issueDescription.trim(),
      });

      setIssueDescription("");
      setIssueMessage("");
      setShowIssueForm(false);
      setIssueStatusMessage("Issue reported successfully.");
    } catch (err) {
      setIssueStatusMessage("");
      setIssueMessage(err.response?.data?.message || "Failed to submit report. Please try again.");
    } finally {
      setIssueSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-red-50 border-2 border-red-500 rounded-lg p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">⚠️ Cannot Take Assessment</h2>
          <p className="text-red-700 mb-6">{error}</p>
          <button
            onClick={() => navigate("/student/dashboard")}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-700">No questions available</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;
  const answered = answers[currentQuestion.id] || null;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-cyan-50/40 px-3 py-4 lg:px-6 select-none">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
            {domain?.name} Assessment
          </h1>
          <p className="text-slate-600 text-lg">
            Answer all questions carefully. You cannot navigate away during the assessment.
          </p>
        </div>

        {securityMessage && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-300 rounded-xl text-amber-800 font-semibold text-center">
            {securityMessage}
          </div>
        )}

        <div className="mb-6 p-3 bg-white/90 border border-slate-200 rounded-xl text-sm text-slate-700 flex justify-between items-center shadow-sm">
          <span>Security warnings: {securityWarnings}/{MAX_SECURITY_WARNINGS}</span>
          <span className={isFullscreen ? "text-emerald-700 font-semibold" : "text-rose-700 font-semibold"}>
            {isFullscreen ? "Fullscreen active" : "Fullscreen required"}
          </span>
        </div>

        {!isFullscreen && (
          <div className="mb-6 p-6 bg-rose-50 border border-rose-300 rounded-2xl text-center">
            <h2 className="text-xl font-bold text-rose-700 mb-2">Fullscreen Mode Required</h2>
            <p className="text-rose-700 mb-4">
              Assessment can only be taken in fullscreen mode. Exiting fullscreen will submit your assessment automatically.
            </p>
            <button
              onClick={async () => {
                try {
                  await requestFullscreen();
                } catch (err) {
                  setSecurityMessage("Unable to enter fullscreen automatically. Please allow fullscreen and try again.");
                }
              }}
              className="bg-rose-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-rose-700 transition"
            >
              Enter Fullscreen
            </button>
          </div>
        )}

        <div className={!isFullscreen ? "pointer-events-none opacity-40" : ""}>
          {/* Timer and Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="md:col-span-2">
              <AssessmentTimer timeLimit={TIME_LIMIT_MINUTES} onTimeUp={handleTimeUp} />
            </div>
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 text-center shadow-lg">
              <p className="text-sm font-semibold text-slate-300">Answered</p>
              <p className="text-4xl font-bold text-white">{answeredCount}/{questions.length}</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-5 items-start">
            {/* Question Panel */}
            <div>
              {/* Progress Bar */}
              <div className="mb-6">
                <ProgressBar current={currentQuestionIndex + 1} total={questions.length} />
              </div>

              {/* Question Card */}
              <div className="mb-6">
                <QuestionCard
                  question={currentQuestion}
                  selectedAnswer={answered}
                  onAnswerSelect={handleAnswerSelect}
                  questionNumber={currentQuestionIndex + 1}
                />
              </div>

              <div className="mb-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowIssueForm((prev) => !prev);
                    setIssueMessage("");
                    setIssueStatusMessage("");
                  }}
                  className="inline-flex items-center gap-2 h-12 px-4 rounded-2xl border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-50 hover:border-cyan-400 hover:text-cyan-700 transition"
                  title="Report a question issue"
                  aria-label="Report a question issue"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 6.75h5m-7.5 3h10m-10 4.5h10m-7.5 3h5" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 4.5a2.25 2.25 0 114.5 0V6h-4.5V4.5zM8.25 6h7.5A2.25 2.25 0 0118 8.25v7.5A4.5 4.5 0 0113.5 20.25h-3A4.5 4.5 0 016 15.75v-7.5A2.25 2.25 0 018.25 6z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5h1.5m12 0h1.5M5.25 15.75l1.2-.9m11.1.9-1.2-.9" />
                  </svg>
                  <span className="text-sm font-semibold whitespace-nowrap">Report an Issue</span>
                </button>
              </div>

              {issueStatusMessage && (
                <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                  {issueStatusMessage}
                </div>
              )}

              {/* Report Question Issue */}
              {showIssueForm && (
              <div className="mb-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                <h3 className="text-base font-bold text-slate-900 mb-3">Report Question Issue</h3>
                <form onSubmit={handleReportIssue} className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Issue Type</label>
                      <select
                        value={issueType}
                        onChange={(e) => setIssueType(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      >
                        <option>Incorrect Answer</option>
                        <option>Ambiguous Wording</option>
                        <option>Typo / Grammar Issue</option>
                        <option>Multiple Correct Options</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div className="text-xs text-slate-500 flex items-end pb-2">
                      Question #{currentQuestionIndex + 1} | ID: {currentQuestion.id}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
                    <textarea
                      value={issueDescription}
                      onChange={(e) => setIssueDescription(e.target.value)}
                      placeholder="Describe what is incorrect or unclear in this question"
                      rows={3}
                      className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  {issueMessage && (
                    <p className={`text-sm ${issueMessage.toLowerCase().includes("success") ? "text-emerald-700" : "text-rose-700"}`}>
                      {issueMessage}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={issueSubmitting}
                    className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 disabled:opacity-50"
                  >
                    {issueSubmitting ? "Submitting..." : "Submit Issue Report"}
                  </button>
                </form>
              </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center gap-4">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  className="px-6 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed bg-gray-600 text-white hover:bg-gray-700 transition"
                >
                  ← Previous
                </button>

                <div className="text-sm text-gray-600">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </div>

                <button
                  onClick={handleNext}
                  disabled={currentQuestionIndex === questions.length - 1}
                  className="px-6 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed bg-gray-600 text-white hover:bg-gray-700 transition"
                >
                  Next →
                </button>
              </div>
            </div>

            {/* Side Navigation Panel */}
            <div>
              <div className="bg-white/95 rounded-2xl shadow-xl p-4 sticky top-4 border border-slate-200/70">
                <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
                  <p className="text-xs uppercase font-semibold tracking-wide text-amber-700">Questions Remaining</p>
                  <p className="text-2xl font-bold text-amber-800">{questions.length - answeredCount}</p>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-900">Question Map</h3>
                  <button
                    onClick={() => setNavigationOpen(!navigationOpen)}
                    className="lg:hidden text-cyan-700 font-bold"
                  >
                    {navigationOpen ? "Hide" : "Show"}
                  </button>
                </div>

                {/* Question Grid */}
                <div className={`grid grid-cols-4 gap-2 ${navigationOpen ? "block" : "hidden lg:grid"}`}>
                  {questions.map((q, index) => (
                    <button
                      key={q.id}
                      onClick={() => goToQuestion(index)}
                      disabled={!isFullscreen}
                      className={`aspect-square rounded-lg font-semibold text-sm transition ${
                        index === currentQuestionIndex
                            ? "bg-cyan-600 text-white ring-2 ring-cyan-800"
                          : answers[q.id]
                            ? "bg-emerald-500 text-white hover:bg-emerald-600"
                            : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                {/* Legend */}
                <div className={`mt-6 space-y-2 text-xs ${navigationOpen ? "block" : "hidden lg:block"}`}>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div>
                    <span className="text-slate-700">Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-slate-300 rounded-sm"></div>
                    <span className="text-slate-700">Not Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-cyan-600 rounded-sm"></div>
                    <span className="text-slate-700">Current</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-12 flex justify-center">
            <button
              onClick={handleSubmitClick}
              disabled={submitting || !isFullscreen}
              className="px-12 py-3 bg-linear-to-r from-teal-500 to-cyan-600 text-white font-bold text-lg rounded-xl hover:from-teal-600 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
            >
              {submitting ? "Submitting..." : "Submit Assessment"}
            </button>
          </div>

          {/* Unanswered Warning */}
          {answeredCount < questions.length && (
            <div className="mt-6 p-4 bg-amber-50 border border-amber-300 rounded-xl text-center">
              <p className="text-amber-800 font-semibold">
                {questions.length - answeredCount} question(s) left unanswered
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AssessmentPage;
