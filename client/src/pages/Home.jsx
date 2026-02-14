import React from 'react'
import { Link } from 'react-router-dom'
import Hero from '../components/Hero'

const sections = [
  {
    id: 1,
    icon: '📚',
    title: 'Stories & Updates',
    description: 'News, views, and perspectives from our community. Read inspiring stories of alumni making an impact in their fields.',
    link: '/resources',
    buttonText: 'Read Stories'
  },
  {
    id: 2,
    icon: '🎓',
    title: 'Events & Reunions',
    description: 'Calling All Batch Mates! Join reunion celebrations, network events, and gatherings across India and globally.',
    link: '/events',
    buttonText: 'View Events'
  },
  {
    id: 3,
    icon: '🧠',
    title: 'Learning & Insights',
    description: 'Access webinars, courses, and resources for career growth, skill development, and professional networking.',
    link: '/resources',
    buttonText: 'Explore Learning'
  },
  {
    id: 4,
    icon: '👥',
    title: 'Community & Groups',
    description: 'Connect with alumni in your city, industry, or interest group. Stay connected with classmates worldwide.',
    link: '/directory',
    buttonText: 'Browse Community'
  },
  {
    id: 5,
    icon: '💼',
    title: 'Career Connections',
    description: 'Discover job opportunities, internships, and mentorship programs posted by alumni and partner companies.',
    link: '/jobs',
    buttonText: 'View Opportunities'
  },
  {
    id: 6,
    icon: '❤️',
    title: 'Giving & Impact',
    description: 'Support scholarships, initiatives, and programs. Make a meaningful difference in student and alumni lives.',
    link: '/donation',
    buttonText: 'Donate Now'
  },
]

const announcements = [
  {
    icon: '📢',
    title: 'Calling All Batch Mates!',
    description: 'Reunion celebrations 2026 are set! Connect with your batch and relive golden memories.',
    highlight: 'Join Now'
  },
  {
    icon: '🌟',
    title: 'Foundation Day Celebration',
    description: 'Annual gathering featuring keynote talks from industry leaders and networking sessions.',
    highlight: 'Learn More'
  },
  {
    icon: '🚀',
    title: 'Startup Mentorship Program',
    description: 'Get mentored by successful alumni entrepreneurs. Perfect for aspiring founders.',
    highlight: 'Apply Now'
  },
]

export default function Home(){
  return (
    <div>
      <Hero />
      <main className="max-w-6xl mx-auto px-6 md:px-10 pb-12">
        {/* Welcome Section */}
        <section className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-12 -mt-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Welcome Home</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            Step into the virtual home of our global community — a place where the spirit of excellence thrives beyond campus borders. 
            Reconnect with classmates, discover opportunities, and stay up-to-date on the latest insights and innovations from our alumni network.
          </p>
          <p className="text-gray-600 italic">
            Here to help you connect, learn, and grow every step of the way.
          </p>
        </section>

        {/* Announcements */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Important Announcements</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {announcements.map((ann, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition">
                <div className="text-4xl mb-3">{ann.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{ann.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{ann.description}</p>
                <button className="text-[var(--cardinal)] font-semibold text-sm hover:underline">{ann.highlight} →</button>
              </div>
            ))}
          </div>
        </section>

        {/* Services Grid */}
        <section className="mb-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Programming With a Purpose</h2>
            <p className="text-gray-600 text-lg">Everything you need to stay connected and grow</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map(section => (
              <div key={section.id} className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition">
                <div className="text-4xl mb-3">{section.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{section.title}</h3>
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">{section.description}</p>
                <Link 
                  to={section.link}
                  className="inline-block bg-[var(--cardinal)] text-white font-semibold py-2 px-4 rounded-lg text-sm hover:opacity-90 transition"
                >
                  {section.buttonText} →
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Travel & Experiences */}
        <section className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 mb-12 border border-blue-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Travel & Experiences</h2>
          <p className="text-gray-700 mb-6">
            Discover curated travel experiences designed for our global community. From exploring cultural heritage to adventure trips, 
            create unforgettable memories with fellow alumni. Family adventures available with special programs for children.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { dates: 'Mar 15 - Mar 22, 2026', location: '🇮🇳 Kashmir Valley', desc: 'Himalayan trek with alumni community' },
              { dates: 'Apr 10 - Apr 18, 2026', location: '🇯🇵 Japan', desc: 'Cultural immersion & technology exploration' },
              { dates: 'May 5 - May 12, 2026', location: '🇪🇺 European Circuit', desc: 'Historical sites & networking events' },
            ].map((trip, idx) => (
              <div key={idx} className="bg-white p-4 rounded-lg border border-gray-200">
                <p className="font-semibold text-gray-900">{trip.dates}</p>
                <p className="text-lg font-bold text-[var(--cardinal)] my-2">{trip.location}</p>
                <p className="text-sm text-gray-600">{trip.desc}</p>
              </div>
            ))}
          </div>
          <button className="mt-6 px-6 py-2 bg-[var(--cardinal)] text-white font-semibold rounded-lg hover:opacity-90 transition">
            Explore All Trips →
          </button>
        </section>

        {/* Quick Links */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-green-50 p-6 rounded-xl border border-green-200">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Alumni Perks & Benefits</h3>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>✓ Alumni email access</li>
              <li>✓ Career resources & mentorship</li>
              <li>✓ Insurance & financial services</li>
              <li>✓ Exclusive discounts</li>
            </ul>
            <button className="mt-4 text-[var(--cardinal)] font-semibold text-sm hover:underline">See all benefits →</button>
          </div>
          
          <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Magazine & Publications</h3>
            <p className="text-gray-700 text-sm mb-3">Read the latest issue featuring alumni stories, research insights, and class notes from around the world.</p>
            <button className="text-[var(--cardinal)] font-semibold text-sm hover:underline">Read Magazine →</button>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-[var(--cardinal)] to-red-700 text-white rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold mb-3">Not Yet Connected?</h2>
          <p className="text-lg mb-6">Join thousands of alumni and be part of our thriving community</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-[var(--cardinal)] font-bold py-3 px-6 rounded-lg hover:shadow-lg transition">
              Create Account
            </Link>
            <Link to="/login" className="border-2 border-white text-white font-bold py-3 px-6 rounded-lg hover:bg-white/10 transition">
              Sign In
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
