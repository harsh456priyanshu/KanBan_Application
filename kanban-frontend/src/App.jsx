import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import ProjectDashboard from "./pages/ProjectDashboard"
import ProjectDetail from "./pages/ProjectDetail"
import Login from './pages/Login';
import Register from './pages/Register';
import BoardView from './pages/BoardView';
import TodoPage from './pages/TodoPage';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/board/:id" element={<BoardView />} />
          <Route path="/projects" element={<ProjectDashboard />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/todo" element={<TodoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
