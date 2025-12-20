import Link from 'next/link';
import ShieldIcon from '@/components/ShieldIcon';
import { Shield, Users, UserCheck } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header Section */}
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        {/* Logo and Title */}
        <div className="flex items-center justify-center mb-6">
          <ShieldIcon className="w-12 h-12 mr-3" color="#10b981" />
          <h1 className="text-5xl font-bold text-primary-green">AmarVote</h1>
        </div>

        {/* Subtitle */}
        <h2 className="text-2xl text-gray-600 font-medium mb-4">
          Secure Election Monitoring & Management System
        </h2>

        {/* Description */}
        <p className="text-gray-500 text-lg max-w-3xl mx-auto">
          Real-time incident tracking, vote management, and automated alerts for transparent elections
        </p>
      </div>

      {/* Role Cards Section */}
      <div className="max-w-6xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* BEC Admin Card */}
          <Link href="/login?role=admin" className="block">
            <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 p-8 text-center cursor-pointer group">
              <div className="w-20 h-20 rounded-full bg-primary-green-light mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-10 h-10 text-primary-green" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-semibold text-primary-green mb-3">
                BEC Admin
              </h3>
              <p className="text-gray-500">
                Full system access and monitoring
              </p>
            </div>
          </Link>

          {/* Presiding Officer Card */}
          <Link href="/login?role=officer" className="block">
            <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 p-8 text-center cursor-pointer group">
              <div className="w-20 h-20 rounded-full bg-blue-100 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <UserCheck className="w-10 h-10 text-role-officer" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-semibold text-role-officer mb-3">
                Presiding Officer
              </h3>
              <p className="text-gray-500">
                Report incidents and submit votes
              </p>
            </div>
          </Link>

          {/* Law Enforcement Card */}
          <Link href="/login?role=police" className="block">
            <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 p-8 text-center cursor-pointer group">
              <div className="w-20 h-20 rounded-full bg-red-100 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Users className="w-10 h-10 text-role-police" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-semibold text-role-police mb-3">
                Law Enforcement
              </h3>
              <p className="text-gray-500">
                Receive alerts and respond to incidents
              </p>
            </div>
          </Link>

        </div>

        {/* Security Notice Banner */}
        <div className="bg-warning-bg border border-yellow-300 rounded-lg p-4 text-center">
          <p className="text-warning-text">
            <span className="mr-2">🔒</span>
            <strong>Secure Role-Based Access Control (RBAC)</strong>
            <br />
            All actions are logged and monitored for election transparency
          </p>
        </div>
      </div>
    </div>
  );
}
