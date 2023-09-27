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

# Function to build singularity images
build_singularity() {
  case $1 in
    mongo)
      singularity build mongodb.sif mongodb.def
      ;;
    api)
      singularity build workbench_rest_api.sif workbench_rest_api.def
      ;;
    frontend)
      singularity build workbench_frontend.sif workbench_frontend.def
      ;;
    all)
      build_singularity mongo
      build_singularity api
      build_singularity frontend
      ;;
    *)
      echo "Invalid argument. Usage: $0 {mongo|api|frontend|all}"
      exit 1
      ;;
  esac
}

# Build the corresponding singularity image based on the argument
build_singularity $1