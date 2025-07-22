import { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  X, 
  Paperclip, 
  Download, 
  Trash2, 
  FileText, 
  Image, 
  File,
  Upload,
  Calendar,
  User,
  Tag
} from 'lucide-react';
import API from '../services/api';

const CardDetailModal = ({ card, isOpen, onClose, onCardUpdate, boardId }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: card?.title || '',
    description: card?.description || ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen || !card) return null;

  // Helper function to format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Helper function to get file icon
  const getFileIcon = (mimetype) => {
    if (mimetype.startsWith('image/')) return <Image size={20} className="text-blue-500" />;
    if (mimetype === 'application/pdf') return <FileText size={20} className="text-red-500" />;
    if (mimetype.includes('document') || mimetype.includes('word')) return <FileText size={20} className="text-blue-600" />;
    if (mimetype.includes('sheet') || mimetype.includes('excel')) return <FileText size={20} className="text-green-600" />;
    return <File size={20} className="text-gray-500" />;
  };

  // Handle card update
  const handleUpdate = async () => {
    try {
      const response = await API.put(`/cards/${card._id}`, editData);
      onCardUpdate(response.data);
      setIsEditing(false);
      toast.success('Card updated successfully!');
    } catch (error) {
      console.error('Error updating card:', error);
      toast.error('Failed to update card');
    }
  };

  // Handle file upload
  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await API.post(`/cards/${card._id}/attachment`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        // Update the card with new attachment
        onCardUpdate(response.data.card);
      }
      toast.success('File(s) uploaded successfully!');
      // Close modal and refresh board
      setTimeout(() => {
        onClose(); // Close the modal
        if (boardId) {
          navigate(`/board/${boardId}`, { replace: true });
          window.location.reload(); // Refresh to update data
        } else {
          window.location.reload(); // Fallback refresh
        }
      }, 1500); // Delay to show the success message
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(error.response?.data?.message || 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle file delete
  const handleDeleteAttachment = async (attachmentId) => {
    try {
      const response = await API.delete(`/cards/${card._id}/attachment/${attachmentId}`);
      onCardUpdate(response.data.card);
      toast.success('Attachment deleted successfully!');
      // Close modal and refresh board
      setTimeout(() => {
        onClose(); // Close the modal
        if (boardId) {
          navigate(`/board/${boardId}`, { replace: true });
          window.location.reload(); // Refresh to update data
        } else {
          window.location.reload(); // Fallback refresh
        }
      }, 1500); // Delay to show the success message
    } catch (error) {
      console.error('Error deleting attachment:', error);
      toast.error('Failed to delete attachment');
    }
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/10 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                className="text-2xl font-bold text-gray-900 w-full border-none outline-none bg-gray-50 px-2 py-1 rounded"
                placeholder="Card title"
              />
            ) : (
              <h2 className="text-2xl font-bold text-gray-900">{card.title}</h2>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            {isEditing ? (
              <textarea
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add a description..."
              />
            ) : (
              <p className="text-gray-700 whitespace-pre-wrap">
                {card.description || 'No description provided.'}
              </p>
            )}
          </div>

          {/* Card Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {card.priority && (
              <div className="flex items-center space-x-2">
                <Tag size={16} className="text-gray-400" />
                <span className="text-sm text-gray-600">Priority:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  card.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                  card.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                  card.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {card.priority}
                </span>
              </div>
            )}
            {card.dueDate && (
              <div className="flex items-center space-x-2">
                <Calendar size={16} className="text-gray-400" />
                <span className="text-sm text-gray-600">Due:</span>
                <span className="text-sm font-medium">
                  {new Date(card.dueDate).toLocaleDateString()}
                </span>
              </div>
            )}
            {card.assignedTo && (
              <div className="flex items-center space-x-2">
                <User size={16} className="text-gray-400" />
                <span className="text-sm text-gray-600">Assigned to:</span>
                <span className="text-sm font-medium">{card.assignedTo.name}</span>
              </div>
            )}
          </div>

          {/* Attachments Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Paperclip size={20} className="mr-2" />
                Attachments ({card.attachments?.length || 0})
              </h3>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Upload size={16} />
                <span>{isUploading ? 'Uploading...' : 'Add File'}</span>
              </button>
            </div>

            {/* File Upload Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragOver 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <Upload size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600">
                Drag & drop files here, or{' '}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  browse
                </button>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Max 10MB per file. Images, documents, and archives supported.
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={(e) => handleFileUpload(Array.from(e.target.files))}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
            />

            {/* Attachments List */}
            {card.attachments && card.attachments.length > 0 && (
              <div className="mt-4 space-y-2">
                {card.attachments.map((attachment) => (
                  <div
                    key={attachment._id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      {getFileIcon(attachment.mimetype)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {attachment.originalName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(attachment.size)} • {' '}
                          {new Date(attachment.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <a
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download size={16} />
                      </a>
                      <button
                        onClick={() => handleDeleteAttachment(attachment._id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditData({ title: card.title, description: card.description });
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Card
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardDetailModal;
