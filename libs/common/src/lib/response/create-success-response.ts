import type {
  ApiResponseMeta,
  ApiSuccessResponse,
} from '../types/api-response.types';

type CreateSuccessResponseOptions = {
  message?: string;
  meta?: ApiResponseMeta;
};

export function createSuccessResponse<T>(
  data: T,
  options: CreateSuccessResponseOptions = {},
): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
    ...(options.message ? { message: options.message } : {}),
    ...(options.meta ? { meta: options.meta } : {}),
  };
}
