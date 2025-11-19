@echo off
REM Build script to replace environment variables in config.js
REM This reads from .env and replaces placeholders in config.js

echo Building Sakinah extension...

REM Check if .env exists
if not exist ".env" (
    echo ERROR: .env file not found!
    echo Please copy .env.example to .env and add your API key
    exit /b 1
)

REM Read GROQ_API_KEY from .env
for /f "tokens=1,2 delims==" %%a in (.env) do (
    if "%%a"=="GROQ_API_KEY" set GROQ_API_KEY=%%b
)

if "%GROQ_API_KEY%"=="" (
    echo ERROR: GROQ_API_KEY not found in .env file
    exit /b 1
)

echo Found API key: %GROQ_API_KEY:~0,20%...

REM Create a temporary config.js with actual API key
powershell -Command "(Get-Content config.js) -replace '''GROQ_API_KEY''', '''%GROQ_API_KEY%''' | Set-Content config.js.temp"

REM Backup original and replace
if exist config.js.backup del config.js.backup
move config.js config.js.backup
move config.js.temp config.js

echo Build complete! config.js has been updated with your API key.
echo Original config.js saved as config.js.backup
echo.
echo IMPORTANT: Do NOT commit config.js to git!
echo Run 'restore-config.bat' before committing changes.
