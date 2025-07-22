import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';

const ProjectBoardPage = () => {
  const { projectId } = useParams();
  const [boards, setBoards] = useState([]);
  const [title, setTitle] = useState('');
  const navigate = useNavigate();

  const fetchBoards = async () => {
    const res = await API.get(`/kanban/project/${projectId}`);
    setBoards(res.data);
  };

  const createBoard = async () => {
    if (!title.trim()) return;
    await API.post('/kanban', { title, projectId });
    setTitle('');
    fetchBoards();
  };

  useEffect(() => {
    fetchBoards();
  }, [projectId]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Boards in This Project</h1>

      <div className="mb-4 flex gap-2">
        <input
          className="border p-2 rounded w-full sm:w-1/2"
          placeholder="Board Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={createBoard}
        >
          Create Board
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {boards.map((board) => (
          <div
            key={board._id}
            className="p-4 bg-gray-100 rounded shadow hover:bg-blue-100 cursor-pointer"
            onClick={() => navigate(`/board/${board._id}`)}
          >
            {board.title}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectBoardPage;
