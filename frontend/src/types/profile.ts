export interface StudentProfileCreate {
  name: string;
  branch: string;
  semester: number;
  year: number;
  preferred_mode?: string | null;
  preferred_location?: string | null;
  skills: string[];
  interests: string[];
}

export interface StudentProfileOut extends StudentProfileCreate {
  id: number;
  user_id: number;
}