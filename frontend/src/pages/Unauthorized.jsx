import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
            <ShieldAlert className="w-20 h-20 text-red-500 mb-6" />
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Access Denied</h1>
            <p className="text-slate-500 text-lg mb-8 max-w-md text-center">
                You do not have permission to access this resource. Please contact your administrator if you believe this is a mistake.
            </p>
            <Link 
                to="/login"
                className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
                Return to Login
            </Link>
        </div>
    );
};

export default Unauthorized;
