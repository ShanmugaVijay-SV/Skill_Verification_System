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
            skillsMap[domainKey] = {
              domain: attempt.domain,
              bestScore: attempt.score,
              bestPercentage: parseFloat(attempt.percentage),
              bestLevel: attempt.level,
              attempts: 1
            };
          } else {
            skillsMap[domainKey].attempts += 1;
            // Update if this is a better score
            if (parseFloat(attempt.percentage) > skillsMap[domainKey].bestPercentage) {
              skillsMap[domainKey].bestScore = attempt.score;
              skillsMap[domainKey].bestPercentage = parseFloat(attempt.percentage);
              skillsMap[domainKey].bestLevel = attempt.level;
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
    if (level === "Expert") return "bg-green-100 text-green-800 border-green-300";
    if (level === "Intermediate") return "bg-blue-100 text-blue-800 border-blue-300";
    return "bg-yellow-100 text-yellow-800 border-yellow-300";
  };

  const getLevelIcon = (level) => {
    if (level === "Expert") return "⭐";
    if (level === "Intermediate") return "🚀";
    return "📘";
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-blue-500";
    if (percentage >= 40) return "bg-yellow-500";
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
                  {skills.filter((s) => s.bestLevel === "Expert").length}
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
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition border-t-4 border-blue-600"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-1">{skill.domain}</h3>
                      <p className="text-gray-600 text-sm">
                        {skill.attempts} {skill.attempts === 1 ? "attempt" : "attempts"}
                      </p>
                    </div>
                    <div className={`text-3xl ${getLevelIcon(skill.bestLevel)}`}></div>
                  </div>

                  {/* Score */}
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 text-sm mb-1">Best Score</p>
                    <p className="text-3xl font-bold text-blue-600">{skill.bestPercentage.toFixed(2)}%</p>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-gray-600 text-sm font-semibold">Proficiency</p>
                      <span className="text-sm font-bold text-gray-700">{Math.round(skill.bestPercentage)}%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getProgressColor(skill.bestPercentage)} transition-all`}
                        style={{ width: `${skill.bestPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Level Badge */}
                  <div className="mb-4">
                    <p className="text-gray-600 text-sm mb-2">Current Level</p>
                    <div
                      className={`inline-block px-4 py-2 rounded-full font-bold text-sm border-2 ${getLevelColor(
                        skill.bestLevel
                      )}`}
                    >
                      {getLevelIcon(skill.bestLevel)} {skill.bestLevel}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={() => navigate("/student/dashboard")}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition text-sm"
                    >
                      Retake Assessment
                    </button>
                  </div>

                  {/* Insight */}
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-700">
                      {skill.bestLevel === "Expert"
                        ? "🌟 Outstanding! You've mastered this skill."
                        : skill.bestLevel === "Intermediate"
                        ? "📈 Good progress! Keep practicing to reach Expert level."
                        : "💪 Keep learning! You'll reach higher levels with more practice."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </StudentLayout>
  );
}

export default MySkillsPage;
