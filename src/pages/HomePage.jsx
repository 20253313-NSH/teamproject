import { Link } from 'react-router-dom'
import Shell from '../layouts/Shell.jsx'

function HomePage() {
  return (
    <Shell accent="accent-home">
      <section className="hero-panel">
        <p className="eyebrow">ClassRoom</p>
        <h1>강의실을 디지털로 연결하세요</h1>
        <p className="subtitle">
          교수와 학생이 각각의 공간으로 바로 들어갈 수 있는 시작 화면입니다.
        </p>

        <div className="role-grid">
          <Link to="/professor" className="role-card">
            <span className="role-badge professor">교수</span>
            <strong>교수 페이지</strong>
            <p>강의 자료, 출석, 과제 관리를 한곳에서 확인하세요.</p>
          </Link>

          <Link to="/student" className="role-card">
            <span className="role-badge student">학생</span>
            <strong>학생 페이지</strong>
            <p>수업 참여, 과제 제출, 공지를 빠르게 확인하세요.</p>
          </Link>
        </div>
      </section>
    </Shell>
  )
}

export default HomePage