'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import UserProfileControls from '@/components/shared/UserProfileControls';
import { ArrowLeft, AlertTriangle, MapPin, Clock, User, X, Image as ImageIcon } from 'lucide-react';

export default function PoliceIncidentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const incidentId = params.id as string;

  const [incident, setIncident] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAcknowledgeModal, setShowAcknowledgeModal] = useState(false);
  const [handlingNotes, setHandlingNotes] = useState('');
  const [hasAcknowledged, setHasAcknowledged] = useState(false);
  const [fetchedIncidentData, setFetchedIncidentData] = useState<any>(null);

  // Mock incidents data
  const mockIncidentsData: Record<string, any> = {
    'INC-001': {
      id: 'INC-001',
      severity: 'HIGH',
      title: 'Group of individuals preventing voters from entering polling station',
      location: 'Azad Adda High School',
      status: 'pending',
      description: 'Multiple individuals blocking the entrance with aggressive behavior',
      reportedBy: 'Officer Rahman',
      reportedByRole: 'Presiding Officer',
      timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
      type: 'Intimidation',
      pollingCenterId: 'DHK-PS-19',
      coordinates: { lat: 23.8103, lng: 90.4125 },
    },
    'INC-002': {
      id: 'INC-002',
      severity: 'CRITICAL',
      title: 'Unauthorized person found ballot boxes',
      location: 'Pathaiya',
      status: 'responded',
      description: 'Suspicious individual attempting to access ballot box storage',
      reportedBy: 'Officer Khan',
      reportedByRole: 'Presiding Officer',
      timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
      type: 'Tampering',
      pollingCenterId: 'CHT-PS-42',
      coordinates: { lat: 22.3569, lng: 91.7832 },
    },
    'INC-003': {
      id: 'INC-003',
      severity: 'MEDIUM',
      title: 'Electronic voting machine stopped working, backup system activated',
      location: 'Radio Colony Model School',
      status: 'resolved',
      description: 'EVM malfunction resolved by technical support',
      reportedBy: 'Officer Ali',
      reportedByRole: 'Presiding Officer',
      timestamp: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
      type: 'Technical',
      pollingCenterId: 'RAJ-PS-08',
      coordinates: { lat: 24.3745, lng: 88.6042 },
    },
    'INC-004': {
      id: 'INC-004',
      severity: 'MEDIUM',
      title: 'Large crowd gathering causing delays',
      location: 'Banasree Model School',
      status: 'resolved',
      description: 'Crowd management completed, voting resumed',
      reportedBy: 'Officer Hassan',
      reportedByRole: 'Presiding Officer',
      timestamp: new Date(Date.now() - 3 * 60 * 60000).toISOString(),
      type: 'Crowd Control',
      pollingCenterId: 'DHK-PS-25',
      coordinates: { lat: 23.5, lng: 90.5 },
    },
    'INC-005': {
      id: 'INC-005',
      severity: 'HIGH',
      title: 'Voter intimidation attempts reported',
      location: 'Shusujan Zirnat Ali High School',
      status: 'responded',
      description: 'Multiple voters reporting intimidation near polling center',
      reportedBy: 'Officer Rahim',
      reportedByRole: 'Presiding Officer',
      timestamp: new Date(Date.now() - 90 * 60000).toISOString(),
      type: 'Intimidation',
      pollingCenterId: 'DHK-PS-30',
      coordinates: { lat: 23.6, lng: 90.6 },
    },
    'INC-006': {
      id: 'INC-006',
      severity: 'LOW',
      title: 'Lost and found - Voter ID document',
      location: 'Mirza Golan Hafiz College',
      status: 'resolved',
      description: 'Voter ID document found and returned to owner',
      reportedBy: 'Officer Hassan',
      reportedByRole: 'Presiding Officer',
      timestamp: new Date(Date.now() - 4 * 60 * 60000).toISOString(),
      type: 'Lost & Found',
      pollingCenterId: 'DHK-PS-35',
      coordinates: { lat: 23.7, lng: 90.7 },
    },
    'INC-007': {
      id: 'INC-007',
      severity: 'CRITICAL',
      title: 'Armed individuals spotted near polling center',
      location: 'Savar Girls High School',
      status: 'pending',
      description: 'Armed suspect seen in vicinity of polling station',
      reportedBy: 'Officer Ali',
      reportedByRole: 'Presiding Officer',
      timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
      type: 'Security Threat',
      pollingCenterId: 'DHK-PS-40',
      coordinates: { lat: 23.8, lng: 90.8 },
    },
    'INC-008': {
      id: 'INC-008',
      severity: 'HIGH',
      title: 'Technical issue - Voter list system offline',
      location: 'Sakot Central Hub',
      status: 'acknowledged',
      description: 'Voter verification system temporarily down',
      reportedBy: 'System Admin',
      reportedByRole: 'System Administrator',
      timestamp: new Date(Date.now() - 5 * 60 * 60000).toISOString(),
      type: 'Technical',
      pollingCenterId: 'DHK-HUB-01',
      coordinates: { lat: 23.9, lng: 90.9 },
    },
  };

  useEffect(() => {
    // Try to load from localStorage first
    const stored = localStorage.getItem('reportedIncidents');
    if (stored) {
      const incidents = JSON.parse(stored);
      const found = incidents.find((inc: any) => inc.id === incidentId);
      if (found) {
        setIncident(found);
        setFetchedIncidentData(found);
        setHandlingNotes(found.lawEnforcementNotes || '');
        setHasAcknowledged(found.status === 'acknowledged');
        setLoading(false);
        return;
      }
    }

    // Use mock data
    const mockIncident = mockIncidentsData[incidentId];
    if (mockIncident) {
      setIncident(mockIncident);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [incidentId]);

  const handleAcknowledge = () => {
    if (!incident) return;

    if (handlingNotes.trim().length === 0) {
      alert('Please add handling notes before acknowledging');
      return;
    }

    const wordCount = handlingNotes.trim().split(/\s+/).filter(word => word.length > 0).length;
    if (wordCount > 100) {
      alert('Handling notes must be 100 words or less');
      return;
    }

    // Update incident with law enforcement notes
    const updatedIncident = {
      ...incident,
      status: 'acknowledged',
      lawEnforcementNotes: handlingNotes,
      acknowledgedAt: new Date().toISOString(),
      acknowledgedBy: 'Law Enforcement Officer',
    };

    // Update localStorage
    const stored = localStorage.getItem('reportedIncidents');
    if (stored) {
      const incidents = JSON.parse(stored);
      const index = incidents.findIndex((inc: any) => inc.id === incidentId);
      if (index !== -1) {
        incidents[index] = updatedIncident;
        localStorage.setItem('reportedIncidents', JSON.stringify(incidents));
      }
    }

    setIncident(updatedIncident);
    setFetchedIncidentData(updatedIncident);
    setHasAcknowledged(true);
    setShowAcknowledgeModal(false);
    alert('Incident acknowledged successfully!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading incident details...</p>
        </div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-red-600 text-white px-6 py-4 flex items-center justify-between shadow-md">
          <button
            onClick={() => router.back()}
            className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all duration-200"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold">Incident Details</h1>
          <UserProfileControls role="police" showEditProfile={true} />
        </div>

        <div className="p-6 max-w-4xl mx-auto text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Incident Not Found</h2>
          <button
            onClick={() => router.back()}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-700';
      case 'HIGH': return 'bg-orange-100 text-orange-700';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-700';
      case 'LOW': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const wordCount = handlingNotes.trim().split(/\s+/).filter(word => word.length > 0).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-red-600 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-red-700 rounded transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold">Incident Details</h1>
              <p className="text-xs text-red-100">{incident.id}</p>
            </div>
          </div>
          <UserProfileControls role="police" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        {/* Severity and Status Badges */}
        <div className="mb-6 flex gap-2">
          <span className={`px-4 py-2 rounded text-sm font-bold ${getSeverityBg(incident.severity)}`}>
            {incident.severity} SEVERITY
          </span>
          <span className={`px-4 py-2 rounded text-sm font-bold ${
            incident.status === 'acknowledged' ? 'bg-green-100 text-green-700' :
            incident.status === 'resolved' ? 'bg-green-100 text-green-700' :
            incident.status === 'responded' ? 'bg-blue-100 text-blue-700' :
            'bg-yellow-100 text-yellow-700'
          }`}>
            {incident.status.toUpperCase()}
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
            {fetchedIncidentData?.lawEnforcementNotes && (
              <div className="bg-red-50 rounded-lg border-2 border-red-300 p-6">
                <h2 className="text-lg font-semibold text-red-900 mb-4">Law Enforcement Response</h2>
                <div className="bg-white rounded p-4 mb-3 border border-red-200">
                  <p className="text-gray-900 whitespace-pre-wrap">{fetchedIncidentData.lawEnforcementNotes}</p>
                </div>
                {fetchedIncidentData?.acknowledgedAt && (
                  <p className="text-xs text-red-700">
                    <strong>Acknowledged:</strong> {new Date(fetchedIncidentData.acknowledgedAt).toLocaleString()}<br/>
                    <strong>By:</strong> {fetchedIncidentData.acknowledgedBy || 'Law Enforcement Officer'}
                  </p>
                )}
              </div>
            )}

            {/* Acknowledge Incident Button */}
            {!hasAcknowledged && (
              <button
                onClick={() => setShowAcknowledgeModal(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Acknowledge Incident & Add Notes
              </button>
            )}
          </div>

          {/* Right Column - Location and Timeline */}
          <div className="space-y-6">
            {/* Location */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-red-600" />
                <h2 className="text-lg font-semibold text-gray-900">Location</h2>
              </div>
              
              <p className="text-gray-900 font-semibold mb-1">{incident.location}</p>
              <p className="text-xs text-gray-500 mb-4">Coordinates: {incident.coordinates.lat}, {incident.coordinates.lng}</p>
            </div>

            {/* Time */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Time</h2>
              </div>
              
              <p className="text-gray-900 font-semibold mb-1">Reported At</p>
              <p className="text-gray-600 text-sm">{new Date(incident.timestamp).toLocaleString()}</p>
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

            {/* Status Badge */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Status</h2>
              <div className={`px-4 py-3 rounded-lg text-center font-semibold capitalize ${
                incident.status === 'acknowledged' ? 'bg-green-100 text-green-700' :
                incident.status === 'resolved' ? 'bg-green-100 text-green-700' :
                incident.status === 'responded' ? 'bg-blue-100 text-blue-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {incident.status}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Acknowledge Modal */}
      {showAcknowledgeModal && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowAcknowledgeModal(false)}
          ></div>

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto shadow-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Acknowledge Incident</h2>
                <button
                  onClick={() => setShowAcknowledgeModal(false)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900">
                  <strong>Incident:</strong> {incident.title}
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Please describe how you handled this incident or what action was taken.
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Handling Notes (Max 100 words)
                  <span className="text-xs text-gray-500 ml-2">
                    {wordCount > 0 && `${wordCount}/100 words`}
                  </span>
                </label>
                <textarea
                  value={handlingNotes}
                  onChange={(e) => setHandlingNotes(e.target.value)}
                  placeholder="Describe the actions taken, resolution, or current status of handling this incident..."
                  maxLength={400}
                  rows={5}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    wordCount > 100
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-red-500'
                  }`}
                />
                {wordCount > 100 && (
                  <p className="text-xs text-red-600 mt-1">⚠️ Notes exceed 100 words limit</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAcknowledgeModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAcknowledge}
                  disabled={wordCount > 100 || handlingNotes.trim().length === 0}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2 rounded-lg transition-colors"
                >
                  Acknowledge & Save
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
