import { Seeder } from '@jorgebodega/typeorm-seeding';
import { DataSource } from 'typeorm';
import { ApplicationToMetricScore } from '../entity/ApplicationToMetricScore';
import { Application } from '../entity/Application';
import { Metric } from '../entity/Metric';

export default class CreateApplicationToMetricScoreSeed implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    // Example data for applications and metrics
    const applications = await dataSource.getRepository(Application).find();
    const metrics = await dataSource.getRepository(Metric).find();

    const scoresData = [
      {
        application: applications[0], // Assuming at least one application exists
        metric: metrics[0], // Assuming at least one metric exists
        score: 85.5,
      },
      {
        application: applications[1], // Assuming at least two applications exist
        metric: metrics[1], // Assuming at least two metrics exist
        score: 90.0,
      },
      {
        application: applications[0],
        metric: metrics[2],
        score: 75.0,
      },
    ];

    for (const score of scoresData) {
      await dataSource
        .createQueryBuilder()
        .insert()
        .into(ApplicationToMetricScore)
        .values(score)
        .execute();
    }
  }
}
