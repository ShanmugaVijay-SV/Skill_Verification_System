import { useState, useEffect } from "react";
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

  const TIME_LIMIT_MINUTES = 60; // 60 minutes for assessment

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
  };

  // Handle time up
  const handleTimeUp = () => {
    alert("Time's up! Your assessment will be submitted.");
    submitAssessment();
  };

  // Submit assessment
  const submitAssessment = async () => {
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
        // Navigate to results page with data - map backend field names to frontend expectations
        const resultData = response.data.data;
        const resultsToPass = {
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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {domain?.name} Assessment
          </h1>
          <p className="text-gray-600">
            Answer all questions carefully. You cannot navigate away during the assessment.
          </p>
        </div>

        {/* Timer and Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="md:col-span-2">
            <AssessmentTimer timeLimit={TIME_LIMIT_MINUTES} onTimeUp={handleTimeUp} />
          </div>
          <div className="bg-purple-100 border-2 border-purple-500 rounded-lg p-4 text-center">
            <p className="text-sm font-semibold text-purple-700">Answered</p>
            <p className="text-3xl font-bold text-purple-600">{answeredCount}/{questions.length}</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Question Panel */}
          <div className="lg:col-span-3">
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
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-4 sticky top-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800">Question Map</h3>
                <button
                  onClick={() => setNavigationOpen(!navigationOpen)}
                  className="lg:hidden text-blue-600 font-bold"
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
                    className={`aspect-square rounded-lg font-semibold text-sm transition ${
                      index === currentQuestionIndex
                        ? "bg-blue-600 text-white ring-2 ring-blue-800"
                        : answers[q.id]
                        ? "bg-green-500 text-white hover:bg-green-600"
                        : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              {/* Legend */}
              <div className={`mt-6 space-y-2 text-xs ${navigationOpen ? "block" : "hidden lg:block"}`}>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                  <span className="text-gray-700">Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-300 rounded-sm"></div>
                  <span className="text-gray-700">Not Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-600 rounded-sm"></div>
                  <span className="text-gray-700">Current</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-12 flex justify-center">
          <button
            onClick={handleSubmitClick}
            disabled={submitting}
            className="px-12 py-3 bg-green-600 text-white font-bold text-lg rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
          >
            {submitting ? "Submitting..." : "Submit Assessment"}
          </button>
        </div>

        {/* Unanswered Warning */}
        {answeredCount < questions.length && (
          <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-500 rounded-lg text-center">
            <p className="text-yellow-700 font-semibold">
              ⚠️ {questions.length - answeredCount} question(s) left unanswered
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AssessmentPage;
