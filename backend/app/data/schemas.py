from enum import Enum

from pydantic import BaseModel


class Gender(Enum):
    male = 'male'
    female = 'female'


class Role(Enum):
    student = "student"
    retraining = 'retraining'
    teacher = 'teacher'
    management = 'management'


class UserSchema(BaseModel):
    first_name: str
    last_name: str
    password: str
    email: str
    role: Role
    age: int
    gender: Gender

class UserUpdate(BaseModel):
    first_name: str
    last_name: str
    password: str
    email: str
    new_role: Role
    new_age: int
    new_gender: Gender

class UserUpdate(BaseModel):
    new_role: Role
    new_age: int
    new_gender: Gender


class UserRequest(BaseModel):
    email: str
    password: str


class UserLogIn(BaseModel):
    user_token: str


class Token(BaseModel):
    access_token: str
    token_type: str
