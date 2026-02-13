#!/bin/bash
# Tripwire: Fail if /bundle is found in frontend source code
# Usage: ./tripwire_bundle.sh

grep -r "/bundle" src/ --include=*.{js,jsx,ts,tsx} --exclude=tripwire_bundle.sh

if [ $? -eq 0 ]; then
    echo "❌ CRITICAL: /bundle endpoint usage detected in frontend code!"
    echo "Strict Contract Violation: The /bundle endpoint is forbidden."
    exit 1
else
    echo "✅ PASS: No /bundle usage detected."
    exit 0
fi
