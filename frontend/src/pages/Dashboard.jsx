import { useState, useEffect } from 'react';
import { fetchProducts, fetchSales, fetchAnomalies, fetchAlerts } from '../services/api';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e'];

export default function Dashboard() {
  const [kpis, setKpis] = useState({ products: 0, sales: 0, anomalies: 0, alerts: 0 });
  const [anomalies, setAnomalies] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [anomalyData, setAnomalyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [prodRes, salesRes, anomRes, alertRes] = await Promise.all([
          fetchProducts(),
          fetchSales(),
          fetchAnomalies(),
          fetchAlerts()
        ]);

        const totalSales = salesRes.data.reduce((sum, s) => sum + (s.amount || 0), 0);
        setKpis({
          products: prodRes.data.length,
          sales: totalSales,
          anomalies: anomRes.data.length,
          alerts: alertRes.data.filter(a => a.status === 'open').length
        });

        setAnomalies(anomRes.data.slice(0, 5));
        setAlerts(alertRes.data.slice(0, 5));

        // Sales Chart
        const dailySales = {};
        salesRes.data.forEach(sale => {
          const date = new Date(sale.sale_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          if (!dailySales[date]) dailySales[date] = { sales: 0, count: 0 };
          dailySales[date].sales += sale.amount || 0;
          dailySales[date].count += 1;
        });

        const chartData = Object.entries(dailySales)
          .sort((a, b) => new Date(a[0]) - new Date(b[0]))
          .slice(-7)
          .map(([date, data]) => ({
            name: date,
            sales: Math.round(data.sales),
            transactions: data.count
          }));

        setSalesData(chartData);

        // Anomalies
        const anomalyCount = {};
        anomRes.data.forEach(anom => {
          const type = anom.anomaly_type || 'unknown';
          anomalyCount[type] = (anomalyCount[type] || 0) + 1;
        });

        const anomChartData = Object.entries(anomalyCount).map(([type, count]) => ({
          name: type.replace('_', ' ').toUpperCase(),
          value: count
        }));

        setAnomalyData(anomChartData);
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center"><div className="text-2xl text-gray-600">Loading...</div></div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 text-lg mt-2">Smart Retail Inventory Analytics</p>
      </div>

      {/* KPI Cards - 4 Column Grid */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Total Products"
          value={kpis.products}
          bgColor="bg-blue-500"
          lightBg="bg-blue-50"
          textColor="text-blue-600"
        />
        <KPICard
          title="Total Sales"
          value={`₹${(kpis.sales / 100000).toFixed(1)}L`}
          bgColor="bg-green-500"
          lightBg="bg-green-50"
          textColor="text-green-600"
        />
        <KPICard
          title="Anomalies"
          value={kpis.anomalies}
          bgColor="bg-red-500"
          lightBg="bg-red-50"
          textColor="text-red-600"
        />
        <KPICard
          title="Open Alerts"
          value={kpis.alerts}
          bgColor="bg-yellow-500"
          lightBg="bg-yellow-50"
          textColor="text-yellow-600"
        />
      </div>

      {/* Charts Section - 2 Columns */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Sales Chart */}
        <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-blue-500">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Sales Trend (Last 7 Days)</h2>
          <div className="h-80">
            {salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '2px solid #3b82f6', borderRadius: '8px' }}
                    formatter={(value) => `₹${value.toLocaleString()}`}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} name="Sales Amount" dot={{ fill: '#3b82f6', r: 4 }} />
                  <Line type="monotone" dataKey="transactions" stroke="#10b981" strokeWidth={2} name="Transactions" dot={{ fill: '#10b981', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-gray-400">No data available</div>
            )}
          </div>
        </div>

        {/* Anomalies Chart */}
        <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-red-500">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Anomalies Distribution</h2>
          <div className="h-80">
            {anomalyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={anomalyData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {anomalyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} anomalies`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-gray-400">No anomalies</div>
            )}
          </div>
        </div>
      </div>

      {/* Tables Section - 2 Columns */}
      <div className="grid grid-cols-2 gap-8">
        {/* Anomalies Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border-t-4 border-red-500">
          <div className="bg-gradient-to-r from-red-500 to-red-600 p-6">
            <h2 className="text-2xl font-bold text-white">Recent Anomalies</h2>
          </div>
          <div className="p-6">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 font-semibold text-gray-700">Product</th>
                  <th className="text-left py-3 font-semibold text-gray-700">Type</th>
                  <th className="text-left py-3 font-semibold text-gray-700">Severity</th>
                </tr>
              </thead>
              <tbody>
                {anomalies.length > 0 ? (
                  anomalies.map(a => (
                    <tr key={a.id} className="border-b border-gray-100 hover:bg-red-50 transition">
                      <td className="py-3 font-medium text-gray-900">{a.product_id}</td>
                      <td className="py-3 text-gray-700">{a.anomaly_type}</td>
                      <td className="py-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${a.severity === 'HIGH'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {a.severity}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="3" className="py-6 text-center text-gray-400">No anomalies</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border-t-4 border-yellow-500">
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6">
            <h2 className="text-2xl font-bold text-white">Recent Alerts</h2>
          </div>
          <div className="p-6">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 font-semibold text-gray-700">Title</th>
                  <th className="text-left py-3 font-semibold text-gray-700">Type</th>
                  <th className="text-left py-3 font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {alerts.length > 0 ? (
                  alerts.map(al => (
                    <tr key={al.id} className="border-b border-gray-100 hover:bg-yellow-50 transition">
                      <td className="py-3 font-medium text-gray-900">{al.title}</td>
                      <td className="py-3 text-gray-700">{al.anomaly_type}</td>
                      <td className="py-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${al.status === 'open'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                          }`}>
                          {al.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="3" className="py-6 text-center text-gray-400">No alerts</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, bgColor, lightBg, textColor }) {
  return (
    <div className={`${lightBg} rounded-xl p-6 border-l-4 ${bgColor.replace('bg-', 'border-')} shadow-md hover:shadow-lg transition`}>
      <p className={`${textColor} text-sm font-semibold uppercase tracking-wider`}>{title}</p>
      <p className="text-3xl font-bold text-gray-900 mt-3">{value}</p>
      <p className={`${textColor} text-xs mt-2`}>↗ Growing</p>
    </div>
  );
}