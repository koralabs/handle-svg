#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPORT_FILE="$ROOT_DIR/test_coverage.report"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

THRESHOLD_LINES=90
THRESHOLD_BRANCHES=90

cd "$ROOT_DIR"

npm test > "$TMP_DIR/standard.log" 2>&1

npx --yes c8 \
    --all \
    --reporter=text \
    --reporter=json-summary \
    --include=lib/index.js \
    --include=lib/utils/checkContrast.js \
    --include=lib/utils/constants.js \
    --include=lib/utils/getMaxOffset.js \
    --include=lib/utils/imageHelpers.js \
    --include=lib/utils/index.js \
    --include=lib/utils/getSocialIcon.js \
    --include=lib/utils/getFontArrayBuffer.js \
    --exclude=tests/** \
    --report-dir "$TMP_DIR/cov" \
    npm test > "$TMP_DIR/coverage.log" 2>&1

read -r LINE_COVERAGE BRANCH_COVERAGE < <(
    node -e "const fs=require('fs');const s=JSON.parse(fs.readFileSync(process.argv[1],'utf8')).total;process.stdout.write(s.lines.pct.toFixed(2)+' '+s.branches.pct.toFixed(2)+'\n');" "$TMP_DIR/cov/coverage-summary.json"
)

STATUS="pass"
LANGUAGE_STATUS="pass"
if awk -v line="$LINE_COVERAGE" -v branch="$BRANCH_COVERAGE" -v tl="$THRESHOLD_LINES" -v tb="$THRESHOLD_BRANCHES" 'BEGIN { exit !((line + 0 < tl) || (branch + 0 < tb)) }'; then
    STATUS="fail"
    LANGUAGE_STATUS="fail"
fi

SOURCE_PATHS="lib/index.js;lib/utils/{checkContrast.js,constants.js,getMaxOffset.js,imageHelpers.js,index.js,getSocialIcon.js,getFontArrayBuffer.js}"
EXCLUDED_PATHS="src/**:typescript-source-tracked-but-runtime-tests-execute-compiled-lib-output;lib/HandleSvg.js:requires-broader-font-rendering-and-svg-runtime-integration-coverage;lib/scripts/**:local-rendering-scripts-excluded-from-runtime-coverage;lib/interfaces/**:compiled-type-surface-not-runtime-logic"

{
    echo "FORMAT_VERSION=1"
    echo "REPO=handle-svg"
    echo "TIMESTAMP_UTC=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    echo "THRESHOLD_LINES=$THRESHOLD_LINES"
    echo "THRESHOLD_BRANCHES=$THRESHOLD_BRANCHES"
    echo "TOTAL_LINES_PCT=$LINE_COVERAGE"
    echo "TOTAL_BRANCHES_PCT=$BRANCH_COVERAGE"
    echo "STATUS=$STATUS"
    echo "SOURCE_PATHS=$SOURCE_PATHS"
    echo "EXCLUDED_PATHS=$EXCLUDED_PATHS"
    echo "LANGUAGE_SUMMARY=nodejs:lines=$LINE_COVERAGE,branches=$BRANCH_COVERAGE,tool=c8,status=$LANGUAGE_STATUS"
    echo ""
    echo "=== RAW_OUTPUT_STANDARD_NPM_TEST ==="
    cat "$TMP_DIR/standard.log"
    echo ""
    echo "=== RAW_OUTPUT_COVERAGE_C8 ==="
    cat "$TMP_DIR/coverage.log"
} > "$REPORT_FILE"

if [[ "$STATUS" != "pass" ]]; then
    echo "Coverage threshold not met (line=${LINE_COVERAGE}%, branch=${BRANCH_COVERAGE}%)." >&2
    exit 1
fi

echo "Coverage threshold met (line=${LINE_COVERAGE}%, branch=${BRANCH_COVERAGE}%)."
