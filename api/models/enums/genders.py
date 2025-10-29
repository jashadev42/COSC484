from enum import Enum

class GendersEnum(str, Enum):
    male = "male"
    female = "female"
    nb = "non-binary"
    queer = "genderqueer"
    genderfluid = "genderfluid"
    trans_mtf = "transgender (male to female)"
    trans_ftm = "transgender (female to male)"