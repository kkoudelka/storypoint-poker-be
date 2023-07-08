import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { User } from "src/db/models/user.entity";

export const UserDecorator = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const context = GqlExecutionContext.create(ctx);

    const request = context.getContext();

    const user = request.user;

    return user as User;
  },
);
