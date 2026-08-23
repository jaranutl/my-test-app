export type OrderListSearchParams = {
  q?: string;
  deliveryDate?: string;
  pickupMode?: string;
  status?: string;
  page?: string;
};

export const ORDER_LIST_PAGE_SIZE = 25;
