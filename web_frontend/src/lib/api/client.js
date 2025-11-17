/**
 * APIクライアント
 * 
 * バックエンドAPIとの通信を行う共通クライアントです。
 * - RESTful APIの基本操作（GET, POST, PUT, DELETE）
 * - エラーハンドリング
 * - レスポンスの統一処理
 * - 環境変数によるベースURL設定
 * 
 * 使用例:
 * const data = await apiClient.get('/api/machines');
 * await apiClient.post('/api/users', userData);
 * 
 * @module APIClient
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5023';

export const apiClient = {
  async get(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  async post(endpoint, data) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  async put(endpoint, data) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  async delete(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.ok;
  },
};