// This service handles client-side rendering of PDF pages to Canvas/Images
// It relies on pdfjsLib being loaded via CDN in index.html

export const renderPageToImage = async (file: File, pageIndex: number = 0, scale: number = 1.5): Promise<{ imageData: string, width: number, height: number, pageCount: number }> => {
  const arrayBuffer = await file.arrayBuffer();
  
  // @ts-ignore - pdfjsLib is global from CDN
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const pageCount = pdf.numPages;
  
  if (pageIndex >= pageCount) {
    throw new Error(`Page index ${pageIndex} out of bounds`);
  }

  const page = await pdf.getPage(pageIndex + 1); // PDF.js is 1-indexed
  const viewport = page.getViewport({ scale });
  
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.height = viewport.height;
  canvas.width = viewport.width;

  if (!context) throw new Error("Canvas context not available");

  await page.render({
    canvasContext: context,
    viewport: viewport
  }).promise;

  return {
    imageData: canvas.toDataURL('image/png'),
    width: viewport.width,
    height: viewport.height,
    pageCount
  };
};
