import { IsEmail } from 'class-validator';
import { ToTrimmedString } from './decorators/to-trimmed-string.decorator';
import { createValidationPipe } from './create-validation-pipe';

class EmailDto {
  @IsEmail()
  @ToTrimmedString()
  email!: string;
}

describe('createValidationPipe', () => {
  it('strips unknown fields and transforms valid values', async () => {
    const pipe = createValidationPipe();

    const value = await pipe.transform(
      { email: '  user@example.com  ', ignored: true },
      {
        type: 'body',
        metatype: EmailDto,
      },
    );

    expect(value).toEqual({ email: 'user@example.com' });
  });

  it('rejects invalid dto input', async () => {
    const pipe = createValidationPipe();

    await expect(
      pipe.transform(
        { email: 'not-an-email' },
        {
          type: 'body',
          metatype: EmailDto,
        },
      ),
    ).rejects.toMatchObject({
      response: expect.objectContaining({
        message: expect.arrayContaining(['email must be an email']),
      }),
    });
  });
});
