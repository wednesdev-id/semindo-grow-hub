import crypto from 'crypto'

export function aesEncrypt(plain: string, key: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key).subarray(0, 32), iv)
  let enc = cipher.update(plain, 'utf8', 'base64')
  enc += cipher.final('base64')
  return `${iv.toString('base64')}.${enc}`
}

export function aesDecrypt(enc: string, key: string): string {
  const [ivb64, data] = enc.split('.')
  const iv = Buffer.from(ivb64, 'base64')
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key).subarray(0, 32), iv)
  let dec = decipher.update(data, 'base64', 'utf8')
  dec += decipher.final('utf8')
  return dec
}
