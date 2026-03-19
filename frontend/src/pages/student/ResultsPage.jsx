import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import StudentLayout from "../../components/layouts/StudentLayout";
import Certificate from "../../components/Certificate";
import axios from "../../utils/axiosInstance";

function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");
  const certificateRef = useRef(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({
    rating: "",
    comment: "",
  });
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  useEffect(() => {
    // Get results from navigation state
    console.log("Location state:", location.state);

    let results = location.state?.results;

    // Fallback to localStorage if state is not available
    if (!results) {
      const storedResults = localStorage.getItem("lastAssessmentResult");
      if (storedResults) {
        try {
          results = JSON.parse(storedResults);
          console.log("Results loaded from localStorage:", results);
        } catch (e) {
          console.error("Failed to parse localStorage results:", e);
        }
      }
    }

    if (results) {
      console.log("Results data found:", results);
      setResultData(results);
      setLoading(false);

      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          if (user && user.name) {
            setStudentName(user.name);
          }
        } catch (e) {
          console.error("Failed to parse user from localStorage", e);
        }
      }
    } else {
      console.log("No results found in state or localStorage, redirecting to dashboard");
      // Redirect to dashboard if no results
      setTimeout(() => {
        navigate("/student/dashboard");
      }, 500);
    }
  }, [location, navigate]);

  if (loading && !resultData) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg font-semibold text-gray-700">Loading results...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (!resultData) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-lg text-gray-700 mb-4">No results to display</p>
            <button
              onClick={() => navigate("/student/dashboard")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </StudentLayout>
    );
  }

  const {
    score,
    total_questions,
    percentage,
    result,
    level,
    domain_name,
    certificate_path,
    timestamp,
  } = resultData;

  const resolvedDomain = domain_name || resultData.domain || "Assessment";
  const resolvedTimestamp = timestamp || resultData.attemptDate || Date.now();
  const numericPercentage = Number.parseFloat(percentage) || 0;

  const resolveLevel = (rawLevel, perc) => {
    const normalized = (rawLevel || "").toString().trim().toLowerCase();

    if (normalized === "fail") return "Fail";
    if (normalized === "expert") return "Expert";
    if (normalized === "intermediate") return "Intermediate";
    if (normalized === "beginner") return "Beginner";

    if (perc >= 90) return "Expert";
    if (perc >= 70) return "Intermediate";
    if (perc >= 50) return "Beginner";
    return "Fail";
  };

  const resolvedLevel = resolveLevel(level, numericPercentage);

  const passed = result === "Pass";

  // Determine colors based on performance
  const getScoreColor = (perc) => {
    if (perc >= 90) return "text-green-600";
    if (perc >= 70) return "text-blue-600";
    if (perc >= 50) return "text-amber-600";
    return "text-orange-600";
  };

  const getLevelBg = (lv) => {
    if (lv === "Fail") return "bg-rose-100 text-rose-800 border-rose-300";
    if (lv === "Expert") return "bg-green-100 text-green-800 border-green-300";
    if (lv === "Intermediate") return "bg-blue-100 text-blue-800 border-blue-300";
    return "bg-yellow-100 text-yellow-800 border-yellow-300";
  };

  const handleDownloadCertificate = async () => {
    if (!certificateRef.current) return;

    setIsGeneratingPdf(true);

    // Temporarily remove transform scaling from parent to prevent html2canvas bounding box bugs
    const wrapper = certificateRef.current.parentElement;
    const originalTransform = wrapper.style.transform;
    wrapper.style.transform = "none";

    try {
      // Capture the certificate component as a canvas
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2, // High resolution
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff"
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);

      // Calculate PDF dimensions to perfectly match component dimensions
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [800, 600]
      });

      pdf.addImage(imgData, 'JPEG', 0, 0, 800, 600);
      pdf.save(`${resolvedDomain.replace(/\s+/g, '_')}_Certificate.pdf`);

    } catch (error) {
      alert("Failed to generate certificate PDF");
      console.error(error);
    } finally {
      // Restore parent scaling
      wrapper.style.transform = originalTransform;
      setIsGeneratingPdf(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();

    if (!feedbackForm.rating) {
      setFeedbackMessage("Please select a rating before submitting.");
      return;
    }

    try {
      setFeedbackSubmitting(true);
      setFeedbackMessage("");

      await axios.post("/assessment/feedback", {
        domainId: resultData?.domainId || resultData?.domain_id || null,
        rating: parseInt(feedbackForm.rating, 10),
        comment: feedbackForm.comment.trim(),
        result,
        percentage,
      });

      setFeedbackSubmitted(true);
      setFeedbackMessage("Thank you. Your feedback has been submitted successfully.");
    } catch (err) {
      setFeedbackMessage(err.response?.data?.message || "Failed to submit feedback. Please try again.");
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  return (
    <StudentLayout>
      <div className="max-w-2xl mx-auto py-8 px-4">
        {/* Success/Failure Banner */}
        <div
          className={`p-8 rounded-xl mb-8 text-center ${passed
            ? "bg-linear-to-r from-green-50 to-emerald-50 border-2 border-green-500"
            : "bg-linear-to-r from-orange-50 to-red-50 border-2 border-orange-500"
            }`}
        >
          <div className={`text-5xl font-bold mb-3 ${passed ? "text-green-600" : "text-orange-600"}`}>
            {passed ? "🎉" : "💪"}
          </div>
          <h1 className={`text-3xl font-bold mb-2 ${passed ? "text-green-700" : "text-orange-700"}`}>
            {passed ? "Assessment Passed!" : "Assessment Completed"}
          </h1>
          <p className={`text-lg ${passed ? "text-green-600" : "text-orange-600"}`}>
            {passed
              ? "Congratulations on your success!"
              : "Keep practicing to improve your score!"}
          </p>
        </div>

        {/* Score Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-gray-600 text-lg mb-3">Domain: <span className="font-bold text-blue-600">{resolvedDomain}</span></h2>
            <div className="text-6xl font-bold mb-2">
              <span className={getScoreColor(numericPercentage)}>{percentage}%</span>
            </div>
            <p className="text-gray-600">Score: <span className="font-bold text-lg">{score}/{total_questions}</span></p>
          </div>

          {/* Score Breakdown */}
          <div className="grid grid-cols-3 gap-4 mb-8 pt-8 border-t-2 border-gray-200">
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-2">Correct Answers</p>
              <p className="text-3xl font-bold text-green-600">{score}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-2">Total Questions</p>
              <p className="text-3xl font-bold text-blue-600">{total_questions}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-2">Score Percentage</p>
              <p className={`text-3xl font-bold ${getScoreColor(numericPercentage)}`}>
                {Math.round(numericPercentage)}%
              </p>
            </div>
          </div>

          {/* Skill Level Badge */}
          <div className="text-center pt-8 border-t-2 border-gray-200">
            <p className="text-gray-600 text-sm mb-3">Your Skill Level</p>
            <div className={`inline-block px-8 py-3 rounded-full font-bold text-lg border-2 ${getLevelBg(resolvedLevel)}`}>
              {resolvedLevel === "Expert" && "⭐"} {resolvedLevel} {resolvedLevel === "Intermediate" && "🚀"}
            </div>
            <p className="text-gray-600 text-sm mt-3">
              {resolvedLevel === "Fail" && "Attempt marked as fail. Keep practicing and reattempt to reach beginner level."}
              {resolvedLevel === "Expert" && "Outstanding performance! You've mastered this skill domain."}
              {resolvedLevel === "Intermediate" && "Good progress! Continue practicing to become an expert."}
              {resolvedLevel === "Beginner" && "Keep learning! Practice regularly to improve your skills."}
            </p>
          </div>
        </div>

        {/* Certificate Section */}
        {passed && (
          <div className="bg-blue-50 border-2 border-blue-400 rounded-xl p-6 mb-8 flex flex-col items-center">
            <div className="flex items-center gap-3 mb-6 w-full justify-center">
              <span className="text-3xl">📜</span>
              <div>
                <h3 className="font-bold text-blue-800 text-xl text-center">Certificate Generated</h3>
                <p className="text-blue-600 text-center">Here is your official verification certificate</p>
              </div>
            </div>

            {/* Display the beautiful certificate */}
            <div className="w-full overflow-x-auto pb-8 pt-4 flex justify-center items-center" style={{ minHeight: "550px", scrollbarWidth: "none" }}>
              <div style={{ transform: "scale(0.85)", transformOrigin: "center" }}>
                <Certificate
                  certificateRef={certificateRef}
                  studentName={studentName}
                  domainName={resolvedDomain}
                  score={percentage}
                  level={resolvedLevel}
                  date={new Date(resolvedTimestamp).toLocaleDateString()}
                />
              </div>
            </div>

            <button
              onClick={handleDownloadCertificate}
              disabled={isGeneratingPdf}
              className={`w-full max-w-md mt-2 text-white py-3 px-6 rounded-lg font-bold transition flex justify-center items-center gap-2 shadow-lg hover:shadow-xl ${isGeneratingPdf ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 hover:-translate-y-1"
                }`}
            >
              {isGeneratingPdf ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  Generating PDF...
                </>
              ) : (
                <>
                  <span>📥</span> Download Certificate (PDF)
                </>
              )}
            </button>
          </div>
        )}

        {/* Additional Info */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <p className="text-gray-600 text-sm">
            <span className="font-bold">Attempt Date:</span> {new Date(resolvedTimestamp).toLocaleString()}
          </p>
          {!passed && resolvedLevel !== "Expert" && (
            <p className="text-gray-600 text-sm mt-2">
              <span className="font-bold text-orange-600">💡 Tip:</span> Review the material and try again after 72 hours to improve your score.
            </p>
          )}
        </div>

        {/* Feedback Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-slate-200/70">
          <h3 className="text-xl font-bold text-slate-900 mb-2">How was your assessment experience?</h3>
          <p className="text-slate-600 text-sm mb-4">Your feedback helps improve question quality and assessment experience.</p>

          {feedbackSubmitted ? (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-700 text-sm font-semibold">
              {feedbackMessage}
            </div>
          ) : (
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Rating</label>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFeedbackForm((prev) => ({ ...prev, rating: String(value) }))}
                      className={`px-4 py-2 rounded-lg border font-semibold transition ${
                        feedbackForm.rating === String(value)
                          ? "bg-cyan-600 text-white border-cyan-700"
                          : "bg-white text-slate-700 border-slate-300 hover:border-cyan-500"
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Comments (optional)</label>
                <textarea
                  value={feedbackForm.comment}
                  onChange={(e) => setFeedbackForm((prev) => ({ ...prev, comment: e.target.value }))}
                  placeholder="Share your suggestions about the assessment experience"
                  className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  rows={3}
                />
              </div>

              {feedbackMessage && (
                <p className="text-sm text-rose-700">{feedbackMessage}</p>
              )}

              <button
                type="submit"
                disabled={feedbackSubmitting}
                className="bg-linear-to-r from-teal-500 to-cyan-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:from-teal-600 hover:to-cyan-700 disabled:opacity-50"
              >
                {feedbackSubmitting ? "Submitting..." : "Submit Feedback"}
              </button>
            </form>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => navigate("/student/dashboard")}
            className="bg-blue-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-blue-700 transition"
          >
            Return to Dashboard
          </button>
          <button
            onClick={() => navigate("/student/history")}
            className="bg-gray-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-gray-700 transition"
          >
            View All Results
          </button>
        </div>
      </div>
    </StudentLayout>
  );
}

export default ResultsPage;
