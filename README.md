# Get Dress'd by Rissée 👗✨
**Philippine Designer Vietnamese Dress Rental Boutique & Owner Management Portal**

An elegant, full-stack rental platform built for *Get Dress'd by Rissée*, specializing in curated Vietnamese designer gowns, celebratory party dresses, and milestone attire for rent across Metro Manila and the Philippines.

---

## 🌟 Key Features

### 🛍️ Client Experience
- **Curated Dress Catalog**: Browse high-fashion Vietnamese designer dresses with rich photography, size guides, style highlights, and occasion tags.
- **Rental-Only Model**: Strict rental pricing (₱500 – ₱700) for 3-day reservation periods.
- **Booking & Fitting Inquiries**: Customers can request studio fitting appointments, input custom body measurements (bust, waist, hips, height, shoe heel height), and select preferred delivery methods.
- **Philippine Delivery Support**: Personal doorstep delivery in Metro Manila, local express courier, or atelier studio pickup.
- **Payment Information**: Native GCash (with account details and QR code instructions) and Philippine Bank Transfer (BDO, BPI, UnionBank).
- **Chibi Mascot & Aesthetic Touches**: Whimsical illustrated boutique elements with customizable visibility toggles.
- **Seamless Dark & Light Mode**: Tailored editorial themes with zero-flash switching and OS system preference sync.

### 🔐 Owner Management Portal (`/admin`)
- **Protected Access**: Secure authentication for boutique owners (Rissée & Caleb).
- **Interactive Two-Pane Inquiries Hub**: Review incoming rental requests, verify dates, track fitting appointments, review customer measurements, and record private atelier notes.
- **Dress Catalog Manager**: Add, edit, duplicate, archive, and reorder dresses and high-resolution photo galleries.
- **Live Revenue & Reservation Analytics**: Track monthly, weekly, and total rental revenue, outstanding payments, and inventory status (`AVAILABLE`, `RESERVED`, `RENTED`, `UNDER_CLEANING`, `UNAVAILABLE`).
- **Comprehensive Settings**: Customize branding, announcements, GCash numbers, bank accounts, delivery fees, and theme preferences.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- `npm` or `yarn`

### Installation

1. **Clone or Download the Repository:**
   ```bash
   git clone <your-github-repo-url>
   cd get-dressd-by-rissee
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   The application will be live at `http://localhost:3000`.

4. **Production Build:**
   ```bash
   npm run build
   npm start
   ```

---

## 🔑 Default Owner Credentials

To access the administrative workspace at `/admin`:
- **Username / Email:** `caleb0621` or `owner@getdressdbyrissee.com`
- **Password:** `munchkin0603#`

*(Credentials can be securely updated anytime in **Admin > Boutique Settings**)*.

---

## 📁 Project Structure

```text
├── data/
│   └── database.json          # Persistent database file (dresses, inquiries, settings, history)
├── public/
│   └── uploads/               # Uploaded dress photos and atelier media
├── src/
│   ├── components/
│   │   ├── admin/             # Admin layout, sidebar, forms, and navigation
│   │   ├── common/            # Header, Footer, Chibi decorations, Toasts
│   │   └── customer/          # DressCard, InquiryModal, PaymentSection
│   ├── context/
│   │   ├── AuthContext.tsx    # Owner authentication state & session management
│   │   ├── ThemeContext.tsx   # Light / Dark / System theme provider
│   │   └── ToastContext.tsx   # Global notification toasts
│   ├── pages/
│   │   ├── admin/             # Dashboard, Inquiries, Catalog, Categories, Settings, History
│   │   └── customer/          # Home, Catalog, DressDetail, Contact, Payment, About
│   ├── services/
│   │   └── api.ts             # API client with automatic token handling and 401 recovery
│   ├── types/
│   │   └── index.ts           # Central TypeScript interfaces & enums
│   ├── App.tsx                # App routes & layout shell
│   └── index.css              # Tailwind CSS v4 styling & dark theme variants
├── server.ts                  # Express API server with Vite middleware integration
└── package.json
```

---

## 🐙 Connecting to your GitHub Repository

If you are using **Google AI Studio**:
1. Look at the top bar in the AI Studio interface. Click the **Export** or **GitHub** icon to push this project directly to your GitHub account as a new repository.
2. Alternatively, you can initialize git locally and push to your GitHub repository using the standard commands:

```bash
git init
git add .
git commit -m "Initial commit: Get Dress'd by Rissée Rental Boutique"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```
