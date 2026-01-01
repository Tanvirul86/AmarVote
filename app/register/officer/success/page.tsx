import Link from 'next/link';
import { Check } from 'lucide-react';

export default function OfficerRegistrationSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center border-2 border-blue-400/30" style={{ boxShadow: '0 0 40px rgba(59, 130, 246, 0.3)' }}>
        {/* Success Icon */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-blue-500 rounded-full mx-auto flex items-center justify-center shadow-lg ring-4 ring-blue-100">
            <Check className="w-10 h-10 text-white" strokeWidth={3} />
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-2xl font-bold text-blue-600 mb-4">
          Application Submitted!
        </h1>
        <p className="text-gray-500 text-base leading-relaxed mb-8">
          Your presiding officer application has been submitted for admin approval. You will be notified once your account is verified.
        </p>

        {/* Back to Home Button */}
        <Link href="/">
          <button className="bg-blue-500 text-white font-semibold py-3 px-10 rounded-full hover:bg-blue-600 transition-colors duration-200 shadow-md">
            Back to Home
          </button>
        </Link>
      </div>
    </div>
  );
}
