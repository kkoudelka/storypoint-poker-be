import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/db/models/user.entity";
import { Repository } from "typeorm";

@Injectable()
export class UserGetterGuard implements CanActivate {
  private readonly logger = new Logger(UserGetterGuard.name);

  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);

    let token = ctx.getContext().req.headers?.authorization;
    token = token?.replace("Bearer ", "");
    if (!token) {
      return true;
    }

    try {
      this.jwtService.verify(token);
    } catch (error) {
      this.logger.error(error);

      throw new UnauthorizedException("Invalid token");
    }

    const decoded = this.jwtService.decode(token);

    const userId: number | null = decoded["user"]["id"];

    if (!userId) {
      return true;
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });

    ctx.getContext().user = user;
    return true;
  }
}
