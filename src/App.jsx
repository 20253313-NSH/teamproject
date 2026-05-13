import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import ProfessorPage from './pages/professor/ProfessorPage.jsx'
import FileUploadPage from './pages/professor/FileUploadPage.jsx'
import ProfessorNextPage from './pages/professor/ProfessorNextPage.jsx'
import StudentPage from './pages/student/StudentPage.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/professor" element={<ProfessorPage />} />
      <Route path="/professor/upload" element={<FileUploadPage />} />
      <Route path="/professor/next" element={<ProfessorNextPage />} />
      <Route path="/student" element={<StudentPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
