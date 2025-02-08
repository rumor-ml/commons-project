import { StorageAdapter } from '../javascripts/component-storage';
import { useState, useEffect } from 'react';

interface ScheduleProps {
  storage: StorageAdapter;
  onEvent: (event: any) => void;
}

const Schedule = ({ storage }: ScheduleProps) => {
  const [data, setData] = useState<any>(null);

  useEffect(syncComponent(storage, {
    'schedule': setData,
  }), [storage]);
  
  if (!data?.schedules?.[0]?.timeBlocks) {
    console.warn('Schedule rendered without required data');
    return <div>Loading schedule data...</div>;
  }

  const timeToX = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    const startHours = 7.75;
    const totalMinutes = (hours - startHours) * 60 + minutes;
    return 50 + (totalMinutes / 915) * 900;
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

  const scheduleHeight = 130;
  const totalHeight = 650;

  return (
    <div className="w-full h-full bg-white p-4 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 component" data-testid="schedule-title">Weekly Schedule</h2>
      <svg className="w-full h-full" data-testid="schedule-svg" viewBox={`0 0 1000 ${totalHeight}`}>
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

        {/* Background with subtle grid */}
        <rect width="1000" height={totalHeight} fill="#f8fafc" />
        
        {/* Time Scale with improved visibility */}
        {data.timeRange.majorTicks.map((time) => (
          <g key={time}>
            <line 
              x1={timeToX(time)} 
              y1={40} 
              x2={timeToX(time)} 
              y2={520} 
              stroke="#e2e8f0" 
              strokeWidth="1"
              strokeDasharray="4,4"
            />
            <text 
              x={timeToX(time)} 
              y={35} 
              fill="#475569" 
              fontSize="11" 
              textAnchor="middle"
              fontFamily="monospace"
            >
              {time}
            </text>
          </g>
        ))}

        {/* Schedules with improved spacing */}
        {data.schedules.map((schedule, index) => (
          <g key={schedule.name} transform={`translate(0, ${60 + index * scheduleHeight})`}>
            {/* Day label with clear hierarchy */}
            <text 
              x="10" 
              y="15" 
              fontSize="13" 
              fontWeight="600" 
              fill="#1e293b"
              className="font-medium"
            >
              {schedule.name}
            </text>

            {/* Timeline base */}
            <line x1="50" y1="35" x2="950" y2="35" stroke="#334155" strokeWidth="1"/>

            {/* Transition periods with improved patterns */}
            {schedule.transitions?.map((transition, i) => {
              const x = timeToX(transition.start);
              const width = (transition.duration / 915) * 900;
              return (
                <rect 
                  key={i}
                  x={x}
                  y="45"
                  width={width}
                  height="40"
                  fill={`url(#${transition.type}Pattern)`}
                  opacity="0.2"
                />
              );
            })}

            {/* Sleep indicator */}
            <text x="955" y="50" fontSize="11" fill="#475569">↓ Sleep</text>
            <line x1="950" y1="40" x2="950" y2="65" stroke="#475569" strokeWidth="2"/>

            {/* Event markers with improved visibility */}
            {schedule.markers?.map((marker, i) => (
              <g key={i}>
                <text 
                  x={timeToX(marker.time)} 
                  y="30" 
                  fontSize="11" 
                  fill={markerColors[marker.type]}
                  textAnchor="middle"
                >
                  ↓ {marker.name}
                </text>
                <line 
                  x1={timeToX(marker.time)}
                  y1="35"
                  x2={timeToX(marker.time)}
                  y2="45"
                  stroke={markerColors[marker.type]}
                  strokeWidth="2"
                />
              </g>
            ))}

            {/* Time blocks with hover effects */}
            {schedule.timeBlocks.map((block, i) => {
              const x = timeToX(block.start);
              const width = (block.duration / 915) * 900;
              
              return (
                <g key={i} className="hover:opacity-90">
                  <rect 
                    x={x}
                    y="45"
                    width={width}
                    height="40"
                    fill={blockColors[block.type]}
                    rx="6"
                    data-testid="time-block"
                    data-block-type={block.type}
                    data-time={block.start}
                    className="transition-opacity duration-200 component"
                  />
                  <text 
                    x={x + 5}
                    y="68"
                    fontSize="11"
                    fill="#000000"
                    className="font-medium"
                  >
                    {block.name} ({block.start})
                  </text>
                </g>
              );
            })}
          </g>
        ))}

        <g transform="translate(50, 580)" data-testid="schedule-legend">
          <text x="0" y="-10" fontSize="12" fontWeight="600" fill="#475569" className="component">Legend</text>
          {Object.entries({
            "Wake-up": "wakeup",
            "Meals": "meal",
            "Exercise": "exercise",
            "Focus (90min)": "focus"
          }).map(([label, type], i) => (
            <g key={label} transform={`translate(${i * 140}, 20)`}>
              {type === "wakeup" ? (
                <>
                  <line x1="0" y1="0" x2="0" y2="15" stroke={markerColors[type]} strokeWidth="2"/>
                  <text x="20" y="12" fontSize="12">{label}</text>
                </>
              ) : (
                <>
                  <rect width="15" height="15" fill={blockColors[type]} rx="2"/>
                  <text x="25" y="12" fontSize="12">{label}</text>
                </>
              )}
            </g>
          ))}
          <g transform="translate(560, 20)">
            <line x1="0" y1="0" x2="0" y2="15" stroke={markerColors.snack} strokeWidth="2"/>
            <text x="20" y="12" fontSize="12">Energy Snack</text>
          </g>
          <g transform="translate(700, 20)">
            <rect width="15" height="15" fill="url(#recoveryPattern)" opacity="0.15"/>
            <text x="25" y="12" fontSize="12">Recovery</text>
          </g>
          <g transform="translate(820, 20)">
            <rect width="15" height="15" fill="url(#transitionPattern)" opacity="0.15"/>
            <text x="25" y="12" fontSize="12">Transition</text>
          </g>
        </g>
      </svg>
    </div>
  );
};

export default Schedule;
