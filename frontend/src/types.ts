export interface TodoItem {
  id: string;
  todoText: string;
  isDone: boolean;
  createdAt: string;
  updatedAt: string;
  description?: string | null; 
  dueDate?: string | null;
}
