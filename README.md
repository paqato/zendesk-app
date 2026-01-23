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

## Package

Um die App als ZIP-Datei für den Upload in Zendesk zu erstellen:

```shell
NODE_OPTIONS=--openssl-legacy-provider yarn build
cd dist && zip -r ../paqato-zendesk-app.zip .
```

Die ZIP-Datei kann dann in Zendesk hochgeladen werden unter:
**Admin Center → Apps and integrations → Apps → Zendesk Support apps → Upload private app**

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
