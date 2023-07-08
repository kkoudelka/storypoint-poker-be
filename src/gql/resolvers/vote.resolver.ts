import { Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { UserVote } from "src/db/models/votes.entity";
import { VoteService } from "../services/vote.service";
import { User } from "src/db/models/user.entity";

@Resolver(() => UserVote)
export class VoteResolver {
  constructor(private readonly voteService: VoteService) {}

  @ResolveField(() => User, { name: "user" })
  async resolveUserVotes(@Parent() vote: UserVote) {
    return this.voteService.findUser(vote.userId);
  }
}
