import { NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import { createElement } from "react";
import AnnkaufsprofilPDF from "@/components/pdf/AnnkaufsprofilPDF";

export async function GET() {
  const stream = await renderToStream(createElement(AnnkaufsprofilPDF));
  return new NextResponse(stream as unknown as ReadableStream, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="NERO_Ankaufsprofil.pdf"',
    },
  });
}
