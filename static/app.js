const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const btnUseUrl = document.getElementById('btnUseUrl');
const imageUrlInput = document.getElementById('imageUrl');
const statusBox = document.getElementById('status');
const resultBox = document.getElementById('resultBox');
const resultUrlInput = document.getElementById('resultUrl');
const previewLink = document.getElementById('previewLink');
const copyBtn = document.getElementById('copyBtn');

let selectedFile = null;

const setStatus = (message, type = '') => {
  statusBox.textContent = message;
  statusBox.className = 'status';
  if (type) {
    statusBox.classList.add(type);
  }
};

const resetFileSelection = () => {
  selectedFile = null;
  fileInput.value = '';
};

const openFileDialog = () => fileInput.click();

dropzone.addEventListener('click', openFileDialog);
dropzone.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    openFileDialog();
  }
});

['dragenter', 'dragover'].forEach((eventName) => {
  dropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropzone.classList.add('dragover');
  });
});

['dragleave', 'drop'].forEach((eventName) => {
  dropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropzone.classList.remove('dragover');
  });
});

dropzone.addEventListener('drop', (event) => {
  const [file] = event.dataTransfer.files;
  if (file && file.type.startsWith('image/')) {
    selectedFile = file;
    setStatus(`Arquivo selecionado: ${file.name}`);
  } else {
    setStatus('Selecione uma imagem válida.', 'error');
    resetFileSelection();
  }
});

fileInput.addEventListener('change', (event) => {
  const [file] = event.target.files;
  if (file && file.type.startsWith('image/')) {
    selectedFile = file;
    setStatus(`Arquivo selecionado: ${file.name}`);
  } else {
    setStatus('Selecione uma imagem válida.', 'error');
    resetFileSelection();
  }
});

const uploadImage = async () => {
  const directUrl = imageUrlInput.value.trim();

  if (!selectedFile && !directUrl) {
    setStatus('Selecione um arquivo ou informe uma URL de imagem.', 'error');
    return;
  }

  setStatus('Enviando imagem...', '');
  uploadBtn.disabled = true;
  uploadBtn.textContent = 'Enviando...';

  try {
    const formData = new FormData();

    if (selectedFile) {
      formData.append('file', selectedFile);
    }

    if (directUrl) {
      formData.append('image_url', directUrl);
    }

    const response = await fetch('/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Erro ao fazer upload.');
    }

    const finalUrl = `${window.location.origin}${data.url}`;
    resultUrlInput.value = finalUrl;
    previewLink.href = finalUrl;
    resultBox.classList.remove('hidden');
    setStatus('Upload concluído com sucesso!', 'success');
    resetFileSelection();
  } catch (error) {
    setStatus(error.message || 'Não foi possível concluir o upload.', 'error');
  } finally {
    uploadBtn.disabled = false;
    uploadBtn.textContent = 'Fazer Upload';
  }
};

btnUseUrl.addEventListener('click', () => {
  const directUrl = imageUrlInput.value.trim();

  if (!directUrl) {
    setStatus('Informe uma URL válida.', 'error');
    return;
  }

  setStatus('URL pronta para envio.');
  resetFileSelection();
});

uploadBtn.addEventListener('click', uploadImage);

copyBtn.addEventListener('click', async () => {
  const value = resultUrlInput.value;
  if (!value) return;

  try {
    await navigator.clipboard.writeText(value);
    setStatus('URL copiada para a área de transferência!', 'success');
  } catch {
    resultUrlInput.select();
    setStatus('Copie a URL manualmente.', '');
  }
});
