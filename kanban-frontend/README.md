# Kanban Board Application

A modern, feature-rich Kanban board application built with React and Vite, featuring drag-and-drop functionality, file attachments, and real-time collaboration.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/react-19.1.0-blue.svg)
![Vite](https://img.shields.io/badge/vite-7.0.3-yellow.svg)

## ✨ Features

- 🎯 **Kanban Board Management**: Create, edit, and organize boards
- 📋 **Card Management**: Full CRUD operations for cards
- 🎨 **Drag & Drop**: Intuitive drag-and-drop interface
- 📎 **File Attachments**: Upload, download, and manage file attachments
- 👥 **User Management**: Authentication and authorization
- 📱 **Responsive Design**: Mobile-friendly interface
- 🔔 **Real-time Notifications**: Toast notifications for user feedback
- 📊 **Dashboard**: Overview of boards and activities

## 🚀 Tech Stack

- **Frontend**: React 19, Vite, TailwindCSS
- **UI Components**: Headless UI, Lucide React Icons
- **Drag & Drop**: @hello-pangea/dnd
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Notifications**: React Toastify

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/kanban-frontend.git
   cd kanban-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your configuration:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_API_TIMEOUT=10000
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```



### Development
```bash
npm run dev          # Start development server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
```

### Production Build
```bash
npm run build:prod   # Build for production
npm run preview:prod # Preview production build
```

### Environment Setup
- **Development**: Uses `.env.local`
- **Production**: Uses `.env.production`



## 🔧 Quick Start

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Start development
npm run dev

# Build for production
npm run build:prod
```

---

**Made with ❤️ for project management**
