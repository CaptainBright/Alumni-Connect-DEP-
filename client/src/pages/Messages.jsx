import React from 'react';

export default function Messages() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm max-w-md w-full">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Messaging Centers</h1>
                <p className="text-slate-500 font-medium mb-8">This feature is currently under construction. Check back soon for direct messaging updates!</p>
                <button
                    onClick={() => window.history.back()}
                    className="w-full py-3 bg-[var(--cardinal)] text-white font-bold rounded-xl shadow-md shadow-red-200 hover:bg-red-800 transition-all"
                >
                    Go Back
                </button>
            </div>
        </div>
    );
}
