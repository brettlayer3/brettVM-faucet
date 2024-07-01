import { http, cookieStorage, createConfig, createStorage } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { coinbaseWallet, injected } from 'wagmi/connectors'

export function wagmiConfig() {
  return createConfig({
    chains: [baseSepolia],
    connectors: [
      // injected(),
      coinbaseWallet({
        appName: 'BrettVM Faucet',
        preference: 'all',
        version: '4',
      }),
    ],
    multiInjectedProviderDiscovery: false,
    storage: createStorage({
      storage: cookieStorage,
    }),
    ssr: true,
    transports: {
      [baseSepolia.id]: http(),
    },
  })
}

declare module 'wagmi' {
  interface Register {
    config: ReturnType<typeof wagmiConfig>
  }
}
