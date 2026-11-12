@echo off
setlocal
cd /d "%~dp0mobile"
where node >nul 2>nul
if errorlevel 1 (
  echo [ERRO] Node.js nao encontrado. Instale Node.js e abra este arquivo novamente.
  pause
  exit /b 1
)
where npm >nul 2>nul
if errorlevel 1 (
  echo [ERRO] npm nao encontrado. Reinstale Node.js com npm.
  pause
  exit /b 1
)
if not exist node_modules (
  echo Instalando dependencias do aplicativo Expo...
  call npm install
  if errorlevel 1 (
    echo [ERRO] Falha na instalacao do npm. Veja as mensagens acima.
    pause
    exit /b 1
  )
)
echo Iniciando Expo Web em http://localhost:8081 ...
call npm run web
if errorlevel 1 (
  echo [ERRO] Nao foi possivel iniciar o Expo Web. Veja as mensagens acima.
  pause
  exit /b 1
)
