import { FaEdit, FaTrash, FaUsers, FaClock } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { MoreHorizontal, Calendar, Activity } from 'lucide-react';
import { useState } from 'react';

const BoardCard = ({ board, onEdit, onDelete, viewMode = 'grid' }) => {
  const [showMenu, setShowMenu] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getBoardTypeColor = (type) => {
    switch (type) {
      case 'kanban': return 'bg-blue-100 text-blue-800';
      case 'scrum': return 'bg-green-100 text-green-800';
      case 'next_gen': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <Link 
                  to={`/board/${board._id}`}
                  className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                >
                  {board.name}
                </Link>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getBoardTypeColor(board.type)}`}>
                  {board.type}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{board.description}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar size={14} />
                  <span>Updated {formatDate(board.updatedAt)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Activity size={14} />
                  <span>{board.statistics?.totalIssues || 0} issues</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => onEdit && onEdit(board)}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <FaEdit size={16} />
            </button>
            <button 
              onClick={() => onDelete && onDelete(board._id)}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <FaTrash size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <Link 
                to={`/board/${board._id}`}
                className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-1"
              >
                {board.name}
              </Link>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getBoardTypeColor(board.type)}`}>
                {board.type}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{board.description}</p>
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreHorizontal size={16} />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <button 
                  onClick={() => {
                    onEdit && onEdit(board);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <FaEdit size={14} />
                  <span>Edit Board</span>
                </button>
                <button 
                  onClick={() => {
                    onDelete && onDelete(board._id);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <FaTrash size={14} />
                  <span>Delete Board</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2 text-gray-600">
            <Activity size={14} />
            <span>{board.statistics?.totalIssues || 0} issues</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <FaUsers size={14} />
            <span>{board.administrators?.length || 0} members</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Calendar size={14} />
            <span>{formatDate(board.updatedAt)}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <FaClock size={14} />
            <span>{board.isActive ? 'Active' : 'Inactive'}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {board.administrators?.slice(0, 3).map((adminId, index) => (
              <div 
                key={adminId} 
                className="h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white"
              >
                {index + 1}
              </div>
            ))}
            {board.administrators?.length > 3 && (
              <span className="text-xs text-gray-500">
                +{board.administrators.length - 3} more
              </span>
            )}
          </div>
          <Link 
            to={`/board/${board._id}`}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Open Board
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BoardCard;
