import axios from "axios";
import { env } from "@/config/env";
import { AuthResponse, LoginPayload, SignupPayload } from "../types";

const api = axios.create({
  baseURL: env.API_URL,
});

export const signupApi = async (data: SignupPayload): Promise<AuthResponse> => {
  const res = await api.post("/auth/signup", data);
  return res.data;
};

export const loginApi = async (data: LoginPayload): Promise<AuthResponse> => {
  const res = await api.post("/auth/login", data);
  return res.data;
};
