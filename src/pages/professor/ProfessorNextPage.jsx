import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Shell from '../../layouts/Shell.jsx'

function ProfessorNextPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [viewerError, setViewerError] = useState(null)
  const queryFile = new URLSearchParams(location.search).get('file')
  const sessionPdfUrl = sessionStorage.getItem('professorCurrentPdfUrl') || ''
  const sessionPdfName = sessionStorage.getItem('professorCurrentPdfName') || ''
  const storedFiles = (() => {
    try {
      return JSON.parse(localStorage.getItem('professorUploadedFiles') || '[]')
    } catch {
      return []
    }
  })()

  const currentFileUrl = queryFile || location.state?.pdfUrl || sessionPdfUrl || storedFiles[0]?.url || ''
  const currentFileName = location.state?.pdfName || sessionPdfName || (queryFile ? queryFile.split('/').pop() : null)

  useEffect(() => {
    setIsLoading(Boolean(currentFileUrl))
    setViewerError(null)
    const timer = window.setTimeout(() => {
      setIsLoading(false)
    }, 300)

    return () => window.clearTimeout(timer)
  }, [currentFileUrl])

  return (
    <Shell accent="accent-professor">
      <div className="professor-next-page" style={{ display: 'grid', gap: '1.5rem' }}>
        <div>
          <h1>업로드된 PDF</h1>
          <p>{currentFileName || '업로드된 파일이 없습니다.'}</p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', opacity: 0.7 }}>URL: {currentFileUrl || '없음'}</p>
        </div>

        {currentFileUrl ? (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {isLoading && <p style={{ margin: 0 }}>PDF.js로 불러오는 중...</p>}
            {viewerError && <p style={{ margin: 0, color: '#b00020' }}>{viewerError}</p>}
            <iframe
              title="업로드된 PDF 뷰어"
              src={`${currentFileUrl}#toolbar=1&navpanes=1&scrollbar=1`}
              style={{
                width: '100%',
                minHeight: '75vh',
                border: '1px solid rgba(0, 0, 0, 0.12)',
                borderRadius: '16px',
                background: '#f7f7f8',
                overflow: 'auto',
              }}
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false)
                setViewerError('PDF 뷰어를 불러오지 못했습니다.')
              }}
            />
          </div>
        ) : (
          <div style={{ padding: '2rem', border: '1px dashed rgba(0, 0, 0, 0.2)', borderRadius: '16px' }}>
            PDF를 업로드하면 여기에서 미리보기가 표시됩니다.
          </div>
        )}

        <button type="button" onClick={() => navigate('/professor')}>
          다시 업로드하기
        </button>
      </div>
    </Shell>
  )
}

export default ProfessorNextPage