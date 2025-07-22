import { useState } from 'react';
import { toast } from 'react-toastify';
import { X, Plus, Copy, Layout, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import API from '../services/api';

const CreateListModal = ({ isOpen, onClose, boardId, onListCreated }) => {
  const [listData, setListData] = useState({
    title: '',
    description: '',
    color: '#3B82F6',
    template: 'blank'
  });
  const [loading, setLoading] = useState(false);

  const listTemplates = [
    {
      id: 'blank',
      name: 'Blank List',
      description: 'Start with an empty list',
      icon: Plus,
      color: '#6B7280'
    },
    {
      id: 'todo',
      name: 'To Do',
      description: 'Tasks that need to be done',
      icon: Clock,
      color: '#EF4444',
      cards: ['New Task', 'Review Requirements', 'Plan Implementation']
    },
    {
      id: 'inprogress',
      name: 'In Progress',
      description: 'Tasks currently being worked on',
      icon: AlertCircle,
      color: '#F59E0B',
      cards: ['Implementation', 'Testing', 'Code Review']
    },
    {
      id: 'done',
      name: 'Done',
      description: 'Completed tasks',
      icon: CheckCircle,
      color: '#10B981',
      cards: ['Completed Feature', 'Bug Fix', 'Documentation']
    },
    {
      id: 'backlog',
      name: 'Backlog',
      description: 'Future tasks and ideas',
      icon: Layout,
      color: '#8B5CF6',
      cards: ['Future Enhancement', 'New Feature Idea', 'Improvement']
    }
  ];

  const colors = [
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Green', value: '#10B981' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Yellow', value: '#F59E0B' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Indigo', value: '#6366F1' },
    { name: 'Gray', value: '#6B7280' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!listData.title.trim()) {
      toast.error('Please enter a list title');
      return;
    }

    setLoading(true);
    try {
      // Create the list
      const response = await API.post(`/board/${boardId}/lists`, {
        title: listData.title,
        description: listData.description,
        color: listData.color
      });

      const newList = response.data;

      // If template has cards, create them
      const selectedTemplate = listTemplates.find(t => t.id === listData.template);
      if (selectedTemplate && selectedTemplate.cards) {
        for (const cardTitle of selectedTemplate.cards) {
          try {
            await API.post(`/cards/list/${newList._id}`, {
              title: cardTitle,
              description: `Created from ${selectedTemplate.name} template`
            });
          } catch (error) {
            console.error('Error creating template card:', error);
          }
        }
      }

      toast.success('List created successfully!');
      onListCreated(newList);
      onClose();
      
      // Reset form
      setListData({
        title: '',
        description: '',
        color: '#3B82F6',
        template: 'blank'
      });
    } catch (error) {
      console.error('Error creating list:', error);
      toast.error('Failed to create list');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (template) => {
    setListData(prev => ({
      ...prev,
      template: template.id,
      title: template.name,
      color: template.color
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/10 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Create New List</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Choose Template
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {listTemplates.map((template) => {
                const Icon = template.icon;
                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => handleTemplateSelect(template)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      listData.template === template.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: template.color + '20' }}
                      >
                        <Icon size={20} style={{ color: template.color }} />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{template.name}</h3>
                        <p className="text-sm text-gray-600">{template.description}</p>
                        {template.cards && (
                          <p className="text-xs text-gray-500 mt-1">
                            Includes {template.cards.length} sample cards
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* List Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              List Title *
            </label>
            <input
              type="text"
              value={listData.title}
              onChange={(e) => setListData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter list title"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
            />
          </div>

          {/* List Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={listData.description}
              onChange={(e) => setListData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this list is for..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              List Color
            </label>
            <div className="flex flex-wrap gap-3">
              {colors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setListData(prev => ({ ...prev, color: color.value }))}
                  className={`w-10 h-10 rounded-full border-4 transition-all ${
                    listData.color === color.value
                      ? 'border-gray-400 scale-110'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Preview</h3>
            <div className="bg-white rounded-lg shadow-sm border">
              <div 
                className="h-2 rounded-t-lg"
                style={{ backgroundColor: listData.color }}
              />
              <div className="p-4">
                <h4 className="font-semibold text-gray-900">
                  {listData.title || 'List Title'}
                </h4>
                {listData.description && (
                  <p className="text-sm text-gray-600 mt-1">{listData.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Plus size={16} className="mr-2" />
                  Create List
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateListModal;
