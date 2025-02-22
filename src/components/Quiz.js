import React from 'react';
import { useQuiz } from '../context/QuizContext';
import { Header } from './Header';
import { Pagination } from './Pagination';
import { Question } from './Question';
import { QuestionGrid } from './QuestionGrid';
import { LandingPage } from './LandingPage';


export const Quiz = () => {
  const {
    hasStarted,
    loading,
    allQuestionsUsed,
    showResults,
    questions,
    currentPage,
    questionsPerPage,
    resetQuiz,
    selectedAnswers,
    score,
    setCurrentPage,
    questionCount,
  } = useQuiz();

  const getQuestionStatus = (index) => {
    if (!showResults) {
      return selectedAnswers[index] ? "answered" : "unanswered";
    }
    if (!selectedAnswers[index]) return "unanswered";
    return selectedAnswers[index] === questions[index].answer ? "correct" : "incorrect";
  };

  const navigateToQuestion = (index) => {
    const newPage = Math.floor(index / questionsPerPage);
    setCurrentPage(newPage);

    setTimeout(() => {
      const questionElement = document.getElementById(`question-${index}`);
      if (questionElement) {
        questionElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const getCurrentQuestions = () => {
    const start = currentPage * questionsPerPage;
    return questions.slice(start, start + questionsPerPage);
  };

  if (!hasStarted) {
    return <LandingPage />;
  }

  if (loading) {
    console.log("Cargando preguntas...");
    return (
      <div className="header">
        <h2>Cargando preguntas...</h2>
      </div>
    );
  }

  if (allQuestionsUsed) {
    console.log("Todas las preguntas han sido usadas...");
    return (
      <div className="header">
        <h2>¡Has completado todas las preguntas de esta unidad!</h2>
        <button className="button" onClick={resetQuiz}>
          Reiniciar cuestionario
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="main-content">
        <Header />
        <Pagination />
        {showResults ? (
          <div className="results">
            <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
              Resultado Final: {Math.max(0, score)}/10
            </h2>
            {questions.map((question, index) => (
              <Question key={index} question={question} index={index} showResults={true} />
            ))}
          </div>
        ) : (
          <div>
            {questions.slice(0, questionCount).map((question, pageIndex) => {
              const questionIndex = currentPage * questionsPerPage + pageIndex;
              return (
                <Question
                  key={questionIndex}
                  question={question}
                  index={questionIndex}
                  showResults={false}
                />
              );
            })}
            <Pagination />
          </div>
        )}
      </div>
      <QuestionGrid
        getQuestionStatus={getQuestionStatus}
        navigateToQuestion={navigateToQuestion}
      />
    </div>
  );
};