import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        // 1. Get the latest order_no
        const { data: lastOrder } = await supabase
            .from("order")
            .select("order_no")
            .order("order_no", { ascending: false })
            .limit(1)
            .single();

        // 2. Generate new order_no
        const today = new Date().toISOString().slice(0, 10).replace(/-/g, ""); // "20260317"
        let newSeq = 1;

        if (lastOrder?.order_no) {
            const lastSeq = parseInt(lastOrder.order_no.split("-")[2] ?? "0");
            newSeq = lastSeq + 1;
        }

        const order_no = `ORD-${today}-${String(newSeq).padStart(4, "0")}`;
        // result: "ORD-20260317-0001"

        // 3. Insert new order with generated order_no
        const body = await request.json().catch(() => ({}));

        const { data, error } = await supabase
            .from("order")
            .insert({ ...body, order_no })
            .select("order_no")
            .single();

        if (error) throw error;

        return NextResponse.json({ order_no: data.order_no }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed" },
            { status: 500 }
        );
    }
}

