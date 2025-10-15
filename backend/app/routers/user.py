from http.client import HTTPException

from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm

from datetime import timedelta

from app.data.models import User
from app.data import schemas
from app.utils.error import Error
from app.utils.auth import create_user, authenticate_user
from app.utils.security import verify_password, get_current_user

from typing import Annotated

router = APIRouter(prefix="/user", tags=["User"])


@router.post("/create")
async def registration_user(request: schemas.UserSchema) -> schemas.UserLogIn:
    await create_user(request)

    token_expires = timedelta(minutes=1440)
    token = await authenticate_user(data={"sub": request.email}, expires_delta=token_expires)
    return schemas.UserLogIn(
        user_token=str(token)
    )


@router.post("/login")
async def log_in_user(request: Annotated[OAuth2PasswordRequestForm, Depends()]) -> schemas.Token:
    user = await User.find_one(User.email == request.username)
    if not user or not verify_password(request.password, user.password):
        raise Error.UNAUTHORIZED_INVALID

    token_expires = timedelta(minutes=1440)
    token = await authenticate_user(data={"sub": request.username}, expires_delta=token_expires)

    return schemas.Token(access_token=token, token_type="bearer")


# from system.py--->


@router.patch(
    '/',
    description="change user",
    responses={
        401: {
            "description": "Unauthorised. You are not authorised to change user"
        }
    }
)
async def change_user(request: schemas.UserSchema, get_current_user: User = Depends(get_current_user)):
    userdata = await User.find_one(User.email == request.email)

    if not userdata:
        raise HTTPException(stuseatus_code=404, detail="User not found")

    userdata.role = request.new_role
    userdata.age = request.new_age
    userdata.gender = request.new_gender

    await userdata.save()
    return userdata


@router.delete(
    '/',
    description="delete user",
    responses={
        401: {
            "description": "Unauthorised. You are not authorised to delete user"
        }
    }
)
async def annigilation_of_user(user: schemas.UserSchema, get_current_user: User = Depends(get_current_user)):
    userdel = await User.find_one(User.email == user.email)
    if not userdel:
        raise HTTPException(status_code=404, detail="User not found")

    await userdel.delete()
    return 200


@router.get(
    '/',
    description="get user",
    responses={
        401: {
            "description": "Unauthorised. You are not authorised to get user"
        }
    }
)
async def get_user(get_current_user: User = Depends(get_current_user)):
    userdata = await User.find_one(User.email == get_current_user.email)
    if not userdata:
        raise HTTPException(status_code=404, detail="User not found")
    return userdata








