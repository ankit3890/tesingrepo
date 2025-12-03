
import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/syllabus/db";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDb();

        // Import model after connection is established
        const { DocumentModel } = await import("@/models/syllabus/Document");

        const { id } = await params;

        console.log(`[Syllabus Subject] Looking for document with ID: ${id}`);

        const doc = await DocumentModel.findById(id);
        if (doc) {
            console.log(`[Syllabus Subject] Found document: ${doc.title}`);
            return NextResponse.json({ doc, entries: doc.metadata.entries || [] });
        }

        console.log(`[Syllabus Subject] Document not found for ID: ${id}`);
        return new NextResponse("not found", { status: 404 });
    } catch (err) {
        console.error("[Syllabus Subject] Error:", err);
        return new NextResponse("error", { status: 500 });
    }
}
