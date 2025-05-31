import { useAuth } from '@clerk/nextjs'
import { AppType } from '@onsale/worker'
import { hc } from 'hono/client'

type BearerTokenType = string | (() => Promise<string | null>)

export default function useRpc(token?: BearerTokenType) {
  const { getToken } = useAuth()
  if (token) {
    return getRpcClient(token)
  }

  return getRpcClient(getToken)
}

function getRpcClient(token: BearerTokenType) {
  return hc<AppType>(process.env.NEXT_PUBLIC_API_ROOT || 'http://localhost:8787', {
    async headers() {
      const bearerToken = typeof token === 'function'
        ? await token()
        : token

      return {
        Authorization: `Bearer ${bearerToken}`
      }
    },
  })
}
