import * as pdfjsLib from 'pdfjs-dist'
import type { TextItem } from 'pdfjs-dist/types/src/display/api'
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

// Set the worker URL once at module-import time (before any getDocument calls)
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl

const MAX_PDF_BYTES = 10 * 1024 * 1024 // 10 MB

export async function extractPdfText(file: File): Promise<string> {
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    throw new Error('Please select a PDF file.')
  }
  if (file.size > MAX_PDF_BYTES) {
    throw new Error('PDF is too large. Please use a file under 10 MB.')
  }

  const arrayBuffer = await file.arrayBuffer()

  let pdf
  try {
    pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  } catch {
    throw new Error(
      'Could not read this PDF. Please try a different file or paste your resume manually.',
    )
  }

  const pageTexts: string[] = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()
    const pageText = textContent.items
      .filter((item): item is TextItem => 'str' in item)
      .map((item) => item.str)
      .join(' ')
    pageTexts.push(pageText)
  }

  const text = pageTexts.join('\n').replace(/  +/g, ' ').trim()

  if (!text) {
    throw new Error(
      'No readable text found in this PDF. It may be scanned or image-only. Please paste your resume manually.',
    )
  }

  return text
}
