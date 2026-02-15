import React from 'react'
import { Link } from 'react-router-dom'
import Hero from '../components/Hero'

const storyCards = [
  {
    title: 'AI Trends and Industry Outlook',
    subtitle: 'IIT Ropar Alumni Insights',
    text: 'Learn how alumni in AI and data science are shaping practical innovation across domains.',
    image: '/hero.jpg',
    cta: 'Read article'
  },
  {
    title: 'Pressing Pause',
    subtitle: 'Alumni Magazine',
    text: 'Six alumni share why they stepped out, recalibrated, and came back stronger.',
    image: '/image.png',
    cta: 'Read feature'
  }
]

const purposeCards = [
  {
    title: 'Career Connections',
    text: 'Find referrals, internships, and jobs posted by alumni in top companies.',
    cta: 'See career resources',
    link: '/jobs',
    image: '/hero.jpg'
  },
  {
    title: 'Students',
    text: 'Get support with mentorship, preparation, and real-world guidance from seniors.',
    cta: 'Explore student programs',
    link: '/resources',
    image: '/image.png'
  },
  {
    title: 'Community',
    text: 'Join groups by city, domain, and interests to stay connected with your network.',
    cta: 'Discover groups',
    link: '/directory',
    image: '/hero.jpg'
  }
]

const travelCards = [
  {
    title: 'Italy',
    date: 'Jun 21 - Jun 29',
    desc: 'Family heritage and architecture learning trip with alumni.',
    image: '/hero.jpg'
  },
  {
    title: 'China',
    date: 'Jun 21 - Jul 02',
    desc: 'Innovation-focused route with culture, history, and community.',
    image: '/image.png'
  },
  {
    title: 'Mexico',
    date: 'Jul 11 - Jul 19',
    desc: 'Arts, local traditions, and alumni-led exploration for families.',
    image: '/hero.jpg'
  }
]

export default function Home() {
  return (
    <div>
      <Hero />

      <main className="max-w-6xl mx-auto px-6 md:px-10 pb-14">
        <section className="mt-14">
          <div className="text-center">
            <h2 className="text-5xl font-bold text-slate-900 hero-title">Stories</h2>
            <p className="mt-3 text-slate-600">News, views, and perspectives from the IIT Ropar alumni community.</p>
          </div>

          <div className="mt-8 grid md:grid-cols-3 gap-6">
            {storyCards.map((card, index) => (
              <article
                key={card.title}
                className={`bg-white border border-slate-200 overflow-hidden fade-up-card ${index === 0 ? 'float-soft' : 'float-soft-delay'}`}
              >
                <img src={card.image} alt={card.title} className="w-full h-44 object-cover" />
                <div className="p-5">
                  <h3 className="text-2xl font-bold text-slate-900 leading-tight">{card.title}</h3>
                  <p className="text-xs uppercase tracking-wide text-slate-500 mt-1">{card.subtitle}</p>
                  <p className="text-sm text-slate-700 mt-3">{card.text}</p>
                  <button className="mt-4 text-[var(--cardinal)] font-semibold hover:underline">{card.cta}</button>
                </div>
              </article>
            ))}

            <article className="bg-[var(--cardinal)] text-white p-6 flex flex-col justify-end min-h-[360px] fade-up-card">
              <h3 className="text-4xl font-bold leading-tight">Alumni Magazine</h3>
              <p className="text-2xl font-semibold mt-1">Winter 2026</p>
              <p className="mt-4 text-sm text-white/90">
                Explore the latest issue featuring alumni stories, research notes, and campus updates.
              </p>
              <button className="mt-4 text-white font-semibold underline underline-offset-4">Read now</button>
            </article>
          </div>
        </section>

        <section className="mt-16">
          <div className="text-center">
            <h2 className="text-5xl font-bold text-slate-900 hero-title">Programming With a Purpose</h2>
            <p className="mt-3 text-slate-600">Special opportunities to connect, learn, and grow at every stage.</p>
          </div>

          <div className="mt-8 space-y-6">
            {purposeCards.map((card) => (
              <article key={card.title} className="grid md:grid-cols-[300px_1fr] bg-white border border-slate-300 overflow-hidden fade-up-card">
                <img src={card.image} alt={card.title} className="w-full h-52 md:h-full object-cover" />
                <div className="p-6">
                  <h3 className="text-4xl font-bold text-slate-900 hero-title">{card.title}</h3>
                  <p className="mt-2 text-slate-700">{card.text}</p>
                  <Link to={card.link} className="inline-block mt-5 text-[var(--cardinal)] font-semibold hover:underline">
                    {card.cta}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16 bg-[#0f1720] text-white rounded-2xl p-8 md:p-10 overflow-hidden">
          <p className="text-sm uppercase tracking-widest text-sky-300 text-center">Travel and Study</p>
          <h2 className="text-center text-5xl font-bold hero-title mt-2">Skip the Screen Time. Bring on the Gelato.</h2>
          <p className="text-center text-white/80 mt-4 max-w-3xl mx-auto">
            Alumni family adventures designed for every generation. Learn through culture, history, and local experiences.
          </p>

          <div className="mt-8 grid md:grid-cols-3 gap-6">
            {travelCards.map((trip, idx) => (
              <article key={trip.title} className={`bg-black/35 border border-white/10 overflow-hidden ${idx % 2 ? 'float-soft-delay' : 'float-soft'}`}>
                <img src={trip.image} alt={trip.title} className="w-full h-40 object-cover" />
                <div className="p-4">
                  <div className="inline-block bg-black/70 px-3 py-1 rounded-full text-xs">{trip.date}</div>
                  <h3 className="text-3xl font-bold mt-3 hero-title">{trip.title}</h3>
                  <p className="text-sm text-white/85 mt-2">{trip.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
