#!/bin/bash
# Test script for task generation tools

echo "=================================="
echo "Task Generation Tools Test Suite"
echo "=================================="
echo ""

# Test 1: Check if scripts exist
echo "Test 1: Checking if all scripts exist..."
for script in parse_progress.js generate_gantt.js generate_tasks.js; do
    if [ -f "$script" ]; then
        echo "  ✅ $script exists"
    else
        echo "  ❌ $script not found"
        exit 1
    fi
done
echo ""

# Test 2: Check if PROGRESS.md exists
echo "Test 2: Checking if PROGRESS.md exists..."
if [ -f "../docs/PROGRESS.md" ]; then
    echo "  ✅ PROGRESS.md exists"
else
    echo "  ❌ PROGRESS.md not found"
    exit 1
fi
echo ""

# Test 3: Run parse_progress.js
echo "Test 3: Running parse_progress.js..."
if node parse_progress.js > /dev/null 2>&1; then
    echo "  ✅ parse_progress.js executed successfully"
else
    echo "  ❌ parse_progress.js failed"
    exit 1
fi
echo ""

# Test 4: Check if tasks.json was created
echo "Test 4: Checking if tasks.json was created..."
if [ -f "tasks.json" ]; then
    echo "  ✅ tasks.json created"
    TASK_COUNT=$(node -e "const data = require('./tasks.json'); console.log(data.tasks.length);")
    echo "  ℹ️  Extracted $TASK_COUNT tasks"
else
    echo "  ❌ tasks.json not found"
    exit 1
fi
echo ""

# Test 5: Run generate_tasks.js
echo "Test 5: Running generate_tasks.js..."
if node generate_tasks.js > /dev/null 2>&1; then
    echo "  ✅ generate_tasks.js executed successfully"
else
    echo "  ❌ generate_tasks.js failed"
    exit 1
fi
echo ""

# Test 6: Check if output files were created
echo "Test 6: Checking if output files were created..."
for file in "../docs/TASKS.md" "../docs/GANTT.md"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file created"
    else
        echo "  ❌ $file not found"
        exit 1
    fi
done
echo ""

# Test 7: Validate TASKS.md content
echo "Test 7: Validating TASKS.md content..."
if grep -q "タスク一覧" "../docs/TASKS.md"; then
    echo "  ✅ TASKS.md has expected content"
else
    echo "  ❌ TASKS.md content validation failed"
    exit 1
fi
echo ""

# Test 8: Validate GANTT.md content
echo "Test 8: Validating GANTT.md content..."
if grep -q "mermaid" "../docs/GANTT.md" && grep -q "gantt" "../docs/GANTT.md"; then
    echo "  ✅ GANTT.md has Mermaid gantt chart"
else
    echo "  ❌ GANTT.md content validation failed"
    exit 1
fi
echo ""

# Test 9: Check file sizes
echo "Test 9: Checking file sizes..."
TASKS_SIZE=$(wc -c < "../docs/TASKS.md")
GANTT_SIZE=$(wc -c < "../docs/GANTT.md")
if [ "$TASKS_SIZE" -gt 10000 ] && [ "$GANTT_SIZE" -gt 1000 ]; then
    echo "  ✅ Output files have reasonable sizes"
    echo "     TASKS.md: $TASKS_SIZE bytes"
    echo "     GANTT.md: $GANTT_SIZE bytes"
else
    echo "  ❌ Output files seem too small"
    exit 1
fi
echo ""

# Summary
echo "=================================="
echo "✅ All tests passed!"
echo "=================================="
echo ""
echo "Summary:"
echo "  - Scripts: OK"
echo "  - Execution: OK"
echo "  - Output files: OK"
echo "  - Content validation: OK"
echo "  - File sizes: OK"
echo ""
echo "Task generation tools are working correctly! 🎉"
