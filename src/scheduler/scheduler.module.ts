import { Module } from "@nestjs/common";
import { SchedulerService } from "./scheduler.service";
import { PubSubModule } from "src/gql/pubsub.module";

@Module({
  imports: [PubSubModule],
  providers: [SchedulerService],
})
export class SchedulerModule {}
