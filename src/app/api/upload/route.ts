import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export const config = {
    api: {
        bodyParser: {
            sizeLimit: "10mb", // Increase the body size limit for file uploads
        },
    },
};

export async function POST(req: Request) {
    try {
        // Parse the request body as JSON
        const body = await req.json();
        const { file } = body; // Expecting a base64-encoded file

        if (!file) {
            return NextResponse.json(
                { message: "No file provided" },
                { status: 400 }
            );
        }

        // Upload the base64-encoded file to Cloudinary
        const result = await cloudinary.uploader.upload(file, {
            upload_preset: "med-tech-preset", // Replace with your Cloudinary upload preset
        });

        // Return the file URL
        return NextResponse.json({ fileUrl: result.secure_url }, { status: 200 });
    } catch (error) {
        console.error("Error uploading file:", error);
        return NextResponse.json(
            { message: "Failed to upload file" },
            { status: 500 }
        );
    }
}