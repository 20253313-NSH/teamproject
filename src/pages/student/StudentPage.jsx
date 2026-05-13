import { Link } from 'react-router-dom'
import Shell from '../../layouts/Shell.jsx'

function StudentPage() {
  return (
    <Shell accent="accent-student">
      <section className="detail-page">
        <p className="eyebrow">Student</p>
        <h1>학생 페이지</h1>
        <p className="subtitle">
          수업 참여와 과제 확인을 위한 공간입니다. 공지와 자료를 빠르게 볼 수
          있도록 구성했습니다.
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

export default StudentPage