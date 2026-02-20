import React from "react";
import { Link } from "react-router-dom";
import banner from "../assets/alumni-banner.jpg";
export default function About() {
  return (
    <div className="px-10 py-16 text-slate-900 max-w-5xl mx-auto">
      <h1 className="text-5xl font-bold mb-8 text-slate-800">
        About Alumni Connect
      </h1>

      <p className="text-lg leading-relaxed mb-6">
        Alumni Connect is more than just a platform — it is a bridge between
        ambition and experience. Designed to connect students with verified alumni,
        the portal creates meaningful opportunities for mentorship, collaboration,
        and professional growth.
      </p>

      <p className="text-lg leading-relaxed mb-6">
        We believe that the strength of an institution lies in its community.
        By bringing together current students and accomplished alumni, we foster
        knowledge sharing, career guidance, and long-term professional relationships.
      </p>
<div className="relative my-12 rounded-xl shadow-md hover:shadow-xl transition duration-300 overflow-hidden">
  <img
    src={banner}
    alt="Graduation Celebration"
    className="w-full h-[380px] object-cover rounded-2xl"
  />

  <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
    <div className="text-center px-6">
      <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
        Celebrating Success. Building Futures.
      </h2>
      <p className="text-lg text-gray-200">
        A community that continues beyond graduation.
      </p>
    </div>
  </div>
</div>
      <div className="mt-10 grid md:grid-cols-2 gap-8">
<div className="p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition duration-300">
          <h2 className="text-2xl font-semibold mb-3"> Our Mission</h2>
          <p>
            To empower students with real-world insights, mentorship,
            and networking opportunities that accelerate their personal
            and professional journey.
          </p>
        </div>

       <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition duration-300">
          <h2 className="text-2xl font-semibold mb-3"> Our Vision</h2>
          <p>
            To build a lifelong alumni ecosystem where collaboration,
            innovation, and support extend far beyond graduation.
          </p>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-3xl font-semibold mb-4">What We Offer</h2>
        <ul className="list-disc list-inside space-y-2 text-lg">
          <li>Verified alumni mentorship programs</li>
          <li>Career guidance and industry insights</li>
          <li>Professional networking opportunities</li>
          <li>Community-driven events and collaborations</li>
        </ul>
      </div>
<div className="mt-16">
  <h2 className="text-3xl font-semibold mb-8 text-center">
    Our Impact
  </h2>

  <div className="grid md:grid-cols-3 gap-8 text-center">
    
    <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition duration-300">
     <h3 className="text-4xl font-extrabold text-slate-800">500+</h3>
      <p className="mt-2 text-lg">Active Alumni</p>
    </div>

    <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition duration-300">
      <h3 className="text-4xl font-extrabold text-slate-800">1000+</h3>
      <p className="mt-2 text-lg">Registered Students</p>
    </div>

    <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition duration-300">
      <h3 className="text-4xl font-extrabold text-slate-800">50+</h3>
      <p className="mt-2 text-lg">Events Conducted</p>
    </div>

  </div>
</div>
<div className="mt-16 text-center">
  <h2 className="text-2xl font-semibold mb-6">
    Ready to be part of the Alumni Network?
  </h2>

  <Link
    to="/register"
    className="px-8 py-3 bg-slate-900 text-white rounded-lg ..."
  >
    Join the Community
  </Link>
</div>
    </div>
  );
}