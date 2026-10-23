#!/bin/sh
cd /workspace
if curl -sf -o /dev/null --max-time 1 http://127.0.0.1:8080/; then
  exit 0
fi
export BROWSER=none
export EXPO_NO_TELEMETRY=1
nohup npm run dev > /tmp/larder-dev.log 2>&1 &
exit 0
