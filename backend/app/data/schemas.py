from pydantic import BaseModel

class UserSchema(BaseModel):
    first_name: str
    last_name: str
    password: str
    email: str
    role: str
    age: int
    gender: str

class UserUpdate(BaseModel):
    new_role: str
    new_age: int
    new_gender: str

class UserRequest(BaseModel):
    email: str
    password: str
    
class UserLogIn(BaseModel):
    user_token: str
    
class Token(BaseModel):
    access_token: str
    token_type: str
