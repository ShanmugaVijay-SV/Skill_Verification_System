function ProgressBar({ current, total }) {
  const percentage = (current / total) * 100;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm font-semibold text-gray-700">
          Question {current} of {total}
        </p>
        <p className="text-sm font-semibold text-blue-600">{Math.round(percentage)}%</p>
      </div>
      <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
        <div
          className="bg-blue-600 h-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

export default ProgressBar;
