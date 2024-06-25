import { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function Dash() {
  const chartRef = useRef(null);
  const [selectedCity, setSelectedCity] = useState('SURABAYA');
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  // Define token and role
  const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
  const role = localStorage.getItem('role'); // Assuming role is stored in localStorage

  useEffect(() => {
    // Fetch data from the API
    axios.get('http://localhost:8000/api/report/cibasaja')
      .then(response => {
        if (response.data.success) {
          setData(response.data.data);
        }
      })
      .catch(error => {
        console.error("There was an error fetching the data!", error);
      });
  }, []);

  useEffect(() => {
    if (!token) {
      // Redirect ke halaman login jika token tidak tersedia
      navigate("/login");
    } else if (role !== 'admin') {
      // Menampilkan popup jika peran bukan admin
      Swal.fire({
        title: 'Akses Ditolak',
        text: 'Anda tidak memiliki akses!',
        icon: 'error',
        confirmButtonText: 'OK'
      }).then(() => {
        // Redirect ke halaman Pegawai jika peran bukan admin
        navigate("/Pegawai");
      });
    }
    renderChart();
    return () => {
      destroyChart();
    };
  }, [selectedCity, data]);

  const renderChart = () => {
    if (data.length === 0) return;

    const ctx = document.getElementById('area-chart').getContext('2d');
    const filteredData = data.filter(city => city.nama.toUpperCase() === selectedCity);
    const labels = filteredData.map(city => city.bulan);
    const totals = filteredData.map(city => city.total);

    destroyChart();

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Total',
          data: totals,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  };

  const destroyChart = () => {
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }
  };

  const handleCityChange = (event) => {
    setSelectedCity(event.target.value);
  };

  // Extract unique city names from the data and sort them
  const uniqueCities = [...new Set(data.map(city => city.nama.toUpperCase()))].sort();

  return (
    <div className="flex ml-10 mt-18 items-center h-screen">
      <div className="max-w-screen-xl w-7/12 h-4/6 gap-48 bg-white rounded-lg shadow p-8">
        <div>
          <div className="justify-items-end">
            <p className="text-lg font-semibold text-gray-900">Select City:</p>
            <select onChange={handleCityChange} className="text-sm font-medium text-gray-500 mt-2">
              <option value="" disabled>Select City</option>
              {uniqueCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          <div className="w-full">
            <canvas id="area-chart" className="w-full h-2/6" ></canvas>
          </div>
        </div>
      </div>
      <div className="ml-24">
        <img src="/img/hello.svg" alt="hello" className="h-64 md:h-60 w-full object-cover" />
      </div>
    </div>
  );
}
