import React, { useState, useEffect, useCallback } from "react";
import "./App.css";

const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState("tema1");
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [allQuestionsUsed, setAllQuestionsUsed] = useState(false);
  const questionsPerPage = 5;

  const shuffleArray = useCallback((array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }, []);

  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const loadQuestions = useCallback(
    async (selectedTheme) => {
      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.PUBLIC_URL}/${selectedTheme}.json`
        );
        if (!response.ok) throw new Error("No se pudo cargar el archivo JSON.");

        const data = await response.json();
        const quizQuestions = data.quiz || [];
        const usedQuestionIndices =
          JSON.parse(localStorage.getItem(`usedQuestions_${selectedTheme}`)) ||
          [];

        let availableQuestions = [];
        if (quizQuestions.length === 0) {
          availableQuestions = [];
        } else if (usedQuestionIndices.length >= quizQuestions.length) {
          availableQuestions = shuffleArray(quizQuestions).slice(0, 25);
          localStorage.removeItem(`usedQuestions_${selectedTheme}`);
        } else {
          availableQuestions = quizQuestions.filter(
            (_, index) => !usedQuestionIndices.includes(index)
          );
        }

        const selectedQuestions = shuffleArray(availableQuestions)
          .slice(0, 25)
          .map((question) => ({
            ...question,
            options: shuffleArray(question.options),
          }));

        if (usedQuestionIndices.length < quizQuestions.length) {
          const newUsedIndices = [
            ...usedQuestionIndices,
            ...selectedQuestions.map((q) =>
              quizQuestions.findIndex((item) => item.question === q.question)
            ),
          ];
          localStorage.setItem(
            `usedQuestions_${selectedTheme}`,
            JSON.stringify(Array.from(new Set(newUsedIndices)))
          );
        }

        setAllQuestions(quizQuestions);
        setQuestions(selectedQuestions);
      } catch (error) {
        console.error("Error loading questions:", error);
      } finally {
        setLoading(false);
      }
    },
    [shuffleArray]
  );

  useEffect(() => {
    loadQuestions(selectedTheme);
  }, [selectedTheme, loadQuestions]);

  useEffect(() => {
    const checkCompletion = () => {
      const used = JSON.parse(localStorage.getItem(`usedQuestions_${selectedTheme}`)) || [];
      setAllQuestionsUsed(used.length >= allQuestions.length && allQuestions.length > 0);
    };
    checkCompletion();
  }, [allQuestions, selectedTheme]);

  useEffect(() => {
    let calculatedScore = 0;
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.answer) {
        calculatedScore += 0.4;
      } else if (selectedAnswers[index]) {
        calculatedScore -= 0.2;
      }
    });
    setScore(calculatedScore.toFixed(1));
  }, [selectedAnswers, questions]);

  const handleAnswerSelect = (questionIndex, option) => {
    if (!isTimerRunning && Object.keys(selectedAnswers).length === 0) {
      setIsTimerRunning(true);
    }

    setSelectedAnswers((prev) => {
      const newAnswers = { ...prev };
      if (prev[questionIndex] === option) {
        delete newAnswers[questionIndex];
      } else {
        newAnswers[questionIndex] = option;
      }
      return newAnswers;
    });
  };

  const handleValidateAnswers = () => {
    setShowResults(true);
    setIsTimerRunning(false);
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

  const resetQuiz = () => {
    localStorage.removeItem(`usedQuestions_${selectedTheme}`);
    setSelectedAnswers({});
    setScore(0);
    setShowResults(false);
    setCurrentPage(0);
    setTimer(0);
    setIsTimerRunning(false);
    setAllQuestionsUsed(false);
    loadQuestions(selectedTheme);
  };

  const getQuestionStatus = (index) => {
    if (!showResults) {
      return selectedAnswers[index] ? "answered" : "unanswered";
    }
    if (!selectedAnswers[index]) return "unanswered";
    return selectedAnswers[index] === questions[index].answer
      ? "correct"
      : "incorrect";
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    setTimeout(() => {
      const mainContent = document.querySelector(".main-content");
      if (mainContent) {
        mainContent.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const getCurrentQuestions = () => {
    const start = currentPage * questionsPerPage;
    return questions.slice(start, start + questionsPerPage);
  };

  const handleThemeChange = (event) => {
    const newTheme = event.target.value;
    setSelectedTheme(newTheme);
    setSelectedAnswers({});
    setScore(0);
    setShowResults(false);
    setCurrentPage(0);
    setTimer(0);
    setIsTimerRunning(false);
    setAllQuestionsUsed(false);
  };

  const totalPages = Math.ceil(questions.length / questionsPerPage);
  const progressPercentage =
    (Object.keys(selectedAnswers).length / questions.length) * 100;

  if (loading) {
    return (
      <div className="header">
        <h2>Cargando preguntas...</h2>
      </div>
    );
  }

  if (allQuestionsUsed) {
    return (
      <div className="header">
        <h2>¡Has completado todas las preguntas de esta unidad!</h2>
        <p>El cuestionario continuará con preguntas repetidas.</p>
        <button className="button" onClick={resetQuiz}>
          Comenzar de nuevo
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="main-content">
        <div className="header">
          <div className="theme-selector">
            <h1>
              Selecciona Unidad:
              <select
                value={selectedTheme}
                onChange={handleThemeChange}
                className="theme-dropdown"
              >
                <option value="tema1">Unidad 1</option>
                <option value="tema2">Unidad 2</option>
                <option value="tema3">Unidad 3</option>
                <option value="tema4">Unidad 4</option>
                <option value="tema5">Unidad 5</option>
              </select>
            </h1>
          </div>
          <h1>
            Cuestionario{" "}
            {selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1, 4)}{" "}
            {selectedTheme.slice(-1)}{" "}
            <span className="subtitle">
              ({questions.length} preguntas por examen)
            </span>
          </h1>
          <h3>Total preguntas en BD: {allQuestions.length}</h3>
          <div className="timer">Tiempo: {formatTime(timer)}</div>
          <div className="progress-container">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <span style={{ marginLeft: "10px" }}>
              Progreso: {progressPercentage.toFixed(0)}%
            </span>
          </div>
          <button className="button" onClick={resetQuiz}>
            Reiniciar
          </button>
        </div>
        <div className="pagination">
          <button
            className="button button-auto"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
          >
            Anterior
          </button>
          <span>
            Página {currentPage + 1} de {totalPages}
          </span>
          <button
            className="button button-auto"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
          >
            Siguiente
          </button>
        </div>
        {showResults ? (
          <div className="results">
            <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
              Resultado Final: {Math.max(0, score)}/10
            </h2>
            <p style={{ textAlign: "center" }}>
              Tiempo total: {formatTime(timer)}
            </p>
            {questions.map((question, index) => (
              <div key={index} id={`question-${index}`} className="question">
                <h3>
                  Pregunta {index + 1}: {question.question}
                </h3>
                <div>
                  {question.options.map((option, i) => {
                    let optionClass = "option-container";
                    if (showResults) {
                      if (option === question.answer) {
                        optionClass += " correct";
                      } else if (selectedAnswers[index] === option) {
                        optionClass += " incorrect";
                      }
                    } else if (selectedAnswers[index] === option) {
                      optionClass += " selected";
                    }
                    return (
                      <div key={i} className={optionClass}>
                        <label className="option-label">
                          <input
                            type="radio"
                            name={`question-${index}`}
                            value={option}
                            checked={selectedAnswers[index] === option}
                            readOnly
                          />
                          <span className="option-text">
                            {String.fromCharCode(97 + i)} {option}
                          </span>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            {getCurrentQuestions().map((question, pageIndex) => {
              const questionIndex = currentPage * questionsPerPage + pageIndex;
              return (
                <div
                  key={questionIndex}
                  id={`question-${questionIndex}`}
                  className="question"
                >
                  <h3>
                    Pregunta {questionIndex + 1}: {question.question}
                  </h3>
                  <div>
                    {question.options.map((option, i) => (
                      <div
                        key={i}
                        className={`option-container ${
                          selectedAnswers[questionIndex] === option
                            ? "selected"
                            : ""
                        }`}
                        onClick={() =>
                          handleAnswerSelect(questionIndex, option)
                        }
                      >
                        <label className="option-label">
                          <input
                            type="radio"
                            name={`question-${questionIndex}`}
                            value={option}
                            checked={selectedAnswers[questionIndex] === option}
                            onChange={() => {}}
                          />
                          <span>{String.fromCharCode(97 + i)}</span> {option}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            <div className="pagination">
              <button
                className="button button-auto"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
              >
                Anterior
              </button>
              <span>
                Página {currentPage + 1} de {totalPages}
              </span>
              <button
                className="button button-auto"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="sidebar">
        <button className="button" onClick={resetQuiz}>
          Reiniciar
        </button>
        <h3>
          {selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1, 4)}{" "}
          {selectedTheme.slice(-1)}
        </h3>
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
    </div>
  );
};

export default Quiz;