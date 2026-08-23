export type { SavedOrderResult, PrintableOrderImage } from "./useOrderFormState";

export type FormorderActions = {
  saveOrder: (
    images?: import("./useOrderFormState").PrintableOrderImage[],
  ) => Promise<import("./useOrderFormState").SavedOrderResult | null>;
};
