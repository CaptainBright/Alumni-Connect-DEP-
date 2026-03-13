import React from 'react'
import { Link } from 'react-router-dom'
import Hero from '../components/Hero'

const featuredCards = [
  {
    title: 'AI and Industry Outlook',
    subtitle: 'Research and Innovation',
    text: 'Alumni leaders share practical trends in AI, product engineering, and applied data science.',
    image: '/Aitrends.png',
    cta: 'Read article',
    link: '/resources'
  },
  {
    title: 'Leadership in Career Transitions',
    subtitle: 'Alumni Magazine',
    text: 'A formal reflection on how alumni planned transitions, upskilled, and returned stronger.',
    image: '/magazine.png',
    cta: 'Read feature',
    link: '/resources'
  },
  {
    title: 'Community Spotlight',
    subtitle: 'Global Chapters',
    text: 'Regional alumni chapters report mentoring circles, outreach initiatives, and annual meets.',
    image: '/collegecommunity.png',
    cta: 'View highlights',
    link: '/directory'
  }
]

const engagementCards = [
  {
    title: 'Career Connections',
    subtitle: 'Professional Growth',
    text: 'Discover referrals, internships, and roles shared by verified alumni across industries.',
    cta: 'Explore opportunities',
    link: '/jobs',
    image: '/carreer.png'
  },
  {
    title: 'Student Mentorship',
    subtitle: 'Guided Learning',
    text: 'Access mentor support for internships, higher studies planning, and interview preparation.',
    cta: 'Explore mentorship',
    link: '/resources',
    image: '/students.png'
  },
  {
    title: 'Alumni Network',
    subtitle: 'Community Building',
    text: 'Participate in city, domain, and interest communities that keep alumni connected year-round.',
    cta: 'Join communities',
    link: '/directory',
    image: '/collegecommunity.png'
  }
]

const impactStats = [
  {
    label: 'Verified Alumni',
    value: '500+'
  },
  {
    label: 'Registered Students',
    value: '1000+'
  },
  {
    label: 'Mentorship Interactions',
    value: '1500+'
  },
  {
    label: 'Annual Community Events',
    value: '50+'
  }
]

export default function Home() {
  return (
    <div>
      <Hero />

      <main className="max-w-[1240px] mx-auto px-6 md:px-10 pb-14">
        <section className="mt-14">
          <div className="text-center">
            <p className="home-copy uppercase tracking-[0.24em] text-xs text-[var(--cardinal)]">Featured Updates</p>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 home-heading mt-2">Stories and Perspectives</h2>
            <p className="home-copy mt-3 text-slate-600 max-w-3xl mx-auto">
              A formal snapshot of alumni achievements, research insights, and campus-linked initiatives.
            </p>
          </div>

          <div className="mt-8 grid lg:grid-cols-3 md:grid-cols-2 gap-7">
            {featuredCards.map((card) => (
              <article key={card.title} className="group relative overflow-hidden rounded-xl border border-slate-200 min-h-[390px] fade-up-card">
                <img src={card.image} alt={card.title} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10" />

                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[var(--cardinal)] p-5 text-white hover-reveal-panel">
                  <div className="h-full flex flex-col">
                    <p className="home-copy text-[11px] uppercase tracking-[0.2em] text-white/90">{card.subtitle}</p>
                    <h3 className="text-2xl font-bold leading-tight mt-2 home-heading">{card.title}</h3>
                    <p className="home-copy text-sm mt-3 text-white/95">{card.text}</p>
                    <Link to={card.link} className="home-copy mt-4 inline-block font-semibold underline underline-offset-4">
                      {card.cta}
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <div className="text-center">
            <p className="home-copy uppercase tracking-[0.24em] text-xs text-[var(--cardinal)]">Engagement Tracks</p>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 home-heading mt-2">Programs With Purpose</h2>
            <p className="home-copy mt-3 text-slate-600">Structured opportunities to connect, mentor, and advance together.</p>
          </div>

          <div className="mt-8 grid lg:grid-cols-3 md:grid-cols-2 gap-7">
            {engagementCards.map((card) => (
              <article key={card.title} className="group relative overflow-hidden rounded-xl border border-slate-200 min-h-[390px] fade-up-card">
                <img src={card.image} alt={card.title} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10" />

                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[var(--cardinal)] p-5 text-white hover-reveal-panel">
                  <div className="h-full flex flex-col">
                    <p className="home-copy text-[11px] uppercase tracking-[0.2em] text-white/90">{card.subtitle}</p>
                    <h3 className="text-2xl font-bold leading-tight mt-2 home-heading">{card.title}</h3>
                    <p className="home-copy mt-3 text-sm text-white/95">{card.text}</p>
                    <Link to={card.link} className="home-copy inline-block mt-4 font-semibold underline underline-offset-4">
                      {card.cta}
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16 bg-[#0f1720] text-white rounded-2xl p-8 md:p-10 overflow-hidden">
          <p className="home-copy text-sm uppercase tracking-widest text-sky-300 text-center">More from Alumni Connect</p>
          <h2 className="text-center text-4xl md:text-5xl font-bold home-heading mt-2">Other Features Available</h2>
          <p className="home-copy text-center text-white/80 mt-4 max-w-3xl mx-auto">
            Beyond stories and programs, the portal offers practical features designed for long-term student-alumni collaboration.
          </p>

          <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <article className="bg-black/35 border border-white/10 rounded-lg p-5">
              <h3 className="text-2xl font-bold home-heading">Verified Alumni Directory</h3>
              <p className="home-copy mt-2 text-white/85">Search by batch, domain, company, and location to find relevant alumni quickly.</p>
            </article>
            <article className="bg-black/35 border border-white/10 rounded-lg p-5">
              <h3 className="text-2xl font-bold home-heading">Mentorship Requests</h3>
              <p className="home-copy mt-2 text-white/85">Students can request guidance for internships, higher studies, and placements.</p>
            </article>
            <article className="bg-black/35 border border-white/10 rounded-lg p-5">
              <h3 className="text-2xl font-bold home-heading">Job and Referral Board</h3>
              <p className="home-copy mt-2 text-white/85">Alumni can post openings and referral opportunities for verified community members.</p>
            </article>
            <article className="bg-black/35 border border-white/10 rounded-lg p-5">
              <h3 className="text-2xl font-bold home-heading">Events and Reunions</h3>
              <p className="home-copy mt-2 text-white/85">Track institution events, chapter meets, webinars, and reunion announcements.</p>
            </article>
            <article className="bg-black/35 border border-white/10 rounded-lg p-5">
              <h3 className="text-2xl font-bold home-heading">Resource Library</h3>
              <p className="home-copy mt-2 text-white/85">Access curated readings, preparation resources, and alumni-authored insights.</p>
            </article>
            <article className="bg-black/35 border border-white/10 rounded-lg p-5">
              <h3 className="text-2xl font-bold home-heading">Announcements and Updates</h3>
              <p className="home-copy mt-2 text-white/85">Stay informed with official notices, initiatives, and community milestones.</p>
            </article>
          </div>

          <div className="mt-6 grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {impactStats.map((item) => (
              <article key={item.label} className="bg-black/40 border border-white/10 rounded-lg p-4">
                <p className="home-copy text-xs uppercase tracking-[0.18em] text-white/75">{item.label}</p>
                <h3 className="text-3xl font-bold mt-2 home-heading">{item.value}</h3>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
