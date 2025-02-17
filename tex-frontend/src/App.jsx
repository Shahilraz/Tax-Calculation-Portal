import React, { useState } from 'react';
import axios from 'axios';

export default function App() {
  const [inputs, setInputs] = useState({
    annualIncome: '',
    investments: '',
    otherDeductions: '',
    otherIncome: ''
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('https://tax-calculation-portall.onrender.com', {
        annualIncome: Number(inputs.annualIncome),
        investments: Number(inputs.investments),
        otherDeductions: Number(inputs.otherDeductions),
        otherIncome: Number(inputs.otherIncome)
      });
      setResult(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Calculation failed');
    } finally {
      setLoading(false);
    }
  };

  const formatLabel = (key) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^\w/, c => c.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-blue-600 p-6 text-white">
          <h1 className="text-3xl font-bold text-center">Tax Calculator</h1>
          <p className="text-blue-100 text-center mt-2">Calculate your Indian income tax easily</p>
        </div>
        
        <div className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {Object.entries(inputs).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {formatLabel(key)}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">₹</span>
                  </div>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setInputs({...inputs, [key]: e.target.value})}
                    className="block w-full pl-8 pr-3 py-3 border-gray-300 bg-gray-50 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder={`Enter your ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                    required
                  />
                </div>
              </div>
            ))}
            
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all duration-300 ${
                loading 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-200'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : 'Calculate Tax'}
            </button>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <svg className="h-6 w-6 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="text-red-700 text-sm">{error}</div>
            </div>
          )}
          
          {result && (
            <div className="mt-6 rounded-2xl overflow-hidden shadow">
              <div className="bg-blue-600 py-3 px-6">
                <h2 className="text-xl font-semibold text-white">Tax Details</h2>
              </div>
              <div className="p-6 bg-gray-50">
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <p className="text-gray-600 text-sm mb-1">Taxable Income</p>
                  <p className="text-xl font-medium">₹{result.taxableIncome.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Total Tax Payable</p>
                  <p className="text-2xl font-bold text-blue-700">₹{result.taxPayable.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
          
          <p className="text-gray-500 text-xs mt-6 text-center">
            Tax calculations are based on the Indian Income Tax Act for FY 2024-25. This is for informational purposes only.
          </p>
        </div>
      </div>
    </div>
  );
}