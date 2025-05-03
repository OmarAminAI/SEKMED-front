import React, { useEffect, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement,
  Title, Tooltip, Legend, PointElement
} from 'chart.js';
import { TbMedicalCrossCircle } from "react-icons/tb";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, Title, Tooltip, Legend, PointElement);

const VitalPage = () => {
  const [fitData, setFitData] = useState({
    heart_rate: [],
    step_count: [],
    calories: [],
    distance: [],
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromURL = params.get('token');
    if (tokenFromURL) {
      localStorage.setItem('access_token', `Bearer ${tokenFromURL}`);
      window.history.replaceState({}, document.title, window.location.pathname);  
      setIsLoggedIn(true);
    } else if (localStorage.getItem("access_token")) {
      setIsLoggedIn(true);      
    }
  }, []);

  const access_token = localStorage.getItem("access_token");

  useEffect(() => {
    if (!access_token) return;

    const endpoints = ["heart", "steps", "calories", "distance"];
    const fetchData = async () => {
      try {
        const results = await Promise.all(
          endpoints.map(endpoint =>
            fetch(`http://localhost:5000/api/data/${endpoint}?period=7d`, {
              headers: { Authorization: access_token }
            }).then(res => res.json())
          )
        );

        const heartData = results[0]?.activities_heart?.map(item => ({
          dateTime: item.dateTime,
          value: item.value?.restingHeartRate || 0,
        })) || [];

        setFitData({
          heart_rate: results[1]['activities-heart'] || [],
          step_count: results[1]['activities-steps'] || [],
          calories: results[2]['activities-calories'] || [],
          distance: results[3]['activities-distance'] || [],
        });

      } catch (error) {
        console.error("Error fetching Fitbit data:", error);
      }
    };

    fetchData();
  }, [access_token]);

  const extractValues = (data, key = 'value') => data.map(item => Number(item[key]));
  const extractLabels = (data) => data.map(item => item.dateTime || '');

  const stepsData = {
    labels: extractLabels(fitData.step_count),
    datasets: [{
      label: 'Steps',
      data: extractValues(fitData.step_count),
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 2,
      borderRadius: 50,
    }],
  };

  const heartRateData = {
    labels: extractLabels(fitData.heart_rate),
    datasets: [{
      label: 'Heart Rate',
      data: extractValues(fitData.heart_rate),
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 2,
      tension: 0.4,
    }],
  };

  const caloriesData = {
    labels: extractLabels(fitData.calories),
    datasets: [{
      label: 'Calories Burnt',
      data: extractValues(fitData.calories),
      backgroundColor: 'rgba(255, 206, 86, 0.5)',
      borderColor: 'rgba(255, 206, 86, 1)',
      borderWidth: 2,
      borderRadius: 50,
    }],
  };

  const distanceData = {
    labels: extractLabels(fitData.distance),
    datasets: [{
      label: 'Distance (km)',
      data: extractValues(fitData.distance),
      backgroundColor: 'rgba(75, 192, 192, 0.5)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 2,
      tension: 0.4,
    }],
  };

  return (
    <div>
      {!isLoggedIn && (
        <div className="p-4">
          <a
            href="http://localhost:5000/authorize"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-full"
          >
            Sign in with Fitbit
          </a>
        </div>
      )}

      <div className="flex items-center ml-2 py-4">
        <div className="h-10 w-10 rounded-full ring-1 ring-red-500 flex items-center justify-center">
          <TbMedicalCrossCircle size={24} className="text-red-500" />
        </div>
        <h1 className="mx-2 text-[20px] md:text-2xl font-bold text-gray-800">Vital Tracking</h1>
      </div>

      <div className="grid grid-cols-1 bg-white rounded-3xl ring-1 ring-gray-300 sm:grid-cols-2 lg:grid-cols-2">
        <div className="md:h-[320px] md:w-[600px] md:ml-16 md:pt-2">
          <Bar data={stepsData} />
        </div>
        <div className="md:h-[320px] md:w-[600px] md:ml-16 md:pt-2">
          <Line data={heartRateData} />
        </div>
        <div className="md:h-[320px] md:w-[600px] md:ml-16 md:pt-2">
          <Bar data={caloriesData} />
        </div>
        <div className="md:h-[320px] md:w-[600px] md:ml-16 md:pt-2">
          <Line data={distanceData} />
        </div>
      </div>
    </div>
  );
};

export default VitalPage;
/////

// import React, { useEffect, useState } from 'react';
// import { Bar, Line } from 'react-chartjs-2';
// import {
//   Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement,
//   Title, Tooltip, Legend, PointElement
// } from 'chart.js';
// import { TbMedicalCrossCircle } from "react-icons/tb";

// ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, Title, Tooltip, Legend, PointElement);

// const VitalPage = () => {
//   const [fitData, setFitData] = useState({
//     heart_rate: [],
//     step_count: [],
//     calories: [],
//     distance: [],
//   });

//   const access_token = "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyM1FDU1oiLCJzdWIiOiJDS0Q3TUYiLCJpc3MiOiJGaXRiaXQiLCJ0eXAiOiJhY2Nlc3NfdG9rZW4iLCJzY29wZXMiOiJyYWN0IHJociBycHJvIHJzbGUiLCJleHAiOjE3NDYzMzM1MzQsImlhdCI6MTc0NjMwNDczNH0.T3Q9X0AJEGttw7GIoXTVKM31z5B0KafAp7bpYEs80to";

//   useEffect(() => {
//     const endpoints = ["heart", "steps", "calories", "distance"];
//     const fetchData = async () => {
//       try {
//         const results = await Promise.all(
//           endpoints.map(endpoint =>
//             fetch(`http://localhost:5000/api/data/${endpoint}?period=7d`, {
//               headers: { Authorization: access_token }
//             }).then(res => res.json())
//           )
//         );

//         const heartData = results[0]?.activities_heart?.map(item => ({
//           dateTime: item.dateTime,
//           value: item.value?.restingHeartRate || 0,
//         })) || [];

// setFitData({
//   heart_rate: heartData,
//   step_count: results[1]['activities-steps'] || [],
//   calories: results[2]['activities-calories'] || [],
//   distance: results[3]['activities-distance'] || [],
// });


//       } catch (error) {
//         console.error("Error fetching Fitbit data:", error);
//       }
//     };

//     fetchData();
//   }, []);

//   const extractValues = (data, key = 'value') => data.map(item => Number(item[key]));
//   const extractLabels = (data) => data.map(item => item.dateTime || '');

//   const stepsData = {
//     labels: extractLabels(fitData.step_count),
//     datasets: [{
//       label: 'Steps',
//       data: extractValues(fitData.step_count),
//       backgroundColor: 'rgba(255, 99, 132, 0.5)',
//       borderColor: 'rgba(255, 99, 132, 1)',
//       borderWidth: 2,
//       borderRadius: 50,
//     }],
//   };

//   const heartRateData = {
//     labels: extractLabels(fitData.heart_rate),
//     datasets: [{
//       label: 'Heart Rate',
//       data: extractValues(fitData.heart_rate),
//       backgroundColor: 'rgba(54, 162, 235, 0.5)',
//       borderColor: 'rgba(54, 162, 235, 1)',
//       borderWidth: 2,
//       tension: 0.4,
//     }],
//   };

//   const caloriesData = {
//     labels: extractLabels(fitData.calories),
//     datasets: [{
//       label: 'Calories Burnt',
//       data: extractValues(fitData.calories),
//       backgroundColor: 'rgba(255, 206, 86, 0.5)',
//       borderColor: 'rgba(255, 206, 86, 1)',
//       borderWidth: 2,
//       borderRadius: 50,
//     }],
//   };

//   const distanceData = {
//     labels: extractLabels(fitData.distance),
//     datasets: [{
//       label: 'Distance (km)',
//       data: extractValues(fitData.distance),
//       backgroundColor: 'rgba(75, 192, 192, 0.5)',
//       borderColor: 'rgba(75, 192, 192, 1)',
//       borderWidth: 2,
//       tension: 0.4,
//     }],
//   };

//   return (
//     <div>
//       <div className="flex items-center ml-2 py-4">
//         <div className="h-10 w-10 rounded-full ring-1 ring-red-500 flex items-center justify-center">
//           <TbMedicalCrossCircle size={24} className="text-red-500" />
//         </div>
//         <h1 className="mx-2 text-[20px] md:text-2xl font-bold text-gray-800">Vital Tracking</h1>
//       </div>

//       <div className="grid grid-cols-1 bg-white rounded-3xl ring-1 ring-gray-300 sm:grid-cols-2 lg:grid-cols-2">
//         <div className="md:h-[320px] md:w-[600px] md:ml-16 md:pt-2">
//           <Bar data={stepsData} />
//         </div>
//         <div className="md:h-[320px] md:w-[600px] md:ml-16 md:pt-2">
//           <Line data={heartRateData} />
//         </div>
//         <div className="md:h-[320px] md:w-[600px] md:ml-16 md:pt-2">
//           <Bar data={caloriesData} />
//         </div>
//         <div className="md:h-[320px] md:w-[600px] md:ml-16 md:pt-2">
//           <Line data={distanceData} />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default VitalPage;
