#!/bin/bash

# Define the name of the database to be exported
databaseName="attack-workspace"

# Define the folder where the exported database will be stored
exportFolder="./"

# Define the target MongoDB instance details
targetHost="localhost"
targetPort="27017"
targetDatabaseName="attack-workspace"

# Check if the export folder exists. If not, create it.
if [ ! -d "$exportFolder" ]; then
  mkdir -p "$exportFolder"
fi

# Run the mongodump command to export the database
mongodump --db "$databaseName" --out "$exportFolder"

# Check if the mongodump command was successful
if [ $? -eq 0 ]; then
  echo "Database export successful!"
else
  echo "Database export failed!"
  exit 1
fi
