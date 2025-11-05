import axios from 'axios';
import { gatewayConfig } from '../config/gateway';

// 服務實例介面
interface ServiceInstance {
  id: string;
  host: string;
  port: number;
  healthy: boolean;
  lastHealthCheck: Date;
  failureCount: number;
}

// 負載均衡器類別
export class LoadBalancer {
  private instances: ServiceInstance[] = [];
  private currentIndex = 0;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startHealthChecks();
  }

  // 添加服務實例
  addInstance(host: string, port: number): void {
    const instance: ServiceInstance = {
      id: `${host}:${port}`,
      host,
      port,
      healthy: true,
      lastHealthCheck: new Date(),
      failureCount: 0
    };

    this.instances.push(instance);
    console.log(`✅ 添加服務實例: ${instance.id}`);
  }

  // 移除服務實例
  removeInstance(host: string, port: number): void {
    const id = `${host}:${port}`;
    this.instances = this.instances.filter(instance => instance.id !== id);
    console.log(`❌ 移除服務實例: ${id}`);
  }

  // 獲取健康的實例 (Round Robin)
  getHealthyInstance(): ServiceInstance | null {
    const healthyInstances = this.instances.filter(instance => instance.healthy);
    
    if (healthyInstances.length === 0) {
      console.warn('⚠️ 沒有健康的服務實例可用');
      return null;
    }

    // Round Robin 選擇
    const instance = healthyInstances[this.currentIndex % healthyInstances.length];
    this.currentIndex = (this.currentIndex + 1) % healthyInstances.length;
    
    return instance;
  }

  // 獲取最少連接的實例
  getLeastConnectionsInstance(): ServiceInstance | null {
    const healthyInstances = this.instances.filter(instance => instance.healthy);
    
    if (healthyInstances.length === 0) {
      return null;
    }

    // 簡化版本：返回失敗次數最少的實例
    return healthyInstances.reduce((least, current) => 
      current.failureCount < least.failureCount ? current : least
    );
  }

  // 標記實例失敗
  markInstanceFailure(instanceId: string): void {
    const instance = this.instances.find(i => i.id === instanceId);
    if (instance) {
      instance.failureCount++;
      
      if (instance.failureCount >= gatewayConfig.loadBalancer.maxRetries) {
        instance.healthy = false;
        console.warn(`🔴 實例 ${instanceId} 標記為不健康 (失敗次數: ${instance.failureCount})`);
      }
    }
  }

  // 標記實例恢復
  markInstanceRecovery(instanceId: string): void {
    const instance = this.instances.find(i => i.id === instanceId);
    if (instance) {
      instance.failureCount = 0;
      instance.healthy = true;
      console.log(`🟢 實例 ${instanceId} 恢復健康`);
    }
  }

  // 執行健康檢查
  private async performHealthCheck(instance: ServiceInstance): Promise<boolean> {
    try {
      const response = await axios.get(`http://${instance.host}:${instance.port}/health`, {
        timeout: 5000,
        validateStatus: (status) => status === 200
      });

      return response.data.status === 'healthy';
    } catch (error) {
      console.error(`健康檢查失敗 ${instance.id}:`, error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }

  // 開始健康檢查
  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(async () => {
      for (const instance of this.instances) {
        const isHealthy = await this.performHealthCheck(instance);
        instance.lastHealthCheck = new Date();

        if (isHealthy && !instance.healthy) {
          this.markInstanceRecovery(instance.id);
        } else if (!isHealthy && instance.healthy) {
          this.markInstanceFailure(instance.id);
        }
      }
    }, gatewayConfig.loadBalancer.healthCheckInterval);
  }

  // 停止健康檢查
  stopHealthChecks(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  // 獲取負載均衡器狀態
  getStatus(): {
    totalInstances: number;
    healthyInstances: number;
    unhealthyInstances: number;
    instances: ServiceInstance[];
  } {
    const healthyCount = this.instances.filter(i => i.healthy).length;
    
    return {
      totalInstances: this.instances.length,
      healthyInstances: healthyCount,
      unhealthyInstances: this.instances.length - healthyCount,
      instances: this.instances.map(instance => ({
        ...instance,
        // 不暴露敏感資訊
      }))
    };
  }

  // 重置所有實例狀態
  resetAllInstances(): void {
    this.instances.forEach(instance => {
      instance.healthy = true;
      instance.failureCount = 0;
      instance.lastHealthCheck = new Date();
    });
    console.log('🔄 重置所有服務實例狀態');
  }
}

// 單例模式
let loadBalancerInstance: LoadBalancer | null = null;

export function getLoadBalancer(): LoadBalancer {
  if (!loadBalancerInstance) {
    loadBalancerInstance = new LoadBalancer();
  }
  return loadBalancerInstance;
}

// 負載均衡中間件
export function createLoadBalancerMiddleware() {
  const loadBalancer = getLoadBalancer();
  
  return (req: any, res: any, next: any) => {
    // 在請求物件中添加負載均衡器資訊
    req.loadBalancer = {
      getInstance: () => loadBalancer.getHealthyInstance(),
      markFailure: (instanceId: string) => loadBalancer.markInstanceFailure(instanceId),
      markRecovery: (instanceId: string) => loadBalancer.markInstanceRecovery(instanceId)
    };
    
    next();
  };
}

// 代理請求到健康的實例
export async function proxyToHealthyInstance(
  path: string, 
  method: string = 'GET', 
  data?: any,
  headers?: any
): Promise<any> {
  const loadBalancer = getLoadBalancer();
  const instance = loadBalancer.getHealthyInstance();
  
  if (!instance) {
    throw new Error('沒有可用的健康服務實例');
  }
  
  try {
    const response = await axios({
      method,
      url: `http://${instance.host}:${instance.port}${path}`,
      data,
      headers,
      timeout: 30000
    });
    
    return response.data;
  } catch (error) {
    loadBalancer.markInstanceFailure(instance.id);
    throw error;
  }
}