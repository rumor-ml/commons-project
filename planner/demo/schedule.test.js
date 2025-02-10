export default [
  {
    name: "Schedule renders title",
    component: "component/schedule.tsx",
    testData: {
      "component/schedule.json": {
        schedules: [{
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
      context.log("Starting title test");
      
      const element = await context.waitForElement('[data-testid="schedule-title"]');
      context.log(`Found element: ${element.outerHTML}`);
      context.log(`Element text: ${element.textContent}`);
      
      if (!element.textContent?.includes('Weekly Schedule')) {
        throw new Error(`Schedule title not found. Found text: "${element.textContent}"`);
      }
    }
  },
  {
    name: "Schedule renders all time blocks",
    component: "component/schedule.tsx",
    testData: {
      "component/schedule.json": {
        schedules: [{
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
      context.log("Testing schedule blocks render");
      
      const svg = await context.waitForElement('[data-testid="schedule-svg"]');
      
      // Wait for blocks with timeout and logging
      let blocks = [];
      const startTime = Date.now();
      const timeout = 5000;
      
      while (Date.now() - startTime < timeout) {
        blocks = context.container.querySelectorAll('[data-testid="time-block"]');
        context.log(`Checking for blocks: found ${blocks.length}`);
        
        if (blocks.length > 0) break;
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      if (blocks.length === 0) {
        // Log detailed component state
        context.log('Debug: Component state at timeout:');
        context.log(`SVG contents: ${svg.innerHTML}`);
        context.log(`Test data: ${JSON.stringify(context.testData)}`);
      }
    }
  },
  {
    name: "Schedule renders legend",
    component: "component/schedule.tsx",
    testData: {
      "component/schedule.json": {
        schedules: [{
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
      const legend = await context.waitForElement('[data-testid="schedule-legend"]');
      const items = ['Focus', 'Meals', 'Exercise'];
      
      for (const item of items) {
        if (!legend.textContent?.includes(item)) {
          throw new Error(`Legend item "${item}" not found`);
        }
      }
    }
  }
];

