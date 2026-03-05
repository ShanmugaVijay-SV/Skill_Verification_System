import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/axiosInstance";
import StudentLayout from "../../components/layouts/StudentLayout";

function StudentDashboard() {
  const [domains, setDomains] = useState([]);
  const [cooldowns, setCooldowns] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchDomainsAndCooldowns();
  }, []);

  const fetchDomainsAndCooldowns = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch domains
      const domainResponse = await axios.get("/domains");
      if (domainResponse.data.status === "success") {
        setDomains(domainResponse.data.data);

        // Check cooldown for each domain
        const cooldownPromises = domainResponse.data.data.map((domain) =>
          axios
            .get(`/assessment/cooldown/${domain.id}`)
            .then((res) => ({
              domainId: domain.id,
              data: res.data
            }))
            .catch((err) => ({
              domainId: domain.id,
              data: err.response?.data
            }))
        );

        const cooldownResults = await Promise.all(cooldownPromises);
        const cooldownMap = {};
        cooldownResults.forEach((result) => {
          cooldownMap[result.domainId] = result.data;
        });
        setCooldowns(cooldownMap);
      }
    } catch (err) {
      setError("Failed to load domains. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartAssessment = (domainId, canAttempt) => {
    if (!canAttempt) {
      alert("You are in cooldown period. Please wait before retaking this assessment.");
      return;
    }
    navigate(`/student/assessment/${domainId}`);
  };

  const formatTimeRemaining = (hoursRemaining) => {
    const hours = Math.floor(hoursRemaining);
    const minutes = Math.round((hoursRemaining - hours) * 60);
    if (hours === 0) {
      return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
    }
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg font-semibold text-gray-700">Loading skills...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="max-w-6xl mx-auto py-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">Skill Assessment Center</h1>
          <p className="text-gray-600 text-lg">
            Select a skill domain and take the assessment to verify your knowledge level.
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border-2 border-red-500 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-blue-600">
            <h3 className="text-gray-600 text-sm font-semibold mb-2">Available Skills</h3>
            <p className="text-3xl font-bold text-blue-600">{domains.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-green-600">
            <h3 className="text-gray-600 text-sm font-semibold mb-2">Ready to Attempt</h3>
            <p className="text-3xl font-bold text-green-600">
              {Object.values(cooldowns).filter((c) => c.canAttempt).length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-purple-600">
            <h3 className="text-gray-600 text-sm font-semibold mb-2">In Cooldown</h3>
            <p className="text-3xl font-bold text-purple-600">
              {Object.values(cooldowns).filter((c) => !c.canAttempt).length}
            </p>
          </div>
        </div>

        {/* Domains Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Available Skills</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {domains.map((domain) => {
              const cooldown = cooldowns[domain.id];
              const canAttempt = cooldown?.canAttempt || false;
              const hoursRemaining = cooldown?.hoursRemaining;

              return (
                <div
                  key={domain.id}
                  className={`rounded-lg shadow-lg overflow-hidden transition transform hover:shadow-xl ${
                    canAttempt ? "bg-white border-2 border-green-200 hover:scale-105" : "bg-gray-50 border-2 border-gray-200"
                  }`}
                >
                  {/* Card Header */}
                  <div className={`p-6 ${canAttempt ? "bg-linear-to-r from-green-500 to-green-600" : "bg-linear-to-r from-gray-400 to-gray-500"}`}>
                    <h3 className="text-xl font-bold text-white">{domain.name}</h3>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    <p className="text-gray-700 mb-4 h-12">
                      {domain.description || "Test your knowledge in this domain"}
                    </p>

                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-gray-600">Questions Available:</span>
                        <span className="text-lg font-bold text-blue-600">{domain.question_count || 0}</span>
                      </div>
                      {domain.question_count === 0 && (
                        <p className="text-xs text-red-600">❌ No questions available yet</p>
                      )}
                    </div>

                    {/* Status Badge */}
                    {!canAttempt && cooldown?.nextAttemptDate ? (
                      <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-6">
                        <p className="text-sm font-semibold text-red-700 mb-2">⏳ Cooldown Active</p>
                        <p className="text-xs text-red-600 mb-2">
                          {formatTimeRemaining(parseFloat(hoursRemaining))} remaining
                        </p>
                        <p className="text-xs text-gray-600">
                          Next available: {new Date(cooldown.nextAttemptDate).toLocaleDateString()} at{" "}
                          {new Date(cooldown.nextAttemptDate).toLocaleTimeString()}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-green-50 border border-green-300 rounded-lg p-4 mb-6">
                        <p className="text-sm font-semibold text-green-700">✓ Ready to Attempt</p>
                      </div>
                    )}

                    {/* Button */}
                    <button
                      onClick={() => handleStartAssessment(domain.id, canAttempt)}
                      disabled={!canAttempt || domain.question_count === 0}
                      className={`w-full py-2 px-4 rounded-lg font-semibold transition ${
                        canAttempt && domain.question_count > 0
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-gray-400 text-gray-200 cursor-not-allowed"
                      }`}
                    >
                      {canAttempt ? "Start Assessment" : "Locked"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {domains.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No skill domains available yet.</p>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}

export default StudentDashboard;
