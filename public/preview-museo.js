const museoPreview = document.querySelector('#museo-preview');

museoPreview.addEventListener('load', () => {
  const previewDocument = museoPreview.contentDocument;

  if (!previewDocument || previewDocument.querySelector('#estilo-preview-museo')) {
    return;
  }

  const clarifyGalleryAction = () => {
    previewDocument.querySelectorAll('.tarjeta button:not(.cerrar)').forEach((button) => {
      if (button.textContent.trim() === 'Más información') {
        button.textContent = 'Abrir galería y relato completo';
        button.setAttribute('aria-label', 'Abrir galería de imágenes y relato completo');
      }
    });

    const pointColors = ['#8b6548', '#96714f', '#a07b55', '#aa865e', '#ae9368', '#a59a70', '#929778', '#788f7e', '#5e8583', '#3f7888', '#176c91'];
    const timelineEvents = [...previewDocument.querySelectorAll('.linea > .hecho')];
    timelineEvents.forEach((event, index) => {
      const point = event.querySelector('.punto');
      const colorIndex = Math.round(index * (pointColors.length - 1) / Math.max(timelineEvents.length - 1, 1));
      point?.style.setProperty('--color-punto', pointColors[colorIndex]);
    });
  };

  new MutationObserver(clarifyGalleryAction).observe(previewDocument.body, {
    childList: true,
    subtree: true,
  });
  clarifyGalleryAction();

  const previewStyles = previewDocument.createElement('link');
  previewStyles.id = 'estilo-preview-museo';
  previewStyles.rel = 'stylesheet';
  previewStyles.href = '/preview-museo.css';
  previewDocument.head.append(previewStyles);
});