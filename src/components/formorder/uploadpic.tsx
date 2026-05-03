import React from 'react'
import FileUploader from './Fileuploader'   
import FileUploaderActual from './FileuploaderActual'
import Swal from "sweetalert2";

export const UploadPic = () => {

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
                }).then((result) => {
                    if (result.isConfirmed) {
                        Swal.fire({
                            title: "บันทึกออเดอร์สำเร็จ!",
                            text: "คุณได้บันทึกออเดอร์เรียบร้อยแล้ว",
                            icon: "success"
                        });
                    }
                });
    }


    return (
        <div className="flex w-full flex-col">
            <div className="card bg-base-200 rounded-box grid h-auto place-items-center"><FileUploader/></div>
            <div className="divider"></div>
            <div className="card bg-base-200 rounded-box grid h-auto place-items-center"><FileUploaderActual/></div>
            <div className="divider"></div>
            <button className="btn btn-soft btn-primary mb-3" onClick={handleSubmitOrder}>บันทึกออเดอร์</button>
            <button className="btn btn-soft btn-secondary" onClick={handlePrintOrder}>พิมพ์ใบออเดอร์</button>
        </div>
    )
}
