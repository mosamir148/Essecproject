import { Project } from '@/data/projects'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Token management
export const auth = {
  getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('admin_token')
  },
  
  setToken(token: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem('admin_token', token)
  },
  
  removeToken(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem('admin_token')
  },
  
  getAuthHeaders(): HeadersInit {
    const token = this.getToken()
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }
}

export const api = {
  // Authentication
  async login(email: string, password: string): Promise<{ token: string; admin: any }> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to login')
    }
    const data = await response.json()
    auth.setToken(data.token)
    return data
  },

  async register(email: string, password: string, name: string): Promise<{ token: string; admin: any }> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name }),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to register')
    }
    const data = await response.json()
    auth.setToken(data.token)
    return data
  },

  async getCurrentAdmin(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: auth.getAuthHeaders(),
    })
    if (!response.ok) {
      throw new Error('Failed to get current admin')
    }
    return response.json()
  },

  logout(): void {
    auth.removeToken()
  },
  // Get all projects
  async getProjects(): Promise<Project[]> {
    const response = await fetch(`${API_BASE_URL}/projects`)
    if (!response.ok) {
      throw new Error('Failed to fetch projects')
    }
    return response.json()
  },

  // Get a single project by ID
  async getProject(id: string): Promise<Project> {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`)
    if (!response.ok) {
      throw new Error('Failed to fetch project')
    }
    return response.json()
  },

  // Create a new project
  async createProject(project: Omit<Project, 'id'>): Promise<Project> {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: auth.getAuthHeaders(),
      body: JSON.stringify(project),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create project')
    }
    return response.json()
  },

  // Update a project
  async updateProject(id: string, project: Partial<Project>): Promise<Project> {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'PUT',
      headers: auth.getAuthHeaders(),
      body: JSON.stringify(project),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update project')
    }
    return response.json()
  },

  // Delete a project
  async deleteProject(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'DELETE',
      headers: auth.getAuthHeaders(),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete project')
    }
  },
}

