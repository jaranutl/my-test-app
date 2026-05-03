"use client";

import FileUploader from './Fileuploader'
import FileUploaderActual from './FileuploaderActual'
import Swal from "sweetalert2";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { resetOrder } from "@/store/orderSlice";
import { api } from "@/lib/axios";

export const UploadPic = () => {
    const dispatch = useAppDispatch();
    const order = useAppSelector((s) => s.order);

    const handlePrintOrder = () => {
        Swal.fire({
            title: "พิมพ์ใบออเดอร์",
            text: "คุณต้องการพิมพ์ใบออเดอร์นี้หรือไม่?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "พิมพ์",
            cancelButtonText: "ยกเลิก"
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: "พิมพ์ใบออเดอร์สำเร็จ!",
                    text: "ใบออเดอร์ของคุณกำลังถูกพิมพ์",
                    icon: "success"
                });
            }
        });
    };

    const handleSubmitOrder = () => {
        Swal.fire({
            title: "ยืนยันการบันทึกออเดอร์",
            text: "คุณต้องการบันทึกออเดอร์เรียบร้อยแล้ว",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "ยืนยัน",
            cancelButtonText: "ยกเลิก"
        }).then(async (result) => {
            if (!result.isConfirmed) return;

            try {
                await api.post("/api/posts/new_order_no", {
                    line_name: order.lineName,
                    phone: order.phone,
                    flower_price: order.flowerPrice,
                    delivery_date: order.deliveryDate,
                    delivery_time: order.deliveryTime,
                    rows: order.rows,
                    paper_color: order.paperColor,
                    bow_color: order.bowColor,
                    pick_up_mode: order.pickUpMode,
                    actual_flower_pic: order.actualFlowerPic,
                    example_flower_pic: order.exampleFlowerPic,
                    card_text: order.cardText,
                    deliver_type: order.deliverType,
                    total_price: order.totalPrice,
                    receiver_name: order.receiverName,
                    receiver_phone: order.receiverPhone,
                    address_name: order.addressName,
                    map_url: order.mapURL,
                });

                dispatch(resetOrder());

                Swal.fire({
                    title: "บันทึกออเดอร์สำเร็จ!",
                    text: "คุณได้บันทึกออเดอร์เรียบร้อยแล้ว",
                    icon: "success"
                });
            } catch {
                Swal.fire({
                    title: "เกิดข้อผิดพลาด!",
                    text: "ไม่สามารถบันทึกออเดอร์ได้ กรุณาลองใหม่อีกครั้ง",
                    icon: "error"
                });
            }
        });
    };

    return (
        <div className="flex w-full flex-col">
            <div className="card bg-base-200 rounded-box grid h-auto place-items-center"><FileUploader /></div>
            <div className="divider"></div>
            <div className="card bg-base-200 rounded-box grid h-auto place-items-center"><FileUploaderActual /></div>
            <div className="divider"></div>
            <button className="btn btn-soft btn-primary mb-3" onClick={handleSubmitOrder}>บันทึกออเดอร์</button>
            <button className="btn btn-soft btn-secondary" onClick={handlePrintOrder}>พิมพ์ใบออเดอร์</button>
        </div>
    )
}
