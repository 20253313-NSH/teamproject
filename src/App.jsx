import { Link, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'

function Shell({ accent, children }) {
  return (
    <div className={`page-shell ${accent}`}>
      <header className="topbar">
        <Link to="/" className="brand">
          ClassRoom
        </Link>
      </header>

      <main className="content-wrap">{children}</main>

      <footer className="page-footer">강의실을 디지털로 연결하세요</footer>
    </div>
  )
}

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

function ProfessorPage() {
  return (
    <Shell accent="accent-professor">
      <section className="detail-page">
        <p className="eyebrow">Professor</p>
        <h1>교수 페이지</h1>
        <p className="subtitle">
          강의 운영을 위한 공간입니다. 여기에서 수업 자료와 출석, 공지를 관리할 수
          있습니다.
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
