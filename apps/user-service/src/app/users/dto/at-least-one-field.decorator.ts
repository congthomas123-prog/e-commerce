import {
  registerDecorator,
  type ValidationArguments,
  type ValidationOptions,
} from 'class-validator';

export function AtLeastOneField(
  fields: string[],
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return (target: object, propertyName: string | symbol) => {
    registerDecorator({
      name: 'atLeastOneField',
      target: target.constructor,
      propertyName: String(propertyName),
      constraints: [fields],
      options: validationOptions,
      validator: {
        validate(_: unknown, args: ValidationArguments) {
          const [fieldNames] = args.constraints as [string[]];
          const value = args.object as Record<string, unknown>;

          return fieldNames.some((fieldName) => value[fieldName] !== undefined);
        },
      },
    });
  };
}
