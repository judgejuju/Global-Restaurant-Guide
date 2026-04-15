import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { useState, useRef, useEffect } from "react"

// Leaflet CSS injected once
if (!document.getElementById("leaflet-css")) {
  const link = document.createElement("link")
  link.id = "leaflet-css"
  link.rel = "stylesheet"
  link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
  document.head.appendChild(link)
}

const US_CITIES = [
  "Boston","Calistoga","Chicago","Fort Lauderdale","Healdsburg",
  "Las Vegas","LA/WeHo","Martha's Vineyard","Menlo Park","Miami","Napa",
  "NYC","Palo Alto","San Francisco","Santa Monica","Scottsdale",
  "Sonoma","St. Helena","Venice CA","Washington DC","West Palm Beach","Lyons NYC"
]
const INTL_CITIES = [
  "Barcelona","Cannes","London","Milan","Mykonos","Paris","Seoul"
]
const CITIES = [...US_CITIES, ...INTL_CITIES]

const A16Z_CITY_SET = new Set(["NYC","San Francisco","Menlo Park","Washington DC","Santa Monica","Seoul"])

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
const v = (name,type,desc,stars,flags,url,lat,lng,cat="restaurant",neighborhood="") =>
  ({name,type,desc,stars,...flags,url,lat,lng,category:cat,status:"",notes:"",privateDining:"",neighborhood})

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
    v("Sant Ambroeus SoHo","Italian Milanese","NYC's most reliable celebrity sighting, Milanese institution since 1936 — vitello tonnato, cotoletta, freddo cappuccino, the best Lafayette terrace in downtown",4.5,f(false,false,true,false,true,false,false,false),"https://santambroeus.com/pages/location-soho",40.7233,-74.0020),
    // Bars
    v("Employees Only","Cocktail Bar","Legendary speakeasy-style cocktail bar, West Village",4.6,f(false,false,false,true,true,false,false,false),"https://employeesonlynyc.com",40.7339,-74.0051,"bar"),
    v("Death & Co","Cocktail Bar","Craft cocktail pioneer, East Village institution",4.6,f(false,false,false,true,false,false,false,false),"https://deathandcompany.com",40.7254,-73.9831,"bar"),
    v("Bar Goto","Japanese Cocktail Bar","Intimate Japanese-inspired cocktails, Lower East Side",4.6,f(false,false,false,true,false,false,false,true),"https://bargoto.com",40.7225,-73.9896,"bar"),
    v("Attaboy","Cocktail Bar","No-menu speakeasy, bartenders craft your perfect drink",4.6,f(false,false,false,true,false,false,false,false),"https://attaboy.us",40.7198,-73.9876,"bar"),
    v("Sip & Guzzle","Cocktail Bar","Tokyo-inspired bi-level bar, Alinea alum cooking, West Village sensation",4.7,f(false,true,true,false,true,false,true,false),"https://sipandguzzlenyc.com",40.7329,-74.0031,"bar"),
    v("The Dead Rabbit","Cocktail Bar","Five-time world's best bar, Irish pub meets craft cocktails",4.4,f(false,false,false,true,false,false,false,false),"https://thedeadrabbitnyc.com",40.7033,-74.0135,"bar"),
    v("Four Horsemen","Wine Bar","James Murphy's natural wine bar, Michelin starred, Williamsburg",4.4,f(true,false,true,false,true,false,false,true),"https://fourhorsemenbk.com",40.7158,-73.9500,"bar"),
    v("Maison Premiere","Oyster Bar","New Orleans-inspired oysters and absinthe, Williamsburg",4.5,f(false,false,true,false,true,false,false,true),"https://maisonpremiere.com",40.7156,-73.9572,"bar"),
    v("The Crosby Bar","Hotel Bar & Restaurant","Firmdale's eclectic SoHo brasserie inside Crosby Street Hotel — ivy-covered sunken terrace, Kit Kemp design, afternoon tea with caviar, all-day scene",4.5,f(false,false,true,false,true,false,false,false),"https://firmdalehotels.com/hotels/crosby-street-hotel/restaurant-bar",40.7233,-73.9973,"bar"),
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

  "LA/WeHo": [
    // ── Michelin / Fine Dining ────────────────────────────────────────────
    v("Somni","Spanish Contemporary","Three Michelin stars in 2025 — WeHo's most transcendent experience, Chef Aitor Zabala, 14-seat chef's counter, $495pp, modernist Catalan tasting menu, shiso tempura tartare, mandatory beverage pairing, 'dream' in Catalan",4.9,f(true,true,false,false,true,false,true,true),"https://somnila.com",34.0736,-118.4004,"restaurant","West Hollywood"),
    v("Providence","Seafood","Two Michelin stars — Michael Cimarusti's temple to the sea, LA's finest seafood dining",4.9,f(true,false,false,true,true,false,true,true),"https://providencela.com",34.0833,-118.3418,"restaurant","Los Angeles"),
    v("n/naka","Japanese Kaiseki","Two Michelin stars — Niki Nakayama's kaiseki masterpiece, 13 courses, near-impossible reservation",4.9,f(true,false,false,false,false,false,true,true),"https://n-naka.com",34.0195,-118.3542,"restaurant","Los Angeles"),
    v("Vespertine","Avant-garde","One Michelin star — Jordan Kahn's otherworldly sci-fi dining experience in Culver City",4.8,f(true,false,true,false,true,false,true,true),"https://vespertine.la",34.0093,-118.3951,"restaurant","Los Angeles"),
    v("Gucci Osteria","Italian","One Michelin star — Massimo Bottura's Beverly Hills outpost, seasonal Italian, a pilgrimage for food lovers",4.6,f(true,false,true,false,true,false,true,false),"https://gucciosteria.com/beverly-hills",34.0736,-118.3960,"restaurant","Los Angeles"),
    v("Ardor","California Vegetable","MICHELIN Selected, The West Hollywood EDITION — Chef John Fraser, vegetables take center stage, grilled branzino, tropical-chic Architectural Digest interiors",4.7,f(false,false,true,false,true,false,true,false),"https://ardorla.com",34.0917,-118.3820,"restaurant","West Hollywood"),
    v("Sushi Ginza Onodera","Japanese Omakase","One Michelin star — Beverly Hills omakase, fish flown directly from Ginza Tokyo fish markets",4.8,f(true,false,false,false,false,false,true,true,false,true),"https://losangeles.sushiginzaonodera.com",34.0736,-118.3990,"sushi","Los Angeles"),
    // ── West Hollywood — New 2025 ─────────────────────────────────────────
    v("Sushisamba West Hollywood","Japanese-Brazilian-Peruvian","March 2026 flagship opening — 11,000 sq ft $20M rooftop next to Kimpton La Peer, retractable dome, old Hollywood glamour by Dizon Collective, robata bar, shiso caipirinhas, crispy tuna rice, private dining room with its own elevator",4.7,f(false,true,true,false,true,false,false,false),"https://sushisamba.com/locations/west-hollywood",34.0927,-118.3840,"rooftop","West Hollywood"),
    v("Darling","Live-Fire American","Chef Sean Brock (Husk) comes to WeHo — citrus, oak and almond wood fire cookery, California coastal ingredients, hi-fi vinyl listening lounge on the patio, one of the most anticipated 2025 openings",4.7,f(false,true,true,false,true,true,true,false),"https://darlingweho.com",34.0927,-118.3840,"restaurant","West Hollywood"),
    v("Ladyhawk","Eastern Mediterranean","Kimpton La Peer — Top Chef's Charbel Hayek, octopus with chorizo butter, olive-crusted rack of lamb, hummus and garlic labneh with pillowy pita, best new social table in WeHo",4.6,f(false,true,true,false,true,false,true,false),"https://ladyhawkla.com",34.0917,-118.3820,"restaurant","West Hollywood"),
    v("Marea Beverly Hills","Italian Seafood","NYC's legendary seafood temple lands in Beverly Hills (Jan 2025) — bone marrow fusilli, Dungeness crab pappardelle, onyx bar, blue Murano chandelier, Sophia Loren portrait, instant power lunch",4.7,f(false,true,true,false,true,false,true,true),"https://marearestaurant.com/beverly-hills",34.0736,-118.3980,"restaurant","Los Angeles"),
    v("Monsieur Dior by Dominique Crenn","French","Three Michelin star chef Dominique Crenn's first restaurant outside Paris — atop House of Dior Beverly Hills, caviar service, Black Truffle Agnolotti, Guinea Hen Rodeo, designed by Peter Marino",4.8,f(true,true,false,false,true,false,true,true),"https://dior.com/restaurant",34.0736,-118.3980,"restaurant","Los Angeles"),
    v("Andys","New American","Anderson .Paak's retro 1970s lounge — live music and vinyl DJ sets, New American small plates with Asian twist, bottle service tables, occasional celebrity appearances by the owner himself",4.5,f(false,true,true,false,true,true,false,false),"https://andysweho.com",34.0917,-118.3820,"bar","West Hollywood"),
    v("Marvito","Tex-Mex Cantina","WeHo's latest late-night crusader, open until midnight — queso dip with chorizo, crispy beef tacos, chicken piccata, La Picosa Old Fashioned, fun rowdy group dinner energy",4.5,f(false,true,true,false,false,false,false,false),"https://marvito.la",34.0917,-118.3820,"restaurant","West Hollywood"),
    v("Coucou","French Bistro","Venice's celebrated French bistro comes to WeHo — Apero Hour at the marble bar 5–6pm, steak frites, chicken paillard, relaxed and refined with coastal California produce",4.6,f(false,false,true,false,true,false,false,false),"https://coucourestaurant.com",34.0917,-118.3820,"restaurant","West Hollywood"),
    // ── West Hollywood — Established Icons ───────────────────────────────
    v("Merois","Asian Fusion Rooftop","Wolfgang Puck's rooftop atop Pendry West Hollywood — sweeping LA skyline views, hamachi tostada with yuzu kosho, scallop pad thai, crab fried rice, Japanese milk bread with coconut kaya, the city's most glamorous dinner view",4.7,f(false,false,true,false,true,false,true,false),"https://meroisweho.com",34.0927,-118.3820,"rooftop","West Hollywood"),
    v("Catch LA","Seafood Rooftop","WeHo rooftop celebrity dining — always packed with industry, the classic LA scene experience",4.4,f(false,false,true,false,true,false,false,false),"https://catchrestaurants.com/location/la",34.0917,-118.3750,"rooftop","West Hollywood"),
    v("Craig's","American","Melrose Avenue celebrity institution — George Clooney, Ozzy Osbourne, John Legend regulars, honey truffle chicken, old Hollywood charm, paparazzi outside on weekends",4.5,f(false,false,false,true,true,false,false,false),"https://craigsla.com",34.0855,-118.3730,"restaurant","West Hollywood"),
    v("Cecconi's West Hollywood","Italian","Design District Italian icon — wood-oven pizzas, fresh pastas, Soho House sister, always a chic scene",4.5,f(false,false,true,false,true,false,false,false),"https://cecconis.com/west-hollywood",34.0855,-118.3760,"restaurant","West Hollywood"),
    v("Night + Market WeHo","Thai","Kris Yenbamroong's Thai institution on Sunset Strip — great food, great wine, always feels like a party, the casual WeHo spot that everyone loves",4.6,f(false,false,true,false,true,false,false,false),"https://nightandmarketweho.com",34.0917,-118.3770,"restaurant","West Hollywood"),
    v("Horses","American Bistro","Coolest room in LA — natural wine, perpetually buzzy, East Hollywood neighborhood gem",4.7,f(false,true,true,false,true,false,true,false),"https://horsesla.com",34.0903,-118.3690,"restaurant","West Hollywood"),
    v("Dan Tana's","Italian","Sunset Strip institution since 1964 — red-leather booths, checkered tablecloths, George Clooney and Brad Pitt since forever, cozy yellow bungalow, the OG Hollywood Italian",4.5,f(false,false,false,true,true,false,false,false),"https://dantanasrestaurant.com",34.0917,-118.3820,"restaurant","West Hollywood"),
    v("Delilah","Supper Club","WeHo's sexiest supper club — no photos allowed, Drake/Kendall/Biebers spotted regularly, vintage-inspired, prohibition cocktails, celebrity party central",4.5,f(false,true,false,true,true,true,false,false),"https://delilahla.com",34.0855,-118.3730,"bar","West Hollywood"),
    v("Tower Bar at Sunset Tower Hotel","Hotel Bar","Sunset Strip's most storied hotel bar — Art Deco 1929 building, Marilyn Monroe, Jean Harlow, Sinatra all lived here, stresses-out agents, Olsen twins, enraged agents — legendary scene",4.5,f(false,false,false,true,true,false,false,true),"https://sunsettowerhotel.com",34.0927,-118.3870,"bar","West Hollywood"),
    v("Skybar at Mondrian","Rooftop Pool Bar","Rande Gerber's iconic 1996 pool bar — A-list party history, ivy-covered open-air pavilion, world-class DJs, best views of WeHo",4.4,f(false,false,true,false,true,true,false,false),"https://sbe.com/nightlife/skybar",34.0917,-118.3870,"rooftop","West Hollywood"),
    v("Employees Only WeHo","Cocktail Bar","Prohibition-style cocktails next to Delilah — head here after dinner for the perfect nightcap",4.5,f(false,false,true,false,true,false,false,false),"https://employeesonlyla.com",34.0855,-118.3730,"bar","West Hollywood"),
    // ── LA Classics & Broader ─────────────────────────────────────────────
    v("Baldi at Waldorf Astoria","Tuscan Steakhouse","Edoardo Baldi's Beverly Hills debut (2025) — olive-wood fired steaks, spectacular room at Waldorf Astoria",4.8,f(false,true,true,false,true,false,true,true),"https://baldibeverlyhills.com",34.0736,-118.3980,"restaurant","Los Angeles"),
    v("Bestia","Italian","Arts District anchor — wood-fired and perpetually buzzy, charcuterie, house-made pastas",4.7,f(false,false,true,false,true,false,true,false),"https://bestiala.com",34.0411,-118.2327,"restaurant","Los Angeles"),
    v("Mother Wolf","Italian","Evan Funke's Rome-inspired pasta palace in Hollywood — hand-pulled cacio e pepe at the marble bar",4.5,f(false,true,true,false,true,false,true,false),"https://motherwolfla.com",34.1016,-118.3278,"restaurant","Los Angeles"),
    v("Jon & Vinny's","Italian-American","Best pasta in LA — always packed, Silver Lake staple, great Calabrian chili pizza",4.7,f(false,false,true,false,true,false,true,false),"https://jonandvinnys.com",34.0831,-118.2707,"restaurant","Los Angeles"),
    v("Spago","California","Wolfgang Puck's legendary Beverly Hills institution — smoked salmon pizza, power lunch, always outstanding",4.6,f(false,false,false,true,true,false,false,true),"https://wolfgangpuck.com/dining/spago-beverly-hills",34.0736,-118.3980,"restaurant","Los Angeles"),
    v("The Polo Lounge","American","Beverly Hills Hotel institution — power breakfast legends, Henry Fonda and Katharine Hepburn corner booths",4.5,f(false,false,false,true,true,false,false,false),"https://beverlyhillshotel.com/dining/polo-lounge",34.0790,-118.4134,"restaurant","Los Angeles"),
    v("Gjusta","Bakery/Deli","Venice institution — perpetual lines, celebrity hangout, best bread and tinned fish in LA",4.6,f(false,false,false,true,true,false,false,false),"https://gjusta.com",33.9901,-118.4710,"restaurant","Los Angeles"),
    v("Bar Marmont","Cocktail Bar","Chateau Marmont's eternal celebrity haunt — the most reliable celebrity sighting in LA, always on",4.4,f(false,false,false,true,true,false,false,false),"https://chateaumarmont.com",34.0927,-118.3820,"bar","Los Angeles"),
    v("Musso & Frank Grill","American","Hollywood's oldest restaurant since 1919 — Sinatra, Monroe, Garbo, Brando all dined here, the flannel shirt and martini crowd",4.4,f(false,false,false,true,true,false,false,false),"https://mussoandfrank.com",34.1013,-118.3280,"restaurant","Los Angeles"),
    v("The Jonathan Club","Private Members Club","LA's most prestigious private club — Downtown and Beach locations",4.7,f(false,false,false,true,true,false,true,true,true),"https://jc.org",34.0490,-118.2520,"private club","Los Angeles"),
    v("Soho House West Hollywood","Private Members Club","The creative industry's living room — film, fashion, music, art, rooftop pool",4.5,f(false,false,true,false,true,false,false,false,true),"https://sohohouse.com/houses/soho-house-west-hollywood",34.0855,-118.3730,"private club","Los Angeles"),
    // ── Sushi ─────────────────────────────────────────────────────────────
    v("Sushi Park","Japanese Omakase","Hidden rooftop omakase on Sunset Strip — Taylor Swift, Beyoncé, the Kardashians all keep it secret, no salad/no tempura/no 'trendy sushi' sign at the door, pure outstanding quality",4.7,f(false,false,false,true,true,false,true,false,false,true),"https://sushiparkla.com",34.0917,-118.3770,"sushi","West Hollywood"),
    v("Nobu Malibu","Japanese-Peruvian","Oceanfront Nobu on PCH — celebrity central, stunning Malibu setting, sashimi tacos",4.6,f(false,false,true,false,true,false,false,false,false,true),"https://noburestaurants.com/malibu",34.0195,-118.6789,"sushi","Los Angeles"),
    v("Sushi Zo","Japanese Omakase","Pure omakase experience — beautifully fresh fish, artful preparation, West LA institution",4.7,f(false,false,false,true,false,false,true,true,false,true),"https://sushizo.us",34.0195,-118.4912,"sushi","Los Angeles"),
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
    // ── Michelin / Fine Dining ────────────────────────────────────────────
    v("Inn at Little Washington","American Contemporary","Three Michelin stars, Patrick O'Connell's masterpiece in the Virginia countryside — jacket required, most theatrical dining in the region",4.9,f(true,false,false,true,true,false,true,true),"https://theinnatlittlewashington.com",38.9072,-77.0369),
    v("Minibar by José Andrés","Avant-garde","Two Michelin stars, 20-course theatrical tasting menu — José Andrés at his most experimental and wildly fun",4.9,f(true,false,true,false,true,false,true,true),"https://minibarbyandres.com",38.8977,-77.0255),
    v("Pineapple and Pearls","Contemporary American","Two Michelin stars, Aaron Silverman's all-in luxury tasting menu — the most indulgent dinner in DC",4.8,f(true,false,false,false,false,false,true,true),"https://pineappleandpearls.com",38.8817,-77.0035),
    v("Bresca","Contemporary American","One Michelin star, Ryan Ratino's endlessly creative tasting menu — one of DC's best overall dining experiences",4.8,f(true,false,true,false,false,false,true,true),"https://brescadc.com",38.9098,-77.0321),
    v("Fiola","Italian","Fabio Trabocchi's Penn Quarter Italian — two Michelin stars, extraordinary pasta and seafood, power lunch circuit staple",4.8,f(true,false,false,true,true,false,true,true),"https://fioladc.com",38.8967,-77.0235),
    v("Dabney","Mid-Atlantic","One Michelin star, Jeremiah Langhorne — entire menu sourced from the mid-Atlantic, most locally-rooted restaurant in DC",4.7,f(true,false,false,false,false,false,true,true),"https://thedabney.com",38.9077,-77.0221),
    v("Metier","Contemporary American","One Michelin star, intimate Dupont Circle tasting menu — jewel-box room, exceptional wine program",4.7,f(true,false,false,false,false,false,true,true),"https://metierdc.com",38.9107,-77.0431),
    v("Jônt","Japanese-American","Two Michelin stars, Ryan Ratino's progressive tasting counter — open kitchen, Japan-inspired, 20 courses of brilliance",4.8,f(true,false,false,false,false,false,true,true),"https://jontrestaurant.com",38.9098,-77.0321),
    v("Gravitas","Contemporary American","One Michelin star, intimate Shaw tasting menu — inventive seasonal cooking with warmth and precision",4.7,f(true,false,false,false,false,false,true,true),"https://gravitasdc.com",38.9087,-77.0221),
    // ── Power Dining / Politicians ────────────────────────────────────────
    v("The Occidental","American","Stephen Starr's $16M reimagination of the 1906 Willard Hotel landmark (reopened March 2025) — the ultimate power dining room, portraits of every president and senator on the walls, tableside bananas foster and martinis poured from a cart, Cuban Missile Crisis was negotiated here over pork chops, two blocks from the White House",4.8,f(false,true,true,false,true,false,true,false),"https://theoccidentaldc.com",38.8987,-77.0355),
    v("Café Milano","Italian","Georgetown's most politically charged restaurant — Clinton and Obama haunt, lobbyists and diplomats at every table, Euro jet-set crowd, great pizza and pasta",4.6,f(false,false,true,false,true,false,false,false),"https://cafemilano.com",38.9047,-77.0635),
    v("Bourbon Steak DC","Steakhouse","Michael Mina's Four Seasons Georgetown — Obama anniversary spot, discrete VIP room, butter-poached dry-aged cuts, the most powerful steakhouse table in Georgetown",4.7,f(false,false,false,true,true,false,true,true),"https://michaelmina.net/bourbon-steak-dc",38.9047,-77.0595),
    v("The Prime Rib","Steakhouse","DC's original power steakhouse since 1976 — black tie waitstaff, live piano, prime rib carved tableside, senators and ambassadors every night",4.7,f(false,false,false,true,true,true,false,true),"https://theprimerib.com/dc",38.9008,-77.0445),
    v("Fiola Mare","Italian Seafood","Michelin-starred Georgetown waterfront Italian — Cabinet members, First Ladies and diplomats, best power lunch in DC, 'inevitably run into 10 people from the Hill'",4.8,f(true,false,false,true,true,false,true,true),"https://fiolamaredc.com",38.9047,-77.0595),
    v("1789","Georgetown American","Historic Georgetown townhouse, Obama-Merkel state dinner venue — six intimate dining rooms, farm-to-fork, senators and state reps",4.7,f(false,false,false,true,true,false,true,true),"https://1789restaurant.com",38.9117,-77.0727),
    v("Martin's Tavern","American","Georgetown institution since 1933 — JFK proposed in Booth #3, Truman/LBJ/Nixon regulars, ultimate old-guard Washington",4.5,f(false,false,false,true,true,false,false,false),"https://martinstavern.com",38.9097,-77.0677),
    v("Old Ebbitt Grill","American","DC's oldest saloon (1856) — closest full-service restaurant to the White House, Grant/Cleveland/TR regulars, power breakfast institution",4.6,f(false,false,false,true,true,false,false,false),"https://oldebbitt.com",38.8987,-77.0335),
    v("The Palm DC","Steakhouse","Dupont Circle lobbyist central — caricatures of politicians, journalists and convicted felons crowd the walls, dry-aged porterhouse, crab cakes, old-school DC power dining",4.5,f(false,false,false,true,true,false,false,false),"https://thepalm.com/dc",38.9117,-77.0421),
    v("The Monocle","American","107 D St NE — closest restaurant to the Capitol, congressmen and senators since 1960, lobbyist fundraising central, classic American steakhouse",4.5,f(false,false,false,true,true,false,false,false),"https://themonocle.com",38.8917,-77.0055),
    v("Charlie Palmer Steak","Steakhouse","Capitol Hill steakhouse with views of the Capitol dome — lawmaker and lobbyist central, excellent dry-aged beef",4.6,f(false,false,false,true,true,false,false,true),"https://charliepalmer.com/charlie-palmer-steak-dc",38.8927,-77.0085),
    v("BLT Steak DC","Steakhouse","Trump legal team powwow restaurant, NY Times famously overheard a strategy session here — popovers, prime USDA aged cuts, scene-y bar",4.6,f(false,false,true,false,true,false,false,false),"https://bltrestaurants.com/blt-steak/washington-dc",38.9008,-77.0375),
    v("Le Diplomate","French Brasserie","Stephen Starr's brasserie — DC's most beloved restaurant, Biden spotted here, perpetual A-list scene on 14th Street NW",4.7,f(false,false,true,false,true,false,true,false),"https://lediplomatedc.com",38.9093,-77.0322),
    v("Rasika","Indian","Best Indian in America — two Michelin Bib Gourmand locations (Penn Quarter + West End), James Beard nominated, palak chaat is iconic",4.7,f(false,false,true,false,false,false,true,false),"https://rasikarestaurant.com",38.8987,-77.0195),
    v("CUT by Wolfgang Puck","Steakhouse","Rosewood Georgetown's evolved steakhouse — full buyout available up to 70, private room 22 seated, impeccable wagyu and dry-aged cuts",4.7,f(false,false,false,true,true,false,true,true),"https://cutrestaurant.com/washington-dc",38.9047,-77.0595),
    // ── New Openings 2025 ─────────────────────────────────────────────────
    v("Aqua Bistecca","Italian Seafood","Michael Mina's splashy 2025 DC return at City Ridge — Italian surf-and-turf, Lambrusco butter steaks, mozzarella stick topped with caviar, bold red-lit bar like Paris's Big Mamma Group",4.6,f(false,true,true,false,true,false,false,false),"https://aquabistecca.com",38.9427,-77.0621),
    v("Maison Bar à Vins","French Wine Bar","Adams Morgan (Sept 2025) — Lutèce team's Parisian wine bar in a 3-story historic rowhouse, 1,000+ bottle list, bone marrow toast, smoked eel croquettes, live music, wood-burning fireplaces",4.7,f(false,true,true,false,false,true,true,false),"https://maisondc.com",38.9217,-77.0401,"bar"),
    v("Dōgon by Kwame Onwuachi","Afro-Caribbean","Yelp's Best New Restaurant of 2025 — James Beard-winning chef, Jamaican/Nigerian/Trinidadian/Creole influences at The Wharf, explosive flavors and cultural storytelling",4.7,f(false,true,true,false,true,false,true,false),"https://dogondc.com",38.8787,-77.0195),
    v("Tapori","South Asian Street Food","Eater DC's Best New Restaurant 2025 on H Street NE — bold Indian and Nepali street food, dosas, biryanis, tropical cocktails, lively neighborhood vibe",4.6,f(false,true,true,false,false,false,false,false),"https://taporidc.com",38.9007,-76.9935),
    v("Elmina","West African Seafood","Shaw's dramatic multi-story cultural dining experience — jollof rice with duck, goat in peanut soup, fried turkey tail with shito sauce, Ghanaian design throughout",4.6,f(false,true,true,false,false,false,false,false),"https://elminarestaurant.com",38.9107,-77.0241),
    // ── Trendy & Hot ─────────────────────────────────────────────────────
    v("Rose's Luxury","American","James Beard Award winner, Capitol Hill charmer — no reservations, creative seasonal menu, the most fun restaurant in DC",4.7,f(false,false,true,false,false,false,false,false),"https://rosesluxury.com",38.8817,-77.0035),
    v("Cranes","Spanish-Japanese","Michelin-starred Penn Quarter fusion — one of DC's most inventive restaurants, Spanish and Japanese techniques collide beautifully",4.7,f(true,false,true,false,false,false,true,true),"https://cranesdc.com",38.8987,-77.0255),
    v("Pascual","Mexican","Popal Group's acclaimed Mexican — wood-fired, seasonal, deeply sourced, the new destination for serious Mexican food in DC",4.7,f(false,true,true,false,false,false,true,false),"https://pascualdc.com",38.9107,-77.0301),
    v("Tail Up Goat","New American","Adams Morgan darling — one of the most inventive menus in DC, great natural wine list, neighborhood gem with city-wide reputation",4.7,f(false,false,true,false,false,false,true,true),"https://tailupgoat.com",38.9207,-77.0401),
    v("St. Anselm","American","Shaw wood-fired steakhouse, Stephen Starr — ember-cooked meats, whole fish, simple and exceptional, always packed",4.7,f(false,false,true,false,true,false,false,false),"https://stanselm.com",38.9107,-77.0221),
    v("All-Purpose","Italian-American","Shaw and Capitol Riverfront pizza and pasta — wood-fired pies, great negronis, DC's best pizza",4.6,f(false,false,true,false,false,false,false,false),"https://allpurposedc.com",38.9087,-77.0201),
    v("Maydan","Middle Eastern","Adams Morgan fire-cooking — whole-roasted meats, flatbreads from the wood-burning hearth, convivial and loud and wonderful",4.7,f(false,false,true,false,false,false,false,false),"https://maydandc.com",38.9207,-77.0371),
    v("Spoken English","Omakase Cocktail Bar","14th Street omakase cocktail bar — by the Columbia Room team, extraordinary drinks and snacks, Michelin-recognized",4.8,f(true,false,true,false,false,false,true,true),"https://spokenenglishdc.com",38.9127,-77.0301,"bar"),
    // ── Bars & Late Night ─────────────────────────────────────────────────
    v("Columbia Room","Cocktail Bar","Michelin-starred cocktail bar — three distinct spaces: Punch Garden, Spirit of '68 salon, and intimate Tasting Room, best cocktails in DC",4.8,f(true,false,true,false,false,false,true,true),"https://columbiaroomdc.com",38.9127,-77.0301,"bar"),
    v("Off The Record","Bar","Hay-Adams Hotel — 'the place to be seen and not heard,' moody underground bar below the White House, political portraits on every wall, best martinis and Manhattans",4.5,f(false,false,false,true,true,false,false,true),"https://hayadams.com/dining/off-the-record",38.8987,-77.0375,"bar"),
    v("Jack Rose Dining Saloon","Whiskey Bar","Adams Morgan whiskey institution — 2,700 bottles, three floors, rooftop with DC skyline views",4.6,f(false,false,false,true,true,false,false,false),"https://jackrosediningsaloon.com",38.9217,-77.0381,"bar"),
    v("The Round Robin Bar","Cocktail Bar","Willard InterContinental — the 'Oval Office of Bars,' crafting cocktails for DC's elite since 1847, Henry Clay introduced the mint julep here in 1850",4.6,f(false,false,false,true,true,false,false,true),"https://washington.intercontinental.com/dining/round-robin",38.8987,-77.0345,"bar"),
    v("Immigrant Food","Global Street Food","Penn Quarter political-meets-global dining, buzzy bar scene",4.4,f(false,false,true,false,false,false,false,false),"https://immigrantfood.com",38.8967,-77.0255),
    // ── Private Clubs ─────────────────────────────────────────────────────
    v("Metropolitan Club","Private Members Club","One of DC's oldest and most prestigious private clubs — senators, cabinet members, Supreme Court justices",4.6,f(false,false,false,true,true,false,true,true,true),"https://metropolitanclubdc.org",38.9028,-77.0395,"private club"),
    // ── Sushi ─────────────────────────────────────────────────────────────
    v("Sushi Nakazawa DC","Japanese Omakase","DC outpost of the legendary NYC omakase — exceptional quality, 20-course counter experience",4.8,f(true,false,false,false,false,false,true,true,false,true),"https://sushinakazawa.com/dc",38.9008,-77.0395,"sushi"),
    v("Masako","Japanese Omakase","Acclaimed new DC omakase counter — exceptional fish sourcing, one of the most talked-about new sushi experiences in the city",4.7,f(false,true,false,false,false,false,true,true,false,true),"https://masakodc.com",38.9008,-77.0295,"sushi"),
    v("Himitsu","Japanese","Petworth neighborhood omakase, Michelin Bib Gourmand — creative and fun, best value omakase in DC",4.7,f(false,false,true,false,false,false,true,false,false,true),"https://himitsud.com",38.9547,-77.0221,"sushi"),
    v("Nobu Washington DC","Japanese-Peruvian","Georgetown Nobu — celebrity sushi in a beautiful space, great for a political dinner with out-of-town guests",4.6,f(false,false,true,false,true,false,false,false,false,true),"https://noburestaurants.com/washington-dc",38.9047,-77.0595,"sushi"),
  ],

  "Scottsdale": [
    v("Bourbon Steak","Steakhouse","Michael Mina's acclaimed steakhouse, butter-poached cuts",4.8,f(false,false,true,false,true,false,true,true),"https://michaelmina.net/restaurants/bourbon-steak-scottsdale",33.5092,-111.8983),
    v("FnB","Arizona Cuisine","Charleen Badman's James Beard-winning farm-to-table",4.8,f(false,false,false,true,false,false,false,true),"https://fnbrestaurant.com",33.4943,-111.9254),
    v("Kai","Native American","Only Native American-owned AAA Five Diamond restaurant",4.8,f(false,false,false,true,false,false,true,true),"https://wildhorsepass.com/kai",33.3012,-111.9462),
    v("Virtù Honest Craft","Mediterranean","James Beard nominated, intimate Old Town gem",4.7,f(false,false,true,false,false,false,true,true),"https://virtuhonestcraft.com",33.4953,-111.9264),
    v("Elements","Contemporary American","Sanctuary Resort's stunning mountain-view restaurant",4.7,f(false,false,false,true,true,false,true,true),"https://sanctuaryoncamelback.com/dining/elements",33.5292,-111.9703),
    v("Sexy Roman","Italian","W Scottsdale's boldest new Italian — ricotta agnolotti with black truffle, burrata tortellini in short rib ragu, roaming martini cart with nitro-chilled glasses, theatrical and loud",4.7,f(false,true,true,false,true,false,false,false),"https://sexyromanscottsdale.com",33.5002,-111.9264),
    v("CATCH Scottsdale","Seafood & Sushi","Fashion Square arrival of the celebrity seafood destination — madai crudo with pickled peach, Wagyu surf and turf roll, herb-roasted branzino, golden-lit dining room",4.6,f(false,true,true,false,true,false,true,false),"https://catchrestaurants.com/location/scottsdale",33.5002,-111.8993),
    v("Élephante Scottsdale","Coastal Italian","Fashion Square outpost of the iconic Santa Monica rooftop — housemade pastas, viral whipped eggplant, wood-fired pizzas, indoor-outdoor cocktail lounge",4.6,f(false,true,true,false,true,false,false,false),"https://elephanterestaurants.com/scottsdale",33.5002,-111.8993),
    v("Pinyon","Mediterranean","Hi Noon Hospitality's acclaimed new Mediterranean — flavors from Barcelona to Malta, open-flame grilling, house-made pita, stunning two-level views, raw bar happy hour",4.6,f(false,true,true,false,false,false,false,false),"https://pinyonscottsdale.com",33.4953,-111.9254),
    v("Liquor Pig","Cocktail Bar & Restaurant","Old Town's most in-the-know date night spot — golden hour margarita, Spam Folder cocktail served in a Spam can, mafaldine with duck bolognese, bone marrow poutine with foie gras gravy",4.6,f(false,true,true,false,false,false,false,false),"https://liquorpigscottsdale.com",33.4953,-111.9264),
    v("SHIV Supper Club","Supper Club","Scottsdale's first true upscale supper club — charcoal-fired steaks, Apple Pie Mac & Cheese, Bubbles & Bumps (champagne and caviar), transitions to DJ and performers at 10pm",4.6,f(false,true,true,false,true,true,false,false),"https://shivsupper.com",33.4953,-111.9264),
    v("Telefèric Barcelona","Spanish Tapas","Fashion Square's Catalonian sensation — handcrafted tapas, made-to-order paellas, Spanish wine list and sangrias, El Merkat gourmet market concept on-site",4.6,f(false,true,true,false,false,false,false,false),"https://teleferencbarcelona.com/scottsdale",33.5002,-111.8993),
    v("Elvira's","Mexican","Upscale Mexican in DC Ranch — jewel-toned interior with chandeliers, handcrafted moles, sizzling molcajetes, lobster enchiladas, hibiscus Euphoria margarita",4.6,f(false,true,true,false,true,false,false,false),"https://elvirasscottsdale.com",33.6400,-111.8990),
    v("Indibar","Indian","Sleek and sophisticated modern Indian — pani puri with tamarind pearls, tandoor-fired lamb chops, 24K Negroni, refined cocktail program",4.6,f(false,true,true,false,false,false,false,false),"https://indibarscottsdale.com",33.4953,-111.9264),
    v("Maple & Ash Scottsdale","Steakhouse","Chicago hit comes to Scottsdale, wood-fired excellence",4.6,f(false,false,true,false,true,false,false,false),"https://mapleandash.com/scottsdale",33.5002,-111.9264),
    v("Mastro's Steakhouse","Steakhouse","Old Town power dining and live piano entertainment",4.5,f(false,false,true,false,true,true,false,false),"https://mastrosrestaurants.com/restaurant/city-grille-scottsdale",33.4953,-111.9264),
    v("AZ/88","American Bar","Old Town institution, patio and cocktails",4.5,f(false,false,true,false,true,false,false,false),"https://az88.com",33.4943,-111.9264,"bar"),
    // Rooftops
    v("Wolf by Vanderpump","Rooftop Bar & Restaurant","Caesars Republic's 7th-floor glamour rooftop — Lisa Vanderpump's latest, James Beard-nominated chef Jason Franey, 8th-floor Camelback Veranda with fire pit VIP tables, opened Dec 2025",4.7,f(false,true,true,false,true,false,false,false),"https://wolfbyvanderpump.com",33.5002,-111.9264,"rooftop"),
    v("Outrider Rooftop Lounge","Rooftop Bar","Scottsdale's #1 rooftop — 7th floor of Canopy by Hilton, 180-degree Camelback Mountain views, fire pits, poolside cabanas, Southwest Sunburst cocktail, best sunset in Old Town",4.7,f(false,false,true,false,true,false,false,false),"https://canopyscottsdale.com/outrider",33.4943,-111.9264,"rooftop"),
    v("Orange Sky Lounge","Rooftop Restaurant","15th floor of Talking Stick Resort — highest vantage point in Scottsdale, 360-degree Valley views, Wine Spectator Best of Award of Excellence every year since 2016, fine dining with a view",4.6,f(false,false,false,true,true,true,false,false),"https://talkingstickresort.com/dining/orange-sky",33.4523,-111.8887,"rooftop"),
    v("Cielito","Rooftop Bar","Brand new 2026 rooftop atop AC Hotel Old Town — Northwest Mexican cuisine by ex-Amangiri chef Shon Foster, agave-forward cocktail program, Camelback Mountain views, indoor-outdoor",4.6,f(false,true,true,false,false,false,false,false),"https://cielitoaz.com",33.4943,-111.9264,"rooftop"),
    v("Cottontail Lounge at W Scottsdale","Pool Rooftop","The see-and-be-seen WET Deck pool bar — Vegas-style pool parties, portholes in the pool floor, 21+ weekends, celebrity crowd, South Beach energy in the desert",4.5,f(false,false,true,false,true,false,false,false),"https://wscottsdale.com/cottontail",33.5002,-111.9264,"rooftop"),
    v("Thirsty Camel at The Phoenician","Resort Bar","Forbes World's Best Hotel Bar at The Phoenician — sweeping resort and valley views, exceptional bourbon and whiskey selection, signature craft cocktails, refined luxury experience",4.7,f(false,false,false,true,true,false,false,true),"https://thephoenician.com/dining/thirsty-camel",33.5192,-111.9603,"rooftop"),
    v("Riot House","Rooftop Bar","South Beach-inspired rooftop bar — 5,000 sq ft indoor/outdoor, 360-degree views, no cover most nights, bottle service booths, great for groups and bachelorettes",4.5,f(false,false,true,false,true,false,false,false),"https://riothouse.com",33.4958,-111.9254,"rooftop"),
    // Bars
    v("Maya Day + Nightclub","Nightclub","Arizona's #1 pool-party-to-nightclub — daytime DJs, luxury cabanas, celebrity performances, transitions from pool party to high-energy nightclub, Old Town anchor",4.5,f(false,false,true,false,true,true,false,false),"https://mayadaynightclub.com",33.4958,-111.9264,"bar"),
    v("Bottled Blonde","Bar","Late-night Old Town institution open until 2am — wood-fired pizza, craft beer garden, dance floor, perpetually packed",4.3,f(false,false,true,false,true,true,false,false),"https://bottledblonde.com",33.4958,-111.9264,"bar"),
    // Sushi
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
    v("Solbar","California Cuisine","Michelin-starred Solage Auberge resort restaurant — Parker House rolls, truffle fries, petrale sole fish tacos, bonfire seats with mountain views",4.8,f(true,false,true,false,false,false,false,true),"https://aubergeresorts.com/solage/dine",38.5788,-122.5803),
    v("Evangeline","New Orleans Creole","Southern charm in wine country, live music — chef trained at French Laundry and Bouchon, cozy bar you'll want to sit at all night, lovely outdoor patio",4.6,f(false,true,true,false,false,true,false,false),"https://evangelinecalistoga.com",38.5786,-122.5795),
    v("Lovina","Californian","Beloved downtown Calistoga staple — SF and Wine Country pedigree chefs, eclectic seasonal fare, weekend brunch, locals and visitors equally happy here",4.6,f(false,false,true,false,false,false,false,true),"https://lovinacalistoga.com",38.5786,-122.5795),
    v("JoLē","Californian","Calistoga's beloved local fine dining",4.6,f(false,false,false,true,false,false,false,true),"https://jolecalistoga.com",38.5786,-122.5795),
    v("TRUSS Restaurant + Bar","American Mediterranean","Four Seasons' all-day brasserie with sweeping Palisades Mountain views — seasonal dishes, renowned pizzas, Wine Spectator award-winning list, lively bar scene",4.6,f(false,false,true,false,true,false,false,false),"https://trussrestaurant.com",38.5788,-122.5803),
    v("Bricco Osteria","Italian","Downtown Cal-Italian farm-to-table gem — house-made pasta, fresh locally sourced ingredients, seafood linguine is a menu mainstay, warm neighborhood feel",4.5,f(false,false,true,false,false,false,false,false),"https://briccocalistoga.com",38.5786,-122.5795),
    v("Eight North","Wine Bar & Restaurant","Lawer Estates' new tasting room-meets-restaurant, opened late 2025 — wild halibut, Syrah-marinated flank steak, oak-grilled burger, beautiful setting",4.6,f(false,true,true,false,false,false,false,true),"https://eightnorthwine.com",38.5786,-122.5795,"bar"),
    v("Buster's BBQ","Southern BBQ","Best BBQ in Napa Valley — Louisiana-style smoked meats that fill the streets with aroma, live jazz on weekends, locals' treasure since forever",4.5,f(false,false,false,true,false,true,false,false),"https://busterssouthernbbq.com",38.5796,-122.5795),
    v("House of Better","Southwest American","Wilkinson's wellness meets comfort food — New Mexican and Southwest-inspired dishes, green chile roasting, house margaritas and kombucha, fabulous all-day brunch",4.5,f(false,true,true,false,false,false,false,false),"https://houseofbetter.com",38.5786,-122.5795),
    v("Calistoga Inn Restaurant & Brewery","American","Can't-miss riverside institution — huge patio along the Napa River, bonfire, wraparound bar, award-winning microbrewery in the historic water tower, live music May–October",4.5,f(false,false,false,true,false,true,false,false),"https://calistogainn.com",38.5796,-122.5795),
    v("Pacifico","Mexican","Best Mexican in Calistoga — traditional cooking and cocktails, brightly colored space, large bar area and pleasant patio",4.4,f(false,false,true,false,false,false,false,false),"https://pacifico-restaurant.com",38.5786,-122.5795),
    v("Sam's Social Club","Californian","Indian Springs Resort's casual but excellent all-day restaurant — farm-fresh seasonal menu, great bar and lounge with pizzas, tacos and burgers",4.5,f(false,false,true,false,false,false,false,false),"https://indianspringsresort.com/sams-social-club",38.5786,-122.5805),
    v("Sushi Mambo","Japanese","Relaxed Calistoga sushi gem — two pages of sashimi and creative rolls, the Diablo (spicy tuna, hamachi, topped with salmon and albacore) is a must",4.5,f(false,false,false,true,false,false,false,true),"https://sushimambo.com",38.5786,-122.5795,"sushi"),
    v("Sam's General Store","All-Day Café","Coffees and pastries inside an original 1862 cottage built by Calistoga founder Sam Brannan — egg sandwiches, avocado toast, most charming breakfast spot in town",4.5,f(false,false,false,true,false,false,false,false),"https://samsgeneralstore.com",38.5796,-122.5795),
    v("Tank Garage Winery","Wine Bar","Gas station wine bar, cool Calistoga hangout",4.5,f(false,false,true,false,false,false,false,false),"https://tankgaragewinery.com",38.5796,-122.5795,"bar"),
    v("Hydro Bar & Grill","Bar","Calistoga's classic local bar in a historic building — terrific bar food, great burgers and ribs, live music some nights, neighborhood watering hole since forever",4.2,f(false,false,false,true,false,true,false,false),"https://hydrobarandgrill.com",38.5786,-122.5795,"bar"),
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
    v("Evvia Estiatorio","Greek","Sister to SF's Kokkari — rustic Mediterranean fireplace room, mesquite-grilled whole fish and lamb, Maserati-driving tech billionaires by day, couples at night, Michelin-cited Silicon Valley institution since 1995",4.7,f(false,false,false,true,true,false,false,false),"https://evvia.net",37.4446,-122.1613),
    v("Ettan","Indian","Palo Alto's most stunning dining room — cathedral skylight, intricate blue flowers, dishes from across the subcontinent, Kerala fried chicken, black lentil dal, from the Copra team",4.7,f(false,false,true,false,true,false,true,false),"https://ettanrestaurant.com",37.4440,-122.1600),
    v("Ethel's Fancy","Japanese-Hawaiian Fusion","Palo Alto's #1 trending restaurant — inspired by chef's Japanese-American mother's dinner parties in Hawaii, petite sesame pancakes, pea tendril ramp cavatelli, katsu-style swordfish, great for any occasion",4.8,f(false,true,true,false,true,false,true,false),"https://ethelsfancypa.com",37.4440,-122.1610),
    v("Horsefeather","Contemporary American","Town & Country Village upscale standout — seasonal plates, parker house rolls with mascarpone, lamb tartare, beautiful design, Palo Alto's most popular restaurant right now",4.8,f(false,true,true,false,true,false,false,false),"https://horsefeatherpa.com",37.4430,-122.1570),
    v("Sekoya","Seasonal American","Palo Alto's sceney downtown dining room — cute couches, bespoke light fixtures, tech execs and Stanford students pretending they're in Manhattan, parker house rolls, chicken thigh with cara cara orange",4.7,f(false,true,true,false,true,false,false,false),"https://sekoyarestaurant.com",37.4440,-122.1600),
    v("Sun of Wolf","Mexican","Modern high-ceilinged Mexican — happy hour tuna tostadas and mezcal flights on the patio, coworkers in vests, fancy Mexican with delicate radish garnishes and a full bar, lively every night",4.6,f(false,true,true,false,true,false,false,false),"https://sunofwolf.com",37.4440,-122.1600),
    v("RH Rooftop Restaurant","American","Third-floor skylit garden at RH Palo Alto — heritage olive trees, Biancone limestone fountain, chandeliers, exceptional Champagnes and wines, enduring classics menu, most beautiful dining room in the Bay Area",4.6,f(false,false,true,false,true,false,false,true),"https://rh.com/us/en/paloalto/restaurant",37.4430,-122.1670,"rooftop"),
    v("President's Terrace","Rooftop Bar","Palo Alto's only rooftop bar atop Graduate by Hilton — Stanford campus and Santa Cruz Mountain views, Bad Birdy cocktails, West Coast oysters, fire pit lounges, live DJ on weekends",4.3,f(false,false,true,false,true,false,false,false),"https://presidentsterrace.com",37.4440,-122.1600,"rooftop"),
    v("Zola","French","Downtown Palo Alto French, best in class, superb wine list",4.6,f(false,false,true,false,false,false,true,true),"https://zolapaloalto.com",37.4440,-122.1600),
    v("Tamarine","Vietnamese","Palo Alto's celebrated Vietnamese — blue crab nori tacos, Hoisin lamb chops, crab and glass noodles, art gallery displaying emerging Vietnamese artists",4.6,f(false,false,false,true,false,false,false,true),"https://tamarinerestaurant.com",37.4440,-122.1600),
    v("Bird Dog","Japanese-American","Michelin Bib Gourmand, creative and inventive Palo Alto favorite",4.6,f(false,false,true,false,false,false,true,false),"https://birddogpa.com",37.4440,-122.1600),
    v("Telefèric Barcelona","Spanish Tapas","Catalonian tapas and made-to-order paella in the heart of Palo Alto, El Merkat market concept on-site",4.5,f(false,true,true,false,false,false,false,false),"https://teleferencbarcelona.com/palo-alto",37.4430,-122.1670),
    v("Wildseed","Plant-Based","Michelin-cited plant-forward fine dining at Stanford Shopping Center — beautiful space, exceptional produce-driven menu",4.6,f(false,false,true,false,false,false,true,false),"https://wildseedrestaurant.com",37.4430,-122.1670),
    v("Zareen's","Pakistani-Indian","Michelin Guide casual gem — samosas, kebabs, Punjabi chicken burger, always packed, best value in Palo Alto",4.6,f(false,false,true,false,false,false,false,false),"https://zareensrestaurant.com",37.4375,-122.1632),
    v("Pizzeria Delfina","Italian","Palo Alto outpost of SF's beloved pizzeria — wood-fired pies, great pastas",4.5,f(false,false,false,true,false,false,false,false),"https://pizzeriadelfina.com/palo-alto",37.4440,-122.1610),
    v("Meyhouse","All-Day Café & Bar","Trendy downtown Palo Alto all-day spot — beautiful design, great cocktails, brunch to late night, beloved by locals",4.6,f(false,true,true,false,true,false,false,false),"https://meyhousepa.com",37.4440,-122.1600),
    v("La Bodeguita del Medio","Cuban","Cuban-inspired Palo Alto institution — heated garden patio, specialty cocktails inspired by the Havana original, robust meats and fresh seafood, best ambience award winner",4.5,f(false,false,true,false,false,true,false,false),"https://labodeguita.com",37.4375,-122.1632,"bar"),
    v("The Rose & Crown","British Pub","Palo Alto's beloved British pub since forever — quiz nights, darts, solid pints",4.4,f(false,false,false,true,false,true,false,false),"https://roseandcrownpa.com",37.4440,-122.1610,"bar"),
    v("Nobu Palo Alto","Japanese-Peruvian","Nobu's Peninsula outpost — tech celebrity sushi, always a scene",4.6,f(false,false,true,false,true,false,false,false,false,true),"https://noburestaurants.com/palo-alto",37.4480,-122.1601,"sushi"),
    v("Sushi Sus","Japanese Omakase","Intimate omakase counter — best sushi in Palo Alto, exceptional fish sourcing",4.6,f(false,false,false,false,false,false,true,true,false,true),"https://sushisus.com",37.4440,-122.1610,"sushi"),
    v("Fuki Sushi","Japanese","Palo Alto Japanese institution since 1972 — tech industry power lunch staple",4.4,f(false,false,false,true,true,false,false,false,false,true),"https://fukisushi.com",37.4480,-122.1591,"sushi"),
  ],

  "Santa Monica": [
    v("Melisse","French Contemporary","Two Michelin stars, Josiah Citrin's LA finest French",4.9,f(true,false,false,true,true,false,true,true),"https://melisse.com",34.0195,-118.4912),
    v("Dialogue","Contemporary American","Dave Beran's Michelin-starred counter, outstanding",4.8,f(true,false,true,false,false,false,true,true),"https://dialoguedining.com",34.0195,-118.4912),
    v("Seline","Contemporary American","Michelin Guide 2025, Dave Beran's cerebral seasonal menu — geoduck crackers on metallic orbs, 15-18 courses inspired by SoCal, Main Street stunner",4.8,f(true,true,true,false,false,false,true,true),"https://selinela.com",34.0133,-118.4812),
    v("Fia Steak","Steakhouse","Chapel-meets-steakhouse on Santa Monica Blvd — stained glass saints, Scorsese portraits, Creekstone Farms prime beef presented raw tableside, outrageously fun",4.7,f(false,true,true,false,true,false,false,false),"https://fiasteak.com",34.0185,-118.4892),
    v("Rustic Canyon","California","Jeremy Fox's acclaimed farm-to-table, Pico Blvd gem",4.7,f(false,false,false,true,false,false,false,true),"https://rusticcanyonwinebar.com",34.0195,-118.4892),
    v("Pasjoli","French","Dave Beran's acclaimed French bistro — cordon bleu chicken wings, bone marrow burger, pressed duck for two at $350, Santa Monica's most romantic room",4.7,f(false,false,false,false,false,false,true,true),"https://pasjoli.com",34.0175,-118.4922),
    v("Giorgio Baldi","Italian","Santa Monica's beloved 36-year Italian institution, celebrity magnet",4.7,f(false,false,false,true,true,false,true,true),"https://giorgiobaldi.com",34.0175,-118.5042),
    v("Cassia","Southeast Asian","Chef Bryant Ng's acclaimed Vietnamese-French",4.6,f(false,false,true,false,true,false,true,false),"https://cassiarestaurant.com",34.0215,-118.4872),
    v("Hillstone","American","Part of the legendary Hillstone group (formerly Houston's) — LA power dining institution, kale salad, French dip and ribs that haunt David Chang, Taylor Swift sighting spot",4.6,f(false,false,false,true,true,false,false,false),"https://hillstonerestaurant.com/locations/santamonica",34.0178,-118.4914),
    v("Crudo e Nudo","Raw Seafood Bar","Sustainable raw seafood on Main St, daily crudos with herbs and house sauces, raw bar, natural wine, one of SM's most beloved new spots",4.6,f(false,true,true,false,false,false,true,false),"https://crudoenudo.com",34.0133,-118.4812),
    v("Xuntos","Spanish Tapas","The closest thing to Madrid in LA — chef-owner Sandra Cordero slices jamón ibérico de bellota at the bar, outstanding pintxos, all-natural wine list",4.7,f(false,true,true,false,false,false,true,false),"https://xuntosrestaurant.com",34.0185,-118.4912),
    v("Bay Cities Italian Deli","Italian Deli","Best Italian deli in LA, legendary Godmother sandwich",4.6,f(false,false,false,true,true,false,true,false),"https://baycitiesitaliandeli.com",34.0175,-118.4832),
    v("Huckleberry Café","American","Santa Monica's best bakery and all-day café",4.6,f(false,false,false,true,false,false,false,false),"https://huckleberrycafe.com",34.0175,-118.4832),
    v("Openaire","Mediterranean","Kinney Hotel's stunning glass-retractable-roof restaurant",4.6,f(false,false,true,false,true,false,false,false),"https://openairela.com",34.0195,-118.4912),
    // Bars
    v("Élephante","Rooftop Italian Bar","SM's most iconic rooftop — coastal Italian on top of the Laemmle theater, Pacific Ocean sunset views, John Legend and Chrissy Teigen regular, book the Sunset Room weeks ahead",4.7,f(false,false,true,false,true,false,true,false),"https://elephanterestaurants.com",34.0178,-118.4914,"rooftop"),
    v("The Penthouse at Huntley Hotel","Rooftop Bar & Restaurant","18th-floor rooftop atop the Huntley — panoramic Pacific and city views, glass elevator entrance, beach cabanas, celebrity crowd, best sunset views in Santa Monica, coastal California menu",4.6,f(false,false,true,false,true,false,false,false),"https://penthouserestaurant.com",34.0168,-118.4908,"rooftop"),
    v("AJA Vineyards Wine Bar","Wine Tasting Room","Santa Monica's first and only winery tasting room — family-owned Malibu Coast estate wines, intimate and chic, 2 blocks from the pier, flights and bottles, hidden gem locals keep secret",4.6,f(false,false,true,false,false,false,false,true),"https://ajavineyards.com",34.0168,-118.4914,"bar"),
    v("Father's Office","Gastropub","Best craft beer bar in LA with legendary blue cheese burger",4.6,f(false,false,false,true,true,false,false,false),"https://fathersoffice.com",34.0175,-118.4832,"bar"),
    v("Chez Jay","American Dive","Beloved dive bar since 1959 — Sinatra and the Rat Pack at Table 10, Michelle Pfeiffer's first date, Channing Tatum still comes in, peanut shells on the floor, LA landmark",4.5,f(false,false,false,true,true,false,false,false),"https://chezjays.com",34.0168,-118.4991,"bar"),
    v("The Galley","Nautical Dive Bar","Santa Monica's oldest restaurant since 1934 — bamboo booths, fishing nets, Christmas lights year-round, celebrity haunt where A-listers are treated like everyone else, steak and seafood, South Seas Bar",4.5,f(false,false,false,true,true,false,false,false),"https://thegalleyrestaurant.net",34.0133,-118.4812,"bar"),
    v("Ye Olde King's Head","British Pub","Santa Monica institution since 1974 — Led Zeppelin used it as a base, Oasis played the front bar, Rod Stewart, Anthony Hopkins, Noel Gallagher and Cary Grant all regulars, fish & chips, darts, karaoke Sundays",4.4,f(false,false,false,true,true,true,false,false),"https://yeoldekingshead.com",34.0178,-118.4914,"bar"),
    // Sushi
    v("Nobu Malibu","Japanese-Peruvian","Oceanfront Nobu on PCH, celebrity central, stunning setting",4.6,f(false,false,true,false,true,false,false,false,false,true),"https://noburestaurants.com/malibu",34.0195,-118.6789,"sushi"),
    v("Sugarfish Santa Monica","Japanese Omakase","LA's best-value omakase, multiple locations, always outstanding",4.5,f(false,false,false,true,false,false,false,false,false,true),"https://sugarfishsushi.com",34.0175,-118.4922,"sushi"),
    v("Sushi Zo Santa Monica","Japanese Omakase","Pure omakase experience, beautifully fresh fish",4.7,f(false,false,false,true,false,false,true,true,false,true),"https://sushizo.us",34.0195,-118.4912,"sushi"),
  ],


  "Lyons NYC": [
    // Restaurants
    v("Bar Chimera","Bar","Buzzy new bar, 5-star rated by early visitors",4.5,f(false,true,true,false,false,false,false,false),"https://maps.app.goo.gl/ZMNdeKC1LtXdkCib8",40.7260,-73.9990,"bar"),
    v("The Musket Room","New American","Acclaimed New American, intimate and refined",4.5,f(false,false,true,false,false,false,true,true),"https://www.themusketroom.com",40.7225,-74.0019),
    v("GAIA","Restaurant","Upscale restaurant, $100+",4.0,f(false,false,true,false,false,false,false,false),"https://gaianyc.com",40.7580,-73.9855),
    v("Le Charlot","French","Classic French on the UES, neighborhood institution",4.0,f(false,false,false,true,true,false,false,false),"https://lecharlotnyc.com",40.7701,-73.9619),
    v("Cafe Luxembourg","French","UWS French brasserie institution since 1983, always packed",4.4,f(false,false,false,true,true,false,false,false),"https://cafeluxembourg.com",40.7784,-73.9826),
    v("Maxime's","Social Club","Exclusive social club, very high ratings from early members",4.8,f(false,true,true,false,true,false,true,false),"https://maximesnyc.com",40.7614,-73.9726,"private club"),
    v("Coco's at Colette","Restaurant","Amazing views, $100+",4.6,f(false,true,true,false,true,false,false,false),"https://cocosatcolette.com",40.7580,-73.9700),
    v("Ambassadors Clubhouse New York","Indian","Michelin Indian, exclusive clubhouse dining",4.6,f(true,false,true,false,true,false,true,false),"https://ambassadorsnyclub.com",40.7570,-73.9800),
    v("Massara On Park","Italian","Good Italian on Park Avenue",4.3,f(false,false,true,false,false,false,false,false),"https://massaranyc.com",40.7397,-73.9897),
    v("Rezdôra","Italian","Amazing Emilian pasta, one of NYC's best Italian restaurants",4.2,f(false,false,true,false,false,false,true,false),"https://rezdora.com",40.7397,-73.9883),
    v("Sushidokoro Mekumi NY","Sushi","Amazing sushi, intimate omakase counter",4.4,f(false,false,false,false,false,false,true,true),"https://mekuminy.com",40.7580,-73.9855,"sushi"),
    v("YUGIN","Japanese","Masa-level Japanese, extraordinary",4.8,f(false,true,false,false,false,false,true,true),"https://yuginnyc.com",40.7685,-73.9822),
    v("Moody Tongue Sushi","Sushi","Good beer and sushi pairing concept",4.3,f(false,true,true,false,false,false,true,false),"https://moodytongue.com",40.7260,-73.9870,"sushi"),
    v("Babbo","Italian","Mario Batali's Village flagship, pasta institution",4.3,f(false,false,false,true,true,false,false,false),"https://babbonyc.com",40.7329,-74.0026),
    v("Zaab Zaab","Thai","Outstanding Thai in the East Village",4.3,f(false,false,true,false,false,false,false,false),"https://zaabzaabnyc.com",40.7260,-73.9832),
    v("Cho Dang Gol","Korean","Koreatown tofu house institution, beloved",4.6,f(false,false,false,true,false,false,false,false),"https://chodanggolnyc.com",40.7488,-73.9893),
    v("The Golden Swan","French","Upscale French, $100+",4.5,f(false,false,true,false,true,false,false,false),"https://goldenswan.nyc",40.7350,-74.0051),
    v("Gjelina","Californian","NYC outpost of beloved Venice CA institution",4.2,f(false,false,true,false,true,false,false,false),"https://gjelina.com/nyc",40.7260,-73.9993),
    v("I Cavallini","Italian","Hard to get reservation, serious Italian",4.6,f(false,false,true,false,false,false,true,false),"https://icavallini.com",40.7329,-74.0051),
    v("The Eighty Six","Restaurant","Upscale dining, $100+",4.6,f(false,false,true,false,false,false,false,false),"https://theeightysix.com",40.7260,-73.9890),
    v("Nōksu","Korean","Hidden omakase inside a train station — extraordinary find",4.6,f(false,true,true,false,false,false,true,true),"https://noksu.nyc",40.7510,-73.9768),
    v("ATOMIX","Korean Contemporary","Best Korean and top restaurant in NYC — two Michelin stars",4.7,f(true,false,true,false,false,false,true,true),"https://atomixnyc.com",40.7448,-73.9870),
    v("Fasano Restaurant New York","Italian","Brazilian luxury brand's NYC outpost, stunning room",4.6,f(false,false,true,false,true,false,true,true),"https://fasano.com.br/new-york",40.7614,-73.9726),
    v("Centurion New York","Lounge Bar","Amex Centurion members lounge, exclusive",4.5,f(false,false,false,false,true,false,true,false),"https://thecenturionlounge.com/new-york",40.7580,-73.9787,"bar"),
    v("ITO","Japanese","Gotta go — extraordinary Japanese omakase",4.5,f(false,true,false,false,false,false,true,true),"https://itonyc.com",40.7350,-73.9905),
    v("Osteria Delbianco","Italian","Good Italian, neighborhood gem",4.7,f(false,false,true,false,false,false,false,false),"https://osteriadelbianco.com",40.7260,-73.9890),
    v("Rolo's","Grill","Neighborhood grill, beloved local",4.5,f(false,false,true,false,false,false,false,false),"https://rolosnyc.com",40.7260,-73.9890),
    v("Bar Miller","Japanese","Great omakase — Rosella connection",4.9,f(false,true,true,false,false,false,true,true),"https://barmiller.nyc",40.7260,-73.9890,"bar"),
    v("& Son Steakeasy","Steakhouse","Great vibe steakhouse",4.2,f(false,false,true,false,true,false,false,false),"https://andsonnyc.com",40.7260,-73.9890),
    v("Huso","Caviar Tasting Menu","Great omakase — Top Chef champ Buddha Lo's caviar-centric tasting menu",4.7,f(false,true,true,false,true,false,true,true),"https://husonyc.com",40.7199,-74.0090),
    v("Wayan","Indonesian","Upscale Indonesian, $100+",4.3,f(false,false,true,false,true,false,false,false),"https://wayannyc.com",40.7260,-73.9890),
    v("Do Not Disturb","Seafood","Good bar, great seafood",4.6,f(false,false,true,false,false,false,false,false),"https://donotdisturbnyc.com",40.7350,-74.0026),
    v("Thai Diner","Thai","Beloved Thai diner, NoHo favorite",4.4,f(false,false,true,false,false,false,false,false),"https://thaidiner.com",40.7260,-73.9993),
    v("Ha's Snack Bar","Restaurant","Intimate snack bar, $50-100",4.3,f(false,false,true,false,false,false,false,true),"https://hassnackbar.com",40.7260,-73.9890),
    v("Kabawa","Caribbean","Need to go — Caribbean spot",4.6,f(false,true,true,false,false,false,false,false),"https://kabawanyc.com",40.7260,-73.9890),
    v("King","Italian","Great food — get the pasta and salad",4.3,f(false,false,true,false,false,false,false,false),"https://kingrestnyc.com",40.7304,-74.0026),
    v("Una Pizza Napoletana","Pizza","Voted best pizza — gotta try",4.3,f(false,false,true,false,false,false,false,false),"https://unapizza.com",40.7260,-73.9870),
    v("Theodora","Mediterranean Seafood","Best Mediterranean — great smoke",4.6,f(false,true,true,false,false,false,true,true),"https://theodorabk.com",40.6881,-73.9750),
    v("Kiko","Asian","Upscale Asian, $100+",4.7,f(false,true,true,false,false,false,false,false),"https://kikonyc.com",40.7260,-73.9890),
    v("Maki Kosaka","Sushi","Incredible sushi — must try hand rolls",4.6,f(false,false,true,false,false,false,true,false),"https://makikosaka.com",40.7260,-73.9870,"sushi"),
    v("Palma","Italian","Nice quiet Italian spot",4.6,f(false,false,false,true,false,false,false,true),"https://palmanyc.com",40.7329,-74.0026),
    v("Le Chêne","French","New date spot, $100+",4.4,f(false,true,true,false,false,false,false,true),"https://lechene.nyc",40.7260,-73.9890),
    v("KOMA Sushi","Sushi","Every Monday: omakase tuna tasting",4.6,f(false,true,true,false,false,false,true,false),"https://komasushi.com",40.7260,-73.9870,"sushi"),
    v("Cucina Alba","Italian","Good Italian, $100+",4.7,f(false,false,true,false,false,false,false,false),"https://cucinaalbanyc.com",40.7260,-73.9890),
    v("KOSAKA","Sushi","Best Michelin sushi; also good matcha",4.5,f(true,false,false,false,false,false,true,true),"https://kosakanyc.com",40.7260,-73.9870,"sushi"),
    v("Fradei Bistro","French","Great wine bar, $100+",4.7,f(false,false,true,false,false,false,false,true),"https://fradeibistro.com",40.7260,-73.9890),
    v("noreetuh","Hawaiian","Good wine list, Hawaiian fine dining",4.6,f(false,false,true,false,false,false,false,false),"https://noreetuh.com",40.7260,-73.9870),
    v("Sixty Three Clinton","New American","Great wine spot, LES",4.6,f(false,false,true,false,false,false,false,true),"https://sixtythreeclinton.com",40.7198,-73.9836),
    v("Scarpetta","Italian","Good food and live music",4.6,f(false,false,true,false,true,true,false,false),"https://scottconant.com/restaurants/scarpetta-new-york",40.7408,-74.0051),
    v("Roscioli NYC","Roman","Really good dinner, Roman trattoria",4.4,f(false,false,true,false,false,false,false,false),"https://roscioli.nyc",40.7260,-73.9870),
    v("Crevette","Seafood","Great meal, upscale French seafood",4.3,f(false,false,true,false,false,false,false,false),"https://crevettenyc.com",40.7260,-73.9890),
    v("La Tête d'Or by Daniel","French Steakhouse","Daniel Boulud's first steakhouse, One Madison, instant power scene",4.6,f(false,true,true,false,true,false,true,false),"https://latetedorbydaniel.com",40.7416,-73.9872),
    v("Four Twenty Five","New American","Jean-Georges restaurant — get the pasta",4.5,f(false,false,true,false,true,false,true,false),"https://fourtwentyfivenyc.com",40.7614,-73.9726),
    v("Cosme","Mexican","Best Mexican in NYC, Enrique Olvera",4.3,f(false,false,true,false,true,false,true,false),"https://cosmenyc.com",40.7397,-73.9893),
    v("Saga","Fine Dining","Upscale tasting menu, $100+",4.4,f(false,false,true,false,false,false,true,true),"https://saganyc.com",40.7030,-74.0128),
    v("The Corner Store","American","SoHo sensation, live-fire Mediterranean, painful reservation",4.6,f(false,true,true,false,true,false,true,false),"https://thecornerstorenyc.com",40.7229,-73.9993),
    v("Kinjo","Japanese","$100+ extraordinary Japanese",4.9,f(false,true,false,false,false,false,true,true),"https://kinjonyc.com",40.7350,-73.9905),
    v("Ikigai","Japanese","Great sushi, $100+",4.8,f(false,true,true,false,false,false,true,true),"https://ikigainyc.com",40.7260,-73.9890,"sushi"),
    v("Tanoshi Sushi Sake Bar","Sushi","Sit with Timoki — UES omakase gem",4.7,f(false,false,false,true,false,false,true,true),"https://tanoshisushisakebar.com",40.7741,-73.9595,"sushi"),
    v("Ume","Japanese","Authentic Japanese, $100+",4.3,f(false,false,true,false,false,false,false,false),"https://umenyc.com",40.7260,-73.9890),
    v("Carne Mare","Chophouse","Upscale chophouse, FiDi",4.5,f(false,false,true,false,true,false,false,false),"https://carnemarenyc.com",40.7030,-74.0128),
    v("Frevo","Fine Dining","Michelin starred, $100+",4.8,f(true,false,true,false,false,false,true,true),"https://frevonyc.com",40.7260,-73.9890),
    v("Sushi Oku","Sushi","Great sushi, $100+",4.8,f(false,true,true,false,false,false,true,true),"https://sushioku.com",40.7260,-73.9870,"sushi"),
    v("noda","Sushi","Great sushi and cocktails",4.7,f(false,true,true,false,false,false,true,false),"https://nodanyc.com",40.7260,-73.9870,"sushi"),
    v("icca","Japanese","Good sushi, authentic Japanese",4.5,f(false,false,true,false,false,false,true,true),"https://iccanyc.com",40.7260,-73.9870,"sushi"),
    v("YOSHINO • NEW YORK","Sushi","Best sushi, $100+",4.5,f(false,false,false,false,false,false,true,true),"https://yoshinonyc.com",40.7260,-73.9870,"sushi"),
    v("The Modern","American","Low key Michelin restaurant inside MoMA",4.6,f(true,false,false,true,true,false,true,true),"https://themodernnyc.com",40.7614,-73.9780),
    v("I Sodi","Tuscan","Best Italian — intimate West Village Tuscan",4.2,f(false,false,false,true,true,false,true,false),"https://isodinyc.com",40.7329,-74.0026),
    v("Karasu","Japanese","Japanese in Fort Greene, intimate bar",4.5,f(false,false,true,false,false,false,false,false),"https://karasuny.com",40.7260,-73.9890),
    v("Evelina","Italian","Excellent Italian, vibrant",4.7,f(false,false,true,false,false,false,false,false),"https://evelinanyc.com",40.7260,-73.9993),
    v("divya's kitchen","Vegetarian","Kristina's pick — ayurvedic vegetarian",4.6,f(false,false,true,false,false,false,false,false),"https://divyaskitchen.com",40.7326,-73.9905),
    v("Shukette","Middle Eastern","Outstanding Middle Eastern, hugely popular",4.8,f(false,false,true,false,false,false,true,false),"https://shukette.com",40.7448,-74.0003),
    v("odo","Japanese","Amazing sushi in the lounge, $100+",4.5,f(true,false,true,false,false,false,true,true),"https://odonyc.com",40.7397,-73.9883,"sushi"),
    v("Barbuto","Italian","West Village Italian institution, Jonathan Waxman",4.3,f(false,false,false,true,true,false,false,false),"https://barbutonyc.com",40.7354,-74.0065),
    v("Lucien","French","Fun hang, classic East Village French bistro",4.1,f(false,false,false,true,true,false,false,false),"https://luciennyc.com",40.7260,-73.9870),
    v("Marea","Italian Seafood","Upscale Italian seafood, Columbus Circle",4.5,f(false,false,false,true,true,false,false,false),"https://marea-nyc.com",40.7685,-73.9822),
    v("Yamada","Japanese","Amazing — intimate Japanese, $100+",4.9,f(false,true,false,false,false,false,true,true),"https://yamadanyc.com",40.7260,-73.9890),
    v("Chez Ma Tante","Bistro","Best pancakes — beloved Brooklyn import now in Manhattan",4.4,f(false,false,true,false,false,false,false,false),"https://chezmatan.com",40.7180,-73.9572),
    v("Le Veau d'Or","French","Historic 1937 French bistro revived by Frenchette team, impossible to book",4.5,f(false,true,true,false,true,false,true,true),"https://leveaudor.com",40.7641,-73.9635),
    v("Bridges","French","Great spot, upscale French",4.5,f(false,false,true,false,false,false,false,false),"https://bridgesnyc.com",40.7030,-74.0128),
    v("Kappo Sono","Japanese","Amazing restaurant — intimate kappo counter",4.9,f(true,false,false,false,false,false,true,true),"https://kapposono.com",40.7260,-73.9890,"sushi"),
    v("One White Street","New American","Tribeca tasting menu, farm-to-table",4.4,f(false,false,true,false,false,false,true,false),"https://onewhitestreet.com",40.7199,-74.0090),
    v("Wayan","Indonesian","Upscale Indonesian-French, Cédric Vongerichten",4.3,f(false,false,true,false,true,false,true,false),"https://wayannyc.com",40.7225,-73.9993),
    v("Eyval","Persian","Top Persian restaurant in NYC",4.6,f(false,false,true,false,false,false,true,false),"https://eyvalnyc.com",40.7260,-73.9890),
    v("Aska","Scandinavian","Two Michelin stars, extraordinary Nordic tasting menu",4.6,f(true,false,true,false,false,false,true,true),"https://askanyc.com",40.7180,-73.9572),
    v("The Four Horsemen","Wine Bar","Great food — James Murphy's Michelin-starred natural wine bar",4.6,f(true,false,true,false,true,false,false,true),"https://fourhorsemenbk.com",40.7158,-73.9500),
    v("Oiji Mi","Korean","Amazing Korean, $100+",4.6,f(false,true,true,false,false,false,true,false),"https://oijimi.com",40.7448,-73.9870),
    v("Café Carmellini","Fine Dining","Best NYC restaurant — Andrew Carmellini's masterpiece",4.5,f(false,true,true,false,true,false,true,false),"https://cafecarmellini.com",40.7614,-73.9756),
    v("Maison Sun","Fine Dining","$100+, intimate fine dining",4.6,f(false,false,true,false,false,false,true,true),"https://maisonsun.com",40.7260,-73.9890),
    v("Sushi by Scratch Restaurants: New York","Sushi","Innovative omakase concept from the LA hit",4.5,f(true,true,true,false,false,false,true,true),"https://sushybyscratch.com",40.7350,-73.9905,"sushi"),
    v("Jua","Korean","$100+ outstanding Korean tasting menu",4.7,f(false,true,true,false,false,false,true,true),"https://juanyc.com",40.7448,-73.9870),
    v("Tatsuda Omakase","Sushi","Outstanding omakase, $100+",4.8,f(false,true,false,false,false,false,true,true),"https://tatsudomakase.com",40.7260,-73.9870,"sushi"),
    v("Jean's","Restaurant","Good brunch, $100+",4.2,f(false,false,true,false,false,false,false,false),"https://jeansnyc.com",40.7260,-73.9890),
    v("Essential by Christophe","French","French fine dining, $100+",4.8,f(false,false,true,false,false,false,true,true),"https://essentialnyc.com",40.7260,-73.9890),
    v("Claud","Restaurant","Great wine bar, $100+",4.2,f(false,false,true,false,false,false,false,true),"https://claudnyc.com",40.7260,-73.9870),
    v("Quique Crudo","Mexican","Incredible Mexican, $100+",4.6,f(false,true,true,false,false,false,true,false),"https://quiquecrudo.com",40.7260,-73.9870),
    v("Wayla","Thai","Upscale Thai, $50-100",4.5,f(false,false,true,false,false,false,false,false),"https://waylanyc.com",40.7225,-73.9993),
    v("Vic's","Italian","Beloved NoHo Italian",4.6,f(false,false,true,false,false,false,false,false),"https://vicsnyc.com",40.7260,-73.9993),
    v("Hearth","Northern Italian","Great dinner spot, East Village Italian",4.5,f(false,false,false,true,false,false,false,true),"https://restauranthearth.com",40.7260,-73.9832),
    v("Jajaja Mexicana","Vegan Mexican","Plant-based Mexican, excellent",4.6,f(false,false,true,false,false,false,false,false),"https://jajajamexicana.com",40.7260,-73.9870),
    v("Indochine","Vietnamese","Iconic East Village Vietnamese, the beautiful people",4.3,f(false,false,false,true,true,false,false,false),"https://indochinenyc.com",40.7270,-73.9905),
    v("Clemente Bar","Cocktail Bar","Eleven Madison Park's great bar",4.7,f(false,false,true,false,true,false,false,false),"https://clementebar.com",40.7416,-73.9872,"bar"),
    v("The Portrait Bar","Cocktail Bar","Very good cocktails and great vibe",4.5,f(false,false,true,false,false,false,false,false),"https://theportraitbar.com",40.7260,-73.9890,"bar"),
    v("Sailor","Restaurant","Great spot, $50-100",4.5,f(false,false,true,false,false,false,false,false),"https://sailornyc.com",40.7260,-73.9890),
    v("Kisa","Korean","$40-50 Korean, neighborhood gem",4.5,f(false,false,true,false,false,false,false,false),"https://kisanyc.com",40.7260,-73.9870),
    v("Jōji","Sushi","Upscale Japanese omakase, $100+",4.5,f(true,false,true,false,false,false,true,true),"https://jojinyc.com",40.7569,-73.9726,"sushi"),
    v("Moono","Korean","$100+ Korean, Momofuku alumni",4.4,f(false,false,true,false,false,false,false,false),"https://moononyc.com",40.7448,-73.9870),
    v("Semma","South Indian","Michelin Indian — outstanding South Indian",4.2,f(true,false,true,false,false,false,true,false),"https://semmanyc.com",40.7260,-73.9993),
    v("Zou Zou's","Mediterranean","Mediterranean at Hudson Yards",4.4,f(false,false,true,false,false,false,false,false),"https://zouzousnyc.com",40.7533,-74.0024),
    v("Duomo51","Italian","$50-100, solid Italian",4.6,f(false,false,true,false,false,false,false,false),"https://duomo51.com",40.7260,-73.9890),
    v("Carne Mare","Chophouse","Upscale FiDi chophouse",4.5,f(false,false,true,false,true,false,false,false),"https://carnemarenyc.com",40.7030,-74.0128),
    v("Sendo","Sushi","Excellent sushi counter",4.6,f(false,false,true,false,false,false,true,false),"https://sendonyc.com",40.7260,-73.9870,"sushi"),
    v("Tokyo Record Bar","Japanese","Intimate Japanese dining with vinyl records",4.1,f(false,false,true,false,true,false,false,false),"https://tokyorecordbar.com",40.7260,-73.9890),
    v("Shota Omakase","Japanese","$100+ omakase",4.6,f(false,false,true,false,false,false,true,true),"https://shotaomakase.com",40.7260,-73.9870,"sushi"),
    v("Bungalow","Indian","Upscale Indian, $100+",4.4,f(false,false,true,false,false,false,false,false),"https://bungalownyc.com",40.7260,-73.9870),
    v("Eyval","Persian","Top Persian restaurant in NYC",4.6,f(false,false,true,false,false,false,true,false),"https://eyvalnyc.com",40.7260,-73.9870),
    v("noda","Sushi","Great sushi and cocktails",4.7,f(false,true,true,false,false,false,true,false),"https://nodanyc.com",40.7260,-73.9870,"sushi"),
    v("House of Joy","Dim Sum","Good dim sum, Chinatown",4.1,f(false,false,true,false,false,false,false,false),"https://houseofjoynyc.com",40.7163,-73.9971),
    v("Francie","Brasserie","Williamsburg brasserie, excellent food",4.4,f(false,false,true,false,false,false,false,false),"https://francienyc.com",40.7158,-73.9572),
    v("Tsumo UWS","Sushi","Amazing tuna omakase, $50-60",4.8,f(false,true,true,false,false,false,true,true),"https://tsumonyc.com",40.7784,-73.9826,"sushi"),
    v("Sanyuu West","Sushi","Great $78 omakase",4.7,f(false,true,true,false,false,false,true,false),"https://sanyuuwest.com",40.7260,-73.9870,"sushi"),
    v("Upon The Palace","Asian","$$ Asian restaurant",4.5,f(false,false,true,false,false,false,false,false),"https://uponthepalace.com",40.7163,-73.9971),
    v("Ol'Days Farm to Table Tribeca","Brunch","Farm to table Tribeca brunch spot",4.3,f(false,false,true,false,false,false,false,false),"https://oldaysfarmtotable.com",40.7199,-74.0090),
    v("La Pecora Bianca Bryant Park","Italian","$$$, charming Italian near Bryant Park",4.8,f(false,false,true,false,false,false,false,false),"https://lapecorabianca.com",40.7540,-73.9839),
    v("Jua","Korean","Outstanding Korean tasting menu",4.7,f(false,true,true,false,false,false,true,true),"https://juanyc.com",40.7448,-73.9870),
    v("Nakaji","Japanese Omakase","Hidden Chinatown alley omakase, extraordinary and intimate",4.4,f(true,false,false,false,false,false,true,true),"https://nakajinyc.com",40.7163,-73.9971,"sushi"),
    v("Hasaki","Japanese","Longtime East Village Japanese institution",4.4,f(false,false,false,true,false,false,false,false),"https://hasakinyc.com",40.7260,-73.9870),
    v("Kono","Yakitori","Omakase yakitori, Michelin-starred",4.6,f(true,false,true,false,false,false,true,true),"https://kononyc.com",40.7260,-73.9870),
    v("Café Carlyle","Café/Cabaret","Classic UES hotel café and legendary cabaret venue",4.5,f(false,false,false,true,true,true,false,false),"https://thecarlyle.com/dine/cafe-carlyle",40.7741,-73.9635),
    v("Bemelmans Bar","Bar","The most elegant hotel bar in NYC, Carlyle Hotel",4.3,f(false,false,false,true,true,false,false,true),"https://thecarlyle.com/dine/bemelmans-bar",40.7741,-73.9635,"bar"),
    v("Russ & Daughters Cafe","Jewish Deli","Lower East Side institution, best smoked fish in America",4.6,f(false,false,false,true,true,false,false,false),"https://russanddaughterscafe.com",40.7226,-73.9873),
    v("The Champagne & Caviar Bar at RH Guesthouse","Bar","Underground champagne bar, extraordinary and exclusive",4.8,f(false,true,true,false,true,false,true,true),"https://rh.com/new-york/guesthouse",40.7260,-74.0020,"bar"),
    v("HOUSE Brooklyn","Japanese-French","Japanese French omakase",4.8,f(false,true,true,false,false,false,true,true),"https://housebk.com",40.7158,-73.9572),
    v("Colonia Verde","Restaurant","Fort Greene neighborhood favorite",4.6,f(false,false,true,false,false,false,false,false),"https://coloniaverderestaurant.com",40.6881,-73.9750),
    v("Laser Wolf Brooklyn","Israeli","Great rooftop Israeli restaurant, Williamsburg",4.2,f(false,false,true,false,false,false,false,false),"https://laserwolfnyc.com",40.7158,-73.9572),
    v("Ornithology Jazz Club","Jazz","Best jazz bar",4.7,f(false,false,true,false,false,false,false,false),"https://ornithologyjazzclub.com",40.7260,-73.9890,"bar"),
    v("Walter's","American","Best French fries in the world",4.4,f(false,false,true,false,false,false,false,false),"https://waltersnyc.com",40.7260,-73.9890),
    v("Barnyard","American","Beloved neighborhood spot",4.4,f(false,false,false,true,false,false,false,false),"https://barnyardnyc.com",40.7260,-73.9890),
    v("Cello's Pizzeria","Pizza","Great slice",4.8,f(false,false,true,false,false,false,false,false),"https://cellospizzeria.com",40.7260,-73.9870),
    v("Cocoron","Soba","Great soba noodle shop, LES",4.4,f(false,false,true,false,false,false,false,true),"https://cocoron-nyc.com",40.7198,-73.9876),
    v("Lazzara's Pizza Cafe","Pizza","Good pizza, Midtown",4.3,f(false,false,false,true,false,false,false,false),"https://lazzaraspizzacafe.com",40.7531,-73.9893),
    v("Piccola Cucina Estiatorio","Italian","Beloved Italian, SoHo",4.6,f(false,false,true,false,false,false,false,false),"https://piccolacucinagroup.com",40.7260,-73.9993),
    v("Primola","Italian","Nice low key vibes, UES Italian",4.4,f(false,false,false,true,true,false,false,false),"https://primolanyc.com",40.7741,-73.9595),
    v("Cervo's","Seafood","Natural wine and Spanish-inspired seafood, LES",4.5,f(false,false,true,false,false,false,false,true),"https://cervosnyc.com",40.7198,-73.9876),
    v("One if by Land, Two if by Sea","New American","Most romantic restaurant in NYC, West Village carriage house",4.2,f(false,false,false,true,true,false,false,true),"https://oneifbyland.com",40.7329,-74.0026),
    v("Shoo Shoo Nolita","Mediterranean","Go downstairs — intimate Nolita spot",4.5,f(false,false,true,false,false,false,false,false),"https://shooshoonolita.com",40.7225,-73.9957),
    v("Tatiana by Kwame Onwuachi","Afro-Caribbean","Lincoln Center's buzzy Michelin-starred gem",4.3,f(true,true,true,false,true,false,true,false),"https://tatiananyc.com",40.7725,-73.9836),
    v("Per Se","French-American","Thomas Keller's NYC flagship, three stars — super tough resy but great food",4.5,f(true,false,false,true,true,false,true,true),"https://perseny.com",40.7685,-73.9821),
    v("Noz 17","Sushi","Intimate sushi counter, $100+",4.4,f(false,false,false,false,false,false,true,true),"https://noz17.com",40.7741,-73.9595,"sushi"),
    v("Sushi Nakazawa","Japanese Omakase","Legendary West Village omakase, $190 for 20 courses",4.5,f(true,false,false,true,true,false,true,true),"https://sushinakazawa.com",40.7329,-74.0031,"sushi"),
    v("Emilio's Ballato","Italian","Old-school SoHo Italian where the celebrities actually eat",4.1,f(false,false,false,true,true,false,false,false),"https://emiliosballato.com",40.7225,-73.9993),
    v("Il Buco Alimentari & Vineria","Italian","Great dinner, NoHo Italian with exceptional wine",4.5,f(false,false,true,false,true,false,false,true),"https://ilbucoalimentari.com",40.7260,-73.9957),
    v("Mamo","Italian","Great dinner spot, $100+",4.4,f(false,false,true,false,true,false,false,false),"https://mamonyc.com",40.7260,-73.9993),
    v("Sant Ambroeus SoHo","Italian Milanese","Best lunch spot — NYC's most reliable celebrity sighting",4.4,f(false,false,true,false,true,false,false,false),"https://santambroeus.com/pages/location-soho",40.7233,-74.0020),
    v("Boqueria Soho","Spanish","Great lunch spot, tapas",4.6,f(false,false,true,false,false,false,false,false),"https://boquerianyc.com",40.7225,-73.9993),
    v("Altro Paradiso","Italian","Great lunch spot",4.4,f(false,false,true,false,true,false,false,false),"https://altroparadiso.com",40.7260,-73.9993),
    v("Charlie Bird","Italian","Good dinner spot with great music",4.4,f(false,false,true,false,true,true,false,false),"https://charliebirdnyc.com",40.7260,-73.9993),
    v("Jack's Wife Freda","Mediterranean","Great lunch spot, SoHo institution",4.4,f(false,false,true,false,false,false,false,false),"https://jackswifefreda.com",40.7225,-73.9957),
    v("Lure Fishbar","Seafood","Great fish for lunch and dinner, SoHo",4.4,f(false,false,true,false,true,false,false,false),"https://lurefishbar.com",40.7225,-73.9993),
    v("L'Artusi","Italian","Lunch spot, West Village Italian",4.6,f(false,false,true,false,true,false,false,false),"https://lartusi.com",40.7329,-74.0026),
    v("Upland","American","Lunch spot, seasonal American",4.5,f(false,false,true,false,true,false,false,false),"https://uplandnyc.com",40.7408,-73.9893),
    v("Via Carota","Italian","West Village gem, best cacio e pepe",4.4,f(false,false,false,true,true,false,true,false),"https://viacarota.com",40.7329,-74.0026),
    v("The Polo Bar","American","Ralph Lauren's power dining room on 55th, old-school NYC glamour",4.4,f(false,false,false,true,true,false,true,false),"https://ralphlauren.com/polo-bar",40.7614,-73.9756),
    v("Chinese Tuxedo","Chinese","Beautiful Chinatown restaurant, outstanding banquet food",4.4,f(false,false,true,false,true,false,false,false),"https://chinesetuxedo.com",40.7163,-73.9971),
    v("Nami Nori West Village","Sushi","Hand roll spot, West Village",4.4,f(false,false,true,false,false,false,false,false),"https://naminori.com",40.7329,-74.0031,"sushi"),
    v("Au Cheval","New American","NYC outpost of Chicago's legendary burger — best cheeseburger in the city",4.7,f(false,false,true,false,true,false,true,false),"https://aucheval.tumblr.com/nyc",40.7408,-74.0026),
    v("Waverly Inn","American","Great brunch spot, West Village",4.3,f(false,false,false,true,true,false,false,false),"https://waverlyinnyc.com",40.7329,-74.0031),
    v("La Goulue New York","French","Great local French spot, UES institution",4.4,f(false,false,false,true,true,false,false,false),"https://lagouluenyc.com",40.7741,-73.9635),
    v("SHOGUN OMAKASE","Japanese","Manhattan omakase sushi restaurant",4.7,f(false,false,true,false,false,false,true,false),"https://shogunomakase.com",40.7260,-73.9870,"sushi"),
    v("Crown Shy","New American","70 Pine powerhouse, FiDi tasting menu gem",4.4,f(false,false,true,false,true,false,true,false),"https://crownshy.nyc",40.7030,-74.0128),
    v("Estela","Mediterranean","NoLIta natural wine and small plates institution",4.4,f(false,false,true,false,true,false,false,false),"https://estelanyc.com",40.7225,-73.9957),
    v("Wildair","New American","LES natural wine bar and small plates, Contra sibling",4.4,f(false,false,true,false,false,false,false,true),"https://wildair.nyc",40.7198,-73.9876),
    v("Balthazar","French Brasserie","Keith McNally's SoHo brasserie, open since 1997, always packed",4.4,f(false,false,false,true,true,false,false,false),"https://balthazarny.com",40.7227,-73.9997),
    v("L'industrie Pizzeria","Pizza","Great pizza slice, West Village",4.7,f(false,false,true,false,false,false,true,false),"https://lindustriepizzeria.com",40.7304,-74.0026),
    v("Lucia Pizza Of SoHo","Pizza","SoHo pizza institution",4.5,f(false,false,true,false,false,false,false,false),"https://luciapizzaofsoho.com",40.7225,-73.9993),
    v("Café Maud","Brunch","Popular brunch spot",4.5,f(false,false,true,false,false,false,false,false),"https://cafemaud.com",40.7260,-73.9890),
    v("Rosella","Sushi","Amazing fish restaurant — best sushi, Rosella",4.7,f(false,true,true,false,false,false,true,true),"https://rosellanyc.com",40.7260,-73.9870,"sushi"),
    v("Jeju Noodle Bar","Korean","Michelin star noodles, West Village",4.6,f(true,false,true,false,false,false,true,false),"https://jejunoodlebar.com",40.7304,-74.0031),
    v("Le Rock","French","Rockefeller Center French brasserie, stunning room",4.3,f(false,false,true,false,true,false,false,false),"https://lerocknyc.com",40.7580,-73.9787),
    v("Sushi Yasuda","Japanese","Midtown classic, exceptional quality, institution since 1999",4.4,f(false,false,false,true,true,false,false,true),"https://sushiyasuda.com",40.7525,-73.9715,"sushi"),
    v("Lucali","Pizza","Best pizza in NYC, cash only, BYOB, impossible wait",4.2,f(false,false,false,true,true,false,true,false),"https://lucali.com",40.6784,-73.9956),
    v("Sunday Morning","Bakery","Beloved bakery, $10-20",4.5,f(false,false,true,false,false,false,false,false),"https://sundaymorningbakery.com",40.7260,-73.9870),
    // Bars & Nightlife
    v("Zero Bond","Members Club","NYC's most exclusive new private members club",4.5,f(false,false,false,false,true,false,true,false),"https://zerobond.com",40.7225,-73.9957,"private club"),
    v("Maxime's","Social Club","Exclusive social club, very high-rated",4.8,f(false,true,true,false,true,false,true,false),"https://maximesnyc.com",40.7580,-73.9726,"private club"),
    v("Little Branch","Cocktail Bar","Great jazz music, speakeasy cocktail bar",4.4,f(false,false,false,true,false,true,false,false),"https://littlebranchnyc.com",40.7304,-74.0026,"bar"),
    v("Overstory","Cocktail Bar","Great cocktail bar, rooftop FiDi",4.3,f(false,false,true,false,false,false,false,false),"https://overstorynyc.com",40.7030,-74.0128,"bar"),
    v("yakuni","Bar","Japanese speakeasy",4.8,f(false,true,true,false,false,false,true,false),"https://yakuninyc.com",40.7260,-73.9870,"bar"),
    v("StEight","Bar","Secret Japanese speakeasy behind Kuniya Hair",4.8,f(false,true,true,false,false,false,true,false),"https://steightnyc.com",40.7260,-73.9870,"bar"),
    v("TEN11 LOUNGE & BAR","Cocktail Bar","Fun cocktail bar, NoMad",4.7,f(false,false,true,false,false,false,false,false),"https://ten11lounge.com",40.7448,-73.9883,"bar"),
    v("Undercote","Cocktail Bar","Great cocktail bar — Cote's subterranean speakeasy",4.6,f(false,false,true,false,true,false,false,false),"https://cotenyc.com/undercote",40.7397,-73.9927,"bar"),
    v("The Portrait Bar","Cocktail Bar","Very good cocktails and great vibe",4.5,f(false,false,true,false,false,false,false,false),"https://theportraitbar.com",40.7260,-73.9890,"bar"),
    v("Bar Bonobo","Cocktail Bar","Fun spot",4.4,f(false,false,true,false,false,false,false,false),"https://barbonobo.com",40.7260,-73.9890,"bar"),
    v("schmuck.","Bar","Amazing bar",4.3,f(false,false,true,false,false,false,false,false),"https://schmuckbar.com",40.7260,-73.9870,"bar"),
    v("Superbueno","Cocktail Bar","The best cocktail bar in NYC",4.2,f(false,true,true,false,false,false,false,false),"https://superbuenonyc.com",40.7260,-73.9870,"bar"),
    v("Yawning Cobra","Cocktail Bar","Great Japanese cocktail bar",4.7,f(false,false,true,false,false,false,false,false),"https://yawningcobra.com",40.7260,-73.9890,"bar"),
    v("Kissa Kissa","Cocktail Bar","Intimate cocktail bar",4.8,f(false,true,true,false,false,false,false,false),"https://kissakissanyc.com",40.7260,-73.9870,"bar"),
    v("Lai Rai","Wine Bar","Intimate wine bar, $10-20",4.8,f(false,false,true,false,false,false,false,true),"https://lairainyc.com",40.7260,-73.9870,"bar"),
    v("Moonflower","Wine Bar","$30-50 wine bar",4.5,f(false,false,true,false,false,false,false,true),"https://moonflowernyc.com",40.7260,-73.9870,"bar"),
    v("Parcelle Chinatown","Wine Bar","Nice wine bar, Chinatown",4.5,f(false,false,true,false,false,false,false,true),"https://parcelle.wine",40.7163,-73.9971,"bar"),
    v("Nine Cases","Wine Bar","Really nice wine bar spot",4.7,f(false,false,true,false,false,false,false,true),"https://ninecases.com",40.7260,-73.9870,"bar"),
    v("Cellar 36","Bar","Fun wine bar",4.7,f(false,false,true,false,false,false,false,false),"https://cellar36nyc.com",40.7260,-73.9870,"bar"),
    v("Cherry on Top","Wine Bar","Great wine bar",4.6,f(false,false,true,false,false,false,false,false),"https://cherryontopnyc.com",40.7260,-73.9870,"bar"),
    v("Frog","Wine Bar","Great wine bar",4.2,f(false,false,true,false,false,false,false,false),"https://frogwinebar.com",40.7260,-73.9870,"bar"),
    v("Alba Accanto","Cocktail Bar","$50-100 cocktail bar",4.7,f(false,false,true,false,false,false,false,false),"https://albaaccanto.com",40.7260,-73.9870,"bar"),
    v("Eavesdrop","Bar","$$, neighborhood bar",4.4,f(false,false,true,false,false,false,false,false),"https://eavesdropnyc.com",40.7260,-73.9870,"bar"),
    v("St Jardim","Wine Bar","Charming wine bar",4.5,f(false,false,true,false,false,false,false,true),"https://stjardim.com",40.7260,-73.9870,"bar"),
    v("Botanica Bar","Bar","$10-20 bar",4.3,f(false,false,true,false,false,false,false,false),"https://botanicabarnyc.com",40.7260,-73.9870,"bar"),
    v("Clemente Bar","Cocktail Bar","Eleven Madison Park's great bar",4.7,f(false,false,true,false,true,false,false,false),"https://clementebar.com",40.7416,-73.9872,"bar"),
    v("Bar Pisellino","Bar","Great Italian cocktails and people watching",4.1,f(false,false,true,false,true,false,false,false),"https://barpisellino.com",40.7329,-74.0031,"bar"),
    v("Patent Pending","Cocktail Bar","Great speakeasy, $20-30",4.4,f(false,false,true,false,false,false,false,false),"https://patentpendingnycbar.com",40.7488,-73.9883,"bar"),
    v("Dante NYC","Cocktail Bar","Best Negroni in NYC, Greenwich Village institution",4.5,f(false,false,false,true,true,false,false,false),"https://dante-nyc.com",40.7304,-74.0026,"bar"),
    v("Double Chicken Please","Cocktail Bar","The best cocktail spot",4.6,f(false,true,true,false,false,false,false,false),"https://doublechickenplease.com",40.7260,-73.9870,"bar"),
    v("Katana Kitten","Bar","Good cocktails, West Village Japanese-inspired bar",4.5,f(false,false,true,false,false,false,false,false),"https://katanakitten.com",40.7329,-74.0031,"bar"),
    v("Martiny's","Cocktail Bar","Best cocktail bar",4.2,f(false,false,true,false,false,false,false,false),"https://martinysnyc.com",40.7260,-73.9890,"bar"),
    v("Midnight Blue","Cocktail Bar","Good jazz, intimate cocktail bar",4.4,f(false,false,true,false,false,false,false,false),"https://midnightbluenyc.com",40.7260,-73.9890,"bar"),
    v("Birdland Jazz Club","Jazz","Fun jazz club, West 44th Street institution",4.7,f(false,false,false,true,true,true,false,false),"https://birdlandjazz.com",40.7580,-73.9855,"bar"),
    v("Sake Bar Decibel","Bar","Best sake bar, East Village underground",4.4,f(false,false,true,false,false,false,false,false),"https://sakebardecibel.com",40.7260,-73.9832,"bar"),
    v("Grand Banks","Oyster Bar","Great for happy hour, boat bar on Hudson",4.3,f(false,false,true,false,true,false,false,false),"https://grandbanks.nyc",40.7260,-74.0090,"bar"),
    v("Pen Top","Rooftop Bar","Very nice rooftop bar, Midtown",4.3,f(false,false,true,false,true,false,false,false),"https://pentopbar.com",40.7558,-73.9726,"rooftop"),
    v("Marsanne","Restaurant & Rooftop","Great rooftop",4.5,f(false,false,true,false,false,false,false,false),"https://marsannenyc.com",40.7260,-73.9890,"rooftop"),
    v("Nubeluz","Bar","Nice bar, the best — Peruvian cocktails at the Ritz Carlton",4.5,f(false,true,true,false,true,false,true,false),"https://nubeluz.com",40.7055,-74.0128,"rooftop"),
    v("The Rose Lounge","Bar","Good music, lounge bar",4.4,f(false,false,true,false,false,true,false,false),"https://theroseloungenyc.com",40.7260,-73.9890,"bar"),
    v("Silver Lining Lounge","Bar","Nice piano bar",4.4,f(false,false,true,false,false,true,false,false),"https://silverloungenyc.com",40.7260,-73.9890,"bar"),
    v("Jac's on Bond","Cocktail Bar","Fun cocktail bar, NoHo",4.1,f(false,false,true,false,false,false,false,false),"https://jacsonbond.com",40.7260,-73.9957,"bar"),
    v("All Night Skate","Bar","Great bar",4.4,f(false,false,true,false,false,false,false,false),"https://allnightskate.com",40.7260,-73.9890,"bar"),
    v("Café Chelsea","Bar/Restaurant","Amazing scene — Hotel Chelsea",4.4,f(false,true,true,false,true,false,false,false),"https://cafechelsea.com",40.7440,-74.0003,"bar"),
    v("Lobby Bar at The Hotel Chelsea","Bar","Hit the bar it's amazing — iconic Hotel Chelsea",4.5,f(false,true,true,false,true,false,false,false),"https://hotelchelsea.com",40.7440,-74.0003,"bar"),
    v("Comedy Cellar","Comedy Club","NYC's most famous comedy club, Village Underground",4.8,f(false,false,false,true,true,false,false,false),"https://comedycellar.com",40.7304,-74.0026,"bar"),
    // Sushi standalone
    v("Sushi Noz","Japanese Omakase","Two Michelin stars, traditional Edomae, hinoki counter — also a hand roll spot in front",4.5,f(true,false,false,false,false,false,true,true),"https://sushinoz.com",40.7741,-73.9635,"sushi"),
    v("Sushi Sho","Japanese Omakase","Best sushi — Japan approved, three Michelin stars, $450pp",4.7,f(true,false,false,false,false,false,true,true),"https://sushishonyc.com",40.7580,-73.9835,"sushi"),
    v("Bricolage","Vietnamese","Ask for Omri — Vietnamese restaurant",4.4,f(false,false,true,false,false,false,false,false),"https://bricolagenyc.com",40.7260,-73.9890),
    // Misc NYC spots without full closures
    v("Maison Premiere","Oyster Bar","Best cocktails — New Orleans-inspired oysters and absinthe, Williamsburg",4.5,f(false,false,true,false,true,false,false,true),"https://maisonpremiere.com",40.7156,-73.9572,"bar"),
    v("Locanda Verde","Italian","Robert De Niro's Tribeca Italian, always a scene",4.4,f(false,false,true,false,true,false,false,false),"https://locandaverde.com",40.7199,-74.0090),
    v("The Mercer","Hotel Bar","Iconic Mercer Hotel bar, SoHo",4.4,f(false,false,true,false,true,false,false,false),"https://mercerhotel.com",40.7225,-73.9993,"bar"),
    v("Oxomoco","Mexican","Mexican 🙌🏾 — outstanding wood-fired Mexican",4.3,f(false,false,true,false,false,false,false,false),"https://oxomoco.com",40.7163,-73.9432),
    v("Shuka","Mediterranean","Bustling Mediterranean, SoHo",4.3,f(false,false,true,false,false,false,false,false),"https://shukanyc.com",40.7225,-73.9993),
    v("Rubirosa","Italian-American","Best pizza and pasta, Staten Island-style red sauce, Nolita",4.4,f(false,false,false,true,true,false,true,false),"https://rubirosanyc.com",40.7225,-73.9957),
    v("ILIS","New American","#1 restaurant — extraordinary tasting menu",4.5,f(true,true,false,false,false,false,true,true),"https://ilisnyc.com",40.7260,-73.9890),
    v("Cafe Mogador","Moroccan","Great local NYC spot, East Village institution since 1983",4.3,f(false,false,false,true,true,false,false,false),"https://cafemogador.com",40.7260,-73.9832),
    v("Thirteen Water","Sushi","Best priced omakase",4.5,f(false,false,true,false,false,false,true,false),"https://thirteenwater.com",40.7260,-73.9890,"sushi"),
    v("Apollo Bagels","Bagels","Best bagels",4.6,f(false,true,true,false,false,false,true,false),"https://apollobagels.com",40.7260,-73.9890),
    v("Rule of Thirds","Japanese","Good sushi — Williamsburg Japanese",4.4,f(false,false,true,false,false,false,false,false),"https://ruleofthirdsnyc.com",40.7158,-73.9572),
    v("Raf's","Restaurant","Vibes — East Village",4.4,f(false,true,true,false,true,false,false,false),"https://rafsnyc.com",40.7260,-73.9832),
    v("COQODAQ","Korean","Best Korean restaurant — fried chicken omakase concept",4.5,f(false,true,true,false,true,false,true,false),"https://coqodaq.com",40.7397,-73.9893),
    v("4 Charles Prime Rib","Steakhouse","Best dinner and event spot — intimate West Village prime rib",4.5,f(false,false,false,true,true,false,true,true),"https://4charlesprimerib.com",40.7329,-74.0026),
    v("Pinch Chinese","Chinese","Great Chinese, Midtown",4.4,f(false,false,true,false,false,false,false,false),"https://pinchchinesenyc.com",40.7580,-73.9855),
    v("Joe's Shanghai","Chinese","Classic soup dumpling institution, Midtown",4.2,f(false,false,false,true,true,false,false,false),"https://joeshanghairestaurants.com",40.7580,-73.9855),
    v("Melba's Restaurant","Southern","James Beard nominated, great hospitality, Harlem institution",4.4,f(false,false,false,true,true,false,false,false),"https://melbasrestaurant.com",40.8116,-73.9503),
    v("Mari","Korean","Upscale Korean, intimate",4.5,f(false,true,true,false,false,false,true,true),"https://marinyc.com",40.7260,-73.9890),
    v("Torrisi","Italian-American","Best Italian restaurant — Major Food Group masterpiece",4.5,f(false,false,true,false,true,false,true,false),"https://torrisinyc.com",40.7225,-73.9957),
    v("Don Angie","Italian","Best Italian — creative red-sauce, Michelin starred",4.8,f(true,false,true,false,false,false,true,false),"https://donangie.com",40.7354,-74.0065),
    v("Misi","Italian","Best Italian restaurant — Missy Robbins' pasta temple",4.6,f(false,false,true,false,false,false,true,false),"https://misinyc.com",40.7183,-73.9572),
    v("Lilia","Italian","Best Italian — pasta temple, perpetual waits",4.7,f(false,false,true,false,false,false,true,false),"https://lilianewyork.com",40.7183,-73.9572),
    v("Della's","Wine Bar","Nice wine bar",4.4,f(false,false,true,false,false,false,false,true),"https://dellasnyc.com",40.7260,-73.9890,"bar"),
    v("BONDST","Japanese","Upscale Japanese in NoHo",4.3,f(false,false,true,false,true,false,false,false),"https://bondst.com",40.7260,-73.9957),
    v("Blue Ribbon Sushi","Japanese","Great sushi — chefs' favorite after-shift spot",4.6,f(false,false,false,true,true,false,false,false),"https://blueribbonrestaurants.com",40.7255,-74.0020,"sushi"),
    v("Blue Ribbon Brasserie","American","The best late night food",4.5,f(false,false,false,true,true,false,false,false),"https://blueribbonrestaurants.com",40.7255,-74.0020),
    v("Bleecker Street Pizza","Pizza","Great pizza",4.4,f(false,false,false,true,false,false,false,false),"https://bleeckerstreetpizza.com",40.7304,-74.0026),
    v("Prince Street Pizza","Pizza","Best pizza",4.5,f(false,false,true,false,false,false,true,false),"https://princestreetpizza.com",40.7225,-73.9957),
    v("John's of Bleecker Street","Pizza","Best pizza, West Village classic since 1929",4.4,f(false,false,false,true,true,false,false,false),"https://johnsbrickovenpizza.com",40.7304,-74.0026),
    v("maman","French Café","French coffee store, beloved",4.5,f(false,false,true,false,false,false,false,false),"https://mamannyc.com",40.7225,-73.9993),
    v("Fouquet's New York","Bar","Great speakeasy bar, $100+",4.5,f(false,true,true,false,true,false,false,false),"https://fouquets-newyork.com",40.7614,-73.9756,"bar"),
    v("Accidental Bar","Bar","Great sake and vibes",4.9,f(false,true,true,false,false,false,false,false),"https://accidentalbar.com",40.7260,-73.9890,"bar"),
    v("Popup Bagels","Bagels","Best bagel",4.5,f(false,true,true,false,false,false,true,false),"https://popupbagels.com",40.7260,-73.9890),
    v("Daily Provisions","American","Get the everything bagel croissant",4.5,f(false,false,true,false,false,false,false,false),"https://dailyprovisionsnyc.com",40.7397,-73.9893),
    v("ATLA Noho","Mexican","Upscale Mexican, NoHo",4.3,f(false,false,true,false,true,false,false,false),"https://atlanyc.com",40.7260,-73.9957),
    v("THE GRILL","American","Power lunch institution in the Four Seasons landmark space",4.6,f(false,false,false,true,true,false,false,true),"https://thegrillnewyork.com",40.7569,-73.9726),
    v("Monkey Bar","American","Midtown power scene, Graydon Carter's celebrity haunt",4.3,f(false,false,false,true,true,false,false,false),"https://monkeybarnewyork.com",40.7576,-73.9726),
    v("Joe's Pizza","Pizza","Best pizza in NYC, classic slice",4.5,f(false,false,false,true,true,false,false,false),"https://joespizzanyc.com",40.7304,-74.0026),
    v("Russ & Daughters","Jewish Deli","Best bagel — Houston Street institution since 1914",4.5,f(false,false,false,true,true,false,false,false),"https://russanddaughters.com",40.7221,-73.9873),
    v("Mama's TOO! Pizzeria","Pizza","Great pizza, West Village",4.3,f(false,false,true,false,false,false,false,false),"https://mamaspizzanyc.com",40.7304,-74.0031),
    v("Cookshop","American","Popular brunch, Chelsea",4.5,f(false,false,true,false,false,false,false,false),"https://cookshopny.com",40.7458,-74.0003),
    v("Le Bernardin","Seafood","3 Michelin — Eric Ripert's three-star seafood temple, best in America",4.6,f(true,false,false,true,true,false,true,true),"https://le-bernardin.com",40.7614,-73.9816),
    v("Jungsik","Korean","3 Michelin Korean — sea urchin bibimbap, multi-floor fine dining",4.6,f(true,false,true,false,true,false,true,true),"https://jungsik.kr",40.7246,-74.0090),
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
    v("Sushi Yoshitake","Japanese Omakase","Three Michelin stars in Tokyo; the Paris outpost maintains extraordinary standards",4.8,f(true,false,false,false,false,false,true,true,false,true),"https://sushi-yoshitake.com",48.8668,-2.3296,"sushi"),
    v("Akami","Japanese Omakase","One Michelin star, outstanding omakase in the Marais, exceptional fish",4.8,f(true,false,true,false,false,false,true,true,false,true),"https://akami.fr",48.8568,-2.3556,"sushi"),
    v("Isami","Japanese","Paris's most celebrated traditional sushi, Île Saint-Louis institution",4.7,f(false,false,false,true,false,false,true,true,false,true),"https://isami-paris.com",48.8516,-2.3536,"sushi"),
    v("Nobu Paris","Japanese-Peruvian","Nobu's elegant Paris outpost, celebrity sushi",4.6,f(false,false,true,false,true,false,false,false,false,true),"https://noburestaurants.com/paris",48.8668,-2.3296,"sushi"),
  ],

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
    v("Galleraki","Cocktail Bar","Little Venice's most beautiful cocktail bar, waves crashing beneath, sunset institution",4.7,f(false,false,true,false,true,false,false,false),"https://gallerakimykonos.com",37.4452,-25.3274,"bar"),
    v("Remezzo","Cocktail Bar","Iconic Little Venice waterfront bar, legendary sunsets, classic Mykonos",4.5,f(false,false,false,true,true,false,false,false),"https://remezzomykonos.com",37.4452,-25.3274,"bar"),
    v("180° Sunset Bar","Rooftop Bar","Panoramic 180-degree views over the Aegean, DJ sets at sunset, spectacular",4.7,f(false,false,true,false,true,false,false,false),"https://180mykonos.com",37.4452,-25.3264,"rooftop"),
    v("Cavo Paradiso","Nightclub","Mykonos's legendary clifftop nightclub, world-class DJs, open-air and iconic",4.6,f(false,false,true,false,true,true,false,false),"https://cavoparadiso.gr",37.4201,-25.3311,"bar"),
    v("Pierro's","Bar","The original Mykonos nightlife institution since 1976, the after-hours destination",4.4,f(false,false,true,false,true,true,false,false),"https://pierrosmykonos.gr",37.4454,-25.3283,"bar"),
    v("Babylon","Bar","Little Venice gay bar, legendary sunset cocktails, Mykonos classic",4.3,f(false,false,true,false,true,false,false,false),"https://babylonmykonos.gr",37.4452,-25.3264,"bar"),
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
  "Lyons NYC": [
    // Restaurants & Fine Dining
    v("Bar Chimera","Bar","Highly rated intimate bar, buzzy NYC spot",5.0,f(false,false,true,false,false,false,false,false),"https://barchimera.com",40.7230,-73.9980,"bar"),
    v("The Musket Room","New American","Acclaimed New American, $100+, serious tasting menu destination",4.5,f(false,false,true,false,false,false,false,false),"https://musketroom.com",40.7215,-74.0020),
    v("GAIA","Mediterranean","Upscale Mediterranean, $100+",4.0,f(false,false,true,false,false,false,false,false),"https://gaiarestaurant.com",40.7590,-73.9700),
    v("Le Charlot","French","Classic French UES, $50-100, neighborhood staple",4.0,f(false,false,false,true,true,false,false,false),"https://lecharlotnyc.com",40.7720,-73.9570),
    v("Cafe Luxembourg","French","Beloved UWS French brasserie, institution since 1983",4.4,f(false,false,false,true,true,false,false,false),"https://cafeluxembourg.com",40.7792,-73.9821),
    v("Maxime's","Social Club","Elegant private-feeling social club, $100+",4.8,f(false,false,true,false,true,false,false,false),"https://maximesnyc.com",40.7630,-73.9726),
    v("Coco's at Colette","Restaurant","Amazing views, $100+",4.6,f(false,false,true,false,true,false,false,false),"https://cocosatcolette.com",40.7580,-73.9720),
    v("La Pecora Bianca Bryant Park","Italian","Beloved Italian near Bryant Park, $$$",4.8,f(false,false,true,false,false,false,false,false),"https://lapecorablanca.com",40.7544,-73.9840),
    v("Ambassadors Clubhouse","Indian","Michelin-recognized Indian, $100+",4.6,f(true,false,true,false,false,false,false,false),"https://ambassadorsnewyor.com",40.7580,-73.9720),
    v("Massara On Park","Italian","Good Italian on Park Ave, $100+",4.3,f(false,false,true,false,false,false,false,false),"https://massaranyc.com",40.7500,-73.9780),
    v("Rezdôra","Italian","Amazing Italian, James Beard nominated, $100+",4.2,f(false,true,true,false,false,false,true,false),"https://rezdora.com",40.7448,-73.9870),
    v("Bricolage","Vietnamese","Ask for Omri, solid Vietnamese, $$",4.4,f(false,false,true,false,false,false,false,false),"https://bricolageny.com",40.7200,-73.9950),
    v("Zaab Zaab","Thai","Excellent Thai, $$, two locations",4.3,f(false,false,true,false,false,false,false,false),"https://zaabzaabnyc.com",40.7280,-73.9880),
    v("Cho Dang Gol","Korean","Beloved Korean tofu restaurant, $20-30",4.6,f(false,false,false,true,false,false,false,false),"https://chodanggolnyc.com",40.7500,-73.9880),
    v("The Golden Swan","French","Acclaimed French, $100+",4.5,f(false,false,true,false,false,false,false,false),"https://goldenswan.nyc",40.7380,-74.0050),
    v("Gjelina","Californian","NYC outpost of beloved Venice CA institution, $50-100",4.2,f(false,false,true,false,true,false,false,false),"https://gjelina.com",40.7230,-73.9980),
    v("Thai Diner","Thai","Great Thai diner, always packed, $$",4.4,f(false,false,true,false,false,false,false,false),"https://thaidiner.com",40.7225,-74.0010),
    v("I Cavallini","Italian","Hard resy, exceptional Italian, $100+",4.6,f(false,false,true,false,false,false,true,false),"https://icavallini.com",40.7279,-74.0054),
    v("The Eighty Six","Restaurant","$100+, excellent dining",4.6,f(false,false,true,false,false,false,false,false),"https://theeightysix.com",40.7280,-73.9900),
    v("Nōksu","Korean","Hidden omakase inside a train station, $100+",4.6,f(false,true,true,false,false,false,true,false),"https://noksu.nyc",40.7520,-73.9760),
    v("Meadowsweet","New American","Beloved Williamsburg New American, $50-100",4.6,f(false,false,true,false,false,false,false,false),"https://meadowsweetnyc.com",40.7125,-73.9576),
    v("ATOMIX","Korean Contemporary","Best Korean and top NYC restaurant, two Michelin stars, $100+",4.7,f(true,false,true,false,false,false,true,true),"https://atomixnyc.com",40.7448,-73.9870),
    v("Fasano Restaurant","Italian Brazilian","Acclaimed Fasano group's NYC outpost, $100+",4.6,f(false,false,true,false,true,false,false,false),"https://fasanonewyork.com",40.7630,-73.9780),
    v("Ha's Snack Bar","Restaurant","Creative small plates, $50-100",4.3,f(false,false,true,false,false,false,false,false),"https://hassnackbar.com",40.7270,-73.9800),
    v("ITO","Japanese","Gotta go — outstanding Japanese omakase, $100+",4.5,f(false,true,true,false,false,false,true,false),"https://itonyc.com",40.7480,-73.9870),
    v("Osteria Delbianco","Italian","Good Italian, $50-100",4.7,f(false,false,true,false,false,false,false,false),"https://osteriadelbianc.com",40.7190,-73.9970),
    v("Rolo's","Grill","Beloved neighborhood grill, $50-100",4.5,f(false,false,true,false,false,false,false,false),"https://rolosnyc.com",40.7270,-73.9900),
    v("Bamonte's","Italian","Williamsburg Italian institution since 1900, $50-100",4.5,f(false,false,false,true,true,false,false,false),"https://bamontes.com",40.7175,-73.9477),
    v("& Son Steakeasy","Steakhouse","Great vibe steakhouse",4.2,f(false,false,true,false,true,false,false,false),"https://andsonsteakeasy.com",40.7260,-73.9990),
    v("Huso","Fine Dining","Great omakase — Top Chef champ Buddha Lo's caviar-centric tasting menu, $100+",4.7,f(false,true,true,false,true,false,true,true),"https://husonyc.com",40.7199,-74.0090),
    v("Wayan","Indonesian","Acclaimed Indonesian, $100+",4.3,f(false,false,true,false,false,false,false,false),"https://wayannyc.com",40.7226,-73.9980),
    v("Do Not Disturb","Seafood","Good bar and seafood, $50-100",4.6,f(false,false,true,false,false,false,false,false),"https://donotdisturbnyc.com",40.7460,-73.9870),
    v("Francie","Brasserie","Williamsburg brasserie, $$",4.4,f(false,false,true,false,false,false,false,false),"https://francienyc.com",40.7128,-73.9613),
    v("Kabawa","Caribbean","Need to go! Caribbean, $100+",4.6,f(false,true,true,false,false,false,false,false),"https://kabawanyc.com",40.7440,-73.9880),
    v("King","Italian","Great food — get the pasta and salad, $100+",4.3,f(false,false,true,false,false,false,false,false),"https://kingrestaurant.nyc",40.7284,-74.0059),
    v("Mountain House East Village","Sichuan","Electric Chinese food, $$",4.6,f(false,true,true,false,false,false,false,false),"https://mountainhouseev.com",40.7258,-73.9832),
    v("Una Pizza Napoletana","Pizza","Voted best pizza, gotta try, $$",4.3,f(false,false,true,false,false,false,false,false),"https://unapizza.com",40.7210,-73.9880),
    v("Theodora","Mediterranean","Best Mediterranean — great smoke, $50-100",4.6,f(false,true,true,false,false,false,true,true),"https://theodorabk.com",40.6881,-73.9750),
    v("Kiko","Asian","$100+, creative Asian",4.7,f(false,false,true,false,false,false,false,false),"https://kikonyc.com",40.7390,-74.0010),
    v("Palma","Italian","Nice quiet Italian, $50-100",4.6,f(false,false,false,true,false,false,false,true),"https://palmanyc.com",40.7335,-74.0024),
    v("Cucina Alba","Italian","Good Italian, $100+",4.7,f(false,false,true,false,false,false,false,false),"https://cucinaalba.com",40.7183,-74.0030),
    v("noreetuh","Hawaiian","Good wine list, Hawaiian, $$$",4.6,f(false,false,true,false,false,false,false,false),"https://noreetuh.com",40.7260,-73.9800),
    v("Sixty Three Clinton","New American","Great wine spot, $100+",4.6,f(false,false,true,false,false,false,false,true),"https://sixtythreeclinton.com",40.7198,-73.9876),
    v("Scarpetta","Italian","Good food and live music, $100+",4.6,f(false,false,true,false,true,true,false,false),"https://scarpettanyc.com",40.7404,-74.0010),
    v("Roscioli NYC","Roman","Really good dinner, $100+",4.4,f(false,false,true,false,false,false,false,false),"https://roscioli.nyc",40.7252,-73.9968),
    v("Crevette","Seafood","Great meal, $100+",4.3,f(false,false,true,false,false,false,false,false),"https://crevetterestaurant.com",40.7220,-73.9980),
    v("Four Twenty Five","New American","Jean-Georges restaurant — get the pasta, $100+",4.5,f(false,false,true,false,true,false,true,false),"https://fourtwentyfive.com",40.7571,-73.9740),
    v("La Tête d'Or by Daniel","French Steakhouse","Daniel Boulud's first steakhouse, One Madison, instant power scene, $100+",4.6,f(false,true,true,false,true,false,true,false),"https://latetedorbydaniel.com",40.7416,-73.9872),
    v("Le Café Louis Vuitton","Café","Louis Vuitton's chic café, $100+",4.4,f(false,false,true,false,true,false,false,false),"https://us.louisvuitton.com",40.7637,-73.9732),
    v("Primola","Italian","Nice low key vibes, $50-100",4.4,f(false,false,false,true,true,false,false,false),"https://primolanyc.com",40.7641,-73.9635),
    v("Cosme","Mexican","Best Mexican in NYC, $100+",4.3,f(false,false,true,false,true,false,true,false),"https://cosmenyc.com",40.7394,-73.9867),
    v("Essential by Christophe","French","Outstanding French, $100+",4.8,f(false,false,true,false,false,false,false,false),"https://essentialbyc.com",40.7580,-73.9700),
    v("Sailor","Restaurant","Great spot, $50-100",4.5,f(false,false,true,false,false,false,false,false),"https://sailorrestaurant.com",40.7250,-73.9920),
    v("odo","Japanese","Amazing sushi in the lounge, $100+",4.5,f(false,false,true,false,false,false,false,true),"https://odonyc.com",40.7440,-73.9900),
    v("Barbuto","Italian","West Village Italian classic, $50-100",4.3,f(false,false,false,true,true,false,false,false),"https://barbutonyc.com",40.7349,-74.0096),
    v("Lucien","French","Fun hang, French bistro, $50-100",4.1,f(false,false,true,false,true,false,false,false),"https://luciennyc.com",40.7257,-73.9822),
    v("Marea","Italian Seafood","Acclaimed Italian seafood, $100+",4.5,f(false,false,false,true,true,false,false,false),"https://mareareastaurant.com",40.7681,-73.9835),
    v("Yamada","Japanese","Amazing, $100+",4.9,f(false,true,true,false,false,false,true,true),"https://yamadanyc.com",40.7580,-73.9700),
    v("Le Veau d'Or","French","Great spot, historic 1937 French bistro revived by Frenchette team, $100+",4.5,f(false,true,true,false,true,false,true,true),"https://leveaudor.com",40.7641,-73.9635),
    v("Bridges","French","Great spot, $100+",4.5,f(false,false,true,false,false,false,false,false),"https://bridgesnyc.com",40.7580,-73.9700),
    v("Kappo Sono","Japanese","Amazing restaurant, $100+",5.0,f(false,true,true,false,false,false,true,true),"https://kapposono.com",40.7580,-73.9700),
    v("Waverly Inn","American","Great brunch spot, $100+",4.3,f(false,false,false,true,true,false,false,false),"https://waverlyinnyc.com",40.7349,-74.0062),
    v("La Goulue","French","Great local French spot, $100+",4.4,f(false,false,false,true,true,false,false,false),"https://lagouluenyc.com",40.7717,-73.9614),
    v("Claud","Restaurant","Great wine bar, $100+",4.2,f(false,false,true,false,false,false,false,true),"https://claudrestaurant.com",40.7300,-73.9900),
    v("Borgo","Italian","Great Italian, $100+",4.4,f(false,true,true,false,false,false,false,true),"https://borgonyc.com",40.7448,-73.9872),
    v("Mitsuru","Japanese","Need to go, $100+",4.5,f(false,true,true,false,false,false,false,false),"https://mitsurunyc.com",40.7580,-73.9700),
    v("Kisa","Korean","$40-50, excellent Korean",4.5,f(false,false,true,false,false,false,false,false),"https://kisanyc.com",40.7280,-73.9900),
    v("Le Bernardin","Seafood","3 Michelin stars — Eric Ripert's seafood temple, best in America, $100+",4.6,f(true,false,false,true,true,false,true,true),"https://le-bernardin.com",40.7614,-73.9816),
    v("L'Avenue at Saks","Haute French","$100+, chic see-and-be-seen Parisian brasserie at Saks Fifth Avenue",4.4,f(false,false,true,false,true,false,false,false),"https://lavenuenyc.com",40.7588,-73.9784),
    v("Jōji","Sushi","$100+, acclaimed omakase",4.5,f(true,false,true,false,false,false,true,true),"https://jojirestaurant.com",40.7580,-73.9716,"sushi"),
    v("Moono","Korean","$100+, refined Korean",4.4,f(false,false,true,false,false,false,false,false),"https://moononyc.com",40.7480,-73.9870),
    v("Jua","Korean","$100+, Michelin-recognized Korean",4.7,f(true,false,true,false,false,false,true,false),"https://juanyc.com",40.7440,-73.9900),
    v("Bemelmans Bar","Bar","Legendary Carlyle Hotel bar, live piano, $100+",4.3,f(false,false,false,true,true,true,false,false),"https://rosewoodhotels.com/en/the-carlyle-new-york/dining/bemelmans-bar",40.7740,-73.9637,"bar"),
    v("Jungsik","Korean","3 Michelin stars Korean, $100+",4.6,f(true,false,true,false,true,false,true,true),"https://jungsik.com",40.7209,-74.0086),
    v("Frevo","Fine Dining","Michelin, $100+",4.8,f(true,false,true,false,false,false,true,false),"https://frevonyc.com",40.7286,-74.0048),
    v("YOSHINO","Sushi","Best sushi, $100+",4.5,f(false,true,true,false,false,false,true,true),"https://yoshinony.com",40.7580,-73.9700,"sushi"),
    v("The Modern","Restaurant","Low key restaurant in MoMA, $100+",4.6,f(false,false,false,true,true,false,false,true),"https://themodernnyc.com",40.7614,-73.9780),
    v("I Sodi","Tuscan","Best Italian, $50-100",4.2,f(false,false,false,true,true,false,false,true),"https://isodinyc.com",40.7327,-74.0046),
    v("Colonia Verde","Restaurant","Brooklyn gem, $50-100",4.6,f(false,false,true,false,false,false,false,false),"https://coloniaverdebrooklyn.com",40.6790,-73.9600),
    v("Karasu","Japanese","$50-100, excellent Japanese",4.5,f(false,false,true,false,false,false,false,false),"https://karasubrooklyn.com",40.6790,-73.9650),
    v("Evelina","Italian","$$$, excellent Italian",4.7,f(false,false,true,false,false,false,false,false),"https://evelinabk.com",40.6834,-73.9654),
    v("Shukette","Middle Eastern","Acclaimed Middle Eastern, very buzzy",4.8,f(false,true,true,false,false,false,true,false),"https://shukettenyc.com",40.7500,-73.9960),
    v("Saga","Fine Dining","Spectacular views, $100+",4.4,f(false,false,true,false,true,false,true,false),"https://saganewyork.com",40.7068,-74.0118),
    v("The Corner Store","American","SoHo sensation, live-fire Mediterranean, $100+",4.6,f(false,true,true,false,true,false,true,false),"https://thecornerstorenyc.com",40.7229,-73.9993),
    v("Kinjo","Japanese","$100+, outstanding Japanese",4.9,f(false,true,true,false,false,false,true,true),"https://kinjonyc.com",40.7580,-73.9700),
    v("Ikigai","Japanese","Great sushi, $100+",4.8,f(false,true,true,false,false,false,true,true),"https://ikigainyc.com",40.7580,-73.9700,"sushi"),
    v("Tanoshi Sushi","Sushi","Sit with Timoki, $100+",4.7,f(false,false,true,false,false,false,true,true),"https://tanoshisushisakebar.com",40.7770,-73.9544,"sushi"),
    v("The Portrait Bar","Cocktail Bar","Very good cocktails and great vibe, $50-100",4.5,f(false,false,true,false,true,false,false,false),"https://theportraitbar.com",40.7620,-73.9740,"bar"),
    v("Eyval","Persian","Top Persian restaurant, $50-100",4.6,f(false,false,true,false,false,false,false,false),"https://eyvalnyc.com",40.7183,-73.9572),
    v("Aska","Scandinavian","2 Michelin stars, $100+",4.6,f(true,false,true,false,false,false,true,true),"https://askanyc.com",40.7128,-73.9613),
    v("The Four Horsemen","Wine Bar & Restaurant","Great food, natural wine, Michelin, $100+",4.6,f(true,false,true,false,true,false,false,true),"https://fourhorsemenbk.com",40.7158,-73.9500),
    v("Laser Wolf Brooklyn","Israeli","Great rooftop, $100+",4.2,f(false,false,true,false,true,false,false,false),"https://laserwolfbrooklyn.com",40.7128,-73.9613,"rooftop"),
    v("Maison Sun","Fine Dining","$100+, excellent fine dining",4.6,f(false,false,true,false,false,false,false,false),"https://maisonsunnyc.com",40.7270,-73.9970),
    v("Oiji Mi","Korean","Amazing Korean, $100+",4.6,f(false,true,true,false,false,false,true,false),"https://oijimi.com",40.7390,-73.9980),
    v("Café Carmellini","Fine Dining","Best NYC restaurant, $100+",4.5,f(false,false,true,false,true,false,true,false),"https://cafecarmellini.com",40.7260,-73.9990),
    v("Shoo Shoo Nolita","Mediterranean","Go downstairs, $$",4.5,f(false,false,true,false,false,false,false,false),"https://shooshoonyc.com",40.7230,-73.9970),
    v("Tatiana by Kwame Onwuachi","Caribbean","Lincoln Center's buzzy Michelin-starred gem, $100+",4.3,f(true,true,true,false,true,false,true,false),"https://tatiananyc.com",40.7725,-73.9836),
    v("ILIS","Fine Dining","#1 restaurant according to the list",4.8,f(true,true,true,false,false,false,true,true),"https://ilisnyc.com",40.7230,-74.0020),
    v("Double Chicken Please","Cocktail Bar","The best cocktail spot in NYC",4.8,f(false,true,true,false,false,false,false,false),"https://doublechickenplease.com",40.7258,-73.9831,"bar"),
    v("Crown Shy","New American","FiDi tasting menu powerhouse, two Michelin stars",4.6,f(true,false,true,false,true,false,true,false),"https://crownshy.com",40.7068,-74.0118),
    v("Raf's","Italian","Great vibes, NoHo favorite",4.5,f(false,false,true,false,true,false,false,false),"https://rafsnyc.com",40.7270,-73.9940),
    v("Estela","Mediterranean","Classic Nolita gem, understated and exceptional",4.6,f(false,false,true,false,true,false,true,false),"https://estelanyc.com",40.7225,-73.9950),
    v("4 Charles Prime Rib","Steakhouse","Best dinner and event spot, West Village power",4.7,f(false,false,true,false,true,false,true,false),"https://4charlesprimerib.com",40.7327,-74.0046),
    v("COQODAQ","Korean","Best Korean restaurant, highly buzzed",4.6,f(false,true,true,false,true,false,true,false),"https://coqodaqnyc.com",40.7448,-73.9870),
    v("Monkey Bar","American","Midtown power scene, Graydon Carter's celebrity haunt",4.3,f(false,false,false,true,true,false,false,false),"https://monkeybarnewyork.com",40.7576,-73.9726),
    v("Pinch Chinese","Chinese","Great Chinese",4.5,f(false,false,true,false,false,false,false,false),"https://pinchchinese.com",40.7270,-73.9940),
    v("Melba's Restaurant","American","James Beard hospitality, Harlem institution",4.6,f(false,false,false,true,false,false,false,false),"https://melbasrestaurant.com",40.8098,-73.9497),
    v("Café Chelsea","American","Amazing scene, Hotel Chelsea",4.5,f(false,false,true,false,true,false,false,false),"https://cafechelsea.com",40.7449,-74.0008),
    v("Mari","Korean Fine Dining","$100+, exceptional Korean",4.7,f(true,true,true,false,false,false,true,true),"https://marinyc.com",40.7390,-73.9980),
    v("Wildair","New American","Natural wine and small plates, excellent",4.4,f(false,false,true,false,true,false,false,true),"https://wildair.nyc",40.7198,-73.9876),
    v("Balthazar","French Brasserie","Keith McNally's SoHo brasserie, open since 1997, always packed",4.4,f(false,false,false,true,true,false,false,false),"https://balthazarny.com",40.7227,-73.9997),
    v("Maison Sun","Fine Dining","$100+ excellent fine dining experience",4.6,f(false,false,true,false,false,false,false,false),"https://maisonsunnyc.com",40.7270,-73.9940),
    v("Café Maud","Brunch","Great brunch café, $$",4.5,f(false,false,true,false,false,false,false,false),"https://cafemaud.com",40.7390,-73.9870),
    v("Carne Mare","Chophouse","Acclaimed chophouse, $100+",4.5,f(false,false,true,false,true,false,false,false),"https://carnemare.com",40.7068,-74.0118),
    v("Overstory","Cocktail Bar","Great cocktail bar, stunning views",4.3,f(false,false,true,false,true,false,false,false),"https://overstorybar.com",40.7068,-74.0118,"bar"),
    v("Nubeluz","Bar","Nice bar, the best — rooftop at The Edition",4.7,f(false,false,true,false,true,false,false,false),"https://nubeluznyc.com",40.7500,-73.9960,"bar"),
    v("Zero Bond","Private Club","Exclusive private members club, downtown hotspot",4.5,f(false,false,true,false,true,false,true,false),"https://zerobond.com",40.7270,-73.9940,"private club"),
    v("Maison Premiere","Oyster Bar","Best cocktails, legendary oyster bar and absinthe den",4.5,f(false,false,true,false,true,false,false,true),"https://maisonpremiere.com",40.7156,-73.9572,"bar"),
    v("Locanda Verde","Italian","Robert De Niro's beloved Tribeca Italian",4.5,f(false,false,false,true,true,false,false,false),"https://locandaverde.com",40.7209,-74.0086),
    v("Margot","French Italian","Chelsea gem, consistently excellent",4.6,f(false,false,true,false,false,false,false,false),"https://margotrestaurant.com",40.7470,-74.0000),
    v("Oxomoco","Mexican","Mexican 🙌🏾 — wood-fired Mexican, excellent",4.5,f(false,false,true,false,true,false,false,false),"https://oxomoconyc.com",40.7183,-73.9572),
    v("Shuka","Mediterranean","Vibrant downtown Mediterranean",4.4,f(false,false,true,false,false,false,false,false),"https://shukanyc.com",40.7240,-74.0020),
    v("Rubirosa","Italian","Classic NYC Italian pizza institution",4.5,f(false,false,false,true,true,false,false,false),"https://rubirosarestaurant.com",40.7230,-73.9970),
    v("ILIS","Fine Dining","Acclaimed tasting menu, #1 on the list",4.8,f(true,true,true,false,false,false,true,true),"https://ilisnyc.com",40.7230,-74.0020),
    v("Cafe Mogador","Mediterranean","Great local NYC spot, East Village institution",4.4,f(false,false,false,true,false,false,false,false),"https://cafemogador.com",40.7258,-73.9817),
    v("Apollo Bagels","Bagels","Best bagels in NYC",4.8,f(false,true,true,false,false,false,false,false),"https://apollobagels.com",40.7260,-73.9990),
    v("Rule of Thirds","Japanese Sushi","Good sushi, Greenpoint gem",4.5,f(false,false,true,false,false,false,false,false),"https://ruleofthirds.com",40.7305,-73.9563,"sushi"),
    v("Il Mulino Prime","Italian","Classic Il Mulino power Italian",4.4,f(false,false,false,true,true,false,false,false),"https://ilmulinoprime.com",40.7327,-74.0046),
    v("Casa Susanna","French","Charming West Village French",4.5,f(false,false,true,false,false,false,false,false),"https://casasusannanyc.com",40.7327,-74.0046),
    v("Cafe Mogador","Mediterranean","Great local NYC spot, East Village institution",4.4,f(false,false,false,true,false,false,false,false),"https://cafemogador.com",40.7258,-73.9817),
    v("Thirteen Water","Sushi Omakase","Best priced omakase in NYC",4.6,f(false,true,true,false,false,false,false,false),"https://thirteenwater.com",40.7580,-73.9700,"sushi"),
    v("Crown Shy","New American","FiDi powerhouse tasting menu",4.6,f(true,false,true,false,true,false,true,false),"https://crownshy.com",40.7068,-74.0118),
    v("Sogno Toscano","Wine Bar","Best wine bar, $$",4.9,f(false,false,true,false,false,false,false,true),"https://sognotoscano.com",40.7580,-73.9700,"bar"),
    v("Joe's Shanghai","Chinese","Classic NYC Chinese, soup dumplings",4.3,f(false,false,false,true,false,false,false,false),"https://joeshanghairestaurants.com",40.7230,-73.9970),
    v("THE GRILL","American","Power lunch institution in the Four Seasons landmark space",4.6,f(false,false,false,true,true,false,false,true),"https://thegrillnewyork.com",40.7569,-73.9726),
    v("Miznon","Israeli","Fun Israeli street food, always packed",4.4,f(false,false,true,false,false,false,false,false),"https://miznonnyc.com",40.7260,-73.9990),
    v("Nom Wah Tea Parlor","Dim Sum","Chinatown dim sum institution since 1920",4.3,f(false,false,false,true,false,false,false,false),"https://nomwah.com",40.7143,-73.9994),
    v("Joe's Pizza","Pizza","Best pizza in NYC, West Village institution",4.6,f(false,false,false,true,true,false,false,false),"https://joespizzanyc.com",40.7327,-74.0046),
    v("Russ & Daughters","Deli","Best bagels and smoked fish, LES institution since 1914",4.6,f(false,false,false,true,true,false,false,false),"https://russanddaughters.com",40.7226,-73.9873),
    v("Torrisi","Italian","Best Italian restaurant, NoLita power dining",4.6,f(false,false,true,false,true,false,true,false),"https://torrisirestaurant.com",40.7232,-73.9980),
    v("Don Angie","Italian","Best Italian, creative red-sauce, Michelin starred",4.8,f(true,false,true,false,false,false,true,false),"https://donangie.com",40.7354,-74.0065),
    v("Misi","Italian","Best Italian restaurant, Missy Robbins' pasta destination",4.7,f(false,false,true,false,false,false,true,false),"https://misinyc.com",40.7183,-73.9572),
    v("Lilia","Italian","Best Italian, Missy Robbins' pasta temple",4.7,f(false,false,true,false,false,false,true,false),"https://lilianewyork.com",40.7183,-73.9572),
    v("Estela","Mediterranean","Classic Nolita gem, understated and exceptional",4.6,f(false,false,true,false,true,false,true,false),"https://estelanyc.com",40.7225,-73.9950),
    v("Wildair","New American","Natural wine and small plates, excellent",4.4,f(false,false,true,false,true,false,false,true),"https://wildair.nyc",40.7198,-73.9876),
    v("Via Carota","Italian","West Village gem, best cacio e pepe in the city",4.4,f(false,false,false,true,true,false,true,false),"https://viacarota.com",40.7329,-74.0026),
    v("Per Se","French-American","Thomas Keller's NYC flagship — super tough resy but great food, three stars",4.5,f(true,false,false,true,true,false,true,true),"https://perseny.com",40.7685,-73.9821),
    v("Sushi Nakazawa","Japanese Omakase","Legendary West Village omakase, 20 courses, $100+",4.5,f(true,false,false,true,true,false,true,true),"https://sushinakazawa.com",40.7329,-74.0031,"sushi"),
    v("Il Buco Alimentari","Italian","Great dinner, $$, NoHo gem",4.5,f(false,false,true,false,true,false,false,true),"https://ilbuco.com",40.7270,-73.9940),
    v("Mamo","Italian","Great dinner spot, $100+",4.4,f(false,false,true,false,true,false,false,false),"https://mamonyc.com",40.7255,-73.9988),
    v("Sant Ambroeus Lafayette","Italian","Best lunch spot, SoHo Milanese institution",4.4,f(false,false,true,false,true,false,false,false),"https://santambroeus.com",40.7233,-74.0020),
    v("Boqueria Soho","Spanish","Great lunch spot, tapas, $$",4.6,f(false,false,true,false,false,false,false,false),"https://boquerianyc.com",40.7225,-73.9975),
    v("Altro Paradiso","Italian","Great lunch spot, $50-100",4.4,f(false,false,true,false,true,false,false,false),"https://altroparadiso.com",40.7449,-74.0028),
    v("Charlie Bird","Italian","Good dinner spot with great music, $50-100",4.4,f(false,false,true,false,true,true,false,false),"https://charliebirdnyc.com",40.7240,-74.0020),
    v("Jack's Wife Freda","Mediterranean","Great lunch spot, always packed, $$",4.4,f(false,false,true,false,false,false,false,false),"https://jackswife.com",40.7225,-74.0010),
    v("Lure Fishbar","Seafood","Great fish for lunch and dinner, $100+",4.4,f(false,false,true,false,true,false,false,false),"https://lurefishbar.com",40.7227,-73.9997),
    v("L'Artusi","Italian","Lunch spot, $50-100",4.6,f(false,false,true,false,true,false,false,false),"https://lartusi.com",40.7327,-74.0046),
    v("Upland","American","Lunch spot, $$$",4.5,f(false,false,true,false,true,false,false,false),"https://uplandnyc.com",40.7420,-73.9872),
    v("Cookshop","American","Popular brunch, $$$",4.5,f(false,false,true,false,false,false,false,false),"https://cookshopny.com",40.7449,-74.0028),
    v("Zou Zou's","Mediterranean","$100+, Columbus Circle Mediterranean",4.4,f(false,false,true,false,false,false,false,false),"https://zouzousnyc.com",40.7685,-73.9821),
    v("Carne Mare","Chophouse","$100+, downtown chophouse",4.5,f(false,false,true,false,true,false,false,false),"https://carnemare.com",40.7068,-74.0118),
    v("Hearth","Northern Italian","Great dinner spot, $$",4.5,f(false,false,false,true,false,false,false,false),"https://restauranthearth.com",40.7260,-73.9810),
    v("Vic's","Italian","$50-100, NoHo Italian gem",4.6,f(false,false,true,false,false,false,false,false),"https://vicsnyc.com",40.7270,-73.9940),
    v("Jajaja Mexicana","Vegan Mexican","Excellent plant-based Mexican, $$",4.6,f(false,false,true,false,false,false,false,false),"https://jajajamexicana.com",40.7327,-74.0046),
    v("Spicy Moon Bowery","Vegan Sichuan","Vegan Sichuan, spicy and excellent",4.5,f(false,false,true,false,false,false,false,false),"https://spicymoonnyc.com",40.7247,-73.9929),
    v("Indochine","Vietnamese","Nice Vietnamese, NoHo celebrity scene",4.3,f(false,false,true,false,true,false,false,false),"https://indochinenyc.com",40.7270,-73.9940),
    v("Wayla","Thai","$50-100, excellent Thai",4.5,f(false,false,true,false,false,false,false,false),"https://waylanyc.com",40.7198,-73.9876),
    v("Cervo's","Seafood","LES gem, natural wine and seafood, $$$",4.5,f(false,false,true,false,false,false,false,true),"https://cervosnyc.com",40.7198,-73.9876),
    v("One White Street","American","$100+, Tribeca farm-to-table",4.4,f(false,false,true,false,false,false,false,false),"https://onewhitestreet.com",40.7190,-74.0060),
    v("Chinese Tuxedo","Chinese","Chinatown banquet, beautiful space",4.4,f(false,false,true,false,true,false,false,false),"https://chinesetuxedo.com",40.7143,-73.9994),
    v("The Polo Bar","American","Ralph Lauren's power dining room, $100+",4.4,f(false,false,false,true,true,false,true,false),"https://ralphlauren.com/the-polo-bar",40.7638,-73.9740),
    v("Emilio's Ballato","Italian","$50-100, NoLita Italian",4.1,f(false,false,false,true,true,false,false,false),"https://emiliosballato.com",40.7232,-73.9980),
    v("Mēdüzā","Mediterranean","$100+, Med with stunning decor",4.0,f(false,false,true,false,false,false,false,false),"https://meduzanyc.com",40.7580,-73.9700),
    v("Nami Nori West Village","Sushi","$50-100, hand roll bar",4.4,f(false,false,true,false,false,false,false,false),"https://naminori.com",40.7327,-74.0046,"sushi"),
    v("Grand Banks","Oyster Bar","Great for happy hour, $50-100, Hudson River boat",4.3,f(false,false,true,false,true,false,false,false),"https://grandbanks.nyc",40.7290,-74.0120,"bar"),
    v("Duomo51","Italian","$50-100, excellent Italian",4.6,f(false,false,true,false,false,false,false,false),"https://duomo51.com",40.7580,-73.9700),
    v("Ume","Japanese","Authentic Japanese, $100+",4.3,f(false,false,true,false,false,false,false,false),"https://umenyc.com",40.7480,-73.9870),
    v("Fiaschetteria Pistoia","Italian","$$, West Village Italian gem",4.4,f(false,false,true,false,false,false,false,false),"https://fiaschetteriapistoia.com",40.7327,-74.0046),
    v("Quique Crudo","Mexican","Incredible Mexican, $100+",4.6,f(false,true,true,false,false,false,true,false),"https://quiquecrudo.com",40.7240,-73.9980),
    v("Bleecker Street Pizza","Pizza","Great pizza",4.4,f(false,false,false,true,false,false,false,false),"https://bleeckerstreetpizza.com",40.7327,-74.0046),
    v("Prince Street Pizza","Pizza","Best pizza, NoLita",4.5,f(false,false,false,true,false,false,false,false),"https://princestreetpizza.com",40.7232,-73.9980),
    v("Bleecker Street Pizza","Pizza","Great pizza",4.4,f(false,false,false,true,false,false,false,false),"https://bleeckerstreetpizza.com",40.7327,-74.0046),
    v("John's of Bleecker Street","Pizza","Best pizza, coal-fired NYC institution",4.5,f(false,false,false,true,true,false,false,false),"https://johnsbrickovenpizza.com",40.7327,-74.0046),
    v("Cello's Pizzeria","Pizza","Great slice, $1-10",4.8,f(false,false,false,true,false,false,false,false),"https://cellosnypizza.com",40.7580,-73.9700),
    v("Mama's TOO! West Village","Pizza","Great pizza, $10-20",4.3,f(false,false,true,false,false,false,false,false),"https://mamastoo.com",40.7327,-74.0046),
    v("L'industrie Pizzeria","Pizza","Great pizza slice, West Village and Williamsburg",4.7,f(false,false,true,false,false,false,false,false),"https://lindustriepizzeria.com",40.7327,-74.0046),
    v("Popup Bagels","Bagels","Best bagel, $10-20",4.5,f(false,true,true,false,false,false,false,false),"https://popupbagels.com",40.7327,-74.0046),
    v("Dominique Ansel Bakery","Bakery","Cronut birthplace, good bakery, $10-20",4.3,f(false,false,false,true,true,false,false,false),"https://dominiqueansel.com",40.7260,-74.0020),
    v("Sunday Morning","Bakery","Great bakery, $10-20",4.5,f(false,false,true,false,false,false,false,false),"https://sundaymorningnyc.com",40.7327,-74.0046),
    v("Tall Poppy","Bakery","Great croissant, $1-10",4.7,f(false,false,true,false,false,false,false,false),"https://tallpoppybakery.com",40.7270,-73.9940),
    v("Chez Ma Tante","Bistro","Best pancakes, beloved Greenpoint bistro",4.4,f(false,false,true,false,false,false,false,false),"https://chezmatantenyc.com",40.7305,-73.9563),
    v("Walter's","American","Best French fries in the world, $$",4.4,f(false,false,true,false,false,false,false,false),"https://waltersfort.com",40.6900,-73.9900),
    v("Ornithology Jazz Club","Jazz","Best jazz bar, $20-30",4.7,f(false,false,true,false,false,true,false,false),"https://ornithologyjazz.com",40.7183,-73.9572,"bar"),
    v("Birdland Jazz Club","Jazz","Fun jazz club, $$$",4.7,f(false,false,false,true,false,true,false,false),"https://birdlandjazz.com",40.7595,-73.9915,"bar"),
    v("Nublu","Live Music","Live music venue, $$",4.5,f(false,false,true,false,false,true,false,false),"https://nublu.net",40.7258,-73.9817,"bar"),
    v("St. Mazie Bar","Live Music","Good dinner and date night, $$",4.5,f(false,false,true,false,false,true,false,false),"https://stmaziebarnyc.com",40.7128,-73.9613,"bar"),
    v("Comedy Cellar","Comedy Club","NYC's most legendary comedy club, $$$",4.8,f(false,false,false,true,true,false,false,false),"https://comedycellar.com",40.7307,-74.0008,"bar"),
    // Bars & Cocktail Spots
    v("Bar Miller","Japanese Omakase","Great omakase — rosella, $100+",4.9,f(false,true,true,false,false,false,true,true),"https://barmillernyc.com",40.7183,-73.9572,"sushi"),
    v("Sushidokoro Mekumi","Sushi","Amazing sushi, $100+",4.4,f(false,false,true,false,false,false,true,true),"https://mekuminyc.com",40.7580,-73.9700,"sushi"),
    v("YUGIN","Japanese","Masa-level Japanese, $100+",4.8,f(true,false,true,false,false,false,true,true),"https://yuginnyc.com",40.7580,-73.9700),
    v("Moody Tongue Sushi","Sushi","Good beer and sushi, $100+",4.3,f(false,false,true,false,false,false,false,false),"https://moodytongue.com",40.7580,-73.9700,"sushi"),
    v("Sushi by Scratch","Sushi","Outstanding omakase experience, $100+",4.5,f(true,false,true,false,false,false,true,true),"https://sushybyscratch.com",40.7580,-73.9716,"sushi"),
    v("Maki Kosaka","Sushi","Incredible sushi must try hand rolls, $50-100",4.6,f(false,true,true,false,false,false,true,true),"https://makikosaka.com",40.7258,-73.9817,"sushi"),
    v("KOMA Sushi","Sushi","Every Monday omakase tuna tasting, $100+",4.6,f(false,true,true,false,false,false,true,true),"https://komasushi.com",40.7270,-73.9940,"sushi"),
    v("KOSAKA","Sushi","Best ramen and Michelin sushi, $100+",4.5,f(true,false,true,false,false,false,true,true),"https://kosaka-nyc.com",40.7327,-74.0046,"sushi"),
    v("Shogun Omakase","Japanese","$100+, acclaimed omakase",4.7,f(true,false,true,false,false,false,true,true),"https://shogunomakase.com",40.7580,-73.9700,"sushi"),
    v("Tsumo UWS","Sushi","Amazing tuna omakase, $50-60",4.8,f(false,true,true,false,false,false,true,true),"https://tsumouws.com",40.7792,-73.9821,"sushi"),
    v("Sanyuu West","Sushi","Great $78 omakase",4.7,f(false,true,true,false,false,false,true,true),"https://sanyuunyc.com",40.7580,-73.9700,"sushi"),
    v("Sushi Oku","Sushi","Great sushi, $100+",4.8,f(false,true,true,false,false,false,true,true),"https://sushioku.com",40.7580,-73.9700,"sushi"),
    v("noda","Sushi","Great sushi and cocktails, $100+",4.7,f(false,true,true,false,false,false,true,true),"https://nodanyc.com",40.7270,-73.9940,"sushi"),
    v("icca","Japanese","Good sushi, $100+",4.5,f(false,false,true,false,false,false,true,true),"https://iccanyc.com",40.7580,-73.9700,"sushi"),
    v("Tatsuda Omakase","Sushi","$100+, excellent omakase",4.8,f(true,false,true,false,false,false,true,true),"https://tatsudaomakase.com",40.7580,-73.9700,"sushi"),
    v("Shota omakase","Sushi","$100+, intimate omakase",4.6,f(false,false,true,false,false,false,true,true),"https://shotaomakase.com",40.7270,-73.9940,"sushi"),
    v("Nakaji","Japanese Omakase","Hidden Chinatown alley omakase, extraordinary",4.4,f(true,false,false,false,false,false,true,true),"https://nakajinyc.com",40.7163,-73.9971,"sushi"),
    v("Sushi Yasuda","Japanese","Amazing sushi, Midtown classic, $100+",4.4,f(false,false,false,true,true,false,false,true),"https://sushiyasuda.com",40.7525,-73.9715,"sushi"),
    v("Blue Ribbon Sushi","Japanese","Great sushi, late-night institution",4.6,f(false,false,false,true,true,false,false,false),"https://blueribbonrestaurants.com",40.7255,-74.0020,"sushi"),
    v("Noz 17","Sushi","$100+, Sushi Noz team",4.4,f(false,false,true,false,false,false,true,true),"https://noz17.com",40.7741,-73.9635,"sushi"),
    // Bars
    v("Superbueno","Cocktail Bar","The best cocktail bar in NYC",4.2,f(false,true,true,false,false,false,false,false),"https://superbuenobar.com",40.7480,-73.9870,"bar"),
    v("yakuni","Japanese Speakeasy","Japanese speakeasy",4.8,f(false,true,true,false,false,false,false,false),"https://yakunibar.com",40.7580,-73.9700,"bar"),
    v("StEight","Secret Speakeasy","Secret Japanese speakeasy behind KUNIYA HAIR, $20-30",4.8,f(false,true,true,false,false,false,true,false),"https://steight.nyc",40.7580,-73.9700,"bar"),
    v("TEN11 LOUNGE","Cocktail Bar","Fun cocktail bar, NoMad, $100+",4.7,f(false,false,true,false,true,false,false,false),"https://ten11lounge.com",40.7448,-73.9870,"bar"),
    v("Fradei Bistro","French Wine Bar","Great wine bar, $100+",4.7,f(false,false,true,false,false,false,false,true),"https://fradeibistro.com",40.7580,-73.9700,"bar"),
    v("Overstory","Cocktail Bar","Great cocktail bar, stunning high-rise views",4.3,f(false,false,true,false,true,false,false,false),"https://overstorybar.com",40.7068,-74.0118,"bar"),
    v("82 Stanton","Bar","$20-30, great LES bar",4.4,f(false,false,true,false,false,false,false,false),"https://82stanton.com",40.7198,-73.9876,"bar"),
    v("Centurion New York","Lounge","Amex Centurion lounge, $100+",4.5,f(false,false,false,true,true,false,false,true),"https://americanexpress.com",40.7545,-73.9878,"bar"),
    v("Do Not Disturb","Seafood Bar","Good bar, $50-100",4.6,f(false,false,true,false,false,false,false,false),"https://donotdisturbnyc.com",40.7460,-73.9870,"bar"),
    v("Strong Rope Brewery","Brewpub","Great views, Red Hook brewpub",4.7,f(false,false,true,false,false,false,false,false),"https://strongropebrewery.com",40.6762,-74.0155,"bar"),
    v("The Champagne & Caviar Bar at RH","Champagne Bar","Underground champagne bar at RH Guesthouse",4.8,f(false,true,true,false,true,false,true,true),"https://rh.com/guesthouse",40.7380,-74.0050,"bar"),
    v("Clemente Bar","Cocktail Bar","Eleven Madison Park bar — great bar",4.7,f(false,false,true,false,true,false,false,false),"https://clementebar.com",40.7416,-73.9872,"bar"),
    v("Undercote","Cocktail Bar","Cote's subterranean speakeasy, great cocktail bar",4.6,f(false,false,true,false,true,false,false,false),"https://cotenyc.com",40.7397,-73.9927,"bar"),
    v("The Portrait Bar","Cocktail Bar","Very good cocktails and great vibe",4.5,f(false,false,true,false,true,false,false,false),"https://theportraitbar.com",40.7620,-73.9740,"bar"),
    v("Little Branch","Cocktail Bar","Great jazz music, speakeasy, $$$",4.4,f(false,false,false,true,false,true,false,false),"https://littlebranchnyc.com",40.7338,-74.0056,"bar"),
    v("Le Chêne","French Bar","New date spot, $100+",4.4,f(false,true,true,false,false,false,false,false),"https://lechene.nyc",40.7580,-73.9700,"bar"),
    v("Pen Top","Rooftop Lounge","Very nice rooftop bar, $$",4.3,f(false,false,true,false,true,false,false,false),"https://pentopbar.com",40.7544,-73.9840,"rooftop"),
    v("Lai Rai","Wine Bar","$10-20, nice wine bar",4.8,f(false,false,true,false,false,false,false,false),"https://lairainyc.com",40.7270,-73.9940,"bar"),
    v("Moonflower","Wine Bar","$30-50, great wine bar",4.5,f(false,false,true,false,false,false,false,true),"https://moonflowerwinebar.com",40.7270,-73.9940,"bar"),
    v("Parcelle Chinatown","Wine Bar","Nice wine bar, Chinatown",4.5,f(false,false,true,false,false,false,false,true),"https://parcellenyc.com",40.7143,-73.9994,"bar"),
    v("schmuck.","Bar","Amazing bar, $30-50",4.3,f(false,false,true,false,false,false,false,false),"https://schmuckbar.com",40.7270,-73.9940,"bar"),
    v("Alba Accanto","Cocktail Bar","$50-100, excellent cocktails",4.7,f(false,false,true,false,false,false,false,false),"https://albaaccanto.com",40.7270,-73.9940,"bar"),
    v("Bar Pisellino","Italian Bar","Great Italian cocktails and people watching",4.1,f(false,false,true,false,true,false,false,false),"https://barpisellino.com",40.7329,-74.0026,"bar"),
    v("Katana Kitten","Cocktail Bar","Good cocktails, World's 50 Best Bar",4.5,f(false,false,true,false,false,false,false,false),"https://katanakittennyc.com",40.7338,-74.0056,"bar"),
    v("Double Chicken Please","Cocktail Bar","The best cocktail spot in NYC",4.8,f(false,true,true,false,false,false,false,false),"https://doublechickenplease.com",40.7258,-73.9831,"bar"),
    v("Dante NYC","Cocktail Bar","Best Negroni in NYC, World's 50 Best Bar",4.5,f(false,false,false,true,true,false,false,false),"https://dante-nyc.com",40.7303,-74.0018,"bar"),
    v("Sake Bar Decibel","Sake Bar","Best sake bar, $20-30",4.4,f(false,false,false,true,false,false,false,true),"https://sakebardecibel.com",40.7258,-73.9832,"bar"),
    v("Lobby Bar at Hotel Chelsea","Hotel Bar","Hit the bar, it's amazing",4.5,f(false,false,true,false,true,false,false,false),"https://hotelchelsea.com",40.7449,-74.0008,"bar"),
    v("JIMMY","Rooftop Bar","James Hotel rooftop, great views",4.3,f(false,false,true,false,true,false,false,false),"https://jimmysoho.com",40.7260,-74.0030,"rooftop"),
    v("Kissa Kissa","Cocktail Bar","$20-30, great cocktail bar",4.8,f(false,true,true,false,false,false,false,false),"https://kissakissanyc.com",40.7258,-73.9817,"bar"),
    v("Yawning Cobra","Cocktail Bar","Great Japanese cocktail bar, $50-100",4.7,f(false,false,true,false,false,false,false,true),"https://yawningcobranyc.com",40.7270,-73.9940,"bar"),
    v("Bar Bonobo","Cocktail Bar","Fun spot",4.4,f(false,false,true,false,false,false,false,false),"https://barbonobo.com",40.7270,-73.9940,"bar"),
    v("Jac's on Bond","Cocktail Bar","Fun cocktail bar, $50-100",4.1,f(false,false,true,false,false,false,false,false),"https://jacsonbond.com",40.7270,-73.9940,"bar"),
    v("Patent Pending","Speakeasy","Great speakeasy, $20-30",4.4,f(false,false,true,false,false,false,false,false),"https://patentpendingnYC.com",40.7500,-73.9960,"bar"),
    v("Nubeluz","Rooftop Bar","Nice bar, the best — The Edition rooftop",4.7,f(false,false,true,false,true,false,false,false),"https://nubeluznyc.com",40.7500,-73.9960,"rooftop"),
    v("All Night Skate","Bar","Great bar",4.5,f(false,false,true,false,false,false,false,false),"https://allnightskate.com",40.7270,-73.9940,"bar"),
    v("Joyface","Bar","Austin Powers vibes, fun bar",3.3,f(false,false,true,false,false,false,false,false),"https://joyfacebar.com",40.7270,-73.9940,"bar"),
    v("Accidental Bar","Bar","Great sake and vibes",4.9,f(false,true,true,false,false,false,false,false),"https://accidentalbar.com",40.7270,-73.9940,"bar"),
    v("Marsanne","Rooftop Bar","Great rooftop",4.5,f(false,false,true,false,false,false,false,false),"https://marsannenyc.com",40.7270,-73.9940,"rooftop"),
    v("Della's","Wine Bar","Nice wine bar",4.5,f(false,false,true,false,false,false,false,true),"https://dellasnyc.com",40.7270,-73.9940,"bar"),
    v("Silver Lining Lounge","Piano Bar","Nice piano bar",4.5,f(false,false,true,false,false,true,false,false),"https://silverloungenyc.com",40.7270,-73.9940,"bar"),
    v("Eavesdrop","Bar","$$, great neighborhood bar",4.4,f(false,false,true,false,false,false,false,false),"https://eavesdropnyc.com",40.7270,-73.9940,"bar"),
    v("St Jardim","Wine Bar","Nice wine bar",4.5,f(false,false,true,false,false,false,false,true),"https://stjardimnyc.com",40.7270,-73.9940,"bar"),
    v("Nine Cases","Wine Bar","Really nice wine bar spot, $20-30",4.7,f(false,false,true,false,false,false,false,true),"https://ninecasesnyc.com",40.7270,-73.9940,"bar"),
    v("Cherry on Top","Wine Bar","Great wine bar",4.6,f(false,false,true,false,false,false,false,true),"https://cherryontopnyc.com",40.7270,-73.9940,"bar"),
    v("Frog","Wine Bar","Great wine bar, $20-30",4.2,f(false,false,true,false,false,false,false,false),"https://frogwinebar.com",40.7270,-73.9940,"bar"),
    v("Cellar 36","Wine Bar","Fun wine bar, $20-30",4.7,f(false,false,true,false,false,false,false,false),"https://cellar36nyc.com",40.7270,-73.9940,"bar"),
    v("Botanica Bar","Bar","$10-20, chill bar",4.3,f(false,false,true,false,false,false,false,false),"https://botanicabar.com",40.7270,-73.9940,"bar"),
    v("Cafe Luxembourg","French","Beloved UWS French brasserie",4.4,f(false,false,false,true,true,false,false,false),"https://cafeluxembourg.com",40.7792,-73.9821),
    v("Midnight Blue","Cocktail Bar","Good jazz",4.4,f(false,false,true,false,false,true,false,false),"https://midnightblue.nyc",40.7270,-73.9940,"bar"),
    v("Café Carlyle","Supper Club","Legendary cabaret, $100+",4.5,f(false,false,false,true,true,true,false,false),"https://rosewoodhotels.com/the-carlyle-new-york/dining/cafe-carlyle",40.7740,-73.9637,"bar"),
    v("Sorate","Japanese Tea House","Great Japanese tea house",4.3,f(false,false,true,false,false,false,false,true),"https://soratenyc.com",40.7580,-73.9700),
    v("Bibliothèque","Wine Bar","Nice vibe, $10-20",4.3,f(false,false,true,false,false,false,false,false),"https://bibliotheque.nyc",40.7580,-73.9700,"bar"),
    v("All Blues","Bar","Nice vinyl bar",4.5,f(false,false,true,false,false,true,false,false),"https://allbluesnyc.com",40.7270,-73.9940,"bar"),
    v("HOUSE Brooklyn","Japanese French","Japanese French omakase, $100+",4.8,f(true,false,true,false,false,false,true,true),"https://housebrooklyn.com",40.6834,-73.9654),
    v("Laser Wolf Brooklyn","Israeli","Great rooftop, $100+",4.2,f(false,false,true,false,true,false,false,false),"https://laserwolfbrooklyn.com",40.7128,-73.9613),
    v("divya's kitchen","Vegetarian","Kristina's pick, $20-30",4.6,f(false,false,true,false,false,false,false,false),"https://divyaskitchen.com",40.7258,-73.9832),
    v("Russ & Daughters Cafe","American","Lower East Side institution, best smoked fish in America",4.6,f(false,false,false,true,true,false,false,false),"https://russanddaughterscafe.com",40.7226,-73.9873),
    v("TONCHIN NEW YORK","Ramen","Best Michelin ramen, $20-30",4.6,f(true,false,true,false,false,false,false,false),"https://tonchin.com",40.7390,-73.9870),
    v("Kame","Ramen","Good ramen, $20-30",4.7,f(false,false,true,false,false,false,false,false),"https://kame-ramen.com",40.7390,-73.9870),
    v("Cocoron","Soba","Great soba noodles, $20-30",4.4,f(false,false,true,false,false,false,false,false),"https://cocoronnyc.com",40.7198,-73.9876),
    v("New Wonjo","Korean BBQ","Korean BBQ, $$",4.3,f(false,false,true,false,false,false,false,false),"https://newwonjo.com",40.7500,-73.9960),
    v("House of Joy","Dim Sum","Good dim sum, $20-30",4.1,f(false,false,true,false,false,false,false,false),"https://houseofjoynyc.com",40.7143,-73.9994),
    v("Lysée","Dessert","Good dessert, Korean pastry shop",4.4,f(false,true,true,false,false,false,false,false),"https://lyseeny.com",40.7448,-73.9870),
  ],

}

// ── Private Dining Room data ─────────────────────────────────────────────────
const PDR_DATA = {
  "NYC": {
    "Le Bernardin": "Les Salons Bernardin (above main room, overlooks 51st St): 2 rooms, up to 36 seated combined. Full buyout available. events@le-bernardin.com / (212) 554-1515",
    "Eleven Madison Park": "3 PDRs: Room A (18 seated, floor-to-ceiling windows overlooking dining room), Room B (34 seated, Sol LeWitt installation), Room C (50 seated). Full buyout available. events@elevenmadisonpark.com",
    "Per Se": "East Room: up to 10 seated, overlooks Central Park. West Room: up to 66 seated / 120 standing, Parisian living room design. Full buyout: 88 seated / 350 standing. thomaskeller.com/perseny/private-dining",
    "Gramercy Tavern": "PDR: up to 20 seated, single artisan table, wood-beamed ceiling (Maine artisan Greg Lipton). Full restaurant buyout available. privatedining@gramercytavern.com",
    "Daniel": "Bellecour Room: up to 90 seated / 150 standing, natural light from East 65th St windows. Chef's Table: up to 4 guests. Full buyout: 150 seated. Contact Jean Christophe Le Picart: (212) 737-2224",
    "Gabriel Kreuther": "Two combinable PDRs: 8–150 guests. In-Kitchen Table: up to 8 guests (immersive experience). Events@gknyc.com",
    "Atomix": "Chef's Counter buyout: up to 15 guests (full tasting menu + beverage). Bar Experience: up to 6 guests semi-private upstairs. 2 months' notice requested. atomixnyc.com/private-events",
    "Carbone": "Full restaurant buyout: up to 100 guests. Contact restaurant directly — notoriously selective. carbonenewyork.com",
    "La Tête d'Or": "Private dining available in elegant spaces at One Madison. Contact restaurant directly. latetedorbydaniel.com",
    "Tatiana by Kwame Onwuachi": "Private dining at Lincoln Center; contact restaurant for buyout options. tatiananyc.com",
    "Cote": "Undercote (subterranean speakeasy): dramatic private dining for groups. Full restaurant: up to 100 for corporate events. reservation@cotenyc.com",
    "The Grill": "Historic Four Seasons landmark space; multiple private rooms. Contact restaurant directly. thegrillnewyork.com",
    "Masa": "Full counter buyout for private events. Contact restaurant directly. masanyc.com",
    "Sushi Nakazawa": "Full counter buyout for private omakase events. Contact restaurant directly. sushinakazawa.com",
    "Sushi Noz": "Full counter buyout for private events; 2 Michelin stars. Contact restaurant directly. sushinoz.com",
    "Don Angie": "Contact restaurant for private dining and buyout options. donangie.com",
    "Lilia": "Full restaurant buyout available; contact restaurant directly. lilianewyork.com",
    "Frenchette": "Contact restaurant for private dining options. frenchetteny.com",
    "The Core Club": "Private members club — events and dining for members and approved guests only. thecoreclub.com",
    "Casa Tua NYC": "Members club with main dining room open to public; private events for members. casatualifestyle.com/new-york",
    "Rao's": "No private room; tables are semi-permanently assigned to regulars. Full buyout theoretically possible — contact directly. raos.com",
    "Monkey Bar": "Semi-private spaces available for groups; contact restaurant. monkeybarnewyork.com",
    "The Grill": "Historic Four Seasons Seagram Building space; multiple rooms. thegrillnewyork.com",
  },
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
  },
  "Menlo Park": {
    "Madera": "Two private dining rooms with private terraces and fireplaces. Lemon Room: up to 10 guests. Orange Room: up to 14–16 guests. Both overlook Santa Cruz mountains. events@rosewoodhotels.com",
    "Village Pub": "Three private dining rooms + outdoor veranda. Rooms accommodate 12, 24, and 48. Full buyout up to 120. thevillagepub.net/private-dining",
    "LB Steak": "Chef's Table: 18 guests. Meritage Room (PDR with French chandelier + stone fireplace): 36 guests. Contact: jegi@lbsteak.com / 408.244.1180",
    "Camper": "Maverick Room: 24 seated. Ridgeline Room: 14 seated. Full buyout available. hello@campermp.com",
    "Donato Enoteca": "Colleoni Room: 70 guests (AV setup). Gaja Room: 24. Salsa Donizetti Room: 12. Enoteca Patio: 30. 3–5 course preset menus. Contact restaurant directly.",
    "Flea St. Cafe": "Intimate restaurant inside a house; contact for buyout options.",
    "Refuge": "Casual sandwich/beer spot; no private room. Contact for large group options.",
    "Robin Menlo Park": "Private dining room seats up to 7 (exclusive omakase experience, one seating/night, $309pp). Full restaurant buyout also available. robinomakase.com/events",
    "Naomi Sushi": "Contact restaurant directly for private event options.",
    "Sushi Sus": "Intimate omakase counter; contact for full buyout.",
    "Bucks of Woodside": "Iconic power breakfast diner; no dedicated PDR. Contact for large group seating.",
  },
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
  "Palo Alto": {
    "Evvia Estiatorio": "Outdoor Patio (canopied, heated, rustic): up to 40 seated. Indoor Dining Room (fireplace, bar, open oven): up to 80 seated. Full restaurant buyout: up to 130 guests. (650) 326-0983. evvia.net",
    "Baumé": "Intimate tasting menu restaurant; full buyout available for private events. Contact restaurant directly. maisonbaume.com",
    "Protégé": "Contact restaurant for private dining and buyout options. protegepa.com",
    "Ettan": "Contact restaurant for private dining. ettanrestaurant.com",
    "Horsefeather": "Private area available for groups up to ~30. Contact restaurant. horsefeatherpa.com",
    "RH Rooftop Restaurant": "Restaurant accepts larger parties; outdoor terraces with fire pits available. Contact restaurant for event buyouts. rh.com/us/en/paloalto/restaurant",
    "Tamarine": "Contact restaurant for private dining and large group options. tamarinerestaurant.com",
    "Sushi Sus": "Intimate omakase counter; full buyout available for private events. sushisus.com",
    "Fuki Sushi": "Contact restaurant for private dining and large party options. fukisushi.com",
    "Nobu Palo Alto": "Contact restaurant for private dining and event options. noburestaurants.com/palo-alto",
  },
  "Santa Monica": {
    "Fia Restaurant": "Alexander Room: 8 seated. Adelaide Room: 12 seated. Patio buyout: available. Full restaurant buyout: up to 160 guests. Contact events team. fiarestaurant.com",
    "Fia Steak": "Two distinct dining rooms; contact for private event and buyout options. fiasteak.com",
    "Élephante": "Ocean View Balcony: up to 15 seated. Cactus Garden Room: up to 32. Full private indoor/outdoor room with bar: up to 40. elephanterestaurants.com",
    "The Penthouse at Huntley Hotel": "Available for full or partial buyouts — 130 banquet / 300 reception. 5,000+ sq ft. (310) 393-8080. penthouserestaurant.com",
    "Pasjoli": "Outdoor back patio, multi-course dinner family-style. Contact restaurant. pasjoli.com",
    "Giorgio Baldi": "Contact restaurant for private dining and buyout. giorgiobaldi.com",
    "Seline": "Contact restaurant for private events. selinela.com",
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
  },
  "Washington DC": {
    "The Occidental": "Whiskey Lounge (upstairs, secluded): 20–30 seated, ideal for discreet political gatherings. Art Deco downstairs bar available for receptions up to 60. Full 280-seat restaurant buyout available. Contact restaurant directly. theoccidentaldc.com",
    "Café Milano": "3 private rooms: Garden Room (40 seated), Library Room (50–70 seated), Europa Room (60 seated). Outdoor patio: 100 guests. 202-333-6183. cafemilano.com",
    "1789": "F. Scott's (adjoining building): Garden Room (18 seated), Middleburg Room (56 seated). No room charge; minimum applies. 202-965-1789. 1789restaurant.com",
    "Bourbon Steak DC": "Intimate VIP room: 12–30 guests seated, standing receptions up to 50. Full restaurant buyout available. Contact Four Seasons Georgetown. michaelmina.net/bourbon-steak-dc",
    "Fiola Mare": "The Mermaid Room (floor-to-ceiling lanai doors, Key Bridge + Potomac views, private patio): up to 40. The Marea Room (largest PDR, floor-to-ceiling cabana doors): up to 50 — ideal for corporate/congressional meals. The Aston Martin Room (VIP Chef's Table + private wine cellar): up to 12. Rooms can be combined. $115pp dinner / $68pp lunch minimum. (202) 525-1402. fiolamaredc.com/private-events",
    "CUT by Wolfgang Puck": "Private Dining Room: up to 22 seated. Full restaurant buyout: up to 70 guests. Contact Rosewood Georgetown. cutrestaurant.com/washington-dc",
    "Fiola": "Contact restaurant for private dining and buyout options. fioladc.com",
    "Charlie Palmer Steak": "Several private rooms with Capitol views. Groups from 10 to full buyout. Contact restaurant directly. charliepalmer.com/charlie-palmer-steak-dc",
    "The Prime Rib": "Semi-private areas available for groups. Contact restaurant directly. theprimerib.com/dc",
    "Gravitas": "Full restaurant buyout and Chef's Table available. Contact restaurant. gravitasdc.com",
    "Bresca": "Contact restaurant for private dining and buyout. brescadc.com",
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

// Patch LA/WeHo neighborhood labels
if (INITIAL_DATA["LA/WeHo"]) {
  const wehoSet = new Set([
    "Somni","Ardor","Sushisamba West Hollywood","Darling","Ladyhawk","Andys","Marvito","Coucou",
    "Merois","Catch LA","Craig's","Cecconi's West Hollywood","Night + Market WeHo","Horses",
    "Dan Tana's","Delilah","Tower Bar at Sunset Tower Hotel","Skybar at Mondrian",
    "Employees Only WeHo","Sushi Park"
  ])
  INITIAL_DATA["LA/WeHo"] = INITIAL_DATA["LA/WeHo"].map(v => ({
    ...v,
    neighborhood: wehoSet.has(v.name) ? "West Hollywood" : "Los Angeles"
  }))
}


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

function VenueCard({ v: venue, rank }) {
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
      <div style={{ marginLeft:26 }}>
        <Tags venue={venue} />
      </div>
    </div>
  )
}

const MAP_COLORS = {
  restaurant:     { pin:"#378ADD", label:"Restaurants" },
  sushi:          { pin:"#E65100", label:"Sushi" },
  bar:            { pin:"#0F6E56", label:"Bars" },
  rooftop:        { pin:"#185FA5", label:"Rooftop Bars" },
  "private club": { pin:"#6B21A8", label:"Private Clubs" },
  f1:             { pin:"#e53935", label:"F1" },
}

const A16Z_OFFICES = {
  "Menlo Park":     { lat:37.4193, lng:-122.2021, address:"2865 Sand Hill Road, Suite 101" },
  "San Francisco":  { lat:37.7765, lng:-122.3927, address:"180 Townsend Street" },
  "NYC":            { lat:40.7233, lng:-74.0007,  address:"200 Lafayette Street, 3rd & 4th Floor" },
  "Santa Monica":   { lat:34.0168, lng:-118.4914, address:"1305 2nd Street" },
  "Washington DC":  { lat:38.9015, lng:-77.0422,  address:"800 17th St NW, 6th Floor" },
}

function MapView({ venues, city }) {
  const mapRef = useRef(null)
  const instanceRef = useRef(null)
  const markersRef = useRef([])

  useEffect(() => {
    if (!window.L) {
      const script = document.createElement("script")
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
      script.onload = () => initMap()
      document.head.appendChild(script)
    } else {
      initMap()
    }
    return () => {
      if (instanceRef.current) {
        instanceRef.current.remove()
        instanceRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (instanceRef.current) updateMarkers()
  }, [venues])

  function initMap() {
    if (!mapRef.current || instanceRef.current) return
    const L = window.L
    const validVenues = venues.filter(v => v.lat && v.lng)
    if (!validVenues.length) return

    const center = [
      validVenues.reduce((s, v) => s + v.lat, 0) / validVenues.length,
      validVenues.reduce((s, v) => s + v.lng, 0) / validVenues.length,
    ]

    const map = L.map(mapRef.current, { zoomControl: true }).setView(center, 13)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "\u00a9 OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map)
    instanceRef.current = map
    updateMarkers()
  }

  function updateMarkers() {
    const L = window.L
    if (!L || !instanceRef.current) return
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    const validVenues = venues.filter(v => v.lat && v.lng)
    validVenues.forEach(v => {
      const color = (MAP_COLORS[v.category] || MAP_COLORS.restaurant).pin
      const icon = L.divIcon({
        className: "",
        html: `<div style="width:12px;height:12px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.35);"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
        popupAnchor: [0, -8],
      })
      const stars = "\u2605".repeat(Math.round(v.stars)) + "\u2606".repeat(5 - Math.round(v.stars))
      const pdrBadge = v.privateDining ? `<div style="font-size:11px;color:#6B21A8;margin-top:5px;padding:4px 6px;background:#F0E6FB;border-radius:4px">\uD83C\uDF7D PDR available</div>` : ""
      const notesBadge = v.notes ? `<div style="font-size:11px;color:#185FA5;margin-top:4px;padding:4px 6px;background:#E6F1FB;border-radius:4px">${v.notes}</div>` : ""
      const popup = `<div style="font-family:system-ui,sans-serif;min-width:180px">
        <a href="${v.url}" target="_blank" rel="noopener noreferrer" style="font-size:14px;font-weight:500;color:#111;text-decoration:none;display:block;margin-bottom:2px">${v.name}</a>
        <div style="font-size:12px;color:#666;margin-bottom:4px">${v.type}</div>
        <div style="font-size:12px;color:#BA7517">${stars} ${v.stars.toFixed(1)}</div>
        ${pdrBadge}${notesBadge}
      </div>`
      const marker = L.marker([v.lat, v.lng], { icon }).addTo(instanceRef.current).bindPopup(popup)
      markersRef.current.push(marker)
    })

    // a16z office star marker
    const office = A16Z_OFFICES[city]
    if (office) {
      const officeIcon = L.divIcon({
        className: "",
        html: `<div style="width:22px;height:22px;display:flex;align-items:center;justify-content:center;background:#111;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4);font-size:11px;color:white;line-height:1;">a16z</div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
        popupAnchor: [0, -13],
      })
      const officePopup = `<div style="font-family:system-ui,sans-serif;min-width:160px">
        <div style="font-size:13px;font-weight:500;color:#111;margin-bottom:3px">a16z Office</div>
        <div style="font-size:12px;color:#666">${office.address}</div>
      </div>`
      const officeMarker = L.marker([office.lat, office.lng], { icon: officeIcon, zIndexOffset: 1000 })
        .addTo(instanceRef.current)
        .bindPopup(officePopup)
      markersRef.current.push(officeMarker)
    }

    if (validVenues.length > 0) {
      const allPoints = [...validVenues.map(v => [v.lat, v.lng])]
      if (office) allPoints.push([office.lat, office.lng])
      const bounds = L.latLngBounds(allPoints)
      instanceRef.current.fitBounds(bounds, { padding: [40, 40] })
    }
  }

  const categoriesPresent = [...new Set(venues.map(v => v.category))].filter(c => MAP_COLORS[c])
  const hasOffice = !!A16Z_OFFICES[city]

  return (
    <div>
      <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:12, alignItems:"center" }}>
        {categoriesPresent.map(cat => (
          <div key={cat} style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, color:"#555" }}>
            <div style={{ width:10, height:10, borderRadius:"50%", background:MAP_COLORS[cat].pin, border:"1.5px solid white", boxShadow:"0 1px 3px rgba(0,0,0,0.25)" }} />
            {MAP_COLORS[cat].label}
          </div>
        ))}
        {hasOffice && (
          <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, color:"#555" }}>
            <div style={{ width:16, height:16, borderRadius:"50%", background:"#111", border:"1.5px solid white", boxShadow:"0 1px 3px rgba(0,0,0,0.25)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ fontSize:7, color:"white", fontWeight:500, letterSpacing:"-0.3px" }}>a16z</span>
            </div>
            a16z Office
          </div>
        )}
        <span style={{ fontSize:12, color:"#aaa", marginLeft:"auto" }}>{venues.filter(v => v.lat && v.lng).length} venues mapped</span>
      </div>
      <div
        ref={mapRef}
        style={{ width:"100%", height:560, borderRadius:12, border:"0.5px solid #e5e5e5", overflow:"hidden" }}
      />
    </div>
  )
}


function App() {
  const [city, setCity] = useState("Boston")
  const [activeFilters, setActiveFilters] = useState([])
  const [search, setSearch] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [data, setData] = useState(INITIAL_DATA)
  const [recentUpdates, setRecentUpdates] = useState([])
  const [lastRefresh, setLastRefresh] = useState(null)
  const [activeTab, setActiveTab] = useState("cities")


  useEffect(() => {
    const last = localStorage.getItem("lastAutoRefresh")
    const now = Date.now()
    if (!last || now - parseInt(last) > 24 * 60 * 60 * 1000) {
      runDailyRefresh().then(() => {
        localStorage.setItem("lastAutoRefresh", String(now))
      })
    }
  }, [])

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
          <h1 style={{ fontSize:22, fontWeight:500, margin:0, color:"#111" }}>Global Restaurant & Bar Guide</h1>
          <p style={{ fontSize:14, color:"#666", margin:"2px 0 0" }}>{CITIES.length} cities · {totalVenues}+ venues · restaurants, sushi, bars & private clubs</p>
        </div>
        <button onClick={runDailyRefresh} disabled={isRefreshing}
          style={{ fontSize:13, padding:"6px 14px", borderRadius:8, border:"0.5px solid #ccc", background:"transparent", color: isRefreshing ? "#aaa":"#555", cursor: isRefreshing ? "not-allowed":"pointer" }}>
          {isRefreshing ? "Refreshing...":"Daily Refresh"}
        </button>
      </div>
      {lastRefresh && <p style={{ fontSize:11, color:"#aaa", margin:"0 0 12px" }}>Last refreshed: {lastRefresh}</p>}

      <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap" }}>
        <button style={tabStyle("cities")} onClick={() => setActiveTab("cities")}>Cities</button>
        <button style={tabStyle("map")} onClick={() => setActiveTab("map")}>Map</button>
        <button style={tabStyle("lyons")} onClick={() => { setActiveTab("lyons"); setCity("Lyons NYC"); setSearch(""); setActiveFilters([]) }}>
          ⭐ Lyons NYC
        </button>
        <button style={tabStyle("updates")} onClick={() => setActiveTab("updates")}>
          Recently Updated {recentUpdates.length > 0 && <span style={{ marginLeft:4, fontSize:11, background:"#E1F5EE", color:"#0F6E56", padding:"1px 6px", borderRadius:99, fontWeight:500 }}>{recentUpdates.length}</span>}
        </button>
      </div>

      {activeTab === "lyons" ? (
        <>
          <div style={{ marginBottom:20 }}>
            <h2 style={{ fontSize:20, fontWeight:500, margin:"0 0 4px", color:"#111" }}>⭐ Lyons NYC — NYC</h2>
            <p style={{ fontSize:13, color:"#666", margin:"0 0 16px" }}>Chris Lyons' personal guide to New York City</p>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or type..."
                style={{ flex:"1 1 160px", minWidth:140, fontSize:13, padding:"6px 12px", borderRadius:8, border:"0.5px solid #ddd", color:"#111" }} />
              {FILTERS.map(f => (
                <button key={f.key} onClick={() => toggleFilter(f.key)}
                  style={{ fontSize:12, padding:"5px 12px", borderRadius:99, border:`0.5px solid ${activeFilters.includes(f.key) ? TAG_COLORS[f.key].color:"#ddd"}`, background: activeFilters.includes(f.key) ? TAG_COLORS[f.key].bg:"transparent", color: activeFilters.includes(f.key) ? TAG_COLORS[f.key].color:"#888", cursor:"pointer", fontWeight: activeFilters.includes(f.key) ? 500:400 }}>
                  {f.label}
                </button>
              ))}
            </div>
            <div style={{ marginTop:10 }}>
              <span style={{ fontSize:12, color:"#aaa" }}>{allVenues.length} venue{allVenues.length !== 1 ? "s":""}</span>
            </div>
          </div>
          {allVenues.length === 0 ? (
            <div style={{ padding:"2rem", textAlign:"center", color:"#888", fontSize:14 }}>No venues match your filters.</div>
          ) : (
            Object.entries(venuesByCategory).map(([cat, venues]) => (
              <div key={cat} style={{ marginBottom:32 }}>
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                  <h2 style={{ fontSize:16, fontWeight:500, margin:0, color:"#111" }}>
                    {cat === "sushi" ? "🍣 " : cat === "bar" ? "🍸 " : cat === "rooftop" ? "🏙️ " : cat === "private club" ? "🔑 " : ""}
                    {CATEGORY_LABELS[cat] || cat}
                  </h2>
                  <span style={{ fontSize:12, color:"#aaa" }}>{venues.length} spots</span>
                </div>
                {city === "LA/WeHo" ? (() => {
                  const laVenues = venues.filter(v => v.neighborhood !== "West Hollywood")
                  const wehoVenues = venues.filter(v => v.neighborhood === "West Hollywood")
                  return (
                    <>
                      {laVenues.length > 0 && (
                        <>
                          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                            <span style={{ fontSize:11, fontWeight:700, color:"#fff", background:"#3b82f6", borderRadius:99, padding:"3px 12px", letterSpacing:"0.05em", textTransform:"uppercase" }}>Los Angeles</span>
                            <div style={{ flex:1, height:"0.5px", background:"#e5e5e5" }} />
                          </div>
                          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:12, marginBottom: wehoVenues.length > 0 ? 20 : 0 }}>
                            {laVenues.map((venue, i) => <VenueCard key={venue.name} v={venue} rank={i+1} />)}
                          </div>
                        </>
                      )}
                      {wehoVenues.length > 0 && (
                        <>
                          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10, marginTop: laVenues.length > 0 ? 4 : 0 }}>
                            <span style={{ fontSize:11, fontWeight:700, color:"#fff", background:"#8b5cf6", borderRadius:99, padding:"3px 12px", letterSpacing:"0.05em", textTransform:"uppercase" }}>West Hollywood</span>
                            <div style={{ flex:1, height:"0.5px", background:"#e5e5e5" }} />
                          </div>
                          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:12 }}>
                            {wehoVenues.map((venue, i) => <VenueCard key={venue.name} v={venue} rank={i+1} />)}
                          </div>
                        </>
                      )}
                    </>
                  )
                })() : (
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:12 }}>
                    {venues.map((venue, i) => <VenueCard key={venue.name} v={venue} rank={i+1} />)}
                  </div>
                )}
              </div>
            ))
          )}
        </>
      ) : activeTab === "map" ? (
        <>
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:13, fontWeight:700, color:"#4b4f54", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6 }}>United States</div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:12 }}>
              {US_CITIES.map(c => {
                const isA16z = A16Z_CITY_SET.has(c)
                const isLyons = c === "Lyons NYC"
                const isActive = c === city
                return (
                  <button key={c} onClick={() => { setCity(c); setSearch("") }}
                    style={{
                      fontSize:13, padding:"5px 12px", borderRadius:99, cursor:"pointer",
                      fontWeight: isActive ? 500 : 400,
                      background: isActive
                        ? (isLyons ? "#ebebeb" : isA16z ? "#fdf0d9" : "#dbeafe")
                        : (isLyons ? "#f5f5f5" : isA16z ? "#fdf8ef" : "transparent"),
                      border: `0.5px solid ${isActive
                        ? (isLyons ? "#999999" : isA16z ? "#cf7f00" : "#3b82f6")
                        : (isLyons ? "#d1d1d1" : isA16z ? "#e8c47a" : "#ddd")}`,
                      color: isActive
                        ? (isLyons ? "#111111" : isA16z ? "#7a4a00" : "#1d4ed8")
                        : (isLyons ? "#666666" : isA16z ? "#9a5f00" : "#666"),
                    }}>
                    {c === "Lyons NYC" ? "⭐ Lyons NYC" : c}
                  </button>
                )
              })}
            </div>
            <div style={{ fontSize:13, fontWeight:700, color:"#4b4f54", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6 }}>International</div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:16 }}>
              {INTL_CITIES.map(c => {
                const isA16z = A16Z_CITY_SET.has(c)
                const isActive = c === city
                return (
                  <button key={c} onClick={() => { setCity(c); setSearch("") }}
                    style={{
                      fontSize:13, padding:"5px 12px", borderRadius:99, cursor:"pointer",
                      fontWeight: isActive ? 500 : 400,
                      background: isActive ? (isA16z ? "#fdf0d9" : "#dbeafe") : (isA16z ? "#fdf8ef" : "transparent"),
                      border: `0.5px solid ${isActive ? (isA16z ? "#cf7f00" : "#3b82f6") : (isA16z ? "#e8c47a" : "#ddd")}`,
                      color: isActive ? (isA16z ? "#7a4a00" : "#1d4ed8") : (isA16z ? "#9a5f00" : "#666"),
                    }}>
                    {c}
                  </button>
                )
              })}
            </div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center", marginBottom:16 }}>
              {FILTERS.map(f => (
                <button key={f.key} onClick={() => toggleFilter(f.key)}
                  style={{ fontSize:12, padding:"5px 12px", borderRadius:99, border:`0.5px solid ${activeFilters.includes(f.key) ? TAG_COLORS[f.key].color:"#ddd"}`, background: activeFilters.includes(f.key) ? TAG_COLORS[f.key].bg:"transparent", color: activeFilters.includes(f.key) ? TAG_COLORS[f.key].color:"#888", cursor:"pointer", fontWeight: activeFilters.includes(f.key) ? 500:400 }}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <MapView key={city} venues={allVenues} city={city} />
        </>
      ) : activeTab === "updates" ? (
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
            <div style={{ fontSize:13, fontWeight:700, color:"#4b4f54", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6 }}>United States</div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:12 }}>
              {US_CITIES.map(c => {
                const hasUpdates = (data[c]||[]).some(v => v.status)
                const isA16z = A16Z_CITY_SET.has(c)
                const isLyons = c === "Lyons NYC"
                const isActive = c === city
                return (
                  <button key={c} onClick={() => { setCity(c); setSearch("") }}
                    style={{
                      fontSize:13, padding:"5px 12px", borderRadius:99, cursor:"pointer",
                      fontWeight: isActive ? 500 : 400,
                      background: isActive
                        ? (isLyons ? "#ebebeb" : isA16z ? "#fdf0d9" : "#dbeafe")
                        : (isLyons ? "#f5f5f5" : isA16z ? "#fdf8ef" : "transparent"),
                      border: `0.5px solid ${isActive
                        ? (isLyons ? "#999999" : isA16z ? "#cf7f00" : "#3b82f6")
                        : (isLyons ? "#d1d1d1" : isA16z ? "#e8c47a" : "#ddd")}`,
                      color: isActive
                        ? (isLyons ? "#111111" : isA16z ? "#7a4a00" : "#1d4ed8")
                        : (isLyons ? "#666666" : isA16z ? "#9a5f00" : "#666"),
                    }}>
                    {c === "Lyons NYC" ? "⭐ Lyons NYC" : c}{hasUpdates && <span style={{ display:"inline-block", width:6, height:6, borderRadius:99, background:"#1D9E75", marginLeft:5, verticalAlign:"middle", marginTop:-2 }} />}
                  </button>
                )
              })}
            </div>
            <div style={{ fontSize:13, fontWeight:700, color:"#4b4f54", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6 }}>International</div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {INTL_CITIES.map(c => {
                const hasUpdates = (data[c]||[]).some(v => v.status)
                const isA16z = A16Z_CITY_SET.has(c)
                const isActive = c === city
                return (
                  <button key={c} onClick={() => { setCity(c); setSearch("") }}
                    style={{
                      fontSize:13, padding:"5px 12px", borderRadius:99, cursor:"pointer",
                      fontWeight: isActive ? 500 : 400,
                      background: isActive ? (isA16z ? "#fdf0d9" : "#dbeafe") : (isA16z ? "#fdf8ef" : "transparent"),
                      border: `0.5px solid ${isActive ? (isA16z ? "#cf7f00" : "#3b82f6") : (isA16z ? "#e8c47a" : "#ddd")}`,
                      color: isActive ? (isA16z ? "#7a4a00" : "#1d4ed8") : (isA16z ? "#9a5f00" : "#666"),
                    }}>
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
                    {cat === "restaurant" ? (city === "Lyons NYC" ? "Lyons NYC" : `${city} Restaurants`) : (CATEGORY_LABELS[cat] || cat)}
                  </h2>
                  <span style={{ fontSize:12, color:"#aaa" }}>{venues.length} spots</span>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:12 }}>
                  {venues.map((venue, i) => <VenueCard key={venue.name} v={venue} rank={i+1} />)}
                </div>
              </div>
            ))
          )}
        </>
      )}


    </div>
  )
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
)
