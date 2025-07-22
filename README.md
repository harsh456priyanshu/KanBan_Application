# 📋 TaskFlow-Pro

A modern, full-stack **Project Management & Kanban Board Platform** built with the MERN stack. TaskFlow-Pro provides an intuitive interface for managing projects, tasks, and team collaboration with real-time updates and responsive design.

NOTE: - deployed Links : https://kanban-application-frontend.onrender.com   , But Not functioning properly , If you can fix give me suggstions how to fix that , If you want to try , It will be better to clone it and Test the functionality because locally works well and Good 

![Project Status](https://img.shields.io/badge/Status-Active-green)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🌟 Features

### 🎯 **Core Functionality**
- **Kanban Board Management** - Create, edit, and organize boards
- **Drag & Drop Interface** - Intuitive task management with @hello-pangea/dnd
- **List & Card Management** - Organize tasks in customizable lists
- **User Authentication** - Secure JWT-based auth system
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile

### 🎨 **Modern UI/UX**
- **Clean Interface** - Modern design with Tailwind CSS
- **Dark/Light Themes** - User preference support
- **Blur Effects** - Subtle glassmorphism for modals
- **Responsive Sidebar** - Collapsible navigation with user profiles
- **Interactive Animations** - Smooth transitions and hover effects
- **Toast Notifications** - Real-time feedback for user actions

### 👤 **User Management**
- **User Registration & Login** - Secure authentication
- **User Profiles** - Display names, emails, and avatars
- **Role-based Access** - Admin, project manager, developer, tester roles
- **Team Collaboration** - Multi-user project management

### 📊 **Advanced Features**
- **Project Dashboard** - Overview of all projects and tasks
- **Progress Tracking** - Visual progress indicators
- **Search & Filter** - Find tasks and projects quickly
- **File Uploads** - Attach files to tasks (with Multer)
- **Activity Logging** - Track user actions and changes

## 🛠️ Tech Stack

### **Frontend**
- **React 19** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS 4** - Utility-first CSS framework
- **React Router DOM 7** - Client-side routing
- **Axios** - HTTP client for API calls
- **Lucide React** - Beautiful icons
- **React Toastify** - Toast notifications
- **@hello-pangea/dnd** - Drag and drop functionality
- **Headless UI** - Unstyled, accessible UI components

### **Backend**
- **Node.js** - JavaScript runtime
- **Express.js 5** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose 8** - MongoDB ODM
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Multer** - File upload middleware
- **CORS** - Cross-Origin Resource Sharing

### **Development Tools**
- **Nodemon** - Auto-restart server during development
- **ESLint** - Code linting
- **dotenv** - Environment variable management

## 🏗️ Project Structure

```
TaskFlow-Pro/
├── kanban-backend/           # Backend Node.js application
│   ├── controllers/          # Request handlers
│   │   ├── authController.js
│   │   ├── boardController.js
│   │   ├── cardController.js
│   │   ├── listController.js
│   │   ├── projectController.js
│   │   └── teamController.js
│   ├── middleware/           # Custom middleware
│   │   ├── authMiddleware.js
│   │   └── uploadMiddleware.js
│   ├── models/              # Database schemas
│   │   ├── User.js
│   │   ├── Board.js
│   │   ├── Card.js
│   │   ├── List.js
│   │   ├── Project.js
│   │   └── Team.js
│   ├── routes/              # API routes
│   │   ├── authRoutes.js
│   │   ├── boardRoutes.js
│   │   ├── cardRoutes.js
│   │   ├── listRoutes.js
│   │   ├── projectRoutes.js
│   │   └── teamRoutes.js
│   ├── uploads/             # File upload directory
│   ├── .env                 # Environment variables
│   ├── server.js            # Server entry point
│   └── package.json
│
├── kanban-frontend/          # Frontend React application
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── MainLayout.jsx
│   │   │   ├── BoardCard.jsx
│   │   │   ├── CreateBoardModal.jsx
│   │   │   ├── CreateListModal.jsx
│   │   │   ├── EditableModal.jsx
│   │   │   └── TodoBoard.jsx
│   │   ├── pages/            # Page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── BoardView.jsx
│   │   │   ├── ProjectBoardPage.jsx
│   │   │   └── ProjectDashboard.jsx
│   │   ├── context/          # React context
│   │   │   └── AuthContext.jsx
│   │   ├── services/         # API services
│   │   │   └── api.js
│   │   ├── App.jsx           # Main app component
│   │   └── main.jsx          # App entry point
│   ├── public/               # Static assets
│   ├── tailwind.config.js    # Tailwind configuration
│   ├── vite.config.js        # Vite configuration
│   └── package.json
│
└── README.md                 # Project documentation
```

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas)
- **Git**

### 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/TaskFlow-Pro.git
   cd TaskFlow-Pro
   ```

2. **Backend Setup**
   ```bash
   cd kanban-backend
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd ../kanban-frontend
   npm install
   ```

### ⚙️ Environment Configuration

1. **Create Backend Environment File**
   
   Create `.env` in the `kanban-backend` folder:
   ```env
   # MongoDB Connection
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/kanban-app
   
   # JWT Secret (use a strong secret)
   JWT_SECRET=your_super_secret_jwt_key_here
   
   # Server Configuration
   PORT=5000
   BASE_URL=http://localhost:5000
   ```

2. **Database Setup**
   - Create a MongoDB database (local or Atlas)
   - Update the `MONGO_URI` in your `.env` file
   - The application will automatically create collections

### 🏃‍♂️ Running the Application

1. **Start the Backend Server**
   ```bash
   cd kanban-backend
   npm run dev
   ```
   Server will run on `http://localhost:5000`

2. **Start the Frontend Development Server**
   ```bash
   cd kanban-frontend
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

3. **Access the Application**
   - Open your browser and navigate to `http://localhost:5173`
   - The frontend will automatically proxy API requests to the backend

## 🎯 How to Use TaskFlow-Pro

### 1. **User Registration & Login**
- Visit the application homepage
- Click "Sign Up" to create a new account
- Fill in your details (name, username, email, password)
- After registration, log in with your credentials

### 2. **Dashboard Overview**
- After login, you'll see the main dashboard
- View all your projects and boards
- Access recent activities and project statistics

### 3. **Creating Your First Board**
- Click the "Create Board" button
- Enter a board name and description
- Your new Kanban board will be created

### 4. **Managing Lists & Cards**
- **Create Lists**: Click "Add List" to create task categories (To Do, In Progress, Done)
- **Add Cards**: Click "Add Card" in any list to create tasks
- **Drag & Drop**: Move cards between lists by dragging
- **Edit Content**: Click on any card or list to edit its content

### 5. **User Profile Management**
- Your profile information appears in the sidebar
- View your name and email
- Access user settings (if implemented)

### 6. **Responsive Experience**
- **Desktop**: Full sidebar with all navigation
- **Tablet/Mobile**: Collapsible sidebar with touch-friendly interface
- **Cross-device**: Your data syncs across all devices

## 📱 User Interface Features

### **Responsive Sidebar**
- **Desktop**: Expandable/collapsible sidebar
- **Mobile/Tablet**: Slide-out sidebar without backdrop
- **User Profile**: Always visible with name and email

### **Modal System**
- **Create Boards**: Clean, focused board creation
- **Create Lists**: Template-based list creation with color options
- **Edit Content**: Inline editing with blur backgrounds

### **Drag & Drop**
- **Intuitive**: Natural drag and drop for task management
- **Visual Feedback**: Cards highlight when dragging
- **Cross-list**: Move tasks between different lists

## 🔧 API Endpoints

### **Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### **Boards**
- `GET /api/board` - Get all boards
- `POST /api/board` - Create new board
- `PUT /api/board/:id` - Update board
- `DELETE /api/board/:id` - Delete board

### **Lists**
- `GET /api/board/:id/lists` - Get board lists
- `POST /api/board/:id/lists` - Create new list
- `PUT /api/lists/:id` - Update list
- `DELETE /api/lists/:id` - Delete list

### **Cards**
- `GET /api/cards/list/:id` - Get list cards
- `POST /api/cards/list/:id` - Create new card
- `PUT /api/cards/:id` - Update card
- `DELETE /api/cards/:id` - Delete card

## 🎨 Customization

### **Theme Customization**
The project uses Tailwind CSS for styling. You can customize:
- Colors in `tailwind.config.js`
- Component styles in individual components
- Global styles in the main CSS file

### **Adding New Features**
1. **Backend**: Add new controllers, models, and routes
2. **Frontend**: Create new components and pages
3. **Database**: Extend existing schemas or create new ones

## 🐛 Troubleshooting

### Common Issues:

1. **Connection Issues**
   - Ensure MongoDB is running
   - Check your connection string in `.env`
   - Verify network connectivity

2. **Port Conflicts**
   - Backend default: port 5000
   - Frontend default: port 5173
   - Change ports in respective config files if needed

3. **Authentication Problems**
   - Clear localStorage and try again
   - Check JWT_SECRET in environment variables
   - Verify API endpoints are accessible

4. **Build Issues**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check for version conflicts in package.json

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** for the amazing framework
- **Tailwind CSS** for the utility-first CSS framework
- **MongoDB** for the flexible database solution
- **Express.js** for the minimal web framework
- **All Contributors** who helped make this project better

## 📞 Support

If you have any questions or need help, please:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

---

**Happy Task Managing! 🎉**

Made with ❤️ using the MERN Stack
