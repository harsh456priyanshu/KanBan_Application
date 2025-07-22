import { useEffect, useState } from 'react';
import API from '../services/api';
import { toast } from 'react-toastify';
import CreateBoardModal from '../components/CreateBoardModal';
import BoardCard from '../components/BoardCard';
import { Plus, Grid, List, Filter, Search } from 'lucide-react';

const Dashboard = () => {
  const [boards, setBoards] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const fetchBoards = async () => {
    try {
      setLoading(true);
      const res = await API.get('/board');
      setBoards(res.data);
    } catch (err) {
      console.error('Error fetching boards:', err);
      // Only show toast for non-authentication errors
      if (err.response?.status !== 401) {
        toast.error('Failed to fetch boards');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/board/${id}`);
      setBoards(boards.filter((b) => b._id !== id));
      toast.success('Board deleted successfully');
    } catch (err) {
      console.error('Error deleting board:', err);
      toast.error('Failed to delete board');
    }
  };

  const filteredBoards = boards.filter(board => {
    const matchesSearch = board.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         board.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || board.type === filterType;
    return matchesSearch && matchesFilter;
  });

  useEffect(() => {
    fetchBoards();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Your Boards
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your projects and collaborate with your team
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
        >
          <Plus size={20} className="mr-2" />
          Create Board
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Search */}
        <div className="flex-1 relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search boards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-gray-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Types</option>
            <option value="kanban">Kanban</option>
            <option value="scrum">Scrum</option>
            <option value="next_gen">Next Gen</option>
          </select>
        </div>

        {/* View Mode */}
        <div className="flex items-center border border-gray-300 rounded-lg">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-l-lg ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Grid size={20} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-r-lg ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <List size={20} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Boards</p>
              <p className="text-2xl font-bold text-gray-900">{boards.length}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Grid size={24} className="text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Projects</p>
              <p className="text-2xl font-bold text-gray-900">{boards.filter(b => b.isActive).length}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <List size={24} className="text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Kanban Boards</p>
              <p className="text-2xl font-bold text-gray-900">{boards.filter(b => b.type === 'kanban').length}</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Grid size={24} className="text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Recent Activity</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Filter size={24} className="text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Boards */}
      {filteredBoards.length === 0 ? (
        <div className="text-center py-12">
          <Grid size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {boards.length === 0 ? 'No boards yet' : 'No boards match your search'}
          </h3>
          <p className="text-gray-600 mb-4">
            {boards.length === 0 
              ? 'Get started by creating your first board' 
              : 'Try adjusting your search or filters'
            }
          </p>
          {boards.length === 0 && (
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <Plus size={20} className="mr-2" />
              Create Your First Board
            </button>
          )}
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6' 
            : 'space-y-4'
        }>
          {filteredBoards.map((board) => (
            <BoardCard 
              key={board._id} 
              board={board} 
              onDelete={handleDelete}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}

      {/* Create Board Modal */}
      {showModal && (
        <CreateBoardModal
          onClose={() => setShowModal(false)}
          onCreated={(newBoard) => {
            setBoards([...boards, newBoard]);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
