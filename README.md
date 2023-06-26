# MyoRatio-GUI

![Release Date](https://img.shields.io/github/release-date/florentinth/MyoRatio-GUI?style=flat-square) [![Release](https://img.shields.io/github/release/FlorentinTh/MyoRatio-GUI?style=flat-square)](https://github.com/FlorentinTh/MyoRatio-GUI/releases)
![Platforms](https://img.shields.io/badge/platforms-win--32%20%7C%20win--64%20%7C%20osx--64%20-lightgrey?style=flat-square) ![License](https://img.shields.io/github/license/florentinth/MyoRatio-GUI?style=flat-square)

MyoRatio Application

## Prerequisites

- [Download and install node.js](https://nodejs.org/) (minimum required version is 18 or later) to build the GUI and the final application. It comes with npm but you can also download and install [yarn](https://yarnpkg.com/getting-started/install) or [pnpm](https://pnpm.io/installation) according to your preferences.

-  [Download and install Python](https://www.python.org/downloads/) (minimum required version is 3.9 or later) - to build the API.

- [Download and install the latest Windows SDK](https://developer.microsoft.com/en-US/windows/downloads/windows-sdk/) to sign the final release installer before distribution.

## Related Project

- [MyoRatio-API](https://github.com/FlorentinTh/MyoRatio-API)

## Build the Release Application

#### 1. Clone the Repositories

```sh
$/> git clone https://github.com/FlorentinTh/MyoRatio-API.git

$/> git clone https://github.com/FlorentinTh/MyoRatio-GUI.git
```

#### 2. Build the API

```sh
$/> cd <your_base_path>/MyoRatio-API
```

**2.1. Setup project:**

_Windows_
```sh
> py -m pip install --upgrade pip
> py -m venv .\venv
> .\venv\Scripts\activate
(venv) > pip install -r requirements.txt
```

_macOS_
```sh
$ python3 -m pip install --user --upgrade pip
$ python3 -m venv ./venv
$ source ./venv/bin/activate
(venv) $ pip install -r requirements.txt
```

> change ```configuration.py``` file content according to your needs

**2.2. Release the API:**

*Windows:*
```sh
(venv) > pyinstaller --paths 'src' \
            --collect-all charset_normalizer \
            --collect-all reportlab.graphics.barcode \
            --console \
            --clean \
            --name MyoRatioAPI \
            --icon='assets/icons/win/app.ico' \
            server.py --noconfirm
```

*macOS:*
```sh
(venv) $ pyinstaller --paths 'src' \
            --collect-all charset_normalizer \
            --collect-all reportlab.graphics.barcode \
            --console \
            --clean \
            --name MyoRatioAPI \
            --icon='assets/icons/mac/app.icns' \
            server.py --noconfirm
```

> Release folder will be generated under ```MyoRatio-API/dist```

#### 3. Build the application release

```sh
$/> cd <your_base_path>/MyoRatio-GUI
```

**3.1. Install project dependencies:**

_Windows_

```sh
# npm:
> npm install --no-optional

# yarn:
> yarn install --ignore-optional

#pnpm:
> pnpm install --no-optional
```

_macOS_
```sh
$ (npm | yarn | pnpm) install
```

**3.2. Generate an SSL certificate:**

_Windows:_

> This section is required only for the Windows build.
> You can use WSL to benefit from the availability of the openssl command line tool

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

**3.3. Configure environment:**

*Windows:*
```sh
> ren env.app.json.example env.app.json
```

*macOS:*
```sh
$ mv env.app.json.example env.app.json
```

> Edit the content of the **API_KEY** and **CERT_PWD** environment variables

**3.4. Include the API:**

*Windows:*
```powershell
> xcopy /e /k /h /i <your_base_path>\MyoRatio-API\dist\MyoRatioAPI .\bin\MyoRatioAPI
```
*macOS:*
```sh
$ cp -r <your_base_path>/MyoRatio-API/dist/MyoRatioAPI ./bin/MyoRatioAPI
```

**3.5. Release the application:**

*Windows:*
```sh
> (npm | yarn | pnpm) run build:win && (npm | yarn | pnpm) run publish:win
```
> An ```exe``` setup is created under ```MyoRatio-GUI/release/winx64```

*macOS:*
```sh
$ (npm | yarn | pnpm) run build:mac && (npm | yarn | pnpm) run publish:mac
```

> A ```dmg``` file is created under ```MyoRatio-GUI/release/macx64```

## For Contributors

#### Setup the API project

_Windows_
```sh
# Clone the API project:
> git clone https://github.com/FlorentinTh/MyoRatio-API.git

# Setup project:
> py -m pip install --upgrade pip
> py -m pip install --user virtualenv
> py -m venv .\venv
> .\venv\Scripts\activate

# Install dependencies
(venv) > pip install -r requirements.txt

# Edit the configuration.py file if needed

# Run the project:
(venv) > py server.py
```

_macOS_
```sh
# Clone the API project:
> git clone https://github.com/FlorentinTh/MyoRatio-API.git

# Setup project:
$ python3 -m pip install --user --upgrade pip
$ python3 -m pip install --user virtualenv
$ python3 -m venv ./venv
$ source ./venv/bin/activate

# Install dependencies
(venv) $ pip install -r requirements.txt

# Edit the configuration.py file if needed

# Run the project:
(venv) > python3 server.py
```

#### Setup the GUI project:

```sh
# Clone the GUI project:
$/> git clone https://github.com/FlorentinTh/MyoRatio-GUI.git

# Rename the env.json file (edit its content if needed):
## Windows:
  > ren env.app.json.example env.app.json
  > ren env.build.json.example env.build.json

## macOS:
  $ mv env.app.json.example env.app.json
  $ mv env.build.json.example env.build.json

# Install project dependencies:
## Windows:
> npm install --no-optional # or
> yarn install --ignore-optional # or
> pnpm install --no-optional

## macOS:
> (npm | yarn | pnpm) install

# Run the project:
$/> (npm | yarn | pnpm) run start
```

> **Your commits should follow the [conventional commits specification](https://www.conventionalcommits.org/en/v1.0.0/) !**

- For the API, you can use the following command to proceed your commits:

  ```sh
  (venv) $/> cz commit
  ```

- For the GUI, you can use the following command to proceed your commits:

  ```sh
  $/> (npm | yarn | pnpm) run commit
  ```

#### Release a New Version:

To release a new version you can install the ```standard-version``` version package globally such as:

```sh
$/> npm install -g standard-version # or
$/> yarn global add standard-version # or
$/> pnpm add -g standard-version
```

**- API:**
```sh
# deactivate the venv:
(venv) $/> deactivate

# run standard-version:
$/> standard-version

# publish the new release:
$/> git push --follow-tags origin main
```

***- GUI:***
```sh
# run standard-version:
$/> (npm | yarn | pnpm) run release

#publish the new release:
$/> (npm | yarn | pnpm) run git:publish
```

## Authors

- [**Florentin Thullier**](https://github.com/FlorentinTh) - 2022

## License

This project is licensed under the Apache-2.0 License - see the [LICENSE](LICENSE) file for details.
