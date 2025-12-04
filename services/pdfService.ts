import { PDFDocument, StandardFonts, degrees, rgb, grayscale } from 'pdf-lib';

export const mergePdfs = async (files: File[]): Promise<Uint8Array> => {
  const mergedPdf = await PDFDocument.create();
  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }
  return await mergedPdf.save();
};

export const splitPdf = async (file: File): Promise<Uint8Array[]> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const numberOfPages = pdf.getPageCount();
  const resultFiles: Uint8Array[] = [];

  for (let i = 0; i < numberOfPages; i++) {
    const newPdf = await PDFDocument.create();
    const [copiedPage] = await newPdf.copyPages(pdf, [i]);
    newPdf.addPage(copiedPage);
    resultFiles.push(await newPdf.save());
  }
  return resultFiles;
};

export const organizePdf = async (file: File, actions: { rotate?: number, delete?: number[], reorder?: number[] }): Promise<Uint8Array> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  
  // 1. Delete Pages (Create new PDF and copy only desired pages)
  // For simplicity here, we'll just handle rotation in place if no delete/reorder
  if (actions.rotate) {
    const pages = pdf.getPages();
    pages.forEach(page => {
      const current = page.getRotation().angle;
      page.setRotation(degrees(current + actions.rotate!));
    });
    return await pdf.save();
  }
  return await pdf.save();
};

export const compressPdf = async (file: File): Promise<Uint8Array> => {
  const arrayBuffer = await file.arrayBuffer();
  // Using ignoreEncryption allows opening some protected files if password isn't strictly enforced for reading
  const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  // Removing unused objects and not using object streams can sometimes reduce size for simple PDFs, 
  // though pdf-lib is limited in actual compression algorithms (like downsampling images).
  return await pdf.save({ useObjectStreams: false }); 
};

export const protectPdf = async (file: File, password: string): Promise<Uint8Array> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const encrypted = await pdf.save({
    userPassword: password,
    ownerPassword: password,
    permissions: {
      printing: 'highResolution',
      modifying: false,
      copying: false,
      annotating: false,
      fillingForms: false,
      contentAccessibility: false,
      documentAssembly: false,
    },
  });
  return encrypted;
};

export const unlockPdf = async (file: File, password: string): Promise<Uint8Array> => {
  const arrayBuffer = await file.arrayBuffer();
  // Loading with password and saving without it removes protection
  const pdf = await PDFDocument.load(arrayBuffer, { password }); 
  return await pdf.save();
};

export const imagesToPdf = async (files: File[]): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.create();
  
  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    let image;
    try {
      if (file.type.includes('jpeg') || file.type.includes('jpg')) {
        image = await pdfDoc.embedJpg(arrayBuffer);
      } else if (file.type.includes('png')) {
        image = await pdfDoc.embedPng(arrayBuffer);
      } else {
        continue; // Skip unsupported
      }
      
      const page = pdfDoc.addPage([image.width, image.height]);
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height,
      });
    } catch (e) {
      console.warn("Skipping invalid image", file.name);
    }
  }
  
  return await pdfDoc.save();
};

export const pdfToPdfA = async (file: File): Promise<Uint8Array> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  
  // Fake PDF/A conversion by setting metadata. 
  // True PDF/A requires embedding color profiles and fonts which is heavy client-side.
  pdf.setTitle(file.name);
  pdf.setCreator('fuckkkkkkk! PDF Tool');
  pdf.setProducer('fuckkkkkkk! PDF Engine');
  pdf.setCreationDate(new Date());
  
  return await pdf.save();
};

// --- Editor Capabilities ---

export const applyOverlayToPdf = async (
  file: File, 
  overlayImageBase64: string, 
  pageIndex: number
): Promise<Uint8Array> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const pages = pdf.getPages();
  const page = pages[pageIndex];
  
  const pngImage = await pdf.embedPng(overlayImageBase64);
  const { width, height } = page.getSize();
  
  page.drawImage(pngImage, {
    x: 0,
    y: 0,
    width: width,
    height: height,
  });

  return await pdf.save();
};
