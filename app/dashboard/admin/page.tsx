'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ShieldIcon from '@/components/ShieldIcon';
import { 
  LogOut, 
  FileText, 
  AlertTriangle, 
  MapPin, 
  TrendingUp,
  Map,
  BarChart3,
  Users,
  FileCheck,
  Network
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      router.push('/');
    }
  };

  // Mock data for charts and incidents
  const voteData = [
    { district: 'Chittagong', count: 6890, color: '#3b82f6' },
    { district: 'Dhaka', count: 8890, color: '#10b981' },
    { district: 'Khulna', count: 5120, color: '#8b5cf6' },
    { district: 'Rajshahi', count: 5890, color: '#f59e0b' },
    { district: 'Sylhet', count: 4920, color: '#ec4899' },
  ];

  const recentIncidents = [
    {
      id: 'INC-001',
      severity: 'HIGH',
      title: 'Voter intimidation reported',
      location: 'Dhaka-10, Mirpur Polling Station',
      status: 'pending',
      severityColor: 'orange',
    },
    {
      id: 'INC-002',
      severity: 'CRITICAL',
      title: 'Ballot box tampering attempt',
      location: 'Chittagong-5, Agrabad Station',
      status: 'responded',
      severityColor: 'red',
    },
    {
      id: 'INC-003',
      severity: 'MEDIUM',
      title: 'Technical malfunction - EVM',
      location: 'Rajshahi-3, Boalia Thana',
      status: 'resolved',
      severityColor: 'yellow',
    },
    {
      id: 'INC-004',
      severity: 'MEDIUM',
      title: 'Crowd control issue',
      location: 'Dhaka-6, Tejgaon',
      status: 'pending',
      severityColor: 'yellow',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center">
            <ShieldIcon className="w-8 h-8 mr-3" color="#10b981" />
            <div>
              <h1 className="text-lg font-bold text-primary-green">AmarVote</h1>
              <p className="text-sm text-gray-500">Admin Dashboard</p>
            </div>
          </div>

          {/* User Info and Logout */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">Admin User</p>
              <p className="text-xs text-gray-500">BEC Administrator</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Total Incidents */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-3xl font-bold text-blue-600">5</span>
            </div>
            <h3 className="text-sm font-medium text-gray-700 mb-1">Total Incidents</h3>
            <p className="text-xs text-gray-500">2 pending, 2 responded</p>
          </div>

          {/* Red Zone Areas */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <span className="text-3xl font-bold text-red-600">3</span>
            </div>
            <h3 className="text-sm font-medium text-gray-700 mb-1">Red Zone Areas</h3>
            <p className="text-xs text-gray-500">High/Critical severity</p>
          </div>

          {/* Active Polling Centers */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-3xl font-bold text-green-600">7</span>
            </div>
            <h3 className="text-sm font-medium text-gray-700 mb-1">Active Polling Centers</h3>
            <p className="text-xs text-gray-500">Operational nationwide</p>
          </div>

          {/* Votes Cast */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-3xl font-bold text-purple-600">17,970</span>
            </div>
            <h3 className="text-sm font-medium text-gray-700 mb-1">Votes Cast</h3>
            <p className="text-xs text-gray-500">Live count</p>
          </div>
        </div>

        {/* Live Vote Count Trend Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Live Vote Count Trend</h2>
          
          {/* Chart Area */}
          <div className="relative h-80 border border-gray-200 rounded-lg p-4 bg-gray-50">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-12 flex flex-col justify-between text-xs text-gray-500 pr-2">
              <span>10000</span>
              <span>7500</span>
              <span>5000</span>
              <span>2500</span>
              <span>0</span>
            </div>
            
            {/* Chart content - simplified visualization */}
            <div className="ml-12 h-full flex items-end justify-around pb-8">
              <svg className="w-full h-full" viewBox="0 0 600 300" preserveAspectRatio="none">
                {/* Grid lines */}
                <line x1="0" y1="75" x2="600" y2="75" stroke="#e5e7eb" strokeWidth="1" />
                <line x1="0" y1="150" x2="600" y2="150" stroke="#e5e7eb" strokeWidth="1" />
                <line x1="0" y1="225" x2="600" y2="225" stroke="#e5e7eb" strokeWidth="1" />
                
                {/* Chittagong - Blue */}
                <polyline
                  points="0,270 150,230 300,180 450,140 600,90"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                />
                
                {/* Dhaka - Green */}
                <polyline
                  points="0,280 150,240 300,170 450,120 600,60"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                />
                
                {/* Khulna - Purple */}
                <polyline
                  points="0,285 150,250 300,210 450,180 600,140"
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="2"
                />
                
                {/* Rajshahi - Orange */}
                <polyline
                  points="0,285 150,255 300,215 450,185 600,130"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2"
                />
                
                {/* Sylhet - Pink */}
                <polyline
                  points="0,290 150,260 300,230 450,200 600,155"
                  fill="none"
                  stroke="#ec4899"
                  strokeWidth="2"
                />
              </svg>
            </div>
            
            {/* X-axis labels */}
            <div className="ml-12 flex justify-between text-xs text-gray-500 mt-2">
              <span>08:00</span>
              <span>09:00</span>
              <span>10:00</span>
              <span>11:00</span>
              <span>12:00</span>
            </div>

            {/* Legend */}
            <div className="absolute top-4 right-4 bg-white border border-gray-200 rounded-lg p-3 text-xs">
              <div className="font-medium mb-2">12:00</div>
              {voteData.map((district) => (
                <div key={district.district} className="flex items-center justify-between gap-4 mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: district.color }}></div>
                    <span style={{ color: district.color }}>{district.district}:</span>
                  </div>
                  <span className="font-semibold" style={{ color: district.color }}>{district.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section - Map and Incidents */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Incident Map Preview */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Incident Map Preview</h2>
              <button className="text-primary-green text-sm font-medium hover:underline flex items-center">
                View Full Map →
              </button>
            </div>
            
            <div className="bg-green-50 rounded-lg h-64 flex items-center justify-center relative border border-gray-200">
              <div className="text-center">
                <Map className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 font-medium">Interactive map with incident markers</p>
                <p className="text-xs text-gray-500 mt-1">3 red zones detected</p>
              </div>
              {/* Mock red zone markers */}
              <div className="absolute top-12 left-20 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
              <div className="absolute bottom-20 right-16 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
              <div className="absolute top-24 right-24 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Recent Incidents */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Incidents</h2>
            
            <div className="space-y-3">
              {recentIncidents.map((incident) => (
                <div key={incident.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <span className={`px-3 py-1 rounded text-xs font-semibold ${
                      incident.severity === 'CRITICAL' 
                        ? 'bg-red-100 text-red-700' 
                        : incident.severity === 'HIGH'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {incident.severity}
                    </span>
                    <span className="text-xs text-gray-500">{incident.id}</span>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">{incident.title}</h3>
                  <p className="text-xs text-gray-500 mb-2">{incident.location}</p>
                  <div className="flex justify-end">
                    <span className={`text-xs font-medium ${
                      incident.status === 'resolved' 
                        ? 'text-green-600' 
                        : incident.status === 'responded'
                        ? 'text-blue-600'
                        : 'text-orange-600'
                    }`}>
                      {incident.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="grid grid-cols-5 gap-4">
            <button className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-lg transition-colors group">
              <Map className="w-6 h-6 text-gray-600 group-hover:text-primary-green mb-2" />
              <span className="text-xs text-gray-700 group-hover:text-primary-green font-medium">Incident Map</span>
            </button>
            
            <button className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-lg transition-colors group">
              <BarChart3 className="w-6 h-6 text-gray-600 group-hover:text-primary-green mb-2" />
              <span className="text-xs text-gray-700 group-hover:text-primary-green font-medium">Voting Trends</span>
            </button>
            
            <button className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-lg transition-colors group">
              <Users className="w-6 h-6 text-gray-600 group-hover:text-primary-green mb-2" />
              <span className="text-xs text-gray-700 group-hover:text-primary-green font-medium">User Management</span>
            </button>
            
            <button className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-lg transition-colors group">
              <FileCheck className="w-6 h-6 text-gray-600 group-hover:text-primary-green mb-2" />
              <span className="text-xs text-gray-700 group-hover:text-primary-green font-medium">System Logs</span>
            </button>
            
            <button className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-lg transition-colors group">
              <Network className="w-6 h-6 text-gray-600 group-hover:text-primary-green mb-2" />
              <span className="text-xs text-gray-700 group-hover:text-primary-green font-medium">Architecture</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
