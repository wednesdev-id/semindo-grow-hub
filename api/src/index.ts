import { createServer } from './server'

const port = Number(process.env.PORT || 3000)

const app = createServer()

app.listen(port, () => {
  // no comments
})
