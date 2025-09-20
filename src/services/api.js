const API_BASE_URL = 'http://localhost:3000';

class ApiService {
  constructor() {
    this.currentUser = null;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

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

  // User Authentication methods
  async login(email, password) {
    const user = await this.request('/users/login', {
      method: 'POST',
      body: { email, password },
    });
    this.currentUser = user;
    return user;
  }

  async register(name, email, password) {
    const user = await this.request('/users/register', {
      method: 'POST',
      body: { name, email, password },
    });
    this.currentUser = user;
    return user;
  }

  setCurrentUser(user) {
    this.currentUser = user;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  logout() {
    this.currentUser = null;
  }

  // Financial Records API methods
  async getFinancialRecords() {
    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }
    return this.request(`/records?userId=${this.currentUser.id}`);
  }

  async createFinancialRecord(record) {
    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }
    
    // Map frontend data structure to backend structure
    const backendRecord = {
      description: record.description,
      value: record.amount,
      type: record.type,
      category: record.category,
      date: record.date,
      userId: this.currentUser.id
    };

    return this.request('/records', {
      method: 'POST',
      body: backendRecord,
    });
  }

  async updateFinancialRecord(id, record) {
    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }
    
    // Map frontend data structure to backend structure
    const backendRecord = {
      description: record.description,
      value: record.amount,
      type: record.type,
      category: record.category,
      date: record.date,
      userId: this.currentUser.id
    };

    return this.request(`/records/${id}`, {
      method: 'PUT',
      body: backendRecord,
    });
  }

  async deleteFinancialRecord(id) {
    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }
    
    return this.request(`/records/${id}?userId=${this.currentUser.id}`, {
      method: 'DELETE',
    });
  }

  async getFinancialRecord(id) {
    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }
    
    return this.request(`/records/${id}?userId=${this.currentUser.id}`);
  }

  // Helper method to transform backend data to frontend format
  transformRecordToFrontend(backendRecord) {
    return {
      id: backendRecord.id,
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

  // Import transactions from CSV
  async importTransactionsCSV(file) {
    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }
    console.log('Creating FormData for CSV import');
    console.log('File:', file);
    console.log('Current user ID:', this.currentUser.id);
    
    const form = new FormData();
    form.append('file', file);
    form.append('userId', this.currentUser.id);

    console.log('FormData entries:');
    for (let [key, value] of form.entries()) {
      console.log(key, value);
    }

    return this.request('/records/import', {
      method: 'POST',
      body: form,
    });
  }
}

export default new ApiService();
