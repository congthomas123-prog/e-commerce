export type ApiResponseMeta = Record<string, unknown>;

export type ApiSuccessResponse<T> = {
  success: true;
  message?: string;
  data: T;
  meta?: ApiResponseMeta;
};

export type ApiErrorResponse = {
  success: false;
  message: string;
  errorCode: string;
  details?: unknown;
  timestamp: string;
  path?: string;
};
