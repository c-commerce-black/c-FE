export type ApiErrorPayload = {
  message: string;
  statusCode: number;
};

export type ApiResponse<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: ApiErrorPayload;
    };

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};
