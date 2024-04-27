export interface Task {
  id?: number; // Mark id as optional
  endpoint: string;
  data: any;
  delay: number;
  method: string;
  status: string;
  userId: number;
}
