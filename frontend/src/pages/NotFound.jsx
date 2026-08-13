import React from 'react';
import { SearchX } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const NotFound = () => {
    const navigate = useNavigate();
    
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
            <SearchX className="w-20 h-20 text-slate-400 mb-6" />
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Page Not Found</h1>
            <p className="text-slate-500 text-lg mb-8 max-w-md text-center">
                We couldn't find the page you're looking for. It might have been moved or deleted.
            </p>
            <div className="flex space-x-4">
                <button 
                    onClick={() => navigate(-1)}
                    className="px-6 py-3 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                >
                    Go Back
                </button>
                <Link 
                    to="/login"
                    className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    Go Home
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
