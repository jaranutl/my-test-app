"use client";

import { Formorder } from "@/components/formorder/Formorder";
import type { FormorderActions } from "@/components/formorder/Formorder";
import { UploadPic } from "@/components/formorder/uploadpic";
import { useRef, useState } from "react";

export default function OrderForm() {
  const formorderRef = useRef<FormorderActions>(null);
  const [statusMessage, setStatusMessage] = useState("");

  return (
    <div className="flex w-auto h-auto m-3">
      <div className="card rounded-box grid h-auto grow">
        <Formorder ref={formorderRef} onStatusChange={setStatusMessage} />
      </div>
      <div className="divider divider-horizontal"></div>
      <div className="card rounded-box grid h-auto grow place-items-center">
        <UploadPic
          onSaveOrder={(images) =>
            formorderRef.current?.saveOrder(images) ?? null
          }
          onPrintOrder={(orderId) => formorderRef.current?.printOrder(orderId)}
          statusMessage={statusMessage}
        />
      </div>
    </div>
  );
}
