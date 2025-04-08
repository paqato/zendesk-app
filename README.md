# PAQATO Zendesk App

## Dev Setup

```shell
./build.sh
cp settings.json.dist settings.json
```

## Build

```shell
./build.sh
```

## Run Zendesk Server

```shell
yarn start
```

## Debug

### Ruby Show Version

To show the current Ruby version run the following command inside the docker container:

```shell
ruby -v
```

### Ruby Available Versions

Run the following command inside the docker container:

```shell
rbenv install --list
```

### Ruby Installed Versions

Run the following command inside the docker container:

```shell
rbenv versions
```

### Ruby Change Version

Run the following command inside the docker container:

```shell
rbenv global <version>
```

### ZAT Show Version

Run the following command inside the docker container:

```shell
zat -v
```
