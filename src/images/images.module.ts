import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ImagesService } from "./images.service";
import { ImagesController } from "./images.controller";
import { User } from "src/db/models/user.entity";

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [ImagesService],
  controllers: [ImagesController],
})
export class ImagesModule {}
