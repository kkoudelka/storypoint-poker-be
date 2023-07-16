import { Controller, Get, Param, Res } from "@nestjs/common";
import { ImagesService } from "./images.service";
import type { Response } from "express";

@Controller("images")
export class ImagesController {
  constructor(private readonly imageService: ImagesService) {}

  @Get("/id/:id")
  async getImage(
    @Param("id") id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.imageService.getImage(id, res);
  }

  @Get("/all")
  async getAll() {
    return this.imageService.getAll();
  }
}
