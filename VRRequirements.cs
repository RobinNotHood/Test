using System;
using System.Collections.Generic;
using System.Linq;

namespace VRCapabilityChecker
{
    public class VRHeadsetRequirements
    {
        public string Name { get; set; } = "";
        public int MinCPUCores { get; set; }
        public double MinCPUSpeedGHz { get; set; }
        public int MinRAMGB { get; set; }
        public int MinGPUMemoryMB { get; set; }
        public List<string> RecommendedGPUs { get; set; } = new List<string>();
        public bool RequiresUSB3 { get; set; }
        public string MinDirectX { get; set; } = "";
        public bool Requires64Bit { get; set; }
    }

    public class ComponentCheckResult
    {
        public string ComponentName { get; set; } = "";
        public bool Passes { get; set; }
        public string CurrentValue { get; set; } = "";
        public string RequiredValue { get; set; } = "";
        public string Details { get; set; } = "";
    }

    public class VRReadinessResult
    {
        public string HeadsetName { get; set; } = "";
        public bool IsReady { get; set; }
        public List<ComponentCheckResult> ComponentResults { get; set; } = new List<ComponentCheckResult>();
        public int PassedChecks { get; set; }
        public int TotalChecks { get; set; }
    }

    public static class VRRequirements
    {
        public static List<VRHeadsetRequirements> GetHighEndVRHeadsets()
        {
            return new List<VRHeadsetRequirements>
            {
                new VRHeadsetRequirements
                {
                    Name = "Meta Quest 3 (PC VR)",
                    MinCPUCores = 4,
                    MinCPUSpeedGHz = 3.0,
                    MinRAMGB = 8,
                    MinGPUMemoryMB = 6144, // 6GB
                    RecommendedGPUs = new List<string> { "RTX 3060", "RTX 2070", "RX 5700", "GTX 1660" },
                    RequiresUSB3 = true,
                    MinDirectX = "11",
                    Requires64Bit = true
                },
                new VRHeadsetRequirements
                {
                    Name = "Valve Index",
                    MinCPUCores = 4,
                    MinCPUSpeedGHz = 3.0,
                    MinRAMGB = 8,
                    MinGPUMemoryMB = 6144, // 6GB
                    RecommendedGPUs = new List<string> { "RTX 2070", "GTX 1070", "RX 5700", "Vega 56" },
                    RequiresUSB3 = true,
                    MinDirectX = "11",
                    Requires64Bit = true
                },
                new VRHeadsetRequirements
                {
                    Name = "HTC Vive Pro 2",
                    MinCPUCores = 4,
                    MinCPUSpeedGHz = 3.5,
                    MinRAMGB = 16,
                    MinGPUMemoryMB = 8192, // 8GB
                    RecommendedGPUs = new List<string> { "RTX 3060", "RTX 2080", "RX 6700 XT" },
                    RequiresUSB3 = true,
                    MinDirectX = "11",
                    Requires64Bit = true
                },
                new VRHeadsetRequirements
                {
                    Name = "Pimax Crystal",
                    MinCPUCores = 6,
                    MinCPUSpeedGHz = 3.5,
                    MinRAMGB = 16,
                    MinGPUMemoryMB = 12288, // 12GB
                    RecommendedGPUs = new List<string> { "RTX 4070", "RTX 3080", "RX 7800 XT" },
                    RequiresUSB3 = true,
                    MinDirectX = "12",
                    Requires64Bit = true
                },
                new VRHeadsetRequirements
                {
                    Name = "Varjo Aero",
                    MinCPUCores = 6,
                    MinCPUSpeedGHz = 3.5,
                    MinRAMGB = 16,
                    MinGPUMemoryMB = 12288, // 12GB
                    RecommendedGPUs = new List<string> { "RTX 3080", "RTX 4070", "RX 6900 XT" },
                    RequiresUSB3 = true,
                    MinDirectX = "12",
                    Requires64Bit = true
                },
                new VRHeadsetRequirements
                {
                    Name = "HP Reverb G2",
                    MinCPUCores = 4,
                    MinCPUSpeedGHz = 3.0,
                    MinRAMGB = 16,
                    MinGPUMemoryMB = 8192, // 8GB
                    RecommendedGPUs = new List<string> { "RTX 2080", "RTX 3060 Ti", "RX 6700 XT" },
                    RequiresUSB3 = true,
                    MinDirectX = "11",
                    Requires64Bit = true
                },
                new VRHeadsetRequirements
                {
                    Name = "BigScreen Beyond",
                    MinCPUCores = 4,
                    MinCPUSpeedGHz = 3.0,
                    MinRAMGB = 16,
                    MinGPUMemoryMB = 8192, // 8GB
                    RecommendedGPUs = new List<string> { "RTX 3070", "RTX 2080", "RX 6700 XT" },
                    RequiresUSB3 = true,
                    MinDirectX = "11",
                    Requires64Bit = true
                },
                new VRHeadsetRequirements
                {
                    Name = "BigScreen Beyond 2",
                    MinCPUCores = 6,
                    MinCPUSpeedGHz = 3.5,
                    MinRAMGB = 16,
                    MinGPUMemoryMB = 12288, // 12GB
                    RecommendedGPUs = new List<string> { "RTX 4070", "RTX 3080", "RX 7800 XT" },
                    RequiresUSB3 = true,
                    MinDirectX = "12",
                    Requires64Bit = true
                }
            };
        }

        public static List<VRReadinessResult> CheckVRReadiness(SystemInfo systemInfo)
        {
            var results = new List<VRReadinessResult>();
            var headsets = GetHighEndVRHeadsets();

            foreach (var headset in headsets)
            {
                var result = new VRReadinessResult
                {
                    HeadsetName = headset.Name
                };

                // Check CPU Cores
                var cpuCoresCheck = new ComponentCheckResult
                {
                    ComponentName = "CPU Cores",
                    CurrentValue = $"{systemInfo.CPUCores} cores ({systemInfo.CPUThreads} threads)",
                    RequiredValue = $"{headset.MinCPUCores}+ cores",
                    Passes = systemInfo.CPUCores >= headset.MinCPUCores
                };
                cpuCoresCheck.Details = cpuCoresCheck.Passes ? "Sufficient" : "Insufficient";
                result.ComponentResults.Add(cpuCoresCheck);

                // Check CPU Speed
                var cpuSpeedCheck = new ComponentCheckResult
                {
                    ComponentName = "CPU Speed",
                    CurrentValue = $"{systemInfo.CPUSpeedGHz:F2} GHz",
                    RequiredValue = $"{headset.MinCPUSpeedGHz:F1}+ GHz",
                    Passes = systemInfo.CPUSpeedGHz >= headset.MinCPUSpeedGHz
                };
                cpuSpeedCheck.Details = cpuSpeedCheck.Passes ? "Fast enough" : "Too slow";
                result.ComponentResults.Add(cpuSpeedCheck);

                // Check RAM
                var ramCheck = new ComponentCheckResult
                {
                    ComponentName = "System RAM",
                    CurrentValue = $"{systemInfo.TotalRAMGB} GB",
                    RequiredValue = $"{headset.MinRAMGB}+ GB",
                    Passes = systemInfo.TotalRAMGB >= headset.MinRAMGB
                };
                ramCheck.Details = ramCheck.Passes ? "Sufficient" : "Need more RAM";
                result.ComponentResults.Add(ramCheck);

                // Check GPU Memory
                var gpuMemCheck = new ComponentCheckResult
                {
                    ComponentName = "GPU Memory",
                    CurrentValue = systemInfo.GPUMemoryMB > 0 ? $"{systemInfo.GPUMemoryMB / 1024} GB" : "Unknown",
                    RequiredValue = $"{headset.MinGPUMemoryMB / 1024}+ GB",
                    Passes = systemInfo.GPUMemoryMB >= headset.MinGPUMemoryMB
                };
                gpuMemCheck.Details = gpuMemCheck.Passes ? "Sufficient VRAM" : "Need more VRAM";
                result.ComponentResults.Add(gpuMemCheck);

                // Check GPU Model (heuristic)
                var gpuModelCheck = new ComponentCheckResult
                {
                    ComponentName = "GPU Model",
                    CurrentValue = systemInfo.GPUName,
                    RequiredValue = string.Join(" / ", headset.RecommendedGPUs),
                    Passes = IsGPUSufficient(systemInfo.GPUName, headset.RecommendedGPUs)
                };
                gpuModelCheck.Details = gpuModelCheck.Passes ? "Compatible GPU" : "GPU may not meet requirements";
                result.ComponentResults.Add(gpuModelCheck);

                // Check USB 3.0
                var usbCheck = new ComponentCheckResult
                {
                    ComponentName = "USB 3.0+",
                    CurrentValue = systemInfo.HasUSB3 ? "Available" : "Not detected",
                    RequiredValue = headset.RequiresUSB3 ? "Required" : "Optional",
                    Passes = !headset.RequiresUSB3 || systemInfo.HasUSB3
                };
                usbCheck.Details = usbCheck.Passes ? "USB 3.0 available" : "USB 3.0 required";
                result.ComponentResults.Add(usbCheck);

                // Check DirectX
                var dxCheck = new ComponentCheckResult
                {
                    ComponentName = "DirectX",
                    CurrentValue = systemInfo.DirectXVersion,
                    RequiredValue = headset.MinDirectX + "+",
                    Passes = CompareDirectXVersions(systemInfo.DirectXVersion, headset.MinDirectX)
                };
                dxCheck.Details = dxCheck.Passes ? "DirectX sufficient" : "DirectX version too old";
                result.ComponentResults.Add(dxCheck);

                // Check 64-bit OS
                var osCheck = new ComponentCheckResult
                {
                    ComponentName = "64-bit OS",
                    CurrentValue = systemInfo.Is64Bit ? "Yes" : "No",
                    RequiredValue = headset.Requires64Bit ? "Required" : "Optional",
                    Passes = !headset.Requires64Bit || systemInfo.Is64Bit
                };
                osCheck.Details = osCheck.Passes ? "64-bit OS" : "Requires 64-bit OS";
                result.ComponentResults.Add(osCheck);

                // Calculate overall readiness
                result.PassedChecks = result.ComponentResults.Count(c => c.Passes);
                result.TotalChecks = result.ComponentResults.Count;
                result.IsReady = result.PassedChecks == result.TotalChecks;

                results.Add(result);
            }

            return results;
        }

        private static bool IsGPUSufficient(string currentGPU, List<string> recommendedGPUs)
        {
            if (string.IsNullOrEmpty(currentGPU))
                return false;

            var gpu = currentGPU.ToUpper();

            // NVIDIA RTX 50 series - Next-gen VR ready
            if (gpu.Contains("RTX 5090") || gpu.Contains("RTX 5080") || gpu.Contains("RTX 5070"))
                return true;

            // NVIDIA RTX 40 series - All good for high-end VR
            if (gpu.Contains("RTX 4090") || gpu.Contains("RTX 4080") || gpu.Contains("RTX 4070"))
                return true;

            // NVIDIA RTX 30 series
            if (gpu.Contains("RTX 3090") || gpu.Contains("RTX 3080") || gpu.Contains("RTX 3070") || gpu.Contains("RTX 3060"))
                return true;

            // NVIDIA RTX 20 series
            if (gpu.Contains("RTX 2080") || gpu.Contains("RTX 2070") || gpu.Contains("RTX 2060"))
                return true;

            // NVIDIA GTX 16 series
            if (gpu.Contains("GTX 1660") || gpu.Contains("GTX 1650"))
                return true;

            // NVIDIA GTX 10 series
            if (gpu.Contains("GTX 1080") || gpu.Contains("GTX 1070"))
                return true;

            // AMD RX 7000 series
            if (gpu.Contains("RX 7900") || gpu.Contains("RX 7800") || gpu.Contains("RX 7700"))
                return true;

            // AMD RX 6000 series
            if (gpu.Contains("RX 6950") || gpu.Contains("RX 6900") || gpu.Contains("RX 6800") ||
                gpu.Contains("RX 6700") || gpu.Contains("RX 6600"))
                return true;

            // AMD RX 5000 series
            if (gpu.Contains("RX 5700") || gpu.Contains("RX 5600"))
                return true;

            // AMD Vega
            if (gpu.Contains("VEGA 64") || gpu.Contains("VEGA 56"))
                return true;

            // Check against recommended list
            foreach (var recommended in recommendedGPUs)
            {
                if (gpu.Contains(recommended.ToUpper()))
                    return true;
            }

            return false;
        }

        private static bool CompareDirectXVersions(string current, string required)
        {
            if (string.IsNullOrEmpty(current))
                return false;

            // Extract numeric version
            var currentVersion = ExtractVersion(current);
            var requiredVersion = ExtractVersion(required);

            return currentVersion >= requiredVersion;
        }

        private static int ExtractVersion(string versionString)
        {
            if (string.IsNullOrEmpty(versionString))
                return 0;

            // Extract first number from string
            var numbers = new string(versionString.Where(char.IsDigit).ToArray());
            if (int.TryParse(numbers.Length > 0 ? numbers.Substring(0, Math.Min(2, numbers.Length)) : "0", out int version))
            {
                return version;
            }
            return 0;
        }
    }
}
