import { ConfigService } from '@nestjs/config';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { Logger } from 'nestjs-pino';
import * as hpp from 'hpp';
import helmet from 'helmet';
import * as basicAuth from 'express-basic-auth';
import * as session from 'express-session';
import * as cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { swaggerDetails } from './common';

const swaggerSetup = (app: INestApplication) => {
  const swaggerUsername = app.get(ConfigService).get('SWAGGER_USERNAME');
  const swaggerPassword = app.get(ConfigService).get('SWAGGER_PASSWORD');

  app.use(
    ['/swagger', '/api-json'],
    basicAuth({
      challenge: true,
      users: { [swaggerUsername]: swaggerPassword },
    }),
  );
  const config = new DocumentBuilder()
    .setTitle(swaggerDetails.title)
    .setDescription(swaggerDetails.description)
    .setVersion(swaggerDetails.description)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  swaggerSetup(app);
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  const configService: ConfigService = app.get(ConfigService);
  const prefix = configService.get<string>('PREFIX') || '/api/v1';
  app.setGlobalPrefix(prefix);
  app.useLogger(app.get(Logger));
  app.use(hpp());
  app.use(helmet());
  const allowedOrigins = [process.env.CLIENT_URL];
  app.enableCors({
    origin: function (origin, callback) {
      if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  app.use(
    session({
      secret: configService.get('OAUTH_SESSION_SECRET'),
      saveUninitialized: false,
      resave: false,
      cookie: {
        maxAge: Number(configService.get('OAUTH_SESSION_EXPIRY')),
      },
    }),
  );

  await app.listen(3000);
}
bootstrap();
