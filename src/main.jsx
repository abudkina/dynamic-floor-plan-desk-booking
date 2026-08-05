import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { logger } from './services/logger.js';

const rootElement = document.getElementById('root');

if (!rootElement) {
  logger.error('Корневой элемент #root не найден');
} else {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
