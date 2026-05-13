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
    </div>
  )
}

export default Shell