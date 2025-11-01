using System;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;

namespace VRCapabilityChecker
{
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
        }

        private async void ScanButton_Click(object sender, RoutedEventArgs e)
        {
            // Disable button during scan
            ScanButton.IsEnabled = false;
            ScanButton.Content = "Scanning...";

            // Clear previous results
            ResultsPanel.Children.Clear();
            StatusBorder.Visibility = Visibility.Collapsed;

            // Show loading indicator
            var loadingText = new TextBlock
            {
                Text = "Analyzing your system...",
                FontSize = 16,
                Foreground = (Brush)FindResource("TextBrush"),
                HorizontalAlignment = HorizontalAlignment.Center,
                Margin = new Thickness(0, 50, 0, 0)
            };
            ResultsPanel.Children.Add(loadingText);

            // Perform scan asynchronously
            await Task.Run(() => System.Threading.Thread.Sleep(1000)); // Brief delay for UX

            var systemInfo = SystemInfoChecker.GetSystemInfo();
            var vrResults = VRRequirements.CheckVRReadiness(systemInfo);

            // Clear loading
            ResultsPanel.Children.Clear();

            // Display system info
            DisplaySystemInfo(systemInfo);

            // Display VR readiness results
            DisplayVRResults(vrResults);

            // Show overall status
            ShowOverallStatus(vrResults);

            // Re-enable button
            ScanButton.IsEnabled = true;
            ScanButton.Content = "Scan System";
        }

        private void DisplaySystemInfo(SystemInfo info)
        {
            var header = CreateSectionHeader("System Information");
            ResultsPanel.Children.Add(header);

            var grid = new Grid { Margin = new Thickness(0, 10, 0, 20) };
            grid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            grid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(2, GridUnitType.Star) });

            int row = 0;

            AddInfoRow(grid, row++, "CPU:", $"{info.CPUName}");
            AddInfoRow(grid, row++, "", $"{info.CPUCores} Cores, {info.CPUThreads} Threads @ {info.CPUSpeedGHz:F2} GHz");
            AddInfoRow(grid, row++, "GPU:", $"{info.GPUName}");
            if (info.GPUMemoryMB > 0)
                AddInfoRow(grid, row++, "", $"{info.GPUMemoryMB / 1024} GB VRAM");
            AddInfoRow(grid, row++, "RAM:", $"{info.TotalRAMGB} GB ({info.AvailableRAMGB} GB Available)");
            AddInfoRow(grid, row++, "OS:", $"{info.OSName}");
            AddInfoRow(grid, row++, "", $"{(info.Is64Bit ? "64-bit" : "32-bit")} - Version {info.OSVersion}");
            AddInfoRow(grid, row++, "DirectX:", info.DirectXVersion);
            AddInfoRow(grid, row++, "USB 3.0:", info.HasUSB3 ? "Available" : "Not Detected");

            ResultsPanel.Children.Add(grid);
        }

        private void DisplayVRResults(System.Collections.Generic.List<VRReadinessResult> results)
        {
            var header = CreateSectionHeader("VR Headset Compatibility");
            ResultsPanel.Children.Add(header);

            foreach (var result in results)
            {
                var headsetPanel = CreateHeadsetPanel(result);
                ResultsPanel.Children.Add(headsetPanel);
            }
        }

        private Border CreateHeadsetPanel(VRReadinessResult result)
        {
            var border = new Border
            {
                Background = (Brush)FindResource("SurfaceBrush"),
                CornerRadius = new CornerRadius(5),
                Padding = new Thickness(15),
                Margin = new Thickness(0, 0, 0, 15)
            };

            var stackPanel = new StackPanel();

            // Headset name and status
            var headerGrid = new Grid();
            headerGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            headerGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });

            var nameText = new TextBlock
            {
                Text = result.HeadsetName,
                FontSize = 18,
                FontWeight = FontWeights.Bold,
                Foreground = (Brush)FindResource("TextBrush")
            };
            Grid.SetColumn(nameText, 0);
            headerGrid.Children.Add(nameText);

            var statusText = new TextBlock
            {
                Text = result.IsReady ? "✓ READY" : $"✗ {result.PassedChecks}/{result.TotalChecks} CHECKS PASSED",
                FontSize = 14,
                FontWeight = FontWeights.Bold,
                Foreground = result.IsReady ? (Brush)FindResource("SuccessBrush") : (Brush)FindResource("WarningBrush"),
                VerticalAlignment = VerticalAlignment.Center
            };
            Grid.SetColumn(statusText, 1);
            headerGrid.Children.Add(statusText);

            stackPanel.Children.Add(headerGrid);

            // Separator
            var separator = new Border
            {
                Height = 1,
                Background = new SolidColorBrush(Color.FromArgb(50, 255, 255, 255)),
                Margin = new Thickness(0, 10, 0, 10)
            };
            stackPanel.Children.Add(separator);

            // Component checks
            foreach (var check in result.ComponentResults)
            {
                var checkPanel = CreateComponentCheckPanel(check);
                stackPanel.Children.Add(checkPanel);
            }

            border.Child = stackPanel;
            return border;
        }

        private Grid CreateComponentCheckPanel(ComponentCheckResult check)
        {
            var grid = new Grid { Margin = new Thickness(0, 5, 0, 5) };
            grid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(120) });
            grid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            grid.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });

            var componentName = new TextBlock
            {
                Text = check.ComponentName + ":",
                FontSize = 13,
                Foreground = (Brush)FindResource("TextBrush"),
                Opacity = 0.8
            };
            Grid.SetColumn(componentName, 0);
            grid.Children.Add(componentName);

            var valueStack = new StackPanel { Orientation = Orientation.Vertical };
            var currentValue = new TextBlock
            {
                Text = check.CurrentValue,
                FontSize = 13,
                Foreground = (Brush)FindResource("TextBrush"),
                FontWeight = FontWeights.SemiBold
            };
            var requiredValue = new TextBlock
            {
                Text = $"Required: {check.RequiredValue}",
                FontSize = 11,
                Foreground = (Brush)FindResource("TextBrush"),
                Opacity = 0.6
            };
            valueStack.Children.Add(currentValue);
            valueStack.Children.Add(requiredValue);
            Grid.SetColumn(valueStack, 1);
            grid.Children.Add(valueStack);

            var statusIcon = new TextBlock
            {
                Text = check.Passes ? "✓" : "✗",
                FontSize = 16,
                FontWeight = FontWeights.Bold,
                Foreground = check.Passes ? (Brush)FindResource("SuccessBrush") : (Brush)FindResource("ErrorBrush"),
                VerticalAlignment = VerticalAlignment.Center
            };
            Grid.SetColumn(statusIcon, 2);
            grid.Children.Add(statusIcon);

            return grid;
        }

        private TextBlock CreateSectionHeader(string text)
        {
            return new TextBlock
            {
                Text = text,
                FontSize = 22,
                FontWeight = FontWeights.Bold,
                Foreground = (Brush)FindResource("PrimaryBrush"),
                Margin = new Thickness(0, 10, 0, 10)
            };
        }

        private void AddInfoRow(Grid grid, int row, string label, string value)
        {
            grid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });

            var labelText = new TextBlock
            {
                Text = label,
                FontSize = 13,
                Foreground = (Brush)FindResource("TextBrush"),
                Opacity = 0.8,
                Margin = new Thickness(0, 3, 0, 3)
            };
            Grid.SetRow(labelText, row);
            Grid.SetColumn(labelText, 0);
            grid.Children.Add(labelText);

            var valueText = new TextBlock
            {
                Text = value,
                FontSize = 13,
                Foreground = (Brush)FindResource("TextBrush"),
                FontWeight = FontWeights.SemiBold,
                Margin = new Thickness(0, 3, 0, 3),
                TextWrapping = TextWrapping.Wrap
            };
            Grid.SetRow(valueText, row);
            Grid.SetColumn(valueText, 1);
            grid.Children.Add(valueText);
        }

        private void ShowOverallStatus(System.Collections.Generic.List<VRReadinessResult> results)
        {
            var readyCount = results.Count(r => r.IsReady);
            var totalCount = results.Count;

            StatusBorder.Visibility = Visibility.Visible;

            if (readyCount == totalCount)
            {
                StatusText.Text = "🎉 Your system is ready for ALL high-end VR headsets!";
                StatusText.Foreground = (Brush)FindResource("SuccessBrush");
                StatusDetails.Text = "Your hardware exceeds the requirements for professional VR experiences.";
                StatusDetails.Foreground = (Brush)FindResource("SuccessBrush");
            }
            else if (readyCount > 0)
            {
                StatusText.Text = $"✓ Your system is ready for {readyCount} out of {totalCount} headsets";
                StatusText.Foreground = (Brush)FindResource("WarningBrush");
                StatusDetails.Text = "Consider upgrading components to support more VR headsets.";
                StatusDetails.Foreground = (Brush)FindResource("TextBrush");
            }
            else
            {
                StatusText.Text = "⚠ Your system needs upgrades for high-end VR";
                StatusText.Foreground = (Brush)FindResource("ErrorBrush");
                StatusDetails.Text = "Review the failed checks above to see what needs upgrading.";
                StatusDetails.Foreground = (Brush)FindResource("TextBrush");
            }
        }
    }
}
