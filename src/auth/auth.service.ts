import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/db/models/user.entity";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  private async verifyPassword(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  }

  private async hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  }

  async login(email: string, password: string) {
    if (!email || !password) {
      throw new InternalServerErrorException();
    }

    try {
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        throw new NotFoundException("User is not registered");
      }

      const isMatch = await this.verifyPassword(password, user.password);
      if (!isMatch) {
        throw new UnauthorizedException("Incorrect credentials");
      }

      const profilePic = this.resolveProfilePic(user);

      return { ...user, password: undefined, profilePic };
    } catch (e) {
      this.logger.error("Error while logging in");
      this.logger.error(e);
      throw new InternalServerErrorException(e);
    }
  }

  resolveProfilePic(user: User) {
    if (user.profilePic) {
      return `${process.env.BE_URL}/images/id/${user.profilePic}`;
    } else {
      return `https://api.dicebear.com/5.x/bottts-neutral/svg?seed=${user.email}`;
    }
  }

  async registerUser(email: string, password: string, name: string) {
    try {
      const [, count] = await this.userRepository.findAndCount({
        where: { email },
      });

      if (count > 0) {
        throw new ConflictException(
          "User with this email address already exists",
        );
      }

      const hashed = await this.hashPassword(password);

      const u = new User();
      u.email = email;
      u.password = hashed;
      u.username = name;

      const user = await this.userRepository.save(u);

      return { ...user, password: undefined };
    } catch (error) {
      this.logger.error("Error while registering user");
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }
}
