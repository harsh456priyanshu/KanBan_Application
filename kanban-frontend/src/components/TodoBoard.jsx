// Updated TodoBoard.jsx with @hello-pangea/dnd, persistent state, and improved drag-and-drop

import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { v4 as uuidv4 } from 'uuid';

const statuses = ['Task Assigned', 'In Progress', 'Pending', 'Completed'];

const getInitialData = () => {
  try {
    const stored = localStorage.getItem('todoData');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Ensure all status columns exist
      const data = {};
      statuses.forEach(status => {
        data[status] = parsed[status] || [];
      });
      return data;
    }
  } catch (error) {
    console.error('Error loading data from localStorage:', error);
  }
  
  // Return default empty structure
  const data = {};
  statuses.forEach(status => {
    data[status] = [];
  });
  return data;
};

const TodoBoard = () => {
  const [tasks, setTasks] = useState(getInitialData());
  const [input, setInput] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('Medium');

  const [editTaskId, setEditTaskId] = useState(null);
  const [editValues, setEditValues] = useState({ title: '', description: '', dueDate: '', priority: 'Medium' });

  useEffect(() => {
    localStorage.setItem('todoData', JSON.stringify(tasks));
  }, [tasks]);

  const handleAdd = () => {
    if (!input.trim()) return;
    const newTask = {
      id: uuidv4(),
      title: input,
      description,
      dueDate,
      priority,
    };
    setTasks(prev => ({
      ...prev,
      [statuses[0]]: [...(prev[statuses[0]] || []), newTask],
    }));
    setInput('');
    setDescription('');
    setDueDate('');
    setPriority('Medium');
  };

  const handleDelete = (status, id) => {
    setTasks(prev => ({
      ...prev,
      [status]: prev[status].filter(task => task.id !== id),
    }));
  };

  const handleEdit = (task) => {
    setEditTaskId(task.id);
    setEditValues({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      priority: task.priority,
    });
  };

  const handleSave = (status, id) => {
    setTasks(prev => ({
      ...prev,
      [status]: prev[status].map(task =>
        task.id === id ? { ...task, ...editValues } : task
      ),
    }));
    setEditTaskId(null);
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;
    
    // If no destination or dropped in same position, do nothing
    if (!destination || (
      destination.droppableId === source.droppableId && 
      destination.index === source.index
    )) {
      return;
    }

    setTasks(prev => {
      // Create deep copies to avoid mutations
      const newTasks = { ...prev };
      const sourceList = [...(newTasks[source.droppableId] || [])];
      const destList = source.droppableId === destination.droppableId 
        ? sourceList 
        : [...(newTasks[destination.droppableId] || [])];

      // Remove the task from source
      const [movedTask] = sourceList.splice(source.index, 1);
      
      // Add the task to destination
      destList.splice(destination.index, 0, movedTask);

      // Update the tasks object
      newTasks[source.droppableId] = sourceList;
      if (source.droppableId !== destination.droppableId) {
        newTasks[destination.droppableId] = destList;
      }

      return newTasks;
    });
  };

  return (
    <div className="p-2 sm:p-4 lg:p-6">
      {/* Mobile-friendly form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Add New Task</h3>
        <div className="space-y-3 sm:space-y-4">
          {/* Title and Description - Full width on mobile */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Task Title"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Description"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Date, Priority, and Add Button */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <select
              value={priority}
              onChange={e => setPriority(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
            </select>
            <button 
              onClick={handleAdd} 
              className="w-full sm:col-span-1 lg:col-span-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors touch-manipulation"
            >
              Add Task
            </button>
          </div>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        {/* Responsive grid layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {statuses.map(status => (
            <Droppable droppableId={status} key={status}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`
                    bg-gray-50 rounded-lg p-3 sm:p-4 min-h-[200px] sm:min-h-[300px] border-2 transition-colors
                    ${snapshot.isDraggingOver ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}
                  `}
                >
                  <h2 className="font-bold text-sm sm:text-lg text-gray-800 mb-3 pb-2 border-b border-gray-200">
                    {status}
                    <span className="ml-2 text-xs font-normal text-gray-500">
                      ({(tasks[status] || []).length})
                    </span>
                  </h2>
                  {(tasks[status] || []).map((task, index) => (
                    <Draggable draggableId={task.id} index={index} key={task.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`
                            mb-2 sm:mb-3 transition-transform duration-200 touch-manipulation
                            ${snapshot.isDragging ? 'rotate-2 scale-105 shadow-lg' : ''}
                          `}
                        >
                          <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
                            {editTaskId === task.id ? (
                              <div className="p-3 space-y-3">
                                <input
                                  value={editValues.title}
                                  onChange={e => setEditValues({ ...editValues, title: e.target.value })}
                                  placeholder="Task Title"
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <textarea
                                  value={editValues.description}
                                  onChange={e => setEditValues({ ...editValues, description: e.target.value })}
                                  placeholder="Description"
                                  rows={2}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  <input
                                    type="date"
                                    value={editValues.dueDate}
                                    onChange={e => setEditValues({ ...editValues, dueDate: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                  <select
                                    value={editValues.priority}
                                    onChange={e => setEditValues({ ...editValues, priority: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  >
                                    <option value="Low">Low Priority</option>
                                    <option value="Medium">Medium Priority</option>
                                    <option value="High">High Priority</option>
                                  </select>
                                </div>
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => handleSave(status, task.id)} 
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors touch-manipulation"
                                  >
                                    Save
                                  </button>
                                  <button 
                                    onClick={() => setEditTaskId(null)} 
                                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors touch-manipulation"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="p-3">
                                <div className="mb-2">
                                  <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1">{task.title}</h3>
                                  {task.description && (
                                    <p className="text-gray-600 text-xs leading-relaxed">{task.description}</p>
                                  )}
                                </div>
                                <div className="space-y-1 mb-3">
                                  {task.dueDate && (
                                    <p className="text-xs text-gray-500">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                                  )}
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    task.priority === 'High' ? 'text-red-600 bg-red-100' :
                                    task.priority === 'Medium' ? 'text-yellow-600 bg-yellow-100' :
                                    'text-green-600 bg-green-100'
                                  }`}>
                                    {task.priority} Priority
                                  </span>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleEdit(task)}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs font-medium transition-colors touch-manipulation"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDelete(status, task.id)}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs font-medium transition-colors touch-manipulation"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
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

export default TodoBoard;
