#!/bin/bash

# Racelith Penalty Tracking System - Database Restore Script
# Usage: ./restore.sh <backup_file.sql.gz>

set -e

if [ $# -eq 0 ]; then
    echo "❌ Error: No backup file specified"
    echo "Usage: ./restore.sh <backup_file.sql.gz>"
    echo ""
    echo "Available backups:"
    ls -lh backups/db_*.sql.gz 2>/dev/null | tail -5 || echo "No backups found in ./backups/"
    exit 1
fi

BACKUP_FILE=$1

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Error: Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "🔄 Racelith Penalty Tracking System - Database Restore"
echo "======================================================"
echo ""
echo "⚠️  WARNING: This will REPLACE all current database data!"
echo "   Backup file: $BACKUP_FILE"
echo ""
read -p "Are you sure you want to continue? (yes/NO): " -r
echo

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "❌ Restore cancelled"
    exit 1
fi

# Check if services are running
if ! docker-compose ps db | grep -q "Up"; then
    echo "⚠️  Database container is not running. Starting it..."
    docker-compose up -d db
    echo "⏳ Waiting for database to be ready..."
    sleep 10
fi

# Check database connectivity
if ! docker-compose exec -T db pg_isready -U racelith_user > /dev/null 2>&1; then
    echo "❌ Database is not ready. Please check logs: docker-compose logs db"
    exit 1
fi

echo "📦 Restoring database from backup..."
echo "   This may take a few minutes depending on backup size..."

# Restore database
# Note: pg_restore for custom format, or psql for plain SQL
if [[ "$BACKUP_FILE" == *.gz ]]; then
    # Compressed backup - decompress and restore
    gunzip -c "$BACKUP_FILE" | docker-compose exec -T db psql -U racelith_user -d postgres
else
    # Uncompressed backup
    docker-compose exec -T db psql -U racelith_user -d postgres < "$BACKUP_FILE"
fi

if [ $? -eq 0 ]; then
    echo "✅ Database restore completed successfully!"
    echo ""
    echo "📊 Verifying restore..."
    
    # Check if control database has data
    SESSION_COUNT=$(docker-compose exec -T db psql -U racelith_user -d racelith_db -t -c "SELECT COUNT(*) FROM session_info;" 2>/dev/null | tr -d ' ')
    
    if [ -n "$SESSION_COUNT" ] && [ "$SESSION_COUNT" != "0" ]; then
        echo "✅ Control database restored: $SESSION_COUNT session(s) found"
    else
        echo "⚠️  Control database appears empty - verify backup file"
    fi
    
    # List restored databases
    echo ""
    echo "📋 Restored databases:"
    docker-compose exec -T db psql -U racelith_user -d postgres -c "\l" | grep "_db" || echo "No session databases found"
    
    echo ""
    echo "✅ Restore verification complete!"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Restart services: docker-compose restart"
    echo "   2. Verify application: Check frontend and test session creation"
    echo "   3. Check logs: docker-compose logs -f"
    
else
    echo "❌ Database restore failed!"
    echo "   Check backup file integrity and database logs"
    exit 1
fi

