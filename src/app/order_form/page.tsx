'use client';

import { Formorder } from "@/components/formorder/Formorder";
import { UploadPic } from "@/components/formorder/uploadpic";
import { useState } from "react";

export default function OrderForm() {
    return (
            <div className="flex w-auto h-auto m-3" >
                <div className="card rounded-box grid h-auto grow"><Formorder/></div>
                <div className="divider divider-horizontal"></div>
                <div className="card rounded-box grid h-auto grow place-items-center"><UploadPic/></div>
            </div>
    );
}
