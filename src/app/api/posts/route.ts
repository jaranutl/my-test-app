import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File
        const orderId = formData.get('order_id') as string
        const type = formData.get('type') as string

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            )
        }

        if (!orderId || !type) {
            return NextResponse.json(
                { error: 'order_id and type are required' },
                { status: 400 }
            )
        }

        // Convert file to buffer
        const buffer = await file.arrayBuffer()
        const uint8Array = new Uint8Array(buffer)

        // Generate unique filename
        const timestamp = Date.now()
        const fileName = `${orderId}/${type}/${timestamp}-${file.name}`

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('posts') // Make sure this bucket exists in Supabase
            .upload(fileName, uint8Array, {
                contentType: file.type,
            })

        if (uploadError) throw uploadError

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('posts')
            .getPublicUrl(fileName)

        const fileUrl = urlData.publicUrl

        // Insert record into database
        const { data, error: dbError } = await supabase
            .from('posts')
            .insert([
                {
                    order_id: orderId,
                    type: type,
                    file_url: fileUrl,
                },
            ])
            .select()

        if (dbError) throw dbError

        return NextResponse.json(
            {
                success: true,
                data: data[0],
                file_url: fileUrl,
            },
            { status: 201 }
        )
    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Upload failed' },
            { status: 500 }
        )
    }
}