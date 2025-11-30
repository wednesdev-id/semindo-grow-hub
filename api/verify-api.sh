#!/bin/bash

BASE_URL="http://localhost:3000/api/v1"
EMAIL="testuser_$(date +%s)@example.com"
PASSWORD="password123"

echo "1. Registering new user..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\", \"fullName\": \"Test User\", \"phone\": \"08123456789\", \"businessName\": \"Test Business\"}")
echo $REGISTER_RESPONSE

TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Token: $TOKEN"

if [ -z "$TOKEN" ]; then
  echo "Registration failed, cannot proceed."
  exit 1
fi

echo -e "\n2. Getting current user (Me)..."
curl -s -X GET "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $TOKEN"

echo -e "\n3. Updating Profile..."
curl -s -X PUT "$BASE_URL/profile" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"businessName": "Updated Business Name"}'

echo -e "\n4. Getting Profile..."
curl -s -X GET "$BASE_URL/profile" \
  -H "Authorization: Bearer $TOKEN"

echo -e "\n5. Listing Courses (LMS)..."
curl -s -X GET "$BASE_URL/lms/courses" \
  -H "Authorization: Bearer $TOKEN"

echo -e "\n6. Creating Assessment..."
ASSESSMENT_RESPONSE=$(curl -s -X POST "$BASE_URL/assessment" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}')
echo $ASSESSMENT_RESPONSE

ASSESSMENT_ID=$(echo $ASSESSMENT_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ ! -z "$ASSESSMENT_ID" ]; then
    echo -e "\n7. Getting Assessment Details..."
    curl -s -X GET "$BASE_URL/assessment/$ASSESSMENT_ID" \
      -H "Authorization: Bearer $TOKEN"
fi

echo -e "\nVerification Complete."
