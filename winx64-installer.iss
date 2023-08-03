; Script generated by the Inno Setup Script Wizard.
; SEE THE DOCUMENTATION FOR DETAILS ON CREATING INNO SETUP SCRIPT FILES!

#define MyAppName "MyoRatio"
#define MyAppVersion "3.0.0"
#define MyAppPublisher "LIARA Lab"
#define MyAppURL "liara.uqac.ca"
#define MyAppExeName "MyoRatio.exe"

[Setup]
SignTool=signtool
; NOTE: The value of AppId uniquely identifies this application. Do not use the same AppId value in installers for other applications.
; (To generate a new GUID, click Tools | Generate GUID inside the IDE.)
AppId={{E09A96AA-A0DD-4394-9BE6-7920E596496D}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={userappdata}\LIARA Lab\{#MyAppName}
DisableProgramGroupPage=yes
LicenseFile={#SourcePath}LICENSE
UninstallDisplayIcon={app}\{#MyAppExeName}
UninstallDisplayName={#MyAppName}
; Remove the following line to run in administrative install mode (install for all users.)
PrivilegesRequired=lowest
OutputDir={#SourcePath}release\winx64
OutputBaseFilename=MyoRatio_{#MyAppVersion}_winx64
SetupIconFile={#SourcePath}src\assets\icons\win\app.ico
Compression=lzma
SolidCompression=yes
WizardStyle=modern

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"
Name: "french"; MessagesFile: "compiler:Languages\French.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
Source: "{#SourcePath}dist\MyoRatio_{#MyAppVersion}_winx64\{#MyAppExeName}"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#SourcePath}dist\MyoRatio_{#MyAppVersion}_winx64\bin\*"; DestDir: "{app}\bin"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "{#SourcePath}dist\MyoRatio_{#MyAppVersion}_winx64\build\*"; DestDir: "{app}\build"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "{#SourcePath}dist\MyoRatio_{#MyAppVersion}_winx64\locales\*"; DestDir: "{app}\locales"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "{#SourcePath}dist\MyoRatio_{#MyAppVersion}_winx64\swiftshader\*"; DestDir: "{app}\swiftshader"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "{#SourcePath}dist\MyoRatio_{#MyAppVersion}_winx64\credits.html"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#SourcePath}dist\MyoRatio_{#MyAppVersion}_winx64\d3dcompiler_47.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#SourcePath}dist\MyoRatio_{#MyAppVersion}_winx64\MyoRatio.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#SourcePath}dist\MyoRatio_{#MyAppVersion}_winx64\ffmpeg.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#SourcePath}dist\MyoRatio_{#MyAppVersion}_winx64\icudtl.dat"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#SourcePath}dist\MyoRatio_{#MyAppVersion}_winx64\libEGL.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#SourcePath}dist\MyoRatio_{#MyAppVersion}_winx64\libGLESv2.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#SourcePath}dist\MyoRatio_{#MyAppVersion}_winx64\LICENSE"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#SourcePath}dist\MyoRatio_{#MyAppVersion}_winx64\node.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#SourcePath}dist\MyoRatio_{#MyAppVersion}_winx64\notification_helper.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#SourcePath}dist\MyoRatio_{#MyAppVersion}_winx64\nw.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#SourcePath}dist\MyoRatio_{#MyAppVersion}_winx64\nw_100_percent.pak"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#SourcePath}dist\MyoRatio_{#MyAppVersion}_winx64\nw_200_percent.pak"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#SourcePath}dist\MyoRatio_{#MyAppVersion}_winx64\nw_elf.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#SourcePath}dist\MyoRatio_{#MyAppVersion}_winx64\package.json"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#SourcePath}dist\MyoRatio_{#MyAppVersion}_winx64\resources.pak"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#SourcePath}dist\MyoRatio_{#MyAppVersion}_winx64\v8_context_snapshot.bin"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#SourcePath}dist\MyoRatio_{#MyAppVersion}_winx64\vk_swiftshader.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#SourcePath}dist\MyoRatio_{#MyAppVersion}_winx64\vk_swiftshader_icd.json"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#SourcePath}dist\MyoRatio_{#MyAppVersion}_winx64\vulkan-1.dll"; DestDir: "{app}"; Flags: ignoreversion
; UNCOMENT THESE LINES FOR SDK FLAVOR BUILDS :
;Source: "{#SourcePath}dist\MyoRatio_{#MyAppVersion}_winx64\pnacl\*"; DestDir: "{app}\pnacl"; Flags: ignoreversion recursesubdirs createallsubdirs
;Source: "{#SourcePath}dist\MyoRatio_{#MyAppVersion}_winx64\chromedriver.exe"; DestDir: "{app}"; Flags: ignoreversion
;Source: "{#SourcePath}dist\MyoRatio_{#MyAppVersion}_winx64\nacl_irt_x86_64.nexe"; DestDir: "{app}"; Flags: ignoreversion
;Source: "{#SourcePath}dist\MyoRatio_{#MyAppVersion}_winx64\nwjc.exe"; DestDir: "{app}"; Flags: ignoreversion

; NOTE: Don't use "Flags: ignoreversion" on any shared system files

[Icons]
Name: "{autoprograms}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent

