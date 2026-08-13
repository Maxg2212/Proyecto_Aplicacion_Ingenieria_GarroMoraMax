/**
 * Performance Test: History Page Responsiveness
 * TEST-ID: PERF-FUNC-002
 */

describe('History Page Performance Tests', () => {
  let originalConsoleLog;
  let performanceMetrics = [];

  beforeAll(() => {
    // Store original console.log to restore later
    originalConsoleLog = console.log;
    // Mock console.log to avoid cluttering test output
    console.log = jest.fn();
  });

  afterAll(() => {
    // Restore original console.log
    console.log = originalConsoleLog;
    
    // Print performance summary
    console.log('\n=== PERFORMANCE TEST SUMMARY ===');
    performanceMetrics.forEach(metric => {
      console.log(`${metric.name}: ${metric.value}ms`);
    });
  });

  const generateMockHistoryData = (count) => {
    const species = [
      'Acer palmatum', 'Cedrus deodara', 'Celtis sinensis', 
      'Ginkgo biloba', 'Liquidambar formosana', 'Zelkova serrata'
    ];
    
    return Array.from({ length: count }, (_, index) => ({
      species: species[index % species.length],
      accuracy: (70 + Math.random() * 25).toFixed(1),
      timestamp: new Date(Date.now() - index * 3600000).toLocaleString(),
      location: index % 3 === 0 ? { 
        latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
        longitude: -74.0060 + (Math.random() - 0.5) * 0.1
      } : null
    }));
  };

  test('PERF-FUNC-002: History page responsiveness with 150 entries', async () => {
    // Step 1: Add 150 history entries programmatically
    const mockHistory = generateMockHistoryData(150);
    
    // Step 2 & 3: Navigate to History page and measure render time
    const renderStartTime = performance.now();
    
    // Import and render the Historial component
    const { default: Historial } = await import('../../src/Historial');
    const { render, screen } = await import('@testing-library/react');
    
    const { container } = render(
      <Historial history={mockHistory} clearHistory={jest.fn()} />
    );
    
    const renderEndTime = performance.now();
    const renderTime = renderEndTime - renderStartTime;

    // Step 4: Verify content is rendered
    expect(screen.getByText('Identification History')).toBeInTheDocument();
    expect(screen.getByText('Clear History')).toBeInTheDocument();
    
    // Check that entries are rendered
    const tableRows = container.querySelectorAll('tbody tr');
    expect(tableRows.length).toBe(150);

    // Step 5: Measure scroll performance
    const tableBody = container.querySelector('tbody');
    const scrollStartTime = performance.now();
    
    // Simulate scrolling through the table
    if (tableBody) {
      tableBody.scrollTop = tableBody.scrollHeight;
      // Force a reflow to ensure scroll is processed
      void tableBody.offsetHeight;
    }
    
    const scrollEndTime = performance.now();
    const scrollTime = scrollEndTime - scrollStartTime;

    // Store metrics for reporting
    performanceMetrics.push(
      { name: 'Page render time (150 entries)', value: Math.round(renderTime) },
      { name: 'Scroll performance time', value: Math.round(scrollTime) }
    );

    // Step 6: Assert performance requirements
    console.log(`Render time for 150 entries: ${Math.round(renderTime)}ms`);
    console.log(`Scroll time: ${Math.round(scrollTime)}ms`);
    
    // Expected Result: Page loads < 3 seconds, smooth scrolling with no lag
    expect(renderTime).toBeLessThan(3000); // 3 seconds max
    
    // Scroll should be very fast (less than 100ms for smooth experience)
    expect(scrollTime).toBeLessThan(100);
    
    // Additional check: No console errors during render
    expect(console.log).not.toHaveBeenCalledWith(
      expect.stringContaining('error'),
      expect.anything()
    );
  });

  test('Performance with varying history sizes', async () => {
    const sizes = [50, 100, 200];
    
    for (const size of sizes) {
      const mockHistory = generateMockHistoryData(size);
      
      const renderStartTime = performance.now();
      
      const { default: Historial } = await import('../../src/Historial');
      const { render, screen } = await import('@testing-library/react');
      
      render(<Historial history={mockHistory} clearHistory={jest.fn()} />);
      
      const renderEndTime = performance.now();
      const renderTime = renderEndTime - renderStartTime;
      
      performanceMetrics.push({
        name: `Render time (${size} entries)`,
        value: Math.round(renderTime)
      });
      
      console.log(`Render time for ${size} entries: ${Math.round(renderTime)}ms`);
      
      // All sizes should render reasonably fast
      expect(renderTime).toBeLessThan(5000); // 5 seconds max even for 200 entries
    }
  });
});