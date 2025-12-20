'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, Upload, MapPin, AlertTriangle } from 'lucide-react';

export default function OfficerDashboard() {
  const router = useRouter();
  const [incidentTitle, setIncidentTitle] = useState('');
  const [incidentType, setIncidentType] = useState('');
  const [severityLevel, setSeverityLevel] = useState('MEDIUM');
  const [description, setDescription] = useState('');
  const [pollingCenterId, setPollingCenterId] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 10 * 1024 * 1024) { // 10MB limit
      setPhotoFile(file);
    } else {
      alert('File size must be less than 10MB');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.size <= 10 * 1024 * 1024) {
      setPhotoFile(file);
    } else {
      alert('File size must be less than 10MB');
    }
  };

  const getGPSLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          alert('Unable to retrieve location: ' + error.message);
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Submit logic will be implemented later
    console.log({
      incidentTitle,
      incidentType,
      severityLevel,
      description,
      pollingCenterId,
      location,
      photoFile,
    });
    alert('Incident report submitted successfully!');
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? All data will be lost.')) {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center">
          <button 
            onClick={() => router.back()}
            className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Report Incident</h1>
            <p className="text-sm text-gray-500">Presiding Officer</p>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Photo Evidence Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Camera className="w-5 h-5 text-gray-600 mr-2" />
              <h2 className="text-base font-medium text-gray-900">
                Photo Evidence 
                <span className="text-gray-400 font-normal ml-2">(Optional)</span>
              </h2>
            </div>
            
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                isDragging 
                  ? 'border-primary-green bg-green-50' 
                  : 'border-gray-300 bg-gray-50'
              }`}
            >
              <input
                type="file"
                id="photo-upload"
                accept="image/png, image/jpeg, image/jpg"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <label htmlFor="photo-upload" className="cursor-pointer">
                <div className="flex flex-col items-center">
                  <Upload className="w-12 h-12 text-gray-400 mb-4" />
                  {photoFile ? (
                    <div>
                      <p className="text-gray-700 font-medium">{photoFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(photoFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-600 mb-1">Click to upload photo</p>
                      <p className="text-sm text-gray-400">PNG, JPG up to 10MB</p>
                    </>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Incident Details Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-base font-medium text-gray-900 mb-6">Incident Details</h2>
            
            <div className="space-y-5">
              {/* Incident Title */}
              <div>
                <label htmlFor="incident-title" className="block text-sm font-medium text-gray-700 mb-2">
                  Incident Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="incident-title"
                  type="text"
                  value={incidentTitle}
                  onChange={(e) => setIncidentTitle(e.target.value)}
                  placeholder="Brief description of the incident"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent"
                  required
                />
              </div>

              {/* Incident Type */}
              <div>
                <label htmlFor="incident-type" className="block text-sm font-medium text-gray-700 mb-2">
                  Incident Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="incident-type"
                  value={incidentType}
                  onChange={(e) => setIncidentType(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent bg-white"
                  required
                >
                  <option value="">Select incident type...</option>
                  <option value="voter-intimidation">Voter Intimidation</option>
                  <option value="ballot-stuffing">Ballot Stuffing</option>
                  <option value="equipment-failure">Equipment Failure</option>
                  <option value="violence">Violence</option>
                  <option value="fraud">Fraud</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Severity Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Severity Level <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-4 gap-3">
                  <button
                    type="button"
                    onClick={() => setSeverityLevel('LOW')}
                    className={`py-2.5 px-4 rounded-lg border-2 font-medium transition-colors ${
                      severityLevel === 'LOW'
                        ? 'border-gray-400 bg-gray-50 text-gray-700'
                        : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    LOW
                  </button>
                  <button
                    type="button"
                    onClick={() => setSeverityLevel('MEDIUM')}
                    className={`py-2.5 px-4 rounded-lg border-2 font-medium transition-colors ${
                      severityLevel === 'MEDIUM'
                        ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                        : 'border-gray-300 bg-white text-gray-600 hover:border-yellow-400'
                    }`}
                  >
                    MEDIUM
                  </button>
                  <button
                    type="button"
                    onClick={() => setSeverityLevel('HIGH')}
                    className={`py-2.5 px-4 rounded-lg border-2 font-medium transition-colors ${
                      severityLevel === 'HIGH'
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-300 bg-white text-gray-600 hover:border-orange-400'
                    }`}
                  >
                    HIGH
                  </button>
                  <button
                    type="button"
                    onClick={() => setSeverityLevel('CRITICAL')}
                    className={`py-2.5 px-4 rounded-lg border-2 font-medium transition-colors ${
                      severityLevel === 'CRITICAL'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-300 bg-white text-gray-600 hover:border-red-400'
                    }`}
                  >
                    CRITICAL
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed description of what happened"
                  rows={5}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent resize-none"
                  required
                />
              </div>

              {/* Polling Center ID */}
              <div>
                <label htmlFor="polling-center" className="block text-sm font-medium text-gray-700 mb-2">
                  Polling Center ID <span className="text-red-500">*</span>
                </label>
                <input
                  id="polling-center"
                  type="text"
                  value={pollingCenterId}
                  onChange={(e) => setPollingCenterId(e.target.value)}
                  placeholder="e.g., DHK-PS-001"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-primary-green mr-2" />
                <h2 className="text-base font-medium text-gray-900">Location</h2>
              </div>
              <button
                type="button"
                onClick={getGPSLocation}
                className="flex items-center px-4 py-2 bg-primary-green text-white rounded-lg hover:bg-emerald-600 transition-colors"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Get GPS Location
              </button>
            </div>

            {location ? (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Auto-detected location</p>
                <p className="text-sm text-gray-500">
                  Coordinates: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </p>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Click "Get GPS Location" to auto-detect your location</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 py-3 px-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <AlertTriangle className="w-5 h-5 mr-2" />
              Submit Incident Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
