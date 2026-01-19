#!/bin/bash
set -e

echo "⏪ Rolling back to previous version..."

# Get previous commit
PREVIOUS_COMMIT=$(git rev-parse HEAD~1)

echo "📌 Previous commit: $PREVIOUS_COMMIT"

# Checkout previous version
git checkout $PREVIOUS_COMMIT

# Run deployment
./scripts/deploy.sh dev

echo "✅ Rollback complete!"
echo "ℹ️  To return to latest: git checkout main && git pull"
