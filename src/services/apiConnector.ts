import axios, { AxiosRequestHeaders, Method } from "axios";

export const axiosInstance = axios.create({});

export const apiConnector = (
  method: Method,
  url: string,
  bodyData?: Record<string, any> | null,
  headers?: AxiosRequestHeaders | null,
  params?: Record<string, any> | null
) => {
  return axiosInstance({
    method,
    url,
    data: bodyData || null,
    headers: headers || undefined,
    params: params || undefined,
    withCredentials: true,
  });
};
