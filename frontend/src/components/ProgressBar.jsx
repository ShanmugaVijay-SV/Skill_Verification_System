function ProgressBar({ current, total }) {
  const percentage = (current / total) * 100;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm font-semibold text-slate-700">
          Question {current} of {total}
        </p>
        <p className="text-sm font-semibold text-cyan-700">{Math.round(percentage)}%</p>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden border border-slate-300">
        <div
          className="bg-linear-to-r from-cyan-500 to-teal-500 h-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

export default ProgressBar;
