import React from 'react'

const collections = [
  {
    title: 'Career Playbooks',
    description: 'Interview prep, resume templates, referral strategy, and transition guides.',
    link: '#',
    image: '/hero.jpg'
  },
  {
    title: 'Higher Studies Toolkit',
    description: 'GRE/TOEFL resources, SOP examples, and alumni profiles from global universities.',
    link: '#',
    image: '/image.png'
  },
  {
    title: 'Startup and Research Hub',
    description: 'Founder stories, funding resources, and collaborative research opportunities.',
    link: '#',
    image: '/hero.jpg'
  }
]

const quickLinks = [
  'Digital Library Access',
  'Recorded Webinars',
  'Industry Reports',
  'Mentor Office Hours',
  'Campus to Corporate Guide',
  'Alumni Magazine'
]

export default function Resources() {
  return (
    <div className="max-w-6xl mx-auto px-6 md:px-10 py-10">
      <section className="bg-white rounded-2xl border border-slate-200 p-8">
        <h1 className="text-4xl font-bold text-slate-900">Resources and Library</h1>
        <p className="mt-3 text-slate-600 max-w-3xl">
          Curated resources for students and alumni: career development, higher education, entrepreneurship, and lifelong learning.
        </p>
      </section>

      <section className="mt-8 grid md:grid-cols-3 gap-6">
        {collections.map((item) => (
          <article key={item.title} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
            <img src={item.image} alt={item.title} className="w-full h-36 object-cover" />
            <div className="p-5">
              <h2 className="text-xl font-bold text-slate-900">{item.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{item.description}</p>
              <a href={item.link} className="inline-block mt-4 text-[var(--cardinal)] font-semibold hover:underline">
                Explore Collection
              </a>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-8 bg-white rounded-2xl border border-slate-200 p-8">
        <h3 className="text-2xl font-bold text-slate-900">Quick Access</h3>
        <div className="mt-4 grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {quickLinks.map((item) => (
            <button
              key={item}
              className="text-left px-4 py-3 rounded-lg border border-slate-200 hover:border-[var(--cardinal)] hover:bg-red-50 transition"
            >
              {item}
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
