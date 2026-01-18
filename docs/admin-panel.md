# Admin Panel Architecture & Design

This document outlines the architecture, database schema, API design, and UI/UX for a comprehensive Admin Panel for the Uttarakhand Getaways OTA platform.

## 1. System Architecture

We will adopt a modern, scalable, and secure serverless architecture.

-   **Frontend**: A Next.js application responsible for rendering the entire Admin UI. It will be a Single Page Application (SPA) experience within the `/admin` route.
-   **Backend (API Layer)**: Next.js API Routes will be used to create a RESTful API. These serverless functions will handle all business logic, data validation, and communication with the database.
-   **Database**: **Cloud Firestore** will serve as our primary database. Its NoSQL, document-based structure is flexible and scalable for our needs.
-   **Authentication**: **Firebase Authentication** will manage user identity. We will leverage its built-in support for roles using custom claims or a `role` field in the user's Firestore document.
-   **Security**: Security will be multi-layered:
    1.  **UI-level**: The frontend will conditionally render components based on the user's role.
    2.  **API-level**: Middleware in our Next.js API routes will protect endpoints, ensuring only authenticated users with the correct role (`admin`, `hotel_manager`) can access them.
    3.  **Database-level**: Firestore Security Rules will provide the ultimate layer of protection, ensuring data integrity and preventing unauthorized access directly at the database layer.

---

## 2. Database Schema (Firestore)

We will use a combination of top-level collections and sub-collections to structure our data logically and efficiently.

```
// Top-level Collections

/users/{userId}
  - uid: string
  - displayName: string
  - email: string
  - role: 'customer' | 'hotel_manager' | 'admin'
  - status: 'active' | 'blocked'
  - createdAt: timestamp

/hotels/{hotelId}
  - name: string
  - description: string
  - address: { street, city, state, zip, country }
  - location: GeoPoint
  - amenities: string[]
  - images: { url: string, alt: string }[]
  - ownerId: string (ref to users collection)
  - status: 'pending' | 'approved' | 'rejected'
  - overallRating: number
  - createdAt: timestamp

/bookings/{bookingId}
  - userId: string (ref to users)
  - hotelId: string (ref to hotels)
  - roomId: string
  - roomType: string
  - checkIn: timestamp
  - checkOut: timestamp
  - guests: number
  - totalPrice: number
  - paymentId: string (ref to payments)
  - status: 'pending' | 'confirmed' | 'cancelled' | 'checked_in' | 'checked_out'
  - createdAt: timestamp

/payments/{paymentId}
  - bookingId: string
  - amount: number
  - currency: string
  - provider: 'razorpay' | 'stripe'
  - transactionId: string
  - status: 'pending' | 'paid' | 'failed' | 'refunded'
  - createdAt: timestamp
  - updatedAt: timestamp

/reviews/{reviewId}
    - userId: string
    - hotelId: string
    - rating: number (1-5)
    - comment: string
    - status: 'pending' | 'approved' | 'hidden'
    - createdAt: timestamp

/promo_codes/{promoCodeId}
    - code: string (e.g., 'WINTER10')
    - description: string
    - discountType: 'percentage' | 'fixed_amount'
    - value: number
    - validFrom: timestamp
    - validUntil: timestamp
    - usageLimit: number
    - timesUsed: number
    - isActive: boolean

// Sub-collections

/hotels/{hotelId}/rooms/{roomId}
  - type: string (e.g., 'Deluxe', 'Suite')
  - description: string
  - capacity: number
  - amenities: string[]
  - images: { url: string, alt: string }[]
  - basePrice: number
  - totalInventory: number

/hotels/{hotelId}/pricing_rules/{ruleId}
  - name: string (e.g., 'Weekend Surge', 'Christmas Special')
  - fromDate: date
  - toDate: date
  - priceMultiplier: number (e.g., 1.2 for 20% increase)
  - fixedPrice: number (overrides base price)
  - appliesToDays: number[] (e.g., [5, 6] for Fri, Sat)

/hotels/{hotelId}/availability/{yyyy-mm-dd}
  - date: timestamp
  - rooms: { [roomId: string]: { available: number, price: number } }
```

---

## 3. API Design (REST Endpoints)

All endpoints will be prefixed with `/api/admin`. Middleware will protect these routes.

**Hotel Management**
-   `GET /api/admin/hotels`: List all hotels with pagination and filters.
-   `POST /api/admin/hotels`: Add a new hotel.
-   `GET /api/admin/hotels/{hotelId}`: Get details of a single hotel.
-   `PUT /api/admin/hotels/{hotelId}`: Update a hotel's details.
-   `DELETE /api/admin/hotels/{hotelId}`: Delete a hotel.
-   `PUT /api/admin/hotels/{hotelId}/status`: Approve or reject a hotel.

**Room Management**
-   `GET /api/admin/hotels/{hotelId}/rooms`: List rooms for a hotel.
-   `POST /api/admin/hotels/{hotelId}/rooms`: Add a new room type.
-   `PUT /api/admin/hotels/{hotelId}/rooms/{roomId}`: Update a room.
-   `DELETE /api/admin/hotels/{hotelId}/rooms/{roomId}`: Delete a room.

**Booking Management**
-   `GET /api/admin/bookings`: List all bookings with filters (date, hotel, status).
-   `GET /api/admin/bookings/{bookingId}`: Get details of a single booking.
-   `PUT /api/admin/bookings/{bookingId}`: Manually edit a booking.
-   `PUT /api/admin/bookings/{bookingId}/status`: Update booking status.
-   `POST /api/admin/bookings/{bookingId}/invoice`: Generate an invoice.

**User Management**
-   `GET /api/admin/users`: List all users.
-   `GET /api/admin/users/{userId}`: Get user details and booking history.
-   `PUT /api/admin/users/{userId}/status`: Block or activate a user.

**Review Management**
-   `GET /api/admin/reviews`: List reviews with filters.
-   `PUT /api/admin/reviews/{reviewId}/status`: Approve or hide a review.
-   `DELETE /api/admin/reviews/{reviewId}`: Delete a review.

**Analytics**
-   `GET /api/admin/analytics/summary`: Get dashboard summary (revenue, bookings today).
-   `GET /api/admin/analytics/revenue`: Get revenue report data.
-   `GET /api/admin/analytics/bookings`: Get bookings report data.

---

## 4. Admin Panel UI Sections

The admin panel will have a clear, sidebar-based navigation.

-   **Dashboard (`/admin`)**: The landing page with key metrics (KPIs) like Today's Bookings, Total Revenue, New Users, Pending Hotel Approvals.
-   **Bookings (`/admin/bookings`)**:
    -   A powerful table view of all bookings.
    -   Filters: Date range, hotel, city, booking status.
    -   Actions: View details, Cancel booking, Resend confirmation.
-   **Hotels (`/admin/hotels`)**:
    -   List of all hotels with search and filter by city/status.
    -   Action to "Add New Hotel".
    -   Hotel Detail View (`/admin/hotels/[id]`): A page with tabs for:
        -   **Details**: Edit hotel info.
        -   **Rooms**: Manage room types for that hotel.
        -   **Pricing**: Set seasonal and weekend pricing rules.
        -   **Availability**: A calendar view to override daily availability.
        -   **Reviews**: Moderate reviews for that hotel.
-   **Users (`/admin/users`)**:
    -   A list of all customers.
    -   Search by name or email.
    -   Actions: View user's booking history, Block/Unblock user.
-   **Payments (`/admin/payments`)**:
    -   List of all transactions.
    -   Filter by status (Paid, Refunded, Failed).
    -   Actions: Initiate refund.
-   **Reviews (`/admin/reviews`)**:
    -   A moderation queue for pending reviews.
    -   Actions: Approve, Hide.
-   **Promotions (`/admin/promotions`)**:
    -   Manage discount codes and promotional offers.
-   **Settings (`/admin/settings`)**:
    -   Manage OTA commission rates.
    -   Configure notification templates (Email/SMS).

---

## 5. Optional Tech Stack Suggestion

-   **Frontend**: Next.js, React, **ShadCN/UI** (for components), **Tailwind CSS**, **Recharts** (for analytics graphs).
-   **Backend/API**: Next.js API Routes.
-   **Database**: Cloud Firestore.
-   **Authentication**: Firebase Authentication.
-   **File Storage**: Firebase Storage (for hotel/room images).
-   **Payments**: Razorpay (for India) or Stripe (globally).
-   **Notifications**:
    -   Email: SendGrid or Resend.
    -   SMS: Twilio.
-   **Deployment**: Vercel (for Next.js frontend) and Firebase Hosting/Functions.
-   **Form Management**: `react-hook-form` with `zod` for validation.
-   **State Management**: React Context or Zustand for simple global state.
