import { Link } from 'react-router-dom'
import Shell from '../../layouts/Shell.jsx'

function ProfessorPage() {
  return (
    <Shell accent="accent-professor">
      <section className="detail-page">
        <p className="eyebrow">Professor</p>
        <h1>교수 페이지</h1>
        <p className="subtitle">
          강의 운영을 위한 공간입니다.
        </p>

        <div className="detail-actions">
          <Link to="/" className="ghost-button">
            메인으로 돌아가기
          </Link>
        </div>
      </section>
    </Shell>
  )
}

export default ProfessorPage