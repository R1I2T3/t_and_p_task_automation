import { atom } from "jotai";

interface FormElementsType {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  type: string;
  options?: string[];
}
export const formElementAtom = atom<FormElementsType[] | []>([]);
