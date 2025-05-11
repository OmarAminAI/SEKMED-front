import React, { useEffect, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement,
  Title, Tooltip, Legend, PointElement
} from 'chart.js';
import { FaHeartbeat, FaFire, FaWalking } from 'react-icons/fa';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, Title, Tooltip, Legend, PointElement);

const VitalPage = ({ externalToken }) => {
  const [fitData, setFitData] = useState({
    heart_rate: [],
    step_count: [],
    calories: [],
  });

  // Period selection for each chart type
  const [periods, setPeriods] = useState({
    heart_rate: '7d',
    steps: '7d',
    calories: '7d',
  });

  // Loading states for each chart
  const [loading, setLoading] = useState({
    heart_rate: false,
    steps: false,
    calories: false,
  });

  // Current metrics for summary display
  const [summaries, setSummaries] = useState({
    current_heart_rate: '--',
    current_steps: '--',
    current_calories: '--',
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accessToken, setAccessToken] = useState('');

  useEffect(() => {
    if (externalToken) {
      setAccessToken(externalToken);
      setIsLoggedIn(true);
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const tokenFromURL = params.get('token');
    if (tokenFromURL) {
      setAccessToken(`Bearer ${tokenFromURL}`);
      setIsLoggedIn(true);
      window.history.replaceState({}, document.title, window.location.pathname);  
    } else {
      setIsLoggedIn(false);
    }
  }, [externalToken]);

  useEffect(() => {
    if (!accessToken) return;
    fetchAllData();
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) return;
    Object.entries(periods).forEach(([type, period]) => {
      fetchDataForType(type, period);
    });
  }, [periods, accessToken]);

  const fetchAllData = () => {
    Object.entries(periods).forEach(([type, period]) => {
      fetchDataForType(type, period);
    });
    fetchActivitySummary();
  };

  const fetchDataForType = async (type, period) => {
    setLoading(prev => ({ ...prev, [type]: true }));
    try {
      const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
      const endpointMap = {
        heart_rate: 'heart',
        steps: 'steps',
        calories: 'calories',
      };
      const endpoint = endpointMap[type];
      const response = await fetch(`${baseUrl}/api/data/${endpoint}?period=${period}`, {
        headers: { Authorization: accessToken }
      });
      const data = await response.json();

      if (type === 'heart_rate') {
        const heartData = data?.['activities-heart']?.map(item => ({
          dateTime: item.dateTime,
          value: item.value?.restingHeartRate || 0,
        })) || [];
        setFitData(prev => ({ ...prev, heart_rate: heartData }));
        if (heartData.length > 0) {
          const latestValue = heartData[heartData.length-1].value;
          if (latestValue) {
            setSummaries(prev => ({
              ...prev,
              current_heart_rate: latestValue.toString()
            }));
          }
        }
      } else if (type === 'steps') {
        setFitData(prev => ({ 
          ...prev, 
          step_count: data['activities-steps'] || [] 
        }));
      } else if (type === 'calories') {
        setFitData(prev => ({ 
          ...prev, 
          calories: data['activities-calories'] || [] 
        }));
      }
    } catch (error) {
      console.error(`Error fetching ${type} data:`, error);
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  // Fetch activity summary for metrics
  const fetchActivitySummary = async () => {
    try {
      const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
      const response = await fetch(`${baseUrl}/api/data/activity_summary`, {
        headers: { Authorization: accessToken }
      });
      const data = await response.json();
      if (data.summary) {
        setSummaries(prev => ({
          ...prev,
          current_steps: formatNumber(data.summary.steps || 0),
          current_calories: formatNumber(data.summary.caloriesOut || 0),
        }));
      }
    } catch (error) {
      console.error("Error fetching activity summary:", error);
    }
  };

  // Utility functions
  const formatNumber = (number) => number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  const extractValues = (data, key = 'value') => data.map(item => Number(item[key]));
  const extractLabels = (data) => data.map(item => formatDate(item.dateTime || ''));

  const handlePeriodChange = (chartType, newPeriod) => {
    setPeriods(prev => ({
      ...prev,
      [chartType]: newPeriod
    }));
  };

  // Chart data configs
  const stepsData = {
    labels: extractLabels(fitData.step_count),
    datasets: [{
      label: 'Steps',
      data: extractValues(fitData.step_count),
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 2,
      borderRadius: 50,
    }],
  };

  const heartRateData = {
    labels: extractLabels(fitData.heart_rate),
    datasets: [{
      label: 'Heart Rate',
      data: extractValues(fitData.heart_rate),
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 2,
      tension: 0.4,
    }],
  };

  const caloriesData = {
    labels: extractLabels(fitData.calories),
    datasets: [{
      label: 'Calories Burned',
      data: extractValues(fitData.calories),
      backgroundColor: 'rgba(255, 206, 86, 0.5)',
      borderColor: 'rgba(255, 206, 86, 1)',
      borderWidth: 2,
      borderRadius: 50,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 13 },
        bodyFont: { size: 12 }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' }
      },
      x: {
        grid: { display: false }
      }
    }
  };

  // Period buttons
  const renderPeriodButtons = (chartType) => {
    const periodOptions = [
      { value: '1d', label: 'Daily' },
      { value: '7d', label: 'Weekly' },
      { value: '30d', label: 'Monthly' }
    ];
    return (
      <div className="flex justify-center space-x-2 my-3">
        {periodOptions.map(option => (
          <button
            key={option.value}
            onClick={() => handlePeriodChange(chartType, option.value)}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              periods[chartType] === option.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    );
  };

  // Loader for chart
  const renderLoadingIndicator = (chartType) => {
    if (!loading[chartType]) return null;
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10 rounded-lg">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  };

  // No login screen stays the same as before! (omitted here for brevity—keep as in original)

  if (!isLoggedIn) {
    return (
      // Reuse your previous welcome card!
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 py-16">
        {/* ... your welcome card ... */}
      </div>
    );
  }

  // Main content: THREE vertical cards
  return (
    <div className="flex flex-col gap-8 px-4 py-4">

      {/* Heart Rate Card */}
      <div className="bg-white shadow rounded-2xl p-6 dashboard-card">
        <h2 className="text-xl font-bold flex items-center mb-4 gap-2">
          <FaHeartbeat className="text-red-500" /> Heart Rate Analysis
        </h2>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="metric-card flex-1 flex flex-col justify-center items-center mb-4 md:mb-0">
            <div className="text-gray-700 font-semibold">Resting Heart Rate</div>
            <div className="text-red-500 text-3xl font-bold">{summaries.current_heart_rate}</div>
            <div className="text-xs text-gray-400">BPM (Resting)</div>
          </div>
          <div className="flex-[3]">
            {renderPeriodButtons('heart_rate')}
            <div className="h-[280px] relative bg-slate-50 rounded-lg">
              <Line data={heartRateData} options={chartOptions} />
              {renderLoadingIndicator('heart_rate')}
            </div>
          </div>
        </div>
      </div>

      {/* Steps Card */}
      <div className="bg-white shadow rounded-2xl p-6 dashboard-card">
        <h2 className="text-xl font-bold flex items-center mb-4 gap-2">
          <FaWalking className="text-blue-500" /> Steps Activity
        </h2>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="metric-card flex-1 flex flex-col justify-center items-center mb-4 md:mb-0">
            <div className="text-gray-700 font-semibold">Today's Steps</div>
            <div className="text-blue-500 text-3xl font-bold">{summaries.current_steps}</div>
            <div className="text-xs text-gray-400">Total Steps Today</div>
          </div>
          <div className="flex-[3]">
            {renderPeriodButtons('steps')}
            <div className="h-[280px] relative bg-slate-50 rounded-lg">
              <Bar data={stepsData} options={chartOptions} />
              {renderLoadingIndicator('steps')}
            </div>
          </div>
        </div>
      </div>

      {/* Calories Card */}
      <div className="bg-white shadow rounded-2xl p-6 dashboard-card">
        <h2 className="text-xl font-bold flex items-center mb-4 gap-2">
          <FaFire className="text-yellow-500" /> Calories Burned
        </h2>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="metric-card flex-1 flex flex-col justify-center items-center mb-4 md:mb-0">
            <div className="text-gray-700 font-semibold">Today's Calories</div>
            <div className="text-yellow-500 text-3xl font-bold">{summaries.current_calories}</div>
            <div className="text-xs text-gray-400">Total Calories Burned</div>
          </div>
          <div className="flex-[3]">
            {renderPeriodButtons('calories')}
            <div className="h-[280px] relative bg-slate-50 rounded-lg">
              <Bar data={caloriesData} options={chartOptions} />
              {renderLoadingIndicator('calories')}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default VitalPage;