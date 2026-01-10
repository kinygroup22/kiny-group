// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('Upload request received');
    
    const data = await request.formData();
    console.log('FormData parsed');
    
    const file: File | null = data.get('file') as unknown as File;
    const folder = data.get('folder') as string || 'blog-images'; // Default folder
    console.log('File extracted:', file?.name, file?.type, file?.size);

    if (!file) {
      console.log('No file received');
      return NextResponse.json({ error: "No file received." }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      console.log('Invalid file type:', file.type);
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed." },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      console.log('File size exceeds limit:', file.size);
      return NextResponse.json(
        { error: "File size exceeds 10MB limit." },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate a unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || 'jpg';
    const sanitizedName = file.name
      .replace(/\.[^/.]+$/, '') // Remove extension
      .replace(/[^a-zA-Z0-9]/g, '_') // Replace special chars
      .substring(0, 50); // Limit length
    
    const filename = `${sanitizedName}_${timestamp}`;

    // Upload to Cloudinary
    return new Promise<NextResponse>((resolve) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: folder,
          public_id: filename,
          format: extension,
        },
        (error, result) => {
          if (error) {
            console.error("Error uploading to Cloudinary:", error);
            resolve(NextResponse.json(
              { error: "Failed to upload image." },
              { status: 500 }
            ));
            return;
          }

          if (!result) {
            console.error("No result from Cloudinary upload");
            resolve(NextResponse.json(
              { error: "Failed to upload image." },
              { status: 500 }
            ));
            return;
          }

          console.log('Cloudinary upload successful:', result.secure_url);
          resolve(NextResponse.json({ 
            url: result.secure_url,
            filename: result.public_id,
            size: result.bytes,
            type: result.format,
            width: result.width,
            height: result.height
          }));
        }
      );

      uploadStream.end(buffer);
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file. Please try again." },
      { status: 500 }
    );
  }
}

// Optional: Add DELETE endpoint to remove uploaded images from Cloudinary
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename) {
      return NextResponse.json({ error: "Filename is required." }, { status: 400 });
    }

    // Delete from Cloudinary
    return new Promise<NextResponse>((resolve) => {
      cloudinary.uploader.destroy(filename, (error, result) => {
        if (error) {
          console.error("Error deleting from Cloudinary:", error);
          resolve(NextResponse.json(
            { error: "Failed to delete image." },
            { status: 500 }
          ));
          return;
        }

        if (result?.result !== 'ok') {
          console.error("Unexpected result from Cloudinary delete:", result);
          resolve(NextResponse.json(
            { error: "Failed to delete image." },
            { status: 500 }
          ));
          return;
        }

        console.log('Cloudinary delete successful:', filename);
        resolve(NextResponse.json({ success: true, message: "Image deleted successfully." }));
      });
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { error: "Failed to delete file." },
      { status: 500 }
    );
  }
}