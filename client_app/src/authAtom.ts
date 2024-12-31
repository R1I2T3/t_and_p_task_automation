import { atom } from "jotai";

interface Auth {
  email: string;
  role: string;
  department?: string;
  program?: string;
  academic_year?: string;
}
export const authAtom = atom<Auth | null>(null);
