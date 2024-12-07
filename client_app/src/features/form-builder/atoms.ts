import { atom } from "jotai";
interface optionsType {
  value: string;
}
interface FormElementsType {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  type: string;
  options?: optionsType[];
}
export const formElementAtom = atom<FormElementsType[] | []>([]);
export const editFormElementAtom = atom<FormElementsType | null>(null);
