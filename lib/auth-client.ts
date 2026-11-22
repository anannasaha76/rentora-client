import { createAuthClient } from "better-auth/react"
import { inferAdditionalFields } from "better-auth/client/plugins"
import { jwtClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
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
    }),jwtClient()
  ],
})

export const { signIn, signUp, signOut, useSession } = authClient