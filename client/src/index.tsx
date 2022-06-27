import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from './App';
import HomePage from './components/HomePage';
import NotFoundPage from './components/NotFoundPage';
import StudentForm from './components/StudentForm';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/students" element={<HomePage />} />
      <Route path="/students/add" element={<StudentForm mode="create" positiveButtonLabel="Add" />} />
      <Route path="/students/edit/:studentId" element={<StudentForm mode="edit" positiveButtonLabel="Save" />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </BrowserRouter>
);
