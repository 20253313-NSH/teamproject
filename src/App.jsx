import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import ProfessorPage from './pages/professor/ProfessorPage.jsx'
import StudentPage from './pages/student/StudentPage.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/professor" element={<ProfessorPage />} />
      <Route path="/student" element={<StudentPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
