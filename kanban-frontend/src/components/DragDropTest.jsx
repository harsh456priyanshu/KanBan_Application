import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const DragDropTest = () => {
  const [items, setItems] = useState({
    'column-1': [
      { id: '1', content: 'First item' },
      { id: '2', content: 'Second item' },
    ],
    'column-2': [
      { id: '3', content: 'Third item' },
      { id: '4', content: 'Fourth item' },
    ],
  });

  const onDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceItems = Array.from(items[source.droppableId]);
    const destItems = source.droppableId === destination.droppableId 
      ? sourceItems 
      : Array.from(items[destination.droppableId]);

    const [removed] = sourceItems.splice(source.index, 1);
    destItems.splice(destination.index, 0, removed);

    setItems({
      ...items,
      [source.droppableId]: sourceItems,
      [destination.droppableId]: destItems,
    });
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Drag & Drop Test</h2>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4">
          {Object.keys(items).map((columnId) => (
            <Droppable droppableId={columnId} key={columnId}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`bg-gray-100 p-4 rounded min-h-[200px] w-64 ${
                    snapshot.isDraggingOver ? 'bg-blue-100' : ''
                  }`}
                >
                  <h3 className="font-semibold mb-2">{columnId}</h3>
                  {items[columnId].map((item, index) => (
                    <Draggable
                      draggableId={item.id}
                      index={index}
                      key={item.id}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`bg-white p-2 mb-2 rounded shadow ${
                            snapshot.isDragging ? 'shadow-lg rotate-2' : ''
                          }`}
                        >
                          {item.content}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default DragDropTest;
