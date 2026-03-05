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
    <div className={`flex items-center justify-center p-4 rounded-lg ${
      isLowTime ? "bg-red-100 border-2 border-red-500" : "bg-blue-100 border-2 border-blue-500"
    }`}>
      <div className="text-center">
        <p className={`text-sm font-semibold ${isLowTime ? "text-red-700" : "text-blue-700"}`}>
          Time Remaining
        </p>
        <p className={`text-3xl font-bold tabular-nums ${isLowTime ? "text-red-600" : "text-blue-600"}`}>
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </p>
        {isLowTime && (
          <p className="text-xs text-red-600 mt-1">⚠️ Time is running out!</p>
        )}
      </div>
    </div>
  );
}

export default AssessmentTimer;
