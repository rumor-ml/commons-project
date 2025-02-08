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

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import _ from 'lodash';

const storageKeys = {
  logs: "tracker",
  schedule: "schedule",
}

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
  const date = new Date(currentTime);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const getCurrentDaySchedule = (data: TrackerProps['data'], currentTime: Date = new Date()) => {
  if (!data?.schedule?.schedules?.length) {
    return {
      name: 'Default',
      timeBlocks: [],
      markers: [],
      transitions: []
    };
  }
  const dayOfWeek = currentTime.getDay();
  if (dayOfWeek === 1) return data.schedule.schedules[1] || data.schedule.schedules[0]; // Monday
  if (dayOfWeek === 3) return data.schedule.schedules[2] || data.schedule.schedules[0]; // Wednesday
  if (dayOfWeek === 4) return data.schedule.schedules[3] || data.schedule.schedules[0]; // Thursday
  return data.schedule.schedules[0]; // Base schedule for other days
};

const getCurrentBlock = (schedule: any, currentTime: Date = new Date()) => {
  if (!schedule) return null;
  
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
  
  // Block type colors
  const blockColors = {
    meal: '#86efac',
    exercise: '#f472b6',
    focus: '#60a5fa',
    wakeup: '#854d0e',
    snack: '#d97706'
  };

  

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
        onBlockChange(block);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [data]);

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
                backgroundColor: currentBlock?.type ? blockColors[currentBlock.type] : '#94a3b8'
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
                  backgroundColor: blockColors[currentBlock.type]
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
                        fill={blockColors[marker.type] || markerColors[marker.type]}
                        textAnchor="middle"
                      >
                        ↓ {marker.name}
                      </text>
                      <line 
                        x1={timeToX(marker.time)}
                        y1="45"
                        x2={timeToX(marker.time)}
                        y2="50"
                        stroke={blockColors[marker.type] || markerColors[marker.type]}
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
                        fill={blockColors[block.type]}
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

  const blockColors = {
    meal: '#86efac',
    exercise: '#f472b6',
    focus: '#60a5fa'
  };

  const markerColors = {
    wakeup: '#854d0e',
    snack: '#d97706'
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
                fill={markerColors[marker.type]}
                textAnchor="middle"
              >
                ↓ {marker.name}
              </text>
              <line 
                x1={timeToX(marker.time)}
                y1="60"
                x2={timeToX(marker.time)}
                y2="70"
                stroke={markerColors[marker.type]}
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
                fill={blockColors[block.type]}
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

const Button = ({ className = "", disabled = false, children, ...props }) => {
  return (
    <button
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md 
        text-sm font-medium transition-colors focus-visible:outline-none 
        focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 
        disabled:pointer-events-none disabled:opacity-50 
        bg-gray-900 text-gray-50 hover:bg-gray-900/90 
        h-10 px-4 py-2 ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

const Input = ({ type = "text", className = "", ...props }) => {
  if (type === "range") {
    return (
      <input
        type="range"
        className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer 
          [&::-webkit-slider-thumb]:appearance-none 
          [&::-webkit-slider-thumb]:w-4 
          [&::-webkit-slider-thumb]:h-4 
          [&::-webkit-slider-thumb]:bg-blue-500 
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:cursor-pointer
          ${className}`}
        {...props}
      />
    );
  }
  
  return (
    <input
      type={type}
      className={`flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm 
        ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium 
        placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 
        focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed 
        disabled:opacity-50 ${className}`}
      {...props}
    />
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

  useEffect(syncComponent(storage, {
    'schedule': setScheduleData,
    'tracker': setLogs,
  }), [storage]);

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
    const schedule = getCurrentDaySchedule(scheduleData);
    const marker = getCurrentMarker(schedule);

    if (marker) {
      // Marker events are instantaneous, so they're always "after"
      setCurrentActivity(marker.type);
      setActivityTiming('after');
    } else if (block?.type) {
      setCurrentActivity(block.type);
      // For blocks, we default to "after" during the block
      setActivityTiming('after');
    } else {
      // If we're between blocks, look for the next block or marker
      const now = new Date();
      const nextBlock = schedule?.timeBlocks.find(b => {
        const startTime = timeStringToDate(b.start);
        return startTime > now;
      });
      const nextMarker = schedule?.markers?.find(m => {
        const markerTime = timeStringToDate(m.time);
        return markerTime > now;
      });

      if (nextMarker && (!nextBlock || timeStringToDate(nextMarker.time) < timeStringToDate(nextBlock.start))) {
        setCurrentActivity(nextMarker.type);
        setActivityTiming('before');
      } else if (nextBlock) {
        setCurrentActivity(nextBlock.type);
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

    if (!logs) {
      let retries = 0;
      const maxRetries = 3;
      const retryInterval = 1000; // 1 second
      const waitForLogs = () => {
        if (logs) return;
        if (retries < maxRetries) {
          retries++;
          setTimeout(waitForLogs, retryInterval);
        } else {
          console.warn('Cannot update logs. Logs failed to load after multiple retries.');
          return;
        }
      };
      waitForLogs();
      return;
    }
    
    let updatedLogs;
    if (editingLog) {
      updatedLogs = logs.map(log => 
        log.timestamp === editingLog.timestamp ? newLog : log
      );

    } else {
      updatedLogs = [newLog, ...logs];

    }

    setLogs(updatedLogs);
    try {
      storage.setItem(storageKeys.logs, updatedLogs);
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
  };

  const deleteLog = async (timestamp) => {
    try {
      setLogs(prevLogs => {
        const logToDelete = prevLogs.find(log => log.timestamp === timestamp);
        const updatedLogs = prevLogs.filter(log => log.timestamp !== timestamp);
        storage.setItem(storageKeys.logs, JSON.stringify(updatedLogs));
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
        <CurrentActivity data={{ schedule: scheduleData }} onBlockChange={handleBlockChange} />
        
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
                        onChange={(e) => setCurrentActivity(e.target.value)}
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
