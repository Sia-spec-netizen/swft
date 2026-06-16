# 🏦 Swift Investment Bank (SIB)
### Private Wealth Digital Banking Portal

![SIB Banner](https://img.shields.io/badge/Swift%20Investment%20Bank-v1.0.0-001A57?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTQgMjIgTDE2IDYgTDI4IDIyIFoiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMi41IiBmaWxsPSJub25lIi8+PC9zdmc+)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

## 📋 Overview

Swift Investment Bank is a **full-featured digital banking UI** built with React. Inspired by Chase Bank's clean UX, it delivers a premium private wealth banking experience with a dark navy and gold design system.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Secure Login** | Email/password auth with biometrics option |
| 📊 **Dashboard** | Portfolio overview, market pulse, spending charts |
| 💸 **Wire Transfer** | 3-step flow with OTP verification via SMS popup |
| 🔒 **New Payee Lock** | New recipients trigger customer support verification |
| 💳 **Card Management** | Platinum Visa Infinite with lock/controls |
| 👤 **Profile** | Account details, contact info, security settings |
| ⚙️ **Settings** | Security, notifications, support contacts |
| 📱 **Mobile-First** | Fully responsive, works on all screen sizes |

---

## 🎨 Design System

| Token | Value |
|---|---|
| Primary Navy | `#001A57` |
| Mid Navy | `#002880` |
| Accent Blue | `#0052CC` |
| Gold | `#C9A84C` |
| Silver | `#B8C4D8` |
| Heading Font | Playfair Display |
| Body Font | DM Sans |

---

## 🚀 Getting Started

### Prerequisites
- Node.js `>=14.0.0`
- npm `>=6.0.0`

### Installation

```bash
# Clone the repository
git clone https://github.com/Sia-spec-netizen/Swift-Investment-Bank.git

# Navigate into the project
cd Swift-Investment-Bank

# Install dependencies
npm install

# Start the development server
npm start
```

The app will open at **http://localhost:3000**

### Build for Production

```bash
npm run build
```

Output goes to the `/build` folder — ready to deploy to Netlify, Vercel, or GitHub Pages.

---

## 📁 Project Structure

```
swift-investment-bank/
├── public/
│   └── index.html              # HTML shell
├── src/
│   ├── components/
│   │   └── SwiftInvestmentBank.jsx   # Main app component
│   ├── App.js                  # Root component
│   ├── index.js                # React entry point
│   └── index.css               # Global styles
├── package.json
├── .gitignore
└── README.md
```

---

## 🔐 Transfer Flow

```
Select Payee
    ├── Saved Payee  →  Enter Amount  →  Review  →  OTP Verify  →  ✅ Success
    └── New Payee    →  🔒 Contact Support: Infoswiftibn@yahoo.com
```

**Customer Support Email:** `Infoswiftibn@yahoo.com`

---

## 🛠️ Tech Stack

- **React 18** – UI framework
- **Hooks** – `useState`, `useRef`, `useEffect`
- **CSS-in-JS** – Inline styles + injected keyframes
- **Google Fonts** – Playfair Display, DM Sans
- **No external UI libraries** – Zero dependencies beyond React

---

## 📜 License

MIT © 2026 Swift Investment Bank N.A.

---

> *"Your wealth, secured."* — SIB Private Banking
