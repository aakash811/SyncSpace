export type CodeLanguage =
  | "javascript"
  | "typescript"
  | "python"
  | "html"
  | "css"
  | "json"
  | "markdown"
  | "java"
  | "cpp"
  | "go"
  | "rust";

export type CodeState = {
  code: string;
  language: CodeLanguage;
};
