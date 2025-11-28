import { Project } from '@/data/projects'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Simple in-memory cache with TTL
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
}

class SimpleCache {
  private cache = new Map<string, CacheEntry<any>>()

  set<T>(key: string, data: T, ttl: number = 60000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  clear(): void {
    this.cache.clear()
  }

  delete(key: string): void {
    this.cache.delete(key)
  }
}

const cache = new SimpleCache()

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

// Cache invalidation helper
export const invalidateCache = (key?: string) => {
  if (key) {
    cache.delete(key)
  } else {
    cache.clear()
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
  // Get all projects (with caching - 10 minutes)
  async getProjects(): Promise<Project[]> {
    const cacheKey = 'projects'
    const cached = cache.get<Project[]>(cacheKey)
    if (cached) return cached

    const response = await fetch(`${API_BASE_URL}/projects`, {
      // Add cache headers for browser caching
      cache: 'default'
    })
    if (!response.ok) {
      throw new Error('Failed to fetch projects')
    }
    const data = await response.json()
    cache.set(cacheKey, data, 10 * 60 * 1000) // 10 minutes
    return data
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
    const data = await response.json()
    invalidateCache('projects') // Invalidate cache
    return data
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
    const data = await response.json()
    invalidateCache('projects') // Invalidate cache
    return data
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
    invalidateCache('projects') // Invalidate cache
  },

  // Homepage Video Management
  // Get active homepage video (public, with caching - 15 minutes)
  async getActiveHomepageVideo(): Promise<{ videoUrl: string; title?: string; subtitle?: string; isActive: boolean }> {
    const cacheKey = 'homepage_video_active'
    const cached = cache.get<{ videoUrl: string; title?: string; subtitle?: string; isActive: boolean }>(cacheKey)
    if (cached) return cached

    const response = await fetch(`${API_BASE_URL}/homepage-video/active`, {
      // Add cache headers for browser caching
      cache: 'default'
    })
    if (!response.ok) {
      throw new Error('Failed to fetch homepage video')
    }
    const data = await response.json()
    cache.set(cacheKey, data, 15 * 60 * 1000) // 15 minutes
    return data
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
  // Get all team members (public, with caching - 10 minutes)
  async getTeamMembers(): Promise<any[]> {
    const cacheKey = 'team_members'
    const cached = cache.get<any[]>(cacheKey)
    if (cached) return cached

    const response = await fetch(`${API_BASE_URL}/team`, {
      // Add cache headers for browser caching
      cache: 'default'
    })
    if (!response.ok) {
      throw new Error('Failed to fetch team members')
    }
    const data = await response.json()
    cache.set(cacheKey, data, 10 * 60 * 1000) // 10 minutes
    return data
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
    const data = await response.json()
    invalidateCache('team_members') // Invalidate cache
    return data
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
    const data = await response.json()
    invalidateCache('team_members') // Invalidate cache
    return data
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
    invalidateCache('team_members') // Invalidate cache
  },

  // News Management
  // Get all news (public, with caching - 5 minutes)
  async getNews(sortBy?: 'displayOrder' | 'date', limit?: number): Promise<any[]> {
    const cacheKey = `news_${sortBy || 'default'}_${limit || 'all'}`
    const cached = cache.get<any[]>(cacheKey)
    if (cached) return cached
    const limitParam = limit ? `&limit=${limit}` : ''
    const url = sortBy 
      ? `${API_BASE_URL}/news?sortBy=${sortBy}${limitParam}` 
      : `${API_BASE_URL}/news${limitParam ? `?${limitParam.substring(1)}` : ''}`
    
    // Reduce timeout to 10 seconds for faster failure detection
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
    
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        // Add headers to help with large responses
        headers: {
          'Accept': 'application/json',
        },
        cache: 'default'
      })
      clearTimeout(timeoutId)
      if (!response.ok) {
        throw new Error('Failed to fetch news')
      }
      const data = await response.json()
      cache.set(cacheKey, data, 5 * 60 * 1000) // 5 minutes
      return data
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout - response too large or network too slow')
      }
      throw error
    }
  },

  // Get a single news item by ID (public)
  async getNewsItem(id: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/news/${id}`)
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch news item' }))
      if (response.status === 404) {
        throw new Error('News item not found')
      }
      throw new Error(error.error || 'Failed to fetch news item')
    }
    return response.json()
  },

  // Create a new news item (protected)
  async createNews(news: {
    title: string
    mainImage: string
    summary: string
    fullText: string
    additionalImages?: string[]
    publicationDate?: string | Date
    displayOrder?: number
    extraData?: any
  }): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/news`, {
      method: 'POST',
      headers: auth.getAuthHeaders(),
      body: JSON.stringify(news),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create news item')
    }
    const data = await response.json()
    // Invalidate all news caches (clear all keys starting with 'news_')
    const keysToDelete: string[] = []
    // Note: We can't iterate cache keys directly, so we'll clear common patterns
    invalidateCache('news_displayOrder_all')
    invalidateCache('news_displayOrder_5')
    invalidateCache('news_date_all')
    invalidateCache('news_date_5')
    invalidateCache('news_default_all')
    return data
  },

  // Update a news item (protected)
  async updateNews(id: string, news: Partial<{
    title: string
    mainImage: string
    summary: string
    fullText: string
    additionalImages?: string[]
    publicationDate?: string | Date
    displayOrder?: number
    extraData?: any
    removeMainImage?: boolean
    removeAdditionalImages?: number[]
  }>): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/news/${id}`, {
      method: 'PUT',
      headers: auth.getAuthHeaders(),
      body: JSON.stringify(news),
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to update news item' }))
      if (response.status === 404) {
        throw new Error('News item not found')
      } else if (response.status === 401) {
        throw new Error('Authentication required')
      }
      throw new Error(error.error || 'Failed to update news item')
    }
    const data = await response.json()
    // Invalidate all news caches
    invalidateCache('news_displayOrder_all')
    invalidateCache('news_displayOrder_5')
    invalidateCache('news_date_all')
    invalidateCache('news_date_5')
    invalidateCache('news_default_all')
    return data
  },

  // Delete a news item (protected)
  async deleteNews(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/news/${id}`, {
      method: 'DELETE',
      headers: auth.getAuthHeaders(),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete news item')
    }
    // Invalidate all news caches
    invalidateCache('news_displayOrder_all')
    invalidateCache('news_displayOrder_5')
    invalidateCache('news_date_all')
    invalidateCache('news_date_5')
    invalidateCache('news_default_all')
  },
}

