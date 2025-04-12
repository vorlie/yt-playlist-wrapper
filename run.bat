@echo off
REM Check if Python is installed
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo Python is not installed. Please install Python and try again.
    pause
    exit /b
)

REM Create a virtual environment
if not exist .venv (
    python -m venv .venv
)

REM Activate the virtual environment
call .venv\Scripts\activate

REM Install requirements
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Failed to install requirements. Please check the error messages above.
    pause
    exit /b
)

REM To use a specific port, add the --port option to the uvicorn command below, e.g., uvicorn main_web:app --reload --port 8080
REM Run the app
uvicorn main_web:app --reload
if %errorlevel% neq 0 (
    echo Failed to start the application. Please check the error messages above.
    pause
    exit /b
)

pause