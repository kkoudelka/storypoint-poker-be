import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/db/models/user.entity";

import { Repository } from "typeorm";

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async changeDisplayName(user: User, displayName: string) {
    try {
      user.username = displayName.trim();
      await this.userRepository.save(user);
      return true;
    } catch (e) {
      this.logger.error(e);
      return false;
    }
  }
}
