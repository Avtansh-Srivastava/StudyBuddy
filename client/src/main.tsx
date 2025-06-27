// Add this at the VERY TOP - it will run first
console.log("BACKEND URL CONFIRMED:", import.meta.env.VITE_BACKEND_URL);

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster 
        position="bottom-right"
        toastOptions={{
          success: {
            duration: 3000,
            style: {
              background: '#4BB543',
              color: '#fff',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: '#FF3333',
              color: '#fff',
            },
          },
        }}
      />
    </BrowserRouter>
  </StrictMode>
);