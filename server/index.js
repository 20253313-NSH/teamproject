import express from 'express'
import cors from 'cors'
import multer from 'multer'
import { execSync } from 'child_process'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const port = process.env.PORT || 3001

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
    const timestamp = Date.now()
    const ext = path.extname(file.originalname)
    const name = path.basename(file.originalname, ext)
    cb(null, `${name}-${timestamp}${ext}`)
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

// File upload endpoint
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' })
    }

    const filePath = req.file.path
    const ext = path.extname(req.file.originalname).toLowerCase()

    // If it's a PPT file, convert to PDF
    if (ext === '.ppt' || ext === '.pptx') {
      const pdfPath = filePath.replace(/\.(ppt|pptx)$/i, '.pdf')

      try {
        // Use LibreOffice to convert PPT to PDF
        execSync(
          `soffice --headless --convert-to pdf --outdir "${uploadsDir}" "${filePath}"`,
          { encoding: 'utf-8' }
        )

        // Remove the original PPT file
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }

        res.json({
          success: true,
          message: 'File converted to PDF and saved successfully',
          filename: path.basename(pdfPath),
          originalName: req.file.originalname,
        })
      } catch (convertError) {
        console.error('Conversion error:', convertError)
        // If conversion fails, keep the original file
        res.json({
          success: true,
          message: 'File saved successfully (conversion not available)',
          filename: req.file.filename,
          originalName: req.file.originalname,
          note: 'PPT to PDF conversion requires LibreOffice to be installed',
        })
      }
    } else {
      // PDF file, just save it
      res.json({
        success: true,
        message: 'PDF file saved successfully',
        filename: req.file.filename,
        originalName: req.file.originalname,
      })
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