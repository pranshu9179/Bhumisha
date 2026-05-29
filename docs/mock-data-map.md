# Mock Data Map

## Collections
- `users`
  - Includes Admin, Expert, Employee, and Vendor records.
  - Powers login, directories, vendor verification, and role redirects.
- `categories`
  - Product taxonomy for admin and vendor catalog flows.
- `products`
  - Vendor catalog listings with SKU, pricing, stock, and publication status.
- `queries`
  - Advisory cases with assigned expert, SLA timing, and workflow status.
- `recommendations`
  - Expert outputs linked to queries and suggested products.
- `orders`
  - Marketplace purchase records with payment and fulfillment states.
- `escalations`
  - SLA breach records linked to queries and employee owners.
- `notifications`
  - User-specific alerts for navbar dropdowns and inbox pages.
- `auditLogs`
  - Read-only operational activity stream plus mutation-driven entries.
- `tasks`
  - Employee task board items with stage and priority.
- `supportCases`
  - Vendor support queue for employee operations.
- `settings`
  - Admin platform controls for the mock environment.

## Fake Endpoints
- `POST /auth/login`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `GET /analytics/overview`
- `GET|POST|PUT /users`
- `GET|PUT /queries`
- `GET|POST /recommendations`
- `GET|POST|PUT /products`
- `GET|POST /categories`
- `GET|PUT /orders`
- `GET|PUT /escalations`
- `GET|PATCH /notifications`
- `GET /audit-logs`
- `GET|PUT /tasks`
- `GET|PUT /support-cases`
- `GET|PUT /settings`
- `POST /demo/reset`

## Demo Credentials
- `admin@bhumisha.test / Admin@123`
- `expert@bhumisha.test / Expert@123`
- `employee@bhumisha.test / Employee@123`
- `vendor@bhumisha.test / Vendor@123`
