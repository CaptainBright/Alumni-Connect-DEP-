import React, { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
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

  return (
    <div className="px-6 md:px-10 py-14 text-slate-900 max-w-6xl mx-auto">
      <h1 className="text-4xl md:text-5xl font-bold mb-6 text-slate-800 hero-title">About Alumni Connect</h1>

      <p className="text-lg leading-relaxed mb-4">
        Alumni Connect is IIT Ropar&apos;s formal community platform that links students, alumni, and administrators in one trusted space.
        It supports mentorship, professional networking, and institution-led collaboration.
      </p>
      <p className="text-lg leading-relaxed mb-8">
        The portal is designed to strengthen long-term relationships between graduates and campus stakeholders through verified profiles,
        structured programs, and meaningful engagement opportunities.
      </p>

      <div className="relative my-10 rounded-2xl shadow-md overflow-hidden">
        <img src={banner} alt="Graduation Celebration" className="w-full h-[340px] md:h-[400px] object-cover" />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center px-6">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-3 hero-title">Celebrating Success. Building Futures.</h2>
            <p className="text-base md:text-lg text-gray-200">A lifelong IIT Ropar network beyond graduation.</p>
          </div>
        </div>
      </div>

      <div className="mt-10 grid md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-xl shadow-md border border-slate-200">
          <h2 className="text-2xl font-semibold mb-3">Our Mission</h2>
          <p>
            To empower students with real-world guidance through verified alumni mentorship, networking, and practical exposure to
            professional pathways.
          </p>
        </div>

        <div className="p-6 bg-white rounded-xl shadow-md border border-slate-200">
          <h2 className="text-2xl font-semibold mb-3">Our Vision</h2>
          <p>
            To create a lifelong and responsible alumni ecosystem where learning, collaboration, and institutional contribution continue
            across generations.
          </p>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="text-3xl font-semibold mb-4">What We Offer</h2>
        <ul className="list-disc list-inside space-y-2 text-lg">
          <li>Verified alumni mentorship and student guidance channels</li>
          <li>Career opportunities, referrals, and internship visibility</li>
          <li>Community events and alumni chapter engagement</li>
          <li>Institution updates, stories, and resources for professional growth</li>
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-3xl font-semibold mb-6">Contact Details</h2>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-xl font-semibold">Alumni Relations Office</h3>
            <p className="mt-2">IIT Ropar, Rupnagar, Punjab 140001</p>
            <p className="mt-1">Email: alumni@iitrpr.ac.in</p>
            <p className="mt-1">Support: support.alumni@iitrpr.ac.in</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-xl font-semibold">Technical Support</h3>
            <p className="mt-2">For login, registration, and profile approval support:</p>
            <p className="mt-1">Email: portalhelp@iitrpr.ac.in</p>
            <p className="mt-1">Hours: Monday to Friday, 9:00 AM - 5:30 PM IST</p>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-3xl font-semibold mb-4">FAQs</h2>
        <div className="space-y-3">
          {faqs.map((item) => (
            <details key={item.question} className="bg-white border border-slate-200 rounded-lg p-4">
              <summary className="font-semibold cursor-pointer">{item.question}</summary>
              <p className="mt-3 text-slate-700">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section id="terms-and-conditions" className="mt-12 bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="text-3xl font-semibold mb-4">Terms and Conditions</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Users must provide accurate registration details and maintain profile authenticity.</li>
          <li>Account approval is subject to administrative verification and institutional policy checks.</li>
          <li>Platform content must be used only for professional, academic, and community purposes.</li>
          <li>Harassment, impersonation, or misuse of alumni/student data is strictly prohibited.</li>
          <li>Contact details shared on the platform should not be used for unsolicited marketing.</li>
          <li>Users are responsible for safeguarding credentials and reporting suspicious access.</li>
          <li>By registering, you consent to institutional communication related to alumni activities.</li>
        </ul>
      </section>

      <div className="mt-14 text-center">
        <h2 className="text-2xl font-semibold mb-6">Ready to be part of the Alumni Network?</h2>
        <Link to="/register" className="px-8 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition">
          Join the Community
        </Link>
      </div>
    </div>
  )
}
