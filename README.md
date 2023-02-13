# EMG-Trigno-GUI

![Release Date](https://img.shields.io/github/release-date/florentinth/EMG-Trigno-GUI?style=flat-square) [![Release](https://img.shields.io/github/release/FlorentinTh/EMG-Trigno-GUI?style=flat-square)](https://github.com/FlorentinTh/EMG-Trigno-GUI/releases)
![Platforms](https://img.shields.io/badge/platforms-win--32%20%7C%20win--64%20%7C%20osx--64%20-lightgrey?style=flat-square) ![License](https://img.shields.io/github/license/florentinth/EMG-Trigno-GUI?style=flat-square)

Application to process EMG Trigno data

## Prerequisites

- [Node.js > 18](https://nodejs.org/)
  - npm, [yarn](https://yarnpkg.com/getting-started/install) or [pnpm](https://pnpm.io/installation)
- [Python > 3.9](https://www.python.org/downloads/)

## Related Project

- [EMG-Trigno-API](https://github.com/FlorentinTh/EMG-Trigno-API)

## Build the Release Application

#### 1. Clone the Repositories

```
$/> git clone https://github.com/FlorentinTh/EMG-Trigno-API.git

$/> git clone https://github.com/FlorentinTh/EMG-Trigno-GUI.git
```

#### 2. Build the API

```
$/> cd <your_base_path>/EMG-Trigno-API
```

2.1. Install project dependencies :
```
$/> pip install -r requirements.txt
```

> change ```configuration.py``` file content according to your needs

2.2. Create the release folder :

*Windows:*
```
> pyinstaller --paths 'src' \
            --collect-all charset_normalizer \
            --collect-all reportlab.graphics.barcode \
            --console \
            --clean \
            --name EMGTrignoAPI \
            --icon='src/assets/icons/win/app.ico' \
            app.py --noconfirm
```

*macOS:*
```
$ pyinstaller --paths 'src' \
            --collect-all charset_normalizer \
            --collect-all reportlab.graphics.barcode \
            --console \
            --clean \
            --name EMGTrignoAPI \
            --icon='src/assets/icons/mac/app.icns' \
            app.py --noconfirm
```

> Release folder will be generated under ```EMG-Trigno-API/dist```

#### 3. Build the Release

```
$/> cd <your_base_path>/EMG-Trigno-GUI
```

3.1. Install project dependencies :

*npm:*
```
$/> npm install
```
*yarn:*
```
$/> yarn install
```
*pnpm:*
```
$/> pnpm install
```

3.2. Configure environment :

*Windows:*
```cmd
> ren env.json.example env.json
```

*macOS:*
```sh
$ mv env.json.example env.json
```

> Edit the content of the file according to your needs

3.3. Include the API application:

*Windows:*
```cmd
> xcopy /e /k /h /i <your_base_path>\EMGTrignoAPI\dist\EMGTrignoAPI .\bin\EMGTrignoAPI
```
*macOS:*
```sh
$ cp -r <your_base_path>/EMGTrignoAPI/dist/EMGTrignoAPI ./bin/EMGTrignoAPI
```

3.4. Build the Release Application:

*Windows:*
```cmd
> npm run build:win && npm run publish:win
```
> An ```exe``` setup is created under ```EMG-Trigno-GUI/dist```

*macOS:*
```sh
$ npm run build:mac && npm run publish:mac
```
> A ```dmg``` file is created under ```EMG-Trigno-GUI/dist```

## For Developers

- API:
> Preferably you should setup and use a virtual environment!
```sh
# Clone the API project:
$/> git clone https://github.com/FlorentinTh/EMG-Trigno-API.git

# Edit the configuration.py file if needed

# Install project dependencies:
$/> pip install -r requirements.txt

# Run the project:
$/> python app.py
```

- GUI:
```sh
# Clone the GUI project:
$/> git clone https://github.com/FlorentinTh/EMG-Trigno-GUI.git

# Rename the env.json file (edit its content if needed):
## Windows:
> ren env.json.example env.json
## macOS:
$ mv env.json.example env.json

# Install project dependencies:
$/> npm install
## or
$/> yarn install
## or
$/> pnpm install

# Run the project:
$/> npm run start
```

> **Your commits should follow the conventional commits specification !**

## Authors

- [**Florentin Thullier**](https://github.com/FlorentinTh) - 2022

## License

This project is licensed under the Apache-2.0 License - see the [LICENSE](LICENSE) file for details.
