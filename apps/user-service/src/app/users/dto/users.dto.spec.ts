import { createValidationPipe } from '@org/common';
import { CreateUserDto } from './create-user.dto';
import { UpdateUserDto } from './update-user.dto';

describe('Users DTOs', () => {
  const pipe = createValidationPipe();

  it('normalizes email casing and trims fullName for create input', async () => {
    await expect(
      pipe.transform(
        {
          email: '  USER@Example.com  ',
          fullName: '  Nguyen Van A  ',
        },
        {
          type: 'body',
          metatype: CreateUserDto,
        },
      ),
    ).resolves.toEqual({
      email: 'user@example.com',
      fullName: 'Nguyen Van A',
    });
  });

  it('rejects invalid create payloads', async () => {
    await expect(
      pipe.transform(
        {
          email: 'not-an-email',
          fullName: '   ',
        },
        {
          type: 'body',
          metatype: CreateUserDto,
        },
      ),
    ).rejects.toMatchObject({
      response: expect.objectContaining({
        message: expect.arrayContaining([
          'email must be an email',
          'fullName should not be empty',
        ]),
      }),
    });
  });

  it('normalizes patch email input and trims fullName', async () => {
    await expect(
      pipe.transform(
        {
          email: '  USER@Example.com  ',
          fullName: '  Nguyen Van A  ',
        },
        {
          type: 'body',
          metatype: UpdateUserDto,
        },
      ),
    ).resolves.toEqual({
      email: 'user@example.com',
      fullName: 'Nguyen Van A',
    });
  });

  it('rejects empty patch payloads', async () => {
    await expect(
      pipe.transform(
        {},
        {
          type: 'body',
          metatype: UpdateUserDto,
        },
      ),
    ).rejects.toMatchObject({
      response: expect.objectContaining({
        message: expect.arrayContaining([
          'At least one of email or fullName must be provided',
        ]),
      }),
    });
  });
});
