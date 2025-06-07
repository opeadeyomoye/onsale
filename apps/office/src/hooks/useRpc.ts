import { useAuth } from '@clerk/nextjs'
import { hcWithType } from '@onsale/worker/hc'

type BearerTokenType = string | (() => Promise<string | null>)

export default function useRpc(token?: BearerTokenType) {
  const { getToken } = useAuth()
  if (token) {
    return getRpcClient(token)
  }

  return getRpcClient(getToken)
}

function getRpcClient(token: BearerTokenType) {
  return hcWithType(process.env.NEXT_PUBLIC_API_ROOT || 'http://localhost:8787', {
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
