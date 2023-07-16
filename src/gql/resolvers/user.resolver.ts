import {
  Args,
  Field,
  Int,
  Mutation,
  ObjectType,
  Parent,
  Query,
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

  @Mutation(() => User)
  @UseGuards(AuthGuard)
  async changePfp(
    @Args("pfp", { nullable: true, type: () => Int }) pfp: number | null,
    @UserDecorator() user: User,
  ): Promise<User> {
    return this.userService.changePfp(user, pfp);
  }

  @ResolveField("profilePic", () => String, { nullable: true })
  async resolveProfilePic(@Parent() user: User): Promise<string | null> {
    if (user.profilePic === null) {
      return `https://api.dicebear.com/5.x/bottts-neutral/svg?seed=${user.email}`;
    }
    return `${process.env.BE_URL}/images/id/${user.profilePic}`;
  }

  @Query(() => User)
  @UseGuards(AuthGuard)
  async getUser(@UserDecorator() user: User): Promise<User> {
    return this.userService.get(user.id);
  }

  @Query(() => [AvailableImage])
  async getAvailableImages(): Promise<
    {
      key: number;
      value: string;
    }[]
  > {
    const res: {
      key: number;
      value: string;
    }[] = [];
    for (let i = 1; i <= 18; i++) {
      res.push({
        key: i,
        value: `${process.env.BE_URL}/images/id/${i}`,
      });
    }

    return res;
  }
}

@ObjectType()
class AvailableImage {
  @Field()
  key: number;
  @Field()
  value: string;
}
