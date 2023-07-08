import { Inject, Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { InjectDataSource } from "@nestjs/typeorm";
import { PubSub } from "graphql-subscriptions";
import { DataSource } from "typeorm";

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    @Inject("PUB_SUB") private readonly pubSub: PubSub,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  @Cron("*/10 * * * *")
  async updateOnlineStatuses() {
    this.logger.log("Updating online statuses");
    try {
      await this.dataSource.createQueryRunner().query(
        `UPDATE user_vote
SET status = CASE
    WHEN status = 'idle' AND "lastUpdate" <= NOW() - INTERVAL '30 minutes' THEN 'offline'
    WHEN status = 'online' AND "lastUpdate" <= NOW() - INTERVAL '30 minutes' THEN 'idle'
    ELSE status
END,
"lastUpdate" = NOW()
WHERE status = 'idle' OR (status = 'online' AND "lastUpdate" <= NOW() - INTERVAL '30 minutes');
`,
      );
    } catch (error) {
      this.logger.error("Updating online statuses got an error", error);
      return;
    }
    this.logger.log("Finished updating online statuses");
  }

  @Cron("0 1 * * 0")
  async removeOldBoards() {
    this.logger.log("Removing old boards");
    try {
      await this.dataSource
        .createQueryRunner()
        .query(
          `DELETE FROM board WHERE "lastUpdate" < NOW() - INTERVAL '2 weeks';`,
        );
    } catch (error) {
      this.logger.error("Removing old boards got an error", error);
      return;
    }
    this.logger.log("Finished removing old boards");
  }
}
