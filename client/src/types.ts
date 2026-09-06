export interface APIError {
  success: false;
  message: string;
  error_code: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface APIResponse<T> {
  success: true;
  message: string;
  data: T;
}
