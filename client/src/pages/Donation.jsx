import React, { useState } from 'react'

const campaigns = [
  {
    name: 'Scholarship Fund',
    target: 2500000,
    raised: 1250000,
    color: 'bg-blue-500'
  },
  {
    name: 'Women in Tech Initiative',
    target: 1500000,
    raised: 675000,
    color: 'bg-rose-500'
  },
  {
    name: 'Advanced Lab Upgrade',
    target: 2000000,
    raised: 850000,
    color: 'bg-emerald-500'
  }
]

export default function Donation() {
  const [amount, setAmount] = useState(1000)
  const [designation, setDesignation] = useState('General Fund')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    setTimeout(() => {
      setMessage(
        `Thank you. We received your demo contribution of INR ${amount.toLocaleString('en-IN')} for "${designation}".`
      )
      setLoading(false)
    }, 900)
  }

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-10 py-10">
      <div className="bg-white rounded-2xl border border-slate-200 p-8">
        <h1 className="text-4xl font-bold text-slate-900">Volunteer and Give Back</h1>
        <p className="mt-3 text-slate-600 max-w-3xl">
          Support scholarships, mentoring programs, and community initiatives at IIT Ropar.
          You can contribute funds or volunteer your time and expertise.
        </p>
      </div>

      <div className="mt-8 grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-4">Choose donation amount</label>
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[500, 1000, 2500, 5000].map((preset) => (
                  <button
                    type="button"
                    key={preset}
                    onClick={() => setAmount(preset)}
                    className={`p-3 rounded-lg font-semibold transition ${
                      amount === preset
                        ? 'bg-[var(--cardinal)] text-white shadow-md'
                        : 'border border-slate-300 text-slate-700 hover:border-[var(--cardinal)]'
                    }`}
                  >
                    INR {preset.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
              <label className="text-sm font-semibold text-slate-700">Custom amount</label>
              <input
                type="number"
                min="100"
                step="100"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="mt-2 w-48 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[var(--cardinal)]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Designation</label>
              <select
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[var(--cardinal)]"
              >
                <option>General Fund</option>
                <option>Scholarships</option>
                <option>Events</option>
                <option>Mentorship Program</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email for receipt</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@iitrpr.ac.in"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[var(--cardinal)]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[var(--cardinal)] text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50 transition"
            >
              {loading ? 'Processing...' : `Contribute INR ${amount.toLocaleString('en-IN')}`}
            </button>

            <p className="text-xs text-slate-500 text-center">
              Demo payment flow. Integrate Razorpay/PayU in production.
            </p>

            {message && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm">
                {message}
              </div>
            )}
          </form>
        </div>

        <div className="space-y-4">
          {campaigns.map((campaign) => {
            const percentage = Math.min(100, Math.round((campaign.raised / campaign.target) * 100))
            return (
              <div key={campaign.name} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <img src="/hero.jpg" alt={campaign.name} className="w-full h-28 object-cover" />
                <div className="p-4">
                  <h3 className="font-bold text-slate-900">{campaign.name}</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Target: INR {campaign.target.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-slate-600">
                    Raised: INR {campaign.raised.toLocaleString('en-IN')}
                  </p>
                  <div className="w-full bg-slate-200 rounded-full h-2 mt-3">
                    <div className={`${campaign.color} h-2 rounded-full`} style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <section className="mt-10 bg-white rounded-2xl border border-slate-200 p-8">
        <h2 className="text-2xl font-bold text-slate-900">Volunteer with IIT Ropar Alumni Network</h2>
        <p className="mt-2 text-slate-600">
          In addition to donations, you can support by mentoring students, organizing events, and helping with research or chapter activities.
        </p>
        <div className="mt-5 grid md:grid-cols-3 gap-4 text-sm text-slate-700">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">Teaching and Mentorship</div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">Event Planning and Execution</div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">Research and Development Support</div>
        </div>
      </section>
    </div>
  )
}
