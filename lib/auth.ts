import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { jwt } from "better-auth/plugins";

const globalForAuthMongo = globalThis as typeof globalThis & {
  _betterAuthMongoClient?: MongoClient;
  _betterAuthMongoClientPromise?: Promise<MongoClient>;
};

const uri = process.env.BETTER_AUTH_DB_URI as string;

if (!globalForAuthMongo._betterAuthMongoClient) {
  globalForAuthMongo._betterAuthMongoClient = new MongoClient(uri);
  globalForAuthMongo._betterAuthMongoClientPromise =
    globalForAuthMongo._betterAuthMongoClient.connect();
}

const client = globalForAuthMongo._betterAuthMongoClient;
const db = client.db("rentoradb");

const allowedOrigins = [
  "https://rentora-client-orcin.vercel.app",
  "http://localhost:3000",
  process.env.BETTER_AUTH_URL,
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
].filter((origin): origin is string => Boolean(origin));

export const auth = betterAuth({
  baseURL:
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
    "https://rentora-client-orcin.vercel.app",
  trustedOrigins: async (request) => {
    const origin = request?.headers.get("origin");
    if (origin && origin.endsWith(".vercel.app")) {
      return [...allowedOrigins, origin];
    }
    return allowedOrigins;
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "customer",
        input: false,
      },
      requestedRole: {
        type: "string",
        required: false,
        defaultValue: "customer",
        input: true,
      },
      phoneNumber: {
        type: "string",
        required: false,
        input: true,
      },
      address: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  database: mongodbAdapter(db, {
    client,
  }),
  databaseHooks: {
    user: {
      create: {
        before: async (user) => ({
          data: {
            ...user,
            role: user.requestedRole === "owner" ? "owner" : "customer",
          },
        }),
      },
    },
  },
  plugins: [
    jwt({
      jwt: {
        expirationTime: "1h",
        definePayload: ({ user }) => ({
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role || "customer",
        }),
      },
    }),
  ],
  session: {
    cookieCache: {
      enabled: true,
      strategy: "jwt",
      maxAge: 7 * 24 * 60 * 60,
    },
  },
});