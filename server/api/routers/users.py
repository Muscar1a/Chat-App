from fastapi import APIRouter, Depends, HTTPException, status, Path, Body
from typing import Any
from service.token import TokenManager
from exceptions.user import UserCreationError
import schemas
from crud.user import User
from schemas.user import UserProfileUpdate
from api.deps import (
    get_current_active_user,
    get_current_user,
    get_token_manager, 
    get_user_manager,
    requires_role
)
from pydantic import constr, ValidationError
from schemas.user import ObjectIdStr, UsernameStr

router = APIRouter(prefix="/users", tags=["users"])

@router.post(
        "/register",
        response_model=schemas.User
)
async def register(
    user_in: schemas.UserCreate,
    user_manager: User = Depends(get_user_manager),
):
    
    try:
        new_user = await user_manager.create_user(user_in)
        return new_user
    except ValidationError as e:
        # Handle password validation errors
        error_details = []
        for error in e.errors():
            if 'password' in error.get('loc', []):
                error_details.append({
                    'field': 'password',
                    'message': error['msg']
                })
            else:
                error_details.append({
                    'field': str(error.get('loc', ['unknown'])[0]),
                    'message': error['msg']
                })
        
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                'error': 'Validation Error',
                'errors': error_details
            }
        )
    except UserCreationError as e:
        print(e)
        print(e.field, e.message)
        
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                'error': 'User Creation Error',
                'errors': [
                    {
                        'field': e.field or "username",
                        'message': e.message or "Username already in use!"
                    }
                ]
            }
        )
    except Exception as e:
        print(f"Unexpected error during registration: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                'error': 'Internal Server Error',
                'message': 'Registration failed. Please try again.'
            }
        )

        

@router.get(
        "/me",
        response_model=schemas.User
)
async def read_me(
    user_manager: User = Depends(get_user_manager),
    current_user: schemas.User = Depends(get_current_active_user)
):
    user = await user_manager.get_by_id(current_user.id)
    return user

@router.put(
        "/me",
        response_model=schemas.User
)
async def update_me(
    profile_data: UserProfileUpdate,
    user_manager: User = Depends(get_user_manager),
    current_user: schemas.User = Depends(get_current_active_user)
):
    """Update current user's profile information"""
    # print('----- updated_user', profile_data)
    
    updated_user = await user_manager.update_profile(
        current_user.id, 
        profile_data.model_dump()
    )
    return updated_user

@router.get(
    '/all',
    status_code=status.HTTP_200_OK,
    response_model=list[schemas.UserOfAll]
)
async def get_all_user(
    user_manager: User = Depends(get_user_manager),
    current_user: schemas.User = Depends(get_current_active_user),
):
    # any authenticated user can now list all others (except themselves)
    return await user_manager.get_all_except_me(current_user.id)

"""
@router.get(
        '/info/{user_id}',
        status_code=status.HTTP_200_OK, response_model=schemas.User
)       
async def get_user_detail(
    user_id: ObjectIdStr = Path(...),
    user_manager: User = Depends(get_user_manager),
    current_user: schemas.User = Depends(get_current_active_user)
):
    if user_id != current_user.id:
        # enforce admin for any non‐self lookup
        await requires_role("admin")(current_user)
    user = await user_manager.get_by_id(user_id)
    return user

@router.get(
    "/by-username/{username}",
    response_model=schemas.User,
    status_code=status.HTTP_200_OK,
)
async def get_user_by_username(
    username: UsernameStr = Path(...),
    user_manager: User = Depends(get_user_manager),
    current_user: schemas.User = Depends(get_current_active_user),
):
    return await user_manager.get_by_username(username)

    
@router.put(
        '/update/info/{user_id}',
        status_code=status.HTTP_200_OK,
        response_model=schemas.User
)
async def update_user(
    user_id: ObjectIdStr = Path(...),
    updated_data: schemas.UserUpdate = Body(...),
    user_manager: User = Depends(get_user_manager),
    _: schemas.User = Depends(requires_role("admin"))
):
    user = await user_manager.update_user(user_id, updated_data)
    return user

@router.delete(
        '/delete/{user_id}',
        status_code=status.HTTP_204_NO_CONTENT
)
async def delete_user(
    user_id: ObjectIdStr = Path(...),
    user_manager: User = Depends(get_user_manager),
    _: schemas.User = Depends(requires_role("admin"))
):
    deleted_user = await user_manager.delete_user(user_id)
    return deleted_user

"""