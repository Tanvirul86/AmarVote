"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, X, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NotificationBell() {
  const router = useRouter();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  // Load real incidents from database
  useEffect(() => {
    const loadIncidents = async () => {
      try {
        const response = await fetch('/api/incidents');
        if (response.ok) {
          const data = await response.json();
          const mappedIncidents = (data.incidents || []).map((inc: any) => ({
            ...inc,
            id: inc._id,
          }));
          setIncidents(mappedIncidents);
        }
      } catch (error) {
        console.error('Error loading incidents:', error);
      }
    };
    loadIncidents();
    // Check for new incidents every 5 seconds
    const interval = setInterval(loadIncidents, 5000);
    return () => clearInterval(interval);
  }, []);

  // Count only Reported incidents (not yet acknowledged)
  const activeCount = incidents.filter(inc => inc.status === 'Reported').length;

  function handleClickNotification(incidentId: string) {
    setOpen(false);
    router.push(`/dashboard/admin/incidents/${incidentId}`);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex items-center gap-2 px-3 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all duration-200"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-white" />
        {activeCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-white text-red-600 text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">{activeCount}</span>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          ></div>
          
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl overflow-hidden z-50">
            <div className="bg-red-600 text-white px-4 py-3 flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Active Incidents</h3>
                <p className="text-xs text-red-100">{activeCount} total incidents</p>
              </div>
              <button onClick={() => setOpen(false)} className="hover:bg-white hover:bg-opacity-20 p-1 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {incidents.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>No incidents reported</p>
                </div>
              ) : (
                incidents
                  .filter(inc => inc.status === 'Reported')
                  .map((incident) => (
                    <div
                      key={incident.id}
                      className="p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleClickNotification(incident.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 ${
                          incident.severity === 'high' || incident.severity === 'critical'
                            ? 'bg-red-600'
                            : incident.severity === 'medium'
                            ? 'bg-orange-500'
                            : 'bg-yellow-500'
                        } rounded-full flex items-center justify-center flex-shrink-0`}>
                          <AlertTriangle className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 text-xs font-bold rounded uppercase ${
                              incident.severity === 'high' || incident.severity === 'critical'
                                ? 'bg-red-100 text-red-700'
                                : incident.severity === 'medium'
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {incident.severity}
                            </span>
                            <span className="text-xs text-gray-500">{incident.id}</span>
                          </div>
                          <p className="font-semibold text-gray-900 text-sm mb-1">{incident.description || incident.type}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>📍 {incident.location}</span>
                            <span>•</span>
                            <span>{new Date(incident.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>

            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 text-center">
              <Link 
                href="/dashboard/admin/incidents" 
                onClick={() => setOpen(false)} 
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                View All Incidents →
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
