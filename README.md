# Usage
> IMPORTANT: Create "app_data.db" file in the project root
1. Run the app:
   - Follow these steps:
     1. Make a virtual environment: `python3 -m venv .venv`
     2. Activate the virtual environment: `./.venv/Source/activate` or `source .venv/bin/activate`
     3. Install requirements: `pip install -r requirements.txt`
     4. Run the app: `uvicorn main_web:app --reload` (To use a specific port, add `--port <port_number>` to the command, e.g., `uvicorn main_web:app --reload --port 8080`).
2. Open the url: `http://127.0.0.1:PORT_NUMBER`

# Environment Variables
- Create a `.env` file in the project root with the following variables:
- SECRET_KEY - Secret key for JWT authentication. 
  - Use `openssl rand -hex 32` to generate a random secret key.
- ACCESS_TOKEN_EXPIRE_MINUTES - Number of minutes for which the access token is valid.
```
SECRET_KEY=""
ACCESS_TOKEN_EXPIRE_MINUTES="180"
```

# Requirements
```
aiosqlite==0.21.0
annotated-types==0.7.0
anyio==4.9.0
bcrypt==4.3.0
cffi==1.17.1
click==8.2.1
colorama==0.4.6
cryptography==45.0.5
ecdsa==0.19.1
fastapi==0.116.1
h11==0.16.0
httptools==0.6.4
idna==3.10
jinja2==3.1.6
jwt==1.4.0
markupsafe==3.0.2
passlib==1.7.4
pyasn1==0.6.1
pycparser==2.22
pydantic==2.11.7
pydantic-core==2.33.2
python-dotenv==1.1.1
python-jose==3.5.0
python-multipart==0.0.20
pyyaml==6.0.2
rsa==4.9.1
six==1.17.0
sniffio==1.3.1
starlette==0.47.1
typing-extensions==4.14.1
typing-inspection==0.4.1
uvicorn==0.35.0
watchfiles==1.1.0
websockets==15.0.1
yt-dlp==2025.6.30
```
