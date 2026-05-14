import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Shell from '../../layouts/Shell.jsx'
import './ProfessorPage.css'

const formatDate = (value) => {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

function ProfessorPage() {
  const [files, setFiles] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [deletingFileName, setDeletingFileName] = useState(null)

  useEffect(() => {
    const fetchFiles = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/uploads')
        if (!response.ok) {
          throw new Error('Failed to fetch files')
        }
        const data = await response.json()
        setFiles(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching files:', err)
        setError('파일 목록을 불러오는데 실패했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchFiles()
  }, [])

  const handleFileClick = (file) => {
    sessionStorage.setItem('professorCurrentPdfUrl', file.url)
    sessionStorage.setItem('professorCurrentPdfName', file.originalName)
  }

  const handleDeleteFile = async (file) => {
    const confirmed = window.confirm(`"${file.originalName}" 파일을 삭제할까요?`)
    if (!confirmed) {
      return
    }

    setDeletingFileName(file.name)

    try {
      const response = await fetch(`/api/uploads/${encodeURIComponent(file.name)}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete file')
      }

      setFiles((currentFiles) => currentFiles.filter((currentFile) => currentFile.name !== file.name))
    } catch (deleteError) {
      console.error('Error deleting file:', deleteError)
      setError('파일 삭제에 실패했습니다.')
    } finally {
      setDeletingFileName(null)
    }
  }

  return (
    <Shell accent="accent-professor">
      <div className="professor-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ margin: 0 }}>교수 자료실</h1>
          <Link to="/professor/upload" className="add-file-button">
            <span className="plus-icon">+</span>
          </Link>
        </div>

        {error && <p style={{ color: '#d32f2f', margin: '1rem 0' }}>{error}</p>}
        {isLoading && <p style={{ margin: '1rem 0' }}>파일 목록을 불러오는 중...</p>}

        {!isLoading && files.length > 0 && (
          <div className="pdf-files-grid">
            {files.map((file) => (
              <div
                key={file.name}
                className="pdf-file-item"
              >
                <Link
                  to="/professor/next"
                  state={{ pdfUrl: file.url, pdfName: file.originalName }}
                  className="pdf-file-link"
                  onClick={() => handleFileClick(file)}
                >
                  <div className="pdf-file-icon">📄</div>
                  <div className="pdf-file-info">
                    <div className="pdf-file-name" title={file.originalName}>
                      {file.originalName}
                    </div>
                    <div className="pdf-file-date">
                      {formatDate(file.createdAt)}
                    </div>
                  </div>
                </Link>
                <button
                  type="button"
                  className="pdf-file-delete-button"
                  onClick={() => handleDeleteFile(file)}
                  disabled={deletingFileName === file.name}
                >
                  {deletingFileName === file.name ? '삭제 중' : '삭제'}
                </button>
              </div>
            ))}
          </div>
        )}

        {!isLoading && files.length === 0 && (
          <div style={{
            padding: '2rem',
            border: '1px dashed rgba(0, 0, 0, 0.2)',
            borderRadius: '8px',
            textAlign: 'center',
            color: 'rgba(0, 0, 0, 0.6)',
          }}>
            <p>업로드된 파일이 없습니다.</p>
            <p>위의 + 버튼을 눌러 파일을 업로드하세요.</p>
          </div>
        )}
      </div>
    </Shell>
  )
}

export default ProfessorPage