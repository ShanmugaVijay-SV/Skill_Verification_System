function QuestionCard({ question, selectedAnswer, onAnswerSelect, questionNumber }) {
  const options = [
    { id: "a", text: question.option_a },
    { id: "b", text: question.option_b },
    { id: "c", text: question.option_c },
    { id: "d", text: question.option_d }
  ];

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg">
      {/* Question Number and Text */}
      <div className="mb-6">
        <span className="inline-block bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold mb-3">
          Question {questionNumber}
        </span>
        <h2 className="text-2xl font-bold text-gray-800 leading-relaxed">
          {question.question_text}
        </h2>
      </div>

      {/* Options */}
      <div className="space-y-4">
        {options.map((option) => (
          <label
            key={option.id}
            className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
              selectedAnswer === option.id
                ? "border-blue-600 bg-blue-50"
                : "border-gray-300 bg-gray-50 hover:border-blue-400"
            }`}
          >
            <input
              type="radio"
              name={`question-${question.id}`}
              value={option.id}
              checked={selectedAnswer === option.id}
              onChange={(e) => onAnswerSelect(e.target.value)}
              className="w-5 h-5 text-blue-600 cursor-pointer accent-blue-600"
            />
            <span className={`ml-4 text-lg ${
              selectedAnswer === option.id
                ? "font-semibold text-blue-700"
                : "text-gray-700"
            }`}>
              <strong>{option.id.toUpperCase()}.</strong> {option.text}
            </span>
          </label>
        ))}
      </div>

      {/* Visual Indicator */}
      {selectedAnswer && (
        <div className="mt-6 p-3 bg-green-50 border border-green-300 rounded-lg">
          <p className="text-sm text-green-700">
            ✓ You selected option <strong>{selectedAnswer.toUpperCase()}</strong>
          </p>
        </div>
      )}
    </div>
  );
}

export default QuestionCard;
