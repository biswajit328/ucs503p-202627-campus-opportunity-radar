from pydantic import BaseModel, ConfigDict, Field, field_validator


class StudentProfileCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    branch: str = Field(min_length=1, max_length=100)
    semester: int = Field(ge=1, le=8)
    year: int = Field(ge=1, le=4)
    preferred_mode: str | None = None
    preferred_location: str | None = None
    skills: list[str] = []
    interests: list[str] = []


class StudentProfileUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    branch: str | None = Field(default=None, min_length=1, max_length=100)
    semester: int | None = Field(default=None, ge=1, le=8)
    year: int | None = Field(default=None, ge=1, le=4)
    preferred_mode: str | None = None
    preferred_location: str | None = None
    skills: list[str] | None = None
    interests: list[str] | None = None


class StudentProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    name: str
    branch: str
    semester: int
    year: int
    preferred_mode: str | None
    preferred_location: str | None
    skills: list[str]
    interests: list[str]

    @field_validator("skills", "interests", mode="before")
    @classmethod
    def extract_names(cls, value):
        if not value:
            return []
        return [item.name if hasattr(item, "name") else item for item in value]