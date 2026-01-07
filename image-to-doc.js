(() => {
  const imageInput = document.getElementById('imageInput');
  const imageCanvas = document.getElementById('imageCanvas');
  const overlayContainer = document.getElementById('overlayContainer');
  const runOcrBtn = document.getElementById('runOcrBtn');
  const exportDocxBtn = document.getElementById('exportDocxBtn');
  const downloadImageBtn = document.getElementById('downloadImageBtn');
  const ocrStatus = document.getElementById('ocrStatus');
  const visualEditor = document.getElementById('visualEditor');
  
  // Toolbar controls
  const fontFamily = document.getElementById('fontFamily');
  const fontSize = document.getElementById('fontSize');
  const boldBtn = document.getElementById('boldBtn');
  const italicBtn = document.getElementById('italicBtn');
  const underlineBtn = document.getElementById('underlineBtn');
  const textColor = document.getElementById('textColor');
  const deleteBoxBtn = document.getElementById('deleteBoxBtn');

  const ctx = imageCanvas.getContext('2d');
  let loadedImage = null;
  let ocrResult = null;
  let scaleX = 1, scaleY = 1;
  let selectedBox = null;
  let textBoxes = [];
  let dragData = null;
  let resizeData = null;

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
      const maxW = 1200;
      const scale = Math.min(1, maxW / img.width);
      imageCanvas.width = Math.floor(img.width * scale);
      imageCanvas.height = Math.floor(img.height * scale);
      ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
      ctx.drawImage(img, 0, 0, imageCanvas.width, imageCanvas.height);
      scaleX = imageCanvas.width / img.width;
      scaleY = imageCanvas.height / img.height;
      
      overlayContainer.innerHTML = '';
      overlayContainer.style.width = imageCanvas.width + 'px';
      overlayContainer.style.height = imageCanvas.height + 'px';
      textBoxes = [];
      selectedBox = null;
      
      visualEditor.style.display = 'block';
      setStatus('Image loaded. Click "Extract Text" to detect text.');
    };
    img.onerror = () => setStatus('Failed to load image');
    img.src = url;
  });

  // Run OCR using Tesseract.js and create text boxes
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
      
      // Create text boxes from OCR lines
      overlayContainer.innerHTML = '';
      textBoxes = [];
      const lines = data?.lines || [];
      lines.forEach((line, idx) => {
        const { bbox, text } = line;
        if (!text || !text.trim()) return;
        
        const boxData = {
          id: 'box-' + idx,
          text: text,
          x: bbox.x0 * scaleX,
          y: bbox.y0 * scaleY,
          width: Math.max(60, (bbox.x1 - bbox.x0) * scaleX),
          height: Math.max(24, (bbox.y1 - bbox.y0) * scaleY),
          fontFamily: 'Inter',
          fontSize: Math.max(12, Math.min(20, (bbox.y1 - bbox.y0) * scaleY * 0.8)),
          bold: false,
          italic: false,
          underline: false,
          color: '#000000'
        };
        textBoxes.push(boxData);
        createTextBoxElement(boxData);
      });
      
      setStatus(`Extracted ${textBoxes.length} text regions. Click to select and edit.`);
    } catch (err) {
      console.error(err);
      setStatus('OCR failed. Please try again.');
    }
  }

  runOcrBtn.addEventListener('click', runOCR);

  // Create draggable/resizable text box element
  function createTextBoxElement(boxData) {
    const box = document.createElement('div');
    box.className = 'text-box';
    box.dataset.id = boxData.id;
    box.style.left = boxData.x + 'px';
    box.style.top = boxData.y + 'px';
    box.style.width = boxData.width + 'px';
    box.style.height = boxData.height + 'px';
    box.style.fontFamily = boxData.fontFamily;
    box.style.fontSize = boxData.fontSize + 'px';
    box.style.fontWeight = boxData.bold ? 'bold' : 'normal';
    box.style.fontStyle = boxData.italic ? 'italic' : 'normal';
    box.style.textDecoration = boxData.underline ? 'underline' : 'none';
    box.style.color = boxData.color;

    const content = document.createElement('div');
    content.className = 'text-box-content';
    content.contentEditable = 'true';
    content.textContent = boxData.text;
    content.addEventListener('input', (e) => {
      boxData.text = e.target.textContent;
    });
    box.appendChild(content);

    // Resize handles
    ['nw', 'ne', 'sw', 'se'].forEach(pos => {
      const handle = document.createElement('div');
      handle.className = `resize-handle ${pos}`;
      handle.addEventListener('mousedown', (e) => startResize(e, boxData, pos));
      box.appendChild(handle);
    });

    box.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('resize-handle')) return;
      if (e.target === content) return;
      startDrag(e, boxData);
    });

    box.addEventListener('click', (e) => {
      selectBox(boxData);
    });

    overlayContainer.appendChild(box);
  }

  // Select a text box
  function selectBox(boxData) {
    selectedBox = boxData;
    document.querySelectorAll('.text-box').forEach(el => {
      el.classList.toggle('selected', el.dataset.id === boxData.id);
    });
    updateToolbar();
  }

  // Update toolbar with selected box styles
  function updateToolbar() {
    if (!selectedBox) return;
    fontFamily.value = selectedBox.fontFamily;
    fontSize.value = selectedBox.fontSize;
    textColor.value = selectedBox.color;
    boldBtn.classList.toggle('active', selectedBox.bold);
    italicBtn.classList.toggle('active', selectedBox.italic);
    underlineBtn.classList.toggle('active', selectedBox.underline);
  }

  // Drag text box
  function startDrag(e, boxData) {
    e.preventDefault();
    selectBox(boxData);
    const box = overlayContainer.querySelector(`[data-id="${boxData.id}"]`);
    const rect = box.getBoundingClientRect();
    const containerRect = overlayContainer.getBoundingClientRect();
    dragData = {
      boxData,
      startX: e.clientX,
      startY: e.clientY,
      initialX: rect.left - containerRect.left,
      initialY: rect.top - containerRect.top
    };
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', stopDrag);
  }

  function onDrag(e) {
    if (!dragData) return;
    const dx = e.clientX - dragData.startX;
    const dy = e.clientY - dragData.startY;
    const newX = Math.max(0, Math.min(imageCanvas.width - dragData.boxData.width, dragData.initialX + dx));
    const newY = Math.max(0, Math.min(imageCanvas.height - dragData.boxData.height, dragData.initialY + dy));
    dragData.boxData.x = newX;
    dragData.boxData.y = newY;
    const box = overlayContainer.querySelector(`[data-id="${dragData.boxData.id}"]`);
    box.style.left = newX + 'px';
    box.style.top = newY + 'px';
  }

  function stopDrag() {
    dragData = null;
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', stopDrag);
  }

  // Resize text box
  function startResize(e, boxData, corner) {
    e.preventDefault();
    e.stopPropagation();
    selectBox(boxData);
    const box = overlayContainer.querySelector(`[data-id="${boxData.id}"]`);
    const rect = box.getBoundingClientRect();
    const containerRect = overlayContainer.getBoundingClientRect();
    resizeData = {
      boxData,
      corner,
      startX: e.clientX,
      startY: e.clientY,
      initialX: rect.left - containerRect.left,
      initialY: rect.top - containerRect.top,
      initialWidth: boxData.width,
      initialHeight: boxData.height
    };
    document.addEventListener('mousemove', onResize);
    document.addEventListener('mouseup', stopResize);
  }

  function onResize(e) {
    if (!resizeData) return;
    const dx = e.clientX - resizeData.startX;
    const dy = e.clientY - resizeData.startY;
    const { boxData, corner, initialX, initialY, initialWidth, initialHeight } = resizeData;
    const box = overlayContainer.querySelector(`[data-id="${boxData.id}"]`);

    let newX = initialX, newY = initialY, newW = initialWidth, newH = initialHeight;

    if (corner.includes('e')) {
      newW = Math.max(40, initialWidth + dx);
    }
    if (corner.includes('w')) {
      newW = Math.max(40, initialWidth - dx);
      newX = initialX + (initialWidth - newW);
    }
    if (corner.includes('s')) {
      newH = Math.max(24, initialHeight + dy);
    }
    if (corner.includes('n')) {
      newH = Math.max(24, initialHeight - dy);
      newY = initialY + (initialHeight - newH);
    }

    boxData.x = newX;
    boxData.y = newY;
    boxData.width = newW;
    boxData.height = newH;
    box.style.left = newX + 'px';
    box.style.top = newY + 'px';
    box.style.width = newW + 'px';
    box.style.height = newH + 'px';
  }

  function stopResize() {
    resizeData = null;
    document.removeEventListener('mousemove', onResize);
    document.removeEventListener('mouseup', stopResize);
  }

  // Toolbar actions
  fontFamily.addEventListener('change', () => {
    if (!selectedBox) return;
    selectedBox.fontFamily = fontFamily.value;
    const box = overlayContainer.querySelector(`[data-id="${selectedBox.id}"]`);
    box.style.fontFamily = fontFamily.value;
  });

  fontSize.addEventListener('input', () => {
    if (!selectedBox) return;
    selectedBox.fontSize = parseInt(fontSize.value) || 16;
    const box = overlayContainer.querySelector(`[data-id="${selectedBox.id}"]`);
    box.style.fontSize = selectedBox.fontSize + 'px';
  });

  boldBtn.addEventListener('click', () => {
    if (!selectedBox) return;
    selectedBox.bold = !selectedBox.bold;
    boldBtn.classList.toggle('active', selectedBox.bold);
    const box = overlayContainer.querySelector(`[data-id="${selectedBox.id}"]`);
    box.style.fontWeight = selectedBox.bold ? 'bold' : 'normal';
  });

  italicBtn.addEventListener('click', () => {
    if (!selectedBox) return;
    selectedBox.italic = !selectedBox.italic;
    italicBtn.classList.toggle('active', selectedBox.italic);
    const box = overlayContainer.querySelector(`[data-id="${selectedBox.id}"]`);
    box.style.fontStyle = selectedBox.italic ? 'italic' : 'normal';
  });

  underlineBtn.addEventListener('click', () => {
    if (!selectedBox) return;
    selectedBox.underline = !selectedBox.underline;
    underlineBtn.classList.toggle('active', selectedBox.underline);
    const box = overlayContainer.querySelector(`[data-id="${selectedBox.id}"]`);
    box.style.textDecoration = selectedBox.underline ? 'underline' : 'none';
  });

  textColor.addEventListener('change', () => {
    if (!selectedBox) return;
    selectedBox.color = textColor.value;
    const box = overlayContainer.querySelector(`[data-id="${selectedBox.id}"]`);
    box.style.color = textColor.value;
  });

  deleteBoxBtn.addEventListener('click', () => {
    if (!selectedBox) return;
    const idx = textBoxes.findIndex(b => b.id === selectedBox.id);
    if (idx > -1) textBoxes.splice(idx, 1);
    const box = overlayContainer.querySelector(`[data-id="${selectedBox.id}"]`);
    if (box) box.remove();
    selectedBox = null;
    setStatus('Text box deleted.');
  });

  // Export to DOCX
  exportDocxBtn.addEventListener('click', () => {
    const allText = textBoxes.map(b => b.text).join('\n\n');
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Extracted Text</title></head><body><div style="white-space:pre-wrap;">${allText.replace(/\n/g, '<br/>')}</div></body></html>`;
    try {
      const blob = (window.htmlDocx && typeof window.htmlDocx.asBlob === 'function') ? window.htmlDocx.asBlob(html) : null;
      if (blob) {
        saveAs(blob, 'extracted-text.docx');
        setStatus('DOCX exported successfully.');
      } else {
        const docBlob = new Blob([html], { type: 'application/msword' });
        saveAs(docBlob, 'extracted-text.doc');
        setStatus('Exported as .DOC (DOCX library not available).');
      }
    } catch (err) {
      console.error(err);
      setStatus('Failed to export document.');
    }
  });

  // Download image with text rendered
  downloadImageBtn.addEventListener('click', () => {
    if (!loadedImage) return setStatus('No image loaded.');
    
    // Redraw image
    ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
    ctx.drawImage(loadedImage, 0, 0, imageCanvas.width, imageCanvas.height);
    
    // Render each text box
    textBoxes.forEach(box => {
      ctx.save();
      ctx.font = `${box.bold ? 'bold ' : ''}${box.italic ? 'italic ' : ''}${box.fontSize}px ${box.fontFamily}`;
      ctx.fillStyle = box.color;
      ctx.textBaseline = 'top';
      
      // Word wrap text
      const words = box.text.split(/\s+/);
      let line = '';
      let y = box.y + 4;
      const lineHeight = box.fontSize * 1.2;
      const maxWidth = box.width - 8;
      
      words.forEach((word, idx) => {
        const test = line ? `${line} ${word}` : word;
        const metrics = ctx.measureText(test);
        if (metrics.width > maxWidth && line) {
          ctx.fillText(line, box.x + 4, y);
          if (box.underline) {
            ctx.fillRect(box.x + 4, y + box.fontSize, ctx.measureText(line).width, 1);
          }
          y += lineHeight;
          line = word;
        } else {
          line = test;
        }
        if (idx === words.length - 1) {
          ctx.fillText(line, box.x + 4, y);
          if (box.underline) {
            ctx.fillRect(box.x + 4, y + box.fontSize, ctx.measureText(line).width, 1);
          }
        }
      });
      
      ctx.restore();
    });
    
    imageCanvas.toBlob((blob) => {
      if (!blob) return setStatus('Failed to create image blob.');
      saveAs(blob, 'edited-image.png');
      setStatus('Image with text downloaded.');
    }, 'image/png');
  });
})();
