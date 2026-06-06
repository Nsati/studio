# 🦅 Northern Harrier | Project Architecture & Structure

Welcome to the official technical documentation for the Northern Harrier (Tripzy) platform. This document outlines the folder hierarchy, technology stack, and core logic flow.

---

## 🚀 1. Technology Stack
- **Framework:** Next.js 15 (App Router) - Modern, fast, and SEO friendly.
- **Language:** TypeScript - For type-safe and bug-free code.
- **Styling:** Tailwind CSS + Shadcn UI - Professional, responsive, and cinematic design.
- **Backend:** Firebase (Firestore, Auth, Storage, App Hosting).
- **AI Engine:** Google Genkit + Gemini 2.5 Flash.
- **Payments:** Razorpay Gateway.
- **Email:** NodeMailer (SMTP) via Gmail Node.

---

## 📂 2. Folder Structure Walkthrough

### `src/app` (The Routing Engine)
This is where all the pages and server-side logic reside.
- **/admin:** Management dashboard for Hotels, Bookings, Users, and Packages.
- **/api:** Backend routes for Webhooks (Razorpay) and Token verification.
- **/auth:** Server actions for OTP generation and verification.
- **/booking:** The checkout flow with Razorpay integration.
- **/hotels/[slug]:** Dynamic hotel detail pages with smart insights.
- **/search:** Real-time filtered search hub for properties.
- **/vibe-match:** AI-powered travel recommendation engine.

### `src/components` (The UI Library)
Divided into logical modules for high reusability.
- **/admin:** Forms for bulk uploads, hotel editing, and analytics.
- **/auth:** Cinematic Login and Signup forms.
- **/hotel:** Hotel cards, amenity icons, and booking sidebars.
- **/shared:** Global Header, Footer, and Brand Logo.
- **/ui:** Low-level atomic components (Buttons, Inputs, Dialogs) from Shadcn.

### `src/firebase` (The Cloud Bridge)
Handles all communication with Google Firebase.
- `admin.ts`: Secure server-side Admin SDK singleton.
- `config.ts`: Public client-side configuration.
- `provider.tsx`: React Context for sharing Auth and Firestore states.
- `hooks.ts`: Custom hooks like `useUser`, `useDoc`, and `useCollection`.

### `src/lib` (The Utility Belt)
Core services and helper functions.
- `pdf-service.ts`: Generates professional billing invoices.
- `email-service.ts`: Hardened SMTP node for OTP and Bill dispatch.
- `types.ts`: Master TypeScript interfaces for the entire project.
- `utils.ts`: Tailwind class merging and common helpers.

### `src/ai` (Artificial Intelligence)
Genkit configuration and flow definitions.
- **/flows:** Logic for Vibe Matching and Review Summarization.
- `genkit.ts`: Central AI initialization.

---

## 🔐 3. Core Logic Flows

### A. Authentication Flow
1. User enters details in **SignupForm**.
2. **Server Action** generates 6-digit OTP and sends via **Gmail SMTP**.
3. Upon verification, **Firebase Auth** creates the user.
4. Profile node is synced in **Firestore** (`/users/{uid}`).

### B. Booking & Payment Flow
1. User selects room and dates in **RoomBookingCard**.
2. **Razorpay Order** is created via `/api/razorpay/order`.
3. After successful payment, **Server Action** triggers:
   - Firestore transaction to decrement inventory.
   - Creation of booking node.
   - Generation of **PDF Invoice**.
   - Dispatch of **Confirmation Email**.

---

## 🛡️ 4. Security Protocols
- **Firestore Rules:** Implements RBAC (Role Based Access Control). Only Admins can modify inventory. Users can only see their own bookings.
- **Middleware:** Global security headers and CORS protection.
- **Admin SDK:** Critical tasks (Bulk delete, user purge) are handled exclusively on the server.

---

*Documentation Version: 1.1.0*  
*Project: Northern Harrier - Himalayan Expeditions*
