import { fetchConfig } from "./config";


import { Router, type Request, type Response } from 'express'
import { Readable } from 'stream'

const router = Router()

router.get('/:agent/recordings/:recFile', async (req: Request, res: Response) => {
  const { agent, recFile } = req.params
  const range = req.headers['range']
  const headers: Record<string, string> = range ? { Range: String(range) } : {}

  const { twilio_config } = await fetchConfig(agent);
  const { account_sid, auth_token } = twilio_config;
  const url = `https://api.twilio.com/2010-04-01/Accounts/${account_sid}/Recordings/${recFile}`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      ...headers,
      Authorization: 'Basic ' + Buffer.from(`${account_sid}:${auth_token}`).toString('base64'),
    },
  })

  res.status(response.status)
  response.headers.forEach((value, key) => res.setHeader(key, value))

  const nodeStream = Readable.fromWeb(response.body as any)
  nodeStream.pipe(res)
})

export default router
