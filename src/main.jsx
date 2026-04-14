import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { useState, useRef } from "react"

const US_CITIES = [
  "Boston","Calistoga","Chicago","Fort Lauderdale","Healdsburg",
  "Las Vegas","Los Angeles","Martha's Vineyard","Menlo Park","Miami","Napa",
  "NYC","Palo Alto","San Francisco","Santa Monica","Scottsdale",
  "Sonoma","St. Helena","Venice CA","Washington DC","West Palm Beach"
]
const INTL_CITIES = [
  "Barcelona","Cannes","London","Milan","Mykonos","Paris","Seoul"
]
const CITIES = [...US_CITIES, ...INTL_CITIES]

const FILTERS = [
  { key:"michelin", label:"Michelin" },
  { key:"newBuzz", label:"New & Buzzy" },
  { key:"trendy", label:"Trendy" },
  { key:"classic", label:"Classic" },
  { key:"celebrity", label:"Celebrity" },
  { key:"liveMusic", label:"Live Music" },
  { key:"hardToGet", label:"Hard to Get" },
  { key:"quiet", label:"Quiet" },
  { key:"privateClub", label:"Private Club" },
  { key:"sushi", label:"Sushi" },
]

const TAG_COLORS = {
  michelin:    { bg:"#EEEDFE", color:"#3C3489", label:"Michelin" },
  newBuzz:     { bg:"#E1F5EE", color:"#0F6E56", label:"New & Buzzy" },
  trendy:      { bg:"#FAEEDA", color:"#854F0B", label:"Trendy" },
  classic:     { bg:"#E6F1FB", color:"#185FA5", label:"Classic" },
  celebrity:   { bg:"#FBEAF0", color:"#993556", label:"Celebrity" },
  liveMusic:   { bg:"#EAF3DE", color:"#3B6D11", label:"Live Music" },
  hardToGet:   { bg:"#FCEBEB", color:"#A32D2D", label:"Hard to Get" },
  quiet:       { bg:"#F1EFE8", color:"#5F5E5A", label:"Quiet" },
  privateClub: { bg:"#F0E6FB", color:"#6B21A8", label:"Private Club" },
  sushi:       { bg:"#FFF3E0", color:"#E65100", label:"Sushi" },
}

const STATUS_COLORS = {
  open:             { bg:"#EAF3DE", color:"#3B6D11" },
  closed:           { bg:"#FCEBEB", color:"#A32D2D" },
  "new opening":    { bg:"#E1F5EE", color:"#0F6E56" },
  "michelin award": { bg:"#EEEDFE", color:"#3C3489" },
  "new chef":       { bg:"#FAEEDA", color:"#854F0B" },
  update:           { bg:"#E6F1FB", color:"#185FA5" },
}

// v(name, type, desc, stars, flags, url, lat, lng, category)
// category: "restaurant" | "bar" | "sushi" | "private club" | "rooftop"
const v = (name,type,desc,stars,flags,url,lat,lng,cat="restaurant") =>
  ({name,type,desc,stars,...flags,url,lat,lng,category:cat,status:"",notes:"",privateDining:""})

const f = (michelin=false,newBuzz=false,trendy=false,classic=false,celebrity=false,liveMusic=false,hardToGet=false,quiet=false,privateClub=false,sushi=false) =>
  ({michelin,newBuzz,trendy,classic,celebrity,liveMusic,hardToGet,quiet,privateClub,sushi})

const INITIAL_DATA = {
  "NYC": [
    // Restaurants
    v("Le Bernardin","Seafood","Eric Ripert's three-star seafood temple, best in America",4.9,f(true,false,false,true,true,false,true,true),"https://le-bernardin.com",40.7614,-73.9816),
    v("Eleven Madison Park","Contemporary American","Three Michelin stars, plant-forward tasting menu masterpiece",4.9,f(true,false,true,false,true,false,true,true),"https://elevenmadisonpark.com",40.7416,-73.9872),
    v("Per Se","French-American","Thomas Keller's NYC flagship, three stars, Columbus Circle views",4.9,f(true,false,false,true,true,false,true,true),"https://perseny.com",40.7685,-73.9821),
    v("Masa","Japanese","Three-star omakase, America's most expensive restaurant",4.9,f(true,false,false,true,true,false,true,true),"https://masanyc.com",40.7685,-73.9822),
    v("Tatiana by Kwame Onwuachi","Afro-Caribbean","Lincoln Center's buzzy Michelin-starred gem",4.8,f(true,true,true,false,true,false,true,false),"https://tatiananyc.com",40.7725,-73.9836),
    v("Le Veau d'Or","French Bistro","Historic 1937 French bistro revived by Frenchette team, UES, impossible to book",4.8,f(false,true,true,false,true,false,true,true),"https://leveaudor.com",40.7641,-73.9635),
    v("Massara","Italian","From Michelin-starred Rezdôra team, wood-burning oven from Italy, pasta transcends",4.8,f(false,true,true,false,false,false,true,false),"https://massaranyc.com",40.7397,-73.9897),
    v("Don Angie","Italian","Creative red-sauce, perpetually packed, Michelin starred",4.8,f(true,false,true,false,false,false,true,false),"https://donangie.com",40.7354,-74.0065),
    v("Carbone","Italian-American","Red-sauce power scene, the celebrity magnet of NYC",4.8,f(false,false,true,false,true,false,true,false),"https://carbonenewyork.com",40.7277,-74.0020),
    v("La Tête d'Or","French Steakhouse","Daniel Boulud's first steakhouse, One Madison, instant power scene",4.7,f(false,true,true,false,true,false,true,false),"https://danielnyc.com",40.7416,-73.9872),
    v("Theodora","Mediterranean Seafood","Best new Brooklyn opening, dry-aged steelhead, za'atar kubaneh",4.8,f(false,true,true,false,false,false,true,true),"https://theodorabk.com",40.6881,-73.9750),
    v("Huso","Caviar Tasting Menu","Top Chef champ Buddha Lo's caviar-centric Tribeca tasting menu, decadent",4.7,f(false,true,true,false,true,false,true,true),"https://husonyc.com",40.7199,-74.0090),
    v("Rao's","Italian-American","Impossible to get into, old-school East Harlem institution since 1896",4.8,f(false,false,false,true,true,false,true,false),"https://raos.com",40.7956,-73.9420),
    v("Gabriel Kreuther","Alsatian-French","Two Michelin stars, stunning room across from Bryant Park",4.8,f(true,false,false,false,false,false,true,true),"https://gknyc.com",40.7540,-73.9839),
    v("Gramercy Tavern","American","Danny Meyer landmark, two Michelin stars, warm and classic",4.7,f(true,false,false,true,true,false,false,true),"https://gramercytavern.com",40.7386,-73.9883),
    v("Daniel","French","Daniel Boulud's flagship, two stars, Upper East Side elegance",4.7,f(true,false,false,true,true,false,true,true),"https://danielnyc.com",40.7741,-73.9635),
    v("Atomix","Korean Contemporary","Two Michelin stars, highest-rated Korean restaurant in the US",4.7,f(true,false,true,false,false,false,true,true),"https://atomixnyc.com",40.7448,-73.9870),
    v("Adda","Indian","East Village Indian, tableside butter chicken theater, Chintan Pandya's masterwork",4.7,f(false,true,true,false,true,false,true,false),"https://addanyc.com",40.7258,-73.9832),
    v("The Corner Store","American","SoHo sensation, live-fire Mediterranean, painful reservation",4.7,f(false,true,true,false,true,false,true,false),"https://thecornerstorenyc.com",40.7229,-73.9993),
    v("Borgo","Northern Italian","NoMad cozy Italian from Marlow & Sons team, focaccia Borgo and great pastas",4.6,f(false,true,false,false,false,false,false,true),"https://borgonyc.com",40.7448,-73.9872),
    v("Casa Tua NYC","Italian Members Club","Miami's iconic private club at The Surrey, main dining room open to public",4.7,f(false,true,true,false,true,false,true,true,true),"https://casatualifestyle.com/new-york",40.7741,-73.9635,"private club"),
    v("The Core Club","Private Members Club","NYC's most exclusive private club, arts and business elite",4.8,f(false,false,false,true,true,false,true,true,true),"https://thecoreclub.com",40.7614,-73.9726,"private club"),
    v("Lilia","Italian","Missy Robbins' pasta temple, perpetual waits, beloved",4.7,f(false,false,true,false,false,false,true,false),"https://lilianewyork.com",40.7183,-73.9572),
    v("Via Carota","Italian","West Village gem, best cacio e pepe in the city",4.7,f(false,false,false,true,true,false,true,false),"https://viacarota.com",40.7329,-74.0026),
    v("Eel Bar","French-Basque","LES gem from Cervo's team, Southern France and Basque, natural wine haven",4.6,f(false,true,true,false,false,false,true,true),"https://eelbarnyc.com",40.7198,-73.9876),
    v("Cote","Korean Steakhouse","Michelin-starred Korean BBQ, wine-focused, Flatiron",4.6,f(true,false,true,false,true,false,true,false),"https://cotenyc.com",40.7397,-73.9927),
    v("Frenchette","French Bistro","Downtown brasserie energy, natural wine, always buzzing",4.6,f(false,false,true,false,true,false,true,false),"https://frenchetteny.com",40.7204,-74.0076),
    v("Lucali","Pizza","Best pizza in NYC, cash only, BYOB, impossible wait, Carroll Gardens",4.6,f(false,false,false,true,true,false,true,false),"https://lucali.com",40.6784,-73.9956),
    v("The Grill","American","Power lunch institution in the Four Seasons landmark space",4.6,f(false,false,false,true,true,false,false,true),"https://thegrillnewyork.com",40.7569,-73.9726),
    v("Pastis","French Brasserie","Keith McNally's beloved brasserie, Meatpacking staple",4.4,f(false,false,true,false,true,false,false,false),"https://pastisnyc.com",40.7404,-74.0076),
    v("Balthazar","French Brasserie","Keith McNally's SoHo brasserie, open since 1997, always packed",4.4,f(false,false,false,true,true,false,false,false),"https://balthazarny.com",40.7227,-73.9997),
    v("Raoul's","French Bistro","SoHo institution, dark and romantic, steak frites perfection",4.4,f(false,false,false,true,true,false,false,false),"https://raouls.com",40.7229,-73.9993),
    v("Russ & Daughters Cafe","Jewish Deli","Lower East Side institution, best smoked fish in America",4.3,f(false,false,false,true,true,false,false,false),"https://russanddaughterscafe.com",40.7226,-73.9873),
    v("Monkey Bar","American","Midtown power scene, Graydon Carter's celebrity haunt",4.3,f(false,false,false,true,true,false,false,false),"https://monkeybarnewyork.com",40.7576,-73.9726),
    // Bars
    v("Employees Only","Cocktail Bar","Legendary speakeasy-style cocktail bar, West Village",4.6,f(false,false,false,true,true,false,false,false),"https://employeesonlynyc.com",40.7339,-74.0051,"bar"),
    v("Death & Co","Cocktail Bar","Craft cocktail pioneer, East Village institution",4.6,f(false,false,false,true,false,false,false,false),"https://deathandcompany.com",40.7254,-73.9831,"bar"),
    v("Bar Goto","Japanese Cocktail Bar","Intimate Japanese-inspired cocktails, Lower East Side",4.6,f(false,false,false,true,false,false,false,true),"https://bargoto.com",40.7225,-73.9896,"bar"),
    v("Attaboy","Cocktail Bar","No-menu speakeasy, bartenders craft your perfect drink",4.6,f(false,false,false,true,false,false,false,false),"https://attaboy.us",40.7198,-73.9876,"bar"),
    v("Sip & Guzzle","Cocktail Bar","Tokyo-inspired bi-level bar, Alinea alum cooking, West Village sensation",4.7,f(false,true,true,false,true,false,true,false),"https://sipandguzzlenyc.com",40.7329,-74.0031,"bar"),
    v("The Dead Rabbit","Cocktail Bar","Five-time world's best bar, Irish pub meets craft cocktails",4.4,f(false,false,false,true,false,false,false,false),"https://thedeadrabbitnyc.com",40.7033,-74.0135,"bar"),
    v("Four Horsemen","Wine Bar","James Murphy's natural wine bar, Michelin starred, Williamsburg",4.4,f(true,false,true,false,true,false,false,true),"https://fourhorsemenbk.com",40.7158,-73.9500,"bar"),
    v("Maison Premiere","Oyster Bar","New Orleans-inspired oysters and absinthe, Williamsburg",4.5,f(false,false,true,false,true,false,false,true),"https://maisonpremiere.com",40.7156,-73.9572,"bar"),
    // Sushi
    v("Sushi Sho","Japanese Omakase","Three Michelin stars, Keiji Nakazawa — one of the world's best sushi masters, $450pp",4.9,f(true,false,false,false,false,false,true,true,false,true),"https://sushishonyc.com",40.7580,-73.9835,"sushi"),
    v("Masa","Japanese Omakase","Three-star counter, America's most expensive and most extraordinary sushi",4.9,f(true,false,false,true,true,false,true,true,false,true),"https://masanyc.com",40.7685,-73.9822,"sushi"),
    v("Sushi Noz","Japanese Omakase","Two Michelin stars, traditional Edomae-style, hinoki counter, fish flown from Japan",4.8,f(true,false,false,false,false,false,true,true,false,true),"https://sushinoz.com",40.7741,-73.9635,"sushi"),
    v("Sushi Nakazawa","Japanese Omakase","Legendary West Village omakase, $190 for 20 courses, Pete Wells called chef 'one of the world's best'",4.8,f(true,false,false,true,true,false,true,true,false,true),"https://sushinakazawa.com",40.7329,-74.0031,"sushi"),
    v("Nakaji","Japanese Omakase","Hidden Chinatown alley omakase, extraordinary and intimate",4.7,f(true,false,false,false,false,false,true,true,false,true),"https://nakajinyc.com",40.7163,-73.9971,"sushi"),
    v("Sushi Yasuda","Japanese","Midtown classic, exceptional quality and technique, institution since 1999",4.7,f(false,false,false,true,true,false,false,true,false,true),"https://sushiyasuda.com",40.7525,-73.9715,"sushi"),
    v("Sushi Of Gari","Japanese Omakase","UES icon since 1997, legendary sautéed tomato over buttery salmon piece",4.6,f(false,false,false,true,true,false,false,true,false,true),"https://sushiofgari.com",40.7741,-73.9595,"sushi"),
    v("Blue Ribbon Sushi","Japanese","Late-night sushi institution, chefs' favorite after-shift spot",4.6,f(false,false,false,true,true,false,false,false,false,true),"https://blueribbonrestaurants.com",40.7255,-74.0020,"sushi"),
    v("Sugarfish","Japanese","LA's omakase gift to NYC, accessibly priced, multiple Manhattan locations",4.5,f(false,false,false,true,false,false,false,false,false,true),"https://sugarfishsushi.com",40.7397,-73.9897,"sushi"),
  ],

  "Miami": [
    // F1 Miami Grand Prix
    v("2026 Miami Grand Prix","Sprint Weekend · Round 4","📅 May 1–3, 2026 · Miami International Autodrome, Hard Rock Stadium · Sprint race format · Contract runs through 2041 · Tickets: f1miamigp.com",4.9,f(false,false,true,false,true,true,false,false),"https://f1miamigp.com",25.9579,-80.2390,"f1"),
    v("2027 Miami Grand Prix","Dates TBC","📅 May 2027 (exact dates not yet confirmed) · Miami International Autodrome, Hard Rock Stadium · Tickets released ~6 months prior · f1miamigp.com",4.9,f(false,false,true,false,true,true,false,false),"https://f1miamigp.com",25.9579,-80.2390,"f1"),
    v("2028–2041 Miami Grand Prix","Annual · May","📅 Confirmed annually every May through 2041 contract · Hard Rock Stadium complex, Miami Gardens · One of the most celebrated events on the F1 calendar",4.9,f(false,false,true,false,true,true,false,false),"https://f1miamigp.com",25.9579,-80.2390,"f1"),
    v("F1 Weekend Hotspot: Papi Steak","Where to eat during F1","The #1 celebrity F1 circuit dinner spot — book months in advance for race weekend",4.8,f(false,false,true,false,true,true,true,false),"https://papisteakmiami.com",25.7908,-80.1362,"f1"),
    v("F1 Weekend Hotspot: MILA Rooftop","Where to party during F1","The F1 crowd's rooftop of choice — fire dancers, MediterrAsian food, book ASAP",4.8,f(false,false,true,false,true,true,true,false),"https://mila-miami.com",25.7908,-80.1349,"f1"),
    v("F1 Weekend Hotspot: Komodo","Where to celebrate during F1","Three floors of energy, DJ sets, celebrity central during race weekend",4.7,f(false,false,true,false,true,true,false,false),"https://komodo-miami.com",25.7681,-80.1930,"f1"),
    v("F1 Weekend Hotspot: Sugar","Rooftop drinks during F1","40th floor Brickell views, the elevated pre/post-race cocktail spot",4.7,f(false,false,true,false,true,false,false,false),"https://east-miami.com/sugar",25.7645,-80.1930,"f1"),
    v("Cote Miami","Korean Steakhouse","Korean BBQ meets Miami glam, Michelin starred",4.8,f(true,false,true,false,true,false,true,false),"https://cotemiami.com",25.7926,-80.1419),
    v("Le Jardinier","French Vegetable","Michelin-starred vegetable-forward French",4.8,f(true,false,true,false,false,false,true,true),"https://lejardiniermiami.com",25.7908,-80.1347),
    v("Stubborn Seed","Contemporary American","Chef Jeremy Ford's Michelin-starred South Beach gem",4.8,f(true,false,true,false,false,false,true,true),"https://stubbornseeds.com",25.7814,-80.1300),
    v("L'Atelier de Joël Robuchon","French Counter","Michelin-starred counter dining, Miami's finest French",4.8,f(true,false,false,true,true,false,true,true),"https://joel-robuchon.com/en/restaurant/miami",25.7908,-80.1340),
    v("Shiso","Asian Smokehouse","Chef Raheem Sealey's Wynwood Asian smokehouse, Japanese meets Caribbean soul",4.8,f(false,true,true,false,true,false,true,false),"https://shisomiami.com",25.8014,-80.1990),
    v("Daniel's Miami","Steakhouse","Coral Gables blockbuster, 9th best steakhouse in North America within 4 months of opening",4.8,f(false,true,true,false,true,false,true,true),"https://danielsmiami.com",25.7481,-80.2570),
    v("Papi Steak","Steakhouse","Over-the-top celebrity steakhouse, the place to be seen",4.7,f(false,false,true,false,true,true,true,false),"https://papisteakmiami.com",25.7908,-80.1362),
    v("Carbone Miami","Italian-American","The Miami outpost of the NYC icon, same energy",4.7,f(false,false,true,false,true,false,true,false),"https://carbonemiami.com",25.7908,-80.1370),
    v("Maty's","Peruvian","Chef Valerie Chang's Michelin-starred Peruvian, one of Miami's most acclaimed",4.7,f(true,false,true,false,false,false,true,false),"https://matysmiami.com",25.7908,-80.1340),
    v("GAIA Miami","Greek-Mediterranean","Dubai's acclaimed concept lands in South of Fifth, exceptional seafood",4.7,f(false,true,true,false,true,false,true,false),"https://gaiasof.com",25.7667,-80.1370),
    v("Claudie","French Riviera","One of Miami's best 2025 openings, Riviera-inspired, evolving dinner menu",4.7,f(false,true,true,false,false,false,true,true),"https://claudiemiami.com",25.7908,-80.1380),
    v("Mutra","Israeli","Strip mall exterior hides an extraordinary intimate Israeli kitchen, soulful and transporting",4.7,f(false,true,true,false,false,false,true,true),"https://mutrami.com",25.8660,-80.1870),
    v("Las' Lap","Caribbean","Kwame Onwuachi's Miami Caribbean dining moment, chef's most personal project",4.7,f(false,true,true,false,true,false,true,false),"https://laslap.com",25.7908,-80.1370),
    v("KYU Miami","Asian-American","Wood-fired Asian BBQ, Wynwood's best restaurant",4.7,f(false,false,true,false,true,false,true,false),"https://kyurestaurants.com",25.8014,-80.1990),
    v("Francesco Martucci Miami","Italian Pizza","World's #1 pizzaiolo arrives in Wynwood, multi-course pizza experience",4.8,f(false,true,true,false,true,false,true,false),"https://francescomartucci.com/miami",25.8014,-80.1980),
    v("Zuma Miami","Japanese","Rooftop Japanese robatayaki, Brickell scene",4.6,f(false,false,true,false,true,false,false,false),"https://zumarestaurant.com/zuma-miami",25.7681,-80.1919),
    v("Swan","Mediterranean","Pharrell's restaurant, the celebrity magnet of Design District",4.5,f(false,false,true,false,true,false,false,false),"https://swanandbar.com",25.8112,-80.1876),
    v("Komodo","Asian","Three-floor Asian restaurant and nightlife destination",4.5,f(false,false,true,false,true,true,false,false),"https://komodo-miami.com",25.7681,-80.1930),
    v("Joe's Stone Crab","Seafood","Miami institution since 1913, must-visit October–May",4.6,f(false,false,false,true,true,false,true,false),"https://joesstonecrab.com",25.7731,-80.1349),
    v("Prime 112","Steakhouse","The OG South Beach steakhouse, impossible tables",4.6,f(false,false,true,false,true,false,true,false),"https://prime112.com",25.7731,-80.1359),
    v("Mandolin Aegean Bistro","Greek","Design District Greek gem, beautiful garden patio",4.6,f(false,false,true,false,false,false,false,true),"https://mandolinmiami.com",25.8112,-80.1856),
    v("Sexy Fish Miami","Japanese","Hottest new opening, Miami outpost of the London hit",4.6,f(false,true,true,false,true,false,true,false),"https://sexyfish.com/miami",25.7908,-80.1380),
    v("Casa Tua","Italian Members Club","Exclusive South Beach members club and restaurant",4.6,f(false,false,false,true,true,false,true,true,true),"https://casatualifestyle.com",25.7814,-80.1320,"private club"),
    v("Zaytinya Miami","Mediterranean","José Andrés' Greek-Turkish-Lebanese comes to South Beach, outstanding mezze",4.6,f(false,true,true,false,true,false,false,false),"https://zaytinya.com/miami",25.7814,-80.1320),
    v("Casa Vigil","Argentine Wine","Michelin-starred Argentine chef Alejandro Vigil's Miami debut, outstanding wine",4.7,f(false,true,true,false,true,false,true,true),"https://casavigil.com",25.8220,-80.1830),
    v("Sunkissed","Seafood","Brickell's sexiest new restaurant, red room, live band nightly",4.6,f(false,true,true,false,true,true,false,false),"https://sunkissedmiami.com",25.7645,-80.1930),
    v("Michael's Genuine","American","Wynwood farm-to-table pioneer, Miami classic",4.5,f(false,false,false,true,false,false,false,false),"https://michaelsgenuine.com",25.8014,-80.1960),
    v("Kiki on the River","Greek","Waterfront Greek, stunning views, party boats",4.4,f(false,false,true,false,true,true,false,false),"https://kikimiami.com",25.7856,-80.1940),
    v("Ball & Chain","Cuban Bar","Little Havana music venue and cocktail bar, historic",4.4,f(false,false,false,true,false,true,false,false),"https://ballandchainmiami.com",25.7686,-80.2161,"bar"),
    v("Broken Shaker","Cocktail Bar","Freehand Hotel's award-winning outdoor cocktail bar",4.5,f(false,false,true,false,true,false,false,false),"https://thefreehand.com/miami/broken-shaker",25.7938,-80.1349,"bar"),
    v("Sweet Liberty","Cocktail Bar","Award-winning cocktail bar, best happy hour in Miami",4.5,f(false,false,true,false,true,false,false,false),"https://mysweetliberty.com",25.7908,-80.1389,"bar"),
    // Sushi
    v("Queen Omakase","Japanese Omakase","Intimate 2nd-floor omakase counter inside the spectacular Paris Theater, Chef Kamakura's 14-course journey, Wagyu and fish flown from Japan",4.7,f(false,false,true,false,true,false,true,true,false,true),"https://queenmiamibeach.com",25.7731,-80.1359,"sushi"),
    v("MILA Omakase","Japanese Omakase","10-seat omakase counter below the famous rooftop, extraordinary quality, part of America's #1 restaurant",4.8,f(false,false,true,false,true,false,true,true,false,true),"https://mila-miami.com",25.7908,-80.1349,"sushi"),
    v("YASU Omakase","Japanese Omakase","Design District 8-seat counter, 600-year-old hinoki wood, fish from Toyosu Market, 14-16 courses",4.8,f(false,true,false,false,false,false,true,true,false,true),"https://yasusf.com",25.8112,-80.1856,"sushi"),
    v("Hiyakawa","Japanese Omakase","Wynwood's acclaimed omakase, intimate counter, exceptional quality and sourcing",4.7,f(false,false,false,false,false,false,true,true,false,true),"https://hiyakawa.com",25.8014,-80.1980,"sushi"),
    v("Naoe","Japanese Omakase","Brickell omakase institution, one of America's best, just 8 seats, legendary",4.8,f(true,false,false,false,false,false,true,true,false,true),"https://naoe.us",25.7681,-80.1919,"sushi"),
    v("Gekko","Japanese Steakhouse","Bad Bunny and David Grutman's celebrity Japanese steakhouse, sushi and wagyu",4.6,f(false,false,true,false,true,false,true,false,false,true),"https://gekkomiami.com",25.7908,-80.1360,"sushi"),
    v("Sushi Azabu Miami","Japanese","Outstanding traditional sushi, hidden counter, Miami Beach",4.6,f(false,false,false,false,false,false,true,true,false,true),"https://sushiazabu.com/miami",25.7908,-80.1340,"sushi"),
    v("Nobu Miami Beach","Japanese-Peruvian","The original celebrity sushi destination, Nobu Matsuhisa classic",4.5,f(false,false,true,false,true,false,false,false,false,true),"https://noburestaurants.com/miami-beach",25.7814,-80.1300,"sushi"),
  ],

  "Los Angeles": [
    v("Providence","Seafood","Two Michelin stars, LA's finest seafood dining",4.9,f(true,false,false,true,true,false,true,true),"https://providencela.com",34.0833,-118.3418),
    v("n/naka","Japanese","Two Michelin stars, Niki Nakayama's kaiseki masterpiece",4.9,f(true,false,false,false,false,false,true,true),"https://n-naka.com",34.0195,-118.3542),
    v("Somni","Spanish Contemporary","Two Michelin stars, reborn as LA's most ambitious tasting menu",4.9,f(true,true,true,false,true,false,true,true),"https://somnila.com",34.0736,-118.4004),
    v("Vespertine","Avant-garde","One Michelin star, otherworldly experience, Culver City",4.8,f(true,false,true,false,true,false,true,true),"https://vespertine.la",34.0093,-118.3951),
    v("Horses","American Bistro","Coolest room in LA, natural wine, perpetually buzzy",4.7,f(false,true,true,false,true,false,true,false),"https://horsesla.com",34.0903,-118.3690),
    v("Jon & Vinny's","Italian-American","Best pasta in LA, always packed, Silver Lake staple",4.7,f(false,false,true,false,true,false,true,false),"https://jonandvinnys.com",34.0831,-118.2707),
    v("Bestia","Italian","Arts District anchor, wood-fired and buzzy",4.7,f(false,false,true,false,true,false,true,false),"https://bestiala.com",34.0411,-118.2327),
    v("Baldi at Waldorf Astoria","Tuscan Steakhouse","Edoardo Baldi's Tuscan steakhouse, olive-wood fired cuts, spectacular room",4.8,f(false,true,true,false,true,false,true,true),"https://baldibeverlyhills.com",34.0736,-118.3980),
    v("Sushisamba West Hollywood","Japanese-Brazilian-Peruvian","Global brand's LA flagship, dramatic garden courtyard, old Hollywood glamour",4.7,f(false,true,true,false,true,false,false,false),"https://sushisamba.com/locations/west-hollywood",34.0927,-118.3840),
    v("Mother Wolf","Italian","Evan Funke's Rome-inspired pasta palace, Hollywood",4.5,f(false,true,true,false,true,false,true,false),"https://motherwolfla.com",34.1016,-118.3278),
    v("Gucci Osteria","Italian","Massimo Bottura's Beverly Hills outpost, one Michelin star",4.6,f(true,false,true,false,true,false,true,false),"https://gucciosteria.com/beverly-hills",34.0736,-118.3960),
    v("Gjusta","Bakery/Deli","Venice institution, perpetual lines, celebrity hangout",4.6,f(false,false,false,true,true,false,false,false),"https://gjusta.com",33.9901,-118.4710),
    v("The Polo Lounge","American","Beverly Hills Hotel institution, power breakfast legends",4.5,f(false,false,false,true,true,false,false,false),"https://beverlyhillshotel.com/dining/polo-lounge",34.0790,-118.4134),
    v("Spago","California","Wolfgang Puck's legendary Beverly Hills institution",4.6,f(false,false,false,true,true,false,false,true),"https://wolfgangpuck.com/dining/spago-beverly-hills",34.0736,-118.3980),
    v("Giorgio Baldi","Italian","Santa Monica's beloved 36-year-old Italian institution, celebrity magnet",4.7,f(false,false,false,true,true,false,true,true),"https://giorgiobaldi.com",34.0175,-118.5042),
    v("The Jonathan Club","Private Members Club","LA's most prestigious private club, Downtown and Beach",4.7,f(false,false,false,true,true,false,true,true,true),"https://jc.org",34.0490,-118.2520,"private club"),
    v("Musso & Frank Grill","American","Hollywood's oldest restaurant since 1919, timeless",4.4,f(false,false,false,true,true,false,false,false),"https://mussoandfrank.com",34.1013,-118.3280),
    v("Bar Marmont","Cocktail Bar","Chateau Marmont's iconic bar, eternal celebrity haunt",4.4,f(false,false,false,true,true,false,false,false),"https://chateaumarmont.com",34.0927,-118.3820,"bar"),
    v("Catch LA","Seafood Rooftop","Rooftop celebrity dining, West Hollywood scene",4.4,f(false,false,true,false,true,false,false,false),"https://catchrestaurants.com/location/la",34.0917,-118.3750,"rooftop"),
    // Sushi
    v("Sushi Ginza Onodera","Japanese Omakase","One Michelin star, omakase, Beverly Hills, fish from Ginza Tokyo",4.8,f(true,false,false,false,false,false,true,true,false,true),"https://losangeles.sushiginzaonodera.com",34.0736,-118.3990,"sushi"),
    v("n/naka","Japanese Kaiseki","Two Michelin stars, Niki Nakayama's kaiseki with Japanese precision",4.9,f(true,false,false,false,false,false,true,true,false,true),"https://n-naka.com",34.0195,-118.3542,"sushi"),
    v("Sushi Park","Japanese Omakase","Hidden rooftop omakase on Sunset Strip, celebrity secret, outstanding quality",4.7,f(false,false,false,true,true,false,true,false,false,true),"https://sushiparkla.com",34.0917,-118.3770,"sushi"),
    v("Sushi Zo","Japanese Omakase","Pure omakase experience, beautifully fresh fish, artful preparation",4.7,f(false,false,false,true,false,false,true,true,false,true),"https://sushizo.us",34.0195,-118.4912,"sushi"),
    v("Nobu Malibu","Japanese-Peruvian","Oceanfront Nobu, celebrity central on PCH, stunning setting",4.6,f(false,false,true,false,true,false,false,false,false,true),"https://noburestaurants.com/malibu",34.0195,-118.6789,"sushi"),
    v("Kura Revolving Sushi","Japanese","Fun conveyor belt sushi, excellent quality for price",4.4,f(false,false,true,false,false,false,false,false,false,true),"https://kurasushi.com",34.0736,-118.3990,"sushi"),
  ],

  "Las Vegas": [
    v("é by José Andrés","Spanish","8-seat secret restaurant inside Jaleo, two Michelin stars",4.9,f(true,false,true,false,true,false,true,true),"https://cosmopolitanlasvegas.com/restaurants/e-by-jose-andres",36.1097,-115.1740),
    v("Joël Robuchon","French","Three Michelin stars, most awarded restaurant in Vegas",4.9,f(true,false,false,true,false,false,true,true),"https://mgmgrand.com/restaurants/joel-robuchon",36.1024,-115.1710),
    v("Endo Las Vegas","Japanese Omakase","James Beard-nominated Mitsuo Endo hosts 6 guests twice nightly, most rarefied Vegas experience",4.9,f(false,true,false,false,false,false,true,true),"https://endolasvegas.com",36.1600,-115.1400,"sushi"),
    v("Carbone Riviera","Italian Seafood","Major Food Group's stunning Bellagio replacement for Picasso, red Sicilian prawns, 2-lb lobster fettuccine",4.8,f(false,true,true,false,true,false,true,false),"https://carbonelasvegas.com/riviera",36.1131,-115.1739),
    v("Cote Vegas","Korean Steakhouse","Michelin-starred NYC Korean steakhouse at The Venetian, named best steakhouse in North America",4.8,f(true,true,true,false,true,false,true,false),"https://cotevegas.com",36.1199,-115.1730),
    v("Fiola Mare Vegas","Seafood","Michelin-starred Fabio Trabocchi's new Wynn seafood restaurant, replacing Lakeside",4.8,f(true,true,true,false,true,false,true,true),"https://fiolamare.com/las-vegas",36.1270,-115.1659),
    v("Gymkhana Vegas","Indian","London's two-Michelin-star Indian sensation comes to the Strip, extraordinary",4.8,f(true,true,true,false,true,false,true,false),"https://gymkhanavegas.com",36.1097,-115.1750),
    v("Stubborn Seed Vegas","Contemporary American","Michelin-starred Jeremy Ford's tasting menu at Resorts World, seasonal and brilliant",4.7,f(true,true,true,false,false,false,true,true),"https://stubbornseeds.com/las-vegas",36.1271,-115.1641),
    v("Picasso","French-Spanish","Two Michelin stars, Bellagio fountain views, timeless",4.8,f(true,false,false,true,true,false,true,true),"https://bellagio.com/en/restaurants/picasso.html",36.1131,-115.1739),
    v("Bazaar Meat at The Venetian","Spanish Steakhouse","José Andrés' theatrical meat cathedral moves to The Venetian, bigger and bolder",4.7,f(false,true,true,false,true,false,false,false),"https://venetianlasvegas.com/restaurants/bazaar-meat",36.1199,-115.1730),
    v("Maroon","Caribbean Steakhouse","Kwame Onwuachi's jerk-inspired steakhouse, honoring Jamaican Maroon heritage",4.7,f(false,true,true,false,true,false,true,false),"https://maroonlasvegas.com",36.1097,-115.1740),
    v("Nobu at Caesars","Japanese-Peruvian","Celebrity sushi destination on the Strip",4.7,f(false,false,true,false,true,false,false,false),"https://noburestaurants.com/las-vegas",36.1162,-115.1747),
    v("Carbone Las Vegas","Italian-American","NYC's hottest Italian, massive Vegas outpost",4.7,f(false,false,true,false,true,false,true,false),"https://carbonelasvegas.com",36.1097,-115.1750),
    v("Hell's Kitchen","British-American","Gordon Ramsay's best Vegas restaurant, Caesars",4.6,f(false,false,true,false,true,false,false,false),"https://gordonramsayrestaurants.com/hells-kitchen-las-vegas",36.1162,-115.1747),
    v("Bardot Brasserie","French","Michael Mina's stunning Art Deco French brasserie, ARIA",4.7,f(false,false,true,false,true,false,false,false),"https://aria.com/en/restaurants/bardot-brasserie.html",36.1075,-115.1756),
    v("Mastro's Ocean Club","Steakhouse","Crystal clear seafood and steaks, Crystals",4.6,f(false,false,true,false,true,false,false,false),"https://mastrosrestaurants.com/restaurant/ocean-club-las-vegas",36.1055,-115.1756),
    v("The Chandelier","Cocktail Bar","Cosmopolitan's three-story cocktail bar, iconic Vegas",4.6,f(false,false,true,false,true,false,false,false),"https://cosmopolitanlasvegas.com/restaurants/the-chandelier",36.1097,-115.1740,"bar"),
    v("Rosina","Cocktail Bar","Cosmopolitan's chic cocktail lounge, beautiful design",4.5,f(false,false,true,false,true,false,false,true),"https://cosmopolitanlasvegas.com/restaurants/rosina",36.1097,-115.1750,"bar"),
    // Sushi
    v("Kame Japanese Cuisine","Japanese Omakase","Intimate omakase at Resorts World, outstanding quality and sourcing",4.8,f(false,true,false,false,false,false,true,true,false,true),"https://rwlasvegas.com/restaurant/kame",36.1271,-115.1641,"sushi"),
    v("Nobu at Caesars","Japanese-Peruvian","Strip celebrity sushi, Nobu Matsuhisa's classic menu",4.7,f(false,false,true,false,true,false,false,false,false,true),"https://noburestaurants.com/las-vegas",36.1162,-115.1747,"sushi"),
    v("Zuma Las Vegas","Japanese Robatayaki","Rooftop Japanese at the Cosmopolitan, celebrity scene",4.6,f(false,false,true,false,true,false,false,false,false,true),"https://zumarestaurant.com/zuma-las-vegas",36.1097,-115.1740,"sushi"),
    v("Sushi Hiro","Japanese Omakase","Off-Strip intimate omakase, known to locals as the best value sushi in Vegas",4.7,f(false,false,false,true,false,false,true,true,false,true),"https://sushihiro.com",36.1200,-115.1400,"sushi"),
  ],

  "San Francisco": [
    v("Quince","California Italian","Three Michelin stars, Michael Tusk's seasonal masterpiece",4.9,f(true,false,false,true,false,false,true,true),"https://quincerestaurant.com",37.7956,-122.4059),
    v("Atelier Crenn","French","Three Michelin stars, Dominique Crenn's poetic cuisine",4.9,f(true,false,true,false,true,false,true,true),"https://ateliercrenn.com",37.8003,-122.4366),
    v("Benu","Korean-French","Three Michelin stars, Corey Lee's brilliant tasting menu",4.9,f(true,false,false,false,false,false,true,true),"https://benusf.com",37.7854,-122.4017),
    v("Saison","Contemporary American","Three Michelin stars, live fire cooking, extraordinary",4.9,f(true,false,false,false,false,false,true,true),"https://saisonsf.com",37.7749,-122.4039),
    v("Wolfsbane","Contemporary American","2025's most exciting tasting menu, former Lord Stanley owners, Dogpatch stunner",4.8,f(true,true,true,false,false,false,true,true),"https://wolfsbane.com",37.7583,-122.3881),
    v("Arquet","Contemporary American","Michelin-starred Sorrel chef Alex Hong's Ferry Building masterpiece",4.8,f(true,true,true,false,true,false,true,true),"https://arquetsf.com",37.7955,-122.3937),
    v("Lazy Bear","American","Two Michelin stars, communal dinner party format",4.8,f(true,false,true,false,false,false,true,false),"https://lazybearsf.com",37.7643,-122.4175),
    v("Californios","Mexican","Two Michelin stars, fine dining Mexican tasting menu",4.8,f(true,false,true,false,false,false,true,true),"https://californiossf.com",37.7643,-122.4195),
    v("Enclos","California Coastal","Two Michelin stars, 2024 opening, Saison and Quince alums",4.8,f(true,true,false,false,false,false,true,true),"https://enclossf.com",37.7754,-122.4188),
    v("Kokkari Estiatorio","Greek","SF's finest Greek, stunning taverna, impeccable lamb chops, Jackson Square icon",4.8,f(false,false,false,true,true,false,false,true),"https://kokkari.com",37.7956,-122.4039),
    v("Cotogna","Italian","Michael Tusk's rustic Italian sibling to Quince, wood-fired, perfect every time",4.8,f(false,false,false,true,true,false,false,false),"https://cotognasf.com",37.7956,-122.4049),
    v("Nari","Thai","Michelin-starred modern Thai, James Beard nominated",4.7,f(true,true,true,false,false,false,true,false),"https://narithairestaurant.com",37.7861,-122.4328),
    v("Four Kings","Modern Chinese","2025 sensation, Cantonese dishes that don't exist anywhere else in SF",4.8,f(false,true,true,false,true,false,true,false),"https://fourkingssf.com",37.7872,-122.4078),
    v("Verjus","French Wine Bar","Exceptional French wine bar, Jackson Square gem, natural wine haven",4.7,f(false,false,true,false,true,false,false,true),"https://verjussf.com",37.7972,-122.4034),
    v("Bix","Supper Club","Glamorous North Beach supper club since 1988, live jazz nightly, timeless",4.7,f(false,false,false,true,true,true,false,false),"https://bixrestaurant.com",37.7972,-122.4044),
    v("State Bird Provisions","American","Michelin-starred dim sum-style California cuisine",4.7,f(true,false,true,false,false,false,true,false),"https://statebirdsf.com",37.7861,-122.4338),
    v("Zuni Café","Californian","SF institution since 1987, best roast chicken in America",4.7,f(false,false,false,true,true,false,false,true),"https://zunicafe.com",37.7735,-122.4198),
    v("Rich Table","California","Michelin-starred, Evan and Sarah Rich's creative SF gem",4.7,f(true,false,true,false,false,false,true,false),"https://richtablesf.com",37.7735,-122.4198),
    v("Mister Jiu's","Modern Chinese","Brandon Jew's Michelin-starred modern Chinese in historic Chinatown",4.7,f(true,false,true,false,true,false,true,false),"https://misterjius.com",37.7946,-122.4077),
    v("SSAL","Korean-French","Michelin-starred, French technique meets Korean flavors, crab juk and quail",4.7,f(true,true,true,false,false,false,true,true),"https://ssalsf.com",37.7918,-122.4246),
    v("The Happy Crane","Modern Chinese","2025's most-talked-about Hayes Valley opening, technique-driven Cantonese",4.7,f(false,true,true,false,false,false,true,false),"https://thehappycrane.com",37.7769,-122.4207),
    v("Mourad","Moroccan","Michelin-starred Moroccan in SoMa, stunning space",4.6,f(true,false,true,false,true,false,true,true),"https://mouradsf.com",37.7854,-122.4037),
    v("Tosca Cafe","Italian","North Beach landmark, opera music, white Negronis, celebrity haunt",4.6,f(false,false,false,true,true,false,false,false),"https://toscacafesf.com",37.7989,-122.4066),
    v("Original Joe's","Italian-American","North Beach institution since 1937, open kitchen, comfort Italian, beloved by all",4.6,f(false,false,false,true,true,false,false,false),"https://originaljoes.com",37.7989,-122.4056),
    v("Nopa","Californian","SF institution, great for late-night, farm-to-table pioneer since 2006",4.6,f(false,false,false,true,true,false,false,false),"https://nopasf.com",37.7769,-122.4317),
    v("JouJou","French Seafood","Romantic Design District French brasserie, curved booths and raw bar",4.6,f(false,true,true,false,false,false,false,true),"https://joujousf.com",37.7654,-122.4043),
    v("Via Aurelia","Tuscan Italian","David Nayfeld's rustic Tuscan trattoria at Mission Rock",4.6,f(false,true,true,false,false,false,false,false),"https://viaaureliarestaurant.com",37.7754,-122.3888),
    v("Perbacco","Italian","FiDi Italian institution, excellent Barolo list, power lunch",4.5,f(false,false,false,true,true,false,false,true),"https://perbaccosf.com",37.7930,-122.3991),
    v("Meski","Afro-Caribbean","Draymond Green-backed Afro-Caribbean hotspot, tomahawk steak meets injera",4.6,f(false,true,true,false,true,true,false,false),"https://meskisf.com",37.7854,-122.4157),
    v("Side A","American","Former fine-dining chef Parker Brown's casual Mission gem, short rib gnocchi",4.6,f(false,true,false,false,false,true,false,true),"https://sideasf.com",37.7583,-122.4095),
    v("Pacific Union Club","Private Members Club","SF's most prestigious private club, Nob Hill Flood Mansion",4.7,f(false,false,false,true,true,false,true,true,true),"https://pacificunionclub.org",37.7918,-122.4146,"private club"),
    v("The Battery","Private Members Club","SF's premier private social club, tech and finance elite",4.7,f(false,false,false,true,true,false,true,true,true),"https://thebatterysf.com",37.7930,-122.3981,"private club"),
    v("Trick Dog","Cocktail Bar","Rotating thematic menus, SF craft cocktail icon, Mission",4.6,f(false,false,false,true,false,false,false,false),"https://trickdogbar.com",37.7618,-122.4148,"bar"),
    v("Barbarossa","Cocktail Bar","Moody cinematic cocktail bar, FiDi, one of SF's most beautiful rooms",4.7,f(false,false,true,false,true,false,false,true),"https://barbarossalounge.com",37.7930,-122.3991,"bar"),
    v("Moongate Lounge","Chinese Cocktail Bar","Mister Jiu's stunning cocktail lounge, Chinatown, lantern-lit and magical",4.7,f(false,false,true,false,true,false,false,false),"https://moongate.com",37.7946,-122.4077,"bar"),
    v("Smuggler's Cove","Tiki Bar","World-class rum collection, award-winning tiki bar, Hayes Valley",4.6,f(false,false,true,false,true,false,false,false),"https://smugglerscovesf.com",37.7769,-122.4227,"bar"),
    v("Bix","Supper Club Bar","Live jazz nightly, glamorous North Beach bar scene, classic cocktails",4.7,f(false,false,false,true,true,true,false,false),"https://bixrestaurant.com",37.7972,-122.4044,"bar"),
    v("North Star Bar","Cocktail Bar","Cozy North Beach cocktail bar and neighborhood gathering spot",4.5,f(false,false,true,false,false,false,false,true),"https://northstarbarsf.com",37.7989,-122.4066,"bar"),
    v("Vesuvio Café","Bar","North Beach Beat Generation landmark bar since 1948",4.3,f(false,false,false,true,true,false,false,false),"https://vesuvio.com",37.7989,-122.4056,"bar"),
    v("Charmaine's Rooftop Bar","Rooftop Bar","Proper Hotel's stunning rooftop, panoramic city views, best rooftop in SoMa",4.6,f(false,false,true,false,true,false,false,false),"https://properhotel.com/san-francisco/dining/charmaines",37.7749,-122.4089,"rooftop"),
    v("Topside at Hotel VIA","Rooftop Bar","SoMa rooftop overlooking AT&T Park and the Bay, best views in the city",4.6,f(false,false,true,false,true,false,false,false),"https://hotelviarooftop.com",37.7775,-122.3927,"rooftop"),
    v("Reveille Coffee Rooftop","Rooftop Bar","North Beach rooftop with Bay views, daytime coffee to evening cocktails",4.5,f(false,false,true,false,false,false,false,false),"https://reveillecoffee.com",37.7989,-122.4066,"rooftop"),
    v("Alto by Marriott Marquis","Rooftop Bar","Elevated rooftop lounge, Union Square area, sweeping SF skyline views",4.5,f(false,false,true,false,true,false,false,false),"https://altorooftop.com",37.7840,-122.4067,"rooftop"),
    v("Jones","Rooftop Bar","Tenderloin rooftop bar, city views and craft cocktails",4.4,f(false,false,true,false,true,false,false,false),"https://jonesbarsf.com",37.7860,-122.4107,"rooftop"),
    // Sushi
    v("Akiko's","Japanese Omakase","SF's iconic sushi destination since 1987, stunning new space, fish from Toyosu Market",4.8,f(false,false,false,true,true,false,true,true,false,true),"https://akikossf.com",37.7843,-122.3967,"sushi"),
    v("Kusakabe","Japanese Omakase","One Michelin star, Edomae-style sushi, traditional preparation enhancing natural umami",4.8,f(true,false,false,false,false,false,true,true,false,true),"https://kusakabe-sf.com",37.7930,-122.3991,"sushi"),
    v("Ju-Ni","Japanese Omakase","One Michelin star, 12-seat counter, one chef per four guests, intimate and extraordinary",4.8,f(true,false,false,false,false,false,true,true,false,true),"https://juni-sf.com",37.7769,-122.4337,"sushi"),
    v("Robin","Japanese Omakase","Hayes Valley's hottest omakase, playful and creative, A5 Wagyu nigiri",4.7,f(false,false,true,false,true,false,true,false,false,true),"https://robinomakase.com",37.7769,-122.4207,"sushi"),
    v("Ken","Japanese Omakase","Six-seat counter on Divisadero, exclusive dinner party vibe, flawless nigiri",4.8,f(false,false,false,false,false,false,true,true,false,true),"https://kensf.com",37.7769,-122.4337,"sushi"),
    v("Friends Only","Japanese Omakase","10-seat counter by Akiko's team, dry-aged fish — 30-day aged otoro, extraordinary",4.8,f(false,false,false,false,false,false,true,true,false,true),"https://friendsonlysf.com",37.7918,-122.4246,"sushi"),
    v("Ozumo","Japanese","FiDi sushi and robata institution, stunning sake list, premium nigiri",4.6,f(false,false,false,true,true,false,false,false,false,true),"https://ozumo.com",37.7955,-122.3937,"sushi"),
    v("Pabu Izakaya","Japanese Izakaya","FiDi izakaya with world-class sashimi, miso-marinated black cod, lively",4.6,f(false,false,true,false,true,false,false,false,false,true),"https://paburestaurant.com/san-francisco",37.7930,-122.4001,"sushi"),
    v("Tataki Sushi","Sustainable Japanese","SF's first sustainable sushi restaurant since 2008, Pacific Heights, sake toro nigiri essential",4.6,f(false,false,false,true,false,false,false,false,false,true),"https://tatakisushibar.com",37.7918,-122.4386,"sushi"),
    v("Sushi Ran","Japanese","Legendary Bay Area sushi in Sausalito, exceptional sake selection",4.7,f(false,false,false,true,false,false,false,true,false,true),"https://sushiran.com",37.8590,-122.4863,"sushi"),
    v("Chotto Matte","Japanese-Peruvian","Nikkei cuisine in a stunning multi-floor Embarcadero space, lively and buzzy",4.6,f(false,false,true,false,true,false,false,false,false,true),"https://chotto-matte.com/san-francisco",37.7955,-122.3927,"sushi"),
    v("Zentarou","Japanese Omakase","Inner Sunset spa-like sanctuary, buttery toro, A5 wagyu with gold leaf and caviar",4.6,f(false,false,false,false,false,false,true,true,false,true),"https://zentarou.com",37.7618,-122.4648,"sushi"),
  ],

  "Chicago": [
    v("Alinea","Avant-garde","Three Michelin stars, Grant Achatz's theatrical masterpiece",4.9,f(true,false,false,true,true,false,true,true),"https://alinearestaurant.com",41.9138,-87.6506),
    v("Smyth","Contemporary American","Two Michelin stars, John Shields' inventive tasting menu",4.8,f(true,false,true,false,false,false,true,true),"https://smythandtheloyalist.com",41.8914,-87.6522),
    v("Ever","Contemporary American","Two Michelin stars, Curtis Duffy's stunning restaurant",4.8,f(true,false,false,false,false,false,true,true),"https://restaurantever.com",41.8836,-87.6390),
    v("Oriole","Contemporary American","Two Michelin stars, intimate and extraordinary",4.8,f(true,false,false,false,false,false,true,true),"https://oriolechicago.com",41.8836,-87.6380),
    v("Kasama","Filipino","Michelin-starred Filipino, daytime bakery and evening tasting menu",4.8,f(true,true,true,false,false,false,true,false),"https://kasamachicago.com",41.9138,-87.6516),
    v("The Aviary","Cocktail Bar","Grant Achatz's cocktail wonderland, reservations required",4.8,f(false,false,true,false,true,false,true,false),"https://theaviary.com",41.8914,-87.6532,"bar"),
    v("Spiaggia","Italian","One Michelin star, Lake Michigan views, classic",4.7,f(true,false,false,true,true,false,true,true),"https://spiaggiarestaurant.com",41.9001,-87.6279),
    v("Entente","Contemporary American","Michelin-starred, creative and refined Wicker Park",4.7,f(true,false,true,false,false,false,true,true),"https://ententechicago.com",41.9082,-87.6756),
    v("The Loyalist","American Bistro","Smyth's downstairs bar, incredible burgers and cocktails",4.7,f(false,false,true,false,true,false,false,false),"https://smythandtheloyalist.com",41.8914,-87.6522),
    v("Avec","Mediterranean","Small plates and charcuterie, Chicago institution",4.6,f(false,false,false,true,false,false,false,false),"https://avecrestaurant.com",41.8844,-87.6484),
    v("Girl & the Goat","American","Stephanie Izard's James Beard-winning flagship",4.6,f(false,false,true,false,true,false,true,false),"https://girlandthegoat.com",41.8844,-87.6494),
    v("Monteverde","Italian","Sarah Grueneberg's pasta temple",4.6,f(false,false,true,false,true,false,true,false),"https://monteverderestaurant.com",41.8844,-87.6534),
    v("The Violet Hour","Cocktail Bar","Pioneer of the craft cocktail movement, no sign outside",4.7,f(false,false,false,true,false,false,false,true),"https://theviolethour.com",41.9073,-87.6758,"bar"),
    v("Milk Room","Cocktail Bar","8-seat whiskey bar inside Chicago Athletic Association",4.7,f(false,false,false,false,true,false,true,true),"https://chicagoathletichotel.com",41.8836,-87.6252,"bar"),
    v("Gibsons Bar & Steakhouse","Steakhouse","Chicago power steakhouse since 1989, Rush Street",4.5,f(false,false,false,true,true,false,false,false),"https://gibsonssteakhouse.com",41.9012,-87.6298),
    v("Chicago Club","Private Members Club","One of Chicago's oldest private dining clubs",4.6,f(false,false,false,true,true,false,true,true,true),"https://thechicagoclub.org",41.8791,-87.6252,"private club"),
    v("Parachute","American","Beverly Kim's James Beard-winning Avondale gem",4.6,f(false,false,true,false,false,false,true,false),"https://parachuterestaurant.com",41.9386,-87.7103),
    v("Three Dots and a Dash","Tiki Bar","Best tiki bar in Chicago, hidden underground",4.5,f(false,false,true,false,false,true,false,false),"https://threedotsandadash.com",41.8836,-87.6262,"bar"),
    // Sushi
    v("Kyōten","Japanese Omakase","One Michelin star, Chef Otto Phan's extraordinary omakase, Chicago's best",4.9,f(true,false,false,false,false,false,true,true,false,true),"https://kyotenchicago.com",41.9138,-87.6516,"sushi"),
    v("Arami","Japanese","Intimate West Town Japanese, outstanding omakase and izakaya",4.7,f(false,false,false,true,false,false,true,true,false,true),"https://aramichicago.com",41.8914,-87.6772,"sushi"),
    v("Juno","Japanese Omakase","Lincoln Park omakase counter, excellent quality for the price",4.6,f(false,false,false,false,false,false,true,true,false,true),"https://junochicago.com",41.9264,-87.6404,"sushi"),
    v("Momotaro","Japanese","Boka Restaurant Group's stunning River North Japanese",4.6,f(false,false,true,false,true,false,false,false,false,true),"https://momotarochicago.com",41.8914,-87.6522,"sushi"),
  ],

  "Boston": [
    v("Menton","French-Italian","Barbara Lynch's flagship, Michelin starred, Fort Point",4.8,f(true,false,false,true,false,false,true,true),"https://mentonboston.com",42.3493,-71.0475),
    v("O Ya","Japanese Omakase","One Michelin star, extraordinary omakase, best in Boston",4.8,f(true,false,false,false,true,false,true,true),"https://oyarestaurantboston.com",42.3573,-71.0543,"sushi"),
    v("Tasting Counter","Contemporary American","One Michelin star, 12-seat chef's counter, exceptional",4.8,f(true,false,false,false,false,false,true,true),"https://tastingcounter.com",42.3808,-71.1229),
    v("No. 9 Park","French-Italian","Barbara Lynch's South End staple, two Michelin stars",4.7,f(true,false,false,true,true,false,false,true),"https://no9park.com",42.3574,-71.0643),
    v("Saltie Girl","Seafood","Back Bay raw bar and tinned fish, outstanding wine list",4.7,f(false,false,true,false,true,false,true,true),"https://saltiegirl.com",42.3508,-71.0858),
    v("Sarma","Middle Eastern","Ana Sortun's Somerville mezze masterpiece",4.7,f(false,false,true,false,false,false,true,false),"https://sarmarestaurant.com",42.3932,-71.1079),
    v("Bar Vlaha","Greek","Outstanding modern Greek, James Beard nominated",4.7,f(false,true,true,false,false,false,true,false),"https://barvlaha.com",42.3573,-71.0623),
    v("Oleana","Middle Eastern","Ana Sortun's James Beard Award-winning Cambridge gem",4.7,f(false,false,true,false,false,false,true,true),"https://oleanarestaurant.com",42.3662,-71.1009),
    v("Neptune Oyster","Seafood","North End's beloved oyster bar, perpetual line",4.6,f(false,false,false,true,true,false,true,false),"https://neptuneoyster.com",42.3643,-71.0553),
    v("Island Creek Oyster Bar","Seafood","Boston institution, best oysters in the city",4.6,f(false,false,false,true,true,false,false,false),"https://islandcreekoysterbar.com",42.3483,-71.0948),
    v("Craigie on Main","French-American","Whole animal cooking pioneer, Cambridge institution",4.6,f(false,false,false,true,false,false,false,true),"https://craigieonmain.com",42.3642,-71.1019),
    v("Drink","Cocktail Bar","No-menu craft cocktail bar, Fort Point institution",4.7,f(false,false,false,true,false,false,false,false),"https://drinkfortpoint.com",42.3514,-71.0488,"bar"),
    v("The Beehive","American","South End jazz club and restaurant, live music nightly",4.4,f(false,false,false,true,true,true,false,false),"https://beehiveboston.com",42.3413,-71.0703,"bar"),
    v("Harvard Club of Boston","Private Members Club","Cambridge institution, private dining and events",4.5,f(false,false,false,true,true,false,true,true,true),"https://harvardclubboston.com",42.3583,-71.0603,"private club"),
    v("La Padrona","Italian","Jody Adams's glam Italian in Raffles Boston, lobster-uni risotto, Italian villa décor, two-level culinary mecca",4.8,f(false,true,true,false,true,false,true,false),"https://lapradona.com",42.3508,-71.0808),
    v("Fallow Kin","Farm-to-Table","Former Craigie on Main space reborn, farm-to-table dream team, vegetable-centric, zero-waste bar",4.7,f(false,true,true,false,false,false,true,true),"https://fallowkin.com",42.3642,-71.1019),
    v("Zurito","Basque","Beacon Hill Basque gem, pinxtos, sea urchin toast, foie gras plancha, 32oz bone-in ribeye, San Sebastian soul",4.7,f(false,true,true,false,false,false,true,false),"https://zuritobostoncom",42.3574,-71.0693),
    v("Mai","Japanese-French Izakaya","Seaport contemporary izakaya, wagyu tartare with honey miso butter, duck foie gras hand rolls, walk-ins only",4.7,f(false,true,true,false,false,false,false,false),"https://maisushi.com",42.3513,-71.0488),
    v("Seamark","Seafood","Michael Schlow's seafood temple with casino glam, lobster rolls, caviar creations, hidden cocktail bar inside",4.7,f(false,true,true,false,true,false,true,false),"https://seamarkboston.com",42.3508,-71.0808),
    v("Holdfast","Seafood","Two O Ya alums, 20-seat counter, raw and fried New England seafood, outstanding quality",4.7,f(false,true,false,false,false,false,false,false),"https://holdfastboston.com",42.3643,-71.0553),
    v("Little Sage","Italian","Beloved North End original Sage reborn, lobster-stracciatella gnocchi, pasta as good as the 90s",4.6,f(false,true,false,true,false,false,false,false),"https://littlesagebostoncom",42.3643,-71.0553),
    v("Somaek","Korean","Jamie Bissonnette's Korean gastropub, developed with his Korean mother-in-law, kkaennip-jeon and outstanding banchan",4.7,f(false,true,true,false,false,false,false,false),"https://somaekboston.com",42.3554,-71.0610),
    v("Darling","Cocktail Bar","Former Mary Chung's space reborn as molecular cocktail bar and dim sum lounge, daily changing drinks, Cambridge",4.6,f(false,true,true,false,false,false,false,false),"https://darlingcambridge.com",42.3642,-71.1029,"bar"),
    v("89 Charles","Cocktail Bar","Beacon Hill subterranean Art Deco speakeasy, tallow-washed old fashioneds, Revolutionary War-era inspiration",4.7,f(false,true,false,true,false,false,false,true),"https://89charlesbar.com",42.3574,-71.0693,"bar"),
    v("D16","Speakeasy","Hidden basement of old Back Bay police station, perfect cocktails, themed names like Jail Bird, tapas",4.6,f(false,false,true,false,false,false,false,true),"https://d16boston.com",42.3508,-71.0848,"bar"),
    v("Wink & Nod","Cocktail Bar","South End cocktail bar and culinary incubator, rotating resident chefs, creative cocktail program",4.5,f(false,false,true,false,false,false,false,false),"https://winkandnod.com",42.3413,-71.0703,"bar"),
    v("High Street Place Food Hall","Food Hall","Downtown Boston's acclaimed food hall, 20+ vendors, best quick bites in the city — try Brato Brewhouse, Bar Vlaha, and more",4.6,f(false,false,true,false,false,false,false,false),"https://highstreetplace.com",42.3554,-71.0550),
    v("Wa Shin","Japanese Omakase","Theater District newcomer, chef Sky Zheng trained at Michelin-starred Sushi Nakazawa NYC, harmony of the heart",4.8,f(false,true,false,false,false,false,true,true,false,true),"https://washinboston.com",42.3543,-71.0643,"sushi"),
    v("Uni","Japanese Sashimi Bar","One Michelin star, sashimi bar inside Eliot Hotel, Back Bay gem",4.7,f(true,false,false,false,true,false,true,true,false,true),"https://uniboston.com",42.3508,-71.0858,"sushi"),
    v("Oishii Boston","Japanese Omakase","Acclaimed omakase, South End, consistently excellent",4.7,f(false,false,false,true,false,false,true,true,false,true),"https://oishiiboston.com",42.3413,-71.0703,"sushi"),
    v("Ebisuya","Japanese","Medford Japanese institution, locals-only secret, outstanding quality",4.6,f(false,false,false,true,false,false,false,true,false,true),"https://ebisuyarestaurant.com",42.4184,-71.1063,"sushi"),
  ],

  "Washington DC": [
    v("Inn at Little Washington","American Contemporary","Three Michelin stars, Patrick O'Connell's masterpiece",4.9,f(true,false,false,true,true,false,true,true),"https://theinnatlittlewashington.com",38.9072,-77.0369),
    v("Minibar by José Andrés","Avant-garde","Two Michelin stars, 20-course theatrical tasting menu",4.9,f(true,false,true,false,true,false,true,true),"https://minibarbyandres.com",38.8977,-77.0255),
    v("Pineapple and Pearls","Contemporary American","Two Michelin stars, Aaron Silverman's luxury tasting menu",4.8,f(true,false,false,false,false,false,true,true),"https://pineappleandpearls.com",38.8817,-77.0035),
    v("Bresca","Contemporary American","One Michelin star, Ryan Ratino's creative tasting menu",4.8,f(true,false,true,false,false,false,true,true),"https://brescadc.com",38.9098,-77.0321),
    v("Le Diplomate","French Brasserie","DC's most beloved brasserie, perpetual hot spot",4.7,f(false,false,true,false,true,false,true,false),"https://lediplomatedc.com",38.9093,-77.0322),
    v("Fiola","Italian","Fabio Trabocchi's two-Michelin-star Penn Quarter Italian",4.8,f(true,false,false,true,true,false,true,true),"https://fioladc.com",38.8967,-77.0235),
    v("Rasika","Indian","Two locations, best Indian in America, James Beard nominated",4.7,f(false,false,true,false,false,false,true,false),"https://rasikarestaurant.com",38.8987,-77.0195),
    v("Rose's Luxury","American","James Beard Award, Capitol Hill charmer, no reservations",4.7,f(false,false,true,false,false,false,false,false),"https://rosesluxury.com",38.8817,-77.0035),
    v("The Prime Rib","Steakhouse","DC's power steakhouse since 1976, black tie required",4.7,f(false,false,false,true,true,false,false,true),"https://theprimerib.com/dc",38.9008,-77.0445),
    v("Metier","Contemporary American","One Michelin star, intimate tasting menu, Dupont Circle",4.7,f(true,false,false,false,false,false,true,true),"https://metierdc.com",38.9107,-77.0431),
    v("Dabney","Mid-Atlantic","One Michelin star, Jeremiah Langhorne, exceptional local sourcing",4.7,f(true,false,false,false,false,false,true,true),"https://thedabney.com",38.9077,-77.0221),
    v("Columbia Room","Cocktail Bar","Michelin-starred cocktail bar, three distinct spaces",4.8,f(true,false,true,false,false,false,true,true),"https://columbiaroomdc.com",38.9127,-77.0301,"bar"),
    v("Jack Rose Dining Saloon","Whiskey Bar","Adams Morgan whiskey bar, 2,700 bottles",4.6,f(false,false,false,true,true,false,false,false),"https://jackrosediningsaloon.com",38.9217,-77.0381,"bar"),
    v("Off The Record","Bar","Hay-Adams Hotel bar, power drinking below White House",4.5,f(false,false,false,true,true,false,false,true),"https://hayadams.com/dining/off-the-record",38.8987,-77.0375,"bar"),
    v("Metropolitan Club","Private Members Club","One of DC's oldest and most prestigious private clubs",4.6,f(false,false,false,true,true,false,true,true,true),"https://metropolitanclubdc.org",38.9028,-77.0395,"private club"),
    v("Sushi Nakazawa DC","Japanese Omakase","DC outpost of the legendary NYC omakase, exceptional quality",4.8,f(true,false,false,false,false,false,true,true,false,true),"https://sushinakazawa.com/dc",38.9008,-77.0395,"sushi"),
    v("Himitsu","Japanese","Petworth neighborhood omakase, Michelin Bib Gourmand, creative and fun",4.7,f(false,false,true,false,false,false,true,false,false,true),"https://himitsud.com",38.9547,-77.0221,"sushi"),
    v("Nobu Washington DC","Japanese-Peruvian","Georgetown Nobu, celebrity sushi in a beautiful space",4.6,f(false,false,true,false,true,false,false,false,false,true),"https://noburestaurants.com/washington-dc",38.9047,-77.0595,"sushi"),
    v("Masako","Japanese Omakase","New DC omakase counter, acclaimed for exceptional fish sourcing",4.7,f(false,true,false,false,false,false,true,true,false,true),"https://masakodc.com",38.9008,-77.0295,"sushi"),
  ],

  "Scottsdale": [
    v("Bourbon Steak","Steakhouse","Michael Mina's acclaimed steakhouse, butter-poached cuts",4.8,f(false,false,true,false,true,false,true,true),"https://michaelmina.net/restaurants/bourbon-steak-scottsdale",33.5092,-111.8983),
    v("FnB","Arizona Cuisine","Charleen Badman's James Beard-winning farm-to-table",4.8,f(false,false,false,true,false,false,false,true),"https://fnbrestaurant.com",33.4943,-111.9254),
    v("Kai","Native American","Only Native American-owned AAA Five Diamond restaurant",4.8,f(false,false,false,true,false,false,true,true),"https://wildhorsepass.com/kai",33.3012,-111.9462),
    v("Virtù Honest Craft","Mediterranean","James Beard nominated, intimate Old Town gem",4.7,f(false,false,true,false,false,false,true,true),"https://virtuhonestcraft.com",33.4953,-111.9264),
    v("Elements","Contemporary American","Sanctuary Resort's stunning mountain-view restaurant",4.7,f(false,false,false,true,true,false,true,true),"https://sanctuaryoncamelback.com/dining/elements",33.5292,-111.9703),
    v("Maple & Ash Scottsdale","Steakhouse","Chicago hit comes to Scottsdale, wood-fired excellence",4.6,f(false,false,true,false,true,false,false,false),"https://mapleandash.com/scottsdale",33.5002,-111.9264),
    v("Mastro's Steakhouse","Steakhouse","Old Town power dining and live piano entertainment",4.5,f(false,false,true,false,true,true,false,false),"https://mastrosrestaurants.com/restaurant/city-grille-scottsdale",33.4953,-111.9264),
    v("AZ/88","American Bar","Old Town institution, patio and cocktails",4.5,f(false,false,true,false,true,false,false,false),"https://az88.com",33.4943,-111.9264,"bar"),
    v("Sushi Roku","Japanese","Celebrity-friendly sushi, always a scene in Old Town",4.5,f(false,false,true,false,true,false,false,false,false,true),"https://sushiroku.com",33.4948,-111.9232,"sushi"),
    v("Hana Japanese Eatery","Japanese Omakase","Best omakase in Arizona, intimate and brilliant",4.7,f(false,false,false,false,false,false,true,true,false,true),"https://hanajapanese.com",33.4973,-112.0804,"sushi"),
    v("Nobu Scottsdale","Japanese-Peruvian","Scottsdale's celebrity sushi destination, Fashion Square",4.6,f(false,false,true,false,true,false,false,false,false,true),"https://noburestaurants.com/scottsdale",33.5092,-111.8993,"sushi"),
  ],

  "Napa": [
    v("The French Laundry","Contemporary American","Thomas Keller's three-star temple, the pinnacle of American dining, Yountville",4.9,f(true,false,false,true,true,false,true,true),"https://frenchlaundry.com",38.4044,-122.3647),
    v("Auro at Four Seasons","Contemporary American","Three consecutive Michelin stars, Chef Rogelio Garcia, Calistoga",4.9,f(true,true,false,false,false,false,true,true),"https://auronapavalley.com",38.5788,-122.5803),
    v("La Toque","French","One Michelin star, Ken Frank's elegant downtown Napa landmark",4.7,f(true,false,false,true,false,false,true,true),"https://latoque.com",38.2985,-122.2862),
    v("Bouchon Bistro","French Bistro","Thomas Keller's charming Yountville French bistro",4.7,f(false,false,false,true,true,false,false,true),"https://bouchonbistro.com",38.4047,-122.3640),
    v("Ad Hoc","American","Thomas Keller's family-style comfort food, Yountville",4.7,f(false,false,false,true,false,false,false,false),"https://adhocrestaurant.com",38.4055,-122.3647),
    v("Press","Steakhouse","St. Helena's premier steakhouse, legendary wine cellar",4.7,f(false,false,false,true,true,false,false,true),"https://pressnapavalley.com",38.5066,-122.4700),
    v("Slanted Door Napa","Vietnamese","Charles Phan's beloved SF institution now in Napa, outstanding",4.7,f(false,true,true,false,true,false,true,true),"https://slanteddoor.com",38.2975,-122.2862),
    v("Under-Study","American Tapas","Press team's culinary playground, bakery by day, elevated tapas by night",4.7,f(false,true,true,false,false,false,false,false),"https://understudynapa.com",38.2975,-122.2862),
    v("A16 Napa","Italian","SF's acclaimed Neapolitan pizza institution downtown Napa, instant local favorite",4.7,f(false,true,true,false,false,false,false,false),"https://a16napa.com",38.2975,-122.2852),
    v("Carabao","Filipino Fine Dining","French Laundry alum Jade Cunningham's bold Filipino cuisine",4.7,f(false,true,true,false,false,false,true,false),"https://carabaonapa.com",38.2975,-122.2862),
    v("Normandie","French","Opening 2026 — classic French, tableside Dover Sole, world-class martini bar",4.6,f(false,true,false,true,false,false,true,true),"https://normandienapa.com",38.2975,-122.2862),
    v("Michi Japanese Cuisine","Japanese Omakase","16-seat Michelin-level omakase, Chef Michiyo Hagio, Iron Chef protégé",4.7,f(false,true,false,false,false,false,true,true),"https://michijapanese.com",38.2975,-122.2852,"sushi"),
    v("Morimoto Napa","Japanese","Iron Chef's Napa outpost, dramatic space, outstanding sushi",4.6,f(false,false,true,false,true,false,false,false),"https://morimotonapa.com",38.2975,-122.2852),
    v("Cole's Chop House","Steakhouse","Downtown Napa's power steakhouse, perfectly dry-aged cuts",4.6,f(false,false,false,true,true,false,false,true),"https://coleschophouse.com",38.2985,-122.2852),
    v("Oenotri","Southern Italian","Downtown Napa Calabrian pasta, wood-fired excellence",4.6,f(false,false,true,false,false,false,false,false),"https://oenotri.com",38.2985,-122.2862),
    v("Angèle","French Brasserie","Downtown Napa riverfront French brasserie, reliable and charming",4.6,f(false,false,false,true,false,false,false,true),"https://angelerestaurant.com",38.2985,-122.2862),
    v("Mustards Grill","Californian","Napa institution since 1983, best burger in wine country",4.6,f(false,false,false,true,true,false,false,false),"https://mustardsgrill.com",38.4282,-122.3927),
    v("Farmstead at Long Meadow Ranch","Californian","St. Helena winery restaurant, garden-to-table, beautiful barn",4.6,f(false,false,false,true,false,false,false,true),"https://longmeadowranch.com/eat-and-drink/farmstead",38.5066,-122.4690),
    v("Ciccio","Italian","Yountville beloved Italian, reopened under Chef Christopher Kostow",4.6,f(false,true,false,true,false,false,false,false),"https://ciccioyountville.com",38.4047,-122.3637),
    v("Bottega","Italian","Michael Chiarello's Yountville Italian, lively and always packed",4.5,f(false,false,true,false,true,false,false,false),"https://botteganapavalley.com",38.4047,-122.3637),
    v("Redd","Contemporary Californian","Yountville's celebrated wine country restaurant",4.5,f(false,false,true,false,true,false,false,true),"https://reddnapavalley.com",38.4047,-122.3647),
    v("Bistro Jeanty","French Bistro","Yountville's only French-owned bistro, cassoulet perfection",4.5,f(false,false,false,true,false,false,false,true),"https://bistrojeanty.com",38.4047,-122.3637),
    v("Zuzu","Spanish Tapas","Lively downtown Napa tapas bar, outstanding wine list",4.5,f(false,false,false,false,true,false,false,false),"https://zuzunapa.com",38.2975,-122.2852),
    v("Rutherford Grill","American","Classic wine country tavern on Hwy 29, rotisserie chicken institution",4.5,f(false,false,false,true,false,false,false,false),"https://rutherfordgrill.com",38.4597,-122.4117),
    v("The Kitchen at Priest Ranch","American","Yountville rooftop all-day dining, smashburgers and Cab pairings",4.5,f(false,true,true,false,false,false,false,false),"https://thekitchenatpr.com",38.4047,-122.3647),
    v("The Lincoln","American Gastropub","Napa River gastropub, late-night scene, Wagyu and duck fat fries",4.5,f(false,true,true,false,false,false,false,false),"https://thelincolnnapa.com",38.2985,-122.2852),
    v("Scala Osteria","Italian","Bistro Don Giovanni's sister, downtown Napa, fresh pasta",4.5,f(false,false,true,false,false,false,false,false),"https://scalaosteria.com",38.2975,-122.2852),
    v("RH Yountville","American","RH's stunning five-building Yountville compound, wine and design destination",4.6,f(false,false,true,false,true,false,false,false),"https://rh.com/yountville",38.4047,-122.3647),
    v("Bear at Stanly Ranch","Californian","Auberge's stunning Stanly Ranch resort restaurant, farm-to-table with sweeping Napa views",4.7,f(false,true,true,false,true,false,false,true),"https://aubergeresorts.com/stanlyranch/dine/bear",38.2745,-122.3127),
    v("Oakville Grocery","Deli & Lunch","Napa Valley's iconic gourmet market since 1881, perfect picnic provisions",4.5,f(false,false,false,true,true,false,false,false),"https://oakvillegrocery.com",38.4367,-122.4017),
    v("Boon Fly Café","American Diner","Carneros Inn's beloved roadside café, outstanding breakfast and brunch",4.5,f(false,false,false,true,false,false,false,false),"https://boonflycafe.com",38.2445,-122.3627),
    v("Torc","Contemporary American","Downtown Napa tasting menu, excellent value for the quality",4.5,f(false,false,true,false,false,false,true,true),"https://torcnapa.com",38.2985,-122.2852),
    v("Kitchen Door","Eclectic","Oxbow Market's beloved farm-to-table quick-service gem",4.4,f(false,false,true,false,false,false,false,false),"https://kitchendoornapa.com",38.2975,-122.2862),
    v("Grace's Table","Eclectic","Downtown Napa neighborhood gem, great brunch",4.4,f(false,false,false,true,false,false,false,false),"https://gracestable.net",38.2985,-122.2862),
    v("Gott's Roadside","American","Napa Valley's beloved burger stand, Oxbow and St. Helena",4.4,f(false,false,false,true,false,false,false,false),"https://gottsroadside.com",38.2975,-122.2862),
    v("Croccante Artisan Pizza","Pizza","Downtown Napa Detroit-style pizza, fermented pan pizza",4.4,f(false,true,false,false,false,false,false,false),"https://croccantepizza.com",38.2975,-122.2852),
    v("Mothers Tacos","Mexican","Authentic Mexico City-style taqueria, handmade corn tortillas",4.4,f(false,false,true,false,false,false,false,false),"https://motherstacosnapa.com",38.2975,-122.2852),
    v("Akiko's Sushi Napa","Japanese","Napa outpost of the beloved SF sushi institution, fresh and excellent",4.5,f(false,false,false,true,false,false,false,false),"https://akikossushi.com",38.2975,-122.2852,"sushi"),
    v("Trancas Steakhouse","Steakhouse","aka the World's Best — Napa's legendary neighborhood steakhouse",4.6,f(false,false,false,true,true,false,false,false),"https://trancassteakhouse.com",38.3185,-122.2952),
    v("Siam Thai","Thai","Napa's beloved Thai institution, consistently excellent",4.5,f(false,false,false,true,false,false,false,false),"https://siamthainapa.com",38.2975,-122.2852),
    v("Osha Thai","Thai","Popular Thai with great curries and noodles",4.4,f(false,false,false,true,false,false,false,false),"https://oshathai.com",38.2985,-122.2852),
    v("Model Bakery","Bakery","Napa Valley's iconic bakery, legendary English muffins",4.6,f(false,false,false,true,true,false,false,false),"https://themodelbakery.com",38.2985,-122.2862),
    v("Winston's Cafe","Café","Neighborhood café with a Filipino twist, great breakfast and lunch",4.4,f(false,false,false,true,false,false,false,false),"https://winstonscafenapa.com",38.2985,-122.2862),
    v("1331 Bar","Cocktail Bar","Downtown Napa's coolest cocktail bar, local hangout and late-night",4.5,f(false,false,true,false,true,false,false,false),"https://1331napa.com",38.2975,-122.2852,"bar"),
    v("Cadet Wine & Beer Bar","Wine Bar","Downtown Napa wine bar beloved by locals",4.5,f(false,false,true,false,false,false,false,false),"https://cadetwinebar.com",38.2985,-122.2862,"bar"),
    v("Vin en Noir","Wine Bar","Sophisticated downtown Napa wine bar, great for a date night",4.5,f(false,false,true,false,false,false,false,true),"https://vinennoir.com",38.2975,-122.2852,"bar"),
    v("Bounty Hunter Wine Bar","Wine Bar","Downtown Napa wine bar, BBQ and 40+ wines by the glass",4.5,f(false,false,false,true,false,false,false,false),"https://bountyhunterwine.com",38.2985,-122.2852,"bar"),
    v("Barbarossa Napa","Cocktail Bar","Restored historic downtown bar, craft cocktails in a beautiful space",4.5,f(false,false,true,false,false,false,false,false),"https://fagianis.com",38.2975,-122.2862,"bar"),
    v("The Club Room","Cocktail Bar","Napa's only distillery, Art Deco-inspired cocktail lounge, brand new",4.5,f(false,true,true,false,false,false,false,true),"https://theclubroomnapa.com",38.2985,-122.2862,"bar"),
    v("Decadent Wine Bar","Wine Bar","Downtown Napa's newest wine bar, alcoholic and non-alcoholic pairings",4.4,f(false,true,true,false,false,false,false,false),"https://decadentnapa.com",38.2985,-122.2862,"bar"),
    v("Pancha's","Dive Bar","Yountville's legendary dive bar, saved from closure, cash only, beloved by all",4.5,f(false,false,false,true,true,false,false,false),"https://panchasbar.com",38.4047,-122.3647,"bar"),
    v("The Blue Note Napa","Music Bar","Live jazz and blues in Napa's most vibrant music venue",4.5,f(false,false,true,false,true,true,false,false),"https://bluenotenapa.com",38.2985,-122.2862,"bar"),
    v("Housely","Bar","For the Culture — Napa's most vibrant community bar and gathering spot",4.5,f(false,false,true,false,true,true,false,false),"https://housely.com",38.2985,-122.2852,"bar"),
    v("Barnhouse","Bar","Karaoke — Napa's go-to karaoke bar, always a great time",4.3,f(false,false,true,false,false,true,false,false),"https://barnhousenapa.com",38.2975,-122.2852,"bar"),
    v("Stateline","BBQ Bar","BBQ and burnt ends — some of the best smoked meats in Napa Valley",4.5,f(false,false,false,true,false,false,false,false),"https://statelinenapa.com",38.2975,-122.2852,"bar"),
    v("Palisades","Sports Bar","Good for sports — best sports bar in Napa, cold beer and big screens",4.3,f(false,false,false,true,false,true,false,false),"https://palisadesnapa.com",38.2975,-122.2852,"bar"),
    v("Bilco's","Bar","Downtown Napa neighborhood bar, pool tables, cold beer, no pretense",4.3,f(false,false,false,true,false,false,false,false),"https://bilcosnapa.com",38.2975,-122.2852,"bar"),
    v("NapaStak","Sports Bar","Good for sports — lively Napa sports bar, great wings on game day",4.3,f(false,false,false,true,false,true,false,false),"https://napastak.com",38.2975,-122.2852,"bar"),
    v("Downtown Joe's","Brewpub","Downtown Napa riverfront brewpub since 1993, outdoor patio on the river",4.3,f(false,false,false,true,false,true,false,false),"https://downtownjoes.com",38.2985,-122.2852,"bar"),
    v("The Bar at Bardessono","Bar","Yountville boutique hotel bar, beautiful outdoor fire pits",4.5,f(false,false,false,true,false,false,false,true),"https://bardessono.com",38.4057,-122.3647,"bar"),
    v("Michi Japanese Cuisine","Japanese Omakase","16-seat Michelin-level omakase, Chef Michiyo Hagio, Iron Chef protégé, hidden gem",4.7,f(false,true,false,false,false,false,true,true,false,true),"https://michijapanese.com",38.2975,-122.2852,"sushi"),
    v("Morimoto Napa","Japanese","Iron Chef's dramatic Napa outpost, outstanding sushi and robata",4.6,f(false,false,true,false,true,false,false,false,false,true),"https://morimotonapa.com",38.2975,-122.2852,"sushi"),
  ],

  "St. Helena": [
    v("Press","Steakhouse","Napa Valley's premier steakhouse, world-class cellar, power dining",4.8,f(false,false,false,true,true,false,false,true),"https://pressnapavalley.com",38.5066,-122.4700),
    v("Terra","French-Japanese","Hiro Sone's landmark, French-Japanese mastery",4.7,f(false,false,false,true,false,false,true,true),"https://terrarestaurant.com",38.5076,-122.4700),
    v("Farmstead at Long Meadow Ranch","Californian","Garden-to-table winery restaurant, beautiful barn setting",4.7,f(false,false,false,true,false,false,false,true),"https://longmeadowranch.com",38.5066,-122.4690),
    v("The Charter Oak","Californian","Wood-fired seasonal menu, outstanding ingredients",4.7,f(false,false,true,false,false,false,false,true),"https://thecharteroak.com",38.5066,-122.4700),
    v("Charlie's","American","French Laundry alum Elliott Bell's gem, late-night fries and caviar on weekends",4.7,f(false,true,false,false,false,false,false,false),"https://charliessthelenana.com",38.5076,-122.4700),
    v("Violetto","Northern Italian","Michelin-pedigreed Italian at Alila resort, St. Helena's most exciting 2024 opening",4.6,f(false,true,true,false,false,false,true,true),"https://violettorestaurant.com",38.5076,-122.4700),
    v("Cook St. Helena","Italian","Beloved Main Street Italian, outstanding fresh pasta",4.6,f(false,false,false,true,false,false,false,false),"https://cooksthelena.com",38.5076,-122.4700),
    v("Rutherford Kitchen","Californian","Rutherford farm-to-table, beautiful outdoor patio",4.6,f(false,false,true,false,false,false,false,true),"https://rutherfordkitchen.com",38.4597,-122.4117),
    v("Auberge du Soleil","Mediterranean","Romantic hilltop resort dining, sweeping valley views",4.7,f(false,false,false,true,true,false,true,true),"https://aubergedusoleil.com",38.4822,-122.4427),
    v("Market","American","St. Helena neighborhood restaurant, local favorite",4.5,f(false,false,false,true,false,false,false,false),"https://marketsthelena.com",38.5076,-122.4700),
    v("NO|MA House Café","All-Day Café","Gorgeous all-day café on North Main, lemon ricotta waffles",4.5,f(false,true,false,false,false,false,false,false),"https://nomahousecafe.com",38.5076,-122.4700),
    v("Tra Vigne","Italian","Valley landmark since 1987, beautiful courtyard dining",4.4,f(false,false,false,true,false,false,false,true),"https://travignenapavalley.com",38.5063,-122.4699),
    v("Gott's Roadside","American","Napa Valley's beloved burger stand",4.5,f(false,false,false,true,false,false,false,false),"https://gottsroadside.com",38.5076,-122.4700),
    v("Ana's Cantina","Bar & Mexican","St. Helena's beloved dive bar and cantina, cold margaritas and local characters",4.4,f(false,false,false,true,true,false,false,false),"https://anacantina.com",38.5076,-122.4700,"bar"),
    v("Meadowood Croquet Lawn Bar","Bar","Meadowood resort's outdoor evening drinks, stunning setting",4.6,f(false,false,false,true,true,false,false,true),"https://meadowood.com",38.5012,-122.4892,"bar"),
    v("Kōen","Japanese Omakase","St. Helena's intimate omakase counter, outstanding wine country sushi experience",4.6,f(false,false,false,false,false,false,true,true,false,true),"https://koen-sthelena.com",38.5076,-122.4700,"sushi"),
  ],

  "Healdsburg": [
    v("SingleThread","Farm-to-Table","Three Michelin stars, farm-driven kaiseki, extraordinary",4.9,f(true,false,false,true,false,false,true,true),"https://singlethreadfarms.com",38.6110,-122.8698),
    v("Cyrus","French-Californian","Nick Peyton and Douglas Keane's legendary two-star return",4.8,f(true,true,false,true,false,false,true,true),"https://cyrusrestaurant.com",38.6120,-122.8698),
    v("Chalkboard","Contemporary American","Healdsburg's best downtown restaurant after SingleThread",4.7,f(false,false,true,false,false,false,true,false),"https://chalkboardhealdsburg.com",38.6110,-122.8698),
    v("Barndiva","Californian","Arts district garden restaurant, farm-to-table excellence",4.6,f(false,false,true,false,false,false,true,true),"https://barndiva.com",38.6100,-122.8698),
    v("Valette","Contemporary American","Healdsburg chef's homecoming, outstanding local menu",4.6,f(false,false,true,false,false,false,true,false),"https://valettehealdsburg.com",38.6110,-122.8688),
    v("The Matheson","Contemporary American","Healdsburg's celebrated rooftop cocktail bar and restaurant",4.6,f(false,true,true,false,true,false,false,false),"https://thematheson.com",38.6110,-122.8698),
    v("Bravas Bar de Tapas","Spanish","Wine country tapas and cocktails, lively square",4.6,f(false,false,true,false,false,false,false,false),"https://bravashealdsburg.com",38.6100,-122.8688),
    v("Scopa","Italian","Healdsburg's beloved neighborhood Italian",4.6,f(false,false,false,true,false,false,true,false),"https://scopahealdsburg.com",38.6100,-122.8698),
    v("Campo Fina","Italian","Pizza and bocce ball in beautiful garden setting",4.5,f(false,false,true,false,false,false,false,false),"https://campofina.com",38.6110,-122.8688),
    v("Spoonbar","Craft Cocktails","h2hotel's acclaimed cocktail program",4.5,f(false,false,false,true,false,false,false,false),"https://h2hotel.com/spoonbar",38.6104,-122.8693,"bar"),
    v("Duke's Spirited Cocktails","Cocktail Bar","Healdsburg's best cocktail bar, farm-driven drinks",4.5,f(false,false,true,false,false,false,false,false),"https://dukesspiritedcocktails.com",38.6110,-122.8688,"bar"),
    v("Noble Folk Ice Cream","Ice Cream","Artisan ice cream and pie, Healdsburg Square",4.6,f(false,false,false,true,false,false,false,false),"https://thenoblefolk.com",38.6110,-122.8688),
    v("Shed","Californian","Fermentation bar and café, local food system champion",4.5,f(false,false,true,false,false,false,false,true),"https://healdsburgshed.com",38.6110,-122.8688),
    v("Harmon Guest House Sushi","Japanese","Boutique hotel's intimate omakase-inspired sushi counter",4.5,f(false,false,true,false,false,false,true,true,false,true),"https://harmonguesthouse.com",38.6110,-122.8688,"sushi"),
    v("Willi's Seafood & Raw Bar","Seafood & Sushi","Healdsburg seafood and sushi, lively patio, excellent fish",4.5,f(false,false,true,false,false,false,false,false,false,true),"https://willisseafood.net",38.6360,-122.8748,"sushi"),
  ],

  "Calistoga": [
    v("Solbar","California Cuisine","Michelin-starred Solage Auberge resort restaurant",4.8,f(true,false,true,false,false,false,false,true),"https://aubergeresorts.com/solage/dine",38.5788,-122.5803),
    v("Evangeline","New Orleans Creole","Southern charm in wine country, live music",4.6,f(false,true,true,false,false,true,false,false),"https://evangelinecalistoga.com",38.5786,-122.5795),
    v("JoLē","Californian","Calistoga's beloved local fine dining",4.6,f(false,false,false,true,false,false,false,true),"https://jolecalistoga.com",38.5786,-122.5795),
    v("Sam's Social Club","Californian","Indian Springs Resort's casual but excellent restaurant",4.5,f(false,false,true,false,false,false,false,false),"https://indianspringsresort.com/sams-social-club",38.5786,-122.5805),
    v("Tank Garage Winery","Wine Bar","Gas station wine bar, cool Calistoga hangout",4.5,f(false,false,true,false,false,false,false,false),"https://tankgaragewinery.com",38.5796,-122.5795,"bar"),
    v("Hydro Bar & Grill","Bar","Calistoga's classic local bar, draft beer and burgers",4.2,f(false,false,false,true,false,false,false,false),"https://hydrobarandgrill.com",38.5786,-122.5795,"bar"),
    v("Auro Sushi Counter","Japanese","Four Seasons' intimate Japanese counter, exceptional sourcing",4.7,f(false,false,false,false,false,false,true,true,false,true),"https://auronapavalley.com",38.5788,-122.5803,"sushi"),
  ],

  "Sonoma": [
    v("The Girl & The Fig","French Country","Sonoma Square staple, James Beard nominated, beloved",4.7,f(false,false,false,true,false,false,false,true),"https://thegirlandthefig.com",38.2918,-122.4581),
    v("Cafe La Haye","Californian","Sonoma Square tiny gem, James Beard nominated",4.7,f(false,false,false,true,false,false,true,true),"https://cafelahaye.com",38.2918,-122.4571),
    v("Glen Ellen Star","Californian","Ari Weiswasser's Glen Ellen wood-fired gem",4.7,f(false,false,true,false,false,false,true,true),"https://glenellenstar.com",38.3598,-122.5241),
    v("LaSalette","Portuguese","Unique Portuguese flavors in wine country",4.6,f(false,false,false,false,false,false,false,true),"https://lasalette-restaurant.com",38.2920,-122.4575),
    v("El Dorado Kitchen","Californian","El Dorado Hotel's farm-to-table Sonoma gem",4.6,f(false,false,true,false,false,false,false,true),"https://eldoradosonoma.com",38.2918,-122.4581),
    v("The Fig Café","French Californian","Girl & The Fig's casual sister, Glen Ellen",4.6,f(false,false,false,true,false,false,false,true),"https://thefigcafe.com",38.3598,-122.5231),
    v("Backyard","Californian","Forestville gem, outstanding seasonal California fare",4.6,f(false,false,true,false,false,false,true,true),"https://backyardforestville.com",38.4768,-122.9091),
    v("Zazu Kitchen + Farm","Californian","Farm restaurant, Duane Sorenson's Sonoma favorite",4.6,f(false,false,false,true,false,false,false,true),"https://zazukitchen.com",38.3918,-122.7861),
    v("Harvest Moon Café","Californian","Seasonal menus, lovely Sonoma Square patio",4.6,f(false,false,false,true,false,false,false,true),"https://harvestmooncafesonoma.com",38.2928,-122.4581),
    v("The Fremont Diner","American Diner","Sonoma's beloved roadside diner, weekend waits",4.5,f(false,false,false,true,false,false,false,false),"https://thefremontdiner.com",38.2618,-122.4761),
    v("Fern Bar","Wine Bar","Guerneville's charming natural wine bar",4.5,f(false,false,true,false,false,false,false,true),"https://fernbar.com",38.5088,-122.9881,"bar"),
    v("Murphy's Irish Pub","Pub","Sonoma Square pub, live music, local hangout",4.2,f(false,false,false,true,false,true,false,false),"https://sonomamurphys.com",38.2928,-122.4581,"bar"),
    v("Hana Restaurant","Japanese","Rohnert Park outstanding Japanese, best in Sonoma County",4.6,f(false,false,false,true,false,false,false,true,false,true),"https://hanaJapanese.com",38.3398,-122.7011,"sushi"),
    v("Ramen Gaijin","Japanese Ramen & Sushi","Sebastopol's outstanding ramen and izakaya-style sushi",4.5,f(false,false,true,false,false,false,false,false,false,true),"https://ramengaijin.com",38.4018,-122.8261,"sushi"),
  ],

  "NYC": {
    "Le Bernardin": "Les Salons Bernardin (2nd floor, private entrance): 18–80 seated, subdividable. Le Bernardin Privé (ground floor Galleria): up to 200 seated. events@le-bernardin.com",
    "Eleven Madison Park": "Three private rooms: seats 18, 34, or 50. Two overlook main dining room; one has Sol LeWitt installation. Full buyout available. events@elevenmadisonpark.com",
    "Per Se": "East Room: up to 10 (Central Park views). West Room: up to 66 seated / 120 standing (Parisian-inspired). Full restaurant buyout available. privatedining@perseny.com",
    "Masa": "Full counter buyout available for private events. Contact restaurant directly.",
    "Tatiana by Kwame Onwuachi": "Private dining room: 14 seated (main floor, adjustable door for semi or full privacy). Full restaurant: 70 indoor seats. info@tatiananyc.com",
    "Le Veau d'Or": "2nd floor PDR: up to 20 seated. Features original fireplace, grand mirror, private bar, private restroom, and long dining table. $300/guest, $7,500 min. info@lvdnyc.com",
    "Don Angie": "Don's Next Door (adjacent, own entrance/kitchen/cocktail area): up to 18 seated. Full restaurant buyout: up to 50. events@donangie.com",
    "Carbone": "Full restaurant buyout: up to 80 seated / 100 reception. Back Room (semi-private): up to 50. Front Room (semi-private): up to 30. events@majorfood.com",
    "Massara": "Contact restaurant directly for private event options.",
    "La Tête d'Or": "Chef's Tasting Salon: up to 8 guests. Contact restaurant for larger events.",
    "Huso": "Contact restaurant directly for private event options.",
    "Rao's": "No traditional PDR. Extremely limited tables; contact restaurant directly for private events.",
    "Gabriel Kreuther": "Two combinable private dining rooms: 8–150 guests. In-Kitchen Chef's Table (Carte Blanche): up to 6 guests. Events@gknyc.com",
    "Gramercy Tavern": "Private Dining Room (single artisan table, wood-beamed ceiling): up to 22 seated. $4,000 dinner min / $1,000 lunch min. Full restaurant buyout available. events@gramercytavern.com",
    "Daniel": "Bellecour Room: up to 90 seated / 150 standing. Skybox (kitchen view): 4 seats. Main Dining Room buyout: up to 150. events@danielnyc.com",
    "Atomix": "Full chef's counter buyout: up to 15 guests (tasting menu + beverage). Bar Experience (semi-private): up to 6 upstairs. 2 months notice required. events@atomixnyc.com",
    "The Corner Store": "Contact restaurant directly for private event options.",
    "Lilia": "Semi-private dining room: 12–20 guests (seasonal share menu). Full restaurant buyout: ~85 guests. events@lilianewyork.com",
    "Via Carota": "Small private room among wine bottles; contact restaurant for capacity and availability.",
    "Cote": "Undercote (subterranean cocktail bar/lounge): 24 seated / 55 standing. Full/half buyout options. event@cotenyc.com",
    "The Grill": "The Salon: up to 15 seated (round table, Andy Warhol art). The Gallery: up to 22 seated (custom table). Combined: 37. The Pool next door: 180+ seated. events@thegrillnewyork.com",
    "Pastis": "Contact restaurant for private dining and buyout options.",
    "Balthazar": "Contact restaurant directly for private event options.",
    "Raoul's": "Contact restaurant for private/buyout options.",
    "Monkey Bar": "Contact restaurant for private dining options.",
    "Frenchette": "Contact restaurant for private/buyout options (Le Rock sister has 16-seat PDR).",
    "Borgo": "Contact restaurant for private event options.",
  },

  "Palo Alto": {
    "Baumé": "Intimate 18-seat restaurant; contact for full buyout options. maisonbaume.com",
    "Protégé": "Private Dining Room: up to 10 guests (5-course tasting menu). Full restaurant buyout: up to 45. events@protegepaloalto.com",
    "Evvia Estiatorio": "Indoor dining room buyout: 90 seated. Covered outdoor patio: 40 seated. Full restaurant: up to 130. Large parties (indoor 18, outdoor 26) without buyout. events@evvia.net",
    "Zola": "Full venue buyout: up to 64 guests (indoor + outdoor + bar). Contact restaurant directly.",
    "Tamarine": "Contact restaurant for private event options.",
    "Bird Dog": "Contact restaurant for private event options.",
    "Pizzeria Delfina": "Full restaurant buyout: ~2,000 sq ft indoor/outdoor. Contact restaurant.",
    "The Rose & Crown": "Pub setting; contact for private event or buyout options.",
    "Nobu Palo Alto": "Contact restaurant for private dining room details.",
    "Fuki Sushi": "Contact restaurant for private event options.",
    "Sushi Sus": "Intimate omakase counter; contact for full buyout.",
  },
  "Washington DC": {
    "Inn at Little Washington": "Full restaurant and inn available for exclusive buyouts; contact for details. theinnatlittlewashington.com",
    "Minibar by José Andrés": "Intimate 12-seat counter experience; contact for private buyout. reservations@minibarbyandres.com",
    "Pineapple and Pearls": "Intimate restaurant; contact for private buyout options.",
    "Bresca": "Full restaurant buyout: up to 70 seated / 115 standing. Groups of 8–16 by arrangement. events@brescadc.com",
    "Le Diplomate": "Private dining for up to 60 guests. Contact restaurant for details.",
    "Fiola": "Luca Room: 12–14 guests. Alice Room: 16 guests. Combined: 26 guests. Custom menus. events@fioladc.com",
    "Rasika": "Rasika West End: Library (36), Garden Room (12), Chef's Table Room (12, where Obama celebrated). Contact for details.",
    "Rose's Luxury": "Penthouse: up to 40 guests. Various semi-private options. Contact restaurant.",
    "The Prime Rib": "Contact restaurant for private dining and buyout options.",
    "Dabney": "Contact restaurant for private event options.",
    "Columbia Room": "Michelin-starred cocktail bar; contact for private event options.",
    "Sushi Nakazawa DC": "Contact restaurant for private event options.",
    "Nobu Washington DC": "Contact restaurant for private dining room details.",
    "Masako": "Contact restaurant for private event options.",
  },
  "Santa Monica": {
    "Melisse": "Intimate 14-seat restaurant with open kitchen; no traditional PDR. Full restaurant buyout available. Contact restaurant directly.",
    "Dialogue": "Intimate tasting menu restaurant; contact for full buyout options.",
    "Rustic Canyon": "Sidewalk patio: up to 12 (semi-private). Full restaurant buyout: up to 120. events@rusticcanyonfamily.com",
    "Pasjoli": "Private dining room: 20 guests. Wine room: 40 guests. Full restaurant buyout: 120 guests. Contact restaurant.",
    "Giorgio Baldi": "Private room available; contact restaurant directly for capacity and booking.",
    "Cassia": "Now closed permanently. (Was: Private dining room 20 seated, Wine Room 30–50, full buyout 115–160 seated.)",
    "Bay Cities Italian Deli": "No private dining; casual deli format.",
    "Huckleberry Café": "Contact Rustic Canyon Family events team for catering and buyout options.",
    "Openaire": "Multiple event spaces. Contact restaurant for private dining options.",
    "Nobu Malibu": "Private Dining Room: up to 30 (Pacific Ocean views, floor-to-ceiling windows). Fireplace Patio: 50. Combined: 80. Full restaurant buyout: 6,000 sq ft. events.malibu@noburestaurants.com",
    "Sugarfish Santa Monica": "No private dining; casual counter format.",
    "Sushi Zo Santa Monica": "Contact restaurant for private event options.",
  },

  "Menlo Park": [
    v("Madera","Contemporary American","Rosewood Sand Hill's acclaimed restaurant, VC crowd",4.8,f(false,false,true,false,true,false,true,true),"https://rosewoodhotels.com/en/sand-hill-menlo-park/dining/madera",37.4133,-122.1978),
    v("Village Pub","Californian","Woodside one Michelin star, beautiful fine dining pub",4.7,f(true,false,false,true,true,false,true,true),"https://thevillagepub.net",37.4307,-122.2548),
    v("LB Steak","Steakhouse","Peninsula power dining, Sand Hill Road scene",4.6,f(false,false,true,false,true,false,false,false),"https://lbsteak.com",37.4531,-122.1819),
    v("Refuge","Sandwiches & Beer","Legendary pastrami and craft beer, local institution",4.7,f(false,false,false,true,false,false,false,false),"https://refugemenlopark.com",37.4527,-122.1822),
    v("Flea St. Cafe","California Cuisine","Farm-to-table pioneer, Jesse Ziff Cool's legacy",4.6,f(false,false,false,true,false,false,false,true),"https://fleastreetcafe.com",37.4489,-122.1851),
    v("Camper","Californian","Beloved Menlo Park seasonal American",4.5,f(false,false,true,false,false,false,true,false),"https://campermenlpark.com",37.4527,-122.1822),
    v("Donato Enoteca","Italian","Redwood City Italian wine bar, outstanding cicchetti",4.6,f(false,false,false,true,false,false,false,true),"https://donatoenoteca.com",37.4922,-122.2227),
    v("Bucks of Woodside","American","Iconic Silicon Valley power breakfast diner",4.3,f(false,false,false,true,true,false,false,false),"https://buckswoodside.com",37.4307,-122.2548),
    v("Robin Menlo Park","Japanese Omakase","Peninsula outpost of SF's acclaimed Hayes Valley omakase",4.7,f(false,false,true,false,true,false,true,false,false,true),"https://robinomakase.com/menlo-park",37.4527,-122.1822,"sushi"),
    v("Naomi Sushi","Japanese","Long-standing Japanese institution in Menlo Park",4.4,f(false,false,false,true,false,false,false,false,false,true),"https://naomisushi.com",37.4527,-122.1822,"sushi"),
    v("Sushi Sus","Japanese Omakase","Best omakase counter in Palo Alto area, excellent fish",4.6,f(false,false,false,false,false,false,true,true,false,true),"https://sushisus.com",37.4440,-122.1610,"sushi"),
  ],

  "Palo Alto": [
    v("Baumé","French Contemporary","Two Michelin stars, most ambitious tasting menu on Peninsula",4.9,f(true,false,false,false,false,false,true,true),"https://maisonbaume.com",37.4419,-122.1430),
    v("Protégé","Contemporary American","James Beard nominated, elegant downtown tasting menu",4.7,f(false,false,true,false,false,false,true,true),"https://protegepa.com",37.4440,-122.1610),
    v("Evvia Estiatorio","Greek","Beloved Greek, tech titans' power lunch",4.7,f(false,false,false,true,true,false,false,false),"https://evvia.net",37.4446,-122.1613),
    v("Zola","French","Downtown Palo Alto French, best in class",4.6,f(false,false,true,false,false,false,true,true),"https://zolapaloalto.com",37.4440,-122.1600),
    v("Tamarine","Vietnamese","Palo Alto's best Vietnamese, celebrated for years",4.6,f(false,false,false,true,false,false,false,true),"https://tamarinerestaurant.com",37.4440,-122.1600),
    v("Bird Dog","Japanese-American","Michelin Bib Gourmand, creative Palo Alto spot",4.6,f(false,false,true,false,false,false,true,false),"https://birddogpa.com",37.4440,-122.1600),
    v("Pizzeria Delfina","Italian","Palo Alto outpost of SF's beloved pizzeria",4.5,f(false,false,false,true,false,false,false,false),"https://pizzeriadelfina.com/palo-alto",37.4440,-122.1610),
    v("The Rose & Crown","British Pub","Palo Alto's beloved British pub, quiz nights",4.4,f(false,false,false,true,false,true,false,false),"https://roseandcrownpa.com",37.4440,-122.1610,"bar"),
    v("Nobu Palo Alto","Japanese-Peruvian","Nobu's Peninsula outpost, tech celebrity sushi",4.6,f(false,false,true,false,true,false,false,false,false,true),"https://noburestaurants.com/palo-alto",37.4480,-122.1601,"sushi"),
    v("Fuki Sushi","Japanese","Palo Alto Japanese institution since 1972",4.4,f(false,false,false,true,true,false,false,false,false,true),"https://fukisushi.com",37.4480,-122.1591,"sushi"),
    v("Sushi Sus","Japanese Omakase","Intimate omakase counter, best sushi in Palo Alto",4.6,f(false,false,false,false,false,false,true,true,false,true),"https://sushisus.com",37.4440,-122.1610,"sushi"),
    v("Nopalito Sushi","Japanese","Downtown sushi, reliable and excellent value",4.4,f(false,false,false,true,false,false,false,false,false,true),"https://sushidowntownpa.com",37.4440,-122.1600,"sushi"),
  ],

  "Santa Monica": [
    v("Melisse","French Contemporary","Two Michelin stars, Josiah Citrin's LA finest French",4.9,f(true,false,false,true,true,false,true,true),"https://melisse.com",34.0195,-118.4912),
    v("Dialogue","Contemporary American","Dave Beran's Michelin-starred counter, outstanding",4.8,f(true,false,true,false,false,false,true,true),"https://dialoguedining.com",34.0195,-118.4912),
    v("Rustic Canyon","California","Jeremy Fox's acclaimed farm-to-table, Pico Blvd gem",4.7,f(false,false,false,true,false,false,false,true),"https://rusticcanyonwinebar.com",34.0195,-118.4892),
    v("Pasjoli","French","Dave Beran's acclaimed French bistro, Santa Monica's most romantic room",4.7,f(false,false,false,false,false,false,true,true),"https://pasjoli.com",34.0175,-118.4922),
    v("Giorgio Baldi","Italian","Santa Monica's beloved 36-year Italian institution, celebrity magnet",4.7,f(false,false,false,true,true,false,true,true),"https://giorgiobaldi.com",34.0175,-118.5042),
    v("Cassia","Southeast Asian","Chef Bryant Ng's acclaimed Vietnamese-French",4.6,f(false,false,true,false,true,false,true,false),"https://cassiarestaurant.com",34.0215,-118.4872),
    v("Bay Cities Italian Deli","Italian Deli","Best Italian deli in LA, legendary Godmother sandwich",4.6,f(false,false,false,true,true,false,true,false),"https://baycitiesitaliandeli.com",34.0175,-118.4832),
    v("Father's Office","Gastropub","Best craft beer bar in LA with legendary blue cheese burger",4.6,f(false,false,false,true,true,false,false,false),"https://fathersoffice.com",34.0175,-118.4832,"bar"),
    v("Chez Jay","American Dive","Beloved dive bar since 1959, Sinatra's table still reserved",4.5,f(false,false,false,true,true,false,false,false),"https://chezjays.com",34.0168,-118.4991,"bar"),
    v("Huckleberry Café","American","Santa Monica's best bakery and all-day café",4.6,f(false,false,false,true,false,false,false,false),"https://huckleberrycafe.com",34.0175,-118.4832),
    v("Openaire","Mediterranean","Kinney Hotel's stunning glass-retractable-roof restaurant",4.6,f(false,false,true,false,true,false,false,false),"https://openairela.com",34.0195,-118.4912),
    v("Nobu Malibu","Japanese-Peruvian","Oceanfront Nobu on PCH, celebrity central, stunning setting",4.6,f(false,false,true,false,true,false,false,false,false,true),"https://noburestaurants.com/malibu",34.0195,-118.6789,"sushi"),
    v("Sugarfish Santa Monica","Japanese Omakase","LA's best-value omakase, multiple locations, always outstanding",4.5,f(false,false,false,true,false,false,false,false,false,true),"https://sugarfishsushi.com",34.0175,-118.4922,"sushi"),
    v("Sushi Zo Santa Monica","Japanese Omakase","Pure omakase experience, beautifully fresh fish",4.7,f(false,false,false,true,false,false,true,true,false,true),"https://sushizo.us",34.0195,-118.4912,"sushi"),
  ],

  "Venice CA": [
    v("Felix Trattoria","Italian","Best pizza in LA, Venetian-style, acclaimed by all",4.7,f(false,false,true,false,true,false,true,false),"https://felixla.com",33.9906,-118.4709),
    v("Gjelina","California","Venice institution, farm-to-table, always packed",4.7,f(false,false,false,true,true,false,true,false),"https://gjelina.com",33.9905,-118.4714),
    v("Gjusta","Bakery/Deli","Celebrity hangout bakery and deli, perpetual lines",4.7,f(false,false,false,true,true,false,false,false),"https://gjusta.com",33.9901,-118.4710),
    v("The Tasting Kitchen","California","Seasonal California, intimate Abbott Kinney",4.5,f(false,false,false,true,false,false,false,true),"https://thetastingkitchen.com",33.9905,-118.4700),
    v("Esters Wine Shop & Bar","Wine Bar","Outstanding natural wine bar, Pico Blvd gem",4.6,f(false,false,true,false,false,false,false,true),"https://esterswine.com",34.0025,-118.4730,"bar"),
    v("Townhouse","Bar","Venice dive bar institution since 1915, basement DJs",4.3,f(false,false,true,false,true,true,false,false),"https://townhousevenice.com",33.9920,-118.4730,"bar"),
    v("The Other Room","Cocktail Bar","Craft cocktail bar, Venice's best spirits list",4.5,f(false,false,false,true,false,false,false,false),"https://theotherroom.com",33.9906,-118.4719,"bar"),
    v("Intelligentsia Venice","Coffee","Best espresso on the Westside, Abbot Kinney",4.6,f(false,false,false,true,true,false,false,false),"https://intelligentsiacoffee.com/locations/venice-coffeebar",33.9906,-118.4709),
    v("Sidecar Doughnuts","Bakery","Best doughnuts in LA, perpetual line worth joining",4.6,f(false,false,false,true,true,false,false,false),"https://sidecardoughnuts.com",33.9906,-118.4709),
    v("Wabi Sabi","Japanese Omakase","Venice Japanese institution, intimate omakase and excellent sushi",4.5,f(false,false,false,true,false,false,false,false,false,true),"https://wabisabirestaurant.com",33.9906,-118.4709,"sushi"),
    v("Sugarfish Venice","Japanese Omakase","Venice outpost of LA's best-value omakase",4.5,f(false,false,false,true,false,false,false,false,false,true),"https://sugarfishsushi.com",33.9906,-118.4709,"sushi"),
  ],

  "West Palm Beach": [
    v("Buccan","Small Plates","Palm Beach's best restaurant, Clay Conley's flagship",4.8,f(false,false,true,false,true,false,true,false),"https://buccanpalmbeach.com",26.7041,-80.0378),
    v("Cafe Boulud Palm Beach","French","Daniel Boulud's Brazilian Court outpost",4.7,f(false,false,false,true,true,false,true,true),"https://cafeboulud.com/palmbeach",26.7041,-80.0358),
    v("Meat Market Palm Beach","Steakhouse","Upscale steakhouse on Worth Avenue, power scene",4.6,f(false,false,true,false,true,false,false,false),"https://meatmarket.net",26.7153,-80.0534),
    v("HMF at The Breakers","American","The Breakers Hotel's spectacular bar and restaurant",4.7,f(false,false,false,true,true,false,false,true),"https://thebreakers.com/dining/hmf",26.7041,-80.0348),
    v("Bice Palm Beach","Italian","Worth Avenue Italian power dining, society crowd",4.6,f(false,false,false,true,true,false,false,true),"https://bicepalmbeach.com",26.7041,-80.0378),
    v("Pistache French Bistro","French","Waterfront bistro, Clematis St., WPB's best French",4.6,f(false,false,false,true,false,false,false,true),"https://pistachewpb.com",26.7148,-80.0541),
    v("The Regional Kitchen","Southern American","James Beard nominated, downtown WPB Southern",4.6,f(false,false,true,false,false,false,false,false),"https://eatregional.com",26.7157,-80.0527),
    v("Respite at the Ben","Cocktail Bar","Rooftop bar, West Palm skyline views, creative cocktails",4.5,f(false,true,true,false,false,true,false,false),"https://thebenwestpalmbeach.com",26.7148,-80.0541,"rooftop"),
    v("The Breakers Ocean Club","Private Members Club","The Breakers Hotel private club facilities and dining",4.7,f(false,false,false,true,true,false,true,true,true),"https://thebreakers.com",26.7041,-80.0338,"private club"),
    v("E.R. Bradley's Saloon","Bar","WPB's landmark waterfront bar since 1892",4.3,f(false,false,false,true,false,true,false,false),"https://erbradleys.com",26.7148,-80.0541,"bar"),
    v("Taru Nikkei","Japanese-Peruvian Omakase","Palm Beach's most acclaimed omakase, Nikkei fusion excellence",4.7,f(false,false,true,false,false,false,true,true,false,true),"https://tarunikkei.com",26.7041,-80.0378,"sushi"),
    v("Imoto","Japanese","Clay Conley's Japanese sibling to Buccan, excellent sushi and small plates",4.7,f(false,false,true,false,true,false,true,false,false,true),"https://imotopalmbeach.com",26.7041,-80.0378,"sushi"),
    v("Nobu Palm Beach","Japanese-Peruvian","Nobu's Palm Beach outpost at Rosewood Miramar-adjacent",4.6,f(false,false,true,false,true,false,false,false,false,true),"https://noburestaurants.com/palm-beach",26.7041,-80.0358,"sushi"),
  ],

  "Fort Lauderdale": [
    v("Louie Bossi's","Italian","Lively Italian on Las Olas, fresh pasta and great energy",4.6,f(false,false,true,false,false,true,false,false),"https://louiebossi.com",26.1192,-80.1375),
    v("Steak 954","Steakhouse","W Hotel's dramatic steakhouse with jellyfish tank wall",4.6,f(false,false,true,false,true,false,false,false),"https://steak954.com",26.1226,-80.1040),
    v("Burlock Coast","American Coastal","Ritz-Carlton Fort Lauderdale's acclaimed restaurant",4.7,f(false,false,true,false,true,false,false,true),"https://burlockcoast.com",26.1226,-80.1030),
    v("Casa D'Angelo","Italian","Old-school Italian fine dining, Angelo Elia's flagship",4.6,f(false,false,false,true,true,false,false,true),"https://casa-d-angelo.com",26.1566,-80.1220),
    v("Olio e Limone","Italian","South Florida's finest upscale Italian",4.6,f(false,false,false,true,true,false,false,true),"https://olioelimone.com",26.1192,-80.1385),
    v("The Boatyard","Seafood","Waterfront seafood, yachts docking tableside",4.5,f(false,false,false,true,false,true,false,false),"https://boatyardrestaurant.com",26.0998,-80.1140),
    v("Kaluz Restaurant","American","Intracoastal waterway dining, spectacular sunsets",4.5,f(false,false,true,false,false,false,false,true),"https://kaluzrestaurant.com",26.0938,-80.1360),
    v("Sbraga & Company","American","Kevin Sbraga's Fort Lauderdale flagship",4.5,f(false,false,true,false,false,false,true,false),"https://sbragaandcompany.com",26.1192,-80.1385),
    v("Rooftop @1WLO","Rooftop Bar","Fort Lauderdale's best rooftop bar, panoramic views",4.4,f(false,false,true,false,true,false,false,false),"https://1wlo.com",26.1201,-80.1375,"rooftop"),
    v("Boho Ft Lauderdale","Cocktail Bar","East Las Olas craft cocktail bar",4.5,f(false,false,true,false,false,false,false,false),"https://bohoftl.com",26.1192,-80.1375,"bar"),
    v("Batch Gastropub","Gastropub","Craft beer and excellent burgers, Las Olas",4.4,f(false,false,true,false,false,true,false,false),"https://batchgastropub.com",26.1188,-80.1381,"bar"),
    v("Yasu Omakase Fort Lauderdale","Japanese Omakase","Intimate omakase counter, Fort Lauderdale's finest sushi experience",4.7,f(false,false,false,false,false,false,true,true,false,true),"https://yasuomakase.com",26.1192,-80.1375,"sushi"),
    v("Steak 954 Sushi Bar","Japanese","W Hotel's acclaimed sushi bar, excellent nigiri alongside steaks",4.5,f(false,false,true,false,true,false,false,false,false,true),"https://steak954.com",26.1226,-80.1040,"sushi"),
    v("Nobu Fort Lauderdale","Japanese-Peruvian","Nobu's Broward outpost, celebrity sushi destination",4.5,f(false,false,true,false,true,false,false,false,false,true),"https://noburestaurants.com/fort-lauderdale",26.1192,-80.1375,"sushi"),
  ],

  "Barcelona": [
    v("Disfrutar","Avant-garde","Three Michelin stars, world's #1 restaurant, former elBulli team",4.9,f(true,true,true,false,true,false,true,true),"https://disfrutarbarcelona.com",41.3891,-2.1558),
    v("Lasarte","Contemporary Basque","Three Michelin stars, Martin Berasategui, Eixample",4.9,f(true,false,false,true,false,false,true,true),"https://restaurantlasarte.com",41.3871,-2.1538),
    v("Moments","Catalan","Two Michelin stars, Mandarin Oriental, Carme Ruscalleda",4.8,f(true,false,false,true,true,false,true,true),"https://mandarinoriental.com/barcelona",41.3921,-2.1638),
    v("Tickets","Avant-garde Tapas","Albert Adrià's impossible-to-book tapas, elBulli DNA",4.8,f(false,false,true,false,true,false,true,false),"https://ticketsbar.es",41.3761,-2.1698),
    v("Enigma","Avant-garde","Albert Adrià's otherworldly tasting experience",4.7,f(false,false,true,false,true,false,true,true),"https://enigmaconcept.es",41.3791,-2.1608),
    v("El Nacional","Multi-concept","Four restaurants in one stunning Art Deco space",4.6,f(false,false,true,false,true,true,false,false),"https://elnacional.cat",41.3896,-2.1686),
    v("Bodega Sepúlveda","Catalan Wine Bar","Old-school bodega, locals love it, timeless",4.5,f(false,false,false,true,false,false,false,true),"https://bodegasepulveda.com",41.3801,-2.1558),
    v("Dry Martini","Cocktail Bar","Barcelona's most elegant cocktail bar since 1978",4.6,f(false,false,false,true,true,false,false,true),"https://drymartiniorg.com",41.3921,-2.1478,"bar"),
    v("Bar Marsella","Absinthe Bar","Oldest bar in Barcelona since 1820, atmospheric and historic",4.4,f(false,false,false,true,true,false,false,false),"https://barmarsella.es",41.3791,-2.1748,"bar"),
    v("Koy Shunka","Japanese Omakase","One Michelin star, Barcelona's finest omakase, exceptional Japanese technique",4.8,f(true,false,false,false,false,false,true,true,false,true),"https://koyshunka.com",41.3841,-2.1768,"sushi"),
    v("Shunka","Japanese","Koy Shunka's casual sibling, outstanding quality",4.6,f(false,false,false,true,false,false,true,false,false,true),"https://koyshunka.com/shunka",41.3841,-2.1758,"sushi"),
    v("Nobu Barcelona","Japanese-Peruvian","Celebrity sushi at Nobu's Barcelona outpost",4.5,f(false,false,true,false,true,false,false,false,false,true),"https://noburestaurants.com/barcelona",41.3921,-2.1638,"sushi"),
  ],

  // ============================================================
  // CANNES — MASSIVELY EXPANDED
  // ============================================================
  "Cannes": [
    v("La Palme d'Or","French Riviera","Two Michelin stars, Hotel Martinez, film festival icon, pinnacle of Cannes dining",4.9,f(true,false,false,true,true,false,true,true),"https://hotel-martinez.hyatt.com",43.5490,-7.0186),
    v("Mantel","French Contemporary","One Michelin star, Nicolas Decherchi's inventive Riviera cuisine, intimate and exceptional",4.8,f(true,false,true,false,false,false,true,true),"https://restaurantmantel.com",43.5508,-7.0176),
    v("Mirazur","French Mediterranean","Three Michelin stars, Mauro Colagreco's Menton masterpiece — 20 min from Cannes, world's top 5",4.9,f(true,false,false,true,true,false,true,true),"https://mirazur.fr",43.7740,-7.5125),
    v("La Môme","French Mediterranean","Luxury rooftop restaurant and terrace, Grand Hyatt Cannes Carlton, film festival crowd",4.7,f(false,true,true,false,true,false,true,false),"https://lamome-cannes.com",43.5490,-7.0196),
    v("Sea Sens","French Riviera Rooftop","Rooftop restaurant at Five Seas Hotel, contemporary French cuisine with panoramic Cannes views",4.7,f(false,true,true,false,true,false,true,false),"https://five-seas-hotel-cannes.com/en/restaurant",43.5518,-7.0186),
    v("Mauro Colagreco Beach Restaurant","Mediterranean Beach","The three-star chef's casual beach concept, sustainable seafood and Riviera flavors at the shore",4.7,f(false,true,true,false,true,false,true,false),"https://mirazur.fr",43.5479,-7.0215),
    v("Table 22","French Contemporary","Chef Noël Mantel's second address, tasting menus in an intimate setting, new Cannes gem",4.7,f(false,true,true,false,false,false,true,true),"https://table22cannes.com",43.5518,-7.0186),
    v("Fouquet's Cannes","French Brasserie","Film festival HQ, Majestic Barrière hotel, the power table of the Croisette",4.6,f(false,false,false,true,true,false,false,false),"https://fouquets-cannes.com",43.5490,-7.0176),
    v("Aux Bons Enfants","French Bistro","Cannes institution since 1935, cash only, legendary, beloved by locals",4.6,f(false,false,false,true,false,false,false,false),"https://auxbonsenfants.net",43.5518,-7.0196),
    v("L'Oasis","French Riviera","Historical La Napoule restaurant, lobster and sea views, 15 min from Cannes",4.6,f(false,false,false,true,false,false,false,true),"https://oasis-raimbault.com",43.5160,-6.9560),
    v("Baoli Beach","Mediterranean Beach Club","Glamorous festival beach club, celebrity epicenter, the see-and-be-seen spot",4.5,f(false,false,true,false,true,true,false,false),"https://baolicannes.com",43.5479,-7.0225),
    v("Zucca","Italian Riviera","Charming Italian trattoria beloved by locals and festival regulars, excellent pasta",4.6,f(false,false,false,true,true,false,false,false),"https://zucca-cannes.com",43.5518,-7.0196),
    v("Le Park 45","Contemporary French","Grand Hotel's restaurant, Michelin-cited, Croisette views, tasting menus",4.6,f(false,false,true,false,true,false,true,true),"https://grand-hotel-cannes.com",43.5490,-7.0186),
    v("La Mère Besson","Provençal","Classic Provençal bistro, hearty fish soup, one of Cannes' oldest restaurants",4.5,f(false,false,false,true,false,false,false,false),"https://lamerbesson.com",43.5518,-7.0196),
    v("Le Comptoir des Vins","Wine Bar & Bistro","Outstanding wine selection, charcuterie and cheese, Le Suquet neighborhood gem",4.6,f(false,false,false,true,false,false,false,true),"https://lecomptoirdesvinscannes.com",43.5518,-7.0196),
    v("La Cave","Wine Bar","Best wine bar in Cannes, natural and local bottles, great atmosphere",4.5,f(false,false,true,false,false,false,false,true),"https://lacavecannes.com",43.5518,-7.0196,"bar"),
    v("3.14 Club Rooftop","Rooftop Bar","3.14 Hotel's stunning rooftop pool bar, panoramic Cannes and sea views, festival hotspot",4.6,f(false,false,true,false,true,false,false,false),"https://3-14hotel.com",43.5490,-7.0196,"rooftop"),
    v("Morrison's Irish Pub","Pub","The festival crowd's go-to late night pub, lively after-parties, live music",4.3,f(false,false,false,true,false,true,false,false),"https://morrisonspub.com",43.5508,-7.0196,"bar"),
    v("Hôtel Barrière Le Majestic Bar","Hotel Bar","The Croisette's most glamorous hotel bar, perfect for festival season Champagne",4.6,f(false,false,false,true,true,false,false,false),"https://hotelsbarriere.com/fr/cannes/le-majestic",43.5490,-7.0176,"bar"),
    v("Bar des Célébrités at Hotel Martinez","Hotel Bar","Legendary festival bar inside the iconic Art Deco Martinez, Champagne and cocktails",4.6,f(false,false,false,true,true,false,false,false),"https://hotel-martinez.hyatt.com",43.5490,-7.0186,"bar"),
    // Sushi
    v("Nobu Cannes","Japanese-Peruvian","Nobu's Festival season outpost, celebrity sushi on the Croisette",4.6,f(false,false,true,false,true,false,true,false,false,true),"https://noburestaurants.com/cannes",43.5490,-7.0186,"sushi"),
    v("Matsuhisa Cannes","Japanese","Nobu Matsuhisa's intimate Cannes sushi counter, exceptional quality",4.7,f(false,false,false,true,true,false,true,true,false,true),"https://matsuhisarestaurants.com/cannes",43.5490,-7.0196,"sushi"),
    v("Kinugawa Cannes","Japanese","Chic Japanese from the acclaimed Paris brand, Riviera outpost",4.5,f(false,false,true,false,true,false,false,false,false,true),"https://kinugawa.fr",43.5508,-7.0186,"sushi"),
  ],

  "London": [
    v("The Clove Club","British Contemporary","Three Michelin stars, Isaac McHale, Shoreditch",4.9,f(true,false,true,false,false,false,true,true),"https://thecloveclub.com",51.5246,-0.0774),
    v("Alain Ducasse at The Dorchester","French","Three Michelin stars, Hyde Park grandeur",4.9,f(true,false,false,true,true,false,true,true),"https://alainducasse-dorchester.com",51.5074,-0.1554),
    v("Restaurant Gordon Ramsay","French","Three Michelin stars, Chelsea institution",4.9,f(true,false,false,true,false,false,true,true),"https://gordonramsayrestaurants.com/restaurant-gordon-ramsay",51.4907,-0.1634),
    v("Core by Clare Smyth","British Contemporary","Three Michelin stars, Notting Hill, extraordinary",4.9,f(true,false,false,false,false,false,true,true),"https://corebyclare.com",51.5094,-0.2034),
    v("The Fat Duck","Molecular British","Three Michelin stars, Heston's Bray restaurant",4.9,f(true,false,true,false,true,false,true,true),"https://thefatduck.co.uk",51.5074,-0.7154),
    v("Sketch","French Contemporary","Two Michelin stars, Mayfair's most instagrammed rooms",4.8,f(true,false,true,false,true,false,true,false),"https://sketch.london",51.5094,-0.1424),
    v("Ikoyi","West African","Two Michelin stars, groundbreaking West African cuisine",4.8,f(true,false,true,false,false,false,true,true),"https://ikoyilondon.com",51.5094,-0.1424),
    v("Brat","Basque-influenced","One Michelin star, open-fire cooking, Shoreditch",4.8,f(true,false,true,false,true,false,true,false),"https://bratrestaurant.com",51.5246,-0.0771),
    v("Kiln","Thai","Best Thai in London, coal-fired, Soho tiny gem",4.7,f(false,false,true,false,false,false,true,false),"https://kilnsoho.com",51.5134,-0.1354),
    v("St. John","British","Nose-to-tail pioneer, Smithfield, deeply influential",4.7,f(false,false,false,true,true,false,false,false),"https://stjohnrestaurant.com",51.5194,-0.1014),
    v("The River Café","Italian","Ruth Rogers' legendary Thames-side Italian institution",4.7,f(false,false,false,true,true,false,true,true),"https://rivercafe.co.uk",51.4797,-0.2234),
    v("Annabel's","Private Members Club","Mayfair's most iconic members club since 1963",4.7,f(false,false,true,false,true,true,true,false,true),"https://annabels.co.uk",51.5084,-0.1454,"private club"),
    v("The Wolseley","European Grand Café","Grand Piccadilly café, London institution for all meals",4.6,f(false,false,false,true,true,false,false,false),"https://thewolseley.com",51.5074,-0.1394),
    v("Scott's","Seafood","Mayfair seafood institution, best-dressed crowd in London",4.6,f(false,false,false,true,true,false,false,false),"https://scotts-restaurant.com",51.5104,-0.1474),
    v("Sexy Fish","Asian","Harvey Nichols-adjacent celebrity magnet, Mayfair",4.5,f(false,false,true,false,true,false,false,false),"https://sexyfish.com",51.5104,-0.1434),
    v("Nightjar","Cocktail Bar","Pre-Prohibition cocktails, live jazz nightly",4.7,f(false,false,false,true,false,true,true,false),"https://barnightjar.com",51.5241,-0.0920,"bar"),
    v("The American Bar at The Savoy","Cocktail Bar","London's most historic hotel bar since 1893",4.7,f(false,false,false,true,true,false,false,true),"https://fairmont.com/savoy-london/dining/americanbar",51.5104,-0.1204,"bar"),
    v("Noble Rot Soho","Wine Bar","Outstanding natural wine bar and restaurant",4.6,f(false,false,true,false,true,false,false,true),"https://noblerot.co.uk",51.5134,-0.1294,"bar"),
    v("The Araki","Japanese Omakase","Three Michelin stars, Mayfair, one of the world's greatest sushi counters",4.9,f(true,false,false,false,false,false,true,true,false,true),"https://the-araki.com",51.5104,-0.1454,"sushi"),
    v("Endo at the Rotunda","Japanese Omakase","Two Michelin stars, Chef Endo Kazutoshi, stunning rotunda setting",4.8,f(true,false,true,false,true,false,true,true,false,true),"https://endoattherotunda.com",51.5033,-0.2234,"sushi"),
    v("Kiku","Japanese","Mayfair Japanese institution since 1978, outstanding sashimi",4.7,f(false,false,false,true,true,false,false,true,false,true),"https://kikurestaurant.co.uk",51.5104,-0.1464,"sushi"),
    v("Nobu London","Japanese-Peruvian","The original London Nobu, Mayfair celebrity institution",4.6,f(false,false,true,false,true,false,false,false,false,true),"https://noburestaurants.com/london",51.5084,-0.1454,"sushi"),
    v("Sexy Fish London","Asian","Harvey Nichols-adjacent sushi and celebrity scene",4.5,f(false,false,true,false,true,false,false,false,false,true),"https://sexyfish.com",51.5104,-0.1434,"sushi"),
  ],

  "Milan": [
    v("Enrico Bartolini at Mudec","Italian Contemporary","Three Michelin stars, museum dining, exceptional",4.9,f(true,false,true,false,false,false,true,true),"https://enricobartolini.net/mudec",45.4509,-9.1691),
    v("Il Luogo di Aimo e Nadia","Italian Contemporary","Two Michelin stars, seasonal Italian, Milanese classic",4.9,f(true,false,false,true,false,false,true,true),"https://aimoenadia.com",45.4529,-9.1471),
    v("Seta by Antonio Guida","Italian","Two Michelin stars, Mandarin Oriental Milan",4.8,f(true,false,false,true,true,false,true,true),"https://mandarinoriental.com/milan",45.4659,-9.1891),
    v("Contraste","Italian Contemporary","Two Michelin stars, creative and inventive, Brera",4.8,f(true,false,true,false,false,false,true,true),"https://contrastemilano.it",45.4709,-9.1831),
    v("Cracco","Italian Contemporary","Carlo Cracco's two-star Galleria restaurant",4.7,f(true,false,true,false,true,false,true,false),"https://ristorantecracco.it",45.4659,-9.1921),
    v("Langosteria","Italian Seafood","The chicest seafood restaurant in Milan",4.7,f(false,false,true,false,true,false,true,false),"https://langosteria.com",45.4669,-9.1781),
    v("Savini","Italian","Galleria Vittorio Emanuele II icon since 1867",4.6,f(false,false,false,true,true,false,false,true),"https://savinimilano.it",45.4659,-9.1921),
    v("Il Salumaio di Montenapoleone","Italian","Via Montenapoleone institution, fashion week essential",4.6,f(false,false,false,true,true,false,false,true),"https://ilsalumaiodimontenapoleone.it",45.4679,-9.1961),
    v("Bar Basso","Cocktail Bar","Negroni Sbagliato birthplace, design week legend",4.6,f(false,false,false,true,true,false,false,false),"https://barbasso.com",45.4778,-9.2058,"bar"),
    v("Dry Milano","Cocktail Bar","Craft cocktails and Neapolitan pizza, Brera",4.6,f(false,false,true,false,true,false,false,false),"https://drymilano.it",45.4709,-9.1851,"bar"),
    v("Ceresio 7","Rooftop Bar","Design hotel rooftop pools and cocktails, Porta Garibaldi",4.6,f(false,false,true,false,true,false,false,false),"https://ceresio7.com",45.4789,-9.1811,"rooftop"),
    v("Iyo","Japanese Omakase","One Michelin star, Milan's best omakase, exceptional quality and sourcing",4.8,f(true,false,false,false,false,false,true,true,false,true),"https://iyo.it",45.4629,-9.1781,"sushi"),
    v("Osaka","Japanese","Milan's most beloved traditional Japanese restaurant",4.6,f(false,false,false,true,false,false,false,true,false,true),"https://osakaristorante.it",45.4659,-9.1891,"sushi"),
    v("Nobu Milan","Japanese-Peruvian","Nobu's Milan outpost, celebrity sushi in the fashion capital",4.5,f(false,false,true,false,true,false,false,false,false,true),"https://noburestaurants.com/milan",45.4659,-9.1921,"sushi"),
  ],

  // ============================================================
  // PARIS — MASSIVELY EXPANDED
  // ============================================================
  "Paris": [
    v("Guy Savoy","French","Three Michelin stars, best tasting menu in Paris",4.9,f(true,false,false,true,true,false,true,true),"https://guysavoy.com",48.8607,-2.3322),
    v("Arpège","French","Three Michelin stars, Alain Passard's vegetable paradise",4.9,f(true,false,false,true,false,false,true,true),"https://alain-passard.com",48.8556,-2.3177),
    v("Épicure","French","Three Michelin stars, Le Bristol hotel garden dining",4.9,f(true,false,false,true,true,false,true,true),"https://lebristolparis.com/en/cuisine/epicure",48.8728,-2.3136),
    v("L'Ambroisie","French","Three Michelin stars, Place des Vosges, timeless",4.9,f(true,false,false,true,false,false,true,true),"https://ambroisie-paris.com",48.8546,-2.3636),
    v("Pierre Gagnaire","French","Three Michelin stars, avant-garde genius",4.9,f(true,false,true,false,true,false,true,true),"https://pierre-gagnaire.com",48.8748,-2.3046),
    v("Septime","French Contemporary","One Michelin star, hottest table in Paris, Bastille — book 4 weeks ahead",4.8,f(true,false,true,false,true,false,true,true),"https://septime-charonne.fr",48.8520,-2.3788),
    v("Le Jules Verne","French","One Michelin star, Eiffel Tower dining, Ducasse",4.7,f(true,false,false,true,true,false,true,true),"https://lejulesverne-paris.com",48.8582,-2.2941),
    v("Caviar Kaspia","Caviar & Champagne","Celebrity haunt atop Place de la Madeleine, midnight supper staple",4.7,f(false,false,false,true,true,false,false,true),"https://caviar-kaspia.com",48.8700,-2.3247),
    v("Le Cinq","French","Four Seasons George V, two Michelin stars, palatial",4.8,f(true,false,false,true,true,false,true,true),"https://fourseasons.com/paris/dining/restaurants/le_cinq",48.8748,-2.3046),
    v("Taillevent","French","Two Michelin stars, institution since 1946",4.8,f(true,false,false,true,true,false,true,true),"https://taillevent.com",48.8748,-2.3026),
    v("Frenchie","French Contemporary","One Michelin star, Rue du Nil, impossible to book",4.7,f(true,false,true,false,false,false,true,false),"https://frenchierestaurant.com",48.8627,-2.3466),
    v("Le Châteaubriand","French Contemporary","Natural wine bistro pioneer, innovative and iconic",4.7,f(false,false,true,false,true,false,true,false),"https://lechateaubriand.net",48.8678,-2.3728),
    // NEW PARIS ADDITIONS
    v("Le Grand Café at Grand Palais","French Brasserie","2025's most spectacular opening — Loulou Groupe restores the Grand Palais brasserie, stunning Belle Époque setting",4.8,f(false,true,true,false,true,false,true,false),"https://grandcafegrandpalais.fr",48.8660,-2.3122),
    v("Billie","French Contemporary","Paris's beautiful people and their resident DJ — leather and marble, open till 2am, instant fashion crowd destination",4.7,f(false,true,true,false,true,true,true,false),"https://billieparis.com",48.8636,-2.3126),
    v("Casa Pregonda","Mediterranean","Fashion crowd's new HQ, Balearic-inspired, best sangria in Paris, stunning Marais setting",4.7,f(false,true,true,false,true,false,true,false),"https://casapregonda.com",48.8566,-2.3536),
    v("Verjus","French Wine Bar","Stunning natural wine cave and restaurant, Jackson Square of Paris — essential classics",4.8,f(false,false,true,false,true,false,true,true),"https://verjusparis.com",48.8627,-2.3376),
    v("Semilla","French Contemporary","Saint-Germain gem from the Verjus team, seasonal market menu, exceptional value",4.7,f(false,false,true,false,true,false,true,true),"https://semillaparis.com",48.8536,-2.3376),
    v("Au Passage","French Wine Bar","11th arrondissement natural wine bar and small plates, beloved by chefs",4.7,f(false,false,true,false,false,false,true,false),"https://restaurant-aupassage.fr",48.8618,-2.3658),
    v("Mokonuts","Middle Eastern French","Omar Koreitem and Moko Hirayama's cult bakery-restaurant, best cookies in Paris",4.7,f(false,true,false,false,false,false,true,false),"https://mokonuts.com",48.8558,-2.3728),
    v("Benoît","Classic French Bistro","Alain Ducasse's legendary Left Bank bistro, cassoulet and blanquette de veau, timeless",4.7,f(false,false,false,true,true,false,false,true),"https://benoit-paris.com",48.8596,-2.3476),
    v("David Toutain","French Contemporary","One Michelin star, inventive seasonal tasting menus, quiet and exceptional",4.8,f(true,false,false,false,false,false,true,true),"https://davidtoutain.com",48.8576,-2.3177),
    v("Hakuba","Japanese Omakase","Omakase at Cheval Blanc hotel — Paris's most rarefied sushi experience, extraordinary",4.8,f(true,false,false,false,true,false,true,true,false,true),"https://chevalblanc.com/paris",48.8536,-2.3476,"sushi"),
    v("Café de Flore","French Café","Saint-Germain café institution, Sartre and de Beauvoir",4.4,f(false,false,false,true,true,false,false,false),"https://cafedeflore.fr",48.8536,-2.3336),
    // Bars
    v("Harry's New York Bar","Cocktail Bar","Hemingway's Paris bar since 1911, Bloody Mary birthplace",4.5,f(false,false,false,true,true,false,false,false),"https://harrysbar.fr",48.8698,-2.3296,"bar"),
    v("Prescription Cocktail Club","Cocktail Bar","Saint-Germain speakeasy, craft cocktails done right",4.6,f(false,false,true,false,true,false,false,false),"https://prescriptioncocktailclub.com",48.8536,-2.3376,"bar"),
    v("Candelaria","Cocktail Bar","Hidden taqueria with speakeasy cocktail bar behind",4.5,f(false,false,true,false,true,false,false,false),"https://quixotic-projects.com/venue/candelaria",48.8598,-2.3526,"bar"),
    v("Bar Nouveau","Cocktail Bar","#17 on World's 50 Best Bars — Paris's most acclaimed cocktail destination, extraordinary program",4.9,f(false,true,true,false,true,false,true,false),"https://barnouveau.fr",48.8668,-2.3526,"bar"),
    v("Cambridge Public House","Cocktail Bar","#20 World's 50 Best Bars — beloved Parisian pub-meets-cocktail bar, outstanding drinks",4.8,f(false,true,true,false,true,false,false,false),"https://cambridgepub.fr",48.8628,-2.3468,"bar"),
    v("Danico","Cocktail Bar","#30 World's 50 Best Bars — hidden bar inside a wine shop, extraordinary cocktails",4.8,f(false,true,true,false,true,false,true,false),"https://danico.fr",48.8658,-2.3438,"bar"),
    v("Little Red Door","Cocktail Bar","Conceptual cocktail bar, seasonal ingredient-driven menu, Marais institution",4.7,f(false,false,true,false,true,false,true,false),"https://lrdparis.com",48.8606,-2.3526,"bar"),
    v("Experimental Cocktail Club","Cocktail Bar","The OG Paris craft cocktail pioneer, intimate and excellent, Marais",4.7,f(false,false,true,false,true,false,false,false),"https://experimentalcocktailclub.com",48.8618,-2.3486,"bar"),
    v("Le Perchoir","Rooftop Bar","Paris's most beloved rooftop bar, Oberkampf panoramic views, always packed",4.6,f(false,false,true,false,true,false,true,false),"https://leperchoir.fr",48.8648,-2.3768,"rooftop"),
    v("Bisou Canal","Bar","Canal Saint-Martin's best bar, laid-back natural wine and cocktails, local crowd",4.6,f(false,false,true,false,false,false,false,false),"https://bisoucanal.com",48.8718,-2.3648,"bar"),
    v("Bristol After Dark","Hotel Bar","Le Bristol's legendary late-night bar, old-money Paris glamour, serious cocktails",4.7,f(false,false,false,true,true,false,false,true),"https://lebristolparis.com",48.8728,-2.3136,"bar"),
    // Sushi
    v("Sushi Yoshitake","Japanese Omakase","Three Michelin stars in Tokyo; the Paris outpost maintains extraordinary standards",4.8,f(true,false,false,false,false,false,true,true,false,true),"https://sushi-yoshitake.com",48.8668,-2.3296,"sushi"),
    v("Akami","Japanese Omakase","One Michelin star, outstanding omakase in the Marais, exceptional fish",4.8,f(true,false,true,false,false,false,true,true,false,true),"https://akami.fr",48.8568,-2.3556,"sushi"),
    v("Isami","Japanese","Paris's most celebrated traditional sushi, Île Saint-Louis institution",4.7,f(false,false,false,true,false,false,true,true,false,true),"https://isami-paris.com",48.8516,-2.3536,"sushi"),
    v("Nobu Paris","Japanese-Peruvian","Nobu's elegant Paris outpost, celebrity sushi",4.6,f(false,false,true,false,true,false,false,false,false,true),"https://noburestaurants.com/paris",48.8668,-2.3296,"sushi"),
  ],

  // ============================================================
  // MYKONOS — TRIPLED IN SIZE
  // ============================================================
  "Mykonos": [
    v("Nobu Mykonos","Japanese-Peruvian","Glamorous clifftop Nobu, jet-set crowd, stunning Aegean views",4.8,f(false,false,true,false,true,false,true,false),"https://noburestaurants.com/mykonos",37.4467,-25.3289),
    v("Spilia","Seafood","Sea cave setting, dramatic cliffside, most romantic restaurant on the island",4.8,f(false,false,true,false,true,false,true,true),"https://spilia.gr",37.4312,-25.3195),
    v("Nōema","Mediterranean","Former Semeli cinema reborn as Mykonos's sleekest restaurant — dinner that turns to dancing, the 2024 breakout",4.8,f(false,true,true,false,true,true,true,false),"https://noemamykonos.com",37.4454,-25.3283),
    v("M-eating","Greek Contemporary","Outstanding modern Greek in Mykonos Town, Michelin-cited, best food on the island",4.8,f(false,false,false,true,false,false,true,true),"https://m-eating.gr",37.4454,-25.3293),
    v("Alemagou","Mediterranean Beach","Remote northern beach restaurant with DJ, organic garden, the most beautiful setting in Mykonos",4.8,f(false,true,true,false,true,true,true,false),"https://alemagou.gr",37.4801,-25.3601),
    v("Scorpios","Mediterranean Beach Club","Island's most iconic sunset beach club, global DJs, spiritual community vibe",4.7,f(false,false,true,false,true,true,false,false),"https://scorpiosmykonos.com",37.4201,-25.3401),
    v("Nammos","Mediterranean Beach","Psarou Beach's glamorous beach club, top luxury brands, celebrity summer home",4.6,f(false,false,true,false,true,false,false,false),"https://nammos.gr",37.4181,-25.3411),
    v("Beefbar Mykonos","Steakhouse","The Monte Carlo steak dynasty lands in Mykonos — Wagyu and seafood towers",4.7,f(false,true,true,false,true,false,true,false),"https://beefbar.com/mykonos",37.4454,-25.3273),
    v("Jackie O' Beach Club","Beach Club","Mykonos Town's legendary LGBTQ+ beach club, party from noon to midnight",4.6,f(false,false,true,false,true,true,false,false),"https://jackieo.gr",37.4452,-25.3254),
    v("SantAnna Beach","Mediterranean Beach","Super Paradise Beach's chic beach club, DJ sets and Mediterranean cuisine",4.6,f(false,false,true,false,true,true,false,false),"https://santanna.gr",37.4201,-25.3361),
    v("COYA Mykonos","Pan-Asian Peruvian","London's acclaimed Peruvian-Asian concept arrives in Mykonos, vibrant and social",4.7,f(false,true,true,false,true,true,true,false),"https://coyarestaurant.com/mykonos",37.4454,-25.3283),
    v("Obati","Greek Contemporary","Chora's newest modern Greek taverna, wood-fired whole fish and Cycladic flavors",4.7,f(false,true,false,false,false,false,true,true),"https://obatimykonos.com",37.4454,-25.3293),
    v("Interni","Mediterranean","Romantic garden setting in Mykonos Town, consistently excellent",4.6,f(false,false,false,true,true,false,false,true),"https://internirestaurant.com",37.4454,-25.3283),
    v("Matsuhisa Mykonos","Japanese-Peruvian","Nobu Matsuhisa's Belvedere Hotel outpost, excellent omakase experience",4.6,f(false,false,true,false,true,false,true,false),"https://belvedere.com/matsuhisa-mykonos",37.4464,-25.3313),
    v("Fokos Taverna","Greek","Remote beach taverna, traditional and magical, no menus — just whatever the boat brought in",4.7,f(false,false,false,true,false,false,false,true),"https://fokostaveran.gr",37.4801,-25.3551),
    v("Katrin","Greek","Old Town institution since 1969, traditional and beloved by every Mykonos local",4.5,f(false,false,false,true,false,false,false,true),"https://katrinmykonos.gr",37.4454,-25.3283),
    // Bars
    v("Galleraki","Cocktail Bar","Little Venice's most beautiful cocktail bar, waves crashing beneath, sunset institution",4.7,f(false,false,true,false,true,false,false,false),"https://gallerakimykonos.com",37.4452,-25.3274,"bar"),
    v("Remezzo","Cocktail Bar","Iconic Little Venice waterfront bar, legendary sunsets, classic Mykonos",4.5,f(false,false,false,true,true,false,false,false),"https://remezzomykonos.com",37.4452,-25.3274,"bar"),
    v("180° Sunset Bar","Rooftop Bar","Panoramic 180-degree views over the Aegean, DJ sets at sunset, spectacular",4.7,f(false,false,true,false,true,false,false,false),"https://180mykonos.com",37.4452,-25.3264,"rooftop"),
    v("Cavo Paradiso","Nightclub","Mykonos's legendary clifftop nightclub, world-class DJs, open-air and iconic",4.6,f(false,false,true,false,true,true,false,false),"https://cavoparadiso.gr",37.4201,-25.3311,"bar"),
    v("Pierro's","Bar","The original Mykonos nightlife institution since 1976, the after-hours destination",4.4,f(false,false,true,false,true,true,false,false),"https://pierrosmykonos.gr",37.4454,-25.3283,"bar"),
    v("Babylon","Bar","Little Venice gay bar, legendary sunset cocktails, Mykonos classic",4.3,f(false,false,true,false,true,false,false,false),"https://babylonmykonos.gr",37.4452,-25.3264,"bar"),
    // Sushi
    v("Nobu Mykonos Omakase","Japanese-Peruvian Omakase","Glamorous clifftop Nobu omakase experience, jet-set island sushi",4.8,f(false,false,true,false,true,false,true,false,false,true),"https://noburestaurants.com/mykonos",37.4467,-25.3289,"sushi"),
    v("Matsuhisa Mykonos","Japanese Omakase","Nobu Matsuhisa's intimate Belvedere Hotel counter, best sushi on the island",4.7,f(false,false,true,false,true,false,true,false,false,true),"https://belvedere.com/matsuhisa-mykonos",37.4464,-25.3313,"sushi"),
    v("Zuma Mykonos","Japanese Robatayaki","Seasonal Zuma outpost at Santa Marina, stunning robatayaki",4.6,f(false,false,true,false,true,false,true,false,false,true),"https://zumarestaurant.com/zuma-mykonos",37.4501,-25.3443,"sushi"),
  ],
  "Seoul": [
    v("Mingles","Korean Contemporary","Chef Kang Min-goo's only Michelin 3-star in Korea. Asia's 50 Best #5 2025. Fermented sauces, Korean ceramic tableware, extraordinary tasting menus",5.0,f(true,false,false,false,false,false,true,true),"https://restaurant-mingles.com",37.5246,127.0430),
    v("La Yeon","Korean Royal Cuisine","Shilla Hotel 23rd floor, breathtaking Seoul Tower views, Hansik court cuisine by Chef Sung Il Kim — two Michelin stars",4.9,f(true,false,false,true,true,false,true,true),"https://www.shilla.net/en/restaurants/laYeon.do",37.5580,126.9985),
    v("Jungsik","Modern Korean","Chef Yim Jung-sik Gangnam flagship — two Michelin stars, sea urchin bibimbap, multi-floor fine dining",4.9,f(true,false,true,false,true,false,true,true),"https://jungsik.kr",37.5246,127.0430),
    v("Evett","Korean Contemporary","★ NEW 2-star 2025. Australian Chef Joseph Lidgerwood, sikhye sorbet with ants, fearless Korean ingredients",4.9,f(true,true,true,false,false,false,true,true),"https://evett.kr",37.5250,127.0432),
    v("Kwonsooksoo","Korean","Two Michelin stars. Chef Kwon Woo-Joong, courgette blossoms with shrimp, raw beef with oscietra caviar",4.8,f(true,false,false,false,false,false,true,true),"https://kwonsooksoo.com",37.5246,127.0420),
    v("Soigne","Korean Contemporary","Two Michelin stars. Chef Jun Lee, elegant tasting menus — Asia's 50 Best #57 2025",4.8,f(true,false,false,true,false,false,true,true),"https://soigne.kr",37.5243,127.0429),
    v("Ala Prima","Contemporary","Two Michelin stars. Asia's 50 Best #61 2025 — intimate precise tasting menu",4.8,f(true,false,false,false,false,false,true,true),"https://alaprima.kr",37.5246,127.0435),
    v("Mitou","Japanese-French","Two Michelin stars. Japanese precision meets French technique, quietly excellent",4.8,f(true,false,false,true,false,false,true,true),"https://mitou.kr",37.5243,127.0430),
    v("Kojima","Japanese","Two Michelin stars. Chef Kojima Hiroshi, pristine Japanese omakase in Seoul",4.8,f(true,false,false,true,false,false,true,true),"https://www.instagram.com/kojima_seoul",37.5246,127.0432,"sushi"),
    v("Restaurant Allen","Modern Korean","Two Michelin stars. Seasonal Korean fine dining, celebrated wine program",4.8,f(true,false,false,true,false,false,true,true),"https://restaurantallen.kr",37.5246,127.0430),
    v("Onjium","Korean Royal Cuisine","Research institute + restaurant. Chef Cho Eun-hee (Asia's Best Female Chef 2026), Gyeongbokgung Palace views. Asia's 50 Best #10 2025",4.9,f(true,false,false,true,false,false,true,true),"https://onjium.com",37.5820,126.9758),
    v("7th Door","Korean Contemporary","One Michelin star. Chef Kim Dae-chun, fermentation and aging techniques — Asia's 50 Best #23 2025",4.8,f(true,false,true,false,false,false,true,true),"https://7thdoor.kr",37.5246,127.0430),
    v("Eatanic Garden","Modern Korean","One Michelin star. Chef Son Jong-won, theatrical rooftop at Josun Palace, illustrated seasonal menu cards. Asia's 50 Best #25 2025 Highest New Entry",4.8,f(true,true,true,false,false,false,true,false),"https://eatanic.com",37.5703,126.9794),
    v("Born and Bred","Korean Beef Omakase","Hanwoo beef temple, extraordinary BBQ omakase. Asia's 50 Best #51 2025",4.8,f(false,false,true,false,false,false,true,false),"https://bornbred.kr",37.5246,127.0430),
    v("Solbam","Korean Contemporary","One Michelin star. Chef Park Sung-bae, seasonal Korean ingredients. Asia's 50 Best #55 2025",4.7,f(true,false,false,false,false,false,true,true),"https://solbam.kr",37.5246,127.0430),
    v("Tutoiement","French Contemporary","NEW 2025 Michelin 1-star. Chef Kim Do-hyeon, sophisticated French, calm welcoming atmosphere",4.7,f(true,true,false,false,false,false,true,true),"https://tutoiement.com",37.5246,127.0430),
    v("Sosuheon","Sushi","NEW 2025 Michelin 1-star + Michelin Service Award. Chef Park Kyung-jae, traditional hanok venue, exquisite sushi craftsmanship",4.7,f(true,true,false,false,false,false,true,true),"https://www.instagram.com/sosuheon_official",37.5820,126.9750,"sushi"),
    v("Escondido","Mexican","NEW 2025 Michelin 1-star. First Mexican restaurant ever to earn Michelin star in Korea. Chef Jin Woo-bum, authentic mole, tequila and mezcal pairings",4.7,f(true,true,true,false,false,false,true,false),"https://www.instagram.com/escondido_kr",37.5246,127.0430),
    v("Gigas","Mediterranean","NEW 2025 Michelin 1-star + Green Star. Chef Jung Ha-wan, organic ingredients from family farm, authentic sustainable Mediterranean",4.7,f(true,true,false,false,false,false,true,true),"https://www.instagram.com/gigas.seoul",37.5246,127.0430),
    v("Legume","Vegan Fine Dining","NEW 2025 Michelin 1-star + Green Star. Chef Sung Si-woo, extraordinary vegan tasting menu, sensorial plant-based Korean cuisine",4.7,f(true,true,false,false,false,false,true,true),"https://legume.kr",37.5246,127.0430),
    v("Yeast Restaurant","Contemporary Korean","NEW 2025 Michelin 1-star. Chef Cho Young-dong, kaya toast amuse bouche, Galbi Stone braised short ribs. Netflix Culinary Class Wars",4.7,f(true,true,true,false,true,false,true,false),"https://www.instagram.com/yeast_seoul",37.5246,127.0430),
    v("Yu Yuan","Cantonese","NEW 2025 Michelin 1-star. Four Seasons Hotel Seoul, authentic Cantonese fine dining, superb dim sum",4.7,f(true,true,false,false,false,false,false,true),"https://www.fourseasons.com/seoul/dining/restaurants/yu-yuan",37.5703,126.9794),
    v("A Flower Blossom on the Rice","Korean Temple Food","Michelin 1-star + Green Star 5 consecutive years. Korean Buddhist temple cuisine, meditative and seasonal",4.7,f(true,false,false,true,false,false,true,true),"https://aflowerblossomonthericeseoul.com",37.5820,126.9750),
    v("San Seoul","Modern Korean","Asia's 50 Best One to Watch 2025. Gangnam, newest generation Korean fine dining, 2024 opening sensation",4.7,f(false,true,true,false,false,false,true,false),"https://www.instagram.com/san_restaurant_seoul",37.5246,127.0430),
    v("Mosu Seoul","Korean Contemporary","Relaunching in Yongsan. Chef Sung Anh, former Michelin 3-star and Asia's 50 Best legend",4.8,f(true,true,false,false,false,false,true,true),"https://mosu.restaurant",37.5400,126.9940),
    v("Gaon","Korean Royal Cuisine","Two Michelin stars. Elegant Korean court cuisine in hand-crafted ceramics, Gangnam luxury tower",4.8,f(true,false,false,true,false,false,true,true),"https://gaon.kr",37.5246,127.0430),
    v("Congdu","Korean Fine Dining","One Michelin star. Set in former home of last Joseon emperor's grandmother — extraordinary historic setting",4.7,f(true,false,false,true,false,false,true,true),"https://congdu.co.kr",37.5820,126.9758),
    v("Balwoo Gongyang","Temple Food","One Michelin star. Buddhist temple cuisine at Jogyesa Temple, delicate and spiritual",4.7,f(true,false,false,true,false,false,false,true),"https://www.balwoo.or.kr",37.5711,126.9822),
    v("Yun Seoul","Korean Contemporary","One Michelin star. Chef Kim Do-yun, Netflix Culinary Class Wars, modern Korean kaiseki",4.7,f(true,true,true,false,true,false,true,false),"https://www.instagram.com/yun_seoul",37.5246,127.0430),
    v("Choi Dot","Italian Fine Dining","Chef Choi Hyun-seok, Netflix Culinary Class Wars star, Michelin-selected Italian fine dining",4.7,f(false,true,true,false,true,false,true,false),"https://www.instagram.com/choidot_official",37.5246,127.0430),
    v("Gold Pig Hwanggeumdon","Korean BBQ","Most acclaimed Korean BBQ in Seoul, Michelin-selected, legendary Hanwoo beef quality",4.6,f(false,false,true,false,false,false,false,false),"https://goldpig.co.kr",37.5246,127.0430),
    v("Woo Lae Oak","Korean BBQ","Legendary institution since 1946, naengmyeon cold noodles, classic beef bulgogi",4.6,f(false,false,false,true,false,false,false,false),"https://woolaeoak.com",37.5246,127.0430),
    v("Jiro Seoul","Sushi","Premier sushi omakase, Michelin-selected, aged fish techniques, intimate counter",4.7,f(true,false,false,true,false,false,true,true),"https://www.instagram.com/jiro_seoul",37.5246,127.0430,"sushi"),
    v("Zest Seoul","Cocktail Bar","Asia's 50 Best Bars #2 2025, Best Bar in Korea. Hyper-local Korean ingredients, Jeju Garibaldi with regional oranges and Gujwa carrots",4.9,f(false,false,true,false,false,false,true,false),"https://www.instagram.com/zest.seoul",37.5400,126.9940,"bar"),
    v("Bar Cham","Cocktail Bar","Asia's 50 Best Bars #6 2025. Seochon hanok house, Korean ingredients — omija berries, perilla, fermented grains, meditative and refined",4.9,f(false,false,true,false,false,false,true,true),"https://www.instagram.com/bar.cham",37.5820,126.9750,"bar"),
    v("Alice Cheongdam","Cocktail Speakeasy","Asia's 50 Best Bars #13 2025, Nikka Highest Climber. Alice in Wonderland theme, hidden entrance behind flower shop facade",4.8,f(false,false,true,false,true,false,true,false),"https://www.instagram.com/alice_cheongdam",37.5246,127.0430,"bar"),
    v("Le Chamber","Cocktail Speakeasy","Asia's 50 Best Bars #50 2025. Gangnam, push the right bookshelf book to enter. 200+ whiskies, live piano, glittering chandeliers",4.8,f(false,false,true,false,true,false,true,false),"https://www.instagram.com/le_chamber",37.5246,127.0430,"bar"),
    v("Charles H","Cocktail Bar","Four Seasons Hotel Seoul basement. Inspired by traveler-writer Charles H Baker. Tableside cocktail theater, Best Bar in Korea 2021",4.8,f(false,false,true,false,true,false,false,false),"https://www.fourseasons.com/seoul/dining/lounges/charles_h",37.5703,126.9794,"bar"),
    v("Southside Parlor","Cocktail Bar","Itaewon American-Southern institution. Rooftop views, Omija Mule, great tacos, beloved by expats",4.6,f(false,false,false,true,false,false,false,false),"https://southsideparlor.com",37.5340,126.9941,"bar"),
    v("Pocket","Cocktail Bar","Zero-waste sister bar to Southside Parlor. Best mezcal list in Seoul, sustainability-forward, still feels exclusive",4.7,f(false,false,true,false,false,false,true,false),"https://www.instagram.com/pocket_seoul",37.5340,126.9941,"bar"),
    v("Cobbler","Cocktail Bar","Seochon. Warm atmosphere, tell-the-bartender-your-flavors concept. Strawberry cobbler is the signature",4.7,f(false,false,true,false,false,false,false,false),"https://www.instagram.com/cobbler_seoul",37.5820,126.9750,"bar"),
    v("Pine and Co","Cocktail Bar","Futuristic R&D lab aesthetic, molecular cocktails, Asia's 50 Best Bars entry, Gangnam",4.7,f(false,true,true,false,false,false,true,false),"https://www.instagram.com/pineandco_seoul",37.5246,127.0430,"bar"),
    v("Bar Jangsaeng","Cocktail Bar","Gangnam. Korean ingredient cocktails, exceptional service, knowledgeable English-speaking team",4.7,f(false,false,true,false,false,false,false,false),"https://www.instagram.com/bar_jangsaeng",37.5246,127.0430,"bar"),
  ],
  "Martha's Vineyard": [
    v("Detente","American Seasonal","Edgartown's best restaurant since 2005. Twinkle-lit courtyard, Menemsha lobster risotto, minimal-intervention wine list",4.8,f(false,false,true,false,false,false,false,true),"https://detentevineyard.com",41.3882,-70.5133),
    v("19 Raw","Raw Bar / Seafood","Best raw bar on island. Local oysters, Lobster Caviar Slider, dry-aged steaks, cozy patio",4.7,f(false,false,true,false,false,false,false,false),"https://19rawoysterbar.com",41.3882,-70.5130),
    v("Atria","American","Two dining experiences: elegant upstairs in 19th-century Captain's Home; leopard-print Brick Cellar for legendary burgers. Wok-fried 2-lb lobster",4.7,f(false,false,true,false,true,false,false,false),"https://atriamv.com",41.3882,-70.5133),
    v("Atlantic Fish and Chop House","Seafood & Steaks","Edgartown Harbor waterfront, whole branzino, wagyu, black truffle lobster mac. Turns into nightclub at 10pm",4.6,f(false,false,true,false,false,true,false,false),"https://atlanticrestaurantmv.com",41.3882,-70.5130),
    v("Alchemy Bistro and Bar","American Bistro","20-year Edgartown institution. Best cocktails on island 2014-2024. Late-night menu 10pm-midnight. Wine Spectator Award",4.6,f(false,false,false,true,false,false,false,false),"https://alchemyedgartown.com",41.3882,-70.5133),
    v("LEtoile","French-American","Sydney Hotel, inventive seasonal menu, tented outdoor garden, casually elegant",4.7,f(false,false,true,false,false,false,false,true),"https://letoile.net",41.3882,-70.5133),
    v("The Terrace at Charlotte Inn","American Seasonal","Historic 1864 inn, Victorian elegance, stunning garden dining, white tablecloth fine dining",4.8,f(false,false,false,true,true,false,false,true),"https://charlotteinn.net",41.3882,-70.5133),
    v("Chescas","Italian-American","Upscale bistro, seafood paella, sole piccata, legendary Snowball dessert, summer porch waits",4.6,f(false,false,false,true,false,false,false,false),"https://chescasmv.com",41.3882,-70.5133),
    v("Red Cat Kitchen","American Creative","Oak Bluffs. 12-hour Korean BBQ pork belly, fried shrimp and grits, strongest zero-ABV cocktail list on island",4.7,f(false,false,true,false,false,false,false,false),"https://redcatkitchen.com",41.4559,-70.5587),
    v("Lucky Hanks","Comfort American","MV-inspired comfort food, fresh local ingredients, homemade desserts, wine and local brews",4.5,f(false,false,false,true,false,false,false,false),"https://luckyhanksmv.com",41.3882,-70.5133),
    v("The Pelican Club at Faraway","Sushi and Cocktails","Opened 2023 at renovated Faraway Hotel. Tropical-nautical outdoor bar, ceviche, sashimi, exotic cocktails",4.7,f(false,true,true,false,false,false,false,false),"https://farawaymarthasvineyard.com",41.3882,-70.5133,"bar"),
    v("The Newes From America","Historic Pub","Faraway Hotel pub operating since pre-1742. Casual, local brews, reclaimed wood warmth",4.5,f(false,false,false,true,false,true,false,false),"https://farawaymarthasvineyard.com",41.3882,-70.5133,"bar"),
    v("19 Prime","Steakhouse","Sister to 19 Raw. Prime steaks, craft spirits, Edgartown",4.6,f(false,false,false,true,false,false,false,false),"https://19rawoysterbar.com",41.3882,-70.5130),
    v("Black Joy Kitchen","Diasporic Global","NEW Spring 2025. Somali coconut fish curry, Ethiopian doro wat, Peruvian huacatay shrimp. Oak Bluffs brunch sensation",4.7,f(false,true,true,false,false,false,false,false),"https://www.instagram.com/blackjoykitchen",41.4559,-70.5587),
    v("Nomans","Outdoor Bar","Oak Bluffs backyard paradise. Picnic tables, Adirondack chairs, cornhole, house rums, Jungle Bird cocktail",4.6,f(false,false,true,false,false,true,false,false),"https://nomansmv.com",41.4559,-70.5587,"bar"),
    v("Offshore Ale Company","Brewpub","Year-round OB institution. House-brewed craft beers, wood-fired pizza, massive patio",4.5,f(false,false,false,true,false,true,false,false),"https://offshoreale.com",41.4559,-70.5587,"bar"),
    v("Lookout Tavern","Seafood and Sushi","Award-winning sushi, lobster rolls, full bar, almost entirely outdoors overlooking Nantucket Sound. Legendary rum punch",4.6,f(false,false,true,false,false,false,false,false),"https://lookoutmv.com",41.4559,-70.5587,"sushi"),
    v("Pawnee House","Vegetarian Bar","Gouda tart, vegan mushroom specials, strong cocktails, great vibes Oak Bluffs",4.5,f(false,false,true,false,false,false,false,false),"https://pawneehousemv.com",41.4559,-70.5587),
    v("The Ritz Cafe","Dive Bar","Circuit Ave historic dive bar. Live music nightly, community heart of Oak Bluffs summer nightlife",4.4,f(false,false,false,true,false,true,false,false),"https://theritzcafe.com",41.4559,-70.5587,"bar"),
    v("Sweet Life Cafe","American","Victorian house, huge tented patio, 6 types of Negroni, menta melon cocktail",4.6,f(false,false,true,false,false,false,false,true),"https://sweetlifecafe.com",41.4559,-70.5587),
    v("Fat Ronnies Burger Bar","Burgers","OB late-night institution. Perfect hand-cut fries, best burger per MV Magazine readers",4.5,f(false,false,true,false,false,false,false,false),"https://fatronniesburgerbar.com",41.4559,-70.5587),
    v("Beach Road","American Seafood","Vineyard Haven harbor views, Lagoon Pond, oysters, craft cocktails, refined coastal menu",4.6,f(false,false,true,false,false,false,false,false),"https://beachroadmv.com",41.4528,-70.6028),
    v("9 Craft Kitchen and Bar","American","Opened 2022. Vineyard Haven first proper cocktail bar. Swordfish club, lamb ragout rigatoni, best martini in VH",4.7,f(false,true,true,false,false,false,false,false),"https://9craftkitchen.com",41.4528,-70.6028,"bar"),
    v("Garde East","Mediterranean Bar","Vineyard Haven Harbor, docktails on couches and sand, oysters, tuna poke, extensive wine list",4.6,f(false,false,true,false,false,false,false,false),"https://gardeeast.com",41.4528,-70.6028,"bar"),
    v("Black Dog Tavern","American","Most iconic restaurant since 1971. Harbor views, Island Mule, the Black Dog brand beloved worldwide",4.5,f(false,false,false,true,true,false,false,false),"https://theblackdog.com",41.4528,-70.6028),
    v("State Road Restaurant","American Seasonal","West Tisbury. James Beard semifinalist, contemporary seasonal tavern, exceptional wine and beer",4.8,f(false,false,true,false,false,false,true,true),"https://stateroadrestaurant.com",41.3746,-70.6617),
    v("Chilmark Tavern","New American Bistro","BYOB — Chilmark is dry. Handmade pasta with island littlenecks, bistro classics. Best up-island dining",4.7,f(false,false,false,true,false,false,false,false),"https://chilmarktavern.com",41.3437,-70.7282),
    v("Outermost Inn","American Seasonal","Aquinnah, sweeping ocean views, Gay Head Light. Hyper-seasonal menu, brunch with large-format cocktails",4.7,f(false,false,false,true,false,false,false,true),"https://outermostinn.com",41.3480,-70.8385),
    v("Larsens Fish Market","Lobster Shack","Menemsha fishing village. Legendary lobster rolls. Fresh fish, eat harborside at sunset",4.8,f(false,false,false,true,false,false,false,false),"https://larsensfishmarket.com",41.3478,-70.7647),
    v("Menemsha Fish Market","Seafood","Chilmark harbor, rich lobster bisque, fresh catch off the boats at sunset",4.6,f(false,false,false,true,false,false,false,false),"https://menemshafishmarket.com",41.3478,-70.7647),
    v("The Dunes at Winnetu","Seafood Coastal","South Beach resort, spectacular ocean deck views, roasted oysters, lobster tacos, poolside grill",4.6,f(false,false,true,false,false,false,false,false),"https://winnetu.com",41.3490,-70.5113),
    v("Donovans Reef at Nancys","Outdoor Bar","Oak Bluffs harbor views. Dirty Banana frozen cocktails, margaritas at sunset",4.5,f(false,false,false,true,false,false,false,false),"https://nancysaquinnah.com",41.4559,-70.5600,"bar"),
    v("Morning Glory Farm","Farm Stand","Edgartown iconic farm-to-table since 1975. Baked breads, pies, heirloom tomatoes, seasonal produce",4.7,f(false,false,false,true,false,false,false,false),"https://morninggloryfarm.com",41.3580,-70.5413),
    v("Biscuits","Breakfast","Oak Bluffs breakfast cult. Cod cake benedict with Old Bay hollandaise, whole-roasted potatoes. Always a crowd",4.7,f(false,true,true,false,false,false,false,false),"https://www.instagram.com/biscuits_mv",41.4559,-70.5587),
  ],
}

// ── Private Dining Room data ─────────────────────────────────────────────────
const PDR_DATA = {
  "San Francisco": {
    "Quince": "Private rooms: North/South (up to 12 each), West Room (up to 18, cellar views). Full buyout available. events@quincerestaurant.com",
    "Atelier Crenn": "Full restaurant buyout for private events. privatedining@dominiquecrenn.com",
    "Benu": "No dedicated PDR; full restaurant buyout available. contact@benusf.com",
    "Saison": "Full restaurant buyout available. Contact restaurant directly.",
    "Wolfsbane": "The Den seats ~20 guests for private events with seasonal tasting menu.",
    "Kokkari Estiatorio": "Kouzina Chef Table: up to 24 seated. Oenos Room: up to 30. Full buyout up to 200. events@kokkari.com",
    "Cotogna": "Chef Table / terrace: 6–25 guests. Full buyout: 60 seated. events@quinceandcosf.com",
    "Nari": "Suda Room (fully private, mezzanine): seats 24 / 40 standing. Semi-private Wine Room also available. narisf.com/private-dining",
    "Verjus": "Full restaurant buyout available. Contact Quince & Co events team. events@quinceandcosf.com",
    "Bix": "Private Dining Room: up to 20 seated. Full buyout available. bixrestaurant.com/events",
    "State Bird Provisions": "The Workshop (above restaurant): 40 seated, $165pp, $4,500 F&B min. Alcove table: 6–8 guests. Book 90 days ahead.",
    "Zuni Café": "No dedicated PDR; contact restaurant for buyout options.",
    "Rich Table": "Full restaurant buyout only: 40 seated / 70 standing. No private room. info@richtablesf.com",
    "Mister Jiu's": "Double Happiness PDR (Moongate Lounge, 2nd floor, no elevator): 8–35 guests. $3K–$7K F&B min. misterjius.com/double-happiness-pdr",
    "SSAL": "Contact restaurant directly for private events.",
    "The Happy Crane": "Contact restaurant for private events.",
    "Mourad": "Boardroom: 20 seated (private, AV). Alcove: 10 (semi-private). Mezzanine: 40 seated. Full buyout: 100 seated / 300 standing.",
    "Tosca Cafe": "Contact restaurant for private/buyout options.",
    "Original Joe's": "Contact restaurant for large party and private event options.",
    "Nopa": "Groups 9–36, 3-course prix fixe family style. Full buyout available. events@nopasf.com",
    "Perbacco": "Barolo Room: 18 seated / 25 standing. Chef Table: 8. Full restaurant: 150 seated / 250 standing. privatedining@perbaccosf.com",
    "The Battery": "Private members club — events and dining for members and approved guests.",
    "Pacific Union Club": "Private members club — events and dining for members.",
    "Lazy Bear": "Bear Cave wine cellar PDR: 16 seated / 20 standing. $7,000 F&B min. bearcave@lazybearsf.com",
    "Californios": "Intimate tasting menu restaurant; contact for full buyout options.",
    "Chotto Matte": "Private dining: 20 seated. Group dining: 60. Rooftop rental: 100 seated / 200 standing.",
    "Akiko's": "Contact restaurant for private event options.",
    "Kusakabe": "Intimate omakase counter; contact for full buyout.",
    "Ju-Ni": "12-seat counter; full buyout available for private events.",
    "Robin": "Contact restaurant for private event options.",
    "Ken": "6-seat counter; full buyout for private events.",
    "Friends Only": "10-seat counter; full buyout for private events.",
    "Ozumo": "Private dining rooms available for groups; contact restaurant.",
    "Sushi Ran": "Contact restaurant for private events (Sausalito).",
  },,
  "Menlo Park": {
    "Madera": "Two private dining rooms with private terraces and fireplaces. Lemon Room: up to 10 guests. Orange Room: up to 14–16 guests. Both overlook Santa Cruz mountains. events@rosewoodhotels.com",
    "Village Pub": "Three private dining rooms + outdoor veranda. Rooms accommodate 12, 24, and 48. Full buyout up to 120. thevillagepub.net/private-dining",
    "LB Steak": "Chef's Table: 18 guests. Meritage Room (PDR with French chandelier + stone fireplace): 36 guests. Contact: jegi@lbsteak.com / 408.244.1180",
    "Camper": "Maverick Room: 24 seated. Ridgeline Room: 14 seated. Full buyout available. hello@campermp.com",
    "Donato Enoteca": "Colleoni Room: 70 guests (AV setup). Gaja Room: 24. Salsa Donizetti Room: 12. Enoteca Patio: 30. 3–5 course preset menus. contact restaurant directly.",
    "Flea St. Cafe": "Intimate restaurant inside a house; contact for buyout options.",
    "Refuge": "Casual sandwich/beer spot; no private room. Contact for large group options.",
    "Robin Menlo Park": "Private dining room seats up to 7 (exclusive omakase experience, one seating/night, $309pp). Full restaurant buyout also available. robinomakase.com/events",
    "Naomi Sushi": "Contact restaurant directly for private event options.",
    "Sushi Sus": "Intimate omakase counter; contact for full buyout.",
    "Bucks of Woodside": "Iconic power breakfast diner; no dedicated PDR. Contact for large group seating.",
  },
,
  "Seoul": {
    "Mingles": "Private dining available for exclusive events; contact restaurant. restaurant-mingles.com",
    "La Yeon": "Events at The Shilla Seoul; contact hotel events team. shilla.net",
    "Jungsik": "Contact restaurant for private event bookings. jungsik.kr",
    "Evett": "Contact restaurant for private events. evett.kr",
    "Onjium": "Cultural studio and private dining; contact Onjium. onjium.com",
    "Born and Bred": "Contact for private omakase and buyout. bornbred.kr",
    "Eatanic Garden": "At Josun Palace hotel; contact hotel events team.",
    "Gaon": "Contact restaurant for private events. gaon.kr",
    "Charles H": "Four Seasons Seoul event spaces. fourseasons.com/seoul",
  },
  "Martha's Vineyard": {
    "Detente": "Full buyout available. detentevineyard.com / 508-627-8810",
    "The Terrace at Charlotte Inn": "Private dining in historic inn. charlotteinn.net / 508-627-4751",
    "Atria": "Brick Cellar or full restaurant for private events. atriamv.com / 508-627-5850",
    "Alchemy Bistro and Bar": "Private events and buyouts. alchemyedgartown.com / 508-627-9999",
    "LEtoile": "Tented outdoor garden for private events. letoile.net / 508-627-5187",
    "State Road Restaurant": "Private events and buyouts. stateroadrestaurant.com / 508-693-8582",
    "Outermost Inn": "Intimate private dining. outermostinn.com / 508-645-3511",
    "Sweet Life Cafe": "Tented outdoor patio for private events. sweetlifecafe.com / 508-696-0200",
    "Chilmark Tavern": "Contact for private buyout. chilmarktavern.com / 508-645-9400",
    "19 Raw": "Private events and buyouts. 19rawoysterbar.com / 774-224-0550",
    "Atlantic Fish and Chop House": "Private events and venue buyout. atlanticrestaurantmv.com",
    "The Dunes at Winnetu": "Multiple private event spaces at Winnetu resort. winnetu.com",
    "Beach Road": "Contact for private events. beachroadmv.com",
  }
}

// Merge PDR data into INITIAL_DATA
Object.entries(PDR_DATA).forEach(([city, venues]) => {
  if (INITIAL_DATA[city]) {
    INITIAL_DATA[city] = INITIAL_DATA[city].map(venue => {
      const pdr = venues[venue.name]
      return pdr ? {...venue, privateDining: pdr} : venue
    })
  }
})
// ─────────────────────────────────────────────────────────────────────────────


const CATEGORY_LABELS = {
  restaurant: "Restaurants",
  sushi: "Sushi",
  bar: "Bars & Cocktail Lounges",
  "private club": "Private Clubs",
  rooftop: "Rooftop Bars",
  f1: "🏎️ F1 Miami Grand Prix",
}

const CATEGORY_ORDER = ["f1","restaurant","sushi","bar","rooftop","private club"]

function StarRating({ val }) {
  return (
    <span style={{ fontSize:13, color:"#BA7517", fontWeight:500 }}>
      {"★".repeat(Math.round(val))}{"☆".repeat(5-Math.round(val))} {val.toFixed(1)}
    </span>
  )
}

function Tags({ venue }) {
  const tagKeys = ["michelin","newBuzz","trendy","classic","celebrity","liveMusic","hardToGet","quiet","privateClub"]
  const tags = tagKeys.filter(k => venue[k])
  return (
    <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginTop:6 }}>
      {tags.map(t => (
        <span key={t} style={{ fontSize:11, padding:"2px 8px", borderRadius:99, background:TAG_COLORS[t].bg, color:TAG_COLORS[t].color, fontWeight:500 }}>
          {TAG_COLORS[t].label}
        </span>
      ))}
    </div>
  )
}

function StatusBadge({ status }) {
  if (!status) return null
  const key = status.toLowerCase()
  const style = STATUS_COLORS[key] || STATUS_COLORS.update
  return (
    <span style={{ fontSize:11, padding:"2px 10px", borderRadius:99, background:style.bg, color:style.color, fontWeight:500, whiteSpace:"nowrap" }}>
      {status}
    </span>
  )
}

function VenueCard({ v: venue, onEditNote, rank }) {
  const isF1 = venue.category === "f1"
  if (isF1) {
    return (
      <div style={{ background: venue.name.includes("Hotspot") ? "#fff" : "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)", border:"0.5px solid #e53935", borderRadius:12, padding:"16px 18px", display:"flex", flexDirection:"column", gap:6 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8 }}>
          <div>
            <a href={venue.url} target="_blank" rel="noopener noreferrer"
              style={{ fontSize:15, fontWeight:500, color: venue.name.includes("Hotspot") ? "#111" : "#fff", textDecoration:"none" }}>
              {venue.name}
            </a>
            <div style={{ fontSize:12, color: venue.name.includes("Hotspot") ? "#e53935" : "#ef9a9a", marginTop:1, fontWeight:500 }}>{venue.type}</div>
          </div>
          {!venue.name.includes("Hotspot") && (
            <span style={{ fontSize:20 }}>🏁</span>
          )}
        </div>
        <p style={{ fontSize:13, color: venue.name.includes("Hotspot") ? "#555" : "#ccc", margin:0, lineHeight:1.6 }}>{venue.desc}</p>
        {venue.notes && <div style={{ fontSize:12, color:"#185FA5", background:"#E6F1FB", borderRadius:6, padding:"6px 10px", lineHeight:1.5 }}>{venue.notes}</div>}
        <div style={{ display:"flex", justifyContent:"flex-end" }}>
          <button onClick={() => onEditNote(venue)} style={{ fontSize:11, color: venue.name.includes("Hotspot") ? "#999" : "#aaa", background:"none", border:"none", cursor:"pointer", padding:"4px 0 0" }}>{venue.notes ? "edit note":"+ note"}</button>
        </div>
      </div>
    )
  }
  return (
    <div style={{ background:"#fff", border:`0.5px solid ${venue.status ? "#378ADD":"#e5e5e5"}`, borderRadius:12, padding:"14px 16px", display:"flex", flexDirection:"column", gap:4, position:"relative" }}>
      {venue.status && <div style={{ position:"absolute", top:10, right:10 }}><StatusBadge status={venue.status} /></div>}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8, paddingRight: venue.status ? 110:0 }}>
        <div style={{ display:"flex", alignItems:"flex-start", gap:8 }}>
          <span style={{ fontSize:11, color:"#ccc", fontWeight:500, minWidth:18, paddingTop:3 }}>#{rank}</span>
          <div>
            <a href={venue.url} target="_blank" rel="noopener noreferrer" style={{ fontSize:15, fontWeight:500, color:"#111", textDecoration:"none" }}>{venue.name}</a>
            <div style={{ fontSize:12, color:"#666", marginTop:1 }}>{venue.type}</div>
          </div>
        </div>
        <StarRating val={venue.stars} />
      </div>
      <p style={{ fontSize:13, color:"#555", margin:"0 0 0 26px", lineHeight:1.5 }}>{venue.desc}</p>
      {venue.privateDining && (
        <div style={{ fontSize:12, color:"#6B21A8", background:"#F0E6FB", borderRadius:6, padding:"6px 10px", marginTop:2, marginLeft:26, lineHeight:1.5 }}>
          🍽 Private Dining: {venue.privateDining}
        </div>
      )}
      {venue.notes && <div style={{ fontSize:12, color:"#185FA5", background:"#E6F1FB", borderRadius:6, padding:"6px 10px", marginTop:2, marginLeft:26, lineHeight:1.5 }}>{venue.notes}</div>}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginLeft:26 }}>
        <Tags venue={venue} />
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <button onClick={() => onEditNote(venue, "privateDining")} style={{ fontSize:11, color:"#9B59B6", background:"none", border:"none", cursor:"pointer", padding:"4px 0 0", whiteSpace:"nowrap" }}>{venue.privateDining ? "edit PDR":"+ PDR"}</button>
          <button onClick={() => onEditNote(venue, "notes")} style={{ fontSize:11, color:"#999", background:"none", border:"none", cursor:"pointer", padding:"4px 0 0", whiteSpace:"nowrap" }}>{venue.notes ? "edit note":"+ note"}</button>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [city, setCity] = useState("NYC")
  const [activeFilters, setActiveFilters] = useState([])
  const [search, setSearch] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [data, setData] = useState(INITIAL_DATA)
  const [recentUpdates, setRecentUpdates] = useState([])
  const [lastRefresh, setLastRefresh] = useState(null)
  const [activeTab, setActiveTab] = useState("cities")
  const [editingVenue, setEditingVenue] = useState(null)
  const [editField, setEditField] = useState("notes")
  const [noteText, setNoteText] = useState("")

  const allVenues = (data[city] || []).filter(venue => {
    const matchFilter = activeFilters.length === 0 || activeFilters.every(f => venue[f])
    const matchSearch = search === "" || venue.name.toLowerCase().includes(search.toLowerCase()) || venue.type.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const venuesByCategory = CATEGORY_ORDER.reduce((acc, cat) => {
    const items = allVenues.filter(v => v.category === cat)
    if (items.length > 0) acc[cat] = items
    return acc
  }, {})

  function toggleFilter(k) {
    setActiveFilters(prev => prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k])
  }

  function openEditNote(venue, field = "notes") {
    setEditingVenue({...venue, city})
    setEditField(field)
    setNoteText(venue[field] || "")
  }

  function saveNote() {
    if (!editingVenue) return
    setData(prev => {
      const updated = JSON.parse(JSON.stringify(prev))
      updated[editingVenue.city] = (updated[editingVenue.city] || []).map(v =>
        v.name === editingVenue.name ? {...v, [editField]: noteText} : v
      )
      return updated
    })
    setEditingVenue(null)
  }

  async function runDailyRefresh() {
    setIsRefreshing(true)
    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          tools:[{ type:"web_search_20250305", name:"web_search" }],
          messages:[{ role:"user", content:`Search for major restaurant and sushi bar news from the past 2 weeks across NYC, Miami, Los Angeles, Las Vegas, San Francisco, Paris, London, Barcelona, Milan, Washington DC, Chicago, Boston, Mykonos, Palo Alto, Scottsdale, West Palm Beach, Fort Lauderdale, Napa. Look for Michelin awards, notable openings, closures, new chefs, buzz-worthy news. Return ONLY a JSON array (no markdown, no preamble) with objects containing: city, name, status (one of: new opening/closed/michelin award/new chef/update), note (one sentence). Return 5-10 updates max. If nothing found return [].` }]
        })
      })
      const d = await resp.json()
      const text = d.content?.filter(b => b.type === "text").map(b => b.text).join("") || "[]"
      let updates = []
      try { updates = JSON.parse(text.replace(/```json|```/g,"").trim()) } catch(e) { updates = [] }
      if (updates.length > 0) {
        const ts = new Date().toLocaleString()
        setRecentUpdates(prev => [...updates.map(u => ({...u, ts})), ...prev].slice(0, 50))
        setData(prev => {
          const updated = JSON.parse(JSON.stringify(prev))
          updates.forEach(u => {
            const cityData = updated[u.city]
            if (cityData) {
              const idx = cityData.findIndex(v => v.name.toLowerCase() === u.name.toLowerCase())
              if (idx !== -1) { cityData[idx].status = u.status; cityData[idx].notes = u.note }
            }
          })
          return updated
        })
      }
      setLastRefresh(new Date().toLocaleString())
    } catch(e) { console.error(e) }
    setIsRefreshing(false)
  }

  const tabStyle = t => ({
    fontSize:13, padding:"6px 16px", borderRadius:99, cursor:"pointer", fontWeight: activeTab===t ? 500:400,
    border:`0.5px solid ${activeTab===t ? "#888":"#ddd"}`,
    background: activeTab===t ? "#f5f5f5":"transparent",
    color: activeTab===t ? "#111":"#666"
  })

  const totalVenues = Object.values(data).reduce((s,arr) => s + arr.length, 0)

  return (
    <div style={{ padding:"24px", fontFamily:"system-ui, sans-serif", maxWidth:1200, margin:"0 auto" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:4 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:500, margin:0, color:"#111" }}>Restaurant & Bar Guide</h1>
          <p style={{ fontSize:14, color:"#666", margin:"2px 0 0" }}>26 cities · {totalVenues}+ venues · restaurants, sushi, bars & private clubs</p>
        </div>
        <button onClick={runDailyRefresh} disabled={isRefreshing}
          style={{ fontSize:13, padding:"6px 14px", borderRadius:8, border:"0.5px solid #ccc", background:"transparent", color: isRefreshing ? "#aaa":"#555", cursor: isRefreshing ? "not-allowed":"pointer" }}>
          {isRefreshing ? "Refreshing...":"Daily Refresh"}
        </button>
      </div>
      {lastRefresh && <p style={{ fontSize:11, color:"#aaa", margin:"0 0 12px" }}>Last refreshed: {lastRefresh}</p>}

      <div style={{ display:"flex", gap:8, marginBottom:20 }}>
        <button style={tabStyle("cities")} onClick={() => setActiveTab("cities")}>Cities</button>
        <button style={tabStyle("updates")} onClick={() => setActiveTab("updates")}>
          Recently Updated {recentUpdates.length > 0 && <span style={{ marginLeft:4, fontSize:11, background:"#E1F5EE", color:"#0F6E56", padding:"1px 6px", borderRadius:99, fontWeight:500 }}>{recentUpdates.length}</span>}
        </button>
      </div>

      {activeTab === "updates" ? (
        <div>
          {recentUpdates.length === 0 ? (
            <div style={{ padding:"2rem", textAlign:"center", color:"#888", fontSize:14, background:"#f9f9f9", borderRadius:8, border:"0.5px solid #eee" }}>
              No updates yet. Hit Daily Refresh to check for news across all cities.
            </div>
          ) : recentUpdates.map((u, i) => (
            <div key={i} style={{ background:"#fff", border:"0.5px solid #eee", borderRadius:10, padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12, marginBottom:8 }}>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
                  <span style={{ fontSize:14, fontWeight:500, color:"#111" }}>{u.name}</span>
                  <span style={{ fontSize:12, color:"#aaa" }}>·</span>
                  <span style={{ fontSize:12, color:"#666" }}>{u.city}</span>
                  <StatusBadge status={u.status} />
                </div>
                <p style={{ fontSize:13, color:"#555", margin:0, lineHeight:1.5 }}>{u.note}</p>
              </div>
              <span style={{ fontSize:11, color:"#aaa", whiteSpace:"nowrap", paddingTop:2 }}>{u.ts}</span>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:11, fontWeight:500, color:"#aaa", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6 }}>United States</div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:12 }}>
              {US_CITIES.map(c => {
                const hasUpdates = (data[c]||[]).some(v => v.status)
                return (
                  <button key={c} onClick={() => { setCity(c); setSearch("") }}
                    style={{ fontSize:13, padding:"5px 12px", borderRadius:99, border:`0.5px solid ${c===city?"#888":"#ddd"}`, background: c===city?"#f0f0f0":"transparent", color: c===city?"#111":"#666", cursor:"pointer", fontWeight: c===city?500:400 }}>
                    {c}{hasUpdates && <span style={{ display:"inline-block", width:6, height:6, borderRadius:99, background:"#1D9E75", marginLeft:5, verticalAlign:"middle", marginTop:-2 }} />}
                  </button>
                )
              })}
            </div>
            <div style={{ fontSize:11, fontWeight:500, color:"#aaa", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6 }}>International</div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {INTL_CITIES.map(c => {
                const hasUpdates = (data[c]||[]).some(v => v.status)
                return (
                  <button key={c} onClick={() => { setCity(c); setSearch("") }}
                    style={{ fontSize:13, padding:"5px 12px", borderRadius:99, border:`0.5px solid ${c===city?"#888":"#ddd"}`, background: c===city?"#f0f0f0":"transparent", color: c===city?"#111":"#666", cursor:"pointer", fontWeight: c===city?500:400 }}>
                    {c}{hasUpdates && <span style={{ display:"inline-block", width:6, height:6, borderRadius:99, background:"#1D9E75", marginLeft:5, verticalAlign:"middle", marginTop:-2 }} />}
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{ display:"flex", gap:8, marginBottom:12, flexWrap:"wrap", alignItems:"center" }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or type..."
              style={{ flex:"1 1 160px", minWidth:140, fontSize:13, padding:"6px 12px", borderRadius:8, border:"0.5px solid #ddd", color:"#111" }} />
            {FILTERS.map(f => (
              <button key={f.key} onClick={() => toggleFilter(f.key)}
                style={{ fontSize:12, padding:"5px 12px", borderRadius:99, border:`0.5px solid ${activeFilters.includes(f.key) ? TAG_COLORS[f.key].color:"#ddd"}`, background: activeFilters.includes(f.key) ? TAG_COLORS[f.key].bg:"transparent", color: activeFilters.includes(f.key) ? TAG_COLORS[f.key].color:"#888", cursor:"pointer", fontWeight: activeFilters.includes(f.key) ? 500:400 }}>
                {f.label}
              </button>
            ))}
          </div>

          <div style={{ marginBottom:16 }}>
            <span style={{ fontSize:12, color:"#aaa" }}>{allVenues.length} venue{allVenues.length !== 1 ? "s":""} in {city}</span>
          </div>

          {allVenues.length === 0 ? (
            <div style={{ padding:"2rem", textAlign:"center", color:"#888", fontSize:14 }}>No venues match your filters.</div>
          ) : (
            Object.entries(venuesByCategory).map(([cat, venues]) => (
              <div key={cat} style={{ marginBottom:32 }}>
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                  <h2 style={{ fontSize:16, fontWeight:500, margin:0, color: cat === "f1" ? "#e53935" : "#111" }}>
                    {cat === "sushi" ? "🍣 " : cat === "bar" ? "🍸 " : cat === "rooftop" ? "🏙️ " : cat === "private club" ? "🔑 " : cat === "f1" ? "" : ""}
                    {CATEGORY_LABELS[cat] || cat}
                  </h2>
                  <span style={{ fontSize:12, color:"#aaa" }}>{venues.length} spots</span>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:12 }}>
                  {venues.map((venue, i) => <VenueCard key={venue.name} v={venue} onEditNote={openEditNote} rank={i+1} />)}
                </div>
              </div>
            ))
          )}
        </>
      )}

      {editingVenue && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.35)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:999 }}
          onClick={e => { if (e.target === e.currentTarget) setEditingVenue(null) }}>
          <div style={{ background:"#fff", borderRadius:12, padding:"20px 24px", width:"min(420px, 90vw)", border:"0.5px solid #eee" }}>
            <p style={{ fontWeight:500, fontSize:15, margin:"0 0 4px" }}>{editingVenue.name}</p>
            <p style={{ fontSize:12, color:"#888", margin:"0 0 12px" }}>
              {editField === "privateDining"
                ? "Private dining capacity & buyout info (e.g. PDR fits 12, full buyout 80, available Mon-Thu)"
                : "Add a note or status update"}
            </p>
            <textarea value={noteText} onChange={e => setNoteText(e.target.value)}
              placeholder={editField === "privateDining"
                ? "e.g. Private room seats 18, full buyout 120 guests available Sun–Thu. Contact events@..."
                : "e.g. Visited March 2026 — incredible omakase, ask for the chef's selection sake pairing..."}
              style={{ width:"100%", minHeight:80, fontSize:13, padding:"8px 10px", borderRadius:8, resize:"vertical", border:"0.5px solid #ddd", fontFamily:"system-ui, sans-serif", boxSizing:"border-box" }} />
            <div style={{ display:"flex", gap:8, marginTop:12, justifyContent:"flex-end" }}>
              <button onClick={() => setEditingVenue(null)} style={{ fontSize:13, padding:"6px 16px", borderRadius:8, border:"0.5px solid #ddd", background:"transparent", color:"#666", cursor:"pointer" }}>Cancel</button>
              <button onClick={saveNote} style={{ fontSize:13, padding:"6px 16px", borderRadius:8, border:"0.5px solid #ccc", background:"#f5f5f5", color:"#111", cursor:"pointer", fontWeight:500 }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
)
