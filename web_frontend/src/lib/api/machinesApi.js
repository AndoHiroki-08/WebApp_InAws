/**
 * 機器管理API
 * 
 * レンタル機器（PC、タブレット等）の管理に関するAPI呼び出しを提供します。
 * - 機器一覧の取得
 * - 機器詳細情報の取得
 * - 機器の新規登録・更新・削除
 * - 機器の貸出状況確認
 * 
 * データベース対応テーブル: MST_DEVICE
 * 
 * @module MachinesAPI
 */
import { apiClient } from './client';

export const machinesApi = {
  // 機器一覧を取得
  async getAll() {
    return apiClient.get('/api/machines');
  },

  // 機器詳細を取得
  async getById(id) {
    return apiClient.get(`/api/machines/${id}`);
  },

  // 機器を新規作成
  async create(machineData) {
    return apiClient.post('/api/machines', machineData);
  },

  // 機器を更新
  async update(id, machineData) {
    return apiClient.put(`/api/machines/${id}`, machineData);
  },

  // 機器を削除
  async delete(id) {
    return apiClient.delete(`/api/machines/${id}`);
  },
};