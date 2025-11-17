/**
 * 成分調整記錄模型
 * 
 * 用於保存用戶對識別成分的調整記錄
 */

import { ObjectId } from 'mongodb';

export interface ComponentAdjustmentDocument {
  _id?: ObjectId;
  sessionId: string;                    // 識別會話 ID
  userId?: string;                      // 用戶 ID（如果已登入）
  adjustmentType: 'add' | 'remove' | 'update_portion'; // 調整類型
  componentId?: string;                 // 成分 ID
  componentName?: string;               // 成分名稱
  oldValue?: any;                       // 舊值（用於份量調整）
  newValue?: any;                       // 新值（用於份量調整）
  details: any;                         // 詳細資訊
  timestamp: Date;                      // 調整時間
  createdAt: Date;                      // 創建時間
}

export class ComponentAdjustment {
  _id?: ObjectId;
  sessionId: string;
  userId?: string;
  adjustmentType: 'add' | 'remove' | 'update_portion';
  componentId?: string;
  componentName?: string;
  oldValue?: any;
  newValue?: any;
  details: any;
  timestamp: Date;
  createdAt: Date;

  constructor(data: Partial<ComponentAdjustmentDocument>) {
    this._id = data._id;
    this.sessionId = data.sessionId || '';
    this.userId = data.userId;
    this.adjustmentType = data.adjustmentType || 'add';
    this.componentId = data.componentId;
    this.componentName = data.componentName;
    this.oldValue = data.oldValue;
    this.newValue = data.newValue;
    this.details = data.details || {};
    this.timestamp = data.timestamp || new Date();
    this.createdAt = data.createdAt || new Date();
  }

  /**
   * 轉換為資料庫文檔
   */
  toDocument(): ComponentAdjustmentDocument {
    return {
      _id: this._id,
      sessionId: this.sessionId,
      userId: this.userId,
      adjustmentType: this.adjustmentType,
      componentId: this.componentId,
      componentName: this.componentName,
      oldValue: this.oldValue,
      newValue: this.newValue,
      details: this.details,
      timestamp: this.timestamp,
      createdAt: this.createdAt
    };
  }

  /**
   * 從資料庫文檔創建實例
   */
  static fromDocument(doc: ComponentAdjustmentDocument): ComponentAdjustment {
    return new ComponentAdjustment(doc);
  }
}
