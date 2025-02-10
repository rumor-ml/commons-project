/*
                      .--._.--.
                     ( O     O )
                     /   . .   \
                    .`._______.'.
                   /(           )\
                 _/  \  \   /  /  \_
              .~   `  \  \ /  /  '   ~.
             /  \    `._\/\_.'    /  \
            /    `---''     ''---'    \
            
           Ribbit! Track your routine!
*/

// Imports injected by component.js
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { defaultColor } from 'util';
import _ from 'lodash';

const colors = {
  meal: '#86efac',
  exercise: '#f472b6',
  focus: '#60a5fa',
  wakeup: '#854d0e',
  snack: '#d97706'
};

type TrackerEvent = {
  type: 'log-added' | 'log-updated' | 'log-deleted';
  timestamp: string;
  resource: string;
  payload: {
    log?: {
      timestamp: string;
      activity: string;
      timing: string;
      energy: number;
      focus: number;
    };
    previousTimestamp?: string;
  };
};

// Shared helper functions
const timeStringToDate = (timeStr: string, currentTime: Date = new Date()) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date(currentTime.getTime());
  date.setHours(hours, minutes, 0, 0);
  // If the resulting time is earlier than current time, it might be for tomorrow
  if (date < currentTime && hours < currentTime.getHours()) {
    date.setDate(date.getDate() + 1);
  }
  return date;
};

const getCurrentDaySchedule = (data: any, currentTime: Date = new Date()) => {
  if (!data?.schedules?.length) {
    return {
      name: 'Default',
      timeBlocks: [],
      markers: [],
      transitions: []
    };
  }
  const dayOfWeek = currentTime.getDay();
  if (dayOfWeek === 1) return data.schedules[1] || data.schedules[0]; // Monday
  if (dayOfWeek === 3) return data.schedules[2] || data.schedules[0]; // Wednesday
  if (dayOfWeek === 4) return data.schedules[3] || data.schedules[0]; // Thursday
  return data.schedules[0]; // Base schedule for other days
};

const getCurrentBlock = (schedule: any, currentTime: Date = new Date()) => {
  if (!schedule?.timeBlocks) return null;
  
  return schedule.timeBlocks.find(block => {
    const startTime = timeStringToDate(block.start, currentTime);
    const endTime = new Date(startTime.getTime() + block.duration * 60000);
    return currentTime >= startTime && currentTime < endTime;
  });
};

const CurrentActivity = ({ data, onBlockChange }: TrackerProps & { onBlockChange: (block: any) => void }) => {
  const [currentTime, setCurrentTime] = React.useState(new Date());
  const [currentBlock, setCurrentBlock] = React.useState(null);
  const [currentMarker, setCurrentMarker] = React.useState(null);
  
  const getEndTime = (block) => {
    const startTime = timeStringToDate(block.start);
    const endTime = new Date(startTime.getTime() + block.duration * 60000);
    return `${String(endTime.getHours()).padStart(2, '0')}:${String(endTime.getMinutes()).padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (!currentBlock) return 0;
    
    const startTime = timeStringToDate(currentBlock.start);
    const endTime = new Date(startTime.getTime() + currentBlock.duration * 60000);
    const totalDuration = currentBlock.duration * 60000;
    const elapsed = currentTime - startTime;
    
    return Math.min(Math.round((elapsed / totalDuration) * 100), 100);
  };

  const getTimeRemaining = () => {
    if (!currentBlock) return '';
    
    const startTime = timeStringToDate(currentBlock.start);
    const endTime = new Date(startTime.getTime() + currentBlock.duration * 60000);
    const remainingMs = endTime - currentTime;
    const remainingMinutes = Math.ceil(remainingMs / 60000);
    
    if (remainingMinutes < 1) return 'Less than 1 minute';
    if (remainingMinutes === 1) return '1 minute';
    return `${remainingMinutes} minutes`;
  };

  React.useEffect(() => {
// Initial setup
if (data) {
  const now = new Date();
  const schedule = getCurrentDaySchedule(data);
  const block = getCurrentBlock(schedule);
  const marker = schedule?.markers?.find(m => {
    const markerTime = timeStringToDate(m.time);
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000);
    return markerTime >= fiveMinutesAgo && markerTime <= now;
  });
  
  setCurrentBlock(block);
  setCurrentMarker(marker);
  
}

// Timer setup
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      const schedule = getCurrentDaySchedule(data);
      const block = getCurrentBlock(schedule);
      const marker = schedule?.markers?.find(m => {
        const markerTime = timeStringToDate(m.time);
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000);
        return markerTime >= fiveMinutesAgo && markerTime <= now;
      });

      if (JSON.stringify(block) !== JSON.stringify(currentBlock) || 
          JSON.stringify(marker) !== JSON.stringify(currentMarker)) {
        setCurrentBlock(block);
        setCurrentMarker(marker);
        
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [data]); // This effect runs when data changes or component mounts

  if (!data) return null;

  
  const timeToX = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    const startHours = 7.75;
    const totalMinutes = (hours - startHours) * 60 + minutes;
    return 50 + (totalMinutes / 915) * 500;
  };

  const getCurrentTimeX = () => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    return timeToX(timeString);
  };

  const schedule = getCurrentDaySchedule(data);

  return (
    <Card className="bg-white relative">
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.12] select-none pointer-events-none whitespace-pre font-mono">
{`                      .--._.--.
                     ( O     O )
                     /   . .   \\
                    .'._______.'
                   /(           )\\
                 _/  \\  \\   /  /  \\_
              .~   \`  \\  \\ /  /  '   ~.
             /  \\    \`._\\/\\_.'    /  \\
            /    \`---''     ''---'    \\`}
      </div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium flex items-center gap-2 component">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ 
                backgroundColor: currentBlock?.type ? colors[currentBlock?.type] : defaultColor(currentBlock?.type, colors)
              }} 
            />
            <div className="font-medium component" data-testid="current-activity">Current Activity</div>
          </CardTitle>
          <div className="text-sm text-gray-500">
            {currentTime.toLocaleDateString(undefined, { weekday: 'long' })}, {currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString().slice(0, -6)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {currentBlock ? (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium text-lg">{currentBlock.name}</span>
              <span className="text-sm text-gray-600">
                {currentBlock.start} - {getEndTime(currentBlock)}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div 
                className="h-full rounded-full transition-all duration-1000"
                style={{ 
                  width: `${getProgressPercentage()}%`,
                  backgroundColor: colors[currentBlock.type] || defaultColor(currentBlock.type, colors)
                }}
              />
            </div>
            <div className="text-sm text-gray-600">
              <span>{getTimeRemaining()} remaining</span>
            </div>
          </div>
        ) : (
          <div className="text-gray-500">No scheduled activity at this time</div>
        )}
      
              <div className="pt-2 border-t border-gray-100">
                <svg className="w-full" height="100" viewBox="0 0 600 100">
                  {/* Patterns */}
                  <defs>
                    <pattern id="recoveryPattern" patternUnits="userSpaceOnUse" width="8" height="8">
                      <rect width="8" height="8" fill="none"/>
                      <path d="M0 0L8 8M0 8L8 0" stroke="#6b7280" strokeWidth="1"/>
                    </pattern>
                    <pattern id="transitionPattern" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(-45)">
                      <line x1="0" y1="0" x2="0" y2="6" stroke="#6b7280" strokeWidth="2" />
                    </pattern>
                  </defs>
      
                  {/* Background */}
                  <rect width="600" height="100" fill="#f8fafc" rx="4" />
      
                  {/* Time Scale */}
                  {['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'].map((time) => (
                    <g key={time}>
                      <line 
                        x1={timeToX(time)} 
                        y1="20" 
                        x2={timeToX(time)} 
                        y2="70" 
                        stroke="#e2e8f0" 
                        strokeWidth="1"
                        strokeDasharray="4,4"
                      />
                      <text 
                        x={timeToX(time)} 
                        y="15" 
                        fill="#475569" 
                        fontSize="10" 
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        {time}
                      </text>
                    </g>
                  ))}
      
                  {/* Timeline base */}
                  <line x1="50" y1="45" x2="550" y2="45" stroke="#334155" strokeWidth="1"/>
      
                  {/* Transition periods */}
                  {schedule.transitions?.map((transition, i) => (
                    <rect 
                      key={i}
                      x={timeToX(transition.start)}
                      y="50"
                      width={(transition.duration / 915) * 500}
                      height="25"
                      fill={`url(#${transition.type}Pattern)`}
                      opacity="0.2"
                    />
                  ))}
      
                  {/* Event markers */}
                  {schedule.markers?.map((marker, i) => (
                    <g key={i}>
                      <text 
                        x={timeToX(marker.time)} 
                        y="40" 
                        fontSize="10" 
                        fill={colors[marker.type] || defaultColor(marker.type, colors)}
                        textAnchor="middle"
                      >
                        ↓ {marker.name}
                      </text>
                      <line 
                        x1={timeToX(marker.time)}
                        y1="45"
                        x2={timeToX(marker.time)}
                        y2="50"
                        stroke={colors[marker.type] || defaultColor(marker.type, colors)}
                        strokeWidth="2"
                      />
                    </g>
                  ))}
      
                  {/* Time blocks */}
                  {schedule.timeBlocks.map((block, i) => (
                    <g key={i} className="hover:opacity-90">
                      <rect 
                        x={timeToX(block.start)}
                        y="50"
                        width={(block.duration / 915) * 500}
                        height="25"
                        fill={colors[block.type] || defaultColor(block.type, colors)}
                        rx="4"
                        className={`transition-opacity duration-200 ${
                          currentBlock?.start === block.start ? 'stroke-2 stroke-gray-400' : ''
                        }`}
                      />
                      <text 
                        x={timeToX(block.start) + 5}
                        y="66"
                        fontSize="10"
                        fill="#000000"
                        className="font-medium"
                      >
                        {block.name}
                      </text>
                    </g>
                  ))}
      
                  {/* Current time indicator */}
                  <line 
                    x1={getCurrentTimeX()} 
                    y1="20" 
                    x2={getCurrentTimeX()} 
                    y2="75" 
                    stroke="#ef4444" 
                    strokeWidth="2"
                  />
                  <circle 
                    cx={getCurrentTimeX()} 
                    cy="20" 
                    r="3" 
                    fill="#ef4444" 
                  />
                </svg>
              </div>
      </CardContent>
    </Card>
  );
};

const DaySchedule = ({ schedule, currentTime }) => {
  const timeToX = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    const startHours = 7.75;
    const totalMinutes = (hours - startHours) * 60 + minutes;
    return 50 + (totalMinutes / 915) * 500; // Scaled down from 900 to 500
  };

  // Calculate current time position
  const getCurrentTimeX = () => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    return timeToX(timeString);
  };

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Today's Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <svg className="w-full" height="120" viewBox="0 0 600 120">
          {/* Patterns */}
          <defs>
            <pattern id="recoveryPattern" patternUnits="userSpaceOnUse" width="8" height="8">
              <rect width="8" height="8" fill="none"/>
              <path d="M0 0L8 8M0 8L8 0" stroke="#6b7280" strokeWidth="1"/>
            </pattern>
            <pattern id="transitionPattern" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(-45)">
              <line x1="0" y1="0" x2="0" y2="6" stroke="#6b7280" strokeWidth="2" />
            </pattern>
          </defs>

          {/* Background */}
          <rect width="600" height="120" fill="#f8fafc" rx="4" />

          {/* Time Scale */}
          {['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'].map((time) => (
            <g key={time}>
              <line 
                x1={timeToX(time)} 
                y1="30" 
                x2={timeToX(time)} 
                y2="90" 
                stroke="#e2e8f0" 
                strokeWidth="1"
                strokeDasharray="4,4"
              />
              <text 
                x={timeToX(time)} 
                y="25" 
                fill="#475569" 
                fontSize="10" 
                textAnchor="middle"
                fontFamily="monospace"
              >
                {time}
              </text>
            </g>
          ))}

          {/* Timeline base */}
          <line x1="50" y1="60" x2="550" y2="60" stroke="#334155" strokeWidth="1"/>

          {/* Transition periods */}
          {schedule.transitions?.map((transition, i) => (
            <rect 
              key={i}
              x={timeToX(transition.start)}
              y="70"
              width={(transition.duration / 915) * 500}
              height="30"
              fill={`url(#${transition.type}Pattern)`}
              opacity="0.2"
            />
          ))}

          {/* Event markers */}
          {schedule.markers?.map((marker, i) => (
            <g key={i}>
              <text 
                x={timeToX(marker.time)} 
                y="55" 
                fontSize="10" 
                fill={colors[marker.type] || defaultColor(marker.type, colors)}
                textAnchor="middle"
              >
                ↓ {marker.name}
              </text>
              <line 
                x1={timeToX(marker.time)}
                y1="60"
                x2={timeToX(marker.time)}
                y2="70"
                stroke={colors[marker.type] || defaultColor(marker.type, colors)}
                strokeWidth="2"
              />
            </g>
          ))}

          {/* Time blocks */}
          {schedule.timeBlocks.map((block, i) => (
            <g key={i} className="hover:opacity-90">
              <rect 
                x={timeToX(block.start)}
                y="70"
                width={(block.duration / 915) * 500}
                height="30"
                fill={colors[block.type] || defaultColor(block.type, colors)}
                rx="4"
                className="transition-opacity duration-200"
              />
              <text 
                x={timeToX(block.start) + 5}
                y="88"
                fontSize="10"
                fill="#000000"
                className="font-medium"
              >
                {block.name}
              </text>
            </g>
          ))}

          {/* Current time indicator */}
          <line 
            x1={getCurrentTimeX()} 
            y1="30" 
            x2={getCurrentTimeX()} 
            y2="100" 
            stroke="#ef4444" 
            strokeWidth="2"
          />
          <circle 
            cx={getCurrentTimeX()} 
            cy="30" 
            r="3" 
            fill="#ef4444" 
          />
        </svg>
      </CardContent>
    </Card>
  );
};

interface TrackerProps {
  storage: StorageAdapter;
  onEvent: (event: any) => void;
}

const Tracker = ({ storage }: TrackerProps) => {
  const [logs, setLogs] = useState<Array<any> | undefined>(undefined);
  const [scheduleData, setScheduleData] = useState<any>(null);
  const [currentActivity, setCurrentActivity] = useState('');
  const [activityTiming, setActivityTiming] = useState('after');
  const [energyLevel, setEnergyLevel] = useState(5);
  const [editingLog, setEditingLog] = useState(null);
  const [isManualSelection, setIsManualSelection] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { cleanup } = await storage.syncComponent({
        'schedule.json': setScheduleData,
        'tracker.json': setLogs,
      });
      return cleanup;
    };

    init().catch(error => {
      console.error('Failed to initialize tracker:', error);
    });
  }, [storage]);

  // Initialize current activity when schedule data loads
  useEffect(() => {
    if (!scheduleData || isManualSelection) return; // Skip if there's a manual selection
    
    const now = new Date();
    const schedule = getCurrentDaySchedule(scheduleData);
    
    if (!schedule) {
      return;
    }
    
    const currentBlock = getCurrentBlock(schedule);
    const marker = getCurrentMarker(schedule);
    
    let newActivity = '';
    let newTiming = 'after';
    
    if (marker) {
      newActivity = marker.type;
      newTiming = 'after';
    } else if (currentBlock) {
      newActivity = currentBlock.type;
      newTiming = 'after';
    } else {
      // If no current block/marker, look for the next upcoming one
      const findNextEvent = () => {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();

        // Get all upcoming blocks and markers for today
        const upcomingBlocks = schedule.timeBlocks
          .map(block => {
            const [hours, minutes] = block.start.split(':').map(Number);
            const startMinutes = hours * 60 + minutes;
            return { ...block, startMinutes, isBlock: true };
          })
          .filter(block => block.startMinutes > currentTime);

        const upcomingMarkers = (schedule.markers || [])
          .map(marker => {
            const [hours, minutes] = marker.time.split(':').map(Number);
            const startMinutes = hours * 60 + minutes;
            return { ...marker, startMinutes, isMarker: true };
          })
          .filter(marker => marker.startMinutes > currentTime);

        // Sort all upcoming events by time
        const allEvents = [...upcomingBlocks, ...upcomingMarkers]
          .sort((a, b) => {
            // If times are equal, prioritize blocks over markers
            if (a.startMinutes === b.startMinutes) {
              return a.isBlock ? -1 : 1;
            }
            return a.startMinutes - b.startMinutes;
          });

        return allEvents[0];
      };

      const nextEvent = findNextEvent();

      if (nextEvent) {
        if (nextEvent.isMarker) {
          // It's a marker
          newActivity = nextEvent.type;
          newTiming = 'before';
        } else if (nextEvent.isBlock) {
          // It's a block
          newActivity = nextEvent.type;
          newTiming = 'before';
        }
      }
      
      // Only update state if we have a new activity to set
      if (newActivity) {
        setCurrentActivity(newActivity);
        setActivityTiming(newTiming);
      }
    }
  }, [scheduleData, isManualSelection]); // Depend on scheduleData and manual selection changes

  const getCurrentMarker = (schedule: any) => {
    if (!schedule?.markers) return null;
    const now = new Date();
    // Find any marker that occurred in the last 5 minutes
    return schedule.markers.find(marker => {
      const markerTime = timeStringToDate(marker.time);
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000);
      return markerTime >= fiveMinutesAgo && markerTime <= now;
    });
  };

  const handleBlockChange = (block: any) => {
    if (isManualSelection) return; // Skip automatic updates if user made a manual selection
    
    const schedule = getCurrentDaySchedule(scheduleData);
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    // Get all upcoming blocks and markers for today
    const upcomingBlocks = schedule.timeBlocks
      .map(block => {
        const [hours, minutes] = block.start.split(':').map(Number);
        const startMinutes = hours * 60 + minutes;
        return { ...block, startMinutes, isBlock: true };
      })
      .filter(block => block.startMinutes > currentTime);

    const upcomingMarkers = (schedule.markers || [])
      .map(marker => {
        const [hours, minutes] = marker.time.split(':').map(Number);
        const startMinutes = hours * 60 + minutes;
        return { ...marker, startMinutes, isMarker: true };
      })
      .filter(marker => marker.startMinutes > currentTime);

    // Sort all upcoming events by time
    const allEvents = [...upcomingBlocks, ...upcomingMarkers]
      .sort((a, b) => {
        // If times are equal, prioritize blocks over markers
        if (a.startMinutes === b.startMinutes) {
          return a.isBlock ? -1 : 1;
        }
        return a.startMinutes - b.startMinutes;
      });

    const nextEvent = allEvents[0];

    if (block?.type) {
      // We're in a current block
      setCurrentActivity(block.type);
      setActivityTiming('after');
    } else if (nextEvent) {
      // We're between blocks, use the next event
      if (nextEvent.isBlock) {
        setCurrentActivity(nextEvent.type);
        setActivityTiming('before');
      } else if (nextEvent.isMarker) {
        setCurrentActivity(nextEvent.type);
        setActivityTiming('before');
      }
    }
  };

  const [focusLevel, setFocusLevel] = useState(5);

  // Extract unique activity types from both blocks and markers
  const activities = React.useMemo(() => {
    if (!scheduleData?.schedules) {
      return [];
    }
    
    const allSchedules = scheduleData.schedules;
    const blockTypes = allSchedules.flatMap(schedule => 
      (schedule.timeBlocks || []).map(block => block.type)
    );
    const markerTypes = allSchedules.flatMap(schedule => 
      (schedule.markers || []).map(marker => marker.type)
    );
    
    // Filter out any undefined/null values and deduplicate
    return [...new Set(blockTypes.concat(markerTypes).filter(Boolean))];
  }, [scheduleData]);


  const addLog = () => {
    const newLog = {
      timestamp: new Date().toISOString(),
      activity: currentActivity,
      timing: activityTiming,
      energy: parseInt(energyLevel.toString()),
      focus: parseInt(focusLevel.toString()),
    };

    // Initialize logs array if it doesn't exist yet
    const currentLogs = logs || [];
    
    let updatedLogs;
    if (editingLog) {
      updatedLogs = currentLogs.map(log => 
        log.timestamp === editingLog.timestamp ? newLog : log
      );
    } else {
      updatedLogs = [newLog, ...currentLogs];
    }

    setLogs(updatedLogs);
    try {
      storage.setItem("component/tracker.json", updatedLogs);
    } catch (error) {
      console.error('Failed to update storage:', error);
      throw error;
    }
    setEditingLog(null);

    // Reset form after successful log
    setCurrentActivity('');
    setActivityTiming('after');
    setEnergyLevel(5);
    setFocusLevel(5);
    setIsManualSelection(false); // Reset the manual selection flag
  };

  const deleteLog = async (timestamp) => {
    try {
      setLogs(prevLogs => {
        const logToDelete = prevLogs.find(log => log.timestamp === timestamp);
        const updatedLogs = prevLogs.filter(log => log.timestamp !== timestamp);
        storage.setItem("component/tracker.json", JSON.stringify(updatedLogs));
        return updatedLogs;
      });
    } catch (error) {
      console.error('Failed to delete log:', error);
      throw error;
    }
  };

  const editLog = (log) => {
    setEditingLog(log);
    setCurrentActivity(log.activity);
    setActivityTiming(log.timing);
    setEnergyLevel(log.energy);
    setFocusLevel(log.focus);
  };

  return (
    <div className="p-4 bg-gray-50">
      <div className="max-w-xl mx-auto space-y-4">
        <CurrentActivity 
          data={scheduleData} 
          onBlockChange={(block) => !isManualSelection && handleBlockChange(block)} 
        />
        
        <details className="bg-white rounded-lg shadow">
          <summary className="px-6 py-3 font-medium cursor-pointer hover:bg-gray-50" data-testid="log-form-toggle">
            Routine Tracker
          </summary>
          
          <div className="p-4">
            <div className="space-y-4">
                  <div>
                    <label className="block mb-2">Activity</label>
                    <div className="flex gap-2">
                      <select 
                          className="flex-grow p-2 border rounded"
                          value={currentActivity}
                          onChange={(e) => {
                            setCurrentActivity(e.target.value);
                            setIsManualSelection(true);
                          }}
                        data-testid="activity-select"
                      >
                        <option value="">Select Activity</option>
                        {[...new Set([...activities, currentActivity])].map(activity => (
                          <option key={activity} value={activity}>{activity}</option>
                        ))}
                      </select>
                      <select
                        className="w-32 p-2 border rounded"
                        value={activityTiming}
                        onChange={(e) => setActivityTiming(e.target.value)}
                      >
                        <option value="before">Before</option>
                        <option value="after">After</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block mb-2">Energy Level (1-10)</label>
                    <div className="text-sm text-gray-600 mb-2">
                      1: Completely depleted | 3: Lethargic but functional | 
                      5: Average energy | 7: Good energy | 10: Peak vitality
                    </div>
                    <Input
                      type="range"
                      min="1"
                      max="10"
                      value={energyLevel}
                      onChange={(e) => setEnergyLevel(e.target.value)}
                      className="w-full"
                    />
                    <div className="text-center">{energyLevel}</div>
                  </div>

                  <div>
                    <label className="block mb-2">Focus Level (1-10)</label>
                    <div className="text-sm text-gray-600 mb-2">
                      1: Cannot concentrate | 3: Scattered but functional | 
                      5: Average focus | 7: Good focus | 10: Flow state
                    </div>
                    <Input
                      type="range"
                      min="1"
                      max="10"
                      value={focusLevel}
                      onChange={(e) => setFocusLevel(e.target.value)}
                      className="w-full"
                    />
                    <div className="text-center">{focusLevel}</div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={addLog}
                      className="flex-grow component"
                      disabled={!currentActivity}
                      data-testid="submit-log"
                    >
                      {editingLog ? 'Update Log' : 'Log Activity'}
                    </Button>
                    {editingLog && (
                      <Button 
                        onClick={() => {
                          setEditingLog(null);
                          setCurrentActivity('');
                          setActivityTiming('after');
                          setEnergyLevel(5);
                          setFocusLevel(5);
                        }}
                        className="bg-gray-500 hover:bg-gray-600"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2 mt-4">
                    {!logs ? (
                      <div className="text-sm text-gray-500">Loading logs...</div>
                    ) : logs.length === 0 ? (
                      <div className="text-sm text-gray-500">No logs recorded yet</div>
                    ) : (
                      <>
                        <div className="text-sm text-gray-500 mb-2">
                          Showing {Math.min(logs.length, 5)} of {logs.length} logs
                        </div>
                        {logs.slice(0, 5).map((log) => (
                      <Card key={log.timestamp} className="p-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-grow">
                            <div className="text-sm text-gray-500">
                              {new Date(log.timestamp).toLocaleString()}
                            </div>
                            <div className="font-medium">
                              {log.timing === 'before' ? 'Before' : 'After'} {log.activity.charAt(0).toUpperCase() + log.activity.slice(1)}
                            </div>
                            <div className="text-sm">
                              Energy: {log.energy} | Focus: {log.focus}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => editLog(log)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteLog(log.timestamp)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </>
                    )}
                  </div>
                </div>
          </div>
        </details>
      </div>
    </div>
  );
};

export default Tracker;
