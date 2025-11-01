using System;
using System.Collections.Generic;
using System.Linq;
using System.Management;
using Microsoft.Win32;

namespace VRCapabilityChecker
{
    public class SystemInfo
    {
        public string CPUName { get; set; } = "";
        public int CPUCores { get; set; }
        public int CPUThreads { get; set; }
        public double CPUSpeedGHz { get; set; }

        public string GPUName { get; set; } = "";
        public long GPUMemoryMB { get; set; }
        public string GPUDriverVersion { get; set; } = "";

        public long TotalRAMGB { get; set; }
        public long AvailableRAMGB { get; set; }

        public string OSName { get; set; } = "";
        public string OSVersion { get; set; } = "";
        public bool Is64Bit { get; set; }

        public string DirectXVersion { get; set; } = "";

        public List<string> USBControllers { get; set; } = new List<string>();
        public bool HasUSB3 { get; set; }
    }

    public class SystemInfoChecker
    {
        public static SystemInfo GetSystemInfo()
        {
            var info = new SystemInfo();

            try
            {
                GetCPUInfo(info);
                GetGPUInfo(info);
                GetRAMInfo(info);
                GetOSInfo(info);
                GetDirectXVersion(info);
                GetUSBInfo(info);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error gathering system info: {ex.Message}");
            }

            return info;
        }

        private static void GetCPUInfo(SystemInfo info)
        {
            try
            {
                using (var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_Processor"))
                {
                    foreach (ManagementObject obj in searcher.Get())
                    {
                        info.CPUName = obj["Name"]?.ToString()?.Trim() ?? "Unknown";
                        info.CPUCores = Convert.ToInt32(obj["NumberOfCores"]);
                        info.CPUThreads = Convert.ToInt32(obj["NumberOfLogicalProcessors"]);

                        var maxClockSpeed = obj["MaxClockSpeed"];
                        if (maxClockSpeed != null)
                        {
                            info.CPUSpeedGHz = Convert.ToDouble(maxClockSpeed) / 1000.0;
                        }
                        break;
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting CPU info: {ex.Message}");
            }
        }

        private static void GetGPUInfo(SystemInfo info)
        {
            try
            {
                var gpuList = new List<(string name, long vram, string driver, int priority)>();

                using (var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_VideoController"))
                {
                    foreach (ManagementObject obj in searcher.Get())
                    {
                        var name = obj["Name"]?.ToString() ?? "";

                        // Skip Microsoft Basic Display Adapter and other generic adapters
                        if (name.Contains("Microsoft Basic") || name.Contains("Remote Desktop"))
                            continue;

                        long vram = 0;
                        var adapterRAM = obj["AdapterRAM"];
                        if (adapterRAM != null)
                        {
                            try
                            {
                                vram = Convert.ToInt64(adapterRAM) / (1024 * 1024);
                            }
                            catch
                            {
                                vram = 0;
                            }
                        }

                        var driver = obj["DriverVersion"]?.ToString() ?? "Unknown";

                        // Calculate priority (higher = better)
                        int priority = CalculateGPUPriority(name, vram);

                        gpuList.Add((name, vram, driver, priority));
                    }
                }

                // Select GPU with highest priority (discrete GPU over integrated)
                if (gpuList.Count > 0)
                {
                    var bestGPU = gpuList.OrderByDescending(g => g.priority).First();
                    info.GPUName = bestGPU.name;
                    info.GPUMemoryMB = bestGPU.vram;
                    info.GPUDriverVersion = bestGPU.driver;

                    // If no VRAM detected, estimate based on GPU model name
                    if (info.GPUMemoryMB == 0 && !string.IsNullOrEmpty(bestGPU.name))
                    {
                        if (bestGPU.name.Contains("RTX 5090")) info.GPUMemoryMB = 24576;
                        else if (bestGPU.name.Contains("RTX 4090")) info.GPUMemoryMB = 24576;
                        else if (bestGPU.name.Contains("RTX 4080")) info.GPUMemoryMB = 16384;
                        else if (bestGPU.name.Contains("RTX 4070 Ti")) info.GPUMemoryMB = 12288;
                        else if (bestGPU.name.Contains("RTX 4070")) info.GPUMemoryMB = 12288;
                        else if (bestGPU.name.Contains("RTX 3090")) info.GPUMemoryMB = 24576;
                        else if (bestGPU.name.Contains("RTX 3080 Ti")) info.GPUMemoryMB = 12288;
                        else if (bestGPU.name.Contains("RTX 3080")) info.GPUMemoryMB = 10240;
                        else if (bestGPU.name.Contains("RTX 3070")) info.GPUMemoryMB = 8192;
                        else if (bestGPU.name.Contains("RTX 3060")) info.GPUMemoryMB = 12288;
                        else if (bestGPU.name.Contains("RX 7900 XTX")) info.GPUMemoryMB = 24576;
                        else if (bestGPU.name.Contains("RX 7900 XT")) info.GPUMemoryMB = 20480;
                        else if (bestGPU.name.Contains("RX 6900")) info.GPUMemoryMB = 16384;
                        else if (bestGPU.name.Contains("RX 6800")) info.GPUMemoryMB = 16384;
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting GPU info: {ex.Message}");
            }
        }

        private static int CalculateGPUPriority(string gpuName, long vram)
        {
            var name = gpuName.ToUpper();
            int priority = 0;

            // NVIDIA discrete GPUs (highest priority)
            if (name.Contains("NVIDIA") && name.Contains("RTX"))
            {
                priority = 1000;
                if (name.Contains("5090")) priority += 500;
                else if (name.Contains("5080")) priority += 450;
                else if (name.Contains("5070")) priority += 400;
                else if (name.Contains("4090")) priority += 490;
                else if (name.Contains("4080")) priority += 440;
                else if (name.Contains("4070")) priority += 390;
                else if (name.Contains("3090")) priority += 480;
                else if (name.Contains("3080")) priority += 430;
                else if (name.Contains("3070")) priority += 380;
                else if (name.Contains("3060")) priority += 360;
                else if (name.Contains("2080")) priority += 280;
                else if (name.Contains("2070")) priority += 270;
                else if (name.Contains("2060")) priority += 260;
            }
            else if (name.Contains("NVIDIA") && name.Contains("GTX"))
            {
                priority = 900;
                if (name.Contains("1080")) priority += 180;
                else if (name.Contains("1070")) priority += 170;
                else if (name.Contains("1660")) priority += 166;
                else if (name.Contains("1060")) priority += 160;
            }
            else if (name.Contains("NVIDIA") && !name.Contains("INTEL"))
            {
                priority = 850; // Other NVIDIA discrete
            }
            // AMD discrete GPUs (high priority)
            else if ((name.Contains("AMD") || name.Contains("RADEON")) && name.Contains("RX"))
            {
                priority = 950;
                if (name.Contains("7900")) priority += 490;
                else if (name.Contains("7800")) priority += 480;
                else if (name.Contains("7700")) priority += 470;
                else if (name.Contains("6950")) priority += 450;
                else if (name.Contains("6900")) priority += 440;
                else if (name.Contains("6800")) priority += 430;
                else if (name.Contains("6700")) priority += 420;
                else if (name.Contains("6600")) priority += 410;
                else if (name.Contains("5700")) priority += 370;
                else if (name.Contains("5600")) priority += 360;
            }
            else if ((name.Contains("AMD") || name.Contains("RADEON")) && name.Contains("VEGA"))
            {
                priority = 800;
            }
            // Intel integrated graphics (low priority)
            else if (name.Contains("INTEL") && (name.Contains("UHD") || name.Contains("IRIS") || name.Contains("HD GRAPHICS")))
            {
                priority = 100; // Very low priority for integrated
            }
            // Intel Arc discrete GPUs (medium-high priority)
            else if (name.Contains("INTEL") && name.Contains("ARC"))
            {
                priority = 700;
            }
            // Unknown but has significant VRAM (likely discrete)
            else if (vram >= 4096) // 4GB or more
            {
                priority = 500;
            }
            else
            {
                priority = 200; // Generic/unknown
            }

            // Bonus for higher VRAM (indicates discrete GPU)
            if (vram >= 16384) priority += 50; // 16GB+
            else if (vram >= 12288) priority += 40; // 12GB+
            else if (vram >= 8192) priority += 30; // 8GB+
            else if (vram >= 6144) priority += 20; // 6GB+

            return priority;
        }

        private static void GetRAMInfo(SystemInfo info)
        {
            try
            {
                using (var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_ComputerSystem"))
                {
                    foreach (ManagementObject obj in searcher.Get())
                    {
                        var totalMemory = obj["TotalPhysicalMemory"];
                        if (totalMemory != null)
                        {
                            info.TotalRAMGB = Convert.ToInt64(totalMemory) / (1024 * 1024 * 1024);
                        }
                        break;
                    }
                }

                using (var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_OperatingSystem"))
                {
                    foreach (ManagementObject obj in searcher.Get())
                    {
                        var freeMemory = obj["FreePhysicalMemory"];
                        if (freeMemory != null)
                        {
                            info.AvailableRAMGB = Convert.ToInt64(freeMemory) / (1024 * 1024);
                        }
                        break;
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting RAM info: {ex.Message}");
            }
        }

        private static void GetOSInfo(SystemInfo info)
        {
            try
            {
                using (var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_OperatingSystem"))
                {
                    foreach (ManagementObject obj in searcher.Get())
                    {
                        info.OSName = obj["Caption"]?.ToString() ?? "Unknown";
                        info.OSVersion = obj["Version"]?.ToString() ?? "Unknown";
                        break;
                    }
                }

                info.Is64Bit = Environment.Is64BitOperatingSystem;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting OS info: {ex.Message}");
            }
        }

        private static void GetDirectXVersion(SystemInfo info)
        {
            try
            {
                using (RegistryKey? key = Registry.LocalMachine.OpenSubKey(@"SOFTWARE\Microsoft\DirectX"))
                {
                    if (key != null)
                    {
                        var version = key.GetValue("Version")?.ToString();
                        if (version != null)
                        {
                            info.DirectXVersion = version;
                        }
                        else
                        {
                            // Fallback: DirectX 12 is available on Windows 10+
                            if (Environment.OSVersion.Version.Major >= 10)
                            {
                                info.DirectXVersion = "12";
                            }
                        }
                    }
                    else
                    {
                        // Fallback detection
                        if (Environment.OSVersion.Version.Major >= 10)
                        {
                            info.DirectXVersion = "12";
                        }
                        else if (Environment.OSVersion.Version.Major >= 6)
                        {
                            info.DirectXVersion = "11";
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting DirectX version: {ex.Message}");
                // Default to DirectX 12 on Windows 10+
                if (Environment.OSVersion.Version.Major >= 10)
                {
                    info.DirectXVersion = "12";
                }
            }
        }

        private static void GetUSBInfo(SystemInfo info)
        {
            try
            {
                using (var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_USBController"))
                {
                    foreach (ManagementObject obj in searcher.Get())
                    {
                        var name = obj["Name"]?.ToString() ?? "";
                        info.USBControllers.Add(name);

                        // Check for USB 3.0/3.1/3.2 indicators
                        if (name.Contains("3.0") || name.Contains("3.1") || name.Contains("3.2") ||
                            name.Contains("xHCI") || name.Contains("USB3"))
                        {
                            info.HasUSB3 = true;
                        }
                    }
                }

                // Additional check via PCI devices
                if (!info.HasUSB3)
                {
                    using (var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_PnPEntity WHERE Name LIKE '%USB%'"))
                    {
                        foreach (ManagementObject obj in searcher.Get())
                        {
                            var name = obj["Name"]?.ToString() ?? "";
                            if (name.Contains("3.0") || name.Contains("3.1") || name.Contains("3.2") || name.Contains("xHCI"))
                            {
                                info.HasUSB3 = true;
                                break;
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting USB info: {ex.Message}");
            }
        }
    }
}
