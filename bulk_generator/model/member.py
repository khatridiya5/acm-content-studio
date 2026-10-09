from typing import Annotated, Optional
from bson import ObjectId
from pydantic import BaseModel, ConfigDict, Field, AliasChoices
from pydantic.functional_validators import BeforeValidator

# Represents MongoDB ObjectId as a string in Pydantic models
PyObjectId = Annotated[str, BeforeValidator(str)]


class Member(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    name: str = Field(..., description="Full name of the member")
    roll_no: str = Field(
        ...,
        validation_alias=AliasChoices("roll_no", "roll no", "rollNo"),
        description="Roll number / Student ID",
    )
    department: str = Field(..., description="Academic department")
    position: str = Field(
        ...,
        validation_alias=AliasChoices("position", "role"),
        description="Position or designation in the club",
    )
    image_url: str = Field(
        ...,
        validation_alias=AliasChoices("image_url", "img_url", "photo"),
        description="URL or file path to member image",
    )