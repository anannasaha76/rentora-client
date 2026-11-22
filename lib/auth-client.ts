import { createAuthClient } from "better-auth/react"
import { inferAdditionalFields, jwtClient } from "better-auth/client/plugins"

const baseURL =
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
  (typeof window !== "undefined" ? window.location.origin : undefined)

export const authClient = createAuthClient({
  baseURL,
  sessionOptions: {
    refetchInterval: 0,
    refetchOnWindowFocus: false,
  },
  plugins: [
    inferAdditionalFields({
      user: {
        role: {
          type: "string",
        },
        phoneNumber: {
          type: "string",
        },
        address: {
          type: "string",
        },
      },
    }),
    jwtClient(),
  ],
})

export const { signIn, signUp, signOut, useSession } = authClient