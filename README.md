# TeeStore Frontend

A modern, animated e-commerce frontend for TeeStore built with React, TypeScript, Tailwind CSS, and Motion (Framer Motion).

## Overview

This is the customer-facing frontend for the TeeStore e-commerce platform. It provides a smooth, animated shopping experience with product browsing, cart management, user authentication, and order management.

**Base URL**: `http://localhost:3000` (Local development)

## Features

- 🎨 **Beautiful UI Design** - Modern gradient-based design with Tailwind CSS
- 🎬 **Smooth Animations** - All powered by Motion.dev (Framer Motion v12)
- 🛒 **Complete E-Commerce** - Products, cart, checkout, and order management
- 🔐 **User Authentication** - Registration and login with JWT tokens
- 📱 **Fully Responsive** - Mobile, tablet, and desktop optimized
- ⚡ **High Performance** - Optimized React components and efficient state management
- 🎯 **Type-Safe** - Full TypeScript support with strict mode
- 🔄 **Real-time Updates** - Hot module reloading in development

## Tech Stack

```
Frontend Framework:
├── React 18.2.0           - UI Library
├── TypeScript 4.9.5       - Type Safety
└── React Router 6.20.0    - Client-side Routing

State Management & Data:
├── Zustand 4.4.1         - State Management
└── Axios 1.6.0           - HTTP Client

Styling & Animation:
├── Tailwind CSS 3.3.0    - Utility-first CSS
├── Motion 12.23.26       - Animation Library
└── PostCSS 8.4.31        - CSS Processing

UI & Notifications:
└── React Hot Toast 2.4.1 - Toast Notifications

Build Tools:
└── React Scripts 5.0.1   - Create React App

Development:
└── React Hot Toast        - Toast notifications
```

## Project Structure

```
frontend/
├── public/
│   └── index.html              # Main HTML file
├── src/
│   ├── components/
│   │   ├── Navbar.tsx          # Navigation bar with cart & auth
│   │   ├── Footer.tsx          # Footer with links & social
│   │   └── ProductCard.tsx     # Reusable product card component
│   ├── pages/
│   │   ├── HomePage.tsx        # Home page with products
│   │   ├── ProductDetailsPage.tsx  # Product details & add to cart
│   │   ├── CartPage.tsx        # Shopping cart view
│   │   ├── CheckoutPage.tsx    # 2-step checkout process
│   │   ├── AuthPage.tsx        # Login/Register page
│   │   └── OrdersPage.tsx      # User orders history
│   ├── App.tsx                 # Main app component & routing
│   ├── api.ts                  # API client & endpoints
│   ├── store.ts                # Zustand store (auth & cart)
│   ├── index.tsx               # React entry point
│   └── index.css               # Global styles
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore rules
├── package.json                # Dependencies & scripts
├── tailwind.config.js          # Tailwind configuration
├── postcss.config.js           # PostCSS configuration
├── tsconfig.json               # TypeScript configuration
└── README.md                   # This file
```

## Installation & Setup

### Prerequisites

- Node.js 16+ 
- npm 8+

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Environment Configuration (Optional)

Create a `.env.local` file in the root directory:

```env
REACT_APP_API_URL=http://localhost:8000
```

If not provided, defaults to `http://localhost:8000`

### Step 3: Start Development Server

```bash
npm start
```

The application will open automatically at `http://localhost:3000`

## Available Scripts

### Development

```bash
npm start
```
Runs the app in development mode with hot reloading.  
Open [http://localhost:3000](http://localhost:3000) to view in browser.

### Production Build

```bash
npm run build
```
Builds the app for production to the `build` folder.  
Optimizes the build for best performance.

### Testing

```bash
npm test
```
Launches the test runner in interactive watch mode.

## Pages & Routes

### Home Page
**Route**: `/`

- Hero section with animated gradients
- Featured products grid
- Feature cards (Fast Shipping, Quality, Security)
- Product search and browse
- Smooth page animations

**Components Used**:
- Framer Motion animations
- ProductCard component
- Responsive grid layout

---

### Product Details
**Route**: `/products/:slug`

- Product image and description
- Size and color variants selection
- Quantity selector
- Real-time price calculation
- Stock availability check
- Add to cart functionality
- Related products (future feature)

**Features**:
- Dynamic variant filtering
- Animated product images
- Stock status display
- Add to cart with validation

---

### Shopping Cart
**Route**: `/cart`

- View all cart items
- Remove individual items
- Order summary with totals
- Shipping and tax calculation
- Proceed to checkout button
- Continue shopping option
- Empty cart state

**Features**:
- Real-time cart updates
- Item quantity management
- Price calculations
- Smooth item removal animations

---

### Checkout
**Route**: `/checkout`

**Requirements**: User must be authenticated

Two-step checkout process:

1. **Shipping Address** (Step 1)
   - Full name input
   - Address line 1 & 2
   - City, State, ZIP code
   - Country selection
   - Form validation

2. **Order Review** (Step 2)
   - Confirm shipping address
   - Review order items
   - Final price summary
   - Place order button

**Features**:
- Multi-step form with validation
- Address persistence
- Order summary
- Order creation via API

---

### Authentication
**Route**: `/auth`

**Modes**: Login & Register

**Login**:
- Email input
- Password input
- Sign in button
- Auto-redirect to previous page

**Register**:
- Full name input
- Email input
- Password input
- Auto-login after registration
- Terms agreement (future)

**Features**:
- Form validation
- Smooth transitions between modes
- JWT token management
- Persistent authentication
- Protected routes

---

### Orders History
**Route**: `/orders`

**Requirements**: User must be authenticated

- View all user orders
- Expandable order details
- Order status display
- Order date and total
- Shipping address view
- Order items breakdown

**Features**:
- Order status badges
- Expandable sections with animations
- Order item details
- Shipping information
- Total amount display

## Components

### Navbar
**File**: `src/components/Navbar.tsx`

Persistent navigation bar with:
- Logo & brand name
- Shop link
- Orders link (when authenticated)
- Shopping cart icon with item count
- User profile display
- Logout button
- Login/Sign up button

**Props**: None (uses global store)

### Footer
**File**: `src/components/Footer.tsx`

Footer section with:
- Company branding
- Quick links
- Support links
- Social media buttons
- Copyright information

**Props**: None

### ProductCard
**File**: `src/components/ProductCard.tsx`

Reusable product card displaying:
- Product image placeholder
- Title and description
- Available sizes and colors
- Base price
- Add to cart button
- Hover animations

**Props**:
```typescript
interface ProductCardProps {
  product: Product;
  index: number;
}
```

## API Integration

### Base URL

```
http://localhost:8000
```

### Authentication

Most endpoints require Bearer token authentication via JWT.

**Token Management**:
- Stored in `localStorage` as `token`
- Automatically added to all requests via Axios interceptor
- Cleared on logout

### Endpoints

#### Authentication

**Register User**
```
POST /auth/register
Content-Type: application/json

Request:
{
  "email": "user@example.com",
  "password": "strongpassword",
  "full_name": "John Doe"
}

Response (200 OK):
{
  "id": "user_id",
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "USER",
  "is_active": true
}
```

**Login (Get Token)**
```
POST /auth/token
Content-Type: application/x-www-form-urlencoded

Request:
username=user@example.com
password=strongpassword

Response (200 OK):
{
  "access_token": "jwt_token_string",
  "token_type": "bearer"
}
```

#### Products

**List Products**
```
GET /products/?skip=0&limit=20

Query Parameters:
- skip: number (default: 0)
- limit: number (default: 20)

Response (200 OK):
[
  {
    "id": "product_id",
    "title": "T-Shirt",
    "description": "A cool t-shirt",
    "base_price": 20.00,
    "slug": "t-shirt",
    "variants": [
      {
        "sku": "TSHIRT-BLK-S",
        "size": "S",
        "color": "Black",
        "stock_quantity": 100,
        "price_adjustment": 0.00
      }
    ],
    "is_published": true,
    "created_at": "timestamp"
  }
]
```

**Get Product Details**
```
GET /products/{slug}

Response (200 OK):
{
  "id": "product_id",
  "title": "T-Shirt",
  "description": "A cool t-shirt",
  "base_price": 20.00,
  "slug": "t-shirt",
  "variants": [...],
  "is_published": true,
  "created_at": "timestamp"
}
```

#### Cart

**Get Cart**
```
GET /cart/
Authorization: Bearer <user_token>

Response (200 OK):
{
  "id": "cart_id",
  "user_id": "user_id",
  "items": [
    {
      "product_id": "product_id",
      "variant_sku": "SKU-123",
      "quantity": 2,
      "added_at": "timestamp"
    }
  ],
  "updated_at": "timestamp"
}
```

**Add Item to Cart**
```
POST /cart/items
Authorization: Bearer <user_token>
Content-Type: application/json

Request:
{
  "product_id": "product_id_string",
  "variant_sku": "SKU-123",
  "quantity": 1
}

Response (200 OK):
{
  "id": "cart_id",
  "user_id": "user_id",
  "items": [...]
}
```

**Remove Item from Cart**
```
DELETE /cart/items/{product_id}/{variant_sku}
Authorization: Bearer <user_token>

Response (200 OK):
{
  "id": "cart_id",
  "user_id": "user_id",
  "items": [...]
}
```

#### Orders

**Create Order**
```
POST /orders/
Authorization: Bearer <user_token>
Content-Type: application/json

Request:
{
  "shipping_address": {
    "full_name": "Jane Doe",
    "address_line_1": "123 Main St",
    "address_line_2": "Apt 4B",
    "city": "New York",
    "state": "NY",
    "zip_code": "10001",
    "country": "USA"
  }
}

Response (201 Created):
{
  "id": "order_id",
  "user_id": "user_id",
  "status": "PENDING",
  "items": [
    {
      "product_id": "pid",
      "variant_sku": "sku",
      "title": "Product Title",
      "size": "M",
      "color": "Blue",
      "unit_price": 20.00,
      "quantity": 1
    }
  ],
  "total_amount": 20.00,
  "currency": "USD",
  "shipping_address": {...},
  "created_at": "timestamp"
}
```

**Get User Orders**
```
GET /orders/
Authorization: Bearer <user_token>

Response (200 OK):
[
  {
    "id": "order_id",
    "user_id": "user_id",
    "status": "DELIVERED",
    "items": [...],
    "total_amount": 99.99,
    "currency": "USD",
    "shipping_address": {...},
    "created_at": "timestamp"
  }
]
```

## State Management

### Zustand Stores

#### useAuthStore

```typescript
interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  logout: () => void;
}
```

**Usage**:
```typescript
const { user, token, setUser, setToken, logout } = useAuthStore();
```

**Features**:
- Persistent storage in localStorage
- Automatic initialization from localStorage
- Token management for API requests

#### useCartStore

```typescript
interface CartStore {
  cart: Cart | null;
  setCart: (cart: Cart | null) => void;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantSku: string) => void;
  clearCart: () => void;
}
```

**Usage**:
```typescript
const { cart, setCart, addItem, removeItem, clearCart } = useCartStore();
```

## Animations & Styling

### Motion (Framer Motion) Usage

All animations use Motion.dev v12 for smooth, performant animations:

```typescript
// Page transitions
<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} />

// Hover effects
<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} />

// Scroll triggers
<motion.section 
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
/>

// Spring animations
<motion.div 
  animate={{ rotate: 360 }}
  transition={{ type: 'spring', stiffness: 100 }}
/>
```

### Tailwind CSS

All styling uses Tailwind CSS utility classes:
- Responsive design with mobile-first approach
- Gradient backgrounds
- Shadow effects
- Smooth transitions
- Custom color scheme

## Error Handling

### Toast Notifications

Errors and success messages displayed using React Hot Toast:

```typescript
import toast from 'react-hot-toast';

toast.error('Error message');
toast.success('Success message');
toast.loading('Loading...');
```

### API Error Handling

Axios interceptor catches and handles errors:
- Network errors
- Auth failures (redirect to login)
- Validation errors
- Server errors

## Performance Optimizations

- **Code Splitting**: Routes are lazy-loaded
- **Component Optimization**: Memoization where needed
- **Animation Performance**: 60fps animations using Motion
- **State Management**: Efficient with Zustand
- **Minimal Re-renders**: Proper dependency arrays in hooks

## Browser Compatibility

| Browser | Supported | Version |
|---------|-----------|---------|
| Chrome  | ✅        | Latest  |
| Firefox | ✅        | Latest  |
| Safari  | ✅        | Latest  |
| Edge    | ✅        | Latest  |
| IE 11   | ❌        | N/A     |

## Development Workflow

### Local Development

```bash
# Terminal 1: Start Frontend
cd frontend
npm start

# Terminal 2: Start Backend
cd backend
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
uvicorn app.main:app --reload
```

### Building for Production

```bash
npm run build
```

Creates an optimized production build in the `build` folder.

## Environment Variables

### Available Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `REACT_APP_API_URL` | `http://localhost:8000` | Backend API URL |

### .env.local Example

```env
REACT_APP_API_URL=http://localhost:8000
```

## Future Enhancements

- [ ] Product search and filtering
- [ ] Advanced product sorting
- [ ] Wishlist/favorites
- [ ] Product reviews and ratings
- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] Order tracking with notifications
- [ ] User profile management
- [ ] Inventory management dashboard
- [ ] Dark mode support
- [ ] Multi-language support (i18n)
- [ ] Progressive Web App (PWA)
- [ ] Performance metrics dashboard

## Troubleshooting

### Port 3000 Already in Use

```bash
# Kill the process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:3000 | xargs kill -9
```

### API Connection Issues

1. Verify backend is running on `http://localhost:8000`
2. Check `.env.local` has correct `REACT_APP_API_URL`
3. Ensure CORS is configured on backend
4. Check browser console for detailed errors

### Styling Issues

```bash
# Rebuild Tailwind CSS
npm run build
```

## Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make your changes
3. Commit: `git commit -am 'Add new feature'`
4. Push: `git push origin feature/my-feature`
5. Create Pull Request

## License

Part of the TeeStore e-commerce platform.

## Support

For issues and questions:
1. Check existing issues
2. Check backend README for API details
3. Review component documentation
4. Check browser console for errors
