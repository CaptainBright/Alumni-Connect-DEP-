// client/src/components/AlumniCard.jsx
import React from "react";

export default function AlumniCard({ alumni }) {
  // alumni: { full_name, avatar_url, role, company, branch, graduation_year, created_at, linkedin }
  return (
    <article
      className="bg-white rounded-2xl p-4 shadow-soft-lg border overflow-hidden transition-transform duration-200 hover:-translate-y-0.5"
      style={{ borderColor: "rgba(11,11,13,0.04)" }}
    >
      <div className="flex items-center gap-4">
        <img
          src={alumni?.avatar_url || "/default-avatar.png"}
          alt={alumni?.full_name || "avatar"}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div className="flex-1">
          <h3 className="text-sm font-semibold">{alumni?.full_name || "Unnamed"}</h3>
          <p className="text-xs text-gray-500">
            {alumni?.role} {alumni?.company ? `• ${alumni.company}` : ""}
          </p>
          <p className="mt-2 text-sm text-gray-600">
            {alumni?.branch || ""} {alumni?.graduation_year ? `• class of ${alumni.graduation_year}` : ""}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex gap-2">
          <a
            href={alumni?.linkedin || "#"}
            target="_blank"
            rel="noreferrer"
            className="text-sm px-3 py-1 rounded-md border"
          >
            LinkedIn
          </a>
          <button className="text-sm px-3 py-1 rounded-md bg-[var(--cardinal)] text-white">Connect</button>
        </div>
        <div className="text-xs text-gray-400">
          {alumni?.created_at ? new Date(alumni.created_at).toLocaleDateString() : ""}
        </div>
      </div>
    </article>
  );
}
