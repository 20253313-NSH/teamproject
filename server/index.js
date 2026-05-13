import express from 'express'
import cors from 'cors'
import multer from 'multer'
import { execFileSync, execSync } from 'child_process'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const port = process.env.PORT || 3001
let latestUploadedFile = null

const normalizeOriginalName = (name) => {
  try {
    const decoded = Buffer.from(name, 'latin1').toString('utf8')
    return decoded.includes('\ufffd') ? name : decoded
  } catch {
    return name
  }
}

const hasSoffice = (() => {
  try {
    execSync('soffice --version', { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
})()

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    cb(null, `upload-${unique}${ext}`)
  },
})

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ]
    const allowedExts = ['.pdf', '.ppt', '.pptx']
    const ext = path.extname(file.originalname).toLowerCase()

    if (allowedMimes.includes(file.mimetype) || allowedExts.includes(ext)) {
      cb(null, true)
    } else {
      cb(new Error('Only PDF and PPT files are allowed'), false)
    }
  },
})

app.use(cors())
app.use(express.json())
app.use(express.static('public'))
app.use('/uploads', express.static(uploadsDir))

app.get('/api/health', (_request, response) => {
  response.json({ ok: true, message: 'ClassRoom server is running' })
})

app.get('/api/roles', (_request, response) => {
  response.json([
    {
      id: 'professor',
      label: '교수',
      path: '/professor',
    },
    {
      id: 'student',
      label: '학생',
      path: '/student',
    },
  ])
})

app.get('/api/latest-upload', (_request, response) => {
  if (!latestUploadedFile) {
    return response.status(404).json({ error: 'No uploaded file found' })
  }

  response.json(latestUploadedFile)
})

// File upload endpoint
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' })
    }

    const filePath = req.file.path
    const ext = path.extname(req.file.originalname).toLowerCase()
    const originalName = normalizeOriginalName(req.file.originalname)

    // If it's a PPT file, convert to PDF
    if (ext === '.ppt' || ext === '.pptx') {
      if (!hasSoffice) {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }

        return res.status(503).json({
          error: 'PPT/PPTX 업로드를 처리하려면 LibreOffice(soffice) 설치가 필요합니다.',
        })
      }

      const pdfFileName = `${path.parse(req.file.filename).name}.pdf`
      const pdfPath = path.join(uploadsDir, pdfFileName)

      try {
        // Use LibreOffice to convert PPT to PDF
        execFileSync('soffice', ['--headless', '--convert-to', 'pdf', '--outdir', uploadsDir, filePath], {
          stdio: 'pipe',
        })

        // Remove the original PPT file
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }

        if (!fs.existsSync(pdfPath)) {
          return res.status(500).json({
            error: 'PPT/PPTX 변환 결과 PDF를 찾을 수 없습니다.',
          })
        }

        res.json({
          success: true,
          message: 'File converted to PDF and saved successfully',
          filename: pdfFileName,
          originalName,
          url: `/uploads/${pdfFileName}`,
        })
        latestUploadedFile = {
          name: pdfFileName,
          originalName,
          url: `/uploads/${pdfFileName}`,
        }
      } catch (convertError) {
        console.error('Conversion error:', convertError)
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }

        return res.status(500).json({
          error: 'PPT/PPTX를 PDF로 변환하지 못했습니다. PDF 파일을 직접 업로드하거나 LibreOffice를 확인해 주세요.',
        })
      }
    } else {
      // PDF file, just save it
      res.json({
        success: true,
        message: 'PDF file saved successfully',
        filename: req.file.filename,
        originalName,
        url: `/uploads/${req.file.filename}`,
      })
      latestUploadedFile = {
        name: req.file.filename,
        originalName,
        url: `/uploads/${req.file.filename}`,
      }
    }
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ error: 'File upload failed' })
  }
})

app.use((_request, response) => {
  response.status(404).json({ message: 'Not found' })
})

app.listen(port, () => {
  console.log(`Express server listening on http://localhost:${port}`)
})