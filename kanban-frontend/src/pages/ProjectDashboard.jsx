import { useState, useEffect } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Check, Eye } from 'lucide-react';

const ProjectDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const navigate = useNavigate();

  // LocalStorage keys
  const STORAGE_KEYS = {
    PROJECTS: 'kanban_projects',
    LAST_SYNC: 'kanban_projects_last_sync'
  };

  // LocalStorage utility functions
  const saveProjectsToLocalStorage = (projectsData) => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projectsData));
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
    } catch (error) {
      console.error('Failed to save projects to localStorage:', error);
    }
  };

  const getProjectsFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load projects from localStorage:', error);
      return [];
    }
  };

  const clearProjectsFromLocalStorage = () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.PROJECTS);
      localStorage.removeItem(STORAGE_KEYS.LAST_SYNC);
    } catch (error) {
      console.error('Failed to clear projects from localStorage:', error);
    }
  };

  const getLastSyncTime = () => {
    try {
      return localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    } catch (error) {
      console.error('Failed to get last sync time:', error);
      return null;
    }
  };

  // Network status handlers
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      // Sync with server when coming back online
      syncWithServer();
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncWithServer = async () => {
    if (isOffline) return;
    
    try {
      setLoading(true);
      const res = await API.get('/projects');
      const serverProjects = res.data;
      setProjects(serverProjects);
      saveProjectsToLocalStorage(serverProjects);
      setError('');
    } catch (err) {
      console.error('Failed to sync with server:', err);
      // Load from localStorage as fallback
      const localProjects = getProjectsFromLocalStorage();
      setProjects(localProjects);
      setError('Using offline data. Some changes may not be synced.');
    } finally {
      setLoading(false);
    }
  };
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'planning',
    priority: 'medium',
    startDate: '',
    endDate: '',
    deadline: '',
    tags: ''
  });

  const fetchProjects = async () => {
    // Load from localStorage first for instant UI
    const localProjects = getProjectsFromLocalStorage();
    if (localProjects.length > 0) {
      setProjects(localProjects);
    }

    // If online, try to fetch from server
    if (!isOffline) {
      try {
        setLoading(true);
        const res = await API.get('/projects');
        const serverProjects = res.data;
        setProjects(serverProjects);
        saveProjectsToLocalStorage(serverProjects);
        setError('');
      } catch (err) {
        console.error('Error fetching projects:', err);
        // If server fails but we have local data, use it
        if (localProjects.length > 0) {
          setError('Using offline data. Unable to sync with server.');
        } else {
          setError('Failed to fetch projects');
        }
      } finally {
        setLoading(false);
      }
    } else {
      // Offline mode
      if (localProjects.length === 0) {
        setError('No offline data available. Please connect to the internet.');
      } else {
        setError('Working offline. Changes will sync when online.');
      }
      setLoading(false);
    }
  };

  const createProject = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Project title is required');
      return;
    }
    
    try {
      setLoading(true);
      const projectData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };
      
      let updatedProjects;
      
      if (isOffline) {
        // Offline mode - work with localStorage
        const currentProjects = getProjectsFromLocalStorage();
        
        if (editingProject) {
          // Update existing project
          updatedProjects = currentProjects.map(p => 
            p._id === editingProject._id 
              ? { ...p, ...projectData, updatedAt: new Date().toISOString(), _pendingSync: true }
              : p
          );
        } else {
          // Create new project with temporary ID
          const newProject = {
            _id: `temp_${Date.now()}`,
            ...projectData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            progress: 0,
            updates: [],
            members: [],
            _pendingSync: true, // Flag for syncing later
            _isTemporary: true
          };
          updatedProjects = [newProject, ...currentProjects];
        }
        
        setProjects(updatedProjects);
        saveProjectsToLocalStorage(updatedProjects);
        setError('Changes saved offline. Will sync when online.');
      } else {
        // Online mode - work with server
        let serverResponse;
        
        if (editingProject) {
          serverResponse = await API.put(`/projects/${editingProject._id}`, projectData);
          // Update local projects
          updatedProjects = projects.map(p => 
            p._id === editingProject._id ? serverResponse.data : p
          );
        } else {
          serverResponse = await API.post('/projects', projectData);
          // Add new project to local projects
          updatedProjects = [serverResponse.data, ...projects];
        }
        
        setProjects(updatedProjects);
        saveProjectsToLocalStorage(updatedProjects);
        setError('');
      }
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        status: 'planning',
        priority: 'medium',
        startDate: '',
        endDate: '',
        deadline: '',
        tags: ''
      });
      
      setShowCreateForm(false);
      setEditingProject(null);
    } catch (err) {
      if (!isOffline) {
        setError(err.response?.data?.message || `Failed to ${editingProject ? 'update' : 'create'} project`);
        console.error(`Error ${editingProject ? 'updating' : 'creating'} project:`, err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      title: project.title || '',
      description: project.description || '',
      status: project.status || 'planning',
      priority: project.priority || 'medium',
      startDate: project.startDate ? project.startDate.split('T')[0] : '',
      endDate: project.endDate ? project.endDate.split('T')[0] : '',
      deadline: project.deadline ? project.deadline.split('T')[0] : '',
      tags: project.tags ? project.tags.join(', ') : ''
    });
    setShowCreateForm(true);
    setError('');
  };

  const handleDelete = async (project) => {
    try {
      setLoading(true);
      
      if (isOffline) {
        // Offline mode - remove from localStorage
        const updatedProjects = projects.filter(p => p._id !== project._id);
        setProjects(updatedProjects);
        saveProjectsToLocalStorage(updatedProjects);
        
        // If it's not a temporary project, mark it for deletion when online
        if (!project._isTemporary) {
          const deletedProjects = JSON.parse(localStorage.getItem('kanban_deleted_projects') || '[]');
          deletedProjects.push(project._id);
          localStorage.setItem('kanban_deleted_projects', JSON.stringify(deletedProjects));
        }
        
        setError('Project deleted offline. Will sync when online.');
      } else {
        // Online mode - delete from server
        await API.delete(`/projects/${project._id}`);
        const updatedProjects = projects.filter(p => p._id !== project._id);
        setProjects(updatedProjects);
        saveProjectsToLocalStorage(updatedProjects);
        setError('');
      }
      
      setShowDeleteModal(null);
    } catch (err) {
      if (!isOffline) {
        setError(err.response?.data?.message || 'Failed to delete project');
        console.error('Error deleting project:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCompleted = async (project) => {
    try {
      setLoading(true);
      const updatedProjectData = {
        ...project,
        status: 'completed',
        progress: 100,
        updatedAt: new Date().toISOString()
      };
      
      if (isOffline) {
        // Offline mode - update localStorage
        const updatedProjects = projects.map(p => 
          p._id === project._id 
            ? { ...updatedProjectData, _pendingSync: true }
            : p
        );
        setProjects(updatedProjects);
        saveProjectsToLocalStorage(updatedProjects);
        setError('Project marked as completed offline. Will sync when online.');
      } else {
        // Online mode - update server
        const serverResponse = await API.put(`/projects/${project._id}`, updatedProjectData);
        const updatedProjects = projects.map(p => 
          p._id === project._id ? serverResponse.data : p
        );
        setProjects(updatedProjects);
        saveProjectsToLocalStorage(updatedProjects);
        setError('');
      }
    } catch (err) {
      if (!isOffline) {
        setError(err.response?.data?.message || 'Failed to mark project as completed');
        console.error('Error updating project:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingProject(null);
    setShowCreateForm(false);
    setFormData({
      title: '',
      description: '',
      status: 'planning',
      priority: 'medium',
      startDate: '',
      endDate: '',
      deadline: '',
      tags: ''
    });
    setError('');
  };

  const getStatusColor = (status) => {
    const colors = {
      planning: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      on_hold: 'bg-orange-100 text-orange-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  useEffect(() => {
    fetchProjects();
  }, [isOffline]);

  // Initial load from localStorage
  useEffect(() => {
    const localProjects = getProjectsFromLocalStorage();
    if (localProjects.length > 0) {
      setProjects(localProjects);
    }
  }, []);

  if (loading && projects.length === 0) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4">Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Projects</h1>
          {isOffline && (
            <div className="flex items-center mt-2 text-sm">
              <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
              <span className="text-orange-600">Working offline</span>
            </div>
          )}
          {getLastSyncTime() && (
            <div className="text-xs text-gray-500 mt-1">
              Last synced: {new Date(getLastSyncTime()).toLocaleString()}
            </div>
          )}
        </div>
        <div className="flex space-x-2">
          {!isOffline && (
            <button
              onClick={syncWithServer}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition duration-200 disabled:opacity-50"
            >
              {loading ? 'Syncing...' : 'Sync'}
            </button>
          )}
          <button
            onClick={() => {
              if (showCreateForm && editingProject) {
                handleCancelEdit();
              } else {
                setShowCreateForm(!showCreateForm);
              }
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200"
          >
            {showCreateForm ? 'Cancel' : 'Create New Project'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Create/Edit Project Form */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 border">
          <h2 className="text-xl font-semibold mb-4">
            {editingProject ? `Edit Project: ${editingProject.title}` : 'Create New Project'}
          </h2>
          <form onSubmit={createProject} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter project title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter project description"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deadline
                </label>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., frontend, backend, mobile"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition duration-200"
              >
                {loading ? (editingProject ? 'Updating...' : 'Creating...') : (editingProject ? 'Update Project' : 'Create Project')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Projects Grid */}
      {projects.length === 0 && !loading ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No projects found</div>
          <p className="text-gray-400 mt-2">Create your first project to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project._id}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-200 border border-gray-200 relative group"
            >
              {/* Action Buttons */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/project/${project._id}`);
                  }}
                  className="p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                  title="View Details"
                >
                  <Eye size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(project);
                  }}
                  className="p-1.5 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
                  title="Edit Project"
                >
                  <Edit size={14} />
                </button>
                {project.status !== 'completed' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkCompleted(project);
                    }}
                    className="p-1.5 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors"
                    title="Mark as Completed"
                  >
                    <Check size={14} />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteModal(project);
                  }}
                  className="p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                  title="Delete Project"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div 
                className="cursor-pointer" 
                onClick={() => navigate(`/project/${project._id}`)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center">
                    <h2 className="text-xl font-semibold text-gray-900 truncate pr-16">{project.title}</h2>
                    {project._pendingSync && (
                      <span className="ml-2 px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                        Pending sync
                      </span>
                    )}
                    {project._isTemporary && (
                      <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                        Offline
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                      {project.status?.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(project.priority)}`}>
                      {project.priority?.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{project.description || 'No description'}</p>
                
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <div>
                    <span>Progress: {project.progress || 0}%</span>
                  </div>
                  <div>
                    {project.updateCount || 0} updates
                  </div>
                </div>
                
                {project.deadline && (
                  <div className="mt-2 text-xs text-gray-500">
                    Deadline: {new Date(project.deadline).toLocaleDateString()}
                  </div>
                )}
                
                {project.tags && project.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {project.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                    {project.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        +{project.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Delete Project
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "<strong>{showDeleteModal.title}</strong>"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteModal)}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition duration-200"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDashboard;
