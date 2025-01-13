import { type Metric } from '@/entity/Metric';
import { metricRepository } from '@/repository';
import { In } from 'typeorm';

class MetricService {
  async saveMetrics(metrics: Array<Partial<Metric>>): Promise<Metric[]> {
    const newMetrics = metricRepository.create(metrics);
    return await metricRepository.save(newMetrics);
  }

  async getMetricById(id: number): Promise<Metric | null> {
    return await metricRepository.findOne({ where: { id } });
  }

  async getMetricsByIds(ids: number[]): Promise<Metric[]> {
    return await metricRepository.find({ where: { id: In(ids) } });
  }

  async getAllMetrics(page = 1, limit = 10): Promise<Metric[]> {
    return await metricRepository.find({
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async getMetricsByNames(names: string[]): Promise<Metric[]> {
    return await metricRepository.find({ where: { name: In(names) } });
  }
}

const metricService = new MetricService();
export default metricService;
