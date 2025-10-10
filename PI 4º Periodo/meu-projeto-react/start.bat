@echo off
echo Iniciando servidor da Barbearia do Joao...
echo.

cd /d "D:\Java_VScode\Meus-Projetos\PI 4º Periodo\meu-projeto-react"

echo Verificando dependencias...
if not exist node_modules (
    echo Instalando dependencias...
    npm install
)

echo Iniciando servidor de desenvolvimento...
npm start

pause
