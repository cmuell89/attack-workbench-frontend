# Summary

See the top-level README.md for information about the MITRE ATT&CK Workbench. This README.md focuses on the Singularity containerization of the MITRE ATT&CK workbench and provides scripts for building Singularity .sif images, running those images, and basic utilities for importing/exporting the locally running MongoDB instance contained in one of those images. 

## Building the Singularity Images: `build.sh`

### Overview

The `build.sh` script is designed to automate the building of several Singularity container images that are integral components of a web application. The components involved include a MongoDB instance, a RESTful API backend, and an Nginx webserver serving the frontend. The user has the flexibility to build either individual container images or all of them simultaneously.

### Prerequisites

- Ensure that you have sudo privileges to execute the script.
- Singularity must be installed on your system.
- Ensure that the definition files `mongodb.def`, `workbench_rest_api.def`, and `workbench_frontend.def` are available in the current directory.

### Usage

The script can be executed with the following syntax:

```sh
./build.sh {mongo|api|frontend|all}
```

The available command-line arguments are:

- `mongo`: Builds the MongoDB container image.
- `api`: Builds the RESTful API backend container image.
- `frontend`: Builds the Nginx webserver container image for the frontend.
- `all`: Builds all three container images.

It is typically recommended to use the `all` argument to ensure that all components are built successfully. When using individual arguments, the corresponding container image will be built.

### Example

To build all components together, use the following command:

```sh
./build.sh all
```

Once executed, the script will build the specified container images, and upon completion, the images will be available in the current directory.

### Important Notes

- Ensure that the script has the executable permission. If not, you can add it using `chmod +x build.sh`.
- The build process may take some time, depending on the size and complexity of the container images.
- The definition files should be correctly configured and available in the same directory as the build script.

### Troubleshooting

If you encounter any issues, the script will output relevant error messages. Ensure that you meet all the prerequisites, have the correct definition files, and have the necessary permissions. If building fails, inspect the error messages for clues on what went wrong and adjust the definition files or system settings accordingly.


## Running the Singularity Images: `run.sh`

### Overview

The `run.sh` script is designed to automate the startup of several Singularity containers which encompass different components of the MITRE ATT&CK Workbench application. These components include a MongoDB instance, a RESTful API backend, and an Nginx webserver serving the frontend. The user has the flexibility to start either individual components or all of them together.

### Prerequisites

- Ensure that you have sudo privileges to execute the script.
- Singularity must be installed on your system.
- You must be in the the singularity/ directory of the attack-workbench-frontend repository. 

### Usage

The script can be executed with the following syntax:

```sh
./run.sh {mongo|api|frontend|all}
```

The available command-line arguments are:

- `mongo`: Starts the MongoDB container instance.
- `api`: Starts the RESTful API backend container.
- `frontend`: Starts the Nginx webserver container for the frontend.
- `all`: Starts all three containers together, in the order of MongoDB, API, and Frontend.

Generally, it is recommended to use the `all` argument to ensure that all components are started up correctly. When using the `all` argument, the script introduces a delay of 3 seconds between starting up the MongoDB instance and the API backend, and another 3 seconds between starting up the API backend and the Nginx webserver. This is to ensure that each component is fully initialized before starting the next.

### Example

To run all components together, use the following command:

```sh
./run.sh all
```

Open a browser and navigate to `localhost:8080` to reach the Workbench application. Any changes saved in the application will be saved locally on the container hosting system given that the MongoDB container uses a bounded volume on the host machine.

Once executed, the script will keep running, and the containers will remain active in the background. Press any key to exit the script. Upon exiting, all the background processes started by the script will be terminated.

### Important Notes

- Ensure that the script has the executable permission. If not, you can add it using `chmod +x run.sh`.
- Make sure that you have the necessary configuration files and directories available and correctly placed as per the bind paths specified in the script.
- Exiting the script will terminate all the background processes started by the script, regardless of whether they were started individually or together using the `all` argument.

### Troubleshooting

If you encounter any issues or have insufficient privileges, the script will output relevant error messages. Ensure that you meet all the prerequisites and have the correct file paths and permissions.


## MongoDB Database Exporter: `export_db.sh`

This script is a simple utility for exporting a MongoDB database. The current configuration is set to export a database named `attack-workspace` to the current directory and gives feedback on whether the operation was successful.

### Requirements

- MongoDB Singularity image must be running.
- `mongodump` utility must be available in your system's `PATH`. This is usually accomplished by going through the standard installation of MongoDB for your linux OS. 
- The user executing the script must have the necessary permissions to read the `attack-workspace` database and write to the `./` directory.

### Usage


**Execute the Script**

Run the script using the following command:

```sh
./export_db.sh
```

Upon successful execution, you will see the message:

```
Database export successful!
```

If the script encounters an error during execution, it will output:

```
Database export failed!
```

### Customization

If you wish to modify the script to export a different database, or to a different location, edit the following variables at the beginning of the script:

- `databaseName`: The name of the MongoDB database you wish to export.
- `exportFolder`: The directory where the exported database will be stored.
- `targetHost`: The host of the MongoDB instance.
- `targetPort`: The port on which MongoDB is running.
- `targetDatabaseName`: The name of the target database.

### Note

This script currently exports the database to the same MongoDB instance from which it's being exported, because `targetHost`, `targetPort`, and `targetDatabaseName` are set to the same values as the source. To import the database into a different MongoDB instance, you need to modify these target values accordingly.

This script does not contain the functionality to restore the dumped database. If you need to load the dumped database into another instance or database, you should use the provided `import_db.sh` script, or use an external program.

As such, the Compass GUI provided by MongoDB company could also perform the same service as this script. This might be necessary if you decide to host the MongoDB singularity image external to the localhost.

## MongoDB Database Importer: `import_db.sh`

This script is a simple utility for importing a MongoDB database. The current configuration is set to export a database named `attack-workspace` to the current directory and gives feedback on whether the operation was successful.

### Requirements

- MongoDB Singularity image must be running.
- `mongorestore` utility must be available in your system's `PATH` as this script is a basic wrapper aroudn that utility. This is usually accomplished by going through the standard installation of MongoDB for your linux OS. 
- The user executing the script must have the necessary permissions to read the `attack-workspace` database and write to the `./` directory.

### Usage


**Execute the Script**

Run the script using the following command:

```sh
./import_db.sh
```

Upon successful execution, you will see the message:

```
Database import successful!
```

If the script encounters an error during execution, it will output:

```
Database import failed!
```

### Customization

If you wish to modify the script to export a different database, or to a different location, edit the following variables at the beginning of the script:

- `databaseName`: The name of the MongoDB database you wish to export.
- `importFolder`: The directory from where the database will be imported. This means there will be a directory of the same name of the database within.
- `targetHost`: The host of the MongoDB instance.
- `targetPort`: The port on which MongoDB is running.
- `targetDatabaseName`: The name of the target database.

If you change the targetDatbaseName, you must ensure the directory for that database name exists inside the importFolder.

### Note

This script currently imports the database to the same MongoDB instance from the export script exported, because `targetHost`, `targetPort`, and `targetDatabaseName` are set to the same values as the source. To import the database into a different MongoDB instance, you need to modify these target values accordingly.

As mentioned above, the Compass GUI provided by MongoDB company could also perform the same service as this script. This might be necessary if you decide to host the MongoDB singularity image external to the localhost.

