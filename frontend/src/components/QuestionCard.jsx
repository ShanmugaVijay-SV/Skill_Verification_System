function QuestionCard({ question, selectedAnswer, onAnswerSelect, questionNumber }) {
  const options = [
    { id: "a", text: question.option_a },
    { id: "b", text: question.option_b },
    { id: "c", text: question.option_c },
    { id: "d", text: question.option_d }
  ];

  return (
    <div className="bg-white/95 p-8 rounded-3xl shadow-xl border border-slate-200/70">
      {/* Question Number and Text */}
      <div className="mb-6">
        <span className="inline-block bg-cyan-100 text-cyan-800 px-4 py-1 rounded-full text-sm font-semibold mb-3 border border-cyan-200">
          Question {questionNumber}
        </span>
        <h2 className="text-3xl font-bold text-slate-900 leading-relaxed tracking-tight">
          {question.question_text}
        </h2>
      </div>

      {/* Options */}
      <div className="space-y-4">
        {options.map((option) => (
          <label
            key={option.id}
            className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
              selectedAnswer === option.id
                ? "border-cyan-600 bg-cyan-50"
                : "border-slate-300 bg-slate-50 hover:border-cyan-400"
            }`}
          >
            <input
              type="radio"
              name={`question-${question.id}`}
              value={option.id}
              checked={selectedAnswer === option.id}
              onChange={(e) => onAnswerSelect(e.target.value)}
              className="w-5 h-5 text-cyan-600 cursor-pointer accent-cyan-600"
            />
            <span className={`ml-4 text-lg ${
              selectedAnswer === option.id
                ? "font-semibold text-cyan-800"
                : "text-slate-700"
            }`}>
              <strong>{option.id.toUpperCase()}.</strong> {option.text}
            </span>
          </label>
        ))}
      </div>

      {/* Visual Indicator */}
      {selectedAnswer && (
        <div className="mt-6 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
          <p className="text-sm text-emerald-700 font-medium">
            ✓ You selected option <strong>{selectedAnswer.toUpperCase()}</strong>
          </p>
        </div>
      )}
    </div>
  );
}

export default QuestionCard;
