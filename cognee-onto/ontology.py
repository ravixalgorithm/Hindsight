from typing import Optional, List
from cognee.infrastructure.engine.models.DataPoint import DataPoint

class Person(DataPoint):
    name: str
    last_seen: Optional[str] = None
    role: Optional[str] = None  # "wolf_pack", "hotel_staff", "unknown"

class Place(DataPoint):
    name: str
    floor: Optional[int] = None
    type: str  # "hotel_room", "rooftop", "casino", "vehicle"

class Event(DataPoint):
    description: str
    timestamp: Optional[str] = None
    participants: List[str] = []

class Object(DataPoint):
    name: str
    category: str  # "animal", "receipt", "vehicle", "document"

class Transaction(DataPoint):
    amount: Optional[float] = None
    payer: Optional[str] = None
    description: str

class Document(DataPoint):
    source_url: Optional[str] = None
    trust_score: float  # 0-100, from Onto
    doc_type: str  # "text_fragment", "receipt", "voicemail", "url"
