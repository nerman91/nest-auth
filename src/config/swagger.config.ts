import { DocumentBuilder } from '@nestjs/swagger';

export const getSwaggerConfig = () => {
  return new DocumentBuilder()
    .setTitle('Awesome NestJS API')
    .setDescription('The API documentation for the Awesome NestJS API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('nestjs')
    .build();
};
