const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://mealfit-api.workers.dev';

export const api = {
  async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  },

  // User
  async setupProfile(profile: any) {
    return this.request('/api/user/setup', { method: 'POST', body: JSON.stringify(profile) });
  },

  async getProfile(userId: string) {
    return this.request(`/api/user/profile?userId=${userId}`);
  },

  async updateProfile(profile: any) {
    return this.request('/api/user/profile', { method: 'PUT', body: JSON.stringify(profile) });
  },

  // History
  async logMeal(meal: any) {
    return this.request('/api/history/log', { method: 'POST', body: JSON.stringify(meal) });
  },

  async getRecentHistory(userId: string, hours = 168) {
    return this.request(`/api/history/recent?userId=${userId}&hours=${hours}`);
  },

  // Scanner
  async identify(imageBase64: string, userId: string) {
    return this.request<{
      success: boolean; foods: any[]; provider: string; processingTime: number;
    }>('/api/scanner/identify', {
      method: 'POST',
      body: JSON.stringify({ imageBase64, userId }),
    });
  },

  // Meals
  async getRecommendations(userId: string) {
    return this.request(`/api/meals/recommend?userId=${userId}`);
  },

  async searchMeals(query: string) {
    return this.request(`/api/meals/search?q=${encodeURIComponent(query)}`);
  },

  // Weather
  async getWeather(country: string) {
    return this.request(`/api/weather?country=${country}`);
  },

  // Restaurants
  async getNearbyRestaurants(lat: number, lon: number, meal?: string, cuisine?: string) {
    let url = `/api/restaurants/nearby?lat=${lat}&lon=${lon}`;
    if (meal) url += `&meal=${encodeURIComponent(meal)}`;
    if (cuisine) url += `&cuisine=${encodeURIComponent(cuisine)}`;
    return this.request(url);
  },

  // Insights
  async getWeeklyInsight(userId: string) {
    return this.request(`/api/insights/weekly?userId=${userId}`);
  },
};
