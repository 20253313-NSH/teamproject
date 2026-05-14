import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import * as pdfjsLib from 'pdfjs-dist'
import 'pdfjs-dist/web/pdf_viewer.css'
import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import Shell from '../../layouts/Shell.jsx'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc

function ProfessorNextPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const canvasRef = useRef(null)
  const textLayerRef = useRef(null)
  const renderTaskRef = useRef(null)
  const textLayerTaskRef = useRef(null)
  const [isLoading, setIsLoading] = useState(false)
  const [viewerError, setViewerError] = useState(null)
  const [resolvedFile, setResolvedFile] = useState(null)
  const [pdfDocument, setPdfDocument] = useState(null)
  const [pageCount, setPageCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
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

  const currentFileUrl = queryFile || location.state?.pdfUrl || sessionPdfUrl || storedFiles[0]?.url || resolvedFile?.url || ''
  const currentFileName = location.state?.pdfName || sessionPdfName || resolvedFile?.originalName || resolvedFile?.name || (queryFile ? queryFile.split('/').pop() : null)

  const tryFixMojibake = (name) => {
    if (!name) return name
    try {
      return decodeURIComponent(escape(name))
    } catch {
      return name
    }
  }

  const displayFileName = tryFixMojibake(currentFileName)

  useEffect(() => {
    setViewerError(null)
    setPdfDocument(null)
    setPageCount(0)
    setCurrentPage(1)
    renderTaskRef.current?.cancel?.()

    if (!currentFileUrl) {
      setIsLoading(false)
      return undefined
    }

    let cancelled = false

    const loadDocument = async () => {
      setIsLoading(true)

      try {
        const loadingTask = pdfjsLib.getDocument(currentFileUrl)
        const document = await loadingTask.promise

        if (cancelled) {
          await document.destroy()
          return
        }

        setPdfDocument(document)
        setPageCount(document.numPages)
      } catch {
        if (!cancelled) {
          setViewerError('PDF瑜?遺덈윭?ㅼ? 紐삵뻽?듬땲??')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadDocument()

    return () => {
      cancelled = true
    }
  }, [currentFileUrl])

  useEffect(() => {
    if (!pdfDocument || !canvasRef.current || !textLayerRef.current) {
      return undefined
    }

    let cancelled = false

    const renderPage = async () => {
      try {
        const page = await pdfDocument.getPage(currentPage)
        const viewport = page.getViewport({ scale: 0.8 })
        const canvas = canvasRef.current
        const textLayerDiv = textLayerRef.current
        const context = canvas.getContext('2d')

        if (!context) {
          throw new Error('Canvas context unavailable')
        }

        const devicePixelRatio = window.devicePixelRatio || 1
        canvas.width = Math.floor(viewport.width * devicePixelRatio)
        canvas.height = Math.floor(viewport.height * devicePixelRatio)
        canvas.style.width = `${Math.floor(viewport.width)}px`
        canvas.style.height = `${Math.floor(viewport.height)}px`
        textLayerDiv.style.width = `${Math.floor(viewport.width)}px`
        textLayerDiv.style.height = `${Math.floor(viewport.height)}px`
        textLayerDiv.innerHTML = ''

        renderTaskRef.current?.cancel?.()
        textLayerTaskRef.current?.cancel?.()
        const renderTask = page.render({
          canvasContext: context,
          viewport,
          transform: devicePixelRatio !== 1 ? [devicePixelRatio, 0, 0, devicePixelRatio, 0, 0] : null,
        })

        const textContent = await page.getTextContent()
        const textLayer = new pdfjsLib.TextLayer({
          textContentSource: textContent,
          container: textLayerDiv,
          viewport,
        })
        textLayerTaskRef.current = textLayer

        renderTaskRef.current = renderTask
        await renderTask.promise
        await textLayer.render()
      } catch (error) {
        if (!cancelled && error?.name !== 'RenderingCancelledException') {
          setViewerError('?섏씠吏瑜??쒖떆?섏? 紐삵뻽?듬땲??')
        }
      }
    }

    renderPage()

    return () => {
      cancelled = true
      renderTaskRef.current?.cancel?.()
      textLayerTaskRef.current?.cancel?.()
    }
  }, [pdfDocument, currentPage])

  useEffect(
    () => () => {
      renderTaskRef.current?.cancel?.()
      textLayerTaskRef.current?.cancel?.()
      pdfDocument?.destroy?.()
    },
    [pdfDocument],
  )

  useEffect(() => {
    if (currentFileUrl || resolvedFile) {
      return undefined
    }

    let cancelled = false

    const loadLatestUpload = async () => {
      try {
        const response = await fetch('/api/latest-upload')
        if (!response.ok) {
          return
        }

        const latest = await response.json()
        if (!cancelled) {
          setResolvedFile(latest)
        }
      } catch {
        if (!cancelled) {
          setViewerError('?낅줈?쒕맂 PDF瑜?李얠? 紐삵뻽?듬땲??')
        }
      }
    }

    loadLatestUpload()

    return () => {
      cancelled = true
    }
  }, [currentFileUrl, resolvedFile])

  return (
    <Shell accent="accent-professor">
      <style>{`
        .pdf-page-stage {
          position: relative;
          display: inline-block;
          line-height: 0;
        }

        .pdf-page-canvas {
          display: block;
          position: relative;
          z-index: 0;
          user-select: none;
          pointer-events: none;
        }

        .pdf-page-text-layer {
          position: absolute;
          inset: 0;
          z-index: 1;
          overflow: clip;
          color: transparent;
          line-height: 1;
          transform-origin: 0 0;
          caret-color: CanvasText;
          -webkit-text-size-adjust: none;
          -moz-text-size-adjust: none;
          text-size-adjust: none;
          user-select: text;
          cursor: text;
        }

        .pdf-page-text-layer span,
        .pdf-page-text-layer br {
          position: absolute;
          white-space: pre;
          color: transparent;
          cursor: text;
          transform-origin: 0 0;
        }

        .pdf-page-text-layer ::selection {
          background: rgba(0, 120, 215, 0.28);
        }

        .pdf-page-text-layer ::-moz-selection {
          background: rgba(0, 120, 215, 0.28);
        }
      `}</style>
      <div className="professor-next-page" style={{ display: 'grid', gap: '1.5rem', justifyItems: 'start', width: '100%' }}>
        <div>
          <h1>업로드된 PDF</h1>
          <p>{displayFileName || '업로드된 파일이 없습니다.'}</p>
        </div>

        {currentFileUrl ? (
          <div style={{ display: 'grid', gap: '1rem', justifyItems: 'start', width: '100%' }}>
            {isLoading && <p style={{ margin: 0 }}>PDF를 불러오는 중...</p>}
            {viewerError && <p style={{ margin: 0, color: '#b00020' }}>{viewerError}</p>}
            <div
              className="pdf-page-stage"
              style={{
                display: 'inline-block',
                minHeight: 'auto',
                padding: '0.5rem',
                border: '1px solid rgba(0, 0, 0, 0.12)',
                borderRadius: '12px',
                background: '#f7f7f8',
                overflow: 'hidden',
                boxSizing: 'content-box',
              }}
            >
              <canvas ref={canvasRef} className="pdf-page-canvas" style={{ display: pdfDocument ? 'block' : 'none' }} />
              <div ref={textLayerRef} className="pdf-page-text-layer" aria-hidden="false" />
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: '0.75rem',
                flexWrap: 'wrap',
              }}
            >
              <button type="button" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage <= 1 || isLoading}>
                이전 페이지
              </button>
              <button type="button" onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))} disabled={currentPage >= pageCount || isLoading}>
                다음 페이지
              </button>
              <span style={{ fontSize: '0.95rem', opacity: 0.8 }}>{pageCount > 0 ? `${currentPage} / ${pageCount}` : '0 / 0'}</span>
              <a href={currentFileUrl} download={currentFileName || 'document.pdf'}>
                다운로드
              </a>
            </div>
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

