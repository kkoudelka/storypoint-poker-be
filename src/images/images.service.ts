import {
  Injectable,
  InternalServerErrorException,
  StreamableFile,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { createReadStream } from "node:fs";
import { join } from "node:path";
import { User } from "src/db/models/user.entity";
import { Repository } from "typeorm";
import type { Response } from "express";

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getImage(id: string, response: Response) {
    try {
      const file = createReadStream(
        join(process.cwd(), "/src/assets/profiles/", `${id}.jpg`),
      );
      response.set({
        "Content-Type": "image/jpeg",
        "Content-Disposition": `inline; filename="${id}.jpg"`,
      });
      return new StreamableFile(file, {});
    } catch (error) {
      throw new InternalServerErrorException("Could not find image");
    }
  }

  getAll() {
    const arr = [];

    for (let i = 1; i <= 18; i++) {
      arr.push(`${process.env.BE_URL}/images/id/${i}`);
    }

    return arr;
  }
}
