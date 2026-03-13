import axios from 'axios'

const API_BASE = import.meta.env.VITE_SERVER_URL || 'http://localhost:5001'

const client = axios.create({
  baseURL: `${API_BASE}/api/jobs`,
  timeout: 15000,
  withCredentials: true,
})

export async function fetchJobs() {
  const res = await client.get('/')
  return res.data.jobs
}

export async function createJob(jobData) {
  const res = await client.post('/', jobData)
  return res.data.job
}
