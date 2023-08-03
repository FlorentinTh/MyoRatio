# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [3.0.0](https://github.com/FlorentinTh/MyoRatio-GUI/compare/v2.6.2...v3.0.0) (2023-08-03)


### Features

* **application:** add support for dynamic application configuration ([4b58ab0](https://github.com/FlorentinTh/MyoRatio-GUI/commit/4b58ab03c8b4d09e33a19b41a7ecd1a1487ac244))


### Build System

* **webpack-config:** update disk usage performance on dev builds with HMR ([692816a](https://github.com/FlorentinTh/MyoRatio-GUI/commit/692816a2f9ec4b56b0de27848a35c5b272a8a0fa))


### Refactors

* **data-discovering:** change redirect button label when convertion is not completed ([86421f7](https://github.com/FlorentinTh/MyoRatio-GUI/commit/86421f75080c02991935f6a045687f94114a8b4c))
* **lint:** resolve all linting related issues ([1375c5d](https://github.com/FlorentinTh/MyoRatio-GUI/commit/1375c5df9afc5e6861195f7e620672a74a6b1e7b))

### [2.6.2](https://github.com/FlorentinTh/MyoRatio-GUI/compare/v2.6.1...v2.6.2) (2023-07-14)


### Chore

* **standard-version:** add missing .versionrc file to better handle changelog generation ([97cb7a9](https://github.com/FlorentinTh/MyoRatio-GUI/commit/97cb7a9e040b9742a3f0658721cca3321d0ebaf7))

### [2.6.1](https://github.com/FlorentinTh/MyoRatio-GUI/compare/v2.6.0...v2.6.1) (2023-07-14)

## [2.6.0](https://github.com/FlorentinTh/MyoRatio-GUI/compare/v2.5.0...v2.6.0) (2023-07-14)


### Features

* **license:** add new third party component notice ([b8bd58a](https://github.com/FlorentinTh/MyoRatio-GUI/commit/b8bd58a42597f8b4a43a13703da08a4fdfbd67e0))


### Bug Fixes

* **data-discovering:** fix some issues with requests error handling ([9268c17](https://github.com/FlorentinTh/MyoRatio-GUI/commit/9268c17e6aad6a67928f10bdb3769de0ed04420c))

## [2.5.0](https://github.com/FlorentinTh/MyoRatio-GUI/compare/v2.4.0...v2.5.0) (2023-07-09)


### Features

* **copyright:** add logo and people to copyright ([b166277](https://github.com/FlorentinTh/MyoRatio-GUI/commit/b166277b25f65c6a739c09d86da280a60ce28d28))
* **image & link helpers:** add helpers to handle external links and images path for production app ([e0329e8](https://github.com/FlorentinTh/MyoRatio-GUI/commit/e0329e8b44c2920fe32a5f5906dd43e67fe1204f))
* **index:** add a retry button if initial components fail to start ([d76b13b](https://github.com/FlorentinTh/MyoRatio-GUI/commit/d76b13b2aa3bccc969ea6f929681474093f94278))
* **license:** add new license page ([79c9bb4](https://github.com/FlorentinTh/MyoRatio-GUI/commit/79c9bb49c0cbe144653ab149d1a69bdde424a59c))
* **license:** add third party notices ([421402b](https://github.com/FlorentinTh/MyoRatio-GUI/commit/421402b1dd6cb5128d0ca3697aee9286e32c5240))
* **menu:** add disable content overlay when menu is open ([9ea27a0](https://github.com/FlorentinTh/MyoRatio-GUI/commit/9ea27a0950f05db36d763264e3fe50f06bea97c5))
* **menu:** add logos to menu ([1e335b8](https://github.com/FlorentinTh/MyoRatio-GUI/commit/1e335b835fd62fafda4fc6f9e166e0a8ec436168))
* **overlay:** add ability to customize the label of the interact button ([f905336](https://github.com/FlorentinTh/MyoRatio-GUI/commit/f905336e3d7163bcd59ac4d2b370459a42d2e68e))
* **participants-selection:** add a warning popup if reports have already been created ([c36e884](https://github.com/FlorentinTh/MyoRatio-GUI/commit/c36e8840994b32c68cbd45b7bf107ffaecc74dff))
* **participants-selection:** add fetch XLSX summary request ([50c6dac](https://github.com/FlorentinTh/MyoRatio-GUI/commit/50c6dac4e042d823f7552a968ad9ad1ca8dc9a94))
* **win-update:** automate change of iss file when app version is updated ([459e392](https://github.com/FlorentinTh/MyoRatio-GUI/commit/459e392ca45fcca44251cc27708ed41fb5850ae8))


### Bug Fixes

* **buttons:** prevent additional buttons to be clicked when menu is open ([bf4f90e](https://github.com/FlorentinTh/MyoRatio-GUI/commit/bf4f90e3ff6d0ec222da97b083ddeddac4d74016))
* **config:** move build related env variables to separate file to avoid vulnerability ([828abcc](https://github.com/FlorentinTh/MyoRatio-GUI/commit/828abcc35fc128fa4cb376fdc9fdfaad9a40f828))
* **image-helper:** fix images path issues with macOS application ([d8f475e](https://github.com/FlorentinTh/MyoRatio-GUI/commit/d8f475e3e8a6a4956d38a0ee5dc7540518259144))
* **link-helper:** add missing auxclick event handler for external links ([eb6b274](https://github.com/FlorentinTh/MyoRatio-GUI/commit/eb6b274d3388bd6254b148f9e8a7e6d6e91f3430))
* **participant-selection:** fix issue with export button click event ([2659a65](https://github.com/FlorentinTh/MyoRatio-GUI/commit/2659a653bb2db890e890dd6e24e7ffcee48171d0))
* **views:** add missing rel="noopener" for external links ([416ebdb](https://github.com/FlorentinTh/MyoRatio-GUI/commit/416ebdb7719ae73c214a48ae76bf2a75f56efa94))

## [2.4.0](https://github.com/FlorentinTh/MyoRatio-GUI/compare/v2.3.0...v2.4.0) (2023-06-19)


### Features

* **index:** add condition on application environment to auto start API or not ([17120c9](https://github.com/FlorentinTh/MyoRatio-GUI/commit/17120c974966f6ed36e637c1175662f91a0adb35))
* **participants-selection:** move stage selector to a component & condition content given analysis ([429f3a6](https://github.com/FlorentinTh/MyoRatio-GUI/commit/429f3a602e35d2ec8d6b725f429fe01801230cdc))
* **results:** change matrix from only lower to both lower and upper given stage ([b8ed791](https://github.com/FlorentinTh/MyoRatio-GUI/commit/b8ed79153ea1cc4fcb09186a3d03050456d363fc))


### Bug Fixes

* **angles-preview:** fix sort of the list of participants ([69fc078](https://github.com/FlorentinTh/MyoRatio-GUI/commit/69fc078b53da98391f57cbfd6ee2d4447105d02c))
* **data-discovering:** prevent macOs users of being redirected to the converter page ([4e97966](https://github.com/FlorentinTh/MyoRatio-GUI/commit/4e97966b3dcc56a3c57a350138edde0002edee05))
* **index:** add missing port save to local-storage when environment is development ([c5c7b9c](https://github.com/FlorentinTh/MyoRatio-GUI/commit/c5c7b9c88036a451761a4a7922fb16574939fa4a))
* **participants-selection:** fix issue with stage selector initialization ([010f435](https://github.com/FlorentinTh/MyoRatio-GUI/commit/010f435dfc86987d93673696fcb40b8b57fa1bab))
* **results:** change matrix axis labels ([39fac88](https://github.com/FlorentinTh/MyoRatio-GUI/commit/39fac88f3dcf1470a04bad6a9a2f6fbdf8dd63c7))
* **results:** revised version of the generation of the results given the analysis and stage ([145b176](https://github.com/FlorentinTh/MyoRatio-GUI/commit/145b1763b062110d8b7c9b3cddca6565fc35a6c6))

## [2.3.0](https://github.com/FlorentinTh/MyoRatio-GUI/compare/v2.2.0...v2.3.0) (2023-05-29)


### Features

* **participants-selection:** add numeric desc sort in list of participants ([5029c5d](https://github.com/FlorentinTh/MyoRatio-GUI/commit/5029c5d1d10f044b3a6c8d74b2335fabc1ad2d9e))

## [2.2.0](https://github.com/FlorentinTh/MyoRatio-GUI/compare/v2.1.0...v2.2.0) (2023-05-20)


### Features

* **application:** add code signin for final release installer before distribution ([f583d82](https://github.com/FlorentinTh/MyoRatio-GUI/commit/f583d82edc6103f30a2dc769d213ca2d53971f5f))
* **menu:** add application version at the bottom of the menu panel ([2ff4f4c](https://github.com/FlorentinTh/MyoRatio-GUI/commit/2ff4f4c176b22149dff7a74097ff6868fdf9041d))


### Bug Fixes

* **index:** update retry policy for API to be started at application initialization ([c9b63de](https://github.com/FlorentinTh/MyoRatio-GUI/commit/c9b63de0ea36349018771f6ff29467f4fcbb2609))
* **win-compile:** minor updates to win-compile code signin process ([a802b0e](https://github.com/FlorentinTh/MyoRatio-GUI/commit/a802b0e40b529d68daf7c6c6e2651865c9617278))

## [2.1.0](https://github.com/FlorentinTh/MyoRatio-GUI/compare/v2.0.0...v2.1.0) (2023-05-15)


### Features

* **overlay:** add redirect parameter ([a8bfbef](https://github.com/FlorentinTh/MyoRatio-GUI/commit/a8bfbefaff8a65867577e440915d75a112c39c62))


### Bug Fixes

* **error-overlay:** fix every single error handling in the entire application ([1d050f3](https://github.com/FlorentinTh/MyoRatio-GUI/commit/1d050f34fed5b10d979e3701baf3a1d85af6136b))
* **index:** increase initialization time ([2a2ecf5](https://github.com/FlorentinTh/MyoRatio-GUI/commit/2a2ecf5a7899ebcdfc81bdde926229765325769b))

## [2.0.0](https://github.com/FlorentinTh/MyoRatio-GUI/compare/v1.2.0...v2.0.0) (2023-05-09)

## [1.2.0](https://github.com/FlorentinTh/EMG-Trigno-GUI/compare/v1.0.0...v1.2.0) (2023-05-09)


### Features

* **angles-preview:** add an option to indicate that a participant cannot be analyzed ([0cc5c88](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/0cc5c88f0a620d3a1c83d8ad3c5908b71bca1e1d))
* **angles-selection:** add alert when filtered data selected to inform manual selection is disabled ([107b53a](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/107b53a794dd96028b4034f8f47662fecc332cf2))
* **angles-selection:** add automatic removal of auto-angles as another point is manually selected ([d3b3c2a](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/d3b3c2a787efdc21e1ad10dd012ba9f8154777b6))
* **angles-selection:** add filtered IMU data switch with all related functions required ([3e8c8e0](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/3e8c8e0e8c0f94c2395ce775a37b03b090e466de))
* **angles-selection:** complete auto-angles selection feature and related metadata handling ([c835439](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/c835439fa09bbd2cc11800f20969e39bad14f1a1))
* **data-discovering:** add rolling messages to waiting screen for participants initialization ([0bce400](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/0bce400825737c567c27547ec09080883bb64319))
* **database:** implement database lock on the participant currently processed ([29a21cd](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/29a21cd1ca6ec44714b839b7bbfeed566abd028a))
* **index:** add support for multiple app instances ([fb12cd6](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/fb12cd66967f1461c33495408aa083a1c057cba7))
* **participants-selection:** add a popup when selected participants do not have a complexity set ([5c78326](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/5c7832647d9d98fdb99c79df318d1023bd685376))
* **participants-selection:** add xlsx export fetch query to dedicated button ([04b1104](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/04b1104419f6c615380ece4ae26f0fe551b46ce7))
* **participants-selection:** disable xlsx export button when no participant completed ([cd86936](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/cd86936c797c490e29a9e4cf91250b3c153fcae1))
* **participants-selection:** hanlde invalid participant in the list, related to previous commit ([766249d](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/766249d262da2e05ea83bc25b7cfc08c2c950715))
* **results:** add a button to highlight the most relevant ratio given the type of analysis ([3c9a3c7](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/3c9a3c7ee0cd45f6a407258faa697cb7231102c1))
* **results:** add matrix placeholder to avoid content glitch at loading ([8c08f5a](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/8c08f5a0400c3abbc855b23f1764ebdb0c1f278a))
* **settings:** add a setting entry to control application notifications preference ([863d969](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/863d9690125d86c938853b3998541b2dc0be915b))
* **type-helper:** add missing Integer type checking ([499c55c](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/499c55c0612e6c065bb90672ed44517544cf53f0))


### Bug Fixes

* **angles-preview:** add missing ui components restrictions when invalid switch is checked ([82686c0](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/82686c0babc3c1bdcc930a8b734bb2ab9a798c3b))
* **angles-preview:** fix bug related to wrong use of intervals now removed ([2b0a830](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/2b0a830bc1e13c66fa23fe420c91ad7a4d7ab560))
* **angles-preview:** fix issue with popup firing after loader ([9f6abe1](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/9f6abe1463c2a75e4ead685157f990f8d8fe6c53))
* **angles-preview:** fix issue with the value of the complexity when not selected ([85c375b](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/85c375b13f81c2ab8ab46bfe6970cc448c2d4821))
* **angles-selection:** add missing override parameter to fix issue with auto selection feature ([4d87739](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/4d87739dbb03ddbd292325f487ca663ba7326f6a))
* **angles-selection:** fix all issues and complete missing elements for the auto selection feature ([bd8a0e0](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/bd8a0e09e235d4a38d24ce17ab50c05d90e33883))
* **angles-selection:** fix issue with results when process is canceled before completed ([288c31b](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/288c31b6c60daf57154636c92d0b76e588f2a75e))
* **angles-selection:** fix missing reset data alert and constraints when submit button is clicked ([de2fb01](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/de2fb01c24bb4b391d47d27459698c42c78b7542))
* **app:** fix minor issues related to debug logs ([84c7f9d](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/84c7f9ddbf3977afd5232e7ac537e50d1096ecd5))
* **converter:** now creates required analysis directories even if there are no related source files ([4c63eb9](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/4c63eb9089dfe89eb7931737601ffa7bbe97b844))
* **file-helper:** fix an issue with windows hidden attribute command ([7679a33](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/7679a33c77730af225c3b1cc59f655ca28f1cfb9))
* **index:** fix major issue with API executable path on macOS application ([eb657f9](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/eb657f91449255aeeb9b540316fb429c4ee9c62a))
* **index:** now correctly check and wait for the API to start ([0870f37](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/0870f37ac7471e0bba4bbd19a7f46a6b10acbaed))
* **installer:** add dynamic version for output installer ([fa555b6](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/fa555b6064c4d08fdf87daeaafb3498fac0c174b))
* **lint:** fix few linting issues ([3142d38](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/3142d388b605640a51aa7809c55b0e0c4f94d4c8))
* **metadata:** change the digest of the checksum ([7516f04](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/7516f04be62b882b1ff755c39a0e35fe0bd27d94))
* **metadata:** yet another change in the way checksums are generated ([c510ea0](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/c510ea0f2ddd015ee68d2f3c82437cb6a7c5a0bc))
* **participants-selection:** fix a bug with selection save when participant have auto-select enabled ([075ac7b](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/075ac7b78962ec9087df805aef1f892fcc22536d))
* **participants-selection:** fix issue related to unsatitized access to sessionStorage value ([7b7432b](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/7b7432be8a7cfecd3a896bf85d13a636534e15c6))
* **participants-selection:** fix issue with change state operations timeout ([215c5ca](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/215c5ca07e9c7d0788a6b76d8979e70d3f959dd1))
* **participants-selection:** fix issue with selection filter list ([4ecb5e9](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/4ecb5e94c002a34485c90039a8b94ae8b28b9e81))
* **participants-selection:** fix some issues with selection buttons when invalid participants ([8559c47](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/8559c476013a545e42cd660cc0c55d020ba72e7f))
* **report:** move report template from API to GUI ([8265371](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/8265371754b04c053b332cbdec8c8809b28ff89f))
* **string-helper:** more permissive on the labels of participant folders ([f6f957d](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/f6f957d2c52af929473019efb2c886e30511c1eb))

## 1.0.0 (2023-02-13)


### Features

* **angle-selection:** add cancel button to go back to the participants list ([3e4000e](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/3e4000e9366f877b69487e36bc2eea0072eeaa9c))
* **angle-selection:** add enable/disable submit button when angles are selected or not ([5a0d818](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/5a0d8184b86dd763a4b330ec6f2bc5bdbaa0d232))
* **angle-selection:** complete angle selection feature ([aac99d7](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/aac99d793570980c229bdd4580d12d18f7e9f02c))
* **angle-selection:** complete angle selection feature on chart ([cf6e958](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/cf6e9582bfb94b7e6fcf8e59c2c5debb43cb66c8))
* **angle-selection:** load dynamic data from API and optimize the selection plus refactor ([6db8ac0](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/6db8ac01fe17a392c1cefc9ffc503af5a6ad6f6d))
* **angles-preview:** complete angles-preview feature ([5cf152c](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/5cf152ce26524e6e5eeb5544b483e2e27e33b1dd))
* **angles-preview:** dynamic content & metadata persistance ([01840b4](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/01840b45eab7ffb58a394ab682d715d92ff97e29))
* **angles-selection:** add emg and areas endpoints API calls ([59869ab](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/59869abbb4212bd3adcb644a722c280728205196))
* **angles-selection:** dynamic content & metadata persistance ([cc79272](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/cc79272517399562ac50b70280654bed0b88c87a))
* **angles-selection:** show metadata points in plot when restart completed participants ([e70fad7](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/e70fad73a8d1153c9a339e615bc10df23d42cece))
* **app:** add support for API component to be spawned as child process on macOs ([7a84321](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/7a843218a6df5d08556b89b49ccf28846419e2ab))
* **configuration:** add application variables configuration ([7137549](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/713754921ab4448a57d209cd8c12191f05767937))
* **converter:** complete converter full feature ([5332ec9](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/5332ec9586f89d985f73125225bf1395b0e29af4))
* **copyright:** add copyright page ([cb547f4](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/cb547f4989aeeaa12f54e3edc621d17bd728ffc2))
* **data-discovering:** add API request to generate IMU data ([5db1f66](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/5db1f66efdd079816b1aa99b2cdf3c2416422a08))
* **data-discovering:** add better design for data folder path once one is selected ([80588f9](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/80588f9c312f0d2a5eaf278a8d1afd308b3f3e84))
* **data-discovering:** add stage radio input ([01b981b](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/01b981b5048021ca34f39a41f27ae3ef23029900))
* **data-discovering:** change folder input button label when a path is selected ([21eb3f9](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/21eb3f9b38c6817c377751b7973ebbe0b0208a2e))
* **data-processing:** complete data-processing ([121bdbc](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/121bdbc89f7898cf69ce40420fe2c0cde06df062))
* **error-overlay:** add button to dismiss the error and fix some minor issues ([3f46ddc](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/3f46ddc777f83e01933f0d4acddebd37d4876046))
* **error-overlay:** add error-overlay component ([722813d](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/722813d9874abcaf4be0ae273ceece5b2bbaa9a4))
* **file-helper:** add a function to list all files in a provided directory ([701b8f5](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/701b8f5d1d9f8be96a531f4bd90dfaa5fe1f8047))
* **index:** add an index as first page to allow loading application external components ([befec20](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/befec2077927fae050e50fd61d7538d05c961c46))
* **index:** add error handling when loading required application components at cold start ([d6dfc8f](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/d6dfc8fbf3d3b5ef0d73802a616d14d489f01c74))
* **loader-overlay:** add an option to set a custom message when displaying loader-overlay ([e6d799c](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/e6d799c06cd1bbcf93c83a1383d40a12e4f0ecc9))
* **loader-overlay:** change how the loader is created in the DOM and replace  parameter to object ([936f1ec](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/936f1ecbf757679868484dcd3ef11541825668ae))
* **menu:** add a function to set active menu item ([7d32a08](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/7d32a08343bc08dfbdee19960ac174f0567cd0e2))
* **menu:** add a verification based on the platform to enable/disable the use of the converter ([afd0b7f](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/afd0b7f65b897c079a6a7f18a5ae900eda95b906))
* **menu:** add additional buttons feature to menu ([a403692](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/a40369280481ab9113a0d04b604003d606b6c523))
* **menu:** enable settings page ([1d7416e](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/1d7416e63b4c6b956fc57a0ad502459139681c9e))
* **metadata:** add function to create folders for participants in metadata folder ([290f34d](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/290f34d6659e01afe072e2d58d6c27c2ebce9c6f))
* **metadata:** add metadata feature and related helpers ([1e508aa](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/1e508aa81b5d3e3ed4e15a387cdc91710777c5d8))
* **metadata:** add stages capabilities and fetch the metadata folder of a given participant ([c9ce493](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/c9ce49349749fcb49fb879a995aacee05d5da125))
* **metadata:** handle reset previsouly created participants ([58bbd9f](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/58bbd9f84c6a8740fec58e58ee3692709f69ca42))
* **overlay:** generalize success and error overlays ([d955baf](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/d955baf9b6ca5f2c758cd76b884c38d26bef2ee1))
* **participants-selection:** add angles preview btn, complexity informations & empty list container ([5f01fe6](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/5f01fe6d5cf9f5905a448026c335da6edadf7251))
* **participants-selection:** add export button ([5031e72](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/5031e7265e4d39deae42b0585f68688ef9a68f05))
* **participants-selection:** add PDFReport creation feature ([71d89c0](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/71d89c07334e6a4e22bd061e303e07860458aa9e))
* **participants-selection:** add report endpoint API call ([ae63116](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/ae63116fe2973402e86d133bfbe82c38f1a008b2))
* **participants-selection:** complete participants-selection feature ([3fa115c](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/3fa115cac7f8a5ace7d0f12f03acc236633f8379))
* **participants-selection:** dynamic content, metadata persistence & few gui improvements ([0ccfcda](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/0ccfcda759044bac435ca6173a05a904843175df))
* **participants-selection:** fix issues as regards completed,  select btns & add change folder btn ([c11f9ee](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/c11f9eef4a268705dc446dc8bcb731c1d51cc0b9))
* **participants-selection:** minor changes in participants-selection ([286d0ca](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/286d0ca36f8641f35f64efec9d8ba53d75de4c18))
* **pdf-report:** add main content and footer templates to format pdf reports ([38b3224](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/38b322439d340ce8c3a1659d4ef8566e220381a5))
* **pdf-report:** complete feature pdf-report ([9b4b074](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/9b4b0749a11bda0ddcfe75324a6dcb3b76b6fdf9))
* **pdf-report:** move pdf-report generation to a temporary html report. PDF is now delegated to API ([01b8c3d](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/01b8c3dc95421b98d35a5c06c729aa75f8331f29))
* **result:** replace static data by actual computation of the ratio combinations ([881db53](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/881db537324c07a7eb3f2c79fafb8591f7ce0d9a))
* **results:** add computation of the inverse ratio for flexion analysis ([f58cba8](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/f58cba8b35f7ed2e361d300bf28d7695f931bcff))
* **results:** add participant and type of analysis identification in title ([c867898](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/c867898e3e13ebd1e38abd2087b8736e06417d19))
* **results:** add results feature ([5f007be](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/5f007be5d283bf6c901c2e7107899f8238ee89c4))
* **results:** complete results feature ([fe50544](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/fe505440e29432b0a90cb82cd0188f01ed9182ed))
* **router:** add function to disable back-button ([ea6eb9a](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/ea6eb9a06554ddbffe2fa359ef7155c550e81c7f))
* **session-store:** add session-store util to better handle clean ([367957e](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/367957eb0a6758509eeb7df039ce4076b84cbd9a))
* **settings:** add a save button to the settings page ([9c00488](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/9c00488c92e87290d16d780c12df8b1655420fcc))
* **settings:** add base settings feature ([e0a14d8](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/e0a14d8a296d1b8725fdcc85f94ec985aaa66e79))
* **settings:** add few examnples of settings ([1be51a1](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/1be51a1f8b88f8e6c431c6d2edb1266deea29e70))
* **string-helper:** add function to revert formatting name of participants fetched from session ([3013ebc](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/3013ebcbf7930ddb0c304b68557aad1dbcb2cc27))
* **type-helper:** add type checking on base-components parameters ([4009825](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/40098253d1629ea11b733b1b5cf82582b765caff))


### Bug Fixes

* **angle-selection:** change overlay message according to navigation changes ([0452048](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/04520489b90e2a351682f04a2a6b3448e7ebaff8))
* **angle-selection:** change plot base data to match angles ([d1109de](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/d1109deb18e3f1ab694b03326c842a4e65288433))
* **angles-preview:** change svg images path to fix support of macOs and linux platforms ([f23980d](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/f23980dd3b20ca9893e74d2d4cebc098425e1d38))
* **angles-preview:** fix glich in GUI when loading charts of all participants ([bce9357](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/bce935787b87ace3a47102b1572f96c9baf34db9))
* **angles-preview:** fix switches left and rirgh margins due to previous changes ([cb7699d](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/cb7699d01097a0d18835b2b0cca48ea0d154f183))
* **angles-selection:** add spinner to submit button & fix selected points issue with type ([70589b8](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/70589b8870af75acf126914afa1f2a9d80c5ecd4))
* **angles-selection:** change the icon of the auto-selector button ([2f19d01](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/2f19d01af675093216b2e6fd0c50f2c6701a4a59))
* **angles-selection:** fix a potential issue at runtime ([f2c8860](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/f2c8860f230943423a99175a8d9a47e5c97c6e57))
* **angles-selection:** fix issue related to the total number of angle files to process ([bde45ac](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/bde45acb39257645add288fbaf2c2a0b9844efa1))
* **angles-selection:** update points selection function and refactor metadata object ([5863bd2](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/5863bd2d573443b1269c922baa1e04dbd6602ea6))
* **app:** check type of session and local storage content ([ec9524e](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/ec9524e257d95277c30f35896be111f28650751e))
* **app:** remove x-scroll to previous page on macOs ([deebb50](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/deebb5057c2b0800e84d86c8977ba681cfc97fd8))
* **chart-setup:** remove redundant tooltip for selected points ([69d12f3](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/69d12f3a3c48ed9551a01bec9ac86cb2f5f2c9ce))
* **converter:** fix few conversion related errors & move to native spawn function ([5c340d7](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/5c340d79fd2f8637227a7e2c092f04e8f2deb4b6))
* **converter:** fix some issue with the conversion & release normalized csv file on write complete ([3889a7d](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/3889a7dfc4dfddee946f3c8cbcfa74055f431432))
* **data-discovering:** add missing error handler for API error response ([0927b52](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/0927b5279cff0877acfeb7956efe1a58f97e812d))
* **data-discovering:** add missing error handling when there are no data in the analysis folder ([5262aad](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/5262aad651e26444a139c226bcade36ec703ac84))
* **data-discovering:** fix attribute issue for type of analysis input ([af33caa](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/af33caaccd4ac2e08de5702ce79fe4db81ac3ffa))
* **data-discovering:** fix some error handling properly ([32ec96f](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/32ec96f9d656b7adb00b6ac8d4e940679ad00034))
* **data-discovering:** fix that aims at better handle errors ([7dff571](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/7dff571938a5612db95f09591fcfa541298fb673))
* **data-discovering:** keep data-path selected and better clean sessionStorage ([e2fafe6](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/e2fafe6b3d1c171be194ef9590ac35e5cfcadbeb))
* **data-discovering:** move stage switch to participants-selection ([8d20a13](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/8d20a133c123b3fdb417a0606a59e2bd523c8e9d))
* **index:** add missing head closing tag ([c38c5d8](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/c38c5d88d0204081fc8fb592802426de3b5bf5b6))
* **index:** add plateform verification before starting API ([be3bfc5](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/be3bfc5c308d0b0b15e32128eaa6079b9bb3c6f4))
* **index:** improve loading of API component to be properly closed on exit for every plateform ([adf1667](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/adf16678c49c9d7f933b9a9aa6de06de3d68f1c4))
* **loader-overlay:** change the way the html partial component is injected to the DOM ([9269831](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/92698315ed1dbde3ddefac8fbb267ce7e270fab5))
* **menu:** fix issues where menu not open on all views &  additional buttons not open either ([a94b4c6](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/a94b4c6a4c7b44425e364026a5146952d5cefc57))
* **menu:** properly disable HPF converter link for non windows platforms ([9902841](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/9902841baf48421ce5baa0d5397963b424c8f7c9))
* **participants-selection:** fix an issue when selecting completed participants to re-compute angles ([1e3df92](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/1e3df92921d1532f092a9baa29e74281f2f91af8))
* **participants-selection:** fix issues with selection buttons & duplicated data in PDF ([a3b9fcd](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/a3b9fcdcb9fa0f5490e25d02307a3715a7679110))
* **participants-selection:** fix trim participants name in session storage ([1768528](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/1768528d25b0621b92f13ec02138a005531bd0ca))
* **participants:** fix issue when filtering participants directories ([02a50f7](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/02a50f7078071b77f3ac3157ed6eb1eea2133b61))
* **project:** add missing error handling and change import path for metadata ([9e04d7b](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/9e04d7b40699e7db41276bded8213b6e49b55aa5))
* **project:** fix issue with taskbar icon on windows ([de38aa7](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/de38aa75fe14f2dd45dd03f67b3d619eacb95389))
* **project:** fix taskbar icon on windows production application build ([56509cc](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/56509ccc46dc9491213a149ffb85d0511ae42e88))
* **project:** fix type checking all over the project ([74b46bd](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/74b46bd9e5b17842614cf512bac07dde9cdd3ee8))
* **results:** add the remove function for the selected participant stored in session when complete ([45b98a7](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/45b98a792458957df3897b9e311f69923df35a9c))
* **results:** change menu link for data processing to void ([d274681](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/d2746815463d6a86de2e16e8a0c1d4dacd38478a))
* **results:** fix ratio formula, title and axis labels ([87df6f8](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/87df6f87b5a7acfb16f3f8a5ecdd4688c7a3662b))
* **router:** change switchPage function parameter to handle previous commit changes in router ([2b3fcec](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/2b3fcec21122f4eee482d67269cb175f69cafc76))
* **settings:** fix issue when saving window-size setting to localStorage ([f5ad6c1](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/f5ad6c1ed1786fca15cae0c57b80bbd0f9ceb849))
* **settings:** fix issue with window-size setting not persisted in localStorage ([8729025](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/8729025268417ddeb0786da521907a1c9417382b))
* **settings:** replace active link in settings menu ([859d550](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/859d550f7fc503ca67c47c57da4e2140f08cc39c))
* **switch util:** add missing type checking for function definition paremter and return the object ([bdf9f5c](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/bdf9f5c1b37a8e8e117b220a693be946152be373))
* **views:** change wrong application icon path ([e0ef690](https://github.com/FlorentinTh/EMG-Trigno-GUI/commit/e0ef6909b28dcc2fb8e6ebacdeba6083f746350b))
