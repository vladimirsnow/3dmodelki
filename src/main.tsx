import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AdminProvider } from './context/AdminContext.tsx';
import { DataProvider } from './context/DataContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AdminProvider>
      <DataProvider>
        <App />
      </DataProvider>
    </AdminProvider>
  </StrictMode>,
);
