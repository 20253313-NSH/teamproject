import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Shell from '../../layouts/Shell.jsx'
import './FileUploadPage.css'

function FileUploadPage() {
  const navigate = useNavigate()
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files)
    handleFiles(files)
  }

  const handleFiles = async (files) => {
    const uploadedFiles = []
    const validFiles = files.filter((file) => {
      const type = file.type.toLowerCase()
      const name = file.name.toLowerCase()
      return (
        type === 'application/pdf' ||
        type === 'application/vnd.ms-powerpoint' ||
        type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
        name.endsWith('.pdf') ||
        name.endsWith('.ppt') ||
        name.endsWith('.pptx')
      )
    })

    if (validFiles.length === 0) {
      setUploadStatus('PDF 또는 PPT 파일만 업로드 가능합니다.')
      return
    }

    setIsUploading(true)
    setUploadStatus(null)

    try {
      for (const file of validFiles) {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          let errorMessage = `파일 업로드 실패: ${file.name}`
          try {
            const errorData = await response.json()
            if (errorData?.error) {
              errorMessage = errorData.error
            }
          } catch {
            // Keep fallback error message when response body is not JSON.
          }
          throw new Error(errorMessage)
        }

        const data = await response.json()
        if (!data?.url) {
          throw new Error('업로드 응답에 파일 URL이 없습니다.')
        }
        uploadedFiles.push({
          name: data.originalName || file.name,
          url: data.url,
        })
      }

      setUploadStatus('success')
      setIsUploading(false)

      localStorage.setItem('professorUploadedFiles', JSON.stringify(uploadedFiles))
      sessionStorage.setItem('professorViewerPayload', JSON.stringify(uploadedFiles))

      // Append to cumulative document list shown on ProfessorPage
      const existing = (() => {
        try { return JSON.parse(localStorage.getItem('professorDocumentList') || '[]') }
        catch { return [] }
      })()
      localStorage.setItem('professorDocumentList', JSON.stringify([...existing, ...uploadedFiles]))
      sessionStorage.setItem('professorCurrentPdfUrl', uploadedFiles[0]?.url || '')
      sessionStorage.setItem('professorCurrentPdfName', uploadedFiles[0]?.name || '')

      // 성공 후 글 목록으로 이동
      setTimeout(() => {
        navigate('/professor')
      }, 1500)
    } catch (error) {
      console.error('Upload error:', error)
      setUploadStatus(`오류: ${error.message}`)
      setIsUploading(false)
    }
  }

  return (
    <Shell accent="accent-professor">
      <div className="upload-page-container">
        <h1>파일 업로드</h1>

        <div
          className={`drop-zone ${isDragging ? 'dragging' : ''} ${uploadStatus === 'success' ? 'success' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {uploadStatus === 'success' ? (
            <div className="success-message">
              <div className="success-icon">✓</div>
              <p>파일이 성공적으로 업로드되었습니다!</p>
            </div>
          ) : isUploading ? (
            <div className="uploading-message">
              <div className="spinner"></div>
              <p>업로드 중...</p>
            </div>
          ) : (
            <>
              <div className="upload-icon">📄</div>
              <p className="main-text">파일을 이곳에 드래그하세요</p>
              <p className="sub-text">또는</p>
              <label className="file-button">
                컴퓨터에서 선택
                <input
                  type="file"
                  accept=".pdf,.ppt,.pptx,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                  onChange={handleFileInput}
                  multiple
                  disabled={isUploading}
                />
              </label>
              <p className="file-type-text">지원: PDF, PPT, PPTX</p>
              {uploadStatus && <p className="error-message">{uploadStatus}</p>}
            </>
          )}
        </div>

        <button className="back-button" onClick={() => navigate('/professor')} disabled={isUploading}>
          돌아가기
        </button>
      </div>
    </Shell>
  )
}

export default FileUploadPage
