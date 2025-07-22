import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Edit2, Trash, Plus, ArrowLeft, Settings, Paperclip } from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../services/api';
import CreateListModal from '../components/CreateListModal';
import ListComponent from '../components/ListComponent';
import CardDetailModal from '../components/CardDetailModal';

const BoardView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState(null);
  const [lists, setLists] = useState([]);
  const [cards, setCards] = useState({});
  const [newListTitle, setNewListTitle] = useState('');
  const [newCardTitles, setNewCardTitles] = useState({});
const [selectedCard, setSelectedCard] = useState(null);
  const [isCardDetailModalOpen, setIsCardDetailModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCreateListModal, setShowCreateListModal] = useState(false);
 

  useEffect(() => {
    if (id) {
      loadBoard();
    }
  }, [id]);

  const loadBoard = async () => {
    try {
      setLoading(true);
      console.log('Loading board with ID:', id);
      
      // Get board details
      const boardRes = await API.get(`/board/${id}`);
      console.log('Board data:', boardRes.data);
      setBoard(boardRes.data);

      // Get lists for the board
      console.log('Fetching lists for board:', id);
      const listsRes = await API.get(`/board/${id}/lists`);
      console.log('Lists response:', listsRes.data);
      setLists(listsRes.data);

      // Get cards for each list
      const cardsData = {};
      for (const list of listsRes.data) {
        try {
          const cardsRes = await API.get(`/cards/list/${list._id}`);
          cardsData[list._id] = cardsRes.data;
        } catch (error) {
          console.error(`Error loading cards for list ${list._id}:`, error);
          cardsData[list._id] = [];
        }
      }
      setCards(cardsData);
    } catch (error) {
      console.error('Error loading board:', error);
      toast.error('Failed to load board');
    } finally {
      setLoading(false);
    }
  };

  const handleAddList = async () => {
    if (!newListTitle.trim()) {
      toast.error('Please enter a list title');
      return;
    }

    try {
      await API.post(`/board/${id}/lists`, { title: newListTitle });
      setNewListTitle('');
      toast.success('List created successfully');
      loadBoard();
    } catch (error) {
      console.error('Error creating list:', error);
      toast.error('Failed to create list');
    }
  };

  const handleAddCard = async (listId) => {
    const title = newCardTitles[listId];
    if (!title?.trim()) {
      toast.error('Please enter a card title');
      return;
    }

    try {
      await API.post(`/cards/list/${listId}`, { title });
      setNewCardTitles((prev) => ({ ...prev, [listId]: '' }));
      toast.success('Card created successfully');
      loadBoard();
    } catch (error) {
      console.error('Error creating card:', error);
      toast.error('Failed to create card');
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (!window.confirm('Are you sure you want to delete this card?')) return;

    try {
      await API.delete(`/cards/${cardId}`);
      toast.success('Card deleted successfully');
      loadBoard();
    } catch (error) {
      console.error('Error deleting card:', error);
      toast.error('Failed to delete card');
    }
  };

const openCardDetailModal = (card) => {
    setSelectedCard(card);
    setIsCardDetailModalOpen(true);
  };


  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    // If no destination or dropped in same position, do nothing
    if (!destination || (
      destination.droppableId === source.droppableId && 
      destination.index === source.index
    )) {
      return;
    }

    const sourceListId = source.droppableId;
    const destListId = destination.droppableId;

    // Optimistically update UI first
    const sourceCards = Array.from(cards[sourceListId] || []);
    const destCards = sourceListId === destListId 
      ? sourceCards 
      : Array.from(cards[destListId] || []);
    
    const [movedCard] = sourceCards.splice(source.index, 1);
    destCards.splice(destination.index, 0, movedCard);

    const newCardsState = {
      ...cards,
      [sourceListId]: sourceCards,
      [destListId]: destCards,
    };

    setCards(newCardsState);

    try {
      if (sourceListId !== destListId) {
        // Move card to different list
        await API.put(`/cards/${draggableId}/move`, {
          newListId: destListId,
        });
      }
      // Note: For same-list reordering, we might want to call an API endpoint
      // to persist the new order if your backend supports it
    } catch (error) {
      console.error('Error moving card:', error);
      toast.error('Failed to move card');
      // Revert the optimistic update by reloading
      loadBoard();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                {board?.name || 'Board'}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="New list title"
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddList();
                  }
                }}
              />
              <button
                onClick={handleAddList}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} className="mr-1" />
                Add List
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Board Content */}
      <div className="p-6">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-6 overflow-x-auto pb-4">
            {lists.map((list) => (
              <div
                key={list._id}
                className="bg-white rounded-lg shadow-sm border w-80 flex-shrink-0"
              >
                {/* List Header */}
                <div className="p-4 border-b">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {list.title}
                  </h2>
                </div>

                {/* Cards */}
                <Droppable droppableId={list._id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`p-4 space-y-3 min-h-[200px] ${
                        snapshot.isDraggingOver ? 'bg-blue-50' : ''
                      }`}
                    >
                      {(cards[list._id] || []).map((card, index) => (
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
                              onClick={() => openCardDetailModal(card)}
                              className={`bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                                snapshot.isDragging ? 'rotate-2 shadow-lg' : ''
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h3 className="font-medium text-gray-900 mb-1">
                                    {card.title}
                                  </h3>
                                  {card.description && (
                                    <p className="text-sm text-gray-600 mb-2">
                                      {card.description}
                                    </p>
                                  )}
{card.dueDate && (
                                    <div className="text-xs text-gray-500">
                                      Due: {new Date(card.dueDate).toLocaleDateString()}
                                    </div>
                                  )}
                                  {card.attachments && card.attachments.length > 0 && (
                                    <div className="flex items-center mt-2">
                                      <Paperclip size={12} className="text-gray-400 mr-1" />
                                      <span className="text-xs text-gray-500">
                                        {card.attachments.length} attachment{card.attachments.length > 1 ? 's' : ''}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex space-x-1 ml-2">
<button
                                    onClick={() => openCardDetailModal(card)}
                                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                  >
                                    <Edit2 size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCard(card._id)}
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

                {/* Add Card */}
                <div className="p-4 border-t">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="New card title"
                      value={newCardTitles[list._id] || ''}
                      onChange={(e) =>
                        setNewCardTitles((prev) => ({
                          ...prev,
                          [list._id]: e.target.value,
                        }))
                      }
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddCard(list._id);
                        }
                      }}
                    />
                    <button
                      onClick={() => handleAddCard(list._id)}
                      className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>

{isCardDetailModalOpen && selectedCard && (
        <CardDetailModal
          card={selectedCard}
          isOpen={isCardDetailModalOpen}
          onClose={() => setIsCardDetailModalOpen(false)}
          boardId={id}
          onCardUpdate={(updatedCard) => {
            setCards((prevCards) => ({
              ...prevCards,
              [updatedCard.listId]: prevCards[updatedCard.listId].map((c) =>
                c._id === updatedCard._id ? updatedCard : c
              ),
            }));
            setSelectedCard(updatedCard);
          }}
        />
      )}
    </div>
  );
};

export default BoardView;
