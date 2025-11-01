# VR Capability Checker - Standalone Executable

## Quick Start

1. **Download** `VRCapabilityChecker.exe` (69 MB)
2. **Double-click** to run - no installation needed!
3. Click **"Scan System"** to analyze your VR readiness
4. View results in three tabs:
   - **System Info** - Your hardware specs
   - **VR Headset Compatibility** - Which headsets you can run
   - **Expected FPS** - Performance estimates for 10 popular VR games

## No Installation Required

This is a **self-contained executable** that includes:
- ✅ All required .NET libraries
- ✅ Complete application code
- ✅ No external dependencies

**System Requirements:**
- Windows 10 or Windows 11 (64-bit)
- No .NET installation required
- Administrator rights NOT required

## Features

### 🔍 Hardware Detection
- CPU: Cores, threads, clock speed
- GPU: Model, VRAM (prioritizes discrete GPUs like RTX 5090 over integrated graphics)
- RAM: Total and available memory
- USB 3.0+ detection
- DirectX version
- Operating system details

### 🎮 VR Headset Support (8 Headsets)
- Meta Quest 3 (PC VR)
- Valve Index
- HTC Vive Pro 2
- Pimax Crystal
- Varjo Aero
- HP Reverb G2
- BigScreen Beyond
- BigScreen Beyond 2

### 📊 FPS Estimation (10 Popular VR Games)
- VRChat
- Half-Life: Alyx
- Beat Saber
- Boneworks
- Microsoft Flight Simulator VR
- DCS World VR
- Skyrim VR
- No Man's Sky VR
- Pavlov VR
- Contractors VR

Each game shows:
- Estimated FPS based on your hardware
- Performance level (Excellent/Great/Good/Fair/Poor)
- Recommended graphics settings

## GPU Detection Fix

**Important:** This version correctly detects discrete GPUs (like RTX 5090, RTX 4090, etc.) and prioritizes them over integrated graphics (Intel UHD, etc.).

The app will always select your most powerful GPU for VR capability checking.

## File Size

The executable is 69 MB because it includes:
- Complete .NET 8.0 runtime
- All application code and resources
- Optimized for single-file distribution

## Security

- **No network access** - All analysis is done locally
- **No data collection** - Your system information stays on your PC
- **Open source** - All code is available in this repository

## Troubleshooting

### Windows SmartScreen Warning
If you see "Windows protected your PC":
1. Click **"More info"**
2. Click **"Run anyway"**

This is normal for unsigned executables downloaded from the internet.

### Application Won't Start
- Make sure you're running Windows 10 or 11 (64-bit)
- Try running as Administrator (right-click → Run as administrator)
- Check Windows Event Viewer for error details

### GPU Not Detected Correctly
The app prioritizes discrete GPUs. If you have both integrated and discrete graphics:
- NVIDIA RTX/GTX cards get highest priority
- AMD Radeon RX cards get high priority
- Intel UHD/Iris gets lowest priority

## Version Information

- **Version:** 2.0
- **Build Date:** 2025-11-01
- **.NET Version:** 8.0
- **Platform:** Windows x64

## What's New in Version 2.0

✨ **New Features:**
- FPS estimation for 10 popular VR games
- BigScreen Beyond 1 & 2 headset support
- RTX 5090 support with correct 24GB VRAM detection
- Improved tabbed interface
- Better GPU detection (prioritizes discrete GPUs)

🐛 **Bug Fixes:**
- Fixed duplicate GPU display issue
- Fixed integrated GPU being selected over discrete GPU
- Improved VRAM detection accuracy

## Support

Found a bug or have a feature request?
- Open an issue on GitHub
- Check the main README.md for build instructions

---

**Made with ❤️ for the VR community**
