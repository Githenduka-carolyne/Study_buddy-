import React, { useState } from 'react';

const QuizQuestion = ({ question, options, correctAnswer }) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
    setShowResult(true);
  };

  const isCorrect = selectedAnswer === correctAnswer;

  return (
    <div className="space-y-4">
      <p className="font-medium text-gray-900">{question}</p>
      <div className="space-y-2">
        {options.map((option, index) => (
          <label
            key={index}
            className="flex items-center space-x-3 p-2 rounded-lg cursor-pointer hover:bg-gray-50"
          >
            <input
              type="radio"
              name={question}
              value={option}
              checked={selectedAnswer === option}
              onChange={() => handleAnswerSelect(option)}
              className={`h-4 w-4 border-gray-300 ${
                showResult && selectedAnswer === option
                  ? isCorrect
                    ? 'text-green-600 focus:ring-green-500'
                    : 'text-red-600 focus:ring-red-500'
                  : 'text-blue-600 focus:ring-blue-500'
              }`}
              disabled={showResult}
            />
            <span className={`text-sm ${
              showResult && selectedAnswer === option
                ? isCorrect
                  ? 'text-green-700'
                  : 'text-red-700'
                : 'text-gray-700'
            }`}>
              {option}
            </span>
          </label>
        ))}
      </div>
      {showResult && (
        <div className={`mt-4 p-3 rounded-lg ${
          isCorrect ? 'bg-green-50' : 'bg-red-50'
        }`}>
          <p className={`text-sm font-medium ${
            isCorrect ? 'text-green-800' : 'text-red-800'
          }`}>
            {isCorrect ? (
              '✓ Correct!'
            ) : (
              <>
                ✗ Wrong. The correct answer is: <span className="font-bold">{correctAnswer}</span>
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default QuizQuestion;
