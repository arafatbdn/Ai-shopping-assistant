import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './app/App.jsx';
import { AuthProvider } from './features/auth/context/AuthProvider.jsx';
import { ThemeProvider } from './shared/theme/ThemeProvider.jsx';
import { AssistantProvider } from './features/assistant/context/AssistantContext.jsx';
import ErrorBoundary from './shared/components/ErrorBoundary.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <AssistantProvider>
              <App />
            </AssistantProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);
