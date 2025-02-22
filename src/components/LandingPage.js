import React from 'react';
import { useQuiz } from '../context/QuizContext';

export const LandingPage = () => {
  const { selectedTheme, setSelectedTheme, setHasStarted, questionCount, setQuestionCount } =
    useQuiz();

  const handleThemeChange = (event) => {
    setSelectedTheme(event.target.value);
  };

  const handleQuestionCountChange = (event) => {
    setQuestionCount(Number(event.target.value)); // Convierte el valor a número
  };

  return (
    <div className="landing-page">
      <img
        src={`${process.env.PUBLIC_URL}/logo.jpg`}
        alt="Logo"
        className="logo"
        onError={(e) => {
          e.target.style.display = 'none';
          console.error('Error cargando el logo:', e.target.src);
        }}
      />
      <h1>SISTEMAS DE GESTIÓN EMPRESARIAL</h1>
      <div className="theme-selector">
        <label>Selecciona la Unidad:</label>
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
      </div>
      <div className="question-count-selector">
        <label>Selecciona el número de preguntas: </label>
        <select
          value={questionCount}
          onChange={handleQuestionCountChange}
          className="question-count-dropdown"
        >
          <option value="20">20 preguntas</option>
          <option value="25">25 preguntas</option>
        </select>
      </div>
      <button
        className="button start-button"
        onClick={() => setHasStarted(true)}
      >
        Comenzar Examen
      </button>
      <div className="instructions">
        <h2>Instrucciones</h2>
        <ul>
          <li>{questionCount} preguntas por examen</li>
          <li>Tiempo ilimitado</li>
          <li>
            +{questionCount === 25 ? '0.4' : '0.5'} puntos por respuesta correcta
          </li>
          <li>
            -{questionCount === 25 ? '0.2' : '0.25'} puntos por respuesta incorrecta
          </li>
          <li>Mínimo para aprobar: 5 puntos</li>
        </ul>
      </div>
    </div>
  );
};