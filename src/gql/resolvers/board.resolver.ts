import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
  Subscription,
} from "@nestjs/graphql";
import { Board, BoardStatus } from "src/db/models/board.entity";
import { BoardService } from "../services/board.service";
import { UserBoardStatus, UserVote } from "src/db/models/votes.entity";
import { UserDecorator } from "../decorators/user.decorator";
import { User } from "src/db/models/user.entity";
import { AuthGuard } from "../guards/user.guard";
import { Inject, UseGuards } from "@nestjs/common";
import { UserGetterGuard } from "../guards/userGetter.guard";
import { PubSub } from "graphql-subscriptions";

@UseGuards(UserGetterGuard)
@Resolver(() => Board)
export class BoardResolver {
  constructor(
    private readonly boardService: BoardService,
    @Inject("PUB_SUB") private readonly pubsub: PubSub,
  ) {}

  @Query(() => [Board])
  async boards(): Promise<Board[]> {
    return this.boardService.findAll();
  }

  @Query(() => Board, { nullable: true })
  async board(@Args("code") code: string): Promise<Board> {
    return this.boardService.findOne(code);
  }

  @ResolveField(() => [UserVote], { name: "userVotes", nullable: false })
  async resolveUserVotes(@Parent() board: Board) {
    return this.boardService.findUserVotes(board.id);
  }

  @Mutation(() => Board)
  @UseGuards(AuthGuard)
  async createBoard(@Args("title") title: string): Promise<Board> {
    return this.boardService.createBoard(title);
  }

  @Mutation(() => Boolean)
  async updateBoardTicket(
    @Args("code") code: string,
    @Args("ticket", { nullable: true }) ticket: string | null,
  ): Promise<boolean> {
    return this.boardService.updateBoardTicket(code, ticket);
  }

  @Mutation(() => Boolean)
  async changeBoardStatus(
    @Args("code") code: string,
    @Args("status", { type: () => BoardStatus }) status: BoardStatus,
    @UserDecorator() user: User,
  ): Promise<boolean> {
    return this.boardService.changeBoardStatus(code, status, user.id);
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  async joinBoard(@Args("code") code: string, @UserDecorator() user: User) {
    return this.boardService.joinBoard(code, user.id);
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  async changeAdminStatus(
    @Args("code") code: string,
    @UserDecorator() user: User,
    @Args("admin") admin: boolean,
    @Args("userId", { nullable: true, type: () => Int }) userId: number,
  ) {
    return this.boardService.changeAdminStatus(code, user.id, admin, userId);
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  async changeStatus(
    @Args("code") code: string,
    @Args("status", { type: () => UserBoardStatus }) status: UserBoardStatus,
    @UserDecorator() user: User,
  ) {
    return this.boardService.changeStatus(code, user.id, status);
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  async changeVote(
    @Args("code") code: string,
    @Args("vote", { type: () => String, nullable: true })
    vote: string | null,
    @UserDecorator() user: User,
  ) {
    return this.boardService.changeVote(code, user.id, vote);
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  async removeUserFromBoard(
    @Args("code") code: string,
    @UserDecorator() user: User,
    @Args("userId", { type: () => Int }) userId: number,
  ) {
    return this.boardService.removeUserFromBoard(code, user.id, userId);
  }

  @Mutation(() => Boolean)
  async resetVotes(
    @UserDecorator() user: User,
    @Args("code") code: string,
    @Args("userId", {
      type: () => Int,
      nullable: true,
      description: "If null, all votes are cleared",
    })
    userId: number,
  ) {
    return this.boardService.resetVotes(code, user.id, userId);
  }

  @Subscription(() => Board, {
    filter: (payload, variables) => {
      return payload.boardUpdate.code === variables.code;
    },
  })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  boardUpdate(@Args("code") code: string) {
    return this.pubsub.asyncIterator("boardUpdate");
  }
}
