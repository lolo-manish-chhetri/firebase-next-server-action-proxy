import "./load-env";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: "http://localhost:3000",
    credentials: true,
  });
  console.log("process.env.NEST_PORT", process.env.NEST_PORT);
  const port = process.env.NEST_PORT || 4000;
  await app.listen(port);
  console.log(`NestJS backend running on http://localhost:${port}`);
}
bootstrap();
