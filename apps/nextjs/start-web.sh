#!/bin/bash
cd /home/ubuntu/taskme/apps/nextjs
npm run dev -- -p 3002 > /tmp/taskme-web.log 2>&1 &
echo $! > /tmp/taskme-web.pid
echo "Started on port 3002, PID: $!"
sleep 5
curl -s -I http://localhost:3002 | head -1
