import { Transform } from 'class-transformer';
import { trimString } from '../../utils/string/trim-string';

export function ToTrimmedString(): PropertyDecorator {
  return Transform(({ value }) => trimString(value));
}
