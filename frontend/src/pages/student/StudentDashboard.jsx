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
  const user = JSON.parse(localStorage.getItem("user") || "{}");

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
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-600 mx-auto mb-4"></div>
            <p className="text-lg font-semibold text-slate-700">Loading skills...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  const domainStatusList = domains.map((domain) => {
    const cooldown = cooldowns[domain.id] || {};
    const canAttempt = cooldown?.canAttempt || false;
    const nextAttemptDate = cooldown?.nextAttemptDate ? new Date(cooldown.nextAttemptDate) : null;

    return {
      ...domain,
      canAttempt,
      hoursRemaining: parseFloat(cooldown?.hoursRemaining || 0),
      nextAttemptDate,
    };
  });

  const readyDomains = domainStatusList.filter((d) => d.canAttempt);
  const lockedDomains = domainStatusList
    .filter((d) => !d.canAttempt && d.nextAttemptDate)
    .sort((a, b) => a.nextAttemptDate - b.nextAttemptDate);
  const soonestUnlock = lockedDomains[0] || null;
  const recommendedDomain = readyDomains[0] || null;
  const readinessScore = domains.length > 0 ? Math.round((readyDomains.length / domains.length) * 100) : 0;

  return (
    <StudentLayout>
      <div className="max-w-6xl mx-auto py-8">
        {/* Header */}
        <div className="mb-12 rounded-3xl border border-white/60 bg-white/75 backdrop-blur-sm shadow-xl shadow-slate-200/60 p-8">
          <span className="inline-flex items-center rounded-full bg-amber-100 px-4 py-1 text-sm font-semibold text-amber-800 mb-4">
            Explore and verify your strongest skills
          </span>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Skill Assessment Center</h1>
          <p className="text-slate-600 text-lg max-w-3xl">
            Welcome back{user?.name ? `, ${user.name}` : ""}. Select a skill domain and take the assessment to verify your knowledge level.
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-rose-50 border border-rose-300 rounded-xl text-rose-700 shadow-sm">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-linear-to-br from-teal-600 to-cyan-700 p-6 rounded-2xl shadow-lg text-white">
            <h3 className="text-teal-50 text-sm font-semibold mb-2">Available Skills</h3>
            <p className="text-3xl font-bold">{domains.length}</p>
          </div>
          <div className="bg-linear-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl shadow-lg text-white">
            <h3 className="text-emerald-50 text-sm font-semibold mb-2">Ready to Attempt</h3>
            <p className="text-3xl font-bold">
              {Object.values(cooldowns).filter((c) => c.canAttempt).length}
            </p>
          </div>
          <div className="bg-linear-to-br from-amber-400 to-orange-500 p-6 rounded-2xl shadow-lg text-white">
            <h3 className="text-amber-50 text-sm font-semibold mb-2">In Cooldown</h3>
            <p className="text-3xl font-bold">
              {Object.values(cooldowns).filter((c) => !c.canAttempt).length}
            </p>
          </div>
        </div>

        {/* Utility Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <div className="lg:col-span-2 bg-white/90 rounded-3xl shadow-xl border border-slate-200/70 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-5">What You Can Do Now</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => navigate("/student/myskills")}
                className="text-left rounded-2xl border border-slate-200 bg-slate-50 p-4 hover:bg-white hover:shadow-md transition"
              >
                <p className="text-sm text-slate-500">My Skills</p>
                <p className="text-lg font-semibold text-slate-900 mt-1">View strengths</p>
              </button>
              <button
                onClick={() => navigate("/student/history")}
                className="text-left rounded-2xl border border-slate-200 bg-slate-50 p-4 hover:bg-white hover:shadow-md transition"
              >
                <p className="text-sm text-slate-500">History</p>
                <p className="text-lg font-semibold text-slate-900 mt-1">Track attempts</p>
              </button>
              <button
                onClick={() => navigate("/student/profile")}
                className="text-left rounded-2xl border border-slate-200 bg-slate-50 p-4 hover:bg-white hover:shadow-md transition"
              >
                <p className="text-sm text-slate-500">Profile</p>
                <p className="text-lg font-semibold text-slate-900 mt-1">Update details</p>
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm font-semibold text-emerald-700">Recommended Next Attempt</p>
                {recommendedDomain ? (
                  <>
                    <p className="text-lg font-bold text-emerald-900 mt-1">{recommendedDomain.name}</p>
                    <p className="text-xs text-emerald-700 mt-1">Ready now for your next attempt</p>
                  </>
                ) : (
                  <p className="text-sm text-emerald-800 mt-1">No domain ready right now</p>
                )}
              </div>

              <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4">
                <p className="text-sm font-semibold text-cyan-700">Readiness Score</p>
                <p className="text-2xl font-bold text-cyan-900 mt-1">{readinessScore}%</p>
                <p className="text-xs text-cyan-700 mt-1">Based on domains currently unlocked for attempt</p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 rounded-3xl shadow-xl border border-slate-200/70 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-5">Cooldown Timeline</h2>
            {lockedDomains.length > 0 ? (
              <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                {lockedDomains.slice(0, 6).map((domain) => (
                  <div key={domain.id} className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                    <p className="font-semibold text-amber-900">{domain.name}</p>
                    <p className="text-xs text-amber-800 mt-1">
                      Unlocks in {formatTimeRemaining(domain.hoursRemaining)}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      {domain.nextAttemptDate?.toLocaleDateString()} at {domain.nextAttemptDate?.toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 text-sm">
                No active cooldowns. You can attempt all available domains now.
              </div>
            )}

            {soonestUnlock && (
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs uppercase text-slate-500 font-semibold">Next Unlock</p>
                <p className="text-sm font-bold text-slate-900 mt-1">{soonestUnlock.name}</p>
              </div>
            )}
          </div>
        </div>

        {/* Domains Grid */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Available Skills</h2>
          <p className="text-slate-600 mb-6">Choose a domain below to begin or continue your assessment journey.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {domains.map((domain) => {
              const cooldown = cooldowns[domain.id];
              const canAttempt = cooldown?.canAttempt || false;
              const hoursRemaining = cooldown?.hoursRemaining;

              return (
                <div
                  key={domain.id}
                  className={`rounded-3xl shadow-lg overflow-hidden transition transform hover:shadow-xl hover:-translate-y-1 ${
                    canAttempt ? "bg-white border border-slate-200" : "bg-white border border-slate-200/90"
                  }`}
                >
                  {/* Card Header */}
                  <div className="p-5 border-b border-slate-200 bg-slate-50">
                    <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-1">Domain</p>
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-2xl font-bold text-slate-900 leading-tight">{domain.name}</h3>
                      <span
                        className={`inline-flex h-2.5 w-2.5 rounded-full ${
                          canAttempt ? "bg-emerald-500" : "bg-amber-500"
                        }`}
                        aria-hidden="true"
                      ></span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-4">
                    <p className="text-slate-700 text-sm leading-6 min-h-12">
                      {domain.description || "Test your knowledge in this domain"}
                    </p>

                    {/* Status Badge */}
                    {!canAttempt && cooldown?.nextAttemptDate ? (
                      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3">
                        <p className="text-sm font-semibold text-amber-800 mb-1">Cooldown Active</p>
                        <p className="text-xs text-amber-700 mb-1">
                          {formatTimeRemaining(parseFloat(hoursRemaining))} remaining
                        </p>
                        <p className="text-xs text-slate-600">
                          Next available: {new Date(cooldown.nextAttemptDate).toLocaleDateString()} at{" "}
                          {new Date(cooldown.nextAttemptDate).toLocaleTimeString()}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
                        <p className="text-sm font-semibold text-emerald-700">Ready to Attempt</p>
                      </div>
                    )}

                    {/* Button */}
                    <button
                      onClick={() => handleStartAssessment(domain.id, canAttempt)}
                      disabled={!canAttempt || domain.question_count === 0}
                      className={`w-full py-2.5 px-4 rounded-xl font-semibold transition ${
                        canAttempt && domain.question_count > 0
                          ? "bg-slate-900 text-white hover:bg-slate-800"
                          : "bg-slate-300 text-slate-500 cursor-not-allowed"
                      }`}
                    >
                      {canAttempt ? "Start Assessment" : "Assessment Locked"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {domains.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-600 text-lg">No skill domains available yet.</p>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}

export default StudentDashboard;
