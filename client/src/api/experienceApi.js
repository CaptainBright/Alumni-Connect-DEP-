import axios from 'axios'

const API_BASE = import.meta.env.VITE_SERVER_URL || 'http://localhost:5001'

const client = axios.create({
  baseURL: `${API_BASE}/api/experiences`,
  timeout: 60000,
  withCredentials: true,
})

export async function fetchExperiences(category) {
  const params = category && category !== 'all' ? { category } : {}
  const res = await client.get('/', { params })
  return res.data.experiences
}

export async function fetchExperience(id) {
  const res = await client.get(`/${id}`)
  return res.data.experience
}

export async function createExperience(data) {
  const res = await client.post('/', data)
  return res.data.experience
}

export async function updateExperience(id, data) {
  const res = await client.put(`/${id}`, data)
  return res.data.experience
}

export async function deleteExperience(id) {
  const res = await client.delete(`/${id}`)
  return res.data
}
