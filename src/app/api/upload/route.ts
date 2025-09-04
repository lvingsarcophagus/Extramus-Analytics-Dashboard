import { NextRequest, NextResponse } from 'next/server';
import multer from 'multer';
import { promisify } from 'util';
import fs from 'fs';

const uploadDir = './uploads';

// Ensure the upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

export const config = {
  api: {
    bodyParser: false,
  },
};

const runMiddleware = (req: any, res: any, fn: any) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

export async function POST(req: NextRequest) {
  const res = new NextResponse();
  try {
    await runMiddleware(req, res, promisify(upload.single('file')));

    // After the middleware runs, the file will be in req.file
    const anyReq = req as any;
    if (!anyReq.file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    return NextResponse.json({
      message: 'File uploaded successfully',
      document: {
        filename: anyReq.file.filename,
        originalName: anyReq.file.originalname,
        mimeType: anyReq.file.mimetype,
        size: anyReq.file.size,
        documentType: anyReq.body.documentType,
        notes: anyReq.body.notes,
      },
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
