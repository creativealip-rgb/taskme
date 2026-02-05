#!/bin/bash
cd /home/ubuntu/taskme/apps/api
npx tsx src/index.ts > /tmp/taskme-api.log 2>&1 &
echo $! > /tmp/taskme-api.pid
echo "API started on port 3000, PID: $(cat /tmp/taskme-api.pid)"
