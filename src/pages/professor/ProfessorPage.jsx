import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Shell from '../../layouts/Shell.jsx'
import './ProfessorPage.css'

function readDocs() {
  try {
    const stored = localStorage.getItem('professorDocumentList')
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function ProfessorPage() {
  const [docs, setDocs] = useState(readDocs)

  useEffect(() => {
    setDocs(readDocs())
  }, [])

  return (
    <Shell accent="accent-professor">
      <div className="prof-layout">

        {/* ── Sidebar ── */}
        <aside className="prof-sidebar">
          <div className="prof-avatar-wrap">
            <div className="prof-avatar">
              <svg viewBox="0 0 24 24" fill="none" width="40" height="40">
                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
                <path d="M4 20c0-3.866 3.582-7 8-7s8 3.134 8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <span className="prof-username">user</span>
          </div>
          <Link to="/" className="prof-logout-btn">로그아웃</Link>
        </aside>

        {/* ── Document list ── */}
        <main className="prof-main">
          <div className="prof-list-scroll">
            {docs.length === 0 ? (
              <div className="prof-empty-state">
                <svg viewBox="0 0 24 24" fill="none" width="48" height="48">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M14 2v6h6M12 18v-6M9 15h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <p>업로드된 자료가 없습니다.</p>
                <p className="prof-empty-sub">아래 + 버튼을 눌러 파일을 추가하세요.</p>
              </div>
            ) : (
              docs.map((doc, i) => (
                <Link
                  key={i}
                  to={`/professor/next?file=${encodeURIComponent(doc.url)}`}
                  className="prof-doc-item"
                >
                  <span className="prof-doc-name">{doc.name || `문서 ${i + 1}`}</span>
                  <div className="prof-doc-trailing">
                    <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    </svg>
                    <span>4</span>
                  </div>
                </Link>
              ))
            )}
          </div>

          <div className="prof-fab-wrap">
            <Link to="/professor/upload" className="prof-fab" aria-label="파일 추가">
              <svg viewBox="0 0 24 24" fill="none" width="24" height="24">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </Link>
          </div>
        </main>

        {/* ── Right panel ── */}
        <aside className="prof-right-panel">
          <div className="prof-code-section">
            <span className="prof-code-label">참여 코드 생성(입력)</span>
          </div>
        </aside>

      </div>
    </Shell>
  )
}

export default ProfessorPage
