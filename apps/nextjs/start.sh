#!/bin/bash
cd /home/ubuntu/taskme/apps/nextjs
npm run dev -- -p 3002 > /tmp/taskme-web.log 2>&1 &
echo $! > /tmp/taskme-web.pid
echo "Web started on port 3002, PID: $(cat /tmp/taskme-web.pid)"
