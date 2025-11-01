# VR Capability Checker

An interactive Windows application that analyzes your system's hardware and determines its readiness for high-end VR headsets.

![VR Capability Checker](screenshot.png)

## Features

- **Comprehensive Hardware Detection**
  - CPU cores, threads, and clock speed
  - GPU model and VRAM
  - System RAM (total and available)
  - USB 3.0+ controller detection
  - DirectX version
  - Operating system details

- **High-End VR Headset Support**
  - Meta Quest 3 (PC VR)
  - Valve Index
  - HTC Vive Pro 2
  - Pimax Crystal
  - Varjo Aero
  - HP Reverb G2

- **Detailed Compatibility Analysis**
  - Component-by-component compatibility checking
  - Visual pass/fail indicators
  - Minimum vs. current specifications
  - Overall readiness score

- **Modern User Interface**
  - Dark-themed, professional design
  - Easy-to-read results
  - Interactive scanning
  - Color-coded status indicators

## Requirements

### To Run the Application
- Windows 10 or Windows 11 (64-bit recommended)
- .NET 6.0 Runtime or later

### To Build from Source
- Visual Studio 2022 or later
- .NET 6.0 SDK or later
- Windows SDK

## Building the Application

### Using Visual Studio

1. Clone this repository:
   ```bash
   git clone <repository-url>
   cd VRCapabilityChecker
   ```

2. Open the solution in Visual Studio:
   ```bash
   VRCapabilityChecker.csproj
   ```

3. Restore NuGet packages:
   - Visual Studio will automatically restore packages
   - Or manually: Right-click solution → Restore NuGet Packages

4. Build the solution:
   - Press `Ctrl+Shift+B`
   - Or: Build → Build Solution

5. Run the application:
   - Press `F5` to run with debugging
   - Or: `Ctrl+F5` to run without debugging

### Using .NET CLI

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd VRCapabilityChecker
   ```

2. Restore dependencies:
   ```bash
   dotnet restore
   ```

3. Build the application:
   ```bash
   dotnet build --configuration Release
   ```

4. Run the application:
   ```bash
   dotnet run
   ```

5. Publish as standalone executable:
   ```bash
   dotnet publish -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true
   ```

   The executable will be in: `bin/Release/net6.0-windows/win-x64/publish/`

## Usage

1. Launch the application
2. Click the **"Scan System"** button
3. Wait for the analysis to complete (usually 1-2 seconds)
4. Review the results:
   - **System Information**: Your current hardware specs
   - **VR Headset Compatibility**: Detailed compatibility for each supported headset
   - **Overall Status**: Summary of VR readiness

### Understanding the Results

- **✓ Green Checkmark**: Component meets or exceeds requirements
- **✗ Red X**: Component does not meet minimum requirements
- **Overall Status**:
  - 🎉 Ready for ALL headsets: Your system is high-end VR ready!
  - ✓ Ready for some headsets: You can use certain VR headsets
  - ⚠ Needs upgrades: System requires hardware upgrades

## Technical Details

### System Detection Methods

The application uses Windows Management Instrumentation (WMI) to query hardware:

- **CPU Information**: `Win32_Processor` class
- **GPU Information**: `Win32_VideoController` class
- **RAM Information**: `Win32_ComputerSystem` and `Win32_OperatingSystem` classes
- **USB Controllers**: `Win32_USBController` and `Win32_PnPEntity` classes
- **DirectX**: Registry query and OS version detection

### VR Headset Requirements Database

Each VR headset has defined minimum requirements:

- **CPU**: Minimum cores and clock speed
- **GPU**: Minimum VRAM and compatible models
- **RAM**: Minimum system memory
- **USB**: USB 3.0+ requirement
- **DirectX**: Minimum DirectX version
- **OS**: 64-bit requirement

### Architecture

```
VRCapabilityChecker/
├── App.xaml                    # Application resources and styling
├── App.xaml.cs                 # Application entry point
├── MainWindow.xaml             # Main UI layout
├── MainWindow.xaml.cs          # UI logic and event handlers
├── SystemInfoChecker.cs        # Hardware detection logic
├── VRRequirements.cs           # VR headset requirements and checking
└── VRCapabilityChecker.csproj  # Project configuration
```

## Supported GPUs

The application recognizes a wide range of GPUs:

### NVIDIA
- RTX 40 series (4090, 4080, 4070)
- RTX 30 series (3090, 3080, 3070, 3060)
- RTX 20 series (2080, 2070, 2060)
- GTX 16 series (1660, 1650)
- GTX 10 series (1080, 1070)

### AMD
- RX 7000 series (7900, 7800, 7700)
- RX 6000 series (6950, 6900, 6800, 6700, 6600)
- RX 5000 series (5700, 5600)
- Vega series (Vega 64, Vega 56)

## Limitations

- **GPU VRAM Detection**: Some systems may not properly report GPU memory through WMI. The app includes fallback detection based on GPU model names.
- **Virtual Machines**: Hardware detection may not work correctly in virtualized environments.
- **Integrated Graphics**: Systems with only integrated graphics will typically not meet high-end VR requirements.
- **Driver Requirements**: The app checks hardware but doesn't verify driver versions (except DirectX).

## Troubleshooting

### "GPU Memory: Unknown"
- The application couldn't detect VRAM through WMI
- Try updating your GPU drivers
- Check if VRAM is detected in Task Manager (Performance tab)

### "USB 3.0: Not Detected"
- Ensure USB 3.0 drivers are installed
- Check Device Manager for USB controllers
- Some older systems may not have USB 3.0

### Application won't start
- Verify .NET 6.0 Runtime is installed
- Run as Administrator if needed
- Check Windows Event Viewer for errors

## Future Enhancements

- [ ] GPU benchmark testing
- [ ] VR headset-specific configuration tips
- [ ] Export results to PDF/HTML
- [ ] Comparison with other systems
- [ ] Component upgrade recommendations
- [ ] Price estimates for upgrades
- [ ] VR game compatibility checking

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

This project is open source and available under the MIT License.

## Disclaimer

This tool provides estimates based on published VR headset specifications. Actual VR performance may vary based on:
- Specific applications and games
- Graphics settings
- Background processes
- Driver optimizations
- Individual headset calibration

Always verify compatibility with the official VR headset manufacturer's system requirements.

## Credits

Developed as a comprehensive VR readiness checking tool for Windows users interested in high-end virtual reality experiences.

---

**Note**: VR technology and requirements are constantly evolving. This application is based on current specifications as of 2024-2025.
