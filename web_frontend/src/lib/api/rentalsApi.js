/**
 * レンタル管理API
 * 
 * 機器の貸出・返却処理に関するAPI呼び出しを提供します。
 * - 貸出一覧・詳細の取得
 * - 貸出履歴の確認
 * - 新規貸出登録
 * - 返却処理
 * - 返却期限のリマインド機能
 * 
 * データベース対応テーブル: TRN_RENTAL
 * 
 * @module RentalsAPI
 */
import { apiClient } from './client';

export const rentalsApi = {
  // 貸出一覧を取得
  async getAll() {
    return apiClient.get('/api/rentals');
  },

  // 貸出詳細を取得
  async getById(id) {
    return apiClient.get(`/api/rentals/${id}`);
  },

  // 貸出履歴を取得
  async getHistory() {
    return apiClient.get('/api/rentals/history');
  },

  // 新規貸出を作成
  async create(rentalData) {
    return apiClient.post('/api/rentals', rentalData);
  },

  // 返却処理
  async returnItem(id) {
    return apiClient.put(`/api/rentals/${id}/return`, {});
  },
};