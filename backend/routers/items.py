"""
Items router — generic CRUD example. Replace "items" with your domain model.

  POST   /items              Create item (authenticated)
  GET    /items              List items (public, with pagination & search)
  GET    /items/{id}         Get single item
  PUT    /items/{id}         Update item (owner only)
  DELETE /items/{id}         Delete item (owner or admin)
"""
from datetime import datetime, timezone
from typing import Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query

from core.deps import get_current_user, get_current_user_optional, require_admin
from core.middleware import sanitize_dict, sanitize_string
from database import db
from models.schemas import CreateItemIn, ItemListOut, ItemOut, MessageOut, UpdateItemIn

router = APIRouter()


def _item_out(doc: dict) -> dict:
    """Shape a MongoDB item document for API response."""
    return {
        "id": str(doc["_id"]),
        "title": doc.get("title", ""),
        "description": doc.get("description"),
        "tags": doc.get("tags", []),
        "status": doc.get("status", "active"),
        "owner_id": doc.get("owner_id", ""),
        "created_at": doc["created_at"],
        "updated_at": doc.get("updated_at"),
    }


# ══════════════════════════════════════════════
#  CREATE
# ══════════════════════════════════════════════

@router.post("", response_model=dict, status_code=201)
async def create_item(
    payload: CreateItemIn,
    current_user: dict = Depends(get_current_user),
):
    """Create a new item owned by the authenticated user."""
    now = datetime.now(timezone.utc)
    doc = {
        "title": sanitize_string(payload.title),
        "description": sanitize_string(payload.description) if payload.description else None,
        "tags": [sanitize_string(t) for t in (payload.tags or [])],
        "status": payload.status.value,
        "metadata": sanitize_dict(payload.metadata or {}),
        "owner_id": current_user["id"],
        "created_at": now,
        "updated_at": now,
    }
    result = await db.items.insert_one(doc)
    doc["_id"] = result.inserted_id
    return _item_out(doc)


# ══════════════════════════════════════════════
#  LIST (public)
# ══════════════════════════════════════════════

@router.get("", response_model=ItemListOut)
async def list_items(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None, max_length=200),
    status: Optional[str] = Query(None),
    owner_id: Optional[str] = Query(None),
):
    """
    Paginated list of items.
    Supports full-text search, status filter, and owner filter.
    """
    query: dict = {"status": {"$ne": "archived"}}

    if search:
        query["$text"] = {"$search": sanitize_string(search)}
    if status:
        query["status"] = status
    if owner_id:
        query["owner_id"] = owner_id

    total = await db.items.count_documents(query)
    skip = (page - 1) * per_page

    cursor = (
        db.items.find(query)
        .sort("created_at", -1)
        .skip(skip)
        .limit(per_page)
    )

    items = []
    async for doc in cursor:
        items.append(_item_out(doc))

    return {
        "items": items,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": max(1, -(-total // per_page)),  # ceiling division
    }


# ══════════════════════════════════════════════
#  GET SINGLE
# ══════════════════════════════════════════════

@router.get("/{item_id}", response_model=dict)
async def get_item(item_id: str):
    """Retrieve a single item by ID."""
    try:
        oid = ObjectId(item_id)
    except Exception:
        raise HTTPException(400, "Invalid item ID format")

    doc = await db.items.find_one({"_id": oid})
    if not doc:
        raise HTTPException(404, "Item not found")
    return _item_out(doc)


# ══════════════════════════════════════════════
#  UPDATE (owner or admin)
# ══════════════════════════════════════════════

@router.put("/{item_id}", response_model=dict)
async def update_item(
    item_id: str,
    payload: UpdateItemIn,
    current_user: dict = Depends(get_current_user),
):
    """Update an item. Only the owner or an admin can update."""
    try:
        oid = ObjectId(item_id)
    except Exception:
        raise HTTPException(400, "Invalid item ID format")

    doc = await db.items.find_one({"_id": oid})
    if not doc:
        raise HTTPException(404, "Item not found")

    is_owner = doc.get("owner_id") == current_user["id"]
    is_admin = current_user.get("role") == "admin"
    if not is_owner and not is_admin:
        raise HTTPException(403, "You don't have permission to edit this item")

    update_data: dict = {"updated_at": datetime.now(timezone.utc)}

    if payload.title is not None:
        update_data["title"] = sanitize_string(payload.title)
    if payload.description is not None:
        update_data["description"] = sanitize_string(payload.description)
    if payload.tags is not None:
        update_data["tags"] = [sanitize_string(t) for t in payload.tags]
    if payload.status is not None:
        update_data["status"] = payload.status.value
    if payload.metadata is not None:
        update_data["metadata"] = sanitize_dict(payload.metadata)

    await db.items.update_one({"_id": oid}, {"$set": update_data})
    updated = await db.items.find_one({"_id": oid})
    return _item_out(updated)


# ══════════════════════════════════════════════
#  DELETE (owner or admin)
# ══════════════════════════════════════════════

@router.delete("/{item_id}", response_model=MessageOut)
async def delete_item(
    item_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Delete an item. Only the owner or an admin can delete."""
    try:
        oid = ObjectId(item_id)
    except Exception:
        raise HTTPException(400, "Invalid item ID format")

    doc = await db.items.find_one({"_id": oid})
    if not doc:
        raise HTTPException(404, "Item not found")

    is_owner = doc.get("owner_id") == current_user["id"]
    is_admin = current_user.get("role") == "admin"
    if not is_owner and not is_admin:
        raise HTTPException(403, "You don't have permission to delete this item")

    await db.items.delete_one({"_id": oid})
    return {"ok": True, "message": "Item deleted"}
