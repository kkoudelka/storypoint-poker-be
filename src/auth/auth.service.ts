import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/db/models/user.entity";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
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

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException("User is not registered");
    }

    try {
      const isMatch = await this.verifyPassword(password, user.password);
      if (!isMatch) {
        throw new UnauthorizedException("Incorrect credentials");
      }

      const profilePic = this.resolveProfilePic(user);

      return { ...user, password: undefined, profilePic };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
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
    const [, count] = await this.userRepository.findAndCount({
      where: { email },
    });

    if (count > 0) {
      throw new ConflictException(
        "User with this email address already exists",
      );
    }

    try {
      const hashed = await this.hashPassword(password);

      const u = new User();
      u.email = email;
      u.password = hashed;
      u.username = name;

      const user = await this.userRepository.save(u);

      return { ...user, password: undefined };
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }
}
