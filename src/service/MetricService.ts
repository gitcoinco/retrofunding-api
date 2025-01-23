import { type Metric } from '@/entity/Metric';
import { metricRepository } from '@/repository';
import { In } from 'typeorm';

class MetricService {
  async saveMetrics(metrics: Metric[]): Promise<void> {
    const newMetrics = metricRepository.create(metrics);
    await metricRepository.save(newMetrics);
  }

  async updateMetric(
    identifier: string,
    metric: Partial<Metric>
  ): Promise<void> {
    await metricRepository.update({ identifier }, metric);
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

  async getMetricsByNames(titles: string[]): Promise<Metric[]> {
    return await metricRepository.find({ where: { title: In(titles) } });
  }

  async getMetricsByIdentifiers(identifiers: string[]): Promise<Metric[]> {
    return await metricRepository.find({
      where: { identifier: In(identifiers) },
    });
  }

  async getEnabledMetricsByIdentifiers(
    identifiers: string[]
  ): Promise<Metric[]> {
    return await metricRepository.find({
      where: { identifier: In(identifiers), enabled: true },
    });
  }
}

const metricService = new MetricService();
export default metricService;
