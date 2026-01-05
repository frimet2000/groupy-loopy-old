// Country to regions mapping with translations
const countryTranslations = {
  israel: { he: 'ישראל', en: 'Israel', ru: 'Израиль', es: 'Israel', fr: 'Israël', de: 'Israel', it: 'Israele' },
  usa: { he: 'ארצות הברית', en: 'United States', ru: 'США', es: 'Estados Unidos', fr: 'États-Unis', de: 'USA', it: 'Stati Uniti' },
  italy: { he: 'איטליה', en: 'Italy', ru: 'Италия', es: 'Italia', fr: 'Italie', de: 'Italien', it: 'Italia' },
  spain: { he: 'ספרד', en: 'Spain', ru: 'Испания', es: 'España', fr: 'Espagne', de: 'Spanien', it: 'Spagna' },
  france: { he: 'צרפת', en: 'France', ru: 'Франция', es: 'Francia', fr: 'France', de: 'Frankreich', it: 'Francia' },
  germany: { he: 'גרמניה', en: 'Germany', ru: 'Германия', es: 'Alemania', fr: 'Allemagne', de: 'Deutschland', it: 'Germania' },
  uk: { he: 'בריטניה', en: 'United Kingdom', ru: 'Великобритания', es: 'Reino Unido', fr: 'Royaume-Uni', de: 'Vereinigtes Königreich', it: 'Regno Unito' },
  japan: { he: 'יפן', en: 'Japan', ru: 'Япония', es: 'Japón', fr: 'Japon', de: 'Japan', it: 'Giappone' },
  australia: { he: 'אוסטרליה', en: 'Australia', ru: 'Австралия', es: 'Australia', fr: 'Australie', de: 'Australien', it: 'Australia' },
  canada: { he: 'קנדה', en: 'Canada', ru: 'Канада', es: 'Canadá', fr: 'Canada', de: 'Kanada', it: 'Canada' },
  switzerland: { he: 'שוויץ', en: 'Switzerland', ru: 'Швейцария', es: 'Suiza', fr: 'Suisse', de: 'Schweiz', it: 'Svizzera' },
  austria: { he: 'אוסטריה', en: 'Austria', ru: 'Австрия', es: 'Austria', fr: 'Autriche', de: 'Österreich', it: 'Austria' },
  new_zealand: { he: 'ניו זילנד', en: 'New Zealand', ru: 'Новая Зеландия', es: 'Nueva Zelanda', fr: 'Nouvelle-Zélande', de: 'Neuseeland', it: 'Nuova Zelanda' },
  norway: { he: 'נורווגיה', en: 'Norway', ru: 'Норвегия', es: 'Noruega', fr: 'Norvège', de: 'Norwegen', it: 'Norvegia' },
  sweden: { he: 'שוודיה', en: 'Sweden', ru: 'Швеция', es: 'Suecia', fr: 'Suède', de: 'Schweden', it: 'Svezia' },
  greece: { he: 'יוון', en: 'Greece', ru: 'Греция', es: 'Grecia', fr: 'Grèce', de: 'Griechenland', it: 'Grecia' },
  portugal: { he: 'פורטוגל', en: 'Portugal', ru: 'Португалия', es: 'Portugal', fr: 'Portugal', de: 'Portugal', it: 'Portogallo' },
  netherlands: { he: 'הולנד', en: 'Netherlands', ru: 'Нидерланды', es: 'Países Bajos', fr: 'Pays-Bas', de: 'Niederlande', it: 'Paesi Bassi' },
  belgium: { he: 'בלגיה', en: 'Belgium', ru: 'Бельгия', es: 'Bélgica', fr: 'Belgique', de: 'Belgien', it: 'Belgio' },
  denmark: { he: 'דנמרק', en: 'Denmark', ru: 'Дания', es: 'Dinamarca', fr: 'Danemark', de: 'Dänemark', it: 'Danimarca' },
  ireland: { he: 'אירלנד', en: 'Ireland', ru: 'Ирландия', es: 'Irlanda', fr: 'Irlande', de: 'Irland', it: 'Irlanda' },
  iceland: { he: 'איסלנד', en: 'Iceland', ru: 'Исландия', es: 'Islandia', fr: 'Islande', de: 'Island', it: 'Islanda' },
  croatia: { he: 'קרואטיה', en: 'Croatia', ru: 'Хорватия', es: 'Croacia', fr: 'Croatie', de: 'Kroatien', it: 'Croazia' },
  poland: { he: 'פולין', en: 'Poland', ru: 'Польша', es: 'Polonia', fr: 'Pologne', de: 'Polen', it: 'Polonia' },
  czech_republic: { he: 'צ׳כיה', en: 'Czech Republic', ru: 'Чехия', es: 'República Checa', fr: 'Tchéquie', de: 'Tschechien', it: 'Repubblica Ceca' },
  thailand: { he: 'תאילנד', en: 'Thailand', ru: 'Таиланд', es: 'Tailandia', fr: 'Thaïlande', de: 'Thailand', it: 'Thailandia' },
  indonesia: { he: 'אינדונזיה', en: 'Indonesia', ru: 'Индонезия', es: 'Indonesia', fr: 'Indonésie', de: 'Indonesien', it: 'Indonesia' },
  malaysia: { he: 'מלזיה', en: 'Malaysia', ru: 'Малайзия', es: 'Malasia', fr: 'Malaisie', de: 'Malaysia', it: 'Malesia' },
  vietnam: { he: 'וייטנאם', en: 'Vietnam', ru: 'Вьетнам', es: 'Vietnam', fr: 'Vietnam', de: 'Vietnam', it: 'Vietnam' },
  south_korea: { he: 'דרום קוריאה', en: 'South Korea', ru: 'Южная Корея', es: 'Corea del Sur', fr: 'Corée du Sud', de: 'Südkorea', it: 'Corea del Sud' },
  china: { he: 'סין', en: 'China', ru: 'Китай', es: 'China', fr: 'Chine', de: 'China', it: 'Cina' },
  india: { he: 'הודו', en: 'India', ru: 'Индия', es: 'India', fr: 'Inde', de: 'Indien', it: 'India' },
  nepal: { he: 'נפאל', en: 'Nepal', ru: 'Непал', es: 'Nepal', fr: 'Népal', de: 'Nepal', it: 'Nepal' },
  turkey: { he: 'טורקיה', en: 'Turkey', ru: 'Турция', es: 'Turquía', fr: 'Turquie', de: 'Türkei', it: 'Turchia' },
  egypt: { he: 'מצרים', en: 'Egypt', ru: 'Египет', es: 'Egipto', fr: 'Égypte', de: 'Ägypten', it: 'Egitto' },
  morocco: { he: 'מרוקו', en: 'Morocco', ru: 'Марокко', es: 'Marruecos', fr: 'Maroc', de: 'Marokko', it: 'Marocco' },
  south_africa: { he: 'דרום אפריקה', en: 'South Africa', ru: 'ЮАР', es: 'Sudáfrica', fr: 'Afrique du Sud', de: 'Südafrika', it: 'Sudafrica' },
  kenya: { he: 'קניה', en: 'Kenya', ru: 'Кения', es: 'Kenia', fr: 'Kenya', de: 'Kenia', it: 'Kenya' },
  tanzania: { he: 'טנזניה', en: 'Tanzania', ru: 'Танзания', es: 'Tanzania', fr: 'Tanzanie', de: 'Tansania', it: 'Tanzania' },
  brazil: { he: 'ברזיל', en: 'Brazil', ru: 'Бразилия', es: 'Brasil', fr: 'Brésil', de: 'Brasilien', it: 'Brasile' },
  argentina: { he: 'ארגנטינה', en: 'Argentina', ru: 'Аргентина', es: 'Argentina', fr: 'Argentine', de: 'Argentinien', it: 'Argentina' },
  chile: { he: 'צ׳ילה', en: 'Chile', ru: 'Чили', es: 'Chile', fr: 'Chili', de: 'Chile', it: 'Cile' },
  peru: { he: 'פרו', en: 'Peru', ru: 'Перу', es: 'Perú', fr: 'Pérou', de: 'Peru', it: 'Perù' },
  mexico: { he: 'מקסיקו', en: 'Mexico', ru: 'Мексика', es: 'México', fr: 'Mexique', de: 'Mexiko', it: 'Messico' },
  costa_rica: { he: 'קוסטה ריקה', en: 'Costa Rica', ru: 'Коста-Рика', es: 'Costa Rica', fr: 'Costa Rica', de: 'Costa Rica', it: 'Costa Rica' },
  finland: { he: 'פינלנד', en: 'Finland', ru: 'Финляндия', es: 'Finlandia', fr: 'Finlande', de: 'Finnland', it: 'Finlandia' },
  romania: { he: 'רומניה', en: 'Romania', ru: 'Румыния', es: 'Rumania', fr: 'Roumanie', de: 'Rumänien', it: 'Romania' },
  hungary: { he: 'הונגריה', en: 'Hungary', ru: 'Венгрия', es: 'Hungría', fr: 'Hongrie', de: 'Ungarn', it: 'Ungheria' },
  slovakia: { he: 'סלובקיה', en: 'Slovakia', ru: 'Словакия', es: 'Eslovaquia', fr: 'Slovaquie', de: 'Slowakei', it: 'Slovacchia' },
  bulgaria: { he: 'בולגריה', en: 'Bulgaria', ru: 'Болгария', es: 'Bulgaria', fr: 'Bulgarie', de: 'Bulgarien', it: 'Bulgaria' },
  serbia: { he: 'סרביה', en: 'Serbia', ru: 'Сербия', es: 'Serbia', fr: 'Serbie', de: 'Serbien', it: 'Serbia' },
  slovenia: { he: 'סלובניה', en: 'Slovenia', ru: 'Словения', es: 'Eslovenia', fr: 'Slovénie', de: 'Slowenien', it: 'Slovenia' },
  montenegro: { he: 'מונטנגרו', en: 'Montenegro', ru: 'Черногория', es: 'Montenegro', fr: 'Monténégro', de: 'Montenegro', it: 'Montenegro' },
  bosnia_herzegovina: { he: 'בוסניה והרצגובינה', en: 'Bosnia & Herzegovina', ru: 'Босния и Герцеговина', es: 'Bosnia y Herzegovina', fr: 'Bosnie-Herzégovine', de: 'Bosnien und Herzegowina', it: 'Bosnia ed Erzegovina' },
  albania: { he: 'אלבניה', en: 'Albania', ru: 'Албания', es: 'Albania', fr: 'Albanie', de: 'Albanien', it: 'Albania' },
  north_macedonia: { he: 'מקדוניה הצפונית', en: 'North Macedonia', ru: 'Северная Македония', es: 'Macedonia del Norte', fr: 'Macédoine du Nord', de: 'Nordmazedonien', it: 'Macedonia del Nord' },
  luxembourg: { he: 'לוקסמבורג', en: 'Luxembourg', ru: 'Люксембург', es: 'Luxemburgo', fr: 'Luxembourg', de: 'Luxemburg', it: 'Lussemburgo' },
  malta: { he: 'מלטה', en: 'Malta', ru: 'Мальта', es: 'Malta', fr: 'Malte', de: 'Malta', it: 'Malta' },
  cyprus: { he: 'קפריסין', en: 'Cyprus', ru: 'Кипр', es: 'Chipre', fr: 'Chypre', de: 'Zypern', it: 'Cipro' },
  estonia: { he: 'אסטוניה', en: 'Estonia', ru: 'Эстония', es: 'Estonia', fr: 'Estonie', de: 'Estland', it: 'Estonia' },
  latvia: { he: 'לטביה', en: 'Latvia', ru: 'Латвия', es: 'Letonia', fr: 'Lettonie', de: 'Lettland', it: 'Lettonia' },
  lithuania: { he: 'ליטא', en: 'Lithuania', ru: 'Литва', es: 'Lituania', fr: 'Lituanie', de: 'Litauen', it: 'Lituania' }
};

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
  },
  finland: {
    regions: ['helsinki', 'lapland', 'tampere', 'turku', 'oulu', 'kuopio', 'lakeland', 'aland'],
    default_center: [61.9241, 25.7482]
  },
  romania: {
    regions: ['bucharest', 'transylvania', 'moldavia', 'wallachia', 'dobrogea', 'maramures', 'banat', 'carpathians'],
    default_center: [45.9432, 24.9668]
  },
  hungary: {
    regions: ['budapest', 'lake_balaton', 'northern_hungary', 'great_plain', 'transdanubia', 'southern_hungary', 'pecs', 'debrecen'],
    default_center: [47.1625, 19.5033]
  },
  slovakia: {
    regions: ['bratislava', 'high_tatras', 'central_slovakia', 'eastern_slovakia', 'western_slovakia', 'kosice', 'presov', 'zilina'],
    default_center: [48.6690, 19.6990]
  },
  bulgaria: {
    regions: ['sofia', 'black_sea', 'plovdiv', 'varna', 'burgas', 'rila', 'pirin', 'rhodopes'],
    default_center: [42.7339, 25.4858]
  },
  serbia: {
    regions: ['belgrade', 'novi_sad', 'vojvodina', 'sumadija', 'southern_serbia', 'western_serbia', 'eastern_serbia', 'nis'],
    default_center: [44.0165, 21.0059]
  },
  slovenia: {
    regions: ['ljubljana', 'julian_alps', 'coastal', 'maribor', 'bled', 'kranjska_gora', 'piran', 'postojna'],
    default_center: [46.1512, 14.9955]
  },
  montenegro: {
    regions: ['kotor', 'budva', 'podgorica', 'tivat', 'durmitor', 'bay_of_kotor', 'coastal', 'northern'],
    default_center: [42.7087, 19.3744]
  },
  bosnia_herzegovina: {
    regions: ['sarajevo', 'mostar', 'banja_luka', 'tuzla', 'herzegovina', 'central_bosnia', 'northwestern', 'eastern'],
    default_center: [43.9159, 17.6791]
  },
  albania: {
    regions: ['tirana', 'albanian_riviera', 'shkoder', 'vlore', 'saranda', 'berat', 'gjirokaster', 'durres'],
    default_center: [41.1533, 20.1683]
  },
  north_macedonia: {
    regions: ['skopje', 'ohrid', 'bitola', 'tetovo', 'prilep', 'kumanovo', 'veles', 'strumica'],
    default_center: [41.6086, 21.7453]
  },
  luxembourg: {
    regions: ['luxembourg_city', 'diekirch', 'grevenmacher', 'mullerthal', 'ardennes', 'moselle', 'esch_sur_alzette', 'echternach'],
    default_center: [49.8153, 6.1296]
  },
  malta: {
    regions: ['valletta', 'sliema', 'mdina', 'gozo', 'comino', 'northern', 'southern', 'western'],
    default_center: [35.9375, 14.3754]
  },
  cyprus: {
    regions: ['nicosia', 'limassol', 'larnaca', 'paphos', 'ayia_napa', 'troodos', 'famagusta', 'protaras'],
    default_center: [35.1264, 33.4299]
  },
  estonia: {
    regions: ['tallinn', 'tartu', 'parnu', 'saaremaa', 'lahemaa', 'narva', 'haapsalu', 'viljandi'],
    default_center: [58.5953, 25.0136]
  },
  latvia: {
    regions: ['riga', 'jurmala', 'liepaja', 'daugavpils', 'sigulda', 'cesis', 'kuldiga', 'ventspils'],
    default_center: [56.8796, 24.6032]
  },
  lithuania: {
    regions: ['vilnius', 'kaunas', 'klaipeda', 'palanga', 'trakai', 'siauliai', 'druskininkai', 'nida'],
    default_center: [55.1694, 23.8813]
  }
};

export const getCountryRegions = (countryId) => {
  return countryRegions[countryId]?.regions || [];
};

export const getCountryCenter = (countryId) => {
  return countryRegions[countryId]?.default_center || [31.5, 34.75];
};

export const getAllCountries = (language = 'en') => {
  return Object.keys(countryRegions).map(countryKey => ({
    value: countryKey,
    label: countryTranslations[countryKey]?.[language] || countryTranslations[countryKey]?.en || countryKey,
    translations: countryTranslations[countryKey]
  }));
};