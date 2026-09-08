import { useEffect, useState } from 'react';
import { properties, leads } from '../utils/api';
import { Building2, Users, TrendingUp, Eye } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [propertyStats, setPropertyStats] = useState(null);
  const [leadStats, setLeadStats] = useState(null);
  const [recentProperties, setRecentProperties] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const propRes = await properties.getStats();
        const leadRes = await leads.getStats();
        const propList = await properties.getAll({ limit: 5 });
        setPropertyStats(propRes.data);
        setLeadStats(leadRes.data);
        setRecentProperties(propList.data.properties);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const chartData = [
    { name: 'Available', value: propertyStats?.available || 0, fill: '#22c55e' },
    { name: 'Sold', value: propertyStats?.sold || 0, fill: '#ef4444' },
    { name: 'Pending', value: propertyStats?.pending || 0, fill: '#f59e0b' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Properties</p>
              <p className="text-3xl font-bold">{propertyStats?.total || 0}</p>
            </div>
            <Building2 className="text-blue-600" size={40} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Available</p>
              <p className="text-3xl font-bold text-green-600">{propertyStats?.available || 0}</p>
            </div>
            <TrendingUp className="text-green-600" size={40} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Leads</p>
              <p className="text-3xl font-bold">{leadStats?.total || 0}</p>
            </div>
            <Users className="text-purple-600" size={40} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Converted</p>
              <p className="text-3xl font-bold text-blue-600">{leadStats?.converted || 0}</p>
            </div>
            <Eye className="text-blue-600" size={40} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Property Status</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Recent Properties</h2>
          <div className="space-y-3">
            {recentProperties.map(prop => (
              <div key={prop._id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{prop.title}</p>
                  <p className="text-sm text-gray-500">{prop.address?.city}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  prop.status === 'available' ? 'bg-green-100 text-green-700' :
                  prop.status === 'sold' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                }`}>{prop.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
