import React, { useState, useEffect, useCallback } from 'react';
import TaskStatusPieChart from '../components/charts/TaskStatusPieChart';
import TaskPerUserBarChart from '../components/charts/TaskPerUserBarChart';
import { fetchBoards } from '../services/api';
import { RefreshCw, TrendingUp, Clock, CheckCircle, AlertCircle, Users, Download, Filter } from 'lucide-react';

const Reports = () => {
  const [filters, setFilters] = useState({
    boardId: '',
    startDate: '',
    endDate: ''
  });
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    averageCompletionTime: 0,
    productivityScore: 0,
    trendsData: []
  });
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadBoards();
    loadReportData();
  }, []);

  useEffect(() => {
    loadReportData();
  }, [filters]);

  const loadBoards = async () => {
    try {
      setLoading(true);
      const response = await fetchBoards();
      setBoards(response.data || []);
    } catch (err) {
      console.error('Error loading boards:', err);
      setError('Failed to load boards. Using fallback data.');
      // Mock data fallback
      setBoards([
        { _id: '1', title: 'Project Alpha' },
        { _id: '2', title: 'Project Beta' },
        { _id: '3', title: 'Project Gamma' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadReportData = useCallback(async () => {
    try {
      setError(null);
      setIsRefreshing(true);
      
      // Simulate API delay for better UX feedback
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Enhanced mock data that changes based on filters and time
      const baseTotal = filters.boardId ? 25 : 150;
      const randomVariation = Math.floor(Math.random() * 10) - 5;
      const totalTasks = Math.max(1, baseTotal + randomVariation);
      const completedTasks = Math.floor(totalTasks * (0.6 + Math.random() * 0.3));
      const pendingTasks = Math.floor(totalTasks * 0.2);
      const inProgressTasks = totalTasks - completedTasks - pendingTasks;
      
      const mockData = {
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        averageCompletionTime: parseFloat((filters.boardId ? 3.2 : 4.8) + (Math.random() * 2 - 1)).toFixed(1),
        productivityScore: Math.floor((completedTasks / totalTasks) * 100),
        trendsData: generateTrendsData()
      };
      
      setReportData(mockData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error loading report data:', err);
      setError('Failed to load report data.');
    } finally {
      setIsRefreshing(false);
    }
  }, [filters]);

  const generateTrendsData = () => {
    const days = 7;
    const trends = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      trends.push({
        date: date.toLocaleDateString(),
        completed: Math.floor(Math.random() * 20) + 5,
        created: Math.floor(Math.random() * 15) + 3
      });
    }
    return trends;
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRefresh = useCallback(() => {
    // Trigger re-fetch of chart data and report data
    loadBoards();
    loadReportData();
  }, [loadReportData]);

  const toggleAutoRefresh = () => {
    if (autoRefresh) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    } else {
      const interval = setInterval(() => {
        loadReportData();
      }, 30000); // Refresh every 30 seconds
      setRefreshInterval(interval);
    }
    setAutoRefresh(!autoRefresh);
  };

  const exportData = () => {
    const dataToExport = {
      reportData,
      filters,
      generatedAt: new Date().toISOString()
    };
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kanban-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [refreshInterval]);

  const handleReset = () => {
    setFilters({
      boardId: '',
      startDate: '',
      endDate: ''
    });
    setError(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Reports & Analytics</h2>
      
      {/* Filter Controls */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-semibold mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Board
            </label>
            <select
              value={filters.boardId}
              onChange={(e) => handleFilterChange('boardId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Boards</option>
              {boards.map(board => (
                <option key={board._id} value={board._id}>
                  {board.title}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-end space-x-2">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Refresh
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">Total Tasks</h3>
          <p className="text-3xl font-bold text-blue-600">{reportData.totalTasks}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">Completed Tasks</h3>
          <p className="text-3xl font-bold text-green-600">{reportData.completedTasks}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">Avg. Completion Time</h3>
          <p className="text-3xl font-bold text-orange-600">{reportData.averageCompletionTime} days</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">To-do Status Distribution</h3>
          <TaskStatusPieChart filters={filters} />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Tasks Per User</h3>
          <TaskPerUserBarChart filters={filters} />
        </div>
      </div>
    </div>
  );
};

export default Reports;
