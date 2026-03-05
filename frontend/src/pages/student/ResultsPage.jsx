import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import StudentLayout from "../../components/layouts/StudentLayout";

function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const passed = result === "Pass";

  // Determine colors based on performance
  const getScoreColor = (perc) => {
    if (perc >= 80) return "text-green-600";
    if (perc >= 60) return "text-blue-600";
    return "text-orange-600";
  };

  const getLevelBg = (lv) => {
    if (lv === "Expert") return "bg-green-100 text-green-800 border-green-300";
    if (lv === "Intermediate") return "bg-blue-100 text-blue-800 border-blue-300";
    return "bg-yellow-100 text-yellow-800 border-yellow-300";
  };

  const handleDownloadCertificate = async () => {
    if (certificate_path) {
      try {
        const response = await fetch(`http://localhost:5000${certificate_path}`);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${domain_name}-certificate.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (error) {
        alert("Failed to download certificate");
        console.error(error);
      }
    }
  };

  return (
    <StudentLayout>
      <div className="max-w-2xl mx-auto py-8 px-4">
        {/* Success/Failure Banner */}
        <div
          className={`p-8 rounded-xl mb-8 text-center ${
            passed
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
            <h2 className="text-gray-600 text-lg mb-3">Domain: <span className="font-bold text-blue-600">{domain_name}</span></h2>
            <div className="text-6xl font-bold mb-2">
              <span className={getScoreColor(parseFloat(percentage))}>{percentage}%</span>
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
              <p className={`text-3xl font-bold ${getScoreColor(parseFloat(percentage))}`}>
                {Math.round(parseFloat(percentage))}%
              </p>
            </div>
          </div>

          {/* Skill Level Badge */}
          <div className="text-center pt-8 border-t-2 border-gray-200">
            <p className="text-gray-600 text-sm mb-3">Your Skill Level</p>
            <div className={`inline-block px-8 py-3 rounded-full font-bold text-lg border-2 ${getLevelBg(level)}`}>
              {level === "Expert" && "⭐"} {level} {level === "Intermediate" && "🚀"}
            </div>
            <p className="text-gray-600 text-sm mt-3">
              {level === "Expert" && "Outstanding performance! You've mastered this skill domain."}
              {level === "Intermediate" && "Good progress! Continue practicing to become an expert."}
              {level === "Beginner" && "Keep learning! Practice regularly to improve your skills."}
            </p>
          </div>
        </div>

        {/* Certificate Section */}
        {passed && certificate_path && (
          <div className="bg-blue-50 border-2 border-blue-400 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">📜</span>
              <div>
                <h3 className="font-bold text-blue-800">Certificate Generated</h3>
                <p className="text-blue-600 text-sm">Download your Skill Verification Certificate</p>
              </div>
            </div>
            <button
              onClick={handleDownloadCertificate}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition"
            >
              Download Certificate (PDF)
            </button>
          </div>
        )}

        {/* Additional Info */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <p className="text-gray-600 text-sm">
            <span className="font-bold">Attempt Date:</span> {new Date(timestamp).toLocaleString()}
          </p>
          {!passed && level !== "Expert" && (
            <p className="text-gray-600 text-sm mt-2">
              <span className="font-bold text-orange-600">💡 Tip:</span> Review the material and try again after 72 hours to improve your score.
            </p>
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
