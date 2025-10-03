import { Link } from 'react-router-dom';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import cities from '../data/cities';
import destinations from '../data/destinations';
import pois from '../data/pois';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  // Removed background image as per user request
  // const backgroundImage = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80';

  // Calculate real stats
  const totalPOIs = pois.length;
  const totalDestinations = Object.keys(destinations).length;
  const totalUsers = cities.reduce((sum, city) => sum + city.population.total, 0);

  // Category distribution for pie chart
  const categoryCounts: Record<string, number> = pois.reduce((acc, poi) => {
    acc[poi.category] = (acc[poi.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const categoryLabels = Object.keys(categoryCounts);
  const categoryData = Object.values(categoryCounts);

  // Top POIs by rating
  const topPOIs = pois.sort((a, b) => b.rating - a.rating).slice(0, 3);

  // Top destinations by number of POIs
  const destinationArray: Array<{ name: string } & typeof destinations[string]> = Object.entries(destinations).map(([name, dest]) => ({ name, ...dest }));
  const topDestinations = destinationArray.sort((a, b) => b.pois.length - a.pois.length).slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="text-center py-20 relative overflow-hidden bg-white">
        <div className="px-4 relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900">
            🏢 Backpacking Buzz
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-4">
            Business Dashboard for Tour Operators, Hotel Admins, and Tenants
          </h2>
          <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Manage your tours, hotels, and properties with ease. Monitor users, POIs, events, itineraries, and more.
          </p>

          {/* Quick Stats Preview */}
          <div className="mb-16 max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm p-4 rounded-xl border border-white border-opacity-20">
                <div className="text-2xl mb-1">📍</div>
                <div className="text-lg font-bold">{totalPOIs}</div>
                <div className="text-xs opacity-90">POIs</div>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm p-4 rounded-xl border border-white border-opacity-20">
                <div className="text-2xl mb-1">👥</div>
                <div className="text-lg font-bold">{totalUsers.toLocaleString()}</div>
                <div className="text-xs opacity-90">Users</div>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm p-4 rounded-xl border border-white border-opacity-20">
                <div className="text-2xl mb-1">🎭</div>
                <div className="text-lg font-bold">25</div>
                <div className="text-xs opacity-90">Events</div>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm p-4 rounded-xl border border-white border-opacity-20">
                <div className="text-2xl mb-1">🗺️</div>
                <div className="text-lg font-bold">{totalDestinations}</div>
                <div className="text-xs opacity-90">Itineraries</div>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm p-4 rounded-xl border border-white border-opacity-20">
                <div className="text-2xl mb-1">🚐</div>
                <div className="text-lg font-bold">45</div>
                <div className="text-xs opacity-90">Tours</div>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm p-4 rounded-xl border border-white border-opacity-20">
                <div className="text-2xl mb-1">💰</div>
                <div className="text-lg font-bold">€25K</div>
                <div className="text-xs opacity-90">Revenue</div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">📊 Key Performance Indicators</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Tours KPI */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">🚐</div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">45</div>
                  <div className="text-sm text-green-600 flex items-center">
                    <span>↑ 12%</span>
                  </div>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-800">Total Tours</h3>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{width: '90%'}}></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">90% of target</p>
            </div>
            {/* Itineraries KPI */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">🗺️</div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">{totalDestinations}</div>
                  <div className="text-sm text-green-600 flex items-center">
                    <span>↑ 8%</span>
                  </div>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-800">Total Itineraries</h3>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{width: '75%'}}></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">75% of target</p>
            </div>
            {/* Users KPI */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">👥</div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">{totalUsers.toLocaleString()}</div>
                  <div className="text-sm text-green-600 flex items-center">
                    <span>↑ 15%</span>
                  </div>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-800">Total Users</h3>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{width: '85%'}}></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">85% of target</p>
            </div>
            {/* Events KPI */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">🎭</div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-orange-600">25</div>
                  <div className="text-sm text-red-600 flex items-center">
                    <span>↓ 5%</span>
                  </div>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-800">Total Events</h3>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div className="bg-orange-600 h-2 rounded-full" style={{width: '60%'}}></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">60% of target</p>
            </div>
            {/* POIs KPI */}
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-6 rounded-xl border border-teal-200">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">📍</div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-teal-600">{totalPOIs}</div>
                  <div className="text-sm text-green-600 flex items-center">
                    <span>↑ 10%</span>
                  </div>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-800">Total POIs</h3>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div className="bg-teal-600 h-2 rounded-full" style={{width: '70%'}}></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">70% of target</p>
            </div>
            {/* Categories KPI */}
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-xl border border-pink-200">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">🏷️</div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-pink-600">{categoryLabels.length}</div>
                  <div className="text-sm text-green-600 flex items-center">
                    <span>↑ 3%</span>
                  </div>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-800">Total Categories</h3>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div className="bg-pink-600 h-2 rounded-full" style={{width: '95%'}}></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">95% of target</p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-gray-100">
              <div className="text-5xl mb-4">📍</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Total POIs</h2>
              <p className="text-4xl font-bold text-blue-600">{totalPOIs}</p>
              <p className="text-gray-600 mt-2">Points of Interest</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-gray-100">
              <div className="text-5xl mb-4">👥</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Total Users</h2>
              <p className="text-4xl font-bold text-green-600">{totalUsers.toLocaleString()}</p>
              <p className="text-gray-600 mt-2">Registered Users</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-gray-100">
              <div className="text-5xl mb-4">🎭</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Total Events</h2>
              <p className="text-4xl font-bold text-purple-600">25</p>
              <p className="text-gray-600 mt-2">Festivals and Events</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-gray-100">
              <div className="text-5xl mb-4">🗺️</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Total Itineraries</h2>
              <p className="text-4xl font-bold text-orange-600">{totalDestinations}</p>
              <p className="text-gray-600 mt-2">Travel Plans</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-gray-100">
              <div className="text-5xl mb-4">🚐</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Total Tours</h2>
              <p className="text-4xl font-bold text-pink-600">45</p>
              <p className="text-gray-600 mt-2">Tour Packages</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-gray-100">
              <div className="text-5xl mb-4">💰</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Total Revenue</h2>
              <p className="text-4xl font-bold text-yellow-600">€25,000</p>
              <p className="text-gray-600 mt-2">This Month</p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* User Growth Chart */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">📈 User Growth</h3>
              <div className="h-64">
                <Line
                  data={{
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                      label: 'Users',
                      data: [200, 350, 500, 650, 800, 950],
                      borderColor: 'rgb(59, 130, 246)',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      tension: 0.4,
                      fill: true,
                    }],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: 'rgba(0, 0, 0, 0.1)',
                        },
                      },
                      x: {
                        grid: {
                          color: 'rgba(0, 0, 0, 0.1)',
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">💰 Revenue Summary</h3>
              <div className="h-64">
                <Bar
                  data={{
                    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
                    datasets: [{
                      label: 'Revenue (€)',
                      data: [5000, 7000, 9000, 11000],
                      backgroundColor: 'rgba(34, 197, 94, 0.8)',
                      borderColor: 'rgb(34, 197, 94)',
                      borderWidth: 1,
                    }],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: 'rgba(0, 0, 0, 0.1)',
                        },
                      },
                      x: {
                        grid: {
                          color: 'rgba(0, 0, 0, 0.1)',
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>

          {/* Comparative Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* POI Categories Pie Chart */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">📊 POI Category Distribution</h3>
              <div className="h-64">
                <Pie
                  data={{
                    labels: categoryLabels,
                    datasets: [{
                      data: categoryData,
                      backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(34, 197, 94, 0.8)',
                        'rgba(168, 85, 247, 0.8)',
                        'rgba(249, 115, 22, 0.8)',
                        'rgba(236, 72, 153, 0.8)',
                      ],
                      borderColor: [
                        'rgb(59, 130, 246)',
                        'rgb(34, 197, 94)',
                        'rgb(168, 85, 247)',
                        'rgb(249, 115, 22)',
                        'rgb(236, 72, 153)',
                      ],
                      borderWidth: 1,
                    }],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          padding: 20,
                          usePointStyle: true,
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>

            {/* User Activity Doughnut Chart */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">🎯 User Activity</h3>
              <div className="h-64">
                <Doughnut
                  data={{
                    labels: ['Active', 'Inactive', 'New', 'Premium'],
                    datasets: [{
                      data: [450, 350, 250, 150],
                      backgroundColor: [
                        'rgba(34, 197, 94, 0.8)',
                        'rgba(156, 163, 175, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                      ],
                      borderColor: [
                        'rgb(34, 197, 94)',
                        'rgb(156, 163, 175)',
                        'rgb(59, 130, 246)',
                        'rgb(245, 158, 11)',
                      ],
                      borderWidth: 2,
                    }],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          padding: 20,
                          usePointStyle: true,
                        },
                      },
                    },
                    cutout: '60%',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Additional Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Bookings Trend */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">📈 Bookings Trend</h3>
              <div className="h-64">
                <Line
                  data={{
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                      label: 'Bookings',
                      data: [20, 35, 45, 55, 70, 85],
                      borderColor: 'rgb(34, 197, 94)',
                      backgroundColor: 'rgba(34, 197, 94, 0.1)',
                      tension: 0.4,
                      fill: true,
                    }],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: 'rgba(0, 0, 0, 0.1)',
                        },
                      },
                      x: {
                        grid: {
                          color: 'rgba(0, 0, 0, 0.1)',
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
            {/* Revenue vs Costs */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">💰 Revenue vs Costs</h3>
              <div className="h-64">
                <Bar
                  data={{
                    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
                    datasets: [{
                      label: 'Revenue',
                      data: [5000, 7000, 9000, 11000],
                      backgroundColor: 'rgba(34, 197, 94, 0.8)',
                      borderColor: 'rgb(34, 197, 94)',
                      borderWidth: 1,
                    }, {
                      label: 'Costs',
                      data: [3000, 4000, 5000, 6000],
                      backgroundColor: 'rgba(239, 68, 68, 0.8)',
                      borderColor: 'rgb(239, 68, 68)',
                      borderWidth: 1,
                    }],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: true,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: 'rgba(0, 0, 0, 0.1)',
                        },
                      },
                      x: {
                        grid: {
                          color: 'rgba(0, 0, 0, 0.1)',
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>

          {/* Reports Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">📊 Reports and Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Top POIs Report */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4">🏆 Most Visited POIs</h3>
                <div className="space-y-3">
                  {topPOIs.map((poi) => (
                    <div key={poi.id} className="flex justify-between items-center">
                      <span className="text-gray-700">{poi.name}</span>
                      <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm">{Math.floor(poi.rating * 100)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Revenue by Category */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4">💰 Revenue by Category</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Premium Tours</span>
                    <span className="text-green-600 font-bold">€12,500</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Itineraries</span>
                    <span className="text-green-600 font-bold">€8,200</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Events</span>
                    <span className="text-green-600 font-bold">€4,300</span>
                  </div>
                </div>
              </div>

              {/* User Engagement */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4">🎯 User Engagement</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Average Sessions</span>
                    <span className="text-purple-600 font-bold">24 min</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Retention Rate</span>
                    <span className="text-purple-600 font-bold">78%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Conversions</span>
                    <span className="text-purple-600 font-bold">15.2%</span>
                  </div>
                </div>
              </div>

              {/* Monthly Trends */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4">📈 Monthly Trends</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">New Users</span>
                    <span className="text-orange-600 font-bold">+12%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Bookings</span>
                    <span className="text-orange-600 font-bold">+8%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Revenue</span>
                    <span className="text-orange-600 font-bold">+15%</span>
                  </div>
                </div>
              </div>

              {/* Platform Health */}
              <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-6 rounded-xl border border-teal-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4">⚡ Platform Health</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Uptime</span>
                    <span className="text-teal-600 font-bold">99.9%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">API Response</span>
                    <span className="text-teal-600 font-bold">120ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Errors</span>
                    <span className="text-teal-600 font-bold">0.1%</span>
                  </div>
                </div>
              </div>

              {/* Popular Itineraries */}
              <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-xl border border-pink-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4">🗺️ Popular Itineraries</h3>
                <div className="space-y-3">
                  {topDestinations.map((dest) => (
                    <div key={dest.name} className="flex justify-between items-center">
                      <span className="text-gray-700">{dest.name}</span>
                      <span className="bg-pink-600 text-white px-2 py-1 rounded text-sm">{dest.pois.length * 50}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">📋 Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-blue-600 font-bold">👤</span>
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 font-semibold">New user registered</p>
                  <p className="text-gray-600 text-sm">John Doe joined the platform</p>
                </div>
                <span className="text-gray-500 text-sm">2 hours ago</span>
              </div>
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-green-600 font-bold">📍</span>
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 font-semibold">New POI added</p>
                  <p className="text-gray-600 text-sm">Mountain View Trail added to database</p>
                </div>
                <span className="text-gray-500 text-sm">4 hours ago</span>
              </div>
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-purple-600 font-bold">🎭</span>
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 font-semibold">Event updated</p>
                  <p className="text-gray-600 text-sm">Summer Festival details updated</p>
                </div>
                <span className="text-gray-500 text-sm">6 hours ago</span>
              </div>
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-orange-600 font-bold">🗺️</span>
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 font-semibold">Itinerary created</p>
                  <p className="text-gray-600 text-sm">New 7-day hiking itinerary published</p>
                </div>
                <span className="text-gray-500 text-sm">1 day ago</span>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">🔔 Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-yellow-600 font-bold">⚠️</span>
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 font-semibold">System Alert</p>
                  <p className="text-gray-600 text-sm">Database server requires maintenance</p>
                </div>
                <span className="text-gray-500 text-sm mr-4">1 hour ago</span>
                <button className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700">Mark as Read</button>
              </div>
              <div className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-blue-600 font-bold">👤</span>
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 font-semibold">New Premium User</p>
                  <p className="text-gray-600 text-sm">Ana Garcia subscribed to premium plan</p>
                </div>
                <span className="text-gray-500 text-sm mr-4">3 hours ago</span>
                <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">Mark as Read</button>
              </div>
              <div className="flex items-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-green-600 font-bold">💰</span>
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 font-semibold">Payment Received</p>
                  <p className="text-gray-600 text-sm">€150 payment for Alps tour confirmed</p>
                </div>
                <span className="text-gray-500 text-sm mr-4">5 hours ago</span>
                <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">Mark as Read</button>
              </div>
              <div className="flex items-center p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-red-600 font-bold">🚫</span>
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 font-semibold">Failed Login Attempt</p>
                  <p className="text-gray-600 text-sm">Multiple login attempts from unknown IP</p>
                </div>
                <span className="text-gray-500 text-sm mr-4">1 day ago</span>
                <button className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">Mark as Read</button>
              </div>
            </div>
          </div>


          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">⚡ Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 hover:shadow-lg transition-all duration-300">
                <div className="text-4xl mb-4">🏷️</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Manage Categories</h3>
                <p className="text-gray-600 mb-4">Add, edit or delete POI categories</p>
                <Link to="categories" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block">
                  Go to Categories
                </Link>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 hover:shadow-lg transition-all duration-300">
                <div className="text-4xl mb-4">📍</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Manage POIs</h3>
                <p className="text-gray-600 mb-4">Monitor points of interest and attractions</p>
                <Link to="pois" className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors inline-block">
                  Go to POIs
                </Link>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 hover:shadow-lg transition-all duration-300">
                <div className="text-4xl mb-4">👥</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Manage Users</h3>
                <p className="text-gray-600 mb-4">View and manage user accounts</p>
                <Link to="users" className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors inline-block">
                  Go to Users
                </Link>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200 hover:shadow-lg transition-all duration-300">
                <div className="text-4xl mb-4">🎭</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Manage Events</h3>
                <p className="text-gray-600 mb-4">Handle festivals and events</p>
                <Link to="events" className="bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-700 transition-colors inline-block">
                  Go to Events
                </Link>
              </div>
              <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-6 rounded-xl border border-teal-200 hover:shadow-lg transition-all duration-300">
                <div className="text-4xl mb-4">🗺️</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Manage Itineraries</h3>
                <p className="text-gray-600 mb-4">Create and edit travel itineraries</p>
                <Link to="itineraries" className="bg-teal-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-teal-700 transition-colors inline-block">
                  Go to Itineraries
                </Link>
              </div>
              <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-xl border border-pink-200 hover:shadow-lg transition-all duration-300">
                <div className="text-4xl mb-4">🚐</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Manage Tours</h3>
                <p className="text-gray-600 mb-4">Monitor tour packages and operators</p>
                <Link to="tours" className="bg-pink-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-pink-700 transition-colors inline-block">
                  Go to Tours
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
