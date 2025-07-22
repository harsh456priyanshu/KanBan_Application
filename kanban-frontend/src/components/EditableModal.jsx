import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';

const EditableModal = ({ isOpen, setIsOpen, onSubmit, initialData }) => {
  const [boardName, setBoardName] = useState('');

  useEffect(() => {
    if (initialData) {
      setBoardName(initialData.name);
    } else {
      setBoardName('');
    }
  }, [initialData]);

  const handleSubmit = () => {
    if (boardName.trim()) {
      onSubmit({ name: boardName });
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
      <div className="fixed inset-0 backdrop-blur-sm bg-white/10" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center">
        <Dialog.Panel className="bg-white p-6 rounded-xl max-w-sm w-full shadow-lg">
          <Dialog.Title className="text-lg font-semibold mb-2">
            {initialData ? 'Edit Board' : 'Create Board'}
          </Dialog.Title>
          <input
            className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4"
            value={boardName}
            onChange={(e) => setBoardName(e.target.value)}
            placeholder="Enter board name"
          />
          <button
            onClick={handleSubmit}
            className="bg-green-600 text-white px-4 py-2 rounded w-full"
          >
            {initialData ? 'Update' : 'Create'}
          </button>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default EditableModal;
