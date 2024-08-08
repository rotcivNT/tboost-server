export interface ApiResponse<T> {
  statusCode: number;
  status: string;
  data: T;
  message: string;
}
