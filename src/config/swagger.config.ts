import { DocumentBuilder } from '@nestjs/swagger';

export const getSwaggerConfig = () => {
  return new DocumentBuilder()
    .setTitle('Nest Auth API')
    .setDescription(
      [
        'REST API for user authentication with JWT.',
        '',
        '**Authentication flow:**',
        '1. `POST /auth/register` or `POST /auth/login` — returns `accessToken` and sets `refreshToken` httpOnly cookie.',
        '2. Protected routes — send `Authorization: Bearer <accessToken>`.',
        '3. `POST /auth/refresh` — renews tokens using the `refreshToken` cookie.',
        '4. `POST /auth/logout` — clears the refresh token cookie.',
      ].join('\n'),
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Paste the accessToken received from login or register',
      },
      'access-token',
    )
    .addCookieAuth('refreshToken', {
      type: 'apiKey',
      in: 'cookie',
      name: 'refreshToken',
      description:
        'HttpOnly cookie set automatically on login/register/refresh',
    })
    .addTag('App', 'Health check')
    .addTag('Auth', 'Registration, login, tokens and profile')
    .build();
};
