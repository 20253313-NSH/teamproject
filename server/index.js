import express from 'express'

const app = express()
const port = process.env.PORT || 3001

app.use(express.json())

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

app.use((_request, response) => {
  response.status(404).json({ message: 'Not found' })
})

app.listen(port, () => {
  console.log(`Express server listening on http://localhost:${port}`)
})