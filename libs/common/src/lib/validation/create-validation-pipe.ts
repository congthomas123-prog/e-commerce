import { ValidationPipe, type ValidationPipeOptions } from '@nestjs/common';

const DEFAULT_VALIDATION_PIPE_OPTIONS: ValidationPipeOptions = {
  whitelist: true,
  transform: true,
  forbidUnknownValues: false,
  transformOptions: {
    enableImplicitConversion: true,
  },
};

export function createValidationPipe(
  options: ValidationPipeOptions = {},
): ValidationPipe {
  return new ValidationPipe({
    ...DEFAULT_VALIDATION_PIPE_OPTIONS,
    ...options,
    transformOptions: {
      ...DEFAULT_VALIDATION_PIPE_OPTIONS.transformOptions,
      ...options.transformOptions,
    },
  });
}
