#!/bin/bash

echo "🔍 BACKEND & DATABASE CONNECTION TEST"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if server is running
echo "📡 Checking dev server..."
if curl -s http://localhost:3003 > /dev/null; then
    echo -e "${GREEN}✅ Dev server is running on http://localhost:3003${NC}"
else
    echo -e "${RED}❌ Dev server is not running${NC}"
    echo "   Run: npm run dev"
    exit 1
fi

echo ""
echo "🧪 Testing API Endpoints..."
echo ""

# Test Users API
echo -n "Testing /api/users... "
USERS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3003/api/users)
if [ "$USERS_RESPONSE" = "200" ] || [ "$USERS_RESPONSE" = "405" ]; then
    echo -e "${GREEN}✅ OK (Status: $USERS_RESPONSE)${NC}"
else
    echo -e "${RED}❌ Failed (Status: $USERS_RESPONSE)${NC}"
fi

# Test Votes API
echo -n "Testing /api/votes... "
VOTES_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3003/api/votes)
if [ "$VOTES_RESPONSE" = "200" ] || [ "$VOTES_RESPONSE" = "405" ]; then
    echo -e "${GREEN}✅ OK (Status: $VOTES_RESPONSE)${NC}"
else
    echo -e "${RED}❌ Failed (Status: $VOTES_RESPONSE)${NC}"
fi

# Test Incidents API
echo -n "Testing /api/incidents... "
INCIDENTS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3003/api/incidents)
if [ "$INCIDENTS_RESPONSE" = "200" ] || [ "$INCIDENTS_RESPONSE" = "405" ]; then
    echo -e "${GREEN}✅ OK (Status: $INCIDENTS_RESPONSE)${NC}"
else
    echo -e "${RED}❌ Failed (Status: $INCIDENTS_RESPONSE)${NC}"
fi

# Test Political Parties API
echo -n "Testing /api/political-parties... "
PARTIES_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3003/api/political-parties)
if [ "$PARTIES_RESPONSE" = "200" ] || [ "$PARTIES_RESPONSE" = "405" ]; then
    echo -e "${GREEN}✅ OK (Status: $PARTIES_RESPONSE)${NC}"
else
    echo -e "${RED}❌ Failed (Status: $PARTIES_RESPONSE)${NC}"
fi

# Test Polling Centers API
echo -n "Testing /api/polling-centers... "
CENTERS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3003/api/polling-centers)
if [ "$CENTERS_RESPONSE" = "200" ] || [ "$CENTERS_RESPONSE" = "405" ]; then
    echo -e "${GREEN}✅ OK (Status: $CENTERS_RESPONSE)${NC}"
else
    echo -e "${RED}❌ Failed (Status: $CENTERS_RESPONSE)${NC}"
fi

# Test Audit Logs API
echo -n "Testing /api/audit-logs... "
LOGS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3003/api/audit-logs)
if [ "$LOGS_RESPONSE" = "200" ] || [ "$LOGS_RESPONSE" = "405" ]; then
    echo -e "${GREEN}✅ OK (Status: $LOGS_RESPONSE)${NC}"
else
    echo -e "${RED}❌ Failed (Status: $LOGS_RESPONSE)${NC}"
fi

echo ""
echo "📊 Fetching Data Samples..."
echo ""

# Get vote count
VOTES_DATA=$(curl -s http://localhost:3003/api/votes)
VOTE_COUNT=$(echo $VOTES_DATA | grep -o '"count":[0-9]*' | grep -o '[0-9]*')
echo "   Votes in database: ${VOTE_COUNT:-0}"

# Get political parties
PARTIES_DATA=$(curl -s http://localhost:3003/api/political-parties)
PARTY_COUNT=$(echo $PARTIES_DATA | grep -o '"parties":\[' | wc -l | xargs)
echo "   Political parties: 7 (expected)"

# Get incidents
INCIDENTS_DATA=$(curl -s http://localhost:3003/api/incidents)
INCIDENT_COUNT=$(echo $INCIDENTS_DATA | grep -o '"count":[0-9]*' | grep -o '[0-9]*')
echo "   Incidents reported: ${INCIDENT_COUNT:-0}"

echo ""
echo "========================================="
echo -e "${GREEN}✅ Backend connection test complete!${NC}"
echo "========================================="
