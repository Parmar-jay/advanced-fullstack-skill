/**
 * All API endpoint functions.
 * Import and call these from components/pages — never use axios directly.
 *
 * Pattern:
 *   const { data } = await authAPI.login({ email, password })
 */
import api from './axios'

// ═══════════════════════════════════════════
//  AUTH
// ═══════════════════════════════════════════

export const authAPI = {
  /** Register — sends OTP to email */
  signup: (body) => api.post('/auth/signup', body),

  /** Verify signup OTP → returns JWT pair */
  verifySignup: (body) => api.post('/auth/signup/verify', body),

  /** Resend signup OTP */
  resendSignupOtp: (email) => api.post('/auth/signup/resend-otp', { email }),

  /** Login with email + password */
  login: (email, password) => {
    const form = new URLSearchParams()
    form.append('username', email)   // OAuth2PasswordRequestForm uses "username"
    form.append('password', password)
    return api.post('/auth/login', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
  },

  /** Rotate refresh token */
  refresh: (refreshToken) =>
    api.post('/auth/refresh', { refresh_token: refreshToken }),

  /** Logout (revokes all refresh tokens) */
  logout: () => api.post('/auth/logout'),

  /** Get current user profile */
  me: () => api.get('/auth/me'),

  /** Update current user profile */
  updateMe: (body) => api.put('/auth/me', body),

  /** Google OAuth with ID token */
  googleAuth: (credential) => api.post('/auth/google', { credential }),

  /** Forgot password — send OTP */
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),

  /** Verify reset OTP */
  verifyOtp: (email, otp_code) => api.post('/auth/verify-otp', { email, otp_code }),

  /** Reset password with OTP */
  resetPassword: (body) => api.post('/auth/reset-password', body),

  /** Resend reset OTP */
  resendOtp: (email) => api.post('/auth/resend-otp', { email }),
}


// ═══════════════════════════════════════════
//  USERS
// ═══════════════════════════════════════════

export const usersAPI = {
  /** Get login history for current user */
  loginHistory: (limit = 20) => api.get(`/users/me/history?limit=${limit}`),

  /** Change password */
  changePassword: (body) => api.post('/users/me/change-password', body),

  /** Soft-delete account */
  deleteAccount: () => api.delete('/users/me'),
}


// ═══════════════════════════════════════════
//  ITEMS (generic CRUD example)
// ═══════════════════════════════════════════

export const itemsAPI = {
  list: (params = {}) => api.get('/items', { params }),
  get: (id) => api.get(`/items/${id}`),
  create: (body) => api.post('/items', body),
  update: (id, body) => api.put(`/items/${id}`, body),
  delete: (id) => api.delete(`/items/${id}`),
}


// ═══════════════════════════════════════════
//  ADMIN
// ═══════════════════════════════════════════

export const adminAPI = {
  stats: () => api.get('/admin/stats'),
  listUsers: (params = {}) => api.get('/admin/users', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, body) => api.put(`/admin/users/${id}`, body),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  loginHistory: (params = {}) => api.get('/admin/login-history', { params }),
}


// ═══════════════════════════════════════════
//  UPLOADS
// ═══════════════════════════════════════════

export const uploadsAPI = {
  uploadImage: (file) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/uploads/image', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  deleteImage: (publicId) => api.delete(`/uploads/${publicId}`),
}
