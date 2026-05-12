import { Link } from 'react-router-dom'
import '../App.css'

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

export default Shell