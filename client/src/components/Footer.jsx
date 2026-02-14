// client/src/components/Footer.jsx
import React from "react";

export default function Footer() {
  return (
    <footer className="mt-12 border-t py-8 text-sm text-gray-600">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <div className="font-semibold">Alumni Connect</div>
          <div className="mt-2">Building lifelong relationships.</div>
        </div>
        <div>
          <div className="font-semibold">Explore</div>
          <ul className="mt-2 space-y-1">
            <li>Directory</li>
            <li>Jobs</li>
            <li>Events</li>
          </ul>
        </div>
        <div>
          <div className="font-semibold">Contact</div>
          <div className="mt-2">alumni@yourschool.edu</div>
        </div>
      </div>
    </footer>
  );
}
