import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/axiosInstance";
import StudentLayout from "../../components/layouts/StudentLayout";

function MySkillsPage() {
  const navigate = useNavigate();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSkills();
  }, []);

  const resolveLevel = (rawLevel, percentage = 0) => {
    if (typeof rawLevel === "string" && rawLevel.trim()) {
      const normalized = rawLevel.trim().toLowerCase();
      if (normalized.startsWith("fail")) return "Fail";
      if (normalized.startsWith("expert")) return "Expert";
      if (normalized.startsWith("inter")) return "Intermediate";
      if (normalized.startsWith("begin")) return "Beginner";
    }

    if (percentage >= 90) return "Expert";
    if (percentage >= 70) return "Intermediate";
    if (percentage >= 50) return "Beginner";
    return "Fail";
  };

  const fetchSkills = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get("/assessment/my-results");
      if (response.data.status === "success") {
        // Group results by domain and get the best score
        const skillsMap = {};
        
        response.data.data.forEach((attempt) => {
          const domainKey = attempt.domain;
          
          if (!skillsMap[domainKey]) {
            const attemptPercentage = parseFloat(attempt.percentage || 0);
            skillsMap[domainKey] = {
              domain: attempt.domain,
              bestScore: attempt.score,
              bestPercentage: attemptPercentage,
              bestLevel: resolveLevel(attempt.level, attemptPercentage),
              attempts: 1
            };
          } else {
            skillsMap[domainKey].attempts += 1;
            // Update if this is a better score
            if (parseFloat(attempt.percentage) > skillsMap[domainKey].bestPercentage) {
              const attemptPercentage = parseFloat(attempt.percentage || 0);
              skillsMap[domainKey].bestScore = attempt.score;
              skillsMap[domainKey].bestPercentage = attemptPercentage;
              skillsMap[domainKey].bestLevel = resolveLevel(attempt.level, attemptPercentage);
            }
          }
        });

        // Convert to array and sort by best percentage (descending)
        const skillsArray = Object.values(skillsMap).sort(
          (a, b) => b.bestPercentage - a.bestPercentage
        );
        
        setSkills(skillsArray);
      }
    } catch (err) {
      setError("Failed to load skills data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level) => {
    if (level === "Fail") return "bg-rose-100 text-rose-800 border-rose-300";
    if (level === "Expert") return "bg-emerald-100 text-emerald-800 border-emerald-300";
    if (level === "Intermediate") return "bg-cyan-100 text-cyan-800 border-cyan-300";
    return "bg-amber-100 text-amber-800 border-amber-300";
  };

  const getLevelTag = (level) => {
    if (level === "Fail") return "FL";
    if (level === "Expert") return "EX";
    if (level === "Intermediate") return "IN";
    return "BG";
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return "bg-green-500";
    if (percentage >= 70) return "bg-blue-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg font-semibold text-gray-700">Loading your skills...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Skills</h1>
          <p className="text-gray-600">View your skill levels and proficiency across all domains</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-500 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {skills.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-5xl mb-4">🎯</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Skills Yet</h2>
            <p className="text-gray-600 mb-6">
              You haven't completed any skill assessments yet. Start your first assessment to build your skill profile!
            </p>
            <button
              onClick={() => navigate("/student/dashboard")}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-600">
                <p className="text-gray-600 text-sm mb-2">Total Skills Assessed</p>
                <p className="text-4xl font-bold text-blue-600">{skills.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-600">
                <p className="text-gray-600 text-sm mb-2">Expert Skills</p>
                <p className="text-4xl font-bold text-green-600">
                  {skills.filter((s) => resolveLevel(s.bestLevel, s.bestPercentage) === "Expert").length}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-600">
                <p className="text-gray-600 text-sm mb-2">Average Score</p>
                <p className="text-4xl font-bold text-purple-600">
                  {(skills.reduce((sum, s) => sum + s.bestPercentage, 0) / skills.length).toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Skills Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {skills.map((skill, index) => (
                (() => {
                  const level = resolveLevel(skill.bestLevel, skill.bestPercentage);
                  return (
                <div
                  key={index}
                  className="bg-white/95 rounded-3xl shadow-xl p-6 hover:shadow-2xl transition border border-slate-200/70"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex-1">
                      <p className="text-xs uppercase tracking-wide font-semibold text-slate-500 mb-1">Domain</p>
                      <h3 className="text-2xl font-bold text-slate-900 mb-1 leading-tight">{skill.domain}</h3>
                      <p className="text-slate-600 text-sm">
                        {skill.attempts} {skill.attempts === 1 ? "attempt" : "attempts"}
                      </p>
                    </div>
                    <div className="inline-flex items-center justify-center h-11 w-11 rounded-xl bg-slate-900 text-white text-sm font-bold">
                      {getLevelTag(level)}
                    </div>
                  </div>

                  {/* Score */}
                  <div className="mb-5 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <p className="text-slate-600 text-sm mb-1 font-medium">Best Score</p>
                    <p className="text-4xl font-bold text-cyan-700 tracking-tight">{skill.bestPercentage.toFixed(2)}%</p>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-5">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-slate-600 text-sm font-semibold">Proficiency</p>
                      <span className="text-sm font-bold text-slate-700">{Math.round(skill.bestPercentage)}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
                      <div
                        className={`h-full ${getProgressColor(skill.bestPercentage)} transition-all duration-500`}
                        style={{ width: `${skill.bestPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Level Badge */}
                  <div className="mb-5">
                    <p className="text-slate-600 text-sm mb-2 font-semibold">Current Level</p>
                    <div
                      className={`inline-flex items-center px-4 py-2 rounded-full font-bold text-sm border ${getLevelColor(
                        level
                      )}`}
                    >
                      {level}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-4 border-t border-slate-200">
                    <button
                      onClick={() => navigate("/student/dashboard")}
                      className="w-full bg-linear-to-r from-teal-500 to-cyan-600 text-white py-2.5 rounded-xl font-semibold hover:from-teal-600 hover:to-cyan-700 transition text-sm"
                    >
                      Retake Assessment
                    </button>
                  </div>

                  {/* Insight */}
                  <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-xs text-slate-700 leading-5">
                      {level === "Expert"
                        ? "Excellent performance. You have demonstrated strong mastery in this domain."
                        : level === "Intermediate"
                        ? "Strong progress so far. Additional practice can help you reach expert level."
                        : level === "Fail"
                        ? "This domain is currently below beginner threshold. Reattempt after practice to improve your score."
                        : "Continue practicing consistently to improve your proficiency in this domain."}
                    </p>
                  </div>
                </div>
                  );
                })()
              ))}
            </div>
          </>
        )}
      </div>
    </StudentLayout>
  );
}

export default MySkillsPage;
