@echo off
title BarberShop - Servidor de Desenvolvimento
color 0A

echo.
echo ========================================
echo    BARBERSHOP - REACT APP
echo ========================================
echo.

cd /d "%~dp0"

echo [1/4] Verificando diretorio...
if not exist "package.json" (
    echo ERRO: package.json nao encontrado!
    echo Certifique-se de estar na pasta correta.
    pause
    exit /b 1
)

echo [2/4] Verificando dependencias...
if not exist "node_modules" (
    echo Instalando dependencias...
    call npm install
    if errorlevel 1 (
        echo ERRO: Falha ao instalar dependencias!
        pause
        exit /b 1
    )
)

echo [3/4] Verificando arquivos...
if not exist "src\App.js" (
    echo ERRO: Arquivos do projeto nao encontrados!
    pause
    exit /b 1
)

echo [4/4] Iniciando servidor...
echo.
echo ========================================
echo    SERVIDOR INICIANDO...
echo    URL: http://localhost:3000
echo ========================================
echo.
echo Pressione Ctrl+C para parar o servidor
echo.

call npm start

pause
