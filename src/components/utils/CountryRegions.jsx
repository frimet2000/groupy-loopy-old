// Country to regions mapping
export const countryRegions = {
  israel: {
    regions: ['north', 'center', 'south', 'jerusalem', 'negev', 'eilat'],
    default_center: [31.5, 34.75]
  },
  usa: {
    regions: ['northeast', 'southeast', 'midwest', 'southwest', 'west', 'pacific_northwest', 'rocky_mountains', 'great_plains'],
    default_center: [39.8283, -98.5795]
  },
  italy: {
    regions: ['northern', 'central', 'southern', 'sicily', 'sardinia', 'tuscany', 'lombardy', 'veneto'],
    default_center: [41.8719, 12.5674]
  },
  spain: {
    regions: ['andalusia', 'catalonia', 'madrid', 'valencia', 'basque_country', 'galicia', 'canary_islands', 'balearic_islands'],
    default_center: [40.4637, -3.7492]
  },
  france: {
    regions: ['ile_de_france', 'provence', 'brittany', 'normandy', 'alps', 'pyrenees', 'corsica', 'burgundy'],
    default_center: [46.2276, 2.2137]
  },
  germany: {
    regions: ['bavaria', 'berlin', 'baden_wurttemberg', 'north_rhine_westphalia', 'saxony', 'hesse', 'rhineland_palatinate', 'lower_saxony'],
    default_center: [51.1657, 10.4515]
  },
  uk: {
    regions: ['england_south', 'england_north', 'scotland', 'wales', 'northern_ireland', 'london', 'lake_district', 'peak_district'],
    default_center: [55.3781, -3.4360]
  },
  japan: {
    regions: ['hokkaido', 'tohoku', 'kanto', 'chubu', 'kansai', 'chugoku', 'shikoku', 'kyushu'],
    default_center: [36.2048, 138.2529]
  },
  australia: {
    regions: ['new_south_wales', 'victoria', 'queensland', 'western_australia', 'south_australia', 'tasmania', 'northern_territory'],
    default_center: [-25.2744, 133.7751]
  },
  canada: {
    regions: ['british_columbia', 'alberta', 'ontario', 'quebec', 'maritime_provinces', 'yukon', 'northwest_territories', 'nunavut'],
    default_center: [56.1304, -106.3468]
  },
  switzerland: {
    regions: ['valais', 'graubunden', 'bern', 'zurich', 'ticino', 'central_switzerland', 'eastern_switzerland', 'western_switzerland'],
    default_center: [46.8182, 8.2275]
  },
  austria: {
    regions: ['tyrol', 'salzburg', 'vienna', 'upper_austria', 'lower_austria', 'styria', 'carinthia', 'vorarlberg'],
    default_center: [47.5162, 14.5501]
  },
  new_zealand: {
    regions: ['north_island', 'south_island', 'auckland', 'canterbury', 'otago', 'wellington', 'marlborough', 'west_coast'],
    default_center: [-40.9006, 174.8860]
  },
  norway: {
    regions: ['eastern', 'western', 'southern', 'central', 'northern', 'lofoten', 'fjord_norway', 'nordland'],
    default_center: [60.4720, 8.4689]
  },
  sweden: {
    regions: ['stockholm', 'goteborg', 'malmo', 'norrland', 'svealand', 'gotaland', 'lapland', 'dalarna'],
    default_center: [60.1282, 18.6435]
  },
  greece: {
    regions: ['attica', 'crete', 'peloponnese', 'thessaly', 'macedonia', 'epirus', 'aegean_islands', 'ionian_islands'],
    default_center: [39.0742, 21.8243]
  },
  portugal: {
    regions: ['lisbon', 'porto', 'algarve', 'madeira', 'azores', 'alentejo', 'centro', 'norte'],
    default_center: [39.3999, -8.2245]
  },
  netherlands: {
    regions: ['north_holland', 'south_holland', 'utrecht', 'gelderland', 'limburg', 'north_brabant', 'friesland', 'groningen'],
    default_center: [52.1326, 5.2913]
  },
  belgium: {
    regions: ['flanders', 'wallonia', 'brussels', 'antwerp', 'limburg', 'west_flanders', 'east_flanders', 'hainaut'],
    default_center: [50.5039, 4.4699]
  },
  denmark: {
    regions: ['zealand', 'jutland', 'funen', 'bornholm', 'copenhagen', 'aarhus', 'odense', 'aalborg'],
    default_center: [56.2639, 9.5018]
  },
  ireland: {
    regions: ['leinster', 'munster', 'connacht', 'ulster', 'dublin', 'cork', 'galway', 'kerry'],
    default_center: [53.4129, -8.2439]
  },
  iceland: {
    regions: ['reykjavik', 'south', 'east', 'north', 'west', 'westfjords', 'highlands', 'golden_circle'],
    default_center: [64.9631, -19.0208]
  },
  croatia: {
    regions: ['istria', 'dalmatia', 'zagreb', 'slavonia', 'kvarner', 'dubrovnik', 'split', 'zadar'],
    default_center: [45.1, 15.2]
  },
  poland: {
    regions: ['warsaw', 'krakow', 'gdansk', 'wroclaw', 'poznan', 'zakopane', 'masuria', 'silesia'],
    default_center: [51.9194, 19.1451]
  },
  czech_republic: {
    regions: ['prague', 'bohemia', 'moravia', 'south_bohemia', 'west_bohemia', 'north_bohemia', 'east_bohemia', 'south_moravia'],
    default_center: [49.8175, 15.4730]
  },
  thailand: {
    regions: ['bangkok', 'north', 'northeast', 'central', 'east', 'south', 'islands', 'chiang_mai'],
    default_center: [15.8700, 100.9925]
  },
  indonesia: {
    regions: ['bali', 'java', 'sumatra', 'sulawesi', 'kalimantan', 'papua', 'lombok', 'komodo'],
    default_center: [-0.7893, 113.9213]
  },
  malaysia: {
    regions: ['kuala_lumpur', 'penang', 'sabah', 'sarawak', 'johor', 'melaka', 'langkawi', 'pahang'],
    default_center: [4.2105, 101.9758]
  },
  vietnam: {
    regions: ['hanoi', 'ho_chi_minh', 'halong_bay', 'hoi_an', 'da_nang', 'hue', 'sapa', 'mekong_delta'],
    default_center: [14.0583, 108.2772]
  },
  south_korea: {
    regions: ['seoul', 'busan', 'jeju', 'gyeonggi', 'gangwon', 'jeolla', 'gyeongsang', 'chungcheong'],
    default_center: [35.9078, 127.7669]
  },
  china: {
    regions: ['beijing', 'shanghai', 'guangdong', 'sichuan', 'yunnan', 'tibet', 'xinjiang', 'inner_mongolia'],
    default_center: [35.8617, 104.1954]
  },
  india: {
    regions: ['north', 'south', 'east', 'west', 'central', 'himalayan', 'coastal', 'rajasthan'],
    default_center: [20.5937, 78.9629]
  },
  nepal: {
    regions: ['kathmandu', 'pokhara', 'everest', 'annapurna', 'mustang', 'chitwan', 'lumbini', 'langtang'],
    default_center: [28.3949, 84.1240]
  },
  turkey: {
    regions: ['istanbul', 'ankara', 'antalya', 'cappadocia', 'aegean', 'black_sea', 'eastern', 'southeastern'],
    default_center: [38.9637, 35.2433]
  },
  egypt: {
    regions: ['cairo', 'giza', 'luxor', 'aswan', 'red_sea', 'sinai', 'alexandria', 'western_desert'],
    default_center: [26.8206, 30.8025]
  },
  morocco: {
    regions: ['marrakech', 'casablanca', 'fes', 'sahara', 'atlas_mountains', 'essaouira', 'chefchaouen', 'tangier'],
    default_center: [31.7917, -7.0926]
  },
  south_africa: {
    regions: ['western_cape', 'eastern_cape', 'kwazulu_natal', 'gauteng', 'mpumalanga', 'limpopo', 'northern_cape', 'free_state'],
    default_center: [-30.5595, 22.9375]
  },
  kenya: {
    regions: ['nairobi', 'coastal', 'rift_valley', 'central', 'eastern', 'western', 'nyanza', 'north_eastern'],
    default_center: [-0.0236, 37.9062]
  },
  tanzania: {
    regions: ['kilimanjaro', 'zanzibar', 'serengeti', 'arusha', 'dar_es_salaam', 'manyara', 'ngorongoro', 'tarangire'],
    default_center: [-6.3690, 34.8888]
  },
  brazil: {
    regions: ['southeast', 'south', 'northeast', 'north', 'central_west', 'amazon', 'pantanal', 'atlantic_forest'],
    default_center: [-14.2350, -51.9253]
  },
  argentina: {
    regions: ['buenos_aires', 'patagonia', 'mendoza', 'salta', 'iguazu', 'bariloche', 'ushuaia', 'cordoba'],
    default_center: [-38.4161, -63.6167]
  },
  chile: {
    regions: ['santiago', 'patagonia', 'atacama', 'easter_island', 'valparaiso', 'lake_district', 'tierra_del_fuego', 'andes'],
    default_center: [-35.6751, -71.5430]
  },
  peru: {
    regions: ['cusco', 'lima', 'arequipa', 'amazon', 'machu_picchu', 'lake_titicaca', 'sacred_valley', 'northern_coast'],
    default_center: [-9.1900, -75.0152]
  },
  mexico: {
    regions: ['central', 'yucatan', 'pacific_coast', 'baja_california', 'chiapas', 'oaxaca', 'jalisco', 'northern'],
    default_center: [23.6345, -102.5528]
  },
  costa_rica: {
    regions: ['central_valley', 'caribbean', 'pacific_north', 'pacific_south', 'arenal', 'monteverde', 'guanacaste', 'osa'],
    default_center: [9.7489, -83.7534]
  }
};

export const getCountryRegions = (countryId) => {
  return countryRegions[countryId]?.regions || [];
};

export const getCountryCenter = (countryId) => {
  return countryRegions[countryId]?.default_center || [31.5, 34.75];
};

export const getAllCountries = () => {
  return Object.keys(countryRegions);
};