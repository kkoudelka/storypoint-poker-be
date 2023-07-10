import {
  Args,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from "@nestjs/graphql";
import { VoteService } from "../services/vote.service";
import { User } from "src/db/models/user.entity";
import { UserService } from "../services/user.service";
import { UseGuards } from "@nestjs/common";
import { AuthGuard } from "../guards/user.guard";
import { UserGetterGuard } from "../guards/userGetter.guard";
import { UserDecorator } from "../decorators/user.decorator";

@Resolver(() => User)
@UseGuards(UserGetterGuard)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  async changeDisplayName(
    @Args("displayName") displayName: string,
    @UserDecorator() user: User,
  ) {
    return this.userService.changeDisplayName(user, displayName);
  }
}
