export default [
  {
    name: "Tracker renders current activity",
    component: "tracker",
    testData: {
      schedule: {
        schedules: [{
          id: "test1",
          name: "Test Schedule",
          timeBlocks: [
            { type: "focus", start: "09:00", duration: 90, name: "Deep Work" },
            { type: "meal", start: "12:00", duration: 60, name: "Lunch" },
            { type: "exercise", start: "17:00", duration: 60, name: "Workout" }
          ],
          markers: [
            { type: "wakeup", time: "08:00", name: "Wake Up" },
            { type: "snack", time: "15:00", name: "Snack Time" }
          ]
        }],
        timeRange: {
          start: "08:00",
          end: "22:00",
          majorTicks: ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"]
        }
      }
    },
    test: async (context) => {
      context.log("Testing current activity render");
      
      // Clear any existing storage
      localStorage.clear();
      
      const element = await context.waitForElement('[data-testid="current-activity"]');
      if (!element) {
        throw new Error('Current activity section not found');
      }
    }
  },
  {
    name: "Tracker form controls render",
    component: "tracker",
    testData: {
      schedule: {
        schedules: [{
          timeBlocks: [],
          markers: []
        }],
        timeRange: {
          start: "08:00",
          end: "22:00",
          majorTicks: []
        }
      }
    },
    test: async (context) => {
      context.log("Testing form control rendering");
      
      // Open the form
      const toggle = await context.waitForElement('[data-testid="log-form-toggle"]');
      toggle.click();

      // Wait for form elements
      const activitySelect = await context.waitForElement('[data-testid="activity-select"]');
      context.log("Found activity select");

      const submitButton = await context.waitForElement('[data-testid="submit-log"]');
      if (!submitButton) {
        throw new Error('Submit button not found');
      }

      const ranges = context.container.querySelectorAll('input[type="range"]');
      if (ranges.length < 2) {
        throw new Error('Energy and focus inputs not found');
      }
    }
  },
  {
    name: "Tracker can log activity",
    component: "tracker",
    testData: {
      tracker: [],
      schedule: {
        schedules: [{
          timeBlocks: [
            { type: "focus", start: "09:00", duration: 90, name: "Deep Work" },
            { type: "meal", start: "12:00", duration: 60, name: "Lunch" },
            { type: "exercise", start: "17:00", duration: 60, name: "Workout" }
          ],
          markers: [
            { type: "wakeup", time: "08:00", name: "Wake Up" },
            { type: "snack", time: "15:00", name: "Snack Time" }
          ]
        }],
        timeRange: {
          start: "08:00",
          end: "22:00",
          majorTicks: ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"]
        }
      }
    },
    test: async (context) => {
      context.log("Testing activity logging");

      const testKey = 'tracker';
      
      // Wait for activity select to be populated
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Open the form to ensure activity select is visible
      const toggle = await context.waitForElement('[data-testid="log-form-toggle"]');
      toggle.click();
      context.log("Opened form");
      
      // Wait additional time for React to process the data and form to open
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify the activity options are populated from the schedule data
      const activitySelect = await context.waitForElement('[data-testid="activity-select"]');
      context.log("Found activity select after form open");
      const expectedActivities = ['focus', 'meal', 'exercise', 'wakeup', 'snack'];
      const options = Array.from(activitySelect.options).map(opt => opt.value).filter(v => v); // Filter out empty values
      
      // Check if all expected activities are present
      const missingActivities = expectedActivities.filter(activity => !options.includes(activity));
      if (missingActivities.length > 0) {
        throw new Error(`Activity select missing options: ${missingActivities.join(', ')}`);
      }

      // Create and dispatch a proper change event
      const changeEvent = new Event('change', { bubbles: true });
      activitySelect.value = 'focus';
      activitySelect.dispatchEvent(changeEvent);
      
      // Verify the activity was set
      if (activitySelect.value !== 'focus') {
        throw new Error('Failed to set activity value');
      }

      // Find and set ranges
      const ranges = context.container.querySelectorAll('input[type="range"]');
      ranges.forEach(range => {
        range.value = 5;
        range.dispatchEvent(new Event('change'));
      });

      // Submit form
      const submitButton = await context.waitForElement('[data-testid="submit-log"]');
      submitButton.click();
      context.log("Submitted form");

      // Wait for storage update with verification
      let storedLogs = [];
      let attempts = 0;
      const maxAttempts = 10;
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 100));
        storedLogs = context.storage.getItem(testKey);
        if (storedLogs.length > 0) break;
        attempts++;
      }

      if (attempts >= maxAttempts) {
        console.error('Final storage state:', context.storage.getItem(testKey));
        throw new Error('Timed out waiting for storage update');
      }

      // Get the last log for verification
      const lastLog = storedLogs[0]; // First log since we prepend
      
      // More detailed error message for debugging
      if (!lastLog) {
        throw new Error(`No log entry found in storage. Storage contents: ${JSON.stringify(storedLogs)}`);
      }
      
      if (lastLog.activity !== 'focus' || lastLog.energy !== 5 || lastLog.focus !== 5) {
        throw new Error(`Invalid log entry. Expected: focus/5/5, Got: ${lastLog.activity}/${lastLog.energy}/${lastLog.focus}`);
      }

    }
  }
];

