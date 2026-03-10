import React from 'react'
import FileUploader from './Fileuploader'   
import FileUploaderActual from './FileuploaderActual'
import Swal from "sweetalert2";

export const UploadPic = () => {
    return (
        <div className="flex w-full flex-col">
            <div className="card bg-base-200 rounded-box grid h-auto place-items-center"><FileUploader/></div>
            <div className="divider"></div>
            <div className="card bg-base-200 rounded-box grid h-auto place-items-center"><FileUploaderActual/></div>
            <button className="btn btn-soft btn-primary" onClick={
                () => Swal.fire({
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
                })
            }>บันทึกออเดอร์</button>
            <button className="btn btn-soft btn-secondary">พิมพ์ใบออเดอร์</button>
        </div>
    )
}
