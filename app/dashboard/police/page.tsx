'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Users } from 'lucide-react';

export default function PoliceDashboard() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center">
          <button 
            onClick={() => router.push('/')}
            className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Law Enforcement Dashboard</h1>
            <p className="text-sm text-gray-500">Incident Alerts and Response Management</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-red-100 mx-auto mb-6 flex items-center justify-center">
            <Users className="w-10 h-10 text-role-police" strokeWidth={2} />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Law Enforcement Dashboard Coming Soon
          </h2>
          <p className="text-gray-600 mb-8">
            This dashboard will include real-time incident alerts, red-zone notifications,
            <br />
            jurisdiction-based routing, and response coordination tools.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-role-police text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
}
