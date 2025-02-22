import React from 'react';
import { useQuiz } from '../context/QuizContext';
export const QuestionGrid = ({ getQuestionStatus, navigateToQuestion }) => {
    const { questions, showResults, handleValidateAnswers } = useQuiz();
  
    return (
      <div className="sidebar">
        <div className="question-grid">
          {questions.map((_, index) => (
            <div
              key={index}
              className={`question-number ${getQuestionStatus(index)}`}
              onClick={() => navigateToQuestion(index)}
            >
              {index + 1}
            </div>
          ))}
        </div>
        {!showResults && (
          <button
            className="button btn-validar"
            onClick={handleValidateAnswers}
          >
            Validar respuestas
          </button>
        )}
      </div>
    );
  };