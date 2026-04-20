export type Board = {
  id: string;
  title: string;
  ownerId: string;
  createdAt: string;
  state: any;
  members: BoardMember[];
};

export type BoardMember = {
  id: string;
  userId: string;
  boardId: string;
  role: "OWNER" | "EDITOR" | "VIEWER";
};
