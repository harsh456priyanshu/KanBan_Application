import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // LocalStorage keys
  const STORAGE_KEYS = {
    PROJECTS: 'kanban_projects',
    PROJECT_UPDATES: 'kanban_project_updates'
  };

  // LocalStorage utility functions
  const getProjectsFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load projects from localStorage:', error);
      return [];
    }
  };

  const saveProjectsToLocalStorage = (projects) => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    } catch (error) {
      console.error('Failed to save projects to localStorage:', error);
    }
  };

  const getProjectUpdatesFromLocalStorage = (projectId) => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEYS.PROJECT_UPDATES}_${projectId}`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load project updates from localStorage:', error);
      return [];
    }
  };

  const saveProjectUpdatesToLocalStorage = (projectId, updatesData) => {
    try {
      localStorage.setItem(`${STORAGE_KEYS.PROJECT_UPDATES}_${projectId}`, JSON.stringify(updatesData));
    } catch (error) {
      console.error('Failed to save project updates to localStorage:', error);
    }
  };

  // Network status handlers
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
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
  
  // Update form state
  const [updateForm, setUpdateForm] = useState({
    type: 'general',
    title: '',
    description: '',
    priority: 'medium',
    tags: ''
  });

  const fetchProject = async () => {
    // Load from localStorage first for instant UI
    const localProjects = getProjectsFromLocalStorage();
    const localProject = localProjects.find(p => p._id === id);
    if (localProject) {
      setProject(localProject);
    }

    // If online, try to fetch from server
    if (!isOffline) {
      try {
        setLoading(true);
        const response = await API.get(`/projects/${id}`);
        setProject(response.data);
        
        // Update the project in localStorage
        const updatedProjects = localProjects.map(p => 
          p._id === id ? response.data : p
        );
        saveProjectsToLocalStorage(updatedProjects);
        setError('');
      } catch (err) {
        console.error('Error fetching project:', err);
        if (localProject) {
          setError('Using offline data. Unable to sync with server.');
        } else {
          setError('Failed to fetch project details');
        }
      } finally {
        setLoading(false);
      }
    } else {
      // Offline mode
      if (!localProject) {
        setError('Project not available offline. Please connect to the internet.');
      } else {
        setError('Working offline. Changes will sync when online.');
      }
      setLoading(false);
    }
  };

  const fetchUpdates = async () => {
    // Load from localStorage first
    const localUpdates = getProjectUpdatesFromLocalStorage(id);
    if (localUpdates.length > 0) {
      setUpdates(localUpdates);
    }

    // If online, try to fetch from server
    if (!isOffline) {
      try {
        const response = await API.get(`/projects/${id}/updates`);
        const serverUpdates = response.data.updates;
        setUpdates(serverUpdates);
        saveProjectUpdatesToLocalStorage(id, serverUpdates);
      } catch (err) {
        console.error('Error fetching updates:', err);
        // If server fails but we have local data, keep using it
        if (localUpdates.length === 0) {
          console.error('No offline updates available');
        }
      }
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!updateForm.title.trim()) {
      setError('Update title is required');
      return;
    }

    try {
      setLoading(true);
      const updateData = {
        ...updateForm,
        tags: updateForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      if (isOffline) {
        // Offline mode - add to localStorage
        const newUpdate = {
          _id: `temp_update_${Date.now()}`,
          ...updateData,
          createdAt: new Date().toISOString(),
          updatedBy: { name: 'You' }, // Placeholder for current user
          _pendingSync: true,
          _isTemporary: true
        };
        
        const currentUpdates = getProjectUpdatesFromLocalStorage(id);
        const updatedUpdates = [newUpdate, ...currentUpdates];
        setUpdates(updatedUpdates);
        saveProjectUpdatesToLocalStorage(id, updatedUpdates);
        
        // Update project's update count in localStorage
        const localProjects = getProjectsFromLocalStorage();
        const updatedProjects = localProjects.map(p => 
          p._id === id ? { ...p, updates: updatedUpdates } : p
        );
        saveProjectsToLocalStorage(updatedProjects);
        
        setError('Update saved offline. Will sync when online.');
      } else {
        // Online mode - send to server
        const response = await API.post(`/projects/${id}/updates`, updateData);
        
        // Update local storage with server response
        const currentUpdates = getProjectUpdatesFromLocalStorage(id);
        const updatedUpdates = [response.data.update, ...currentUpdates];
        setUpdates(updatedUpdates);
        saveProjectUpdatesToLocalStorage(id, updatedUpdates);
        
        setError('');
        fetchProject(); // Refresh project to get updated count
      }
      
      // Reset form
      setUpdateForm({
        type: 'general',
        title: '',
        description: '',
        priority: 'medium',
        tags: ''
      });
      
      setShowUpdateForm(false);
    } catch (err) {
      if (!isOffline) {
        setError(err.response?.data?.message || 'Failed to add update');
        console.error('Error adding update:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateForm(prev => ({ ...prev, [name]: value }));
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

  const getUpdateTypeIcon = (type) => {
    const icons = {
      status: '📊',
      milestone: '🏁',
      note: '📝',
      member_added: '👥',
      member_removed: '👤',
      file_upload: '📎',
      task_completed: '✅',
      general: '💭'
    };
    return icons[type] || '💭';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  useEffect(() => {
    fetchProject();
    fetchUpdates();
  }, [id, isOffline]);

  // Initial load from localStorage
  useEffect(() => {
    const localProjects = getProjectsFromLocalStorage();
    const localProject = localProjects.find(p => p._id === id);
    if (localProject) {
      setProject(localProject);
    }

    const localUpdates = getProjectUpdatesFromLocalStorage(id);
    if (localUpdates.length > 0) {
      setUpdates(localUpdates);
    }
  }, [id]);

  if (loading && !project) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4">Loading project...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-600 text-lg">Project not found</div>
        <button 
          onClick={() => navigate('/projects')}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <button
              onClick={() => navigate('/projects')}
              className="text-blue-600 hover:text-blue-800 mb-2"
            >
              ← Back to Projects
            </button>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
              {isOffline && (
                <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                  Offline
                </span>
              )}
              {project._pendingSync && (
                <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                  Pending sync
                </span>
              )}
            </div>
            <p className="text-gray-600 mt-2">{project.description}</p>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <div className="flex space-x-2">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(project.status)}`}>
                {project.status?.replace('_', ' ').toUpperCase()}
              </span>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(project.priority)}`}>
                {project.priority?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Progress</div>
            <div className="text-2xl font-bold text-blue-600">{project.progress || 0}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${project.progress || 0}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Total Updates</div>
            <div className="text-2xl font-bold text-green-600">{project.updates?.length || 0}</div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Team Members</div>
            <div className="text-2xl font-bold text-purple-600">{project.members?.length || 0}</div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Created</div>
            <div className="text-sm font-medium text-gray-800">
              {new Date(project.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Project Dates */}
        {(project.startDate || project.deadline) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {project.startDate && (
              <div>
                <span className="text-sm text-gray-600">Start Date: </span>
                <span className="font-medium">{new Date(project.startDate).toLocaleDateString()}</span>
              </div>
            )}
            {project.deadline && (
              <div>
                <span className="text-sm text-gray-600">Deadline: </span>
                <span className="font-medium">{new Date(project.deadline).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        )}

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag, index) => (
              <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Updates Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Project Updates</h2>
          <button
            onClick={() => setShowUpdateForm(!showUpdateForm)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-200"
          >
            {showUpdateForm ? 'Cancel' : 'Add Update'}
          </button>
        </div>

        {/* Add Update Form */}
        {showUpdateForm && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold mb-4">Add New Update</h3>
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Update Type
                  </label>
                  <select
                    name="type"
                    value={updateForm.type}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="general">General</option>
                    <option value="status">Status Update</option>
                    <option value="milestone">Milestone</option>
                    <option value="note">Note</option>
                    <option value="task_completed">Task Completed</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={updateForm.priority}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Update Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={updateForm.title}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter update title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={updateForm.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter update description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={updateForm.tags}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., bug-fix, feature, documentation"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowUpdateForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition duration-200"
                >
                  {loading ? 'Adding...' : 'Add Update'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Updates Timeline */}
        <div className="space-y-4">
          {updates.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500">No updates yet</div>
              <p className="text-gray-400 mt-1">Add your first project update!</p>
            </div>
          ) : (
            updates.map((update, index) => (
              <div key={update._id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{getUpdateTypeIcon(update.type)}</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900">{update.title}</h4>
                        {update._pendingSync && (
                          <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                            Pending sync
                          </span>
                        )}
                        {update._isTemporary && (
                          <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                            Offline
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(update.priority)}`}>
                          {update.priority?.toUpperCase()}
                        </span>
                        <span className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-full">
                          {update.type.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    {update.description && (
                      <p className="text-gray-600 mb-3">{update.description}</p>
                    )}
                    
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <div>
                        By {update.updatedBy?.name || 'Unknown'} • {formatDate(update.createdAt)}
                      </div>
                      {update.tags && update.tags.length > 0 && (
                        <div className="flex space-x-1">
                          {update.tags.map((tag, tagIndex) => (
                            <span key={tagIndex} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
