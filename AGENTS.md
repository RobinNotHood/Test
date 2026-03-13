# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

VR Capability Checker is a **Windows-only WPF desktop application** (.NET 8.0) that scans PC hardware and determines VR headset readiness. It uses Windows Management Instrumentation (WMI) for hardware detection and WPF for the GUI.

### Key constraint: Windows-only

- The target framework is `net8.0-windows` with `<UseWPF>true</UseWPF>`.
- `dotnet build` and `dotnet run` **require Windows**. They will fail on Linux with error MSB4019 (missing `Microsoft.NET.Sdk.WindowsDesktop`).
- `dotnet restore` works on Linux and fetches the single NuGet dependency (`System.Management 7.0.2`).
- `dotnet format --verify-no-changes` exits 0 on Linux but cannot actually load the project to analyze files; it formats "0 of 0 files". It is still the only lint-like check available on Linux.
- A pre-built self-contained Windows executable is available at `dist/VRCapabilityChecker.exe` (69 MB, PE32+ x86-64).

### Development commands (see README.md for full details)

| Command | Works on Linux? | Notes |
|---|---|---|
| `dotnet restore` | Yes | Restores NuGet packages |
| `dotnet build` | No | Requires Windows Desktop SDK |
| `dotnet run` | No | Requires successful build |
| `dotnet format --verify-no-changes` | Partial | Exits 0 but cannot discover source files without Windows SDK |
| `dotnet publish -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true` | No | Requires Windows |

### Architecture (single-project, no tests)

All source files are in the repository root:
- `App.xaml` / `App.xaml.cs` — Application entry point
- `MainWindow.xaml` / `MainWindow.xaml.cs` — Main UI and event handlers
- `SystemInfoChecker.cs` — Hardware detection via WMI
- `VRRequirements.cs` — VR headset requirement definitions
- `FPSEstimator.cs` — FPS estimation engine

There are **no automated tests** in this repository.
