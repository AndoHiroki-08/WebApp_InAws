/**
 * ユーザー管理API
 * 
 * システムユーザーの管理に関するAPI呼び出しを提供します。
 * - ユーザー一覧・詳細の取得
 * - ユーザーの新規登録・更新・削除
 * - 管理者権限の設定
 * - 社員情報の管理
 * 
 * データベース対応テーブル: MST_USER
 * 
 * @module UsersAPI
 */
import { apiClient } from './client';

export const usersApi = {
  // ユーザー一覧を取得
  async getAll() {
    return apiClient.get('/api/users');
  },

  // ユーザー詳細を取得
  async getById(id) {
    return apiClient.get(`/api/users/${id}`);
  },

  // ユーザーを新規作成
  async create(userData) {
    return apiClient.post('/api/users', userData);
  },

  // ユーザーを更新
  async update(id, userData) {
    return apiClient.put(`/api/users/${id}`, userData);
  },

  // ユーザーを削除
  async delete(id) {
    return apiClient.delete(`/api/users/${id}`);
  },
};