import 'dotenv/config'

import { createServer as createHTTPServer } from 'http'
import { createServer } from './server'
import { ConsultationChatGateway } from './systems/consultation/gateway/chat.gateway'

const port = Number(process.env.PORT || 3000)

const app = createServer()
const httpServer = createHTTPServer(app)

// Initialize Socket.io Chat Gateway
const chatGateway = new ConsultationChatGateway(httpServer)
console.log('[API] Socket.io Chat Gateway initialized')

import { db } from './systems/utils/db'

httpServer.listen(port, async () => {
  console.log(`[API] Server running on port ${port}`)
  console.log(`[API] Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`[API] Socket.io path: /consultation-chat`)

  try {
    await db.$connect()
    console.log('[API] Database connection successful')
  } catch (error) {
    console.error('[API] Database connection failed:', error)
  }
})
