'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, MapPin, Clock, User, Image as ImageIcon } from 'lucide-react';
import UserProfileControls from '@/components/shared/UserProfileControls';

// Import Leaflet types
declare global {
  interface Window {
    L: any;
  }
}

export default function IncidentDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [status, setStatus] = useState('pending');
  const mapRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);

  // Mock incident data - in real app, fetch from API based on params.id
  const incidentData = {
    'INC-001': {
      id: 'INC-001',
      title: 'Voter intimidation reported',
      type: 'Intimidation',
      severity: 'HIGH',
      division: 'Dhaka',
      location: 'Dhaka-10, Mirpur Polling Station',
      coordinates: { lat: 23.8103, lng: 90.4125 },
      description: 'Group of individuals preventing voters from entering polling station',
      pollingCenterId: 'DHK-PS-19',
      status: 'pending',
      reportedTime: 'Dec 20, 2025, 3:15 PM',
      timeAgo: '744 minutes ago',
      reportedBy: 'Officer Rahman',
      reportedByRole: 'Presiding Officer',
      photoEvidence: '/images/incident-1.jpg',
    },
    'INC-002': {
      id: 'INC-002',
      title: 'Ballot box tampering attempt',
      type: 'Tampering',
      severity: 'CRITICAL',
      division: 'Chittagong',
      location: 'Chittagong-5, Agrabad Station',
      coordinates: { lat: 22.3569, lng: 91.7832 },
      description: 'Unauthorized person found ballot boxes',
      pollingCenterId: 'CHT-PS-42',
      status: 'responded',
      reportedTime: 'Dec 20, 2025, 4:30 PM',
      timeAgo: '630 minutes ago',
      reportedBy: 'Officer Hassan',
      reportedByRole: 'Presiding Officer',
      photoEvidence: '/images/incident-2.jpg',
    },
    'INC-003': {
      id: 'INC-003',
      title: 'Technical malfunction - EVM',
      type: 'Technical',
      severity: 'MEDIUM',
      division: 'Rajshahi',
      location: 'Rajshahi-3, Boalia Thana',
      coordinates: { lat: 24.3745, lng: 88.6042 },
      description: 'Electronic voting machine stopped working, backup system activated',
      pollingCenterId: 'RAJ-PS-08',
      status: 'resolved',
      reportedTime: 'Dec 20, 2025, 2:00 PM',
      timeAgo: '875 minutes ago',
      reportedBy: 'Officer Khan',
      reportedByRole: 'Presiding Officer',
      photoEvidence: '/images/incident-3.jpg',
    },
  };

  // Get incident from mock data
  type IncidentKey = 'INC-001' | 'INC-002' | 'INC-003';
  const incident = incidentData[params.id as IncidentKey] || incidentData['INC-001'];

  // Initialize Leaflet map
  useEffect(() => {
    if (typeof window === 'undefined') return;

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
      const found = incidents.find((inc: any) => inc.id === params.id);
      if (found) {
        setFetchedIncidentData(found);
        setLawEnforcementNotes(found.lawEnforcementNotes || '');
      }
    }
  }, [params.id]);

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
              
              <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 font-medium">Photo evidence from incident</p>
                  <p className="text-sm text-gray-500 mt-1">{incident.photoEvidence}</p>
                </div>
              </div>
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
                  <p className="text-gray-900 font-mono bg-gray-50 px-3 py-2 rounded">{incident.pollingCenterId}</p>
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

            {/* Update Status */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h2>
              
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => handleStatusUpdate('pending')}
                  className={`px-6 py-2 rounded font-medium transition-colors ${
                    status === 'pending'
                      ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                      : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  Mark as Pending
                </button>
                <button
                  onClick={() => handleStatusUpdate('responded')}
                  className={`px-6 py-2 rounded font-medium transition-colors ${
                    status === 'responded'
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  Mark as Responded
                </button>
                <button
                  onClick={() => handleStatusUpdate('resolved')}
                  className={`px-6 py-2 rounded font-medium transition-colors ${
                    status === 'resolved'
                      ? 'bg-green-100 text-green-700 border border-green-300'
                      : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  Mark as Resolved
                </button>
              </div>
            </div>
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
              
              <p className="text-gray-900 font-semibold">{incident.reportedBy}</p>
              <p className="text-sm text-gray-500">{incident.reportedByRole}</p>
            </div>

            {/* Status Timeline */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Status Timeline</h2>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                    <div className="w-1 flex-1 bg-gray-300 my-2"></div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Resolved</p>
                    <p className="text-xs text-gray-500">Final status</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                    <div className="w-1 flex-1 bg-gray-300 my-2"></div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Responded</p>
                    <p className="text-xs text-gray-500">Under action</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Pending</p>
                    <p className="text-xs text-gray-500">Awaiting response</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
