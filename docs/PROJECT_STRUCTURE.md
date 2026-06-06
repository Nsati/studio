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

## 🛠️ 5. Implementation Logic (Kaise Banaya?)

### I. The UI Strategy (Cinematic Experience)
- Humne **Tailwind CSS** aur **Framer Motion** ka use kiya hai "Cinematic Transitions" ke liye. Har animation `initial`, `animate`, aur `whileInView` properties se control hoti hai.
- **Shadcn UI** ke components ko customize karke "Himalayan Snow" aur "Forest Green" theme di gayi hai.

### II. Secure Transaction Node
- **Logic:** Payment verify hone ke baad system **Firestore Transactions** (`adminDb.runTransaction`) ka use karta hai.
- **Why?** Taaki agar do log ek hi room book karein, to system double-booking allow na kare. Inventory update hone ke baad hi booking confirm hoti hai.

### III. AI Travel Curator
- Humne **Genkit Flows** ka use kiya hai. Gemini 2.5 Flash ko specific "System Instructions" di gayi hain ki wo sirf Uttarakhand ki locations suggest kare.
- JSON schemas define kiye hain taaki AI output humesha valid ho aur frontend par crash na ho.

### IV. SMTP Node Reliability
- System **Port 587** aur **TLS** use karta hai. Maine Gmail ki security bypass karne ke liye `rejectUnauthorized: false` logic add kiya hai taaki cloud servers se handshake fail na ho.

### V. Bulk Inventory Logic
- Admin panel mein **PapaParse** use kiya gaya hai CSV files ko read karne ke liye. System batch-writing logic use karta hai taaki 100-200 hotels ek saath cloud mein sync ho sakein.

---

*Documentation Version: 1.2.0*  
*Project: Northern Harrier - Himalayan Expeditions*