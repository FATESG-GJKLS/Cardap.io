@echo off
setlocal
cd /d "%~dp0api"
where java >nul 2>nul
if errorlevel 1 (
  echo [ERRO] Java nao encontrado. Instale o JDK 17+ e abra este arquivo novamente.
  pause
  exit /b 1
)
where mvn >nul 2>nul
if errorlevel 1 (
  echo [ERRO] Maven nao encontrado. Instale o Maven 3.9+ e configure o PATH.
  pause
  exit /b 1
)
if not exist data mkdir data
echo Iniciando API Caradap.io em http://localhost:8080 ...
call mvn spring-boot:run
if errorlevel 1 (
  echo [ERRO] Nao foi possivel iniciar a API. Veja as mensagens acima.
  pause
  exit /b 1
)
