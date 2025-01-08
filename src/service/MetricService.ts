import { type Metric } from '@/entity/Metric';
import { metricRepository } from '@/repository';

class MetricService {
  async saveMetrics(metrics: Array<Partial<Metric>>): Promise<Metric[]> {
    const newMetrics = metricRepository.create(metrics);
    return await metricRepository.save(newMetrics);
  }

  async getMetricById(id: number): Promise<Metric | null> {
    return await metricRepository.findOne({ where: { id } });
  }

  async getAllMetrics(page = 1, limit = 10): Promise<Metric[]> {
    return await metricRepository.find({
      skip: (page - 1) * limit,
      take: limit,
    });
  }
}

const metricService = new MetricService();
export default metricService;
