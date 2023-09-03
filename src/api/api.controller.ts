import { Controller, Get, HttpCode } from "@nestjs/common";

@Controller("api")
export class ApiController {
  @Get("readiness")
  @HttpCode(200)
  async readiness() {
    return { status: "OK" };
  }

  @Get("healthz")
  @HttpCode(200)
  async healthz() {
    return { status: "OK" };
  }
}
