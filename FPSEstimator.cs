using System;
using System.Collections.Generic;
using System.Linq;

namespace VRCapabilityChecker
{
    public class VRGame
    {
        public string Name { get; set; } = "";
        public string Category { get; set; } = "";
        public int TargetFPS { get; set; } = 90;
    }

    public class FPSEstimate
    {
        public string GameName { get; set; } = "";
        public int EstimatedFPS { get; set; }
        public string PerformanceLevel { get; set; } = "";
        public string Details { get; set; } = "";
    }

    public static class FPSEstimator
    {
        public static List<VRGame> GetPopularVRGames()
        {
            return new List<VRGame>
            {
                new VRGame { Name = "VRChat", Category = "Social", TargetFPS = 90 },
                new VRGame { Name = "Half-Life: Alyx", Category = "Action", TargetFPS = 90 },
                new VRGame { Name = "Beat Saber", Category = "Rhythm", TargetFPS = 90 },
                new VRGame { Name = "Boneworks", Category = "Physics", TargetFPS = 90 },
                new VRGame { Name = "Microsoft Flight Simulator VR", Category = "Simulation", TargetFPS = 90 },
                new VRGame { Name = "DCS World VR", Category = "Simulation", TargetFPS = 90 },
                new VRGame { Name = "Skyrim VR", Category = "RPG", TargetFPS = 90 },
                new VRGame { Name = "No Man's Sky VR", Category = "Exploration", TargetFPS = 90 },
                new VRGame { Name = "Pavlov VR", Category = "FPS", TargetFPS = 90 },
                new VRGame { Name = "Contractors VR", Category = "FPS", TargetFPS = 90 }
            };
        }

        public static List<FPSEstimate> EstimateFPS(SystemInfo systemInfo)
        {
            var games = GetPopularVRGames();
            var estimates = new List<FPSEstimate>();

            int gpuScore = CalculateGPUScore(systemInfo.GPUName, systemInfo.GPUMemoryMB);
            int cpuScore = CalculateCPUScore(systemInfo.CPUCores, systemInfo.CPUSpeedGHz);
            int ramScore = CalculateRAMScore(systemInfo.TotalRAMGB);

            foreach (var game in games)
            {
                var estimate = new FPSEstimate
                {
                    GameName = game.Name
                };

                // Calculate FPS based on game category and hardware scores
                int baseFPS = CalculateBaseFPS(game.Category, gpuScore, cpuScore, ramScore);

                estimate.EstimatedFPS = baseFPS;

                // Determine performance level
                if (baseFPS >= game.TargetFPS + 30)
                {
                    estimate.PerformanceLevel = "Excellent";
                    estimate.Details = $"{baseFPS}+ FPS - Ultra settings, supersampling possible";
                }
                else if (baseFPS >= game.TargetFPS)
                {
                    estimate.PerformanceLevel = "Great";
                    estimate.Details = $"{baseFPS} FPS - High settings, smooth experience";
                }
                else if (baseFPS >= game.TargetFPS - 20)
                {
                    estimate.PerformanceLevel = "Good";
                    estimate.Details = $"{baseFPS} FPS - Medium settings recommended";
                }
                else if (baseFPS >= 45)
                {
                    estimate.PerformanceLevel = "Fair";
                    estimate.Details = $"{baseFPS} FPS - Low settings, may have stutters";
                }
                else
                {
                    estimate.PerformanceLevel = "Poor";
                    estimate.Details = $"{baseFPS} FPS - Not recommended, upgrade needed";
                }

                estimates.Add(estimate);
            }

            return estimates;
        }

        private static int CalculateGPUScore(string gpuName, long gpuMemoryMB)
        {
            if (string.IsNullOrEmpty(gpuName))
                return 0;

            var gpu = gpuName.ToUpper();
            int score = 0;

            // RTX 50 series
            if (gpu.Contains("RTX 5090")) score = 1000;
            else if (gpu.Contains("RTX 5080")) score = 900;
            else if (gpu.Contains("RTX 5070")) score = 800;
            // RTX 40 series
            else if (gpu.Contains("RTX 4090")) score = 950;
            else if (gpu.Contains("RTX 4080")) score = 850;
            else if (gpu.Contains("RTX 4070 TI")) score = 750;
            else if (gpu.Contains("RTX 4070")) score = 700;
            else if (gpu.Contains("RTX 4060")) score = 600;
            // RTX 30 series
            else if (gpu.Contains("RTX 3090")) score = 800;
            else if (gpu.Contains("RTX 3080 TI")) score = 750;
            else if (gpu.Contains("RTX 3080")) score = 720;
            else if (gpu.Contains("RTX 3070 TI")) score = 650;
            else if (gpu.Contains("RTX 3070")) score = 620;
            else if (gpu.Contains("RTX 3060 TI")) score = 550;
            else if (gpu.Contains("RTX 3060")) score = 500;
            // RTX 20 series
            else if (gpu.Contains("RTX 2080 TI")) score = 650;
            else if (gpu.Contains("RTX 2080")) score = 580;
            else if (gpu.Contains("RTX 2070")) score = 520;
            else if (gpu.Contains("RTX 2060")) score = 450;
            // GTX series
            else if (gpu.Contains("GTX 1080 TI")) score = 500;
            else if (gpu.Contains("GTX 1080")) score = 450;
            else if (gpu.Contains("GTX 1070")) score = 400;
            else if (gpu.Contains("GTX 1660")) score = 380;
            else if (gpu.Contains("GTX 1060")) score = 320;
            // AMD RX 7000 series
            else if (gpu.Contains("RX 7900 XTX")) score = 850;
            else if (gpu.Contains("RX 7900 XT")) score = 800;
            else if (gpu.Contains("RX 7800 XT")) score = 720;
            else if (gpu.Contains("RX 7700 XT")) score = 650;
            // AMD RX 6000 series
            else if (gpu.Contains("RX 6950 XT")) score = 750;
            else if (gpu.Contains("RX 6900 XT")) score = 720;
            else if (gpu.Contains("RX 6800 XT")) score = 680;
            else if (gpu.Contains("RX 6800")) score = 650;
            else if (gpu.Contains("RX 6700 XT")) score = 580;
            else if (gpu.Contains("RX 6600 XT")) score = 500;
            // AMD RX 5000 series
            else if (gpu.Contains("RX 5700 XT")) score = 480;
            else if (gpu.Contains("RX 5700")) score = 450;
            else if (gpu.Contains("RX 5600 XT")) score = 420;

            // Adjust score based on VRAM (important for VR)
            if (gpuMemoryMB >= 16384) score += 50; // 16GB+
            else if (gpuMemoryMB >= 12288) score += 30; // 12GB+
            else if (gpuMemoryMB >= 8192) score += 15; // 8GB+
            else if (gpuMemoryMB < 6144 && score > 0) score -= 20; // Less than 6GB penalty

            return score;
        }

        private static int CalculateCPUScore(int cores, double speedGHz)
        {
            int score = 0;

            // Base score from cores
            if (cores >= 16) score = 100;
            else if (cores >= 12) score = 90;
            else if (cores >= 8) score = 75;
            else if (cores >= 6) score = 60;
            else if (cores >= 4) score = 40;
            else score = 20;

            // Adjust for clock speed
            if (speedGHz >= 5.0) score += 30;
            else if (speedGHz >= 4.5) score += 25;
            else if (speedGHz >= 4.0) score += 20;
            else if (speedGHz >= 3.5) score += 15;
            else if (speedGHz >= 3.0) score += 10;

            return score;
        }

        private static int CalculateRAMScore(long ramGB)
        {
            if (ramGB >= 64) return 100;
            if (ramGB >= 32) return 90;
            if (ramGB >= 24) return 80;
            if (ramGB >= 16) return 70;
            if (ramGB >= 12) return 50;
            if (ramGB >= 8) return 30;
            return 10;
        }

        private static int CalculateBaseFPS(string category, int gpuScore, int cpuScore, int ramScore)
        {
            double baseFPS = 0;

            switch (category)
            {
                case "Social": // VRChat - CPU and RAM heavy
                    baseFPS = (gpuScore * 0.4) + (cpuScore * 0.4) + (ramScore * 0.2);
                    break;

                case "Simulation": // Flight sims - Very demanding, balanced
                    baseFPS = (gpuScore * 0.5) + (cpuScore * 0.35) + (ramScore * 0.15);
                    baseFPS *= 0.7; // Flight sims are particularly demanding
                    break;

                case "Physics": // Boneworks - CPU heavy
                    baseFPS = (gpuScore * 0.45) + (cpuScore * 0.45) + (ramScore * 0.1);
                    break;

                case "Action": // Half-Life Alyx - Well optimized, GPU focused
                    baseFPS = (gpuScore * 0.6) + (cpuScore * 0.25) + (ramScore * 0.15);
                    baseFPS *= 1.15; // Bonus for optimization
                    break;

                case "Rhythm": // Beat Saber - Very well optimized
                    baseFPS = (gpuScore * 0.5) + (cpuScore * 0.3) + (ramScore * 0.2);
                    baseFPS *= 1.3; // High bonus for excellent optimization
                    break;

                case "RPG": // Skyrim VR - Mod dependent, moderate
                    baseFPS = (gpuScore * 0.5) + (cpuScore * 0.35) + (ramScore * 0.15);
                    baseFPS *= 0.85; // Penalty for older engine and mods
                    break;

                case "Exploration": // No Man's Sky - Demanding
                    baseFPS = (gpuScore * 0.55) + (cpuScore * 0.3) + (ramScore * 0.15);
                    baseFPS *= 0.8; // Demanding game
                    break;

                case "FPS": // Pavlov, Contractors - Competitive, optimized
                    baseFPS = (gpuScore * 0.5) + (cpuScore * 0.35) + (ramScore * 0.15);
                    baseFPS *= 1.1; // Bonus for competitive optimization
                    break;

                default:
                    baseFPS = (gpuScore * 0.5) + (cpuScore * 0.35) + (ramScore * 0.15);
                    break;
            }

            // Convert score to FPS (scale 0-1200 score to 0-144 FPS range)
            int fps = (int)(baseFPS * 0.12);

            // Clamp to reasonable range
            if (fps < 15) fps = 15;
            if (fps > 144) fps = 144;

            return fps;
        }
    }
}
