// Alert Categories and Types Configuration

export const alertCategories = {
  weather: {
    label: '🌦 Weather Alerts',
    icon: '🌦',
    types: [
      'Heavy Rain Alert',
      'Thunderstorm Alert',
      'Heatwave Alert',
      'Cold Wave Alert',
      'Flood Warning',
      'Cyclone / Storm Alert',
      'Lightning Warning',
      'Fog / Low Visibility Alert',
      'High Wind Alert',
    ],
  },
  fire_disaster: {
    label: '🔥 Fire & Disaster Alerts',
    icon: '🔥',
    types: [
      'Fire Accident',
      'Forest Fire Alert',
      'Gas Leak Alert',
      'Building Collapse',
      'Explosion Alert',
      'Chemical Spill',
      'Industrial Accident',
    ],
  },
  emergency_safety: {
    label: '🚑 Emergency & Safety Alerts',
    icon: '🚑',
    types: [
      'Major Accident Alert',
      'Emergency Services On Site',
      'Rescue Operation in Progress',
      'Missing Person Alert',
      'Child Safety Alert',
      'Curfew / Restricted Area Alert',
      'Evacuation Notice',
    ],
  },
  traffic_transport: {
    label: '🚦 Traffic & Transport Alerts',
    icon: '🚦',
    types: [
      'Heavy Traffic',
      'Road Blocked',
      'Accident on Road',
      'Diversion in Place',
      'Metro/Bus Service Disruption',
      'Highway Closed',
      'Bridge Closed',
      'Protest / Rally Affecting Traffic',
    ],
  },
  natural_disaster: {
    label: '🌊 Natural Disaster Alerts',
    icon: '🌊',
    types: [
      'Earthquake Alert',
      'Tsunami Warning',
      'Landslide Alert',
      'Drought Warning',
      'Flash Flood Alert',
    ],
  },
  public_safety_law: {
    label: '🛡 Public Safety & Law Alerts',
    icon: '🛡',
    types: [
      'Police Advisory',
      'Crime Alert in Area',
      'Suspicious Activity',
      'Bomb Threat',
      'Security Drill',
      'Riot / Violence Alert',
    ],
  },
  health_disease: {
    label: '🏥 Health & Disease Alerts',
    icon: '🏥',
    types: [
      'Disease Outbreak Alert',
      'Dengue / Malaria Alert',
      'COVID / Flu Advisory',
      'Contaminated Water Alert',
      'Food Poisoning Warning',
    ],
  },
  utility_emergency: {
    label: '⚡ Utility Emergency Alerts',
    icon: '⚡',
    types: [
      'Power Emergency',
      'Water Contamination',
      'Gas Pipeline Issue',
      'Major Network Failure',
    ],
    note: 'Only for emergency, not planned work',
  },
  community_authority: {
    label: '📢 Community & Authority Alerts',
    icon: '📢',
    types: [
      'Government Advisory',
      'School/College Closed',
      'Public Holiday Notice',
      'Exam/Postponement Alert',
      'Election Alert',
    ],
  },
};

// Get all alert types as a flat list for search
export const getAllAlertTypes = () => {
  const allTypes = [];
  Object.values(alertCategories).forEach((category) => {
    category.types.forEach((type) => {
      allTypes.push({
        category: category.label,
        type: type,
      });
    });
  });
  return allTypes;
};

// Get alert type by name
export const getAlertTypeByLabel = (label) => {
  for (const [categoryKey, category] of Object.entries(alertCategories)) {
    if (category.types.includes(label)) {
      return {
        category: categoryKey,
        categoryLabel: category.label,
        type: label,
      };
    }
  }
  return null;
};


