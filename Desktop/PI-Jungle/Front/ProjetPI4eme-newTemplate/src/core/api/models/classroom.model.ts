export interface Classroom {
  id: string | number;
  name: string;
  capacity?: number;
  location?: string;
  [key: string]: unknown;
}
