# SnapVault

Aplicação de upload de imagens com FastAPI + HTML/CSS/JS, pronta para deploy em container.

## Como funciona

1. O usuário arrasta ou seleciona uma imagem no frontend.
2. Clica em "Fazer Upload".
3. O backend salva o arquivo em `/uploads` com nome único.
4. A API retorna a URL direta do arquivo.
5. O usuário pode copiar a URL e abrir a imagem em outra aba.

## Requisitos

- Python 3.11+
- Docker (opcional)

## Execução local

```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

A aplicação ficará disponível em:

- http://localhost:8000

## Build do container

```bash
docker build -t snapvault .
docker run -p 8000:8000 snapvault
```

## Deploy no Render

```bash
uvicorn app:app --host 0.0.0.0 --port $PORT
```

## Observações

- O diretório `uploads/` é usado para armazenar as imagens.
- O frontend oferece upload por drag & drop, seleção de arquivo e URL direta.
- A API aceita arquivo direto ou URL de imagem.
