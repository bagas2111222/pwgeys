import { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { useNavigate } from 'react-router-dom';

export default function Example() {
    const chartRef = useRef(null);
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            // Redirect ke halaman login jika token tidak tersedia
            navigate("/login");
        }
        fetch('http://localhost:8000/api/report/report', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            setChartData(data);
            renderChart(data);
        })
        .catch(error => console.error('Error fetching data:', error));
        
        return () => {
            destroyChart();
        };
    }, []);

    const renderChart = (data) => {
        const ctx = document.getElementById('area-chart').getContext('2d');
        const labels = data.map(item => item.bulan);
        const totals = data.map(item => item.total);

        destroyChart();

        chartRef.current = new Chart(ctx, { 
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Total closing',
                    data: totals,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value;
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(tooltipItem) {
                                return tooltipItem.raw;
                            }
                        }
                    }
                }
            }
        });
    };

    const destroyChart = () => {
        if (chartRef.current) {
            chartRef.current.destroy();
        }
    };

    return (
        <div className="flex ml-10 mt-18 items-center h-screen">
            <div className="max-w-screen-xl w-7/12 h-4/6 gap-48 bg-white rounded-lg shadow p-8">
                <div>
                    <div className="w-full">
                        <canvas id="area-chart" className="w-full h-2/6"></canvas>
                    </div>
                </div>
            </div>
            <div className="ml-24">
                <img src="/img/hello.svg" alt="hello" className="h-64 md:h-60 w-full object-cover" />
            </div>
        </div>
    );
}
