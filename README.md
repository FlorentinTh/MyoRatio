<p align="center">
  <img src="./src/assets/icons/app.png" alt="MyoRatio" height="200px"/>
</p>

<div align="center">
  <h1>MyoRatio</h1>
</div>

<p align="center">
  <a href="https://github.com/FlorentinTh/MyoRatio/releases">
    <img src="https://img.shields.io/github/release/FlorentinTh/MyoRatio?style=for-the-badge" alt="npm version" />
  </a>
  <img src="https://img.shields.io/github/release-date/florentinth/MyoRatio?style=for-the-badge" alt="Release Date" />
  <img src="https://img.shields.io/badge/platforms-windows%20%26%20macOS%20-lightseagreen?style=for-the-badge" alt="Platforms" />
  <a href="https://github.com/FlorentinTh/MyoRatio/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/florentinth/MyoRatio?style=for-the-badge" alt="License" />
  </a>
</p>

## Documentation

[French](docs/guide-utilisateur.pdf) & [English](docs/user-guide.pdf) user guides can be found under the docs folder.

## Authors

- [**Florentin Thullier**](https://github.com/FlorentinTh) - 2022

## For Contributors

### Prerequisites

- [Download and install node.js](https://nodejs.org/) (minimum required version is 18 or later) to build the GUI and the final application. It comes with npm but you can also download and install [yarn](https://yarnpkg.com/getting-started/install) or [pnpm](https://pnpm.io/installation) according to your preferences.

- [Download and install Python](https://www.python.org/downloads/) (minimum required version is 3.9 or later) - to build the API.

- [Download and install Poetry](https://python-poetry.org/docs/) a dependency management and packaging tools for Python.

- [Download and install the latest Windows SDK](https://developer.microsoft.com/en-US/windows/downloads/windows-sdk/) to sign the final release installer before distribution. **(Windows only)**

### Related Project

- [MyoRatio-API](https://github.com/FlorentinTh/MyoRatio-API)


### Project Setup

```sh
$/> mkdir MyoRatioApp

$/> cd MyoRatioApp

$/> git clone https://github.com/FlorentinTh/MyoRatio-API.git

$/> git clone https://github.com/FlorentinTh/MyoRatio.git
```

### API Setup

```sh
$/> cd MyoRatio-API

$/> poetry config virtualenvs.in-project true --local

$/> poetry install

$/> poetry self add 'poethepoet[poetry_plugin]'

# Windows:
> ren .env.example .env

# macOS:
$ mv .env.example .env
```

### GUI Setup

```sh
$/> cd ../MyoRatio

# Windows:
> ren env.app.json.example env.app.json
> ren env.build.json.example env.build.json

# macOS:
$ mv env.app.json.example env.app.json
$ mv env.build.json.example env.build.json

# Install project dependencies:
$/> (npm | yarn | pnpm) install
```

> **Important!** On macOS you also need to install the ```create-dmg``` package:

```sh
$ npm install -D create-dmg@6.0.0
# or
$ (yarn | pnpm) add -D create-dmg@6.0.0
```
> **Important!** On windows it is required to generate an SSL certificate to sign the installer. You can use WSL to benefit from the availability of the openssl command line tool

```sh
# Create a new base folder to store your certificate files:
$ mkdir ./.certs

# Generate a private key:
$ openssl genrsa -out ./.certs/key.pem 4096

# Generate a new Certificate Signing Request (CSR):
$ openssl req -new -sha256 -key ./.certs/key.pem -out ./.certs/csr.csr

# Generate a  new certificate (valid 1 year):
$ openssl req -x509 -sha256 -days 365 -key ./.certs/key.pem -in ./.certs/csr.csr -out ./.certs/certificate.pem

# Convert your certificate:
$ openssl pkcs12 -export -inkey ./.certs/key.pem -in ./.certs/certificate.pem -out ./.certs/certificate.pfx
```

> **IMPORTANT!** Please update the ```env.build.json``` file according to the answer provided while creating the SSL certificate

### Run the Application
```sh
# serve the API
$/> cd ../MyoRatio-API
$/> poetry run serve [port]
```

> Parameter ```[port]``` is optionnal. By default it will be  **3300** only if available.

```sh
# start the GUI
$/> cd ../MyoRatio
$/> (npm | yarn | pnpm) run start
```

### Submitting Changes

> **Your commits should follow the [conventional commits specification](https://www.conventionalcommits.org/en/v1.0.0/) !**

- For the API, you can use the following command to proceed your commits:

```sh
$/> poetry poe commit
```

- For the GUI, you can use the following command to proceed your commits:

```sh
$/> (npm | yarn | pnpm) run commit
```

### Publish Version

To release a new version you can install the ```standard-version``` version package globally such as:

```sh
$/> npm install -g standard-version

# or
$/> yarn global add standard-version

# or
$/> pnpm add -g standard-version

# release the API
$/> poetry poe release && poetry poe publish

# release the GUI
$/> npm run release && npm run publish

# or
$/> yarn run release && yarn run publish

# or
$/> pnpm run release && pnpm run publish
```


### Release Installers

```sh
# build the API
$/> cd ../MyoRatio-API
## Windows:
> poetry poe build-win
## macOS:
$ poetry poe build-mac

# build the GUI
$/> cd ../MyoRatio
## Windows:
> (npm | yarn | pnpm) run build:win && (npm | yarn | pnpm) run publish:win
## macOS:
> (npm | yarn | pnpm) run build:mac && (npm | yarn | pnpm) run publish:mac

```

> The resulting file is located under the folder of your current architecture inside```./MyoRatio/release```


## License

This project is licensed under the APGL-3.0 License - see the [LICENSE](LICENSE) file for details.
