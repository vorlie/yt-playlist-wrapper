# Usage
> IMPORTANT: Create "app_data.db" file in the project root
1. Make a virtual enviroment: `python3 -m venv .venv`
2. Activate the virtual environment: `./.venv/Source/activate` or `source .venv/bin/activate`
3. Install requirements: `pip install -r requirements.txt`
4. Run the app: `uvicorn main_web:app --reload`
5. Open the url: `http://127.0.0.1:8000`

# Requirements
```
aiosqlite==0.21.0
annotated-types==0.7.0
anyio==4.9.0
click==8.1.8
colorama==0.4.6
fastapi==0.115.12
h11==0.14.0
httptools==0.6.4
idna==3.10
Jinja2==3.1.6
MarkupSafe==3.0.2
pydantic==2.11.1
pydantic_core==2.33.0
python-dotenv==1.1.0
PyYAML==6.0.2
sniffio==1.3.1
starlette==0.46.1
typing-inspection==0.4.0
typing_extensions==4.13.0
uvicorn==0.34.0
watchfiles==1.0.4
websockets==15.0.1
yt-dlp==2025.3.31
```
