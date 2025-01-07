import { AppDataSource } from '@/data-source';
import { Allocation } from '@/entity/Allocation';
import { Application } from '@/entity/Application';
import { Metric } from '@/entity/Metric';
import { Pool } from '@/entity/Pool';

// Export repositories for each entity
export const poolRepository = AppDataSource.getRepository(Pool);
export const allocationRepository = AppDataSource.getRepository(Allocation);
export const applicationRepository = AppDataSource.getRepository(Application);
export const metricRepository = AppDataSource.getRepository(Metric);
