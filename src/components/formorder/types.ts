import type { DateValue } from "@mantine/dates";

export type PickupMode = "workin" | "delivery";

export type FlowerRow = {
  id: string;
  type: string;
  color: string;
  quantity: number;
};

export type DeliveryInfo = {
  recipientName: string;
  recipientPhone: string;
  address: string;
  mapLink: string;
  deliveryPrice: string;
};

export type FlowerFormData = {
  rows: FlowerRow[];
  hasCard: boolean;
  cardMessage: string;
  paperColor: string;
  bowColor: string;
  bouquetPrice: string;
  deliveryDate: DateValue;
  deliveryTime: string;
  pickupMode: PickupMode;
  delivery: DeliveryInfo;
};

export const MAX_FLOWER_ROWS = 4;

export const createEmptyFlowerRow = (id: string): FlowerRow => ({
  id,
  type: "",
  color: "",
  quantity: 1,
});

export const isFlowerRowValid = (row: FlowerRow) =>
  row.type.trim() !== "" && row.color.trim() !== "" && row.quantity >= 1;

export const computeOrderTotal = (
  flower: Pick<FlowerFormData, "bouquetPrice" | "pickupMode" | "delivery">,
) => {
  const bouquet = Number(flower.bouquetPrice || 0);
  const deliveryFee =
    flower.pickupMode === "delivery" ? Number(flower.delivery.deliveryPrice || 0) : 0;
  return { bouquet, deliveryFee, total: bouquet + deliveryFee };
};
