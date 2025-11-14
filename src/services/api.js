const API_BASE_URL = 'http://localhost:3000';

class ApiService {
  constructor() {
    this.currentUser = null;
    this.accessToken = null;
  }

  /**
   * Set the access token for authenticated requests
   */
  setAccessToken(token) {
    this.accessToken = token;
  }

  /**
   * Get the current access token
   */
  getAccessToken() {
    return this.accessToken;
  }

  /**
   * Clear authentication data
   */
  clearAuth() {
    this.accessToken = null;
    this.currentUser = null;
  }

  /**
   * Main request handler with JWT authentication
   */
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // IMPORTANT: Send cookies with request
      ...options,
    };

    // Add Authorization header if token exists
    if (this.accessToken) {
      config.headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    // Don't stringify FormData objects, only regular objects
    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    // Remove Content-Type header for FormData to let browser set it automatically
    if (config.body instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    try {
      const response = await fetch(url, config);
      
      // Handle 403 - Token expired, try to refresh
      if (response.status === 403 && this.accessToken) {
        console.log('Token expired, attempting refresh...');
        const refreshed = await this.refreshAccessToken();
        
        if (refreshed) {
          // Retry the original request with new token
          config.headers['Authorization'] = `Bearer ${this.accessToken}`;
          const retryResponse = await fetch(url, config);
          
          if (!retryResponse.ok) {
            const errorData = await retryResponse.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${retryResponse.status}`);
          }
          
          return await retryResponse.json();
        } else {
          // Refresh failed, user needs to login again
          throw new Error('Sessão expirada. Por favor, faça login novamente.');
        }
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // ============================================
  // Authentication Methods
  // ============================================

  /**
   * Login user and receive JWT tokens
   * Returns: { accessToken, user }
   */
  async login(email, password) {
    const response = await this.request('/users/login', {
      method: 'POST',
      body: { email, password },
    });
    
    // Backend returns { accessToken, user }
    this.accessToken = response.accessToken;
    this.currentUser = response.user;
    
    return response; // Return full response for App.js to handle
  }

  /**
   * Register new user and receive JWT tokens
   * Returns: { accessToken, user }
   */
  async register(name, email, password) {
    const response = await this.request('/users/register', {
      method: 'POST',
      body: { name, email, password },
    });
    
    // Backend returns { accessToken, user }
    this.accessToken = response.accessToken;
    this.currentUser = response.user;
    
    return response; // Return full response for App.js to handle
  }

  /**
   * Refresh the access token using the refresh token cookie
   * Returns true if successful, false otherwise
   */
  async refreshAccessToken() {
    try {
      const response = await fetch(`${API_BASE_URL}/users/refresh`, {
        method: 'POST',
        credentials: 'include', // Send refresh token cookie
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        this.accessToken = data.accessToken;
        console.log('Token refreshed successfully');
        return true;
      } else {
        console.error('Token refresh failed');
        this.clearAuth();
        return false;
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      this.clearAuth();
      return false;
    }
  }

  /**
   * Logout user - clears tokens and calls backend
   */
  async logout() {
    try {
      // Call backend logout to clear refresh token cookie
      if (this.accessToken) {
        await this.request('/users/logout', {
          method: 'POST',
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local auth data
      this.clearAuth();
    }
  }

  /**
   * Get current user info from backend
   */
  async getCurrentUser() {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }
    
    const user = await this.request('/users/me');
    this.currentUser = user;
    return user;
  }

  /**
   * Set current user (for internal use)
   */
  setCurrentUser(user) {
    this.currentUser = user;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return this.accessToken !== null;
  }

  // ============================================
  // Financial Records API Methods
  // ============================================

  /**
   * Get all financial records for authenticated user
   * JWT token automatically identifies the user
   */
  async getFinancialRecords() {
    if (!this.accessToken) {
      throw new Error('User not authenticated');
    }
    const records = await this.request('/records');
    return this.transformRecordsToFrontend(records);
  }

  /**
   * Create a new financial record
   */
  async createFinancialRecord(record) {
    if (!this.accessToken) {
      throw new Error('User not authenticated');
    }
    
    // Map frontend data structure to backend structure
    const backendRecord = {
      description: record.description,
      value: record.amount,
      type: record.type,
      category: record.category,
      date: record.date,
      // No userId needed - backend gets it from JWT token
    };

    const newRecord = await this.request('/records', {
      method: 'POST',
      body: backendRecord,
    });
    return this.transformRecordToFrontend(newRecord);
  }

  /**
   * Update an existing financial record
   */
  async updateFinancialRecord(id, record) {
    if (!this.accessToken) {
      throw new Error('User not authenticated');
    }
    
    // Map frontend data structure to backend structure
    const backendRecord = {
      description: record.description,
      value: record.amount,
      type: record.type,
      category: record.category,
      date: record.date,
    };

    const updatedRecord = await this.request(`/records/${id}`, {
      method: 'PUT',
      body: backendRecord,
    });
    return this.transformRecordToFrontend(updatedRecord);
  }

  /**
   * Delete a financial record
   */
  async deleteFinancialRecord(id) {
    if (!this.accessToken) {
      throw new Error('User not authenticated');
    }
    
    return this.request(`/records/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get a single financial record by ID
   */
  async getFinancialRecord(id) {
    if (!this.accessToken) {
      throw new Error('User not authenticated');
    }
    
    const record = await this.request(`/records/${id}`);
    return this.transformRecordToFrontend(record);
  }

  // Helper method to transform backend data to frontend format
  transformRecordToFrontend(backendRecord) {
    return {
      id: backendRecord._id || backendRecord.id, // MongoDB uses _id
      date: backendRecord.timestamp ? new Date(backendRecord.timestamp).toISOString().split('T')[0] : backendRecord.date,
      type: backendRecord.type,
      category: backendRecord.category,
      description: backendRecord.description,
      amount: backendRecord.value || backendRecord.amount
    };
  }

  // Helper method to transform multiple records
  transformRecordsToFrontend(backendRecords) {
    return backendRecords.map(record => this.transformRecordToFrontend(record));
  }

  // Helper method to transform category data from backend to frontend
  transformCategoryToFrontend(backendCategory) {
    return {
      id: backendCategory._id || backendCategory.id, // MongoDB uses _id
      name: backendCategory.name,
      type: backendCategory.type,
      color: backendCategory.color,
      isDefault: backendCategory.isDefault
    };
  }

  // Helper method to transform multiple categories
  transformCategoriesToFrontend(backendCategories) {
    return backendCategories.map(cat => this.transformCategoryToFrontend(cat));
  }

  /**
   * Import transactions from CSV file
   */
  async importTransactionsCSV(file) {
    if (!this.accessToken) {
      throw new Error('User not authenticated');
    }
    
    const form = new FormData();
    form.append('file', file);
    // No userId needed - backend gets it from JWT token

    return this.request('/records/import', {
      method: 'POST',
      body: form,
    });
  }

  // ============================================
  // Categories API Methods
  // ============================================

  /**
   * Get all categories for authenticated user
   */
  async getCategories() {
    if (!this.accessToken) {
      throw new Error('User not authenticated');
    }
    const categories = await this.request('/categories');
    return this.transformCategoriesToFrontend(categories);
  }

  /**
   * Create a new category
   */
  async createCategory(category) {
    if (!this.accessToken) {
      throw new Error('User not authenticated');
    }
    const newCategory = await this.request('/categories', {
      method: 'POST',
      body: category,
    });
    return this.transformCategoryToFrontend(newCategory);
  }

  /**
   * Update an existing category
   */
  async updateCategory(id, category) {
    if (!this.accessToken) {
      throw new Error('User not authenticated');
    }
    const updatedCategory = await this.request(`/categories/${id}`, {
      method: 'PUT',
      body: category,
    });
    return this.transformCategoryToFrontend(updatedCategory);
  }

  /**
   * Delete a category
   */
  async deleteCategory(id) {
    if (!this.accessToken) {
      throw new Error('User not authenticated');
    }
    return this.request(`/categories/${id}`, {
      method: 'DELETE',
    });
  }
}

export default new ApiService();
