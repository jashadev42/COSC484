from __future__ import annotations

from datetime import datetime
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel, Field

# Enums
from enums.genders import GendersEnum
from enums.interests import InterestsEnum 
from enums.pronouns import PronounsEnum
from enums.relationship_goals import RelationshipGoalsEnum
from enums.personality_type import PersonalityTypeEnum
from enums.love_language import LoveLanguageEnum
from enums.attachment_style import AttachmentStyleEnum
from enums.political_views import PoliticalViewsEnum
from enums.diet import DietEnum
from enums.religion import ReligionEnum
from enums.pets import PetsEnum
from enums.exercise_frequency import ExerciseFrequencyEnum
from enums.drink_frequency import DrinkFrequencyEnum
from enums.smoke_frequency import SmokeFrequencyEnum
from enums.sleep_schedule import SleepScheduleEnum
from enums.zodiac_signs import ZodiacSignsEnum 

class UserProfile(BaseModel):
    uid: UUID
    created_at: Optional[datetime] = None

    bio: Optional[str] = Field(default=None, max_length=1000)
    drug_use: Optional[bool] = None
    weed_use: Optional[bool] = None

    # These two will need to be converted to their fk UUID by the backend
    gender: Optional[GendersEnum] = None
    interests: List[InterestsEnum] = None
    # # # (e.g. SELECT id FROM public.genders WHERE name = :gender) # # #

    location: Optional[str] = Field(default=None, max_length=255)
    location_label: Optional[str] = Field(default=None, max_length=255)
    show_precise_location: Optional[bool] = None

    pronouns: Optional[PronounsEnum] = None

    languages_spoken: Optional[List[str]] = None

    school: Optional[str] = Field(default=None, max_length=255)
    occupation: Optional[str] = Field(default=None, max_length=255)
    relationship_goal: Optional[RelationshipGoalsEnum] = None

    personality_type: Optional[PersonalityTypeEnum] = None
    love_language: Optional[LoveLanguageEnum] = None
    attachment_style: Optional[AttachmentStyleEnum] = None
    political_view: Optional[PoliticalViewsEnum] = None
    zodiac_sign: Optional[ZodiacSignsEnum] = None
    religion: Optional[ReligionEnum] = None
    diet: Optional[DietEnum] = None
    exercise_frequency: Optional[ExerciseFrequencyEnum] = None

    pets: Optional[List[PetsEnum]] = None

    smokes: Optional[SmokeFrequencyEnum] = None
    drinks: Optional[DrinkFrequencyEnum] = None
    sleep_schedule: Optional[SleepScheduleEnum] = None
