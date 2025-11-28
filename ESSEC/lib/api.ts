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
      const error = await response.json().catch(() => ({ error: 'Failed to fetch project' }))
      if (response.status === 404) {
        throw new Error('Project not found')
      } else if (response.status === 400) {
        throw new Error(error.error || 'Invalid project ID')
      } else {
        throw new Error(error.error || 'Failed to fetch project')
      }
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
      const error = await response.json().catch(() => ({ error: 'Failed to update project' }))
      if (response.status === 404) {
        throw new Error('Project not found')
      } else if (response.status === 400) {
        throw new Error(error.error || 'Invalid project data')
      } else if (response.status === 401) {
        throw new Error('Authentication required')
      } else {
        throw new Error(error.error || 'Failed to update project')
      }
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

  // Homepage Video Management
  // Get active homepage video (public)
  async getActiveHomepageVideo(): Promise<{ videoUrl: string; title?: string; subtitle?: string; isActive: boolean }> {
    const response = await fetch(`${API_BASE_URL}/homepage-video/active`)
    if (!response.ok) {
      throw new Error('Failed to fetch homepage video')
    }
    return response.json()
  },

  // Get all homepage videos (protected)
  async getHomepageVideos(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/homepage-video`, {
      headers: auth.getAuthHeaders(),
    })
    if (!response.ok) {
      throw new Error('Failed to fetch homepage videos')
    }
    return response.json()
  },

  // Get a single homepage video by ID (protected)
  async getHomepageVideo(id: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/homepage-video/${id}`, {
      headers: auth.getAuthHeaders(),
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch homepage video' }))
      if (response.status === 404) {
        throw new Error('Homepage video not found')
      }
      throw new Error(error.error || 'Failed to fetch homepage video')
    }
    return response.json()
  },

  // Create a new homepage video (protected)
  async createHomepageVideo(video: { videoUrl: string; title?: string; subtitle?: string; isActive?: boolean }): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/homepage-video`, {
      method: 'POST',
      headers: auth.getAuthHeaders(),
      body: JSON.stringify(video),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create homepage video')
    }
    return response.json()
  },

  // Update a homepage video (protected)
  async updateHomepageVideo(id: string, video: Partial<{ videoUrl: string; title: string; subtitle: string; isActive: boolean }>): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/homepage-video/${id}`, {
      method: 'PUT',
      headers: auth.getAuthHeaders(),
      body: JSON.stringify(video),
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to update homepage video' }))
      if (response.status === 404) {
        throw new Error('Homepage video not found')
      } else if (response.status === 401) {
        throw new Error('Authentication required')
      }
      throw new Error(error.error || 'Failed to update homepage video')
    }
    return response.json()
  },

  // Delete a homepage video (protected)
  async deleteHomepageVideo(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/homepage-video/${id}`, {
      method: 'DELETE',
      headers: auth.getAuthHeaders(),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete homepage video')
    }
  },

  // Team Management
  // Get all team members (public)
  async getTeamMembers(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/team`)
    if (!response.ok) {
      throw new Error('Failed to fetch team members')
    }
    return response.json()
  },

  // Get a single team member by ID (public)
  async getTeamMember(id: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/team/${id}`)
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch team member' }))
      if (response.status === 404) {
        throw new Error('Team member not found')
      }
      throw new Error(error.error || 'Failed to fetch team member')
    }
    return response.json()
  },

  // Create a new team member (protected)
  async createTeamMember(member: {
    name: string
    role: string
    bio: string
    profileImage?: string
    socialLinks?: {
      linkedin?: string
      twitter?: string
      facebook?: string
      instagram?: string
      website?: string
    }
    cvUrl?: string
  }): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/team`, {
      method: 'POST',
      headers: auth.getAuthHeaders(),
      body: JSON.stringify(member),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create team member')
    }
    return response.json()
  },

  // Update a team member (protected)
  async updateTeamMember(id: string, member: Partial<{
    name: string
    role: string
    bio: string
    profileImage?: string
    socialLinks?: {
      linkedin?: string
      twitter?: string
      facebook?: string
      instagram?: string
      website?: string
    }
    cvUrl?: string
    displayOrder?: number
    removeProfileImage?: boolean
    removeCv?: boolean
  }>): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/team/${id}`, {
      method: 'PUT',
      headers: auth.getAuthHeaders(),
      body: JSON.stringify(member),
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to update team member' }))
      if (response.status === 404) {
        throw new Error('Team member not found')
      } else if (response.status === 401) {
        throw new Error('Authentication required')
      }
      throw new Error(error.error || 'Failed to update team member')
    }
    return response.json()
  },

  // Delete a team member (protected)
  async deleteTeamMember(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/team/${id}`, {
      method: 'DELETE',
      headers: auth.getAuthHeaders(),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete team member')
    }
  },
}

