// Indian States and Union Territories with Districts
// This is a basic structure - you can expand with more districts and cities

export const indianStates = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];

// Districts by State (Sample - expand as needed)
export const districtsByState = {
  'Delhi': [
    'Central Delhi',
    'East Delhi',
    'New Delhi',
    'North Delhi',
    'North East Delhi',
    'North West Delhi',
    'South Delhi',
    'South East Delhi',
    'South West Delhi',
    'West Delhi',
  ],
  'Maharashtra': [
    'Mumbai',
    'Pune',
    'Nagpur',
    'Nashik',
    'Aurangabad',
    'Thane',
    'Solapur',
    'Kolhapur',
    'Amravati',
    'Sangli',
  ],
  'Karnataka': [
    'Bangalore Urban',
    'Bangalore Rural',
    'Mysore',
    'Mangalore',
    'Hubli',
    'Belgaum',
    'Gulbarga',
    'Davangere',
    'Bellary',
    'Bijapur',
  ],
  'Tamil Nadu': [
    'Chennai',
    'Coimbatore',
    'Madurai',
    'Tiruchirappalli',
    'Salem',
    'Tirunelveli',
    'Erode',
    'Vellore',
    'Dindigul',
    'Thanjavur',
  ],
  'West Bengal': [
    'Kolkata',
    'Howrah',
    'North 24 Parganas',
    'South 24 Parganas',
    'Hooghly',
    'Bardhaman',
    'Murshidabad',
    'Nadia',
    'Birbhum',
    'Bankura',
  ],
  'Gujarat': [
    'Ahmedabad',
    'Surat',
    'Vadodara',
    'Rajkot',
    'Bhavnagar',
    'Jamnagar',
    'Gandhinagar',
    'Anand',
    'Bharuch',
    'Mehsana',
  ],
  'Rajasthan': [
    'Jaipur',
    'Jodhpur',
    'Kota',
    'Bikaner',
    'Ajmer',
    'Udaipur',
    'Bhilwara',
    'Alwar',
    'Sikar',
    'Bharatpur',
  ],
  'Uttar Pradesh': [
    'Lucknow',
    'Kanpur',
    'Agra',
    'Varanasi',
    'Meerut',
    'Allahabad',
    'Bareilly',
    'Gorakhpur',
    'Aligarh',
    'Moradabad',
  ],
  'Telangana': [
    'Hyderabad',
    'Warangal',
    'Nizamabad',
    'Karimnagar',
    'Khammam',
    'Mahbubnagar',
    'Medak',
    'Nalgonda',
    'Adilabad',
    'Rangareddy',
  ],
  'Kerala': [
    'Thiruvananthapuram',
    'Kochi',
    'Kozhikode',
    'Thrissur',
    'Kollam',
    'Alappuzha',
    'Kannur',
    'Kottayam',
    'Palakkad',
    'Malappuram',
  ],
  'Punjab': [
    'Amritsar',
    'Ludhiana',
    'Jalandhar',
    'Patiala',
    'Bathinda',
    'Mohali',
    'Hoshiarpur',
    'Firozpur',
    'Sangrur',
    'Mansa',
  ],
  'Haryana': [
    'Gurgaon',
    'Faridabad',
    'Panipat',
    'Ambala',
    'Yamunanagar',
    'Rohtak',
    'Hisar',
    'Karnal',
    'Sonipat',
    'Panchkula',
  ],
  'Chandigarh': [
    'Chandigarh',
  ],
  'Odisha': [
    'Bhubaneswar',
    'Cuttack',
    'Rourkela',
    'Berhampur',
    'Sambalpur',
    'Puri',
    'Balasore',
    'Bhadrak',
    'Baripada',
    'Jharsuguda',
  ],
  'Madhya Pradesh': [
    'Bhopal',
    'Indore',
    'Gwalior',
    'Jabalpur',
    'Ujjain',
    'Raipur',
    'Dewas',
    'Sagar',
    'Satna',
    'Ratlam',
  ],
  'Bihar': [
    'Patna',
    'Gaya',
    'Bhagalpur',
    'Muzaffarpur',
    'Purnia',
    'Darbhanga',
    'Munger',
    'Bihar Sharif',
    'Arrah',
    'Katihar',
  ],
  'Assam': [
    'Guwahati',
    'Silchar',
    'Dibrugarh',
    'Jorhat',
    'Nagaon',
    'Tinsukia',
    'Tezpur',
    'Bongaigaon',
    'Dhubri',
    'Goalpara',
  ],
  'Jharkhand': [
    'Ranchi',
    'Jamshedpur',
    'Dhanbad',
    'Bokaro',
    'Hazaribagh',
    'Deoghar',
    'Giridih',
    'Ramgarh',
    'Chatra',
    'Koderma',
  ],
  'Uttarakhand': [
    'Dehradun',
    'Haridwar',
    'Roorkee',
    'Haldwani',
    'Rudrapur',
    'Kashipur',
    'Rishikesh',
    'Mussoorie',
    'Nainital',
    'Almora',
  ],
  'Himachal Pradesh': [
    'Shimla',
    'Mandi',
    'Solan',
    'Dharamshala',
    'Bilaspur',
    'Kullu',
    'Chamba',
    'Hamirpur',
    'Una',
    'Kangra',
  ],
  'Goa': [
    'North Goa',
    'South Goa',
  ],
  'Puducherry': [
    'Puducherry',
    'Karaikal',
    'Mahe',
    'Yanam',
  ],
};

// Popular cities by state (for search suggestions)
export const popularCities = {
  'Delhi': ['New Delhi', 'Delhi', 'Noida', 'Gurgaon', 'Faridabad', 'Ghaziabad'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Thane', 'Solapur', 'Kolhapur'],
  'Karnataka': ['Bangalore', 'Mysore', 'Mangalore', 'Hubli', 'Belgaum', 'Gulbarga'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Kharagpur'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Meerut', 'Allahabad'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam'],
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam'],
  'Punjab': ['Amritsar', 'Ludhiana', 'Jalandhar', 'Patiala', 'Bathinda'],
  'Haryana': ['Gurgaon', 'Faridabad', 'Panipat', 'Ambala', 'Rohtak'],
  'Chandigarh': ['Chandigarh', 'Sector 15', 'Sector 17', 'Sector 22', 'Sector 35'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain'],
  'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia'],
};

// Sample areas by city (expand as needed)
export const areasByCity = {
  'Delhi': ['Connaught Place', 'Dwarka', 'Rohini', 'Saket', 'Vasant Kunj', 'Laxmi Nagar', 'Karol Bagh', 'Rajouri Garden'],
  'Mumbai': ['Andheri', 'Bandra', 'Colaba', 'Juhu', 'Powai', 'Worli', 'Bandra Kurla Complex', 'Goregaon'],
  'Bangalore': ['Koramangala', 'Indiranagar', 'Whitefield', 'HSR Layout', 'Jayanagar', 'Marathahalli', 'BTM Layout', 'Electronic City'],
  'Chennai': ['T. Nagar', 'Adyar', 'Anna Nagar', 'Velachery', 'Mylapore', 'Porur', 'OMR', 'Tambaram'],
  'Kolkata': ['Salt Lake', 'Park Street', 'New Town', 'Howrah', 'Ballygunge', 'Dum Dum', 'Behala', 'Rajarhat'],
  'Hyderabad': ['Banjara Hills', 'Jubilee Hills', 'Gachibowli', 'HITEC City', 'Madhapur', 'Kondapur', 'Secunderabad', 'Himayatnagar'],
  'Pune': ['Koregaon Park', 'Viman Nagar', 'Hinjewadi', 'Kothrud', 'Aundh', 'Baner', 'Wakad', 'Hadapsar'],
  'Chandigarh': ['Sector 15', 'Sector 17', 'Sector 22', 'Sector 35', 'Sector 43', 'Sector 8', 'Sector 9', 'Sector 10'],
};

/**
 * Get districts for a state
 */
export const getDistrictsForState = (state) => {
  return districtsByState[state] || [];
};

/**
 * Get popular cities for a state
 */
export const getCitiesForState = (state) => {
  return popularCities[state] || [];
};

/**
 * Get areas for a city
 */
export const getAreasForCity = (city) => {
  return areasByCity[city] || [];
};

/**
 * Search cities by query (partial match)
 */
export const searchCities = (query, state = null) => {
  const queryLower = query.toLowerCase();
  let cities = [];
  
  if (state && popularCities[state]) {
    cities = popularCities[state];
  } else {
    // Search across all states
    Object.values(popularCities).forEach(stateCities => {
      cities.push(...stateCities);
    });
  }
  
  return cities.filter(city => 
    city.toLowerCase().includes(queryLower)
  ).slice(0, 10); // Limit to 10 results
};

/**
 * Search areas by query (partial match)
 */
export const searchAreas = (query, city = null) => {
  const queryLower = query.toLowerCase();
  let areas = [];
  
  if (city && areasByCity[city]) {
    areas = areasByCity[city];
  } else {
    // Search across all cities
    Object.values(areasByCity).forEach(cityAreas => {
      areas.push(...cityAreas);
    });
  }
  
  return areas.filter(area => 
    area.toLowerCase().includes(queryLower)
  ).slice(0, 10); // Limit to 10 results
};





