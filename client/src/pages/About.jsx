import React, { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  BadgeCheck,
  Briefcase,
  CalendarDays,
  Globe2,
  Handshake,
  Library,
  Mail,
  MapPin,
  Target,
  UserPlus,
  Wrench
} from 'lucide-react'
import banner from '../assets/alumni-banner.jpg'

const faqs = [
  {
    question: 'Who can register on Alumni Connect?',
    answer: 'Current IIT Ropar students, alumni, and authorized administrators can register. Student and alumni accounts require verification and approval.'
  },
  {
    question: 'How is profile approval handled?',
    answer: 'After OTP verification, profile details are reviewed by admins to ensure authenticity before full platform access is granted.'
  },
  {
    question: 'Can students directly contact alumni?',
    answer: 'Yes. After approval, students can use directory and mentorship spaces to connect with alumni for career and academic guidance.'
  },
  {
    question: 'How do I get support for account issues?',
    answer: 'You can email the support team at support.alumni@iitrpr.ac.in or write to the admin office listed in the contact section below.'
  }
]

const impactStats = [
  { value: '5000+', label: 'Alumni' },
  { value: '1200+', label: 'Connections' },
  { value: '300+', label: 'Mentorship Sessions' },
  { value: '150+', label: 'Events' }
]

const featureCards = [
  {
    title: 'Alumni Mentorship',
    description: 'Verified alumni mentorship and student guidance channels.',
    icon: Handshake
  },
  {
    title: 'Career Opportunities',
    description: 'Career opportunities, referrals, and internship visibility.',
    icon: Briefcase
  },
  {
    title: 'Community Events',
    description: 'Community events and alumni chapter engagement.',
    icon: CalendarDays
  },
  {
    title: 'Learning Resources',
    description: 'Institution updates, stories, and resources for professional growth.',
    icon: Library
  }
]

const platformSteps = [
  { title: 'Register', description: 'Create your account with IIT Ropar details.' },
  { title: 'Get Verified', description: 'Complete verification and admin review.' },
  { title: 'Connect with Alumni', description: 'Access directory, mentorship, and communities.' },
  { title: 'Grow Your Career', description: 'Explore opportunities, events, and guidance.' }
]

export default function About() {
  const location = useLocation()

  useEffect(() => {
    if (!location.hash) return
    const id = location.hash.replace('#', '')
    const el = document.getElementById(id)
    if (el) {
      setTimeout(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 50)
    }
  }, [location.hash])

  useEffect(() => {
    const revealNodes = document.querySelectorAll('[data-reveal]')
    if (!revealNodes.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.16 }
    )

    revealNodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="bg-slate-50 text-slate-900">
      <section className="relative h-[420px] flex items-center justify-center text-center overflow-hidden">
        <img
          src={banner}
          alt="IIT Ropar Alumni Connect"
          className="absolute inset-0 w-full h-full object-cover scale-105 transition-transform duration-[4000ms]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/70" />
        <div className="relative z-10 text-white px-6 animate-fade-in-up">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 hero-title">About Alumni Connect</h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto text-gray-200">
            Connecting IIT Ropar students and alumni to build lifelong professional relationships.
          </p>
          <Link
            to="/register"
            className="inline-flex mt-8 px-8 py-3.5 rounded-lg bg-[#8C1515] text-white font-semibold hover:bg-[#6A0F0F] hover:-translate-y-1 transition-all duration-300"
          >
            Join the Community
          </Link>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 md:px-10 py-14 space-y-14">
        <section data-reveal className="reveal">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-800 hero-title">A Trusted IIT Ropar Alumni Platform</h2>
          <p className="text-lg leading-relaxed mb-4">
            Alumni Connect is IIT Ropar&apos;s formal community platform that links students, alumni, and administrators in one trusted
            space. It supports mentorship, professional networking, and institution-led collaboration.
          </p>
          <p className="text-lg leading-relaxed">
            The portal is designed to strengthen long-term relationships between graduates and campus stakeholders through verified
            profiles, structured programs, and meaningful engagement opportunities.
          </p>
        </section>

        <section data-reveal className="reveal py-2">
          <div className="grid md:grid-cols-4 gap-6 text-center">
            {impactStats.map((item) => (
              <article
                key={item.label}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6"
              >
                <h3 className="text-4xl font-bold text-[#8C1515]">{item.value}</h3>
                <p className="text-gray-600 mt-1">{item.label}</p>
              </article>
            ))}
          </div>
        </section>

        <section data-reveal className="reveal">
          <div className="grid md:grid-cols-2 gap-6">
            <article className="p-7 bg-white/85 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-200">
              <div className="w-11 h-11 rounded-full bg-red-100 text-[#8C1515] flex items-center justify-center mb-4">
                <Target size={20} />
              </div>
              <h2 className="text-2xl font-semibold mb-3">Our Mission</h2>
              <p>
                To empower students with real-world guidance through verified alumni mentorship, networking, and practical exposure to
                professional pathways.
              </p>
            </article>

            <article className="p-7 bg-white/85 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-200">
              <div className="w-11 h-11 rounded-full bg-blue-100 text-[#1F2A44] flex items-center justify-center mb-4">
                <Globe2 size={20} />
              </div>
              <h2 className="text-2xl font-semibold mb-3">Our Vision</h2>
              <p>
                To create a lifelong and responsible alumni ecosystem where learning, collaboration, and institutional contribution
                continue across generations.
              </p>
            </article>
          </div>
        </section>

        <section data-reveal className="reveal">
          <h2 className="text-3xl font-semibold mb-6">What We Offer</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featureCards.map((item) => {
              const Icon = item.icon
              return (
                <article
                  key={item.title}
                  className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-200"
                >
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-red-100 text-[#8C1515] mb-4">
                    <Icon size={21} />
                  </div>
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <p className="text-sm text-gray-600 mt-2">{item.description}</p>
                </article>
              )
            })}
          </div>
        </section>

        <section data-reveal className="reveal">
          <h2 className="text-3xl font-semibold mb-6">How the Platform Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {platformSteps.map((step, idx) => (
              <article key={step.title} className="relative p-5 bg-white rounded-xl shadow-lg border border-slate-200">
                {idx < platformSteps.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-[calc(50%+22px)] w-[calc(100%-36px)] h-[2px] bg-slate-300" />
                )}
                <div className="w-11 h-11 rounded-full bg-[#1F2A44] text-white flex items-center justify-center font-bold mb-4">
                  {idx + 1}
                </div>
                <h3 className="font-semibold text-lg">{step.title}</h3>
                <p className="text-sm text-slate-600 mt-2">{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section data-reveal className="reveal">
          <h2 className="text-3xl font-semibold mb-6">Contact Details</h2>
          <div className="grid md:grid-cols-2 gap-5">
            <article className="bg-white border border-slate-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300">
              <h3 className="text-xl font-semibold">Alumni Relations Office</h3>
              <div className="mt-4 space-y-3 text-slate-700">
                <p className="flex items-start gap-2">
                  <MapPin size={18} className="mt-0.5 text-[#8C1515]" />
                  <span>IIT Ropar, Rupnagar, Punjab 140001</span>
                </p>
                <p className="flex items-start gap-2">
                  <Mail size={18} className="mt-0.5 text-[#8C1515]" />
                  <a className="hover:text-[#8C1515]" href="mailto:alumni@iitrpr.ac.in">
                    alumni@iitrpr.ac.in
                  </a>
                </p>
                <p className="flex items-start gap-2">
                  <Wrench size={18} className="mt-0.5 text-[#8C1515]" />
                  <a className="hover:text-[#8C1515]" href="mailto:support.alumni@iitrpr.ac.in">
                    support.alumni@iitrpr.ac.in
                  </a>
                </p>
              </div>
            </article>
            <article className="bg-white border border-slate-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300">
              <h3 className="text-xl font-semibold">Technical Support</h3>
              <div className="mt-4 space-y-3 text-slate-700">
                <p className="flex items-start gap-2">
                  <Wrench size={18} className="mt-0.5 text-[#1F2A44]" />
                  <span>For login, registration, and profile approval support</span>
                </p>
                <p className="flex items-start gap-2">
                  <Mail size={18} className="mt-0.5 text-[#1F2A44]" />
                  <a className="hover:text-[#8C1515]" href="mailto:portalhelp@iitrpr.ac.in">
                    portalhelp@iitrpr.ac.in
                  </a>
                </p>
                <p className="flex items-start gap-2">
                  <BadgeCheck size={18} className="mt-0.5 text-[#1F2A44]" />
                  <span>Hours: Monday to Friday, 9:00 AM - 5:30 PM IST</span>
                </p>
              </div>
            </article>
          </div>
        </section>

        <section data-reveal className="reveal">
          <h2 className="text-3xl font-semibold mb-4">FAQs</h2>
          <div className="space-y-3">
            {faqs.map((item) => (
              <details
                key={item.question}
                className="group bg-white border border-slate-200 rounded-lg p-5 shadow-md hover:shadow-lg transition-all duration-300"
              >
                <summary className="list-none font-semibold cursor-pointer flex justify-between items-center gap-3">
                  <span>{item.question}</span>
                  <span className="text-[#8C1515] text-xl leading-none transition-transform duration-300 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <div className="max-h-0 overflow-hidden group-open:max-h-40 transition-all duration-300 ease-in-out">
                  <p className="pt-3 text-slate-700">{item.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </section>

        <section
          id="terms-and-conditions"
          data-reveal
          className="reveal scroll-mt-28 bg-white border border-slate-200 rounded-xl p-7 shadow-md"
        >
          <h2 className="text-3xl font-semibold mb-4">Terms and Conditions</h2>
          <ul className="list-disc list-inside space-y-3 text-slate-700">
            <li>Users must provide accurate registration details and maintain profile authenticity.</li>
            <li>Account approval is subject to administrative verification and institutional policy checks.</li>
            <li>Platform content must be used only for professional, academic, and community purposes.</li>
            <li>Harassment, impersonation, or misuse of alumni/student data is strictly prohibited.</li>
            <li>Contact details shared on the platform should not be used for unsolicited marketing.</li>
            <li>Users are responsible for safeguarding credentials and reporting suspicious access.</li>
            <li>By registering, you consent to institutional communication related to alumni activities.</li>
          </ul>
        </section>

        <section data-reveal className="reveal text-center py-4">
          <h2 className="text-3xl font-bold mb-6">Ready to be part of the Alumni Network?</h2>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-10 py-4 bg-[#8C1515] text-white rounded-lg text-lg hover:bg-[#6A0F0F] transition-all duration-300 hover:-translate-y-1 shadow-lg"
          >
            <UserPlus size={20} />
            Join the Community
          </Link>
        </section>
      </div>

      <style>{`
        .reveal {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 700ms ease, transform 700ms ease;
        }
        .reveal.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .animate-fade-in-up {
          animation: fadeUp 700ms ease forwards;
        }
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
