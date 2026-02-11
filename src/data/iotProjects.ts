// Mock data for 200 IoT projects
export interface IoTProject {
  id: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  components: string[];
  detailedComponents: Array<{
    name: string;
    quantity: number;
    description?: string;
  }>;
  workflow: string;
  applications: string[];
  imageUrl?: string;
}

// Generate 200 IoT projects
const generateProjects = (): IoTProject[] => {
  const projectTemplates = [
    {
      name: 'Smart Home Automation System',
      shortDescription: 'Automate your entire home with sensors, actuators, and a central control unit. Control lights, fans, and appliances remotely.',
      fullDescription: 'This comprehensive smart home automation system allows you to control various aspects of your home through a mobile app or web interface. The system includes motion sensors, door/window sensors, smart switches, and a central hub that connects all devices. You can create automation routines, schedule tasks, and monitor your home in real-time.',
      components: ['ESP32', 'PIR Motion Sensor', 'Door Sensor', 'Relay Module', 'Smart Switches', 'WiFi Module'],
      detailedComponents: [
        { name: 'ESP32 Development Board', quantity: 1, description: 'Main microcontroller with WiFi and Bluetooth' },
        { name: 'PIR Motion Sensor (HC-SR501)', quantity: 3, description: 'Detects motion in rooms' },
        { name: 'Magnetic Door Sensor', quantity: 5, description: 'Monitors door/window openings' },
        { name: '5V Relay Module', quantity: 8, description: 'Controls AC appliances safely' },
        { name: 'Smart Switch Module', quantity: 6, description: 'Replaces traditional switches' },
        { name: 'WiFi Module (ESP8266)', quantity: 2, description: 'Additional WiFi connectivity' },
        { name: 'Power Supply (5V, 10A)', quantity: 1, description: 'Powers all modules' },
        { name: 'Jumper Wires', quantity: 50, description: 'For connections' },
        { name: 'Breadboard', quantity: 2, description: 'For prototyping' }
      ],
      workflow: 'The ESP32 central hub receives data from all sensors via WiFi. When motion is detected or a door opens, the system processes the information and triggers appropriate actions. Users can control devices through the mobile app, which communicates with the ESP32 via WiFi. The relay modules safely control AC appliances, while smart switches provide local control.',
      applications: ['Home security', 'Energy management', 'Convenience automation', 'Remote monitoring', 'Aging-in-place support']
    },
    {
      name: 'IoT Weather Station',
      shortDescription: 'Monitor real-time weather conditions including temperature, humidity, pressure, and rainfall. Data is displayed on a web dashboard.',
      fullDescription: 'A complete weather monitoring station that collects real-time data on temperature, humidity, atmospheric pressure, wind speed, and rainfall. The data is transmitted wirelessly to a cloud platform where it can be accessed through a web dashboard or mobile app. The system includes calibration features and data logging capabilities.',
      components: ['Arduino Nano', 'DHT22 Sensor', 'BMP280 Sensor', 'Rain Sensor', 'LCD Display', 'LoRa Module'],
      detailedComponents: [
        { name: 'Arduino Nano', quantity: 1, description: 'Main microcontroller' },
        { name: 'DHT22 Temperature/Humidity Sensor', quantity: 1, description: 'Measures temperature and humidity' },
        { name: 'BMP280 Pressure Sensor', quantity: 1, description: 'Measures atmospheric pressure' },
        { name: 'Rain Sensor Module', quantity: 1, description: 'Detects rainfall' },
        { name: 'Anemometer', quantity: 1, description: 'Measures wind speed' },
        { name: '16x2 LCD Display', quantity: 1, description: 'Shows current readings' },
        { name: 'LoRa Module (SX1278)', quantity: 1, description: 'Long-range wireless communication' },
        { name: 'Solar Panel (10W)', quantity: 1, description: 'Powers the station' },
        { name: 'Battery (18650, 3.7V)', quantity: 2, description: 'Stores solar energy' }
      ],
      workflow: 'Sensors continuously measure weather parameters. The Arduino Nano processes the data and displays it on the LCD. Data is transmitted via LoRa to a gateway, which forwards it to a cloud platform. The cloud platform stores historical data and provides APIs for web/mobile apps. The solar panel charges the battery, ensuring continuous operation.',
      applications: ['Agricultural monitoring', 'Weather forecasting', 'Climate research', 'Outdoor event planning', 'Environmental monitoring']
    },
    {
      name: 'Smart Garden Irrigation System',
      shortDescription: 'Automatically water your plants based on soil moisture levels. Includes scheduling and remote control via mobile app.',
      fullDescription: 'An intelligent irrigation system that monitors soil moisture levels and automatically waters plants when needed. The system can be programmed with watering schedules, moisture thresholds, and zone-specific settings. It includes a mobile app for remote monitoring and control, water usage tracking, and alerts for maintenance needs.',
      components: ['ESP8266', 'Soil Moisture Sensor', 'Water Pump', 'Solenoid Valve', 'RTC Module', 'Water Flow Sensor'],
      detailedComponents: [
        { name: 'ESP8266 NodeMCU', quantity: 1, description: 'WiFi-enabled microcontroller' },
        { name: 'Soil Moisture Sensor (Capacitive)', quantity: 4, description: 'Measures soil moisture in different zones' },
        { name: '12V DC Water Pump', quantity: 1, description: 'Pumps water from reservoir' },
        { name: 'Solenoid Valve (12V)', quantity: 4, description: 'Controls water flow to zones' },
        { name: 'RTC Module (DS3231)', quantity: 1, description: 'Real-time clock for scheduling' },
        { name: 'Water Flow Sensor', quantity: 1, description: 'Measures water usage' },
        { name: 'Relay Module (4-channel)', quantity: 1, description: 'Controls pump and valves' },
        { name: '12V Power Supply', quantity: 1, description: 'Powers pump and valves' },
        { name: 'Water Level Sensor', quantity: 1, description: 'Monitors reservoir level' }
      ],
      workflow: 'Soil moisture sensors continuously monitor the moisture level in each zone. When moisture drops below the threshold, the ESP8266 activates the appropriate solenoid valve and water pump. The RTC module ensures scheduled watering occurs at set times. Water usage is tracked via the flow sensor. All data is sent to the cloud, allowing remote monitoring and control through the mobile app.',
      applications: ['Home gardening', 'Agricultural farming', 'Greenhouse management', 'Lawn care', 'Commercial landscaping']
    },
    {
      name: 'IoT Air Quality Monitor',
      shortDescription: 'Monitor indoor air quality including PM2.5, CO2, VOC, and temperature. Get alerts when air quality deteriorates.',
      fullDescription: 'A comprehensive air quality monitoring system that tracks various pollutants including particulate matter (PM2.5, PM10), carbon dioxide (CO2), volatile organic compounds (VOCs), temperature, and humidity. The device provides real-time readings, historical data, and alerts when air quality exceeds safe levels. Data can be accessed through a mobile app or web dashboard.',
      components: ['ESP32', 'PM Sensor (SDS011)', 'CO2 Sensor (MH-Z19)', 'VOC Sensor', 'OLED Display', 'Buzzer'],
      detailedComponents: [
        { name: 'ESP32 Development Board', quantity: 1, description: 'Main controller with WiFi' },
        { name: 'PM2.5/PM10 Sensor (SDS011)', quantity: 1, description: 'Measures particulate matter' },
        { name: 'CO2 Sensor (MH-Z19B)', quantity: 1, description: 'Measures carbon dioxide levels' },
        { name: 'VOC Sensor (CCS811)', quantity: 1, description: 'Detects volatile organic compounds' },
        { name: 'DHT22 Sensor', quantity: 1, description: 'Temperature and humidity' },
        { name: 'OLED Display (128x64)', quantity: 1, description: 'Shows current readings' },
        { name: 'Buzzer', quantity: 1, description: 'Alerts for poor air quality' },
        { name: 'LED Indicators', quantity: 3, description: 'Visual status indicators' },
        { name: '5V Power Supply', quantity: 1, description: 'Powers the system' }
      ],
      workflow: 'All sensors continuously sample air quality parameters. The ESP32 processes the data and displays it on the OLED screen. When pollutant levels exceed thresholds, the buzzer sounds and LED indicators change color. Data is transmitted via WiFi to a cloud platform, which stores historical data and sends push notifications to the mobile app. The system can be integrated with air purifiers for automatic control.',
      applications: ['Home air quality monitoring', 'Office environment monitoring', 'Healthcare facilities', 'Schools and universities', 'Industrial safety']
    },
    {
      name: 'Smart Parking System',
      shortDescription: 'Monitor parking space availability in real-time. Uses ultrasonic sensors to detect vehicle presence and displays status on a web dashboard.',
      fullDescription: 'An intelligent parking management system that uses ultrasonic sensors to detect vehicle presence in parking spaces. The system provides real-time parking availability, occupancy statistics, and can guide drivers to available spots. Data is displayed on LED boards and accessible through a mobile app. The system can also handle parking payments and reservations.',
      components: ['Arduino Mega', 'Ultrasonic Sensor (HC-SR04)', 'LED Matrix Display', 'RFID Reader', 'Servo Motor', 'LoRa Module'],
      detailedComponents: [
        { name: 'Arduino Mega 2560', quantity: 1, description: 'Main controller with more I/O pins' },
        { name: 'Ultrasonic Sensor (HC-SR04)', quantity: 20, description: 'Detects vehicle presence in each spot' },
        { name: 'LED Matrix Display (32x8)', quantity: 2, description: 'Shows availability count' },
        { name: 'RFID Reader (RC522)', quantity: 2, description: 'For access control and payments' },
        { name: 'Servo Motor (SG90)', quantity: 2, description: 'Controls barrier gates' },
        { name: 'LoRa Module', quantity: 1, description: 'Wireless communication' },
        { name: 'ESP8266', quantity: 1, description: 'WiFi connectivity for dashboard' },
        { name: 'Power Supply (12V, 20A)', quantity: 1, description: 'Powers all components' },
        { name: 'Indicator LEDs', quantity: 20, description: 'Shows spot status (red/green)' }
      ],
      workflow: 'Ultrasonic sensors continuously monitor each parking space. When a vehicle is detected (distance < threshold), the sensor sends a signal to the Arduino. The system updates the occupancy count and displays it on LED boards. RFID readers at entry/exit gates authenticate users and control barrier servos. All data is transmitted via LoRa/WiFi to a central server, which updates the web dashboard and mobile app in real-time.',
      applications: ['Shopping malls', 'Office buildings', 'Airports', 'Hospital parking', 'Residential complexes']
    },
    {
      name: 'IoT Health Monitoring Device',
      shortDescription: 'Track vital signs including heart rate, SpO2, temperature, and activity. Data syncs to cloud for healthcare provider access.',
      fullDescription: 'A wearable health monitoring device that continuously tracks vital signs including heart rate, blood oxygen saturation (SpO2), body temperature, and physical activity. The device includes a mobile app for users to view their health data and can share data with healthcare providers. It includes alert features for abnormal readings and medication reminders.',
      components: ['ESP32', 'Heart Rate Sensor (MAX30102)', 'Temperature Sensor', 'Accelerometer', 'OLED Display', 'Battery'],
      detailedComponents: [
        { name: 'ESP32 Development Board', quantity: 1, description: 'Low-power microcontroller with Bluetooth' },
        { name: 'Heart Rate & SpO2 Sensor (MAX30102)', quantity: 1, description: 'Measures heart rate and blood oxygen' },
        { name: 'Temperature Sensor (MLX90614)', quantity: 1, description: 'Non-contact body temperature' },
        { name: 'Accelerometer (MPU6050)', quantity: 1, description: 'Tracks physical activity' },
        { name: 'OLED Display (128x64)', quantity: 1, description: 'Shows vital signs' },
        { name: 'Lithium Battery (500mAh)', quantity: 1, description: 'Power source' },
        { name: 'Charging Module (TP4056)', quantity: 1, description: 'Battery charging' },
        { name: 'Vibration Motor', quantity: 1, description: 'Haptic feedback and alerts' },
        { name: 'Button', quantity: 2, description: 'User controls' }
      ],
      workflow: 'Sensors continuously collect health data. The ESP32 processes the data and displays it on the OLED screen. Data is transmitted via Bluetooth to a mobile app, which stores it locally and syncs to a cloud platform. Healthcare providers can access the data through a secure portal. When abnormal readings are detected, the device vibrates and the app sends notifications. The device operates in low-power mode to maximize battery life.',
      applications: ['Personal health tracking', 'Remote patient monitoring', 'Fitness tracking', 'Elderly care', 'Post-surgery monitoring']
    },
    {
      name: 'Smart Waste Management System',
      shortDescription: 'Monitor waste bin fill levels using ultrasonic sensors. Optimize collection routes and reduce operational costs.',
      fullDescription: 'An intelligent waste management system that monitors the fill level of waste bins using ultrasonic sensors. The system provides real-time data on bin status, optimizes collection routes, and sends alerts when bins need to be emptied. This reduces unnecessary collection trips and improves operational efficiency.',
      components: ['ESP8266', 'Ultrasonic Sensor', 'GPS Module', 'Weight Sensor', 'LoRa Module', 'Solar Panel'],
      detailedComponents: [
        { name: 'ESP8266 NodeMCU', quantity: 1, description: 'WiFi-enabled controller' },
        { name: 'Ultrasonic Sensor (HC-SR04)', quantity: 1, description: 'Measures waste level' },
        { name: 'GPS Module (NEO-6M)', quantity: 1, description: 'Tracks bin location' },
        { name: 'Load Cell (HX711)', quantity: 1, description: 'Measures waste weight' },
        { name: 'LoRa Module', quantity: 1, description: 'Long-range communication' },
        { name: 'Solar Panel (5W)', quantity: 1, description: 'Powers the system' },
        { name: 'Battery (18650)', quantity: 2, description: 'Energy storage' },
        { name: 'LED Indicator', quantity: 1, description: 'Status indicator' },
        { name: 'Temperature Sensor', quantity: 1, description: 'Monitors bin temperature' }
      ],
      workflow: 'The ultrasonic sensor measures the distance to the waste surface, calculating the fill level. The load cell provides weight data. GPS tracks the bin location. When the fill level exceeds 80%, the system sends an alert via LoRa to a central server. The server aggregates data from all bins and optimizes collection routes. Collection trucks receive optimized routes through a mobile app. Solar panels charge the battery for continuous operation.',
      applications: ['Municipal waste management', 'Commercial waste collection', 'Recycling programs', 'Smart cities', 'Campus waste management']
    },
    {
      name: 'IoT Water Leak Detection System',
      shortDescription: 'Detect water leaks in your home using moisture sensors. Get instant alerts on your phone and automatically shut off water supply.',
      fullDescription: 'A comprehensive water leak detection system that monitors your home for water leaks using strategically placed moisture sensors. When a leak is detected, the system sends instant alerts to your phone and can automatically shut off the water supply using a motorized valve. The system includes zone monitoring and can track water usage patterns.',
      components: ['ESP32', 'Water Leak Sensor', 'Solenoid Valve', 'Flow Sensor', 'Buzzer', 'LED Strip'],
      detailedComponents: [
        { name: 'ESP32 Development Board', quantity: 1, description: 'Main controller' },
        { name: 'Water Leak Sensor', quantity: 8, description: 'Detects water presence in different zones' },
        { name: 'Solenoid Valve (24V)', quantity: 1, description: 'Automatic water shutoff' },
        { name: 'Water Flow Sensor (YF-S201)', quantity: 1, description: 'Monitors water usage' },
        { name: 'Buzzer', quantity: 1, description: 'Audible alarm' },
        { name: 'LED Strip (RGB)', quantity: 1, description: 'Visual alerts' },
        { name: '24V Power Supply', quantity: 1, description: 'Powers solenoid valve' },
        { name: 'Relay Module', quantity: 1, description: 'Controls valve' },
        { name: 'Moisture Sensor (Capacitive)', quantity: 4, description: 'Additional moisture detection' }
      ],
      workflow: 'Water leak sensors are placed in areas prone to leaks (under sinks, near water heaters, etc.). When water is detected, the sensor sends a signal to the ESP32. The system immediately sounds the buzzer, activates LED alerts, and sends push notifications to your phone. If configured, the system can automatically close the solenoid valve to stop water flow. The flow sensor tracks water usage patterns and can detect unusual consumption that might indicate a leak.',
      applications: ['Home protection', 'Commercial buildings', 'Basement monitoring', 'Boat/RV protection', 'Data center protection']
    },
    {
      name: 'Smart Door Lock System',
      shortDescription: 'Keyless entry system with RFID, fingerprint, and mobile app control. Includes access logs and remote unlocking capabilities.',
      fullDescription: 'A versatile smart door lock system that supports multiple access methods including RFID cards, fingerprint scanning, PIN codes, and mobile app control. The system maintains access logs, supports multiple user profiles, and can be controlled remotely. It includes backup power and tamper detection features.',
      components: ['Arduino Uno', 'RFID Reader', 'Fingerprint Sensor', 'Keypad', 'Servo Motor', 'ESP8266'],
      detailedComponents: [
        { name: 'Arduino Uno', quantity: 1, description: 'Main controller' },
        { name: 'RFID Reader (RC522)', quantity: 1, description: 'RFID card authentication' },
        { name: 'Fingerprint Sensor (R307)', quantity: 1, description: 'Biometric authentication' },
        { name: 'Keypad (4x4)', quantity: 1, description: 'PIN entry' },
        { name: 'Servo Motor (SG90)', quantity: 1, description: 'Locks/unlocks door' },
        { name: 'ESP8266', quantity: 1, description: 'WiFi connectivity' },
        { name: 'OLED Display', quantity: 1, description: 'Shows status and instructions' },
        { name: 'Buzzer', quantity: 1, description: 'Audio feedback' },
        { name: 'Battery Backup (9V)', quantity: 1, description: 'Power backup' }
      ],
      workflow: 'Users can unlock the door using RFID cards, fingerprint, PIN code, or mobile app. The Arduino processes the authentication request and checks credentials against stored database. Upon successful authentication, the servo motor rotates to unlock the door. The ESP8266 enables remote control through a mobile app and cloud sync of access logs. All access attempts are logged with timestamp and user ID. The system includes tamper detection and sends alerts for unauthorized access attempts.',
      applications: ['Home security', 'Office access control', 'Hotel rooms', 'Apartment buildings', 'Locker systems']
    },
    {
      name: 'IoT Energy Monitor',
      shortDescription: 'Monitor electricity consumption in real-time. Track usage by appliance, set budgets, and receive alerts for high consumption.',
      fullDescription: 'A comprehensive energy monitoring system that tracks electricity consumption in real-time. The system can monitor whole-home consumption or individual appliances. It provides detailed analytics, cost calculations, and helps identify energy-wasting devices. Users can set consumption budgets and receive alerts when usage exceeds limits.',
      components: ['ESP32', 'Current Sensor (ACS712)', 'Voltage Sensor', 'OLED Display', 'SD Card Module', 'Relay Module'],
      detailedComponents: [
        { name: 'ESP32 Development Board', quantity: 1, description: 'Main controller' },
        { name: 'Current Sensor (ACS712, 30A)', quantity: 1, description: 'Measures AC current' },
        { name: 'Voltage Sensor (ZMPT101B)', quantity: 1, description: 'Measures AC voltage' },
        { name: 'OLED Display (128x64)', quantity: 1, description: 'Shows power consumption' },
        { name: 'SD Card Module', quantity: 1, description: 'Data logging' },
        { name: 'Relay Module (4-channel)', quantity: 1, description: 'Control appliances' },
        { name: 'CT Clamp Sensor', quantity: 4, description: 'Non-invasive current sensing' },
        { name: 'Real-time Clock (RTC)', quantity: 1, description: 'Timestamp for data' },
        { name: '5V Power Supply', quantity: 1, description: 'Powers the system' }
      ],
      workflow: 'Current and voltage sensors measure the electrical parameters. The ESP32 calculates real power, apparent power, and energy consumption. Data is displayed on the OLED screen and logged to SD card. The system transmits data via WiFi to a cloud platform, where it is stored and analyzed. The mobile app provides detailed charts, cost calculations, and consumption trends. CT clamp sensors can monitor individual circuits non-invasively. When consumption exceeds set limits, alerts are sent to the user.',
      applications: ['Home energy monitoring', 'Commercial energy management', 'Solar system monitoring', 'Appliance efficiency analysis', 'Cost optimization']
    }
  ];

  const projects: IoTProject[] = [];
  const projectNames = [
    'Smart', 'IoT', 'Automated', 'Intelligent', 'Connected', 'Wireless', 'Remote', 'Digital', 'Advanced', 'Modern',
    'Home', 'Industrial', 'Commercial', 'Agricultural', 'Healthcare', 'Environmental', 'Security', 'Energy', 'Transport', 'Communication'
  ];
  const projectTypes = [
    'Monitoring System', 'Control System', 'Automation System', 'Tracking Device', 'Sensor Network',
    'Management System', 'Detection System', 'Analytics Platform', 'Alert System', 'Optimization System'
  ];
  const components = [
    'ESP32', 'ESP8266', 'Arduino Uno', 'Arduino Nano', 'Raspberry Pi', 'NodeMCU', 'STM32',
    'PIR Sensor', 'Ultrasonic Sensor', 'Temperature Sensor', 'Humidity Sensor', 'Pressure Sensor',
    'Motion Sensor', 'Light Sensor', 'Sound Sensor', 'Gas Sensor', 'Proximity Sensor',
    'Relay Module', 'Motor Driver', 'Servo Motor', 'Stepper Motor', 'DC Motor',
    'LED Strip', 'OLED Display', 'LCD Display', '7-Segment Display',
    'WiFi Module', 'Bluetooth Module', 'LoRa Module', 'GPS Module', 'GSM Module',
    'RFID Reader', 'Fingerprint Sensor', 'Keypad', 'Button', 'Rotary Encoder',
    'Buzzer', 'Speaker', 'Microphone', 'Camera Module', 'SD Card Module',
    'Real-time Clock', 'Battery', 'Solar Panel', 'Power Supply', 'Voltage Regulator'
  ];

  // Generate 200 projects
  for (let i = 0; i < 200; i++) {
    if (i < projectTemplates.length) {
      // Use template projects for first 10
      projects.push({
        ...projectTemplates[i],
        id: `project-${i + 1}`,
        imageUrl: `https://picsum.photos/400/300?random=${i + 1}`
      });
    } else {
      // Generate random projects for the rest
      const nameIndex = Math.floor(Math.random() * projectNames.length);
      const typeIndex = Math.floor(Math.random() * projectTypes.length);
      const name = `${projectNames[nameIndex]} ${projectTypes[typeIndex]} ${i + 1}`;
      
      const numComponents = Math.floor(Math.random() * 6) + 4; // 4-9 components
      const selectedComponents = [];
      const selectedDetailedComponents = [];
      const usedIndices = new Set<number>();
      
      for (let j = 0; j < numComponents; j++) {
        let compIndex;
        do {
          compIndex = Math.floor(Math.random() * components.length);
        } while (usedIndices.has(compIndex));
        usedIndices.add(compIndex);
        
        const compName = components[compIndex];
        selectedComponents.push(compName);
        selectedDetailedComponents.push({
          name: compName,
          quantity: Math.floor(Math.random() * 3) + 1,
          description: `${compName} for ${name.toLowerCase()}`
        });
      }

      projects.push({
        id: `project-${i + 1}`,
        name,
        shortDescription: `An innovative ${name.toLowerCase()} that provides advanced monitoring and control capabilities. Perfect for modern applications requiring real-time data and remote access.`,
        fullDescription: `This comprehensive ${name.toLowerCase()} offers a complete solution for monitoring, control, and automation. The system integrates multiple sensors and actuators to provide real-time data and remote control capabilities. It features wireless connectivity, cloud integration, and a user-friendly mobile application. The system is designed for reliability, scalability, and ease of use.`,
        components: selectedComponents,
        detailedComponents: selectedDetailedComponents,
        workflow: `The system collects data from various sensors and processes it using the microcontroller. Processed data is transmitted wirelessly to a cloud platform where it can be accessed through web and mobile applications. Users can monitor real-time data, set automation rules, and receive alerts. The system supports remote control of actuators and can be integrated with other smart devices.`,
        applications: [
          'Home automation',
          'Industrial monitoring',
          'Commercial applications',
          'Research and development',
          'Educational projects'
        ],
        imageUrl: `https://picsum.photos/400/300?random=${i + 1}`
      });
    }
  }

  return projects;
};

export const iotProjects: IoTProject[] = generateProjects();

// WhatsApp number - replace with actual number
// Format: country code + number (e.g., 911234567890 for India)
export const WHATSAPP_NUMBER = '9149559393';

// WhatsApp message template
export const WHATSAPP_MESSAGE_TEMPLATE = (name: string, orderId: string) => 
  `Service Request from ${name} OrderID ${orderId}`;

