// client/src/pages/Donation.jsx
import React, { useState } from 'react'

export default function Donation() {
  const [amount, setAmount] = useState(1000)
  const [designation, setDesignation] = useState('General Fund')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    // placeholder: your server should handle Razorpay/PayU for India
    // For now just simulate success
    setTimeout(() => {
      setMessage(`धन्यवाद! हमने आपके ₹${amount.toLocaleString('en-IN')} का दान "${designation}" में प्राप्त किया है। (डेमो)`)
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-3 text-gray-900">आज ही दान करें</h1>
        <p className="text-lg text-gray-600">
          छात्रवृत्ति कार्यक्रम, कार्यक्रमों और सामुदायिक कार्यक्रमों का समर्थन करें।
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4">दान की राशि चुनें</label>
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[500, 1000, 2500, 5000].map(a => (
                  <button
                    type="button"
                    key={a}
                    onClick={() => setAmount(a)}
                    className={`p-3 rounded-lg font-semibold transition ${
                      amount === a 
                        ? 'bg-[var(--cardinal)] text-white shadow-md' 
                        : 'border border-gray-300 text-gray-700 hover:border-[var(--cardinal)]'
                    }`}
                  >
                    ₹{a.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-gray-700">अन्य राशि:</label>
                <input
                  type="number"
                  min="100"
                  step="100"
                  value={amount}
                  onChange={e => setAmount(Number(e.target.value))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--cardinal)] w-40"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">दान के लिए निधि चुनें</label>
              <select value={designation} onChange={e => setDesignation(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--cardinal)]">
                <option>General Fund</option>
                <option>Scholarships</option>
                <option>Events</option>
                <option>Mentorship Program</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">ईमेल (रसीद के लिए)</label>
              <input 
                type="email"
                required
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--cardinal)]" 
                placeholder="you@example.com" 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-[var(--cardinal)] text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50 transition text-lg"
            >
              {loading ? 'प्रसंस्करण...' : `₹${amount.toLocaleString('en-IN')} दान करें`}
            </button>

            <p className="text-xs text-gray-500 text-center">यह डेमो है। प्रोडक्शन में Razorpay/PayU को एकीकृत करें।</p>

            {message && <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">{message}</div>}
          </form>
        </div>

        {/* Campaign Cards Sidebar */}
        <div className="space-y-4">
          {/* Campaign 1 */}
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 hover:shadow-lg transition">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">📚</span>
              <h3 className="font-bold text-gray-900">छात्रवृत्ति कोष</h3>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p>लक्ष्य: ₹25,00,000</p>
              <p>जमा: ₹12,50,000</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '50%' }}></div>
              </div>
            </div>
            <button className="mt-4 w-full px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
              योगदान दें
            </button>
          </div>

          {/* Campaign 2 */}
          <div className="bg-purple-50 p-6 rounded-xl border border-purple-200 hover:shadow-lg transition">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">👩‍💼</span>
              <h3 className="font-bold text-gray-900">महिला सशक्तीकरण</h3>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p>लक्ष्य: ₹15,00,000</p>
              <p>जमा: ₹6,75,000</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
            <button className="mt-4 w-full px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition">
              योगदान दें
            </button>
          </div>

          {/* Campaign 3 */}
          <div className="bg-green-50 p-6 rounded-xl border border-green-200 hover:shadow-lg transition">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">💻</span>
              <h3 className="font-bold text-gray-900">Tech Lab Initiative</h3>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p>लक्ष्य: ₹20,00,000</p>
              <p>जमा: ₹8,50,000</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '42.5%' }}></div>
              </div>
            </div>
            <button className="mt-4 w-full px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition">
              योगदान दें
            </button>
          </div>
        </div>
      </div>

      {/* Impact Section */}
      <section className="mt-16 bg-white rounded-2xl p-8 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">आपका दान कहां जाता है?</h2>
        <div className="grid md:grid-cols-4 gap-6 text-center">
          {[
            { number: '5000+', label: 'लाभार्थी' },
            { number: '₹5 Cr+', label: 'कुल दान' },
            { number: '25+', label: 'कार्यक्रम' },
            { number: '10', label: 'शहर' },
          ].map((stat, idx) => (
            <div key={idx}>
              <p className="text-3xl font-bold text-orange-600 mb-2">{stat.number}</p>
              <p className="text-gray-600 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Volunteer Section */}
      <section className="mt-12 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-8 border border-orange-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">🙋 स्वयंसेवी बनें</h2>
        <p className="text-gray-700 mb-6">
          दान देने के अलावा, आप अपना समय और कौशल योगदान कर सकते हैं। शिक्षण, mentoring, event organization, या research में मदद करें।
        </p>
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center gap-2 text-gray-700">
            <span className="text-xl">✏️</span>
            <span>शिक्षण और Mentoring</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <span className="text-xl">📅</span>
            <span>Event Organization</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <span className="text-xl">🔍</span>
            <span>Research और Development</span>
          </div>
        </div>
        <button className="px-6 py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition">
          स्वयंसेवक के रूप में साइन अप करें
        </button>
      </section>
    </div>
  )
}
