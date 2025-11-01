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
                using (var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_VideoController"))
                {
                    foreach (ManagementObject obj in searcher.Get())
                    {
                        var name = obj["Name"]?.ToString() ?? "";

                        // Skip Microsoft Basic Display Adapter and other generic adapters
                        if (name.Contains("Microsoft Basic") || name.Contains("Remote Desktop"))
                            continue;

                        info.GPUName = name;

                        var adapterRAM = obj["AdapterRAM"];
                        if (adapterRAM != null)
                        {
                            try
                            {
                                info.GPUMemoryMB = Convert.ToInt64(adapterRAM) / (1024 * 1024);
                            }
                            catch
                            {
                                // If conversion fails, try to get from dedicated video memory
                                var dedicatedMemory = obj["AdapterDACType"];
                                info.GPUMemoryMB = 0;
                            }
                        }

                        info.GPUDriverVersion = obj["DriverVersion"]?.ToString() ?? "Unknown";
                        break;
                    }
                }

                // If no VRAM detected, try alternative method
                if (info.GPUMemoryMB == 0)
                {
                    try
                    {
                        using (var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_VideoController"))
                        {
                            foreach (ManagementObject obj in searcher.Get())
                            {
                                var name = obj["Name"]?.ToString() ?? "";
                                if (name.Contains("Microsoft Basic") || name.Contains("Remote Desktop"))
                                    continue;

                                // Estimate based on GPU model name if detection fails
                                if (name.Contains("RTX 4090")) info.GPUMemoryMB = 24576;
                                else if (name.Contains("RTX 4080")) info.GPUMemoryMB = 16384;
                                else if (name.Contains("RTX 4070")) info.GPUMemoryMB = 12288;
                                else if (name.Contains("RTX 3090")) info.GPUMemoryMB = 24576;
                                else if (name.Contains("RTX 3080")) info.GPUMemoryMB = 10240;
                                else if (name.Contains("RTX 3070")) info.GPUMemoryMB = 8192;
                                else if (name.Contains("RTX 3060")) info.GPUMemoryMB = 12288;
                                else if (name.Contains("RX 7900 XTX")) info.GPUMemoryMB = 24576;
                                else if (name.Contains("RX 7900 XT")) info.GPUMemoryMB = 20480;
                                else if (name.Contains("RX 6900")) info.GPUMemoryMB = 16384;
                                else if (name.Contains("RX 6800")) info.GPUMemoryMB = 16384;
                                break;
                            }
                        }
                    }
                    catch { }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting GPU info: {ex.Message}");
            }
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
