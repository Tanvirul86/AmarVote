'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ShieldIcon from '@/components/ShieldIcon';
import UserProfileControls from '@/components/UserProfileControls';
import SlidingSidebar from '@/components/SlidingSidebar';
import NotificationBell from '@/components/NotificationBell';
import ChartTooltip from '@/components/ChartTooltip';
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
  Network,
  Menu,
  X
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      router.push('/');
    }
  };

  // Mock data for party votes
  const partyVotes = [
    { party: 'PA', votes: 12500, color: '#10b981' },
    { party: 'PB', votes: 10800, color: '#3b82f6' },
    { party: 'PC', votes: 8200, color: '#f59e0b' },
    { party: 'PD', votes: 5100, color: '#a855f7' },
    { party: 'PE', votes: 3800, color: '#ec4899' },
    { party: 'PF', votes: 3100, color: '#ef4444' },
    { party: 'PND', votes: 2800, color: '#6b7280' },
  ];

  const recentIncidents = [
    {
      id: 'INC-001',
      severity: 'HIGH',
      title: 'Group of individuals preventing voters from entering polling station',
      location: 'Azad Adda High School',
      status: 'pending',
    },
    {
      id: 'INC-002',
      severity: 'CRITICAL',
      title: 'Unauthorized person found ballot boxes',
      location: 'Pathaiya',
      status: 'responded',
    },
    {
      id: 'INC-003',
      severity: 'MEDIUM',
      title: 'Electronic voting machine stopped working, backup system activated',
      location: 'Radio Colony Model School',
      status: 'resolved',
    },
    {
      id: 'INC-004',
      severity: 'MEDIUM',
      title: 'Large crowd gathering causing delays',
      location: 'Banasree Model School',
      status: 'resolved',
    },
  ];

  const topPollingCenters = [
    { name: 'Radio Colony Model School', location: 'Sakot', votes: 3450, turnout: '58% turnout' },
    { name: 'Pathaiya', location: 'Sakot', votes: 3100, turnout: '58% turnout' },
    { name: 'Shusujan Zirnat Ali High School', location: 'Sakot', votes: 2890, turnout: '50% turnout' },
    { name: 'Mirza Golan Hafiz College', location: 'Sakot', votes: 2340, turnout: '47% turnout' },
    { name: 'Savar Girls High School', location: 'Sakot', votes: 2200, turnout: '49% turnout' },
  ];

  // Calculate max vote for chart scaling
  const maxVotes = Math.max(...partyVotes.map(p => p.votes));
  const chartHeight = 250;
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SlidingSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-green-600 text-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-green-700 rounded transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <h1 className="text-xl font-bold">Admin Dashboard - AmarVote</h1>
            </div>

            <div className="flex items-center gap-4">
              <NotificationBell />
              <UserProfileControls role="admin" onLogout={handleLogout} />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Total Incidents */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-3xl font-bold text-blue-600">5</span>
              </div>
              <h3 className="text-sm font-medium text-gray-700">Total Incidents</h3>
              <p className="text-xs text-gray-500">2 pending, 2 responded</p>
            </div>

            {/* Red Zone Areas */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <span className="text-3xl font-bold text-red-600">3</span>
              </div>
              <h3 className="text-sm font-medium text-gray-700">Red Zone Areas</h3>
              <p className="text-xs text-gray-500">High/Critical severity</p>
            </div>

            {/* Polling Centers */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-3xl font-bold text-green-600">7</span>
              </div>
              <h3 className="text-sm font-medium text-gray-700">Polling Centers</h3>
              <p className="text-xs text-gray-500">Currently active</p>
            </div>

            {/* Votes Cast */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-3xl font-bold text-purple-600">17,970</span>
              </div>
              <h3 className="text-sm font-medium text-gray-700">Total Voters Cast</h3>
              <p className="text-xs text-gray-500">Across all centers</p>
            </div>
          </div>

          {/* Vote Count by Party Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Vote Count by Party</h2>
            <p className="text-sm text-gray-500 mb-6">Party-wise vote tracking</p>
            
            <div className="flex items-end justify-around h-64 gap-4 pb-8 pt-6">
              {partyVotes.map((party) => {
                const barHeight = (party.votes / maxVotes) * chartHeight;
                return (
                  <div key={party.party} className="flex flex-col items-center flex-1">
                    <div className="w-full bg-gray-200 rounded-t-lg relative" style={{ height: `${chartHeight}px` }}>
                      <div
                        className="w-full rounded-t-lg transition-all duration-300 hover:opacity-80 cursor-pointer"
                        style={{
                          height: `${barHeight}px`,
                          backgroundColor: party.color,
                          position: 'absolute',
                          bottom: 0,
                        }}
                        onMouseMove={(e) => setTooltip({ x: e.clientX, y: e.clientY, content: `${party.party}: ${party.votes.toLocaleString()} votes` })}
                        onMouseLeave={() => setTooltip(null)}
                        onClick={() => router.push(`/dashboard/admin/incidents`)}
                      ></div>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 mt-3">{party.party}</p>
                  </div>
                );
              })}
            </div>

            {tooltip && <ChartTooltip x={tooltip.x} y={tooltip.y}>{tooltip.content}</ChartTooltip>}

            {/* Legend */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-600 mb-3">Vote Count</p>
            </div>
          </div>

          {/* Bottom Section - Incidents and Polling Centers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Incidents */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Incidents</h2>
              
              <div className="space-y-3">
                {recentIncidents.slice(0, 4).map((incident) => (
                  <div key={incident.id} onClick={() => router.push(`/dashboard/admin/incidents/${incident.id}`)} className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        incident.severity === 'CRITICAL' 
                          ? 'bg-red-100 text-red-700' 
                          : incident.severity === 'HIGH'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {incident.severity}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">{incident.title}</p>
                    <p className="text-xs text-gray-500">{incident.location}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Polling Centers */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Polling Centers</h2>
              
              <div className="space-y-3">
                {topPollingCenters.map((center, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{center.name}</p>
                      <p className="text-xs text-gray-500">{center.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{center.votes.toLocaleString()} votes</p>
                      <p className="text-xs text-gray-500">{center.turnout}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
