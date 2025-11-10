export interface Reply {
  id: string;
  author: string;
  message: string;
  replies: Reply[];
}

export interface Conversation {
  id: string;
  author: string;
  message: string;
  replies: Reply[];
}
