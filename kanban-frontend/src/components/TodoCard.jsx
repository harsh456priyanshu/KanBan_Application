import React, { useState } from 'react';
import { Edit2, Trash2, Save, X, Calendar, Flag } from 'lucide-react';

const TodoCard = ({ task, onDelete, onUpdate, stage }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...task });

  const handleSave = () => {
    onUpdate(formData);
    setIsEditing(false);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 touch-manipulation">
      {isEditing ? (
        <div className="p-3 sm:p-4 space-y-3">
          {/* Title Input */}
          <input
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            placeholder="Task Title"
          />
          
          {/* Description Textarea */}
          <textarea
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            placeholder="Description"
            rows={2}
          />
          
          {/* Date and Priority Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="date"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.dueDate}
              onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
            />
            <select
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.priority}
              onChange={e => setFormData({ ...formData, priority: e.target.value })}
            >
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
            </select>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button 
              onClick={handleSave} 
              className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors touch-manipulation"
            >
              <Save size={14} />
              <span className="hidden xs:inline">Save</span>
            </button>
            <button 
              onClick={() => setIsEditing(false)} 
              className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors touch-manipulation"
            >
              <X size={14} />
              <span className="hidden xs:inline">Cancel</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-3 sm:p-4">
          {/* Task Header */}
          <div className="mb-2">
            <h4 className="font-semibold text-gray-900 text-sm sm:text-base leading-tight mb-1">
              {task.title}
            </h4>
            {task.description && (
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
          
          {/* Task Meta Info */}
          <div className="space-y-1 mb-3">
            {task.dueDate && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar size={12} />
                <span>Due {formatDate(task.dueDate)}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Flag size={12} className={getPriorityColor(task.priority).split(' ')[0]} />
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <button 
              onClick={() => setIsEditing(true)} 
              className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors touch-manipulation"
            >
              <Edit2 size={12} />
              <span className="hidden xs:inline">Edit</span>
            </button>
            <button 
              onClick={onDelete} 
              className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors touch-manipulation"
            >
              <Trash2 size={12} />
              <span className="hidden xs:inline">Delete</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoCard;
