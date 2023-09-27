
#!/bin/bash

# Define the name of the database to be exported
databaseName="attack-workspace"

# Define the folder where the exported database will be stored
importFolder="./"

# Define the target MongoDB instance details
targetHost="localhost"
targetPort="27017"
targetDatabaseName="attack-workspace"

# Check if the export folder exists. If not, create it.
if [ ! -d "$importFolder" ]; then
  echo "There is no export database directory: ${importFolder}!"
fi

# Run the mongorestore command to import the database into the target instance
mongorestore --host "$targetHost" --port "$targetPort" --db "$targetDatabaseName" "$importFolder/$databaseName"

# Check if the mongorestore command was successful
if [ $? -eq 0 ]; then
  echo "Database import successful!"
else
  echo "Database import failed!"
fi
