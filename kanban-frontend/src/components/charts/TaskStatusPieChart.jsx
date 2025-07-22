import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import API from '../../services/api';

const COLORS = ['#FF8042', '#00C49F', '#0088FE', '#FFBB28', '#8884D8'];

const TaskStatusPieChart = ({ boardId, dateRange }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTaskStatusData();
  }, [boardId, dateRange]);

  const fetchTaskStatusData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch from API first, fallback to localStorage data
      let response;
      try {
        const params = new URLSearchParams();
        if (boardId) params.append('boardId', boardId);
        if (dateRange?.startDate) params.append('startDate', dateRange.startDate);
        if (dateRange?.endDate) params.append('endDate', dateRange.endDate);
        
        response = await API.get(`/reports/task-status?${params}`);
        setData(response.data);
      } catch (apiError) {
        console.warn('API not available, using local data:', apiError.message);
        // Fallback to localStorage data (for TodoBoard)
        const todoData = localStorage.getItem('todoData');
        if (todoData) {
          const tasks = JSON.parse(todoData);
          const statusData = Object.entries(tasks).map(([status, items]) => ({
            name: status,
            value: items.length
          }));
          setData(statusData.filter(item => item.value > 0));
        } else {
          // Default mock data if no local data available
          setData([
            { name: 'Task Assigned', value: 4 },
            { name: 'In Progress', value: 2 },
            { name: 'Pending', value: 3 },
            { name: 'Completed', value: 5 }
          ]);
        }
      }
    } catch (error) {
      console.error('Error fetching task status data:', error);
      setError('Failed to load task status data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-80 bg-white p-4 rounded shadow flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-80 bg-white p-4 rounded shadow flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="w-full h-80 bg-white p-4 rounded shadow">
      <h3 className="text-lg font-semibold mb-4 text-center">Task Status Distribution</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            dataKey="value"
            label={({ name, value }) => `${name}: ${value}`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [value, 'Tasks']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TaskStatusPieChart;
