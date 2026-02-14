import React from 'react'
import JobCard from '../components/JobCard'

const sampleJobs = [
  { _id:1, title:'Product Manager', company:'FinCo', location:'Remote', description:'Lead product', type:'Full-time' },
  { _id:2, title:'Data Engineer Intern', company:'AI Labs', location:'Bengaluru', description:'Internship', type:'Internship' }
]

export default function Jobs(){
  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Jobs & Internships</h1>
        <a className="px-3 py-2 border rounded" href="/post-job">Post a job</a>
      </div>

      <div className="space-y-4">
        {sampleJobs.map(j => <JobCard key={j._id} job={j} />)}
      </div>
    </div>
  )
}
