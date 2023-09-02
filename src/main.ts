import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import * as Sentry from "@sentry/node";

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

  Sentry.init({
    dsn: "https://46345f9a389ca8937372b9d30a9c66ba@o323670.ingest.sentry.io/4505811090472960",
    integrations: [],
    // Performance Monitoring
    tracesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
    // Set sampling rate for profiling - this is relative to tracesSampleRate
    profilesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
  });

  await app.listen(process.env.PORT ?? 3005);
}

bootstrap();
