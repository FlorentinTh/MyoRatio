<div align="center"><img src="./src/assets/icons/app.png" alt="MyoRatio" height="200px" /><br /><h1>MyoRatio</h1><a href="https://github.com/FlorentinTh/MyoRatio/actions/workflows/github-code-scanning/codeql"><img src="https://img.shields.io/github/actions/workflow/status/FlorentinTh/MyoRatio/github-code-scanning/codeql?style=for-the-badge&label=CodeQL" alt="CodeQL" /></a>&nbsp;<a href="https://github.com/FlorentinTh/MyoRatio/actions/workflows/release.yml"><img src="https://img.shields.io/github/actions/workflow/status/FlorentinTh/MyoRatio/release.yml?style=for-the-badge&label=Release" alt="Release" /></a>&nbsp;<a href="#"><img src="https://img.shields.io/github/release-date/florentinth/MyoRatio?style=for-the-badge" alt="Release Date" /></a>&nbsp;<a href="https://github.com/FlorentinTh/MyoRatio/releases/latest"><img src="https://img.shields.io/github/v/tag/FlorentinTh/MyoRatio?style=for-the-badge" /></a>&nbsp;<a href="#"><img src="https://img.shields.io/badge/platforms-windows%20%26%20macOS%20-lightseagreen?style=for-the-badge" alt="Platforms" /></a>&nbsp;<a href="https://github.com/FlorentinTh/MyoRatio/blob/main/LICENSE"><img src="https://img.shields.io/github/license/florentinth/MyoRatio?style=for-the-badge" alt="License"/></a></div><br />

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


### Application & API Projects Setup

```powershell
# Create new root directory
$/> mkdir MyoRatioApp

# Move inside the new directory
$/> cd MyoRatioApp

# Clone API project
$/> git clone https://github.com/FlorentinTh/MyoRatio-API.git

# Clone application project
$/> git clone https://github.com/FlorentinTh/MyoRatio.git
```

### API Initialization

```powershell
$/> cd MyoRatio-API

# Configure Poetry
$/> poetry config virtualenvs.in-project true --local

# Install project dependencies
$/> poetry install

# Install Poetry plugin
$/> poetry self add 'poethepoet[poetry_plugin]'

# Rename environment configuration file (Windows)
> ren .env.example .env

# Rename environment configuration file (macOS)
$ mv .env.example .env

# Generate API secret key
$/> poetry poe secret
```

### Application Initialization

```powershell
# Move inside application directory
$/> cd ../MyoRatio

# Rename environment configuration files (Windows)
> ren env.app.json.example env.app.json
> ren env.build.json.example env.build.json

# Rename environment configuration files (macOS)
$ mv env.app.json.example env.app.json
$ mv env.build.json.example env.build.json

# Install project dependencies
$/> (npm | yarn | pnpm) install

# Fetch API secret key
$/> (npm | yarn | pnpm) run secret
```

### Run the Application
```powershell
# serve the API
$/> cd ../MyoRatio-API

$/> poetry run serve [port]
```

> Parameter ```[port]``` is optionnal. By default it will be  **3300** only if available.

```powershell
# start the application
$/> cd ../MyoRatio

$/> (npm | yarn | pnpm) run start
```

### Submitting Changes

> **Your commits should follow the [conventional commits specification](https://www.conventionalcommits.org/en/v1.0.0/) !**

- For the API, you can use the following command to proceed your commits:

```powershell
$/> poetry poe commit
```

- For the GUI, you can use the following command to proceed your commits:

```powershell
$/> (npm | yarn | pnpm) run commit
```

### Publish Version

To release a new version you can install the ```standard-version``` version package globally such as:

```powershell
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
> [!NOTE]
> Once the publish command is completed, a github action workflow will be triggered and the release will be automatically created in the remote repository populated with the installers for both platforms.

### Manually Release Installers

If you want to manually create the release installer, follow these instructions:

> [!IMPORTANT]
> For the macOS platform you will need to install the ```create-dmg``` package on the application project.

```powershell
# Move to the application project folder
$ cd ../MyoRatio

# Install the required dependency
$ npm install -D create-dmg@6.0.0
# or
$ (yarn | pnpm) add -D create-dmg@6.0.0
```

> [!IMPORTANT]
> On windows it is required to generate an SSL certificate to sign the installer. You can use [WSL](https://learn.microsoft.com/en-us/windows/wsl/install) to benefit from the availability of the openssl command line tool:

```powershell
# Create a new base folder to store your certificate files
$ mkdir ./.certs

# Generate a private key
$ openssl genrsa -out ./.certs/key.pem 4096

# Generate a new Certificate Signing Request (CSR)
$ openssl req -new -sha256 -key ./.certs/key.pem -out ./.certs/csr.csr -subj "/C=your_country_code/ST=your_state/L=your_location/O=your_organization/OU=your_organization_unit/CN=your_common_name"

# Generate a new certificate (valid 1 year)
$ openssl req -x509 -sha256 -days 365 -key ./.certs/key.pem -in ./.certs/csr.csr -out ./.certs/certificate.pem

# Convert your certificate into PFX
$ openssl pkcs12 -export -inkey ./.certs/key.pem -in ./.certs/certificate.pem -out ./.certs/certificate.pfx -password pass:your_cert_passphrase

# [OPTIONAL] Now using powershell, you can convert your PFX certficate into Base64
> [System.Convert]::ToBase64String([System.IO.File]::ReadAllBytes('.\certificate.pfx')) > '.\.certs\certificate.txt'
```

> [!WARNING]
> once the PFX certificate is generated Please update the ```env.build.json``` file according to the passphrase provided in the command respectively.

```powershell
# Move to the API project directory
$/> cd ../MyoRatio-API

# Build the API (Windows)
> poetry poe build-win

# Build the API (macOS)
$ poetry poe build-mac

# Move to the application project directory
$/> cd ../MyoRatio

# Build the application (Windows):
> (npm | yarn | pnpm) run build:win && (npm | yarn | pnpm) run publish:win
# Build the application (macOS):
> (npm | yarn | pnpm) run build:mac && (npm | yarn | pnpm) run publish:mac

```

> The resulting file is located under the folder of your current architecture inside```./MyoRatio/release```


## License

This project is licensed under the APGL-3.0 License - see the [LICENSE](LICENSE) file for details.
