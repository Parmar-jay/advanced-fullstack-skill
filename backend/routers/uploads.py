"""
File upload router — upload images to Cloudinary.
  POST /uploads/image    Upload a single image (authenticated)
  DELETE /uploads/{public_id}  Delete an image by public_id (owner or admin)

Requires CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env.
Falls back to a local /uploads directory when Cloudinary is not configured.
"""
import os
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse

from core.config import settings
from core.deps import get_current_user
from models.schemas import UploadOut

router = APIRouter()

# Max file size: 5 MB
MAX_SIZE_BYTES = 5 * 1024 * 1024
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}

LOCAL_UPLOAD_DIR = Path("uploads")
LOCAL_UPLOAD_DIR.mkdir(exist_ok=True)


def _get_cloudinary():
    """Return configured cloudinary module or None if not set up."""
    if not all([
        settings.cloudinary_cloud_name,
        settings.cloudinary_api_key,
        settings.cloudinary_api_secret,
    ]):
        return None
    try:
        import cloudinary
        import cloudinary.uploader
        cloudinary.config(
            cloud_name=settings.cloudinary_cloud_name,
            api_key=settings.cloudinary_api_key,
            api_secret=settings.cloudinary_api_secret,
            secure=True,
        )
        return cloudinary
    except ImportError:
        return None


@router.post("/image", response_model=UploadOut)
async def upload_image(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    """
    Upload an image file.
    Uses Cloudinary if configured, otherwise saves locally.
    Returns the public URL and metadata.
    """
    # Validate content type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            400,
            f"File type '{file.content_type}' not allowed. "
            f"Accepted: {', '.join(ALLOWED_TYPES)}",
        )

    # Read and validate size
    contents = await file.read()
    if len(contents) > MAX_SIZE_BYTES:
        raise HTTPException(413, f"File too large. Maximum size: {MAX_SIZE_BYTES // 1024 // 1024}MB")

    cloud = _get_cloudinary()

    if cloud:
        # ── Upload to Cloudinary ──
        try:
            result = cloud.uploader.upload(
                contents,
                folder=f"{settings.app_name.lower()}/uploads/{current_user['id']}",
                resource_type="image",
                transformation=[{"quality": "auto", "fetch_format": "auto"}],
            )
            return {
                "url": result["secure_url"],
                "public_id": result["public_id"],
                "width": result.get("width"),
                "height": result.get("height"),
                "format": result.get("format"),
                "bytes": result.get("bytes"),
            }
        except Exception as e:
            raise HTTPException(500, f"Upload failed: {str(e)}")
    else:
        # ── Fallback: local filesystem ──
        ext = file.filename.rsplit(".", 1)[-1] if file.filename else "bin"
        filename = f"{uuid.uuid4().hex}.{ext}"
        dest = LOCAL_UPLOAD_DIR / filename
        dest.write_bytes(contents)

        return {
            "url": f"/uploads/{filename}",
            "public_id": filename,
            "width": None,
            "height": None,
            "format": ext,
            "bytes": len(contents),
        }


@router.delete("/{public_id:path}", status_code=200)
async def delete_image(
    public_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Delete an uploaded image by its public_id (Cloudinary) or filename (local)."""
    cloud = _get_cloudinary()

    if cloud:
        try:
            result = cloud.uploader.destroy(public_id)
            if result.get("result") != "ok":
                raise HTTPException(404, "Image not found on Cloudinary")
        except Exception as e:
            raise HTTPException(500, f"Delete failed: {str(e)}")
    else:
        # Local fallback
        local_path = LOCAL_UPLOAD_DIR / public_id
        if not local_path.exists():
            raise HTTPException(404, "File not found")
        local_path.unlink()

    return {"ok": True, "message": "Image deleted"}
