import axios from "axios";
import { env } from "@/config/env";
import { Board } from "../types";

const getApi = (token: string) =>
  axios.create({
    baseURL: env.API_URL,
    headers: { Authorization: `Bearer ${token}` },
  });

export const createBoardApi = async (
  token: string,
  title: string
): Promise<Board> => {
  const res = await getApi(token).post("/boards", { title });
  return res.data;
};

export const getBoardsApi = async (token: string): Promise<Board[]> => {
  const res = await getApi(token).get("/boards");
  return res.data;
};

export const getBoardByIdApi = async (
  token: string,
  boardId: string
): Promise<Board> => {
  const res = await getApi(token).get(`/boards/${boardId}`);
  return res.data;
};

export const joinBoardApi = async (
  token: string,
  boardId: string
): Promise<void> => {
  await getApi(token).post(`/boards/${boardId}/join`);
};

export const deleteBoardApi = async (
  token: string,
  boardId: string
): Promise<void> => {
  await getApi(token).delete(`/boards/${boardId}`);
};
