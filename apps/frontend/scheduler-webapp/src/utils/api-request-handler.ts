import { AxiosResponse, AxiosError } from 'axios';

export type ApiResponseError = {
  error: string;
  message: string;
  statusCode: number;
};

export type ApiResponseData<T> = Partial<ApiResponseError> & {
  success: boolean;
  data?: T;
};

export const handleApiRequest = async <ResponseData>(
  request: Promise<AxiosResponse<ResponseData>>
): Promise<ApiResponseData<ResponseData>> => {
  const apiResponse: ApiResponseData<ResponseData> = {
    success: false,
  };
  try {
    const response = await request;
    apiResponse.data = response.data;
    apiResponse.success = true;
  } catch (err: unknown) {
    if (err instanceof AxiosError) {
      const errorResponse = err.response?.data as ApiResponseError;
      apiResponse.error = errorResponse?.error || 'Unknown error';
      apiResponse.message = errorResponse?.message || '';
      apiResponse.statusCode = errorResponse?.statusCode || 500;
    }
  }
  return apiResponse;
};
