#!/bin/bash

# Check if the user has sudo privileges
if sudo -n true 2>/dev/null; then
  echo "The script will proceed with sudo privileges."
else
  echo "You need sudo privileges to run this script. Exiting."
  exit 1
fi

# Check if a command-line argument is provided
if [ "$#" -ne 1 ]; then
  echo "Usage: $0 {mongo|api|frontend|all}"
  exit 1
fi

# Function to run singularity commands
run_singularity() {
  case $1 in
    mongo)
      singularity run --bind ../db-data:/data/db --network=bridge --network-args="portmap=27017:27017/tcp" mongodb.sif &
      echo $! >> pids.txt
      ;;
    api)
      singularity run --bind ../singularity-resources/rest-api/rest-api-service-config.json:/usr/src/app/resources/rest-api-service-config.json:ro --network=bridge --network-args="portmap=3000:3000/tcp" workbench_rest_api.sif &
      echo $! >> pids.txt
      ;;
    frontend)
      singularity run --bind ../singularity-resources/nginx/nginx.conf:/etc/nginx/nginx.conf:ro,../singularity-resources/nginx-cache:/var/cache/nginx,../singularity-resources/nginx-pid:/var/run --network=bridge --network-args="portmap=80:80/tcp" workbench_frontend.sif &
      echo $! >> pids.txt
      ;;
    all)
      run_singularity mongo
      sleep 3 # wait for 3 seconds
      run_singularity api
      sleep 3 # wait for 3 seconds
      run_singularity frontend
      ;;
    *)
      echo "Invalid argument. Usage: $0 {mongo|api|frontend|all}"
      exit 1
      ;;
  esac
}

# Run the corresponding singularity command based on the argument
run_singularity $1

# Trap to clean up background processes on exit
trap 'cat pids.txt | xargs kill; rm pids.txt' EXIT

# Wait for user input to exit
read -p "Press any key to exit..." -n1 -s