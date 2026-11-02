from __future__ import annotations

import mimetypes
import os
import uuid
from pathlib import Path
from urllib import request

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

app = FastAPI(title="SnapVault Upload API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory=str(BASE_DIR / "static")), name="static")
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")


@app.get("/")
def read_index() -> FileResponse:
    return FileResponse(BASE_DIR / "static" / "index.html")


@app.get("/health")
def healthcheck() -> dict:
    return {"status": "ok"}


def _save_bytes(filename: str, content: bytes) -> str:
    safe_name = filename or "image"
    ext = Path(safe_name).suffix.lower()
    if not ext:
        guessed = mimetypes.guess_extension("image/jpeg") or ".jpg"
        ext = guessed

    unique_name = f"{uuid.uuid4().hex}{ext}"
    destination = UPLOAD_DIR / unique_name
    destination.write_bytes(content)
    return unique_name


@app.post("/upload")
async def upload_image(
    file: UploadFile | None = File(default=None),
    image_url: str | None = Form(default=None),
):
    if file is not None:
        content = await file.read()
        original_name = file.filename or "upload"
        unique_name = _save_bytes(original_name, content)
        return {"url": f"/uploads/{unique_name}", "filename": unique_name}

    if image_url:
        cleaned_url = image_url.strip()
        if not cleaned_url:
            raise HTTPException(status_code=400, detail="URL inválida.")

        try:
            req = request.Request(cleaned_url, headers={"User-Agent": "Mozilla/5.0"})
            with request.urlopen(req, timeout=20) as response:
                content_type = response.headers.get_content_type()
                if not content_type.startswith("image/"):
                    raise HTTPException(status_code=400, detail="A URL informada não aponta para uma imagem válida.")
                data = response.read()
                ext = mimetypes.guess_extension(content_type) or ".jpg"
                unique_name = _save_bytes(f"remote{ext}", data)
                return {"url": f"/uploads/{unique_name}", "filename": unique_name}
        except Exception as exc:
            raise HTTPException(status_code=400, detail=f"Não foi possível baixar a imagem: {exc}") from exc

    raise HTTPException(status_code=400, detail="Envie um arquivo ou informe uma URL direta de imagem.")


@app.get("/uploads/{filename}")
def get_uploaded_file(filename: str) -> FileResponse:
    file_path = UPLOAD_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Arquivo não encontrado.")
    return FileResponse(file_path)


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
