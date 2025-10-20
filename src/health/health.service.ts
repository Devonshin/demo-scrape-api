/**
 * @author Dongwoo
 * @date 2025-10-13
 * Service HealthCheck - Collecte de données sur l'état de santé et les performances de l'application
 */
import {Injectable} from '@nestjs/common';

/**
 * Interface d'information sur la mémoire du système
 */
export interface MemoryInfo {
  /** Mémoire totale (bytes) */
  total: number;
  /** Mémoire utilisée(bytes) */
  used: number;
  /** Mémoire disponible (bytes) */
  free: number;
  /** Utilisation de la mémoire (%) */
  usagePercent: number;
}

/**
 * Interface d'information sur l'état de l'application
 */
export interface HealthStatus {
  /** Statut de la demande */
  status: 'ok' | 'notok';
  /** Horodatage actuel */
  timestamp: string;
  /** Temps de disponibilité (secondes) */
  uptime: number;
  /** Informations sur la mémoire */
  memory: MemoryInfo;
  /** version de Node.js */
  nodeVersion: string;
  /** Environnement */
  environment: string;
}

/**
 * Service de bilan de santé
 */
@Injectable()
export class HealthService {
  private readonly startTime: number;

  constructor() {
    this.startTime = Date.now();
  }

  /**
   * Renvoie l’état de santé de l’application
   * @returns Informations sur l'état de santé
   */
  getHealth(): HealthStatus {
    const memoryUsage = process.memoryUsage();
    const totalMemory = memoryUsage.heapTotal;
    const usedMemory = memoryUsage.heapUsed;
    const freeMemory = totalMemory - usedMemory;

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      memory: {
        total: totalMemory,
        used: usedMemory,
        free: freeMemory,
        usagePercent: Math.round((usedMemory / totalMemory) * 100),
      },
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development',
    };
  }

  /**
   * Vérifier si l'utilisation de la mémoire dépasse le seuil
   * @param threshold - le seuil (base: 90%)
   * @returns vérification du dépassement du seuil
   */
  isMemoryUsageHigh(threshold: number = 90): boolean {
    const health = this.getHealth();
    return health.memory.usagePercent > threshold;
  }
}
