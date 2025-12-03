
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// Ensure MONGODB_URI is set
if (!process.env.MONGODB_URI) {
    console.warn("Warning: MONGODB_URI is not defined in .env.local");
} else {
    console.log("MONGO_URI loaded from .env.local");
}

const FILE_PATH = "C:/Users/ankit/Desktop/college-connect/syllabus-tool/backend/uploads/bookbtech118092025.pdf";

async function ingest() {
    try {
        // Dynamic imports to ensure env var is set before module load
        const { connectDb, getGridFSBucket } = await import("./src/lib/syllabus/db");
        const { parsePdfAndExtract } = await import("./src/lib/syllabus/pdfParser");
        const { DocumentModel } = await import("./src/models/syllabus/Document");
        const { PageModel } = await import("./src/models/syllabus/Page");

        console.log("Step 1: Connecting to DB...");
        await connectDb();
        console.log("Step 1: Connected.");

        if (!fs.existsSync(FILE_PATH)) {
            console.error("File not found:", FILE_PATH);
            return;
        }

        const filename = path.basename(FILE_PATH);
        const buffer = fs.readFileSync(FILE_PATH);

        // 1. Upload to GridFS
        console.log("Step 2: Uploading to GridFS...");
        const bucket = getGridFSBucket();
        const uploadStream = bucket.openUploadStream(filename);

        const streamPromise = new Promise((resolve, reject) => {
            uploadStream.on("finish", resolve);
            uploadStream.on("error", reject);
            uploadStream.end(buffer);
        });

        await streamPromise;
        console.log("Step 2: Uploaded to GridFS");

        // 2. Parse PDF
        console.log("Step 3: Parsing PDF...");
        const docData = await parsePdfAndExtract(FILE_PATH);
        console.log("Step 3: PDF Parsed. Pages:", docData.pages.length);

        // 3. Save Document Metadata
        console.log("Step 4: Saving Metadata...");
        const newDoc = await DocumentModel.create({
            title: docData.title,
            filename: filename,
            metadata: { ...docData.meta, entries: docData.entries }
        });
        console.log("Document saved:", newDoc._id);

        // 4. Save Pages
        const pageDocs = docData.pages.map(p => ({
            docId: newDoc._id,
            pageNumber: p.pageNumber,
            text: p.text,
            subject: p.subject,
            code: p.code,
            topics: p.topics
        }));
        await PageModel.insertMany(pageDocs);
        console.log("Pages saved:", pageDocs.length);

        process.exit(0);

    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

ingest();
