import type { NextApiRequest, NextApiResponse } from 'next'
import { buildClearAuthCookies } from '@/lib/auth-cookie'

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.setHeader('Allow', 'POST, GET')
    return res.status(405).json({ success: false, error: 'Method Not Allowed' })
  }
  res.setHeader('Set-Cookie', buildClearAuthCookies())
  return res.status(200).json({ success: true })
}

export default handler
