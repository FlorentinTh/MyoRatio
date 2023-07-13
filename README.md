# MyoRatio-GUI

![Release Date](https://img.shields.io/github/release-date/florentinth/MyoRatio-GUI?style=flat-square) [![Release](https://img.shields.io/github/release/FlorentinTh/MyoRatio-GUI?style=flat-square)](https://github.com/FlorentinTh/MyoRatio-GUI/releases)
![Platforms](https://img.shields.io/badge/platforms-win--32%20%7C%20win--64%20%7C%20osx--64%20-lightgrey?style=flat-square) ![License](https://img.shields.io/github/license/florentinth/MyoRatio-GUI?style=flat-square)

MyoRatio Application

## Prerequisites

- [Download and install node.js](https://nodejs.org/) (minimum required version is 18 or later) to build the GUI and the final application. It comes with npm but you can also download and install [yarn](https://yarnpkg.com/getting-started/install) or [pnpm](https://pnpm.io/installation) according to your preferences.

- [Download and install Python](https://www.python.org/downloads/) (minimum required version is 3.9 or later) - to build the API.

- [Download and install Poetry](https://python-poetry.org/docs/) a dependency management and packaging tools for Python.

- [Download and install the latest Windows SDK](https://developer.microsoft.com/en-US/windows/downloads/windows-sdk/) to sign the final release installer before distribution. **(Windows only)**

## Related Project

- [MyoRatio-API](https://github.com/FlorentinTh/MyoRatio-API)

## Build the Release Application

#### 1. Clone the Repositories {#sec-1}

```sh
$/> mkdir MyoRatio

$/> cd MyoRatio

$/> git clone https://github.com/FlorentinTh/MyoRatio-API.git

$/> git clone https://github.com/FlorentinTh/MyoRatio-GUI.git
```

#### 2. Build the API

##### 2.1. Setup project: {#sec-2-1}

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

##### 2.2. Release the API: {#sec-2-2}
```sh
# Windows:
> poetry poe build-win

# macOS:
$ poetry poe build-mac
```

> Release folder will be generated under ```MyoRatio-API/dist```

#### 3. Build the application release

##### 3.1. Setup project: {#sec-3-1}

```sh
$/> cd ../MyoRatio-GUI

# Windows:
> ren env.app.json.example env.app.json
> ren env.build.json.example env.build.json

# macOS:
$ mv env.app.json.example env.app.json
$ mv env.build.json.example env.build.json
```

##### 3.2. Install project dependencies:  {#sec-3-2}

```sh
# npm:
$/> npm install

# yarn:
$/> yarn install

#pnpm:
$/> pnpm install
```

> **Important!** On macOS you also need to install the ```create-dmg``` package:

```sh
$ npm install -D create-dmg@6.0.0

# or:
$ yarn add -D create-dmg@6.0.0

# or:
$ pnpm add -D create-dmg@6.0.0
```

##### 3.3. Generate an SSL certificate (Windows only):  {sec-3-3}

*This section is required only for the Windows build. You can use WSL to benefit from the availability of the openssl command line tool*

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

##### 3.4. Release the application: {sec-3-4}

```sh
## Windows:
> npm run build:win && npm run publish:win

# or
> yarn run build:win && yarn run publish:win

# or
> pnpm run build:win && pnpm run publish:win


## macOS:
> npm run build:mac && npm run publish:mac

# or
> yarn run build:mac && yarn run publish:mac

# or
> pnpm run build:mac && pnpm run publish:mac
```

> The resulting file is located under the folder of your current architecture inside```./MyoRatio-GUI/release```

## For Contributors

> **Ensure you followed [section 1](#sec-1), [section 2.1](#sec-2-1), [section 3.1](#sec-3-1) & [section 3.2](#sec-3-2).**


#### Serve the API:

```sh
$/> poetry run serve [port]
```

> Parameter ```[port]``` is optionnal. By default it will be  **3300** only if available.


#### Start the GUI:

```sh
$/> npm run start

# or
$/> yarn run start

# or
$/> pnpm run start

```

#### Submitting changes to the code:

> **Your commits should follow the [conventional commits specification](https://www.conventionalcommits.org/en/v1.0.0/) !**

- For the API, you can use the following command to proceed your commits:

```sh
$/> poetry poe commit
```

- For the GUI, you can use the following command to proceed your commits:

```sh
$/> npm run commit

# or
$/> yarn run commit

# or
$/> pnpm run commit
```

#### Release a New Version:

To release a new version you can install the ```standard-version``` version package globally such as:

```sh
$/> npm install -g standard-version

# or
$/> yarn global add standard-version

# or
$/> pnpm add -g standard-version
```

##### Releasing a new API version:
```sh
$/> poetry poe release && poetry poe publish
```

##### Releasing a new GUI version:
```sh
$/> npm run release && npm run publish

# or
$/> yarn run release && yarn run publish

# or
$/> pnpm run release && pnpm run publish
```

## Authors

- [**Florentin Thullier**](https://github.com/FlorentinTh) - 2022

## License

This project is licensed under the APGL-3.0 License - see the [LICENSE](LICENSE) file for details.
