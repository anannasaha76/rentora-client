# AGENTS.md — Better Auth, JWT & RBAC Implementation Guide

## Overview
This project uses **Next.js (App Router)** on the frontend, **Better Auth** with the **MongoDB Adapter** and **JWT Plugin** for authentication, and an **Express.js + MongoDB** backend secured via **JWKS JWT verification** and **Role-Based Access Control (RBAC)**.

Supported user roles:
- `Customer` (default role for all new email/password and Google OAuth registrations)
- `Owner`
- `Admin`

> **Important Constraint:** Do **NOT** implement email verification or forgot-password flows.

---

## Mandatory Codebase Audit & Route Protection Rule
Before finishing implementation, **scan the entire codebase** (both frontend Next.js App Router directories and backend Express route/controller files) to identify every page, layout, and API endpoint that handles user-specific, owner-specific, admin-specific, or transactional data:
1. **Frontend Audit:** Locate all private pages/layouts (e.g., Equipment Details, Customer Dashboard, Owner Dashboard, Admin Dashboard, Profile, Booking/Checkout flows) and wrap them with proper session & role checks. Ensure session loading states (`isPending`) are respected so **reloading any private route while logged in never redirects the user to `/login`**.
2. **Backend Audit:** Locate all Express route files and categorize every endpoint as **Public**, **Authenticated (`verifyToken`)**, or **Role-Restricted (`verifyRenter`, `verifyOwner`, `verifyAdmin`)**. Apply the corresponding middlewares to every non-public endpoint—do not leave any sensitive route unprotected.

---

## Step-by-Step Implementation Workflow

### Step 1: Install Packages & Configure Environment Variables
1. Install required dependencies:
   - **Frontend / Auth:** `better-auth`, `@better-auth/mongo-adapter`, `mongodb`
   - **Backend (Express):** `jose` (recommended for remote JWKS verification) 
2. Configure environment variables in `.env` (never hardcode secrets):
   - `BETTER_AUTH_SECRET` (minimum 32 characters)
   - `BETTER_AUTH_URL` (e.g., `http://localhost:3000` in dev, production frontend URL in prod)
   - `MONGODB_URI`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `NEXT_PUBLIC_API_URL` (Express backend base URL)

---

### Step 2: Configure Custom `role` Field & Google OAuth (`auth.ts`)
1. Initialize Better Auth with `mongodbAdapter(db)`.
2. Extend the `user` schema with a `role` field:
   - `type: "string"`
   - `defaultValue: "Customer"`
   - `input: false` (prevents clients from passing a custom `role` like `"Admin"` during registration)
3. Enable Email/Password and Google OAuth:
   - `emailAndPassword: { enabled: true }`
   - `socialProviders: { google: { clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET! } }`
4. Ensure users signing up via Google automatically receive `role: "Customer"` (via schema `defaultValue` and/or a `databaseHooks.user.create.before` hook).

---

### Step 3: Configure the Better Auth JWT Plugin & Route Handler
1. Add the `jwt` plugin in `auth.ts` with custom claims (`id`, `email`, `name`, `role`):
   ```ts
   import { betterAuth } from "better-auth";
   import { jwt } from "better-auth/plugins";
   import { mongodbAdapter } from "@better-auth/mongo-adapter";

   export const auth = betterAuth({
     database: mongodbAdapter(db),
     emailAndPassword: {
       enabled: true,
     },
     socialProviders: {
       google: {
         clientId: process.env.GOOGLE_CLIENT_ID!,
         clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
       },
     },
     user: {
       additionalFields: {
         role: {
           type: "string",
           required: false,
           defaultValue: "Customer",
           input: false,
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
             role: user.role || "Customer",
           }),
         },
       }),
     ],
   });