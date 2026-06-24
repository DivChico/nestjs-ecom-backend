# Plan: NestJS E-Commerce Backend (Mongoose/MongoDB)

## Phase 1 — Auth Module (JWT, Register, Login, Guards)

### Subtask 1.1 — Create User Mongoose Schema
- **Worker:** backend-dev
- **Depends on:** none
- **Expected output:** `src/users/user.schema.ts` with fields: `email` (unique), `password` (hashed), `role` (`'admin' | 'customer'`), `profile` (optional string). Export `UserDocument` type.
- **Model hint:** cheap

### Subtask 1.2 — Create Auth Module Scaffold
- **Worker:** backend-dev
- **Depends on:** 1.1
- **Expected output:**
  - `src/auth/auth.module.ts` — imports `UsersModule`, `PassportModule`, `JwtModule.registerAsync` (reads secret from `ConfigService`), registers `JwtStrategy`, exports `AuthService`
  - `src/auth/auth.service.ts` — `validateUser(email, password)` with bcrypt compare, `login(email, password)` returning `{ access_token }`, `register(createUserDto)` with bcrypt hash
  - `src/auth/auth.controller.ts` — `POST /auth/register`, `POST /auth/login`
  - `src/auth/jwt.strategy.ts` — `PassportStrategy(Strategy)` reading bearer token, secret from `ConfigService`, validates user exists
  - `src/auth/jwt-auth.guard.ts` — `AuthGuard('jwt')`
  - `src/auth/roles.decorator.ts` — `@Roles('admin', 'customer')` decorator
  - `src/auth/roles.guard.ts` — reads role metadata, checks user role
- **Model hint:** capable

### Subtask 1.3 — Create DTOs for Auth
- **Worker:** backend-dev
- **Depends on:** 1.2
- **Expected output:**
  - `src/auth/dto/register.dto.ts` — `@IsEmail()` email, `@IsNotEmpty() @MinLength(6)` password, `@IsNotEmpty()` role
  - `src/auth/dto/login.dto.ts` — `@IsEmail()` email, `@IsNotEmpty()` password
- **Model hint:** cheap

### Subtask 1.4 — Update AppModule with AuthModule
- **Worker:** backend-dev
- **Depends on:** 1.2
- **Expected output:** Add `AuthModule`, `UsersModule` to `AppModule` imports. Register `ValidationPipe` globally in `main.ts`. Update `MongooseModule` in root to include User schema via `forFeature` or keep schema registration in `UsersModule` (preferred).
- **Model hint:** cheap

## Phase 2 — Users Module (Profile CRUD)

### Subtask 2.1 — Create Users Module
- **Worker:** backend-dev
- **Depends on:** 1.1
- **Expected output:**
  - `src/users/users.module.ts` — imports `MongooseModule.forFeature([{ name: 'User', schema: UserSchema }])`, exports service
  - `src/users/users.service.ts` — `findByEmail()`, `findById()`, `updateProfile()`, `deleteUser()`, `findAll()` (admin)
  - `src/users/users.controller.ts` — `GET /users/profile` (JWT-guarded), `PATCH /users/profile`, `DELETE /users/profile`. Admin endpoints: `GET /users`, `GET /users/:id`, `DELETE /users/:id`
  - `src/users/dto/update-user.dto.ts` — optional `password`, `profile`
- **Model hint:** capable

## Phase 3 — Products Module (Products + Categories)

### Subtask 3.1 — Create Product and Category Schemas
- **Worker:** backend-dev
- **Depends on:** none
- **Expected output:**
  - `src/products/product.schema.ts` — `name`, `description`, `price` (Number), `sku` (unique), `quantity` (Number), `category` (ref `'Category'`), optional `rating` average
  - `src/products/category.schema.ts` — `name` (unique, required)
  - Export both schemas and document types
- **Model hint:** cheap

### Subtask 3.2 — Create Products Module
- **Worker:** backend-dev
- **Depends on:** 3.1
- **Expected output:**
  - `src/products/products.module.ts` — imports `MongooseModule.forFeature` for both Product and Category
  - `src/products/products.service.ts` — CRUD for products and categories, inventory management
  - `src/products/products.controller.ts` — `POST /products` (admin), `GET /products`, `GET /products/:id`, `PATCH /products/:id` (admin), `DELETE /products/:id` (admin). `POST /products/categories`, `GET /products/categories`, `GET /products/categories/:id`, `PATCH /products/categories/:id`, `DELETE /products/categories/:id`
  - `src/products/dto/` — `create-product.dto.ts`, `update-product.dto.ts`, `create-category.dto.ts`, `update-category.dto.ts`
- **Model hint:** capable

### Subtask 3.3 — Add Search & Filtering to Products Service
- **Worker:** backend-dev
- **Depends on:** 3.2
- **Expected output:** Add methods `searchProducts(query: string)` using `$regex` on name/description, `filterProducts(categoryId?, minPrice?, maxPrice?)` using Mongoose query. Add `GET /products/search?query=` and `GET /products/filter?categoryId=&minPrice=&maxPrice=` controller endpoints.
- **Model hint:** capable

## Phase 4 — Orders Module

### Subtask 4.1 — Create Order Schema
- **Worker:** backend-dev
- **Depends on:** 1.1, 3.1
- **Expected output:** `src/orders/order.schema.ts` — `user` (ref `'User'`), `status` (`'placed' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'returned'`), `total` (Number), `items[]` (embedded subdocs with `product` ref, `quantity`, `price`), `createdAt` (timestamps). Export `OrderDocument`.
- **Model hint:** cheap

### Subtask 4.2 — Create Orders Module
- **Worker:** backend-dev
- **Depends on:** 4.1
- **Expected output:**
  - `src/orders/orders.module.ts` — imports `MongooseModule.forFeature` for Order, imports `UsersModule`, `ProductsModule`
  - `src/orders/orders.service.ts` — `createOrder(userId, items)`, `findAll()` (admin), `findByUser(userId)`, `findById(id)`, `updateStatus(id, status)`, `cancelOrder(id)`
  - `src/orders/orders.controller.ts` — `POST /orders`, `GET /orders`, `GET /orders/:id`, `PATCH /orders/:id/status` (admin), `DELETE /orders/:id` (admin)
  - `src/orders/dto/create-order.dto.ts` — items array with productId + quantity
  - `src/orders/dto/update-order-status.dto.ts` — status string
- **Model hint:** capable

## Phase 5 — Cart Module

### Subtask 5.1 — Create Cart Schema
- **Worker:** backend-dev
- **Depends on:** 1.1, 3.1
- **Expected output:** `src/cart/cart.schema.ts` — `user` (ref `'User'`, unique — one cart per user), `items[]` (embedded subdocs with `product` ref, `quantity`). Export `CartDocument`.
- **Model hint:** cheap

### Subtask 5.2 — Create Cart Module
- **Worker:** backend-dev
- **Depends on:** 5.1
- **Expected output:**
  - `src/cart/cart.module.ts` — imports `MongooseModule.forFeature` for Cart, `UsersModule`, `ProductsModule`
  - `src/cart/cart.service.ts` — `findOrCreateCart(userId)`, `addItem(userId, productId, quantity)`, `updateItem(userId, itemId, quantity)`, `removeItem(userId, itemId)`, `getCartSummary(userId)`, `clearCart(userId)`
  - `src/cart/cart.controller.ts` — `POST /cart/add`, `PATCH /cart/update/:itemId`, `DELETE /cart/remove/:itemId`, `GET /cart/summary`, `POST /cart/checkout` (JWT-guarded)
  - `src/cart/dto/` — `add-cart-item.dto.ts`, `update-cart-item.dto.ts`
- **Model hint:** capable

## Phase 6 — Payments Module

### Subtask 6.1 — Create Payments Module with Stripe
- **Worker:** backend-dev
- **Depends on:** 4.2
- **Expected output:**
  - `src/payments/payments.module.ts`
  - `src/payments/payments.service.ts` — `createPaymentIntent(orderId)` using Stripe SDK, `handleWebhook(event)` for `payment_intent.succeeded` (updates order status to "paid")
  - `src/payments/payments.controller.ts` — `POST /payments/create-payment-intent/:orderId`, `POST /payments/webhook`
  - Configure raw body middleware in `AppModule` for Stripe webhook route
  - Add `stripe` to `.env` expectations
- **Model hint:** capable

### Subtask 6.2 — Add PayPal Integration
- **Worker:** backend-dev
- **Depends on:** 4.2
- **Expected output:**
  - `src/payments/paypal.service.ts` — `createOrder(orderId)` with PayPal SDK, `captureOrder(orderId)`
  - Add PayPal routes to `PaymentsController`: `POST /payments/paypal/create-order/:orderId`, `POST /payments/paypal/capture-order/:orderId`
- **Model hint:** capable

## Phase 7 — Reviews Module

### Subtask 7.1 — Create Review Schema
- **Worker:** backend-dev
- **Depends on:** 1.1, 3.1
- **Expected output:** `src/reviews/review.schema.ts` — `user` (ref `'User'`), `product` (ref `'Product'`), `rating` (1–5), `comment` (string), compound unique index on `{ user, product }`. Export `ReviewDocument`.
- **Model hint:** cheap

### Subtask 7.2 — Create Reviews Module
- **Worker:** backend-dev
- **Depends on:** 7.1
- **Expected output:**
  - `src/reviews/reviews.module.ts` — imports `MongooseModule.forFeature`, `UsersModule`, `ProductsModule`
  - `src/reviews/reviews.service.ts` — `addReview(userId, productId, dto)`, `updateReview(userId, reviewId, dto)`, `deleteReview(userId, reviewId)`, `getProductReviews(productId)` (populate user)
  - `src/reviews/reviews.controller.ts` — `POST /reviews/:productId`, `PATCH /reviews/:reviewId`, `DELETE /reviews/:reviewId`, `GET /reviews/product/:productId`
  - `src/reviews/dto/` — `create-review.dto.ts`, `update-review.dto.ts`
- **Model hint:** capable

## Phase 8 — Wishlist Module

### Subtask 8.1 — Create Wishlist Schema
- **Worker:** backend-dev
- **Depends on:** 1.1, 3.1
- **Expected output:** `src/wishlist/wishlist.schema.ts` — `user` (ref `'User'`), `product` (ref `'Product'`). Compound unique index on `{ user, product }`. Export `WishlistDocument`.
- **Model hint:** cheap

### Subtask 8.2 — Create Wishlist Module
- **Worker:** backend-dev
- **Depends on:** 8.1
- **Expected output:**
  - `src/wishlist/wishlist.module.ts` — imports `MongooseModule.forFeature`, `UsersModule`, `ProductsModule`
  - `src/wishlist/wishlist.service.ts` — `addToWishlist(userId, productId)`, `removeFromWishlist(userId, productId)`, `viewWishlist(userId)` (populate product)
  - `src/wishlist/wishlist.controller.ts` — `POST /wishlist/:productId`, `DELETE /wishlist/:productId`, `GET /wishlist`
- **Model hint:** capable

## Phase 9 — Notifications Module

### Subtask 9.1 — Create Notification Schema
- **Worker:** backend-dev
- **Depends on:** 1.1
- **Expected output:** `src/notifications/notification.schema.ts` — `user` (ref `'User'`), `message` (string), `read` (boolean, default false), `createdAt` (timestamps). Export `NotificationDocument`.
- **Model hint:** cheap

### Subtask 9.2 — Create Notifications Module
- **Worker:** backend-dev
- **Depends on:** 9.1
- **Expected output:**
  - `src/notifications/notifications.module.ts` — imports `MongooseModule.forFeature`, `UsersModule`
  - `src/notifications/notifications.service.ts` — `createInAppNotification(userId, message)`, `getNotifications(userId)`, `markAsRead(notificationId)`, `sendEmail(to, subject, text)` via Nodemailer
  - `src/notifications/notifications.controller.ts` — `GET /notifications`, `PATCH /notifications/:id/read`
- **Model hint:** capable

## Phase 10 — Admin Reports Module

### Subtask 10.1 — Create Reports Module
- **Worker:** backend-dev
- **Depends on:** 1.1, 3.2, 4.2
- **Expected output:**
  - `src/reports/reports.module.ts`
  - `src/reports/reports.service.ts` — `getSalesReport(startDate, endDate)` using Mongoose aggregation pipeline on Order collection (`$match`, `$group`, `$sum`), `getAnalytics()` returning counts of users, products, orders
  - `src/reports/reports.controller.ts` — `GET /reports/sales?startDate&endDate`, `GET /reports/analytics` (admin-guarded)
- **Model hint:** capable

## Phase 11 — Testing

### Subtask 11.1 — Update E2E Test
- **Worker:** tester
- **Depends on:** 1.4
- **Expected output:** Update `test/app.e2e-spec.ts` — register `ValidationPipe`, test register + login flow, ensure `GET /` no longer returns `'Hello World!'` (removed old test). Use `MongoMemoryServer` for test DB.
- **Model hint:** cheapest

### Subtask 11.2 — Auth Service Unit Tests
- **Worker:** tester
- **Depends on:** 1.2
- **Expected output:** `src/auth/auth.service.spec.ts` — mock UserModel with `jest.fn()`, test `register()` hashes password, `login()` returns token on valid credentials, throws on invalid.
- **Model hint:** cheapest

### Subtask 11.3 — Products Service Unit Tests
- **Worker:** tester
- **Depends on:** 3.2
- **Expected output:** `src/products/products.service.spec.ts` — mock ProductModel and CategoryModel, test CRUD operations, test search with `$regex`, test filter with price range.
- **Model hint:** cheapest

### Subtask 11.4 — Orders Service Unit Tests
- **Worker:** tester
- **Depends on:** 4.2
- **Expected output:** `src/orders/orders.service.spec.ts` — mock OrderModel, UserModel, ProductModel, test order creation calculates total, test status transitions.
- **Model hint:** cheapest
