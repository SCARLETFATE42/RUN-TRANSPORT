@echo off
cd /d "C:\Users\micha\Documents\RUN TRANSPORT"
call npm.cmd run dev -- --host 127.0.0.1 --port 5173 > ".dev-server.log" 2>&1
