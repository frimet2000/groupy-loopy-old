export const countryToContinent = {
  // Europe
  israel: 'asia',
  france: 'europe',
  spain: 'europe',
  italy: 'europe',
  germany: 'europe',
  uk: 'europe',
  switzerland: 'europe',
  austria: 'europe',
  norway: 'europe',
  sweden: 'europe',
  greece: 'europe',
  portugal: 'europe',
  netherlands: 'europe',
  belgium: 'europe',
  denmark: 'europe',
  ireland: 'europe',
  iceland: 'europe',
  croatia: 'europe',
  poland: 'europe',
  czech_republic: 'europe',
  finland: 'europe',
  romania: 'europe',
  hungary: 'europe',
  slovakia: 'europe',
  bulgaria: 'europe',
  serbia: 'europe',
  slovenia: 'europe',
  montenegro: 'europe',
  bosnia_herzegovina: 'europe',
  albania: 'europe',
  north_macedonia: 'europe',
  luxembourg: 'europe',
  malta: 'europe',
  cyprus: 'europe',
  estonia: 'europe',
  latvia: 'europe',
  lithuania: 'europe',
  
  // Asia
  japan: 'asia',
  thailand: 'asia',
  indonesia: 'asia',
  malaysia: 'asia',
  vietnam: 'asia',
  south_korea: 'asia',
  china: 'asia',
  india: 'asia',
  nepal: 'asia',
  turkey: 'asia',
  
  // Africa
  egypt: 'africa',
  morocco: 'africa',
  south_africa: 'africa',
  kenya: 'africa',
  tanzania: 'africa',
  
  // North America
  usa: 'north_america',
  canada: 'north_america',
  mexico: 'north_america',
  costa_rica: 'north_america',
  
  // South America
  brazil: 'south_america',
  argentina: 'south_america',
  chile: 'south_america',
  peru: 'south_america',
  
  // Oceania
  australia: 'oceania',
  new_zealand: 'oceania',
};

export const continents = ['europe', 'asia', 'africa', 'north_america', 'south_america', 'oceania'];

export function getContinentForCountry(country) {
  return countryToContinent[country] || 'europe';
}