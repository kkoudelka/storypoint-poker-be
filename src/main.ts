import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: "*",
  });

  const config = new DocumentBuilder()
    .setTitle("API")
    .setDescription(
      `Available REST api<br /><br />
       GraphQL - <a href='https://studio.apollographql.com/sandbox/explorer'>Sandbox</a> | Endpoint - <a href='/graphql'>/graphql</a>`,
    )
    .setVersion("1.0")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("/", app, document);

  await app.listen(process.env.PORT ?? 3005);
}
bootstrap();
