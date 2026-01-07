(() => {
  const imageInput = document.getElementById('imageInput');
  const imageCanvas = document.getElementById('imageCanvas');
  const overlayContainer = document.getElementById('overlayContainer');
  const runOcrBtn = document.getElementById('runOcrBtn');
  const exportDocxBtn = document.getElementById('exportDocxBtn');
  const enableOverlayBtn = document.getElementById('enableOverlayBtn');
  const applyOverlayBtn = document.getElementById('applyOverlayBtn');
  const downloadImageBtn = document.getElementById('downloadImageBtn');
  const ocrText = document.getElementById('ocrText');
  const ocrStatus = document.getElementById('ocrStatus');

  const ctx = imageCanvas.getContext('2d');
  let loadedImage = null;
  let ocrResult = null;
  let overlayEnabled = false;
  let scaleX = 1, scaleY = 1;

  function setStatus(msg) {
    if (ocrStatus) ocrStatus.textContent = msg;
  }

  // Load selected image into canvas
  imageInput.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      loadedImage = img;
      const maxW = overlayContainer.clientWidth || 800;
      const scale = Math.min(1, maxW / img.width);
      imageCanvas.width = Math.floor(img.width * scale);
      imageCanvas.height = Math.floor(img.height * scale);
      ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
      ctx.drawImage(img, 0, 0, imageCanvas.width, imageCanvas.height);
      scaleX = imageCanvas.width / img.width;
      scaleY = imageCanvas.height / img.height;
      overlayContainer.innerHTML = '';
      ocrText.textContent = '';
      setStatus('Image loaded. Ready to extract text.');
    };
    img.onerror = () => setStatus('Failed to load image');
    img.src = url;
  });

  // Run OCR using Tesseract.js
  async function runOCR() {
    if (!loadedImage) {
      setStatus('Please upload an image first');
      return;
    }
    setStatus('Running OCR...');
    try {
      const worker = await Tesseract.createWorker();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      const { data } = await worker.recognize(loadedImage);
      await worker.terminate();
      ocrResult = data;
      const text = data?.text?.trim() || '';
      ocrText.textContent = text;
      setStatus(text ? 'OCR complete. You can edit the text.' : 'OCR complete. No text found.');
    } catch (err) {
      console.error(err);
      setStatus('OCR failed. Please try again.');
    }
  }

  runOcrBtn.addEventListener('click', runOCR);

  // Export edited text to DOCX using html-docx-js
  exportDocxBtn.addEventListener('click', () => {
    const html = `<html><head><meta charset="utf-8"></head><body><div>${escapeHtml(ocrText.innerHTML)}</div></body></html>`;
    try {
      const blob = window.HTMLDocx?.fromHTML ? HTMLDocx.fromHTML(html) : null;
      if (blob) {
        saveAs(blob, 'extracted-text.docx');
        setStatus('DOCX exported successfully.');
      } else {
        setStatus('DOCX export library not available.');
      }
    } catch (err) {
      console.error(err);
      setStatus('Failed to export DOCX.');
    }
  });

  // Toggle overlay with editable boxes for recognized lines
  enableOverlayBtn.addEventListener('click', () => {
    if (!ocrResult || !loadedImage) {
      setStatus('Run OCR first to enable in-image editing.');
      return;
    }
    overlayEnabled = !overlayEnabled;
    enableOverlayBtn.textContent = overlayEnabled ? 'Disable In-Image Editing' : 'Enable In-Image Editing';
    overlayContainer.innerHTML = '';
    overlayContainer.style.pointerEvents = overlayEnabled ? 'auto' : 'none';
    if (!overlayEnabled) return;

    const lines = ocrResult.lines || [];
    lines.forEach((line) => {
      const { bbox, text } = line;
      const div = document.createElement('div');
      div.className = 'overlay-box';
      div.contentEditable = 'true';
      div.textContent = text || '';
      const left = bbox.x0 * scaleX;
      const top = bbox.y0 * scaleY;
      const width = (bbox.x1 - bbox.x0) * scaleX;
      const height = (bbox.y1 - bbox.y0) * scaleY;
      div.style.left = `${left}px`;
      div.style.top = `${top}px`;
      div.style.width = `${Math.max(20, width)}px`;
      div.style.height = `${Math.max(18, height)}px`;
      overlayContainer.appendChild(div);
    });
    setStatus('In-image editing enabled. Click text boxes to edit.');
  });

  // Apply overlay edits by rendering text onto the canvas
  applyOverlayBtn.addEventListener('click', () => {
    if (!loadedImage || !overlayEnabled) {
      setStatus('Enable in-image editing and make changes first.');
      return;
    }
    // Redraw original image
    ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
    ctx.drawImage(loadedImage, 0, 0, imageCanvas.width, imageCanvas.height);
    // Draw texts from overlay
    const boxes = overlayContainer.querySelectorAll('.overlay-box');
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = 'rgba(0,0,0,0.8)';
    boxes.forEach((box) => {
      const left = parseFloat(box.style.left) || 0;
      const top = parseFloat(box.style.top) || 0;
      const fontSize = Math.max(14, Math.min(parseFloat(box.style.height) || 18, 48));
      ctx.font = `${fontSize}px Inter, Arial, sans-serif`;
      wrapAndFillText(ctx, box.textContent || '', left + 2, top + fontSize, imageCanvas.width - left - 8, fontSize * 1.2);
    });
    setStatus('Applied edits to image preview. You can download the PNG.');
  });

  // Download updated image as PNG
  downloadImageBtn.addEventListener('click', () => {
    imageCanvas.toBlob((blob) => {
      if (!blob) return setStatus('Failed to create image blob.');
      saveAs(blob, 'updated-image.png');
      setStatus('Updated image downloaded as PNG.');
    }, 'image/png');
  });

  // Helpers
  function escapeHtml(html) {
    // Keep basic formatting; ensure HTMLDocx receives a safe string
    return html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .replace(/\n/g, '<br/>');
  }

  function wrapAndFillText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(/\s+/);
    let line = '';
    words.forEach((word, idx) => {
      const test = line ? `${line} ${word}` : word;
      const m = ctx.measureText(test);
      if (m.width > maxWidth && line) {
        ctx.fillText(line, x, y);
        y += lineHeight;
        line = word;
      } else {
        line = test;
      }
      if (idx === words.length - 1) {
        ctx.fillText(line, x, y);
      }
    });
  }
})();
