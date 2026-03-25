import React from 'react';
import { Briefcase, GraduationCap, ChevronRight, Award } from 'lucide-react';

// Render simple placeholder activity updates of Alumni
const dummyActivities = [
  {
    id: 1,
    name: 'Priya Patel',
    avatar: 'https://i.pravatar.cc/150?img=32',
    action: 'Started a new position as Software Engineer at Google',
    time: '2h ago',
    icon: <Briefcase className="w-4 h-4 text-blue-600" />,
    bg: 'bg-blue-50'
  },
  {
    id: 2,
    name: 'Rahul Desai',
    avatar: 'https://i.pravatar.cc/150?img=11',
    action: 'Is looking to hire 3 SDE Interns for Atlassian',
    time: '5h ago',
    icon: <Award className="w-4 h-4 text-amber-600" />,
    bg: 'bg-amber-50'
  },
  {
    id: 3,
    name: 'Aditi Sharma',
    avatar: 'https://i.pravatar.cc/150?img=47',
    action: 'Began Ph.D. in Computer Science at MIT',
    time: '1d ago',
    icon: <GraduationCap className="w-4 h-4 text-emerald-600" />,
    bg: 'bg-emerald-50'
  }
];

export default function AlumniActivityPanel() {
  return (
    <div className="flex flex-col h-full bg-slate-50 border-l border-slate-200">
      
      <div className="p-5 border-b border-slate-200 bg-white">
        <h2 className="text-base font-bold text-slate-900">Alumni Activity Stream</h2>
        <p className="text-xs text-slate-500 mt-0.5">Career updates & hiring news</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {dummyActivities.map(activity => (
          <div key={activity.id} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:border-[var(--cardinal)] transition-colors cursor-pointer group">
            <div className="flex items-start gap-3">
              <img src={activity.avatar} alt={activity.name} className="w-10 h-10 rounded-full object-cover border border-slate-100" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">{activity.name}</h3>
                  <span className="text-[10px] font-semibold text-slate-400">{activity.time}</span>
                </div>
                <div className="flex items-start gap-2 mt-2">
                  <span className={`p-1.5 rounded-lg ${activity.bg} mt-0.5 flex-shrink-0`}>
                    {activity.icon}
                  </span>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">
                    {activity.action}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-slate-100 flex justify-end">
              <button className="text-[10px] font-bold text-slate-400 group-hover:text-[var(--cardinal)] flex items-center gap-1 uppercase tracking-wide">
                View Update <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
        
        <div className="mt-6 text-center">
           <p className="text-xs text-slate-400 font-medium px-4">These updates help keep you engaged with your alumni network.</p>
        </div>
      </div>
    </div>
  );
}
