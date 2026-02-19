'use client';

import { useState } from "react";

export default function OrderForm() {
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    //get flower type from db in supabase
    const [flowerType, setFlowerType] = useState([]);
    const [quantity, setQuantity] = useState(1);

    return (
        <div>
            <h1>ใบสั่งซื้อ จ้าา</h1>
        </div>
    );
}
