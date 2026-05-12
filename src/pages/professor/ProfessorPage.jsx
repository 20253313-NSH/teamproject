import { Link } from 'react-router-dom'
import Shell from '../../layouts/Shell.jsx'
import './ProfessorPage.css'

function ProfessorPage() {
  return (
    <Shell accent="accent-professor">
      <div className="professor-content">
        <h1>교수 자료실</h1>
        <div className="file-upload-button-container">
          <Link to="/professor/upload" className="add-file-button">
            <span className="plus-icon">+</span>
          </Link>
        </div>
      </div>
    </Shell>
  )
}

export default ProfessorPage