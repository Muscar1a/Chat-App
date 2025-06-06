import schemas

def user_serializer(raw: dict) -> schemas.User:
    """
    Convert a raw MongoDB document into a clean Pydantic User model.
    - Drops the old Python-generated 32-char UUID.
    - Normalizes MongoDB’s _id into a 24-hex id string.
    - Removes sensitive fields like 'password'.
    """
    # 1) Turn the Mongo _id into a 24-hex string
    oid = raw.get("_id")
    id_str = str(oid) if oid is not None else None

    # 2) Copy all other fields except the old 'id', '_id', and 'password'
    clean_data = {
        k: v
        for k, v in raw.items()
        if k not in ("_id", "id", "password")
    }

    # 3) Inject the new, valid 24-hex id
    clean_data["id"] = id_str

    # 4) Build your Pydantic model
    return schemas.User(**clean_data)