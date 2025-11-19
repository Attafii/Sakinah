@echo off
REM Restore script to revert config.js to template version
REM Run this before committing to git

echo Restoring config.js to template version...

if not exist "config.js.backup" (
    echo ERROR: config.js.backup not found!
    echo Nothing to restore.
    exit /b 1
)

REM Delete current config.js and restore from backup
del config.js
move config.js.backup config.js

echo config.js restored to template version (with 'GROQ_API_KEY' placeholder)
echo Safe to commit now!
