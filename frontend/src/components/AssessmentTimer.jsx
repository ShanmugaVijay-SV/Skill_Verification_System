import { useEffect, useState } from "react";

function AssessmentTimer({ timeLimit, onTimeUp }) {
  const [timeLeft, setTimeLeft] = useState(timeLimit * 60); // Convert minutes to seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isLowTime = timeLeft < 300; // Less than 5 minutes

  return (
    <div className={`flex items-center justify-center p-4 rounded-2xl border ${
      isLowTime ? "bg-rose-50 border-rose-300" : "bg-cyan-50 border-cyan-200"
    }`}>
      <div className="text-center">
        <p className={`text-sm font-semibold ${isLowTime ? "text-rose-700" : "text-cyan-700"}`}>
          Time Remaining
        </p>
        <p className={`text-4xl font-bold tabular-nums ${isLowTime ? "text-rose-600" : "text-cyan-800"}`}>
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </p>
        {isLowTime && (
          <p className="text-xs text-rose-600 mt-1">Time is running out</p>
        )}
      </div>
    </div>
  );
}

export default AssessmentTimer;
