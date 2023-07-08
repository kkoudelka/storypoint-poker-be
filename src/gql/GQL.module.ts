import { Module } from "@nestjs/common";

import { BoardResolver } from "./resolvers/board.resolver";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Board } from "src/db/models/board.entity";
import { BoardService } from "./services/board.service";
import { User } from "src/db/models/user.entity";
import { UserVote } from "src/db/models/votes.entity";
import { VoteService } from "./services/vote.service";
import { VoteResolver } from "./resolvers/vote.resolver";
import { PubSubModule } from "./pubsub.module";

@Module({
  imports: [TypeOrmModule.forFeature([Board, User, UserVote]), PubSubModule],
  providers: [BoardResolver, BoardService, VoteResolver, VoteService],
})
export class GQLModule {}
