import { useState } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  MoreHorizontal, 
  Edit2, 
  Trash, 
  Copy, 
  Archive, 
  Plus, 
  Users, 
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../services/api';

const ListComponent = ({ 
  list, 
  cards, 
  onCardAdd, 
  onCardEdit, 
  onCardDelete, 
  onListUpdate, 
  onListDelete 
}) => {
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(list.title);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEditSave = async () => {
    if (!editTitle.trim()) {
      toast.error('List title cannot be empty');
      return;
    }

    setLoading(true);
    try {
      await API.put(`/lists/${list._id}`, { title: editTitle });
      onListUpdate(list._id, { title: editTitle });
      setIsEditing(false);
      toast.success('List updated successfully');
    } catch (error) {
      console.error('Error updating list:', error);
      toast.error('Failed to update list');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyList = async () => {
    setLoading(true);
    try {
      // Create a copy of the list
      const response = await API.post(`/board/${list.board}/lists`, {
        title: `${list.title} (Copy)`,
        description: list.description,
        color: list.color
      });

      const newList = response.data;

      // Copy all cards from original list
      for (const card of cards) {
        try {
          await API.post(`/cards/list/${newList._id}`, {
            title: card.title,
            description: card.description,
            dueDate: card.dueDate,
            priority: card.priority
          });
        } catch (error) {
          console.error('Error copying card:', error);
        }
      }

      toast.success('List copied successfully');
      window.location.reload(); // Refresh to show new list
    } catch (error) {
      console.error('Error copying list:', error);
      toast.error('Failed to copy list');
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveList = async () => {
    if (!window.confirm('Are you sure you want to archive this list?')) return;

    setLoading(true);
    try {
      await API.put(`/lists/${list._id}`, { isActive: false });
      onListUpdate(list._id, { isActive: false });
      toast.success('List archived successfully');
    } catch (error) {
      console.error('Error archiving list:', error);
      toast.error('Failed to archive list');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteList = async () => {
    if (!window.confirm('Are you sure you want to delete this list? This action cannot be undone.')) return;

    setLoading(true);
    try {
      await API.delete(`/lists/${list._id}`);
      onListDelete(list._id);
      toast.success('List deleted successfully');
    } catch (error) {
      console.error('Error deleting list:', error);
      toast.error('Failed to delete list');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCard = async (e) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;

    try {
      await onCardAdd(list._id, newCardTitle);
      setNewCardTitle('');
    } catch (error) {
      console.error('Error adding card:', error);
    }
  };

  const actionItems = [
    {
      icon: Edit2,
      label: 'Edit List',
      onClick: () => {
        setIsEditing(true);
        setShowActions(false);
      }
    },
    {
      icon: Copy,
      label: 'Copy List',
      onClick: handleCopyList
    },
    {
      icon: Archive,
      label: 'Archive List',
      onClick: handleArchiveList
    },
    {
      icon: Trash,
      label: 'Delete List',
      onClick: handleDeleteList,
      className: 'text-red-600 hover:bg-red-50'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border flex-shrink-0 w-80">
      {/* List Header */}
      <div 
        className="h-2 rounded-t-lg"
        style={{ backgroundColor: list.color || '#3B82F6' }}
      />
      
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex-1 mr-3">
            {isEditing ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleEditSave();
                    }
                    if (e.key === 'Escape') {
                      setIsEditing(false);
                      setEditTitle(list.title);
                    }
                  }}
                  autoFocus
                />
                <button
                  onClick={handleEditSave}
                  disabled={loading}
                  className="px-2 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditTitle(list.title);
                  }}
                  className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{list.title}</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {cards.length} {cards.length === 1 ? 'card' : 'cards'}
                  </span>
                  <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    {isCollapsed ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreHorizontal size={16} />
            </button>
            
            {showActions && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                {actionItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      onClick={item.onClick}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2 ${
                        item.className || 'text-gray-700'
                      }`}
                    >
                      <Icon size={16} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        
        {list.description && (
          <p className="text-sm text-gray-600 mt-2">{list.description}</p>
        )}
      </div>

      {/* Cards Section */}
      {!isCollapsed && (
        <>
          <Droppable droppableId={list._id}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`p-4 space-y-3 min-h-[200px] transition-colors ${
                  snapshot.isDraggingOver ? 'bg-blue-50' : ''
                }`}
              >
                {cards.map((card, index) => (
                  <Draggable
                    key={card._id}
                    draggableId={card._id}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-all cursor-pointer ${
                          snapshot.isDragging ? 'rotate-2 shadow-lg' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-1">
                              {card.title}
                            </h4>
                            {card.description && (
                              <p className="text-sm text-gray-600 mb-2">
                                {card.description}
                              </p>
                            )}
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              {card.dueDate && (
                                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                  Due: {new Date(card.dueDate).toLocaleDateString()}
                                </span>
                              )}
                              {card.priority && (
                                <span className={`px-2 py-1 rounded ${
                                  card.priority === 'high' ? 'bg-red-100 text-red-800' :
                                  card.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {card.priority}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-1 ml-2">
                            <button
                              onClick={() => onCardEdit(card)}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => onCardDelete(card._id)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <Trash size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {/* Add Card Form */}
          <div className="p-4 border-t">
            <form onSubmit={handleAddCard} className="flex space-x-2">
              <input
                type="text"
                placeholder="Add a card..."
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={!newCardTitle.trim()}
                className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Plus size={14} />
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default ListComponent;
