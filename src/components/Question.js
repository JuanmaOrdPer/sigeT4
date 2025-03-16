import React from 'react';
import { useQuiz } from '../context/QuizContext';

export const Question = ({ question, index, showResults }) => {
  const { selectedAnswers, handleAnswerSelect } = useQuiz();

  const getOptionClass = (option) => {
    let optionClass = 'option-container';
    if (showResults) {
      if (option === question.answer) {
        optionClass += ' correct';
      } else if (selectedAnswers[index] === option) {
        optionClass += ' incorrect';
      }
    }
    return optionClass;
  };

  return (
    <div 
  id={`question-${index}`} 
  className="question"
>
<h3>Pregunta {index + 1}: {question.question}</h3>
  <div className='options-container'>
    {question.options.map((option, i) => (
      <div
        key={i}
        className={getOptionClass(option)}
        onClick={() => !showResults && handleAnswerSelect(index, option)}
        style={{ cursor: !showResults ? 'pointer' : 'default' }}
      >
        <label className="option-label" style={{ width: '100%', display: 'block', cursor: 'inherit' }}>
          <input
            type="radio"
            name={`question-${index}`}
            value={option}
            readOnly={showResults}
            checked={selectedAnswers[index] === option}
            onClick={(e) => e.stopPropagation()} // Prevent double firing
          />
          <strong>{String.fromCharCode(97 + i)}</strong> {option}
        </label>
      </div>
    ))}
  </div>
</div>
  );
};