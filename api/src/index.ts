import 'dotenv/config'
import { createServer } from './server'

const port = Number(process.env.PORT || 3000)

const app = createServer()

import { db } from './systems/utils/db'

app.listen(port, async () => {
  console.log(`[API] Server running on port ${port}`)
  console.log(`[API] Environment: ${process.env.NODE_ENV || 'development'}`)

  try {
    await db.$connect()
    console.log('[API] Database connection successful')
  } catch (error) {
    console.error('[API] Database connection failed:', error)
  }
})
