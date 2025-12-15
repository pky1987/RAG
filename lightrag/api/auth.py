from datetime import datetime, timedelta

import jwt
from dotenv import load_dotenv
from fastapi import HTTPException, status
from pydantic import BaseModel

from .config import global_args

# use the .env that is inside the current folder
# allows to use different .env file for each lightrag instance
# the OS environment variables take precedence over the .env file
load_dotenv(dotenv_path=".env", override=False)


class TokenPayload(BaseModel):
    sub: str  # Username
    exp: datetime  # Expiration time
    role: str = "user"  # User role, default is regular user
    metadata: dict = {}  # Additional metadata


class AuthHandler:
    def __init__(self):
        self.secret = global_args.token_secret
        self.algorithm = global_args.jwt_algorithm
        self.expire_hours = global_args.token_expire_hours
        self.guest_expire_hours = global_args.guest_token_expire_hours
        self.accounts = {}
        auth_accounts = global_args.auth_accounts
        if auth_accounts:
            for account in auth_accounts.split(","):
                # Normalize account entry: strip whitespace and surrounding quotes
                account = account.strip()
                if account.startswith('"') and account.endswith('"'):
                    account = account[1:-1]
                if account.startswith("'") and account.endswith("'"):
                    account = account[1:-1]
                if not account:
                    continue
                try:
                    username, password = account.split(":", 1)
                except ValueError:
                    # Malformed entry, skip it and continue
                    continue
                username = username.strip()
                password = password.strip()
                self.accounts[username] = password

    def create_token(
        self,
        username: str,
        role: str = "user",
        custom_expire_hours: int = None,
        metadata: dict = None,
    ) -> str:
        """
        Create JWT token

        Args:
            username: Username
            role: User role, default is "user", guest is "guest"
            custom_expire_hours: Custom expiration time (hours), if None use default value
            metadata: Additional metadata

        Returns:
            str: Encoded JWT token
        """
        # Choose default expiration time based on role
        if custom_expire_hours is None:
            if role == "guest":
                expire_hours = self.guest_expire_hours
            else:
                expire_hours = self.expire_hours
        else:
            expire_hours = custom_expire_hours

        expire = datetime.utcnow() + timedelta(hours=expire_hours)

        # Create payload
        payload = TokenPayload(
            sub=username, exp=expire, role=role, metadata=metadata or {}
        )

        # Try the common top-level encode first; if the installed 'jwt' package
        # doesn't expose `encode` at module level (some distributions differ),
        # fall back to the PyJWT internal API.
        try:
            return jwt.encode(payload.dict(), self.secret, algorithm=self.algorithm)
        except AttributeError:
            try:
                # Fallback to api_jwt.PyJWT
                from jwt.api_jwt import PyJWT

                return PyJWT().encode(payload.dict(), self.secret, algorithm=self.algorithm)
            except Exception as e:
                # Re-raise as HTTPException for consistency
                raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

    def validate_token(self, token: str) -> dict:
        """
        Validate JWT token

        Args:
            token: JWT token

        Returns:
            dict: Dictionary containing user information

        Raises:
            HTTPException: If token is invalid or expired
        """
        try:
            payload = jwt.decode(token, self.secret, algorithms=[self.algorithm])
            expire_timestamp = payload["exp"]
            expire_time = datetime.utcfromtimestamp(expire_timestamp)

            if datetime.utcnow() > expire_time:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired"
                )

            # Return complete payload instead of just username
            return {
                "username": payload["sub"],
                "role": payload.get("role", "user"),
                "metadata": payload.get("metadata", {}),
                "exp": expire_time,
            }
        except Exception:
            # Any error in decoding should be treated as invalid token
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
            )


auth_handler = AuthHandler()