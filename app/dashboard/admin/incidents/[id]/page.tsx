'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, MapPin, Clock, User, Image as ImageIcon } from 'lucide-react';
import UserProfileControls from '@/components/shared/UserProfileControls';

// Import Leaflet types
declare global {
  interface Window {
    L: any;
  }
}

export default function IncidentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const incidentId = params.id as string;
  const [status, setStatus] = useState('pending');
  const mapRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const [incident, setIncident] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load incident from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('reportedIncidents');
    if (stored) {
      const incidents = JSON.parse(stored);
      const found = incidents.find((inc: any) => inc.id === incidentId);
      if (found) {
        setIncident({
          ...found,
          severity: found.severity?.toUpperCase() || 'MEDIUM',
          coordinates: found.gpsLocation || found.coordinates || { lat: 23.8103, lng: 90.4125 },
          title: found.title || found.type || 'Incident',
          reportedTime: new Date(found.timestamp).toLocaleString(),
        });
        setStatus(found.status || 'pending');
      }
    }
    setLoading(false);
  }, [incidentId]);

  // Initialize Leaflet map
  useEffect(() => {
    if (typeof window === 'undefined' || !incident) return;

    const loadLeaflet = async () => {
      if (!window.L) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.async = true;
        
        await new Promise((resolve) => {
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }

      if (mapRef.current && window.L && !mapInstanceRef.current) {
        const map = window.L.map(mapRef.current).setView([incident.coordinates.lat, incident.coordinates.lng], 12);

        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        // Add custom marker for the incident
        const color = incident.severity === 'CRITICAL' ? '#dc2626' : 
                     incident.severity === 'HIGH' ? '#ea580c' : '#ca8a04';

        const customIcon = window.L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="position: relative;">
              <div style="
                width: 40px;
                height: 40px;
                background-color: ${color};
                border: 3px solid white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 6px rgba(0,0,0,0.3);
              ">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        window.L.marker([incident.coordinates.lat, incident.coordinates.lng], { icon: customIcon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family: system-ui; padding: 8px;">
              <div style="font-weight: bold; color: ${color}; margin-bottom: 4px;">${incident.id} - ${incident.severity}</div>
              <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">${incident.title}</div>
              <div style="font-size: 12px; color: #666;">
                <div style="margin-bottom: 4px;">📍 ${incident.location}</div>
                <div>📋 Type: ${incident.type}</div>
              </div>
            </div>
          `);

        mapInstanceRef.current = map;
      }
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [incident]);

  const handleStatusUpdate = (newStatus: string) => {
    setStatus(newStatus);
    // In real app, send API request to update status
    console.log(`Updated status to: ${newStatus}`);
  };

  const [headerBg, setHeaderBg] = useState('bg-green-600');
  const [lawEnforcementNotes, setLawEnforcementNotes] = useState<string>('');
  const [fetchedIncidentData, setFetchedIncidentData] = useState<any>(null);

  // Load law enforcement notes from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('reportedIncidents');
    if (stored) {
      const incidents = JSON.parse(stored);
      const found = incidents.find((inc: any) => inc.id === incidentId);
      if (found) {
        setFetchedIncidentData(found);
        setLawEnforcementNotes(found.lawEnforcementNotes || '');
      }
    }
  }, [incidentId]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const u = JSON.parse(raw);
        if (u.role === 'Law Enforcement') setHeaderBg('bg-red-600');
        else if (u.role === 'Presiding Officer') setHeaderBg('bg-blue-600');
        else setHeaderBg('bg-green-600');
      }
    } catch (e) {}
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading incident details...</p>
        </div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-green-600 text-white px-6 py-4 flex items-center justify-between shadow-md">
          <button
            onClick={() => router.back()}
            className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all duration-200"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold">Incident Details</h1>
          <UserProfileControls role="admin" />
        </div>

        <div className="p-6 max-w-4xl mx-auto text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Incident Not Found</h2>
          <button
            onClick={() => router.back()}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className={`${headerBg} text-white px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-green-700 rounded transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold">Incident Details</h1>
              <p className="text-xs text-green-100">{incident.id}</p>
            </div>
          </div>
          <UserProfileControls role="admin" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        {/* Severity and Status Badges */}
        <div className="mb-6 flex gap-2">
          <span className={`px-4 py-2 rounded text-sm font-bold ${
            incident.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' :
            incident.severity === 'HIGH' ? 'bg-orange-100 text-orange-700' :
            'bg-yellow-100 text-yellow-700'
          }`}>
            {incident.severity} SEVERITY
          </span>
          <span className={`px-4 py-2 rounded text-sm font-bold ${
            status === 'resolved' ? 'bg-green-100 text-green-700' :
            status === 'responded' ? 'bg-blue-100 text-blue-700' :
            'bg-yellow-100 text-yellow-700'
          }`}>
            {status.toUpperCase()}
          </span>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Photo and Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photo Evidence */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Photo Evidence</h2>
              </div>
              
              {incident.attachments && incident.attachments.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {incident.attachments.map((file: any, index: number) => (
                    <div key={file.id || index} className="border border-gray-200 rounded-lg overflow-hidden">
                      {file.type?.startsWith('image/') ? (
                        <img 
                          src={file.url} 
                          alt={file.name}
                          className="w-full h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(file.url, '_blank')}
                        />
                      ) : (
                        <div className="h-64 bg-gray-100 flex items-center justify-center">
                          <div className="text-center">
                            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">{file.name}</p>
                            <a 
                              href={file.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 text-xs hover:underline mt-1 inline-block"
                            >
                              View File
                            </a>
                          </div>
                        </div>
                      )}
                      <div className="p-2 bg-gray-50 border-t border-gray-200">
                        <p className="text-xs text-gray-600 truncate">{file.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 font-medium">No photo evidence attached</p>
                    <p className="text-sm text-gray-500 mt-1">No attachments were submitted with this incident</p>
                  </div>
                </div>
              )}
            </div>

            {/* Incident Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Incident Information</h2>
              
              <div className="space-y-5">
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1">Title</p>
                  <p className="text-gray-900 font-semibold">{incident.title}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1">Type</p>
                  <p className="text-gray-900">{incident.type}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1">Description</p>
                  <p className="text-gray-900">{incident.description}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1">Polling Center ID</p>
                  <p className="text-gray-900 font-mono bg-gray-50 px-3 py-2 rounded">
                    {incident.pollingCenterId || incident.location || 'Not specified'}
                  </p>
                </div>
              </div>
            </div>

            {/* Law Enforcement Response - If Available */}
            {lawEnforcementNotes && (
              <div className="bg-red-50 rounded-lg border-2 border-red-300 p-6">
                <h2 className="text-lg font-semibold text-red-900 mb-4">Law Enforcement Response</h2>
                <div className="bg-white rounded p-4 mb-3 border border-red-200">
                  <p className="text-gray-900 whitespace-pre-wrap">{lawEnforcementNotes}</p>
                </div>
                {fetchedIncidentData?.acknowledgedAt && (
                  <p className="text-xs text-red-700">
                    <strong>Acknowledged:</strong> {new Date(fetchedIncidentData.acknowledgedAt).toLocaleString()}<br/>
                    <strong>By:</strong> {fetchedIncidentData.acknowledgedBy || 'Law Enforcement Officer'}
                  </p>
                )}
              </div>
            )}

          </div>

          {/* Right Column - Location and Timeline */}
          <div className="space-y-6">
            {/* Location */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900">Location</h2>
              </div>
              
              <p className="text-gray-900 font-semibold mb-1">{incident.location}</p>
              <p className="text-xs text-gray-500 mb-4">Coordinates: {incident.coordinates.lat}, {incident.coordinates.lng}</p>
              
              <div className="bg-green-50 rounded-lg h-48 border border-gray-200 relative overflow-hidden">
                <div ref={mapRef} className="w-full h-full"></div>
              </div>
            </div>

            {/* Time */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Time</h2>
              </div>
              
              <p className="text-gray-900 font-semibold mb-1">Reported At</p>
              <p className="text-gray-600 text-sm mb-2">{incident.reportedTime}</p>
              <p className="text-sm text-gray-500 font-medium">Time Ago</p>
              <p className="text-gray-600">{incident.timeAgo}</p>
            </div>

            {/* Reported By */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900">Reported By</h2>
              </div>
              
              <p className="text-gray-900 font-semibold">{incident.reportedBy || 'Presiding Officer'}</p>
              <p className="text-sm text-gray-500">{incident.reportedByRole || 'Presiding Officer'}</p>
              {incident.pollingCenterId && (
                <p className="text-xs text-gray-500 mt-2">Polling Center: {incident.pollingCenterId}</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
