
/**
 * A raiz da applicação React.
 * @component
 * @requires App
 * 
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));

/**
 * Renderiza a aplicação principal (App.js).
 */
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

/**
 * web vitals
 */
reportWebVitals();
