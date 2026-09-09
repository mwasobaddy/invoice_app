import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { put } from "@vercel/blob";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const form = await request.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "File too large (5MB max)" }, { status: 413 });
    const allowed = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowed.includes(file.type)) return NextResponse.json({ error: "Invalid mime" }, { status: 400 });
    // Requires BLOB_READ_WRITE_TOKEN env in Vercel
    const blob = await put(`receipts/${user.id}/${Date.now()}-${file.name}`, file, { access: "public" });
    return NextResponse.json({ url: blob.url, mime: file.type });
  } catch (e) {
    if (e instanceof Error && e.message.includes("Unauthorized")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // Fallback if Blob not configured — return placeholder
    console.error("upload error", e);
    return NextResponse.json({ error: "Upload failed — configure BLOB_READ_WRITE_TOKEN" }, { status: 500 });
  }
}
