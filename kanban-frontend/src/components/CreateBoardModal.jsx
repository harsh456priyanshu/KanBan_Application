import { useState } from 'react';
import { toast } from 'react-toastify';
import API from '../services/api';

const CreateBoardModal = ({ onClose, onCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Board title is required');
      return;
    }
    
    try {
      console.log('Creating board with data:', {
        name: title,
        description: description || `Board created: ${title}`,
        type: 'kanban'
      });
      
      const res = await API.post('/board', { 
        name: title, 
        description: description || `Board created: ${title}`,
        type: 'kanban'
      });
      
      console.log('Board creation response:', res.data);
      toast.success('Board created successfully!');
      onCreated(res.data);
      onClose();
    } catch (err) {
      console.error('Board creation error:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      const errorMessage = err.response?.data?.message || 'Board creation failed';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/10 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Create New Board</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="w-full p-2 border mb-4 rounded"
            placeholder="Board Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            className="w-full p-2 border mb-4 rounded"
            placeholder="Board Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBoardModal;
