import { createSlice, PayloadAction } from "@reduxjs/toolkit"

type OrderRow = { id: string; type: string; color: string; quantity: number }

const orderSlice = createSlice({
    name: "order",
    initialState: {
        lineName: "", phone: "", orderNo: "",
        flowerPrice: 0, deliveryDate: null as string | null, deliveryTime: "",
        rows: [{ id: "", type: "", color: "", quantity: 0 }] as OrderRow[],
        paperColor: "",
        bowColor: "",
        pickUpMode: "",
        actualFlowerPic: "",
        exampleFlowerPic: "",
        cardText: "",
        deliverType: "",
        totalPrice: 0,
        receiverName: "",
        receiverPhone: "",
        addressName: "",
        mapURL: "",
    },
    reducers: {
        setLineName:        (state, action: PayloadAction<string>) => { state.lineName = action.payload },
        setPhone:           (state, action: PayloadAction<string>) => { state.phone = action.payload },
        setOrderNo:         (state, action: PayloadAction<string>) => { state.orderNo = action.payload },
        setFlowerPrice:     (state, action: PayloadAction<number>) => { state.flowerPrice = action.payload },
        setDeliveryDate:    (state, action: PayloadAction<string | null>) => { state.deliveryDate = action.payload },
        setDeliveryTime:    (state, action: PayloadAction<string>) => { state.deliveryTime = action.payload },
        setRows:            (state, action: PayloadAction<OrderRow[]>) => { state.rows = action.payload },
        setPaperColor:      (state, action: PayloadAction<string>) => { state.paperColor = action.payload },
        setBowColor:        (state, action: PayloadAction<string>) => { state.bowColor = action.payload },
        setPickUpMode:      (state, action: PayloadAction<string>) => { state.pickUpMode = action.payload },
        setActualFlowerPic: (state, action: PayloadAction<string>) => { state.actualFlowerPic = action.payload },
        setExampleFlowerPic:(state, action: PayloadAction<string>) => { state.exampleFlowerPic = action.payload },
        setCardText:        (state, action: PayloadAction<string>) => { state.cardText = action.payload },
        setDeliverType:     (state, action: PayloadAction<string>) => { state.deliverType = action.payload },
        setTotalPrice:      (state, action: PayloadAction<number>) => { state.totalPrice = action.payload },
        setReceiverName:    (state, action: PayloadAction<string>) => { state.receiverName = action.payload },
        setReceiverPhone:   (state, action: PayloadAction<string>) => { state.receiverPhone = action.payload },
        setAddressName:     (state, action: PayloadAction<string>) => { state.addressName = action.payload },
        setMapURL:          (state, action: PayloadAction<string>) => { state.mapURL = action.payload },
        resetOrder:         (state) => {
            state.lineName = ""; state.phone = ""; state.orderNo = "";
            state.flowerPrice = 0; state.deliveryDate = null; state.deliveryTime = "";
            state.rows = [{ id: "", type: "", color: "", quantity: 0 }];
            state.paperColor = ""; state.bowColor = ""; state.pickUpMode = "";
            state.actualFlowerPic = ""; state.exampleFlowerPic = "";
            state.cardText = ""; state.deliverType = ""; state.totalPrice = 0;
            state.receiverName = ""; state.receiverPhone = "";
            state.addressName = ""; state.mapURL = "";
        },
    }
});

export const {
    setLineName, setPhone, setOrderNo,
    setFlowerPrice, setDeliveryDate, setDeliveryTime,
    setRows, setPaperColor, setBowColor, setPickUpMode,
    setActualFlowerPic, setExampleFlowerPic, setCardText,
    setDeliverType, setTotalPrice, setReceiverName,
    setReceiverPhone, setAddressName, setMapURL,
    resetOrder,
} = orderSlice.actions

export default orderSlice.reducer
