import { createValidationPipe } from '@org/common';
import { LoginDto } from './login.dto';
import { RefreshTokenDto } from './refresh-token.dto';
import { RegisterDto } from './register.dto';

describe('Auth DTOs', () => {
  const pipe = createValidationPipe();

  it('normalizes email casing and trims fullName for register input', async () => {
    await expect(
      pipe.transform(
        {
          email: '  USER@Example.com  ',
          password: 'StrongPass123',
          fullName: '  Nguyen Van A  ',
        },
        {
          type: 'body',
          metatype: RegisterDto,
        },
      ),
    ).resolves.toEqual({
      email: 'user@example.com',
      password: 'StrongPass123',
      fullName: 'Nguyen Van A',
    });
  });

  it('rejects invalid register payloads', async () => {
    await expect(
      pipe.transform(
        {
          email: 'not-an-email',
          password: 'short',
          fullName: '   ',
        },
        {
          type: 'body',
          metatype: RegisterDto,
        },
      ),
    ).rejects.toMatchObject({
      response: expect.objectContaining({
        message: expect.arrayContaining([
          'email must be an email',
          'password must be longer than or equal to 8 characters',
          'fullName should not be empty',
        ]),
      }),
    });
  });

  it('rejects missing refreshToken values', async () => {
    await expect(
      pipe.transform(
        {},
        {
          type: 'body',
          metatype: RefreshTokenDto,
        },
      ),
    ).rejects.toMatchObject({
      response: expect.objectContaining({
        message: expect.arrayContaining([
          'refreshToken should not be empty',
          'refreshToken must be a string',
        ]),
      }),
    });
  });

  it('normalizes login email input', async () => {
    await expect(
      pipe.transform(
        {
          email: '  USER@Example.com  ',
          password: 'StrongPass123',
        },
        {
          type: 'body',
          metatype: LoginDto,
        },
      ),
    ).resolves.toEqual({
      email: 'user@example.com',
      password: 'StrongPass123',
    });
  });
});
