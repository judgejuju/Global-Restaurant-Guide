import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { useState, useRef } from "react"

const CITIES = [
  "Barcelona","Boston","Calistoga","Cannes","Chicago",
  "Fort Lauderdale","Healdsburg","Las Vegas","London","Los Angeles",
  "Menlo Park","Miami","Milan","Mykonos","Napa",
  "NYC","Palo Alto","Paris","San Francisco","Santa Monica",
  "Scottsdale","Sonoma","St. Helena","Venice CA","Washington DC",
  "West Palm Beach"
]

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
]

const TAG_COLORS = {
  michelin:     { bg:"#EEEDFE", color:"#3C3489", label:"Michelin" },
  newBuzz:      { bg:"#E1F5EE", color:"#0F6E56", label:"New & Buzzy" },
  trendy:       { bg:"#FAEEDA", color:"#854F0B", label:"Trendy" },
  classic:      { bg:"#E6F1FB", color:"#185FA5", label:"Classic" },
  celebrity:    { bg:"#FBEAF0", color:"#993556", label:"Celebrity" },
  liveMusic:    { bg:"#EAF3DE", color:"#3B6D11", label:"Live Music" },
  hardToGet:    { bg:"#FCEBEB", color:"#A32D2D", label:"Hard to Get" },
  quiet:        { bg:"#F1EFE8", color:"#5F5E5A", label:"Quiet" },
  privateClub:  { bg:"#F0E6FB", color:"#6B21A8", label:"Private Club" },
}

const STATUS_COLORS = {
  open:             { bg:"#EAF3DE", color:"#3B6D11" },
  closed:           { bg:"#FCEBEB", color:"#A32D2D" },
  "new opening":    { bg:"#E1F5EE", color:"#0F6E56" },
  "michelin award": { bg:"#EEEDFE", color:"#3C3489" },
  "new chef":       { bg:"#FAEEDA", color:"#854F0B" },
  update:           { bg:"#E6F1FB", color:"#185FA5" },
}

const v = (name,type,desc,stars,flags,url,lat,lng) => ({
  name,type,desc,stars,...flags,url,lat,lng,status:"",notes:""
})
const f = (michelin=false,newBuzz=false,trendy=false,classic=false,celebrity=false,liveMusic=false,hardToGet=false,quiet=false,privateClub=false) =>
  ({michelin,newBuzz,trendy,classic,celebrity,liveMusic,hardToGet,quiet,privateClub})

const INITIAL_DATA = {
  "NYC": [
    v("Le Bernardin","Seafood","Eric Ripert's three-star temple, best seafood in America",4.9,f(true,false,false,true,true,false,true,true),"https://le-bernardin.com",40.7614,-73.9816),
    v("Eleven Madison Park","Contemporary American","Three Michelin stars, plant-forward tasting menu masterpiece",4.9,f(true,false,true,false,true,false,true,true),"https://elevenmadisonpark.com",40.7416,-73.9872),
    v("Per Se","French-American","Thomas Keller's NYC flagship, three stars, Columbus Circle views",4.9,f(true,false,false,true,true,false,true,true),"https://perseny.com",40.7685,-73.9821),
    v("Chef's Table at Brooklyn Fare","French Contemporary","Three-star intimate counter, 18 seats only",4.9,f(true,false,false,false,false,false,true,true),"https://brooklynfare.com",40.6782,-73.9442),
    v("Masa","Japanese","Three-star omakase, most expensive restaurant in America",4.9,f(true,false,false,true,true,false,true,true),"https://masanyc.com",40.7685,-73.9822),
    v("Tatiana by Kwame Onwuachi","Afro-Caribbean","Lincoln Center's buzzy Michelin-starred gem",4.8,f(true,true,true,false,true,false,true,false),"https://tatiananyc.com",40.7725,-73.9836),
    v("Don Angie","Italian","Creative red-sauce, perpetually packed, Michelin starred",4.8,f(true,false,true,false,false,false,true,false),"https://donangie.com",40.7354,-74.0065),
    v("Carbone","Italian-American","Red-sauce power scene, the celebrity magnet of NYC",4.8,f(false,false,true,false,true,false,true,false),"https://carbonenewyork.com",40.7277,-74.0020),
    v("The Core Club","Private Members Club","NYC's most exclusive private club, arts and business elite",4.8,f(false,false,false,true,true,false,true,true,true),"https://thecoreclub.com",40.7614,-73.9726),
    v("Rao's","Italian-American","Impossible to get into, old-school Italian institution since 1896",4.8,f(false,false,false,true,true,false,true,false),"https://raos.com",40.7956,-73.9420),
    v("Gabriel Kreuther","Alsatian-French","Two Michelin stars, stunning room across from Bryant Park",4.8,f(true,false,false,false,false,false,true,true),"https://gknyc.com",40.7540,-73.9839),
    v("Gramercy Tavern","American","Danny Meyer landmark, two Michelin stars, warm and classic",4.7,f(true,false,false,true,true,false,false,true),"https://gramercytavern.com",40.7386,-73.9883),
    v("Daniel","French","Daniel Boulud's flagship, two stars, Upper East Side elegance",4.7,f(true,false,false,true,true,false,true,true),"https://danielnyc.com",40.7741,-73.9635),
    v("The Modern","French-American","MoMA's Michelin-starred restaurant, sleek and refined",4.7,f(true,false,false,false,true,false,true,true),"https://themodernnyc.com",40.7614,-73.9776),
    v("Atomix","Korean Contemporary","Two Michelin stars, highest-rated Korean restaurant in the US",4.7,f(true,false,true,false,false,false,true,true),"https://atomixnyc.com",40.7448,-73.9870),
    v("Jungsik","Korean Contemporary","Two Michelin stars, refined modern Korean",4.7,f(true,false,false,false,false,false,true,true),"https://jungsik.com",40.7159,-74.0090),
    v("Manhatta","American","Danny Meyer's sky-high dining, stunning views from floor 60",4.7,f(false,false,true,false,true,false,false,false),"https://manhattarestaurant.com",40.7074,-74.0113),
    v("Lilia","Italian","Missy Robbins' pasta temple, perpetual waits, beloved",4.7,f(false,false,true,false,false,false,true,false),"https://lilianewyork.com",40.7183,-73.9572),
    v("Via Carota","Italian","West Village gem, best cacio e pepe in the city",4.7,f(false,false,false,true,true,false,true,false),"https://viacarota.com",40.7329,-74.0026),
    v("The NoMad","American","Danny Meyer's landmark hotel restaurant, two stars",4.6,f(true,false,false,true,true,false,false,true),"https://thenomadhotel.com",40.7448,-73.9872),
    v("Ugly Baby","Thai","Best Thai in NYC, fiery and authentic, no reservations",4.6,f(false,false,true,false,false,false,false,false),"https://uglybabyny.com",40.6731,-73.9785),
    v("Frenchette","French Bistro","Downtown brasserie energy, natural wine, always buzzing",4.6,f(false,false,true,false,true,false,true,false),"https://frenchetteny.com",40.7204,-74.0076),
    v("Superiority Burger","Vegetarian","Cult vegetarian burger spot, cheap and iconic",4.6,f(false,true,true,false,true,false,false,false),"https://superiorityburger.com",40.7258,-73.9842),
    v("The Grill","American","Power lunch institution in the Four Seasons space",4.6,f(false,false,false,true,true,false,false,true),"https://thegrillnewyork.com",40.7569,-73.9726),
    v("Lucali","Pizza","Best pizza in NYC, cash only, BYOB, impossible wait",4.6,f(false,false,false,true,true,false,true,false),"https://lucali.com",40.6784,-73.9956),
    v("Employees Only","Cocktail Bar","Legendary speakeasy-style cocktail bar, West Village",4.6,f(false,false,false,true,true,false,false,false),"https://employeesonlynyc.com",40.7339,-74.0051),
    v("Death & Co","Cocktail Bar","Craft cocktail pioneer, East Village institution",4.6,f(false,false,false,true,false,false,false,false),"https://deathandcompany.com",40.7254,-73.9831),
    v("Bar Goto","Japanese Cocktail Bar","Intimate Japanese-inspired cocktails, Lower East Side",4.6,f(false,false,false,true,false,false,false,true),"https://bargoto.com",40.7225,-73.9896),
    v("Attaboy","Cocktail Bar","No-menu speakeasy, bartenders craft your perfect drink",4.6,f(false,false,false,true,false,false,false,false),"https://attaboy.us",40.7198,-73.9876),
    v("Cote","Korean Steakhouse","Michelin-starred Korean BBQ, wine-focused, Flatiron",4.6,f(true,false,true,false,true,false,true,false),"https://cotenyc.com",40.7397,-73.9927),
    v("Dirt Candy","Vegetarian","Two Michelin stars, vegetable-focused tasting menu",4.5,f(true,false,true,false,false,false,true,true),"https://dirtcandynyc.com",40.7198,-73.9845),
    v("Uncle Boons","Thai","Beloved Thai, James Beard nominated, NoLiTa",4.5,f(false,false,true,false,false,false,false,false),"https://uncleboons.com",40.7231,-73.9948),
    v("Parm","Italian-American","Best chicken parm sandwich in NYC, casual and fun",4.5,f(false,false,false,true,false,false,false,false),"https://parmnyc.com",40.7261,-73.9984),
    v("Jeju Noodle Bar","Korean","Michelin-starred ramen, tiny and beloved",4.5,f(true,false,false,false,false,false,true,false),"https://jejunoodlebar.com",40.7337,-74.0037),
    v("Don Angie","Italian","Baked clams and pinwheel lasagna, West Village hit",4.5,f(true,false,true,false,false,false,true,false),"https://donangie.com",40.7360,-74.0060),
    v("Maison Premiere","Oyster Bar","New Orleans-inspired oysters and absinthe, Williamsburg",4.5,f(false,false,true,false,true,false,false,true),"https://maisonpremiere.com",40.7156,-73.9572),
    v("Le Turtle","French","Cozy French bistro, natural wine, Lower East Side",4.5,f(false,false,true,false,false,false,false,true),"https://leturtle.com",40.7209,-73.9888),
    v("Clover Club","Cocktail Bar","Brooklyn cocktail institution, beautiful Victorian bar",4.5,f(false,false,false,true,false,false,false,true),"https://cloverclubny.com",40.6820,-73.9930),
    v("Momofuku Ko","Contemporary American","Two Michelin stars, David Chang's tasting menu counter",4.5,f(true,false,false,false,false,false,true,true),"https://ko.momofuku.com",40.7254,-73.9831),
    v("Nobu Fifty Seven","Japanese-Peruvian","The original celebrity sushi destination",4.4,f(false,false,false,true,true,false,false,false),"https://noburestaurants.com/new-york",40.7614,-73.9797),
    v("The Knickerbocker Club","Private Members Club","One of NYC's oldest and most prestigious private clubs",4.4,f(false,false,false,true,true,false,true,true,true),"https://knickerbockerclub.org",40.7741,-73.9647),
    v("Raoul's","French Bistro","SoHo institution, dark and romantic, steak frites perfection",4.4,f(false,false,false,true,true,false,false,false),"https://raouls.com",40.7229,-73.9993),
    v("Pastis","French Brasserie","Keith McNally's beloved brasserie, Meatpacking staple",4.4,f(false,false,true,false,true,false,false,false),"https://pastisnyc.com",40.7404,-74.0076),
    v("The Dead Rabbit","Cocktail Bar","Five-time world's best bar, Irish pub meets craft cocktails",4.4,f(false,false,false,true,false,false,false,false),"https://thedeadrabbitnyc.com",40.7033,-74.0135),
    v("Four Horsemen","Wine Bar","James Murphy's natural wine bar, Michelin starred, Williamsburg",4.4,f(true,false,true,false,true,false,false,true),"https://fourhorsemenbk.com",40.7158,-73.9500),
    v("Balthazar","French Brasserie","Keith McNally's SoHo brasserie, open since 1997, always packed",4.4,f(false,false,false,true,true,false,false,false),"https://balthazarny.com",40.7227,-73.9997),
    v("Pegu Club","Cocktail Bar","Audrey Saunders' classic cocktail bar, SoHo",4.3,f(false,false,false,true,false,false,false,true),"https://peguclub.com",40.7248,-74.0026),
    v("Russ & Daughters Cafe","Jewish Deli","Lower East Side institution, best smoked fish in America",4.3,f(false,false,false,true,true,false,false,false),"https://russanddaughterscafe.com",40.7226,-73.9873),
    v("Monkey Bar","American","Midtown power scene, Graydon Carter's celebrity haunt",4.3,f(false,false,false,true,true,false,false,false),"https://monkeybarnewyork.com",40.7576,-73.9726),
    v("The Pool","American","Power dining in the Four Seasons landmark space",4.3,f(false,false,false,true,true,false,false,true),"https://thepoolnewyork.com",40.7569,-73.9726),
  ],

  "Los Angeles": [
    v("Providence","Seafood","Two Michelin stars, LA's finest seafood dining",4.9,f(true,false,false,true,true,false,true,true),"https://providencela.com",34.0833,-118.3418),
    v("Dialogue","Tasting Menu","Michelin-starred intimate counter, Santa Monica's finest",4.8,f(true,false,true,false,false,false,true,true),"https://dialoguedining.com",34.0195,-118.4912),
    v("n/naka","Japanese","Two Michelin stars, Niki Nakayama's kaiseki masterpiece",4.9,f(true,false,false,false,false,false,true,true),"https://n-naka.com",34.0195,-118.3542),
    v("Vespertine","Avant-garde","One Michelin star, otherworldly experience, Culver City",4.8,f(true,false,true,false,true,false,true,true),"https://vespertine.la",34.0093,-118.3951),
    v("Somni","Spanish Contemporary","Two Michelin stars, reborn as LA's most ambitious tasting menu",4.9,f(true,true,true,false,true,false,true,true),"https://somnila.com",34.0736,-118.4004),
    v("Horses","American Bistro","Coolest room in LA, natural wine, perpetually buzzy",4.7,f(false,true,true,false,true,false,true,false),"https://horsesla.com",34.0903,-118.3690),
    v("Jon & Vinny's","Italian-American","Best pasta in LA, always packed, Silver Lake staple",4.7,f(false,false,true,false,true,false,true,false),"https://jonandvinnys.com",34.0831,-118.2707),
    v("Bestia","Italian","Arts District anchor, wood-fired and buzzy",4.7,f(false,false,true,false,true,false,true,false),"https://bestiala.com",34.0411,-118.2327),
    v("Majordomo","Korean-American","David Chang's LA hit, large format feasts",4.7,f(false,false,true,false,true,false,true,false),"https://majordomola.com",34.0522,-118.2437),
    v("Gjelina","California","Venice institution, always packed, great for everything",4.6,f(false,false,false,true,true,false,true,false),"https://gjelina.com",33.9905,-118.4714),
    v("Felix Trattoria","Italian","Best pizza in LA, Venetian-style, acclaimed by all",4.6,f(false,false,true,false,true,false,true,false),"https://felixla.com",33.9906,-118.4709),
    v("Gjusta","Bakery/Deli","Venice institution, perpetual lines, celebrity hangout",4.6,f(false,false,false,true,true,false,false,false),"https://gjusta.com",33.9901,-118.4710),
    v("République","French-California","Grand Wilshire Blvd brasserie, Michelin Bib Gourmand",4.6,f(false,false,true,false,true,false,false,false),"https://republiquela.com",34.0583,-118.3513),
    v("Hayato","Japanese","One Michelin star, exquisite kaiseki in Arts District",4.7,f(true,false,false,false,false,false,true,true),"https://hayatola.com",34.0411,-118.2317),
    v("Osteria Mozza","Italian","Nancy Silverton's iconic Italian, mozzarella bar and all",4.6,f(false,false,false,true,true,false,false,false),"https://osteriamozza.com",34.0831,-118.3418),
    v("Spago","California","Wolfgang Puck's legendary Beverly Hills institution",4.6,f(false,false,false,true,true,false,false,true),"https://wolfgangpuck.com/dining/spago-beverly-hills",34.0736,-118.3980),
    v("Nobu Malibu","Japanese-Peruvian","Oceanfront Nobu, celebrity central on PCH",4.6,f(false,false,true,false,true,false,false,false),"https://noburestaurants.com/malibu",34.0195,-118.6789),
    v("Bavel","Middle Eastern","Arts District gem, mezze and wood-fired, always busy",4.6,f(false,false,true,false,true,false,true,false),"https://bavella.com",34.0411,-118.2337),
    v("Rustic Canyon","California","Santa Monica's beloved farm-to-table, refined and local",4.6,f(false,false,false,true,false,false,false,true),"https://rusticcanyonwinebar.com",34.0195,-118.4892),
    v("The Jonathan Club","Private Members Club","LA's most prestigious private club, Downtown and Beach",4.7,f(false,false,false,true,true,false,true,true,true),"https://jc.org",34.0490,-118.2520),
    v("Nobu West Hollywood","Japanese-Peruvian","Celebrity sushi central, Sunset Strip",4.5,f(false,false,true,false,true,false,false,false),"https://noburestaurants.com/los-angeles",34.0927,-118.3840),
    v("Crossroads Kitchen","Vegan","Best vegan fine dining in America, WeHo",4.5,f(false,false,true,false,true,false,false,false),"https://crossroadskitchen.com",34.0831,-118.3720),
    v("Gracias Madre","Mexican Vegan","Plant-based Mexican, celebrity magnet, WeHo",4.5,f(false,false,true,false,true,false,false,false),"https://graciasmadreweho.com",34.0831,-118.3730),
    v("Sushi Ginza Onodera","Japanese","One Michelin star, omakase, Beverly Hills",4.6,f(true,false,false,false,false,false,true,true),"https://losangeles.sushiginzaonodera.com",34.0736,-118.3990),
    v("Konbi","Japanese-California","Echo Park gem, perfect egg salad sandwiches and natural wine",4.5,f(false,false,true,false,true,false,false,true),"https://konbi.la",34.0780,-118.2607),
    v("Night + Market","Thai","Best Thai in LA, vibrant and spicy, multiple locations",4.5,f(false,false,true,false,true,false,false,false),"https://nightmarketla.com",34.0927,-118.3840),
    v("Perino's","Italian-American","Old Hollywood glamour revived, Beverly Hills",4.5,f(false,false,false,true,true,false,false,true),"https://perinosbh.com",34.0736,-118.3970),
    v("The Polo Lounge","American","Beverly Hills Hotel institution, power breakfast legends",4.5,f(false,false,false,true,true,false,false,false),"https://beverlyhillshotel.com/dining/polo-lounge",34.0790,-118.4134),
    v("Catch LA","Seafood","Rooftop celebrity dining, West Hollywood scene",4.4,f(false,false,true,false,true,false,false,false),"https://catchrestaurants.com/location/la",34.0917,-118.3750),
    v("Clifton's","American","DTLA institution, multi-floor social club and bar",4.4,f(false,false,true,false,true,true,false,false),"https://cliftonla.com",34.0484,-118.2490),
    v("Bar Marmont","Cocktail Bar","Chateau Marmont's iconic bar, eternal celebrity haunt",4.4,f(false,false,false,true,true,false,false,false),"https://chateaumarmont.com",34.0927,-118.3820),
    v("The Tasting Kitchen","California","Venice neighborhood gem, wood-fired and intimate",4.4,f(false,false,false,true,false,false,false,true),"https://thetastingkitchen.com",33.9905,-118.4700),
    v("Laurel Hardware","American Bar","West Hollywood bar and restaurant with a beautiful patio",4.3,f(false,false,true,false,true,false,false,false),"https://laurelhardware.com",34.0831,-118.3700),
    v("Mother Wolf","Italian","Evan Funke's Rome-inspired pasta palace, Hollywood",4.5,f(false,true,true,false,true,false,true,false),"https://motherwolfla.com",34.1016,-118.3278),
    v("Yamashiro","Japanese","Hollywood Hills hilltop, stunning views, classic atmosphere",4.3,f(false,false,false,true,true,false,false,false),"https://yamashirohollywood.com",34.1033,-118.3380),
    v("Sonoratown","Mexican","Best tacos in LA, tiny and perfect, DTLA",4.5,f(false,false,false,true,false,false,false,false),"https://sonoratown.com",34.0540,-118.2380),
    v("Sushi Park","Japanese","Hidden rooftop omakase, Sunset Strip, celebrity secret",4.5,f(false,false,false,true,true,false,true,false),"https://sushiparkla.com",34.0917,-118.3770),
    v("Tesse","French","West Hollywood's chic French wine bar and restaurant",4.4,f(false,false,true,false,true,false,false,true),"https://tessela.com",34.0831,-118.3760),
    v("1 OAK","Nightclub/Bar","WeHo nightlife institution, celebrity sightings guaranteed",4.2,f(false,false,true,false,true,true,false,false),"https://1oakla.com",34.0917,-118.3760),
    v("Genwa Korean BBQ","Korean BBQ","Best Korean BBQ in LA, Beverly Hills location",4.4,f(false,false,false,true,false,false,false,false),"https://genwakoreanbbq.com",34.0736,-118.3790),
    v("Langer's Deli","Jewish Deli","Best pastrami in America, MacArthur Park institution",4.4,f(false,false,false,true,true,false,false,false),"https://langersdeli.com",34.0572,-118.2720),
    v("Musso & Frank Grill","American","Hollywood's oldest restaurant since 1919, timeless",4.4,f(false,false,false,true,true,false,false,false),"https://mussoandfrank.com",34.1013,-118.3280),
    v("Tito's Tacos","Mexican","LA institution since 1959, legendary street-style tacos",4.2,f(false,false,false,true,false,false,false,false),"https://titostacos.com",33.9936,-118.4278),
    v("Chateau Marmont","American","Legendary hotel restaurant, rock and roll history",4.3,f(false,false,false,true,true,false,false,false),"https://chateaumarmont.com",34.0927,-118.3820),
    v("Gucci Osteria","Italian","Massimo Bottura's Beverly Hills outpost, one Michelin star",4.6,f(true,false,true,false,true,false,true,false),"https://gucciosteria.com/beverly-hills",34.0736,-118.3960),
    v("Stir Crazy","Wine Bar","Silver Lake natural wine bar, hip and unpretentious",4.3,f(false,true,true,false,false,false,false,false),"https://stircrazy.la",34.0894,-118.2697),
    v("Amara Kitchen","Mexican","James Beard nominated, modern Mexican, Echo Park",4.4,f(false,true,true,false,false,false,false,false),"https://amarakitchen.com",34.0780,-118.2617),
    v("All Day Baby","American","Silver Lake all-day diner, creative and fun",4.3,f(false,false,true,false,true,false,false,false),"https://alldaybabyla.com",34.0894,-118.2707),
    v("Gold Line Bar","Dive Bar","Echo Park dive, local legend, perfect jukebox",4.2,f(false,false,false,true,false,true,false,false),"https://goldlinebar.com",34.0780,-118.2597),
    v("Tesse Wine Bar","French Wine Bar","West Hollywood's best wine list, intimate setting",4.4,f(false,false,true,false,true,false,false,true),"https://tessela.com",34.0831,-118.3750),
  ],

  "Miami": [
    v("Cote Miami","Korean Steakhouse","Korean BBQ meets Miami glam, Michelin starred",4.8,f(true,false,true,false,true,false,true,false),"https://cotemiami.com",25.7926,-80.1419),
    v("Le Jardinier","French Vegetable","Michelin-starred vegetable-forward French",4.8,f(true,false,true,false,false,false,true,true),"https://lejardiniermiami.com",25.7908,-80.1347),
    v("Stubborn Seed","Contemporary American","Chef Jeremy Ford's Michelin-starred South Beach gem",4.8,f(true,false,true,false,false,false,true,true),"https://stubbornseeds.com",25.7814,-80.1300),
    v("L'Atelier de Joël Robuchon","French","Michelin-starred counter dining, Miami's finest French",4.8,f(true,false,false,true,true,false,true,true),"https://joel-robuchon.com/en/restaurant/miami",25.7908,-80.1340),
    v("Papi Steak","Steakhouse","Over-the-top celebrity steakhouse, the place to be seen",4.7,f(false,false,true,false,true,true,true,false),"https://papisteakmiami.com",25.7908,-80.1362),
    v("Cipriani Miami","Italian","Classic Italian grandeur, see-and-be-seen Brickell",4.6,f(false,false,false,true,true,false,false,false),"https://cipriani.com",25.7749,-80.1868),
    v("Carbone Miami","Italian-American","The Miami outpost of the NYC icon, same energy",4.7,f(false,false,true,false,true,false,true,false),"https://carbonemiami.com",25.7908,-80.1370),
    v("KYU Miami","Asian-American","Wood-fired Asian BBQ, Wynwood's best restaurant",4.7,f(false,false,true,false,true,false,true,false),"https://kyurestaurants.com",25.8014,-80.1990),
    v("Zuma Miami","Japanese","Rooftop Japanese robatayaki, Brickell scene",4.6,f(false,false,true,false,true,false,false,false),"https://zumarestaurant.com/zuma-miami",25.7681,-80.1919),
    v("Swan","Mediterranean","Pharrell's restaurant, the celebrity magnet of Design District",4.5,f(false,false,true,false,true,false,false,false),"https://swanandbar.com",25.8112,-80.1876),
    v("Komodo","Asian","Three-floor Asian restaurant and nightlife destination",4.5,f(false,false,true,false,true,true,false,false),"https://komodo-miami.com",25.7681,-80.1930),
    v("Novikov Miami","Asian-European","Russian-owned Miami powerhouse, see-and-be-seen",4.5,f(false,false,true,false,true,false,false,false),"https://novikovmiami.com",25.7908,-80.1360),
    v("Joe's Stone Crab","Seafood","Miami institution since 1913, must-visit October-May",4.6,f(false,false,false,true,true,false,true,false),"https://joesstonecrab.com",25.7731,-80.1349),
    v("Prime 112","Steakhouse","The OG South Beach steakhouse, impossible tables",4.6,f(false,false,true,false,true,false,true,false),"https://prime112.com",25.7731,-80.1359),
    v("Mandolin Aegean Bistro","Greek","Design District Greek gem, beautiful garden patio",4.6,f(false,false,true,false,false,false,false,true),"https://mandolinmiami.com",25.8112,-80.1856),
    v("Lido Restaurant","Mediterranean","Mid-Beach institution, The Surf Club, Michelin starred",4.7,f(true,false,false,true,true,false,true,true),"https://surfclubrestaurant.com",25.8699,-80.1204),
    v("Sexy Fish Miami","Japanese","Hottest new opening, Miami outpost of the London hit",4.6,f(false,true,true,false,true,false,true,false),"https://sexyfish.com/miami",25.7908,-80.1380),
    v("Bazaar Mar","Spanish Seafood","José Andrés' seafood wonderland in SLS Brickell",4.6,f(false,false,true,false,true,false,false,false),"https://sbe.com/restaurants/bazaarmar",25.7645,-80.1930),
    v("Casa Tua","Italian","Exclusive members club and restaurant, South Beach icon",4.6,f(false,false,false,true,true,false,true,true,true),"https://casatualifestyle.com",25.7814,-80.1320),
    v("Michael's Genuine","American","Wynwood farm-to-table pioneer, Miami classic",4.5,f(false,false,false,true,false,false,false,false),"https://michaelsgenuine.com",25.8014,-80.1960),
    v("Coyo Taco","Mexican","Wynwood late-night taco institution, always a party",4.4,f(false,false,true,false,true,false,false,false),"https://coyotaco.com",25.8014,-80.1980),
    v("Kiki on the River","Greek","Waterfront Greek, stunning views, party boats",4.4,f(false,false,true,false,true,true,false,false),"https://kikimiami.com",25.7856,-80.1940),
    v("Fooq's","Mediterranean","Downtown Miami neighborhood gem, great cocktails",4.4,f(false,false,true,false,false,false,false,false),"https://fooqs.com",25.7752,-80.1940),
    v("Ball & Chain","Cuban Bar","Little Havana music venue and cocktail bar, historic",4.4,f(false,false,false,true,false,true,false,false),"https://ballandchainmiami.com",25.7686,-80.2161),
    v("Broken Shaker","Cocktail Bar","Freehand Hotel's award-winning outdoor cocktail bar",4.5,f(false,false,true,false,true,false,false,false),"https://thefreehand.com/miami/broken-shaker",25.7938,-80.1349),
    v("Sweet Liberty","Cocktail Bar","Award-winning cocktail bar, best happy hour in Miami",4.5,f(false,false,true,false,true,false,false,false),"https://mysweetliberty.com",25.7908,-80.1389),
    v("Maty's","Peruvian","Chef Valerie Chang's acclaimed Peruvian, Michelin starred",4.7,f(true,true,true,false,false,false,true,false),"https://matysmiami.com",25.7908,-80.1340),
    v("Hakkasan Miami","Chinese","Upscale Cantonese in Fontainebleau, nightclub energy",4.4,f(false,false,true,false,true,true,false,false),"https://hakkasan.com/locations/miami",25.8699,-80.1204),
    v("Nave","Italian","Coconut Grove neighborhood trattoria, beloved local gem",4.4,f(false,false,false,true,false,false,false,true),"https://navecoconutgrove.com",25.7334,-80.2399),
    v("Cervecería La Tropical","Cuban","Historic Cuban brewery revived, Wynwood",4.3,f(false,false,true,false,false,true,false,false),"https://latropicalbrewery.com",25.8014,-80.2010),
  ],

  "San Francisco": [
    v("Quince","California Italian","Three Michelin stars, Michael Tusk's seasonal masterpiece",4.9,f(true,false,false,true,false,false,true,true),"https://quincerestaurant.com",37.7956,-122.4059),
    v("Atelier Crenn","French","Three Michelin stars, Dominique Crenn's poetic cuisine",4.9,f(true,false,true,false,true,false,true,true),"https://ateliercrenn.com",37.8003,-122.4366),
    v("Benu","Korean-French","Three Michelin stars, Corey Lee's brilliant tasting menu",4.9,f(true,false,false,false,false,false,true,true),"https://benusf.com",37.7854,-122.4017),
    v("Saison","Contemporary American","Three Michelin stars, live fire cooking, extraordinary",4.9,f(true,false,false,false,false,false,true,true),"https://saisonsf.com",37.7749,-122.4039),
    v("Nari","Thai","Michelin-starred modern Thai, James Beard nominated",4.7,f(true,true,true,false,false,false,true,false),"https://narithairestaurant.com",37.7861,-122.4328),
    v("Lazy Bear","American","Two Michelin stars, communal dinner party format",4.8,f(true,false,true,false,false,false,true,false),"https://lazybearsf.com",37.7643,-122.4175),
    v("Californios","Mexican","Two Michelin stars, fine dining Mexican tasting menu",4.8,f(true,false,true,false,false,false,true,true),"https://californiossf.com",37.7643,-122.4195),
    v("State Bird Provisions","American","Michelin-starred dim sum-style California cuisine",4.7,f(true,false,true,false,false,false,true,false),"https://statebirdsf.com",37.7861,-122.4338),
    v("Zuni Café","Californian","SF institution, best roast chicken in America",4.7,f(false,false,false,true,true,false,false,true),"https://zunicafe.com",37.7735,-122.4198),
    v("Rich Table","California","Michelin-starred, Evan and Sarah Rich's creative SF gem",4.7,f(true,false,true,false,false,false,true,false),"https://richtablesf.com",37.7735,-122.4198),
    v("Al's Place","California Vegetable","Michelin-starred vegetable-forward, best in class",4.7,f(true,false,true,false,false,false,true,false),"https://alsplacesf.com",37.7643,-122.4155),
    v("Octavia","California","Michelin-starred, Frances Kimball's Pac Heights gem",4.6,f(true,false,false,true,false,false,true,true),"https://octaviasf.com",37.7918,-122.4386),
    v("Nightbird","California","One Michelin star, chef Kim Alter's intimate Hayes Valley spot",4.6,f(true,false,false,false,false,false,true,true),"https://nightbirdsf.com",37.7769,-122.4207),
    v("Tosca Cafe","Italian","North Beach landmark, opera music and white Negronis",4.5,f(false,false,false,true,true,false,false,false),"https://toscacafesf.com",37.7989,-122.4066),
    v("The Progress","Californian","Stuart Brioza's inventive family-style tasting menu",4.6,f(true,false,true,false,false,false,true,false),"https://theprogresssf.com",37.7861,-122.4338),
    v("Nopalito","Mexican","Two locations, best tacos in SF, James Beard nominated",4.6,f(false,false,false,true,false,false,false,false),"https://nopalitosf.com",37.7735,-122.4398),
    v("Nopa","Californian","SF institution, great for late-night, farm-to-table pioneer",4.6,f(false,false,false,true,true,false,false,false),"https://nopasf.com",37.7769,-122.4317),
    v("Foreign Cinema","Californian","Mission neighborhood gem, outdoor film screenings",4.5,f(false,false,true,false,true,false,false,false),"https://foreigncinema.com",37.7607,-122.4148),
    v("Birdsong","Contemporary American","One Michelin star, Chris Bleidorn's outstanding menu",4.6,f(true,false,false,false,false,false,true,true),"https://birdsongsf.com",37.7843,-122.4056),
    v("The Interval at Long Now","Bar","Fort Mason's beautiful long-term-thinking cocktail bar",4.5,f(false,false,false,true,false,false,false,true),"https://theinterval.org",37.8063,-122.4272),
    v("Trick Dog","Cocktail Bar","Rotating thematic menus, SF craft cocktail icon",4.6,f(false,false,false,true,false,false,false,false),"https://trickdogbar.com",37.7618,-122.4148),
    v("Smuggler's Cove","Tiki Bar","World-class rum selection, award-winning tiki bar",4.6,f(false,false,true,false,true,false,false,false),"https://smugglerscovesf.com",37.7769,-122.4227),
    v("Absinthe Brasserie","French Brasserie","Hayes Valley institution, great cocktails and bistro fare",4.5,f(false,false,false,true,false,false,false,false),"https://absinthe.com",37.7769,-122.4197),
    v("Pacific Union Club","Private Members Club","SF's most prestigious private club, Nob Hill mansion",4.7,f(false,false,false,true,true,false,true,true,true),"https://pacificunionclub.org",37.7918,-122.4146),
    v("Perbacco","Italian","FiDi Italian institution, excellent Barolo list",4.5,f(false,false,false,true,true,false,false,true),"https://perbaccosf.com",37.7930,-122.3991),
    v("Mourad","Moroccan","Michelin-starred Moroccan in SoMa, stunning space",4.6,f(true,false,true,false,true,false,true,true),"https://mouradsf.com",37.7854,-122.4037),
    v("Liholiho Yacht Club","Hawaiian-American","Ravi Kapur's celebrated Hawaiian-inspired restaurant",4.6,f(false,false,true,false,true,false,true,false),"https://liholihoyachtclub.com",37.7918,-122.4156),
    v("Lord Stanley","British-California","One Michelin star, innovative and beautiful",4.6,f(true,false,false,false,false,false,true,true),"https://lordstanleysf.com",37.7989,-122.4116),
    v("20 Spot","Wine Bar","Mission wine bar with great small plates",4.4,f(false,false,true,false,false,false,false,true),"https://20spot.com",37.7607,-122.4128),
    v("Vesuvio Café","Bar","North Beach Beat Generation literary landmark bar",4.3,f(false,false,false,true,true,false,false,false),"https://vesuvio.com",37.7989,-122.4056),
  ],

  "Chicago": [
    v("Alinea","Avant-garde","Three Michelin stars, Grant Achatz's theatrical masterpiece",4.9,f(true,false,false,true,true,false,true,true),"https://alinearestaurant.com",41.9138,-87.6506),
    v("Smyth","Contemporary American","Two Michelin stars, John Shields' inventive tasting menu",4.8,f(true,false,true,false,false,false,true,true),"https://smythandtheloyalist.com",41.8914,-87.6522),
    v("Ever","Contemporary American","Two Michelin stars, Curtis Duffy's stunning new restaurant",4.8,f(true,false,false,false,false,false,true,true),"https://restaurantever.com",41.8836,-87.6390),
    v("Oriole","Contemporary American","Two Michelin stars, intimate and extraordinary",4.8,f(true,false,false,false,false,false,true,true),"https://oriolechicago.com",41.8836,-87.6380),
    v("Kasama","Filipino","Michelin-starred Filipino, daytime bakery and tasting menu",4.8,f(true,true,true,false,false,false,true,false),"https://kasamachicago.com",41.9138,-87.6516),
    v("Moody Tongue","American","Michelin-starred culinary brewery, unique experience",4.7,f(true,false,true,false,false,false,true,false),"https://moodytongue.com",41.8498,-87.6522),
    v("Spiaggia","Italian","One Michelin star, Lake Michigan views, classic",4.7,f(true,false,false,true,true,false,true,true),"https://spiaggiarestaurant.com",41.9001,-87.6279),
    v("Boka","Contemporary American","One Michelin star, Lincoln Park mainstay",4.6,f(true,false,false,true,false,false,false,true),"https://bokachicago.com",41.9264,-87.6404),
    v("Entente","Contemporary American","Michelin-starred, creative and refined Wicker Park",4.7,f(true,false,true,false,false,false,true,true),"https://ententechicago.com",41.9082,-87.6756),
    v("The Loyalist","American Bistro","Smyth's downstairs bar, incredible burgers and cocktails",4.7,f(false,false,true,false,true,false,false,false),"https://smythandtheloyalist.com",41.8914,-87.6522),
    v("Avec","Mediterranean","Small plates and charcuterie, Chicago institution",4.6,f(false,false,false,true,false,false,false,false),"https://avecrestaurant.com",41.8844,-87.6484),
    v("Girl & the Goat","American","Stephanie Izard's James Beard-winning flagship",4.6,f(false,false,true,false,true,false,true,false),"https://girlandthegoat.com",41.8844,-87.6494),
    v("The Purple Pig","Mediterranean","Outstanding charcuterie and wine, Mag Mile institution",4.6,f(false,false,false,true,false,false,false,false),"https://thepurplepigchicago.com",41.8914,-87.6252),
    v("Monteverde","Italian","Sarah Grueneberg's pasta temple, Time Out Market anchor",4.6,f(false,false,true,false,true,false,true,false),"https://monteverderestaurant.com",41.8844,-87.6534),
    v("GT Prime","Steakhouse","Giuseppe Tentori's refined steakhouse, River North",4.6,f(false,false,false,true,true,false,false,true),"https://gtprimechicago.com",41.8933,-87.6316),
    v("The Violet Hour","Cocktail Bar","Pioneer of the craft cocktail movement, no sign outside",4.7,f(false,false,false,true,false,false,false,true),"https://theviolethour.com",41.9073,-87.6758),
    v("Milk Room","Cocktail Bar","8-seat whiskey bar inside Chicago Athletic Association",4.7,f(false,false,false,false,true,false,true,true),"https://chicagoathletichotel.com",41.8836,-87.6252),
    v("The Aviary","Cocktail Bar","Grant Achatz's cocktail wonderland, reservations required",4.8,f(false,false,true,false,true,false,true,false),"https://theaviary.com",41.8914,-87.6532),
    v("Gibsons Bar & Steakhouse","Steakhouse","Chicago power steakhouse since 1989, Rush Street",4.5,f(false,false,false,true,true,false,false,false),"https://gibsonssteakhouse.com",41.9012,-87.6298),
    v("Chicago Club","Private Members Club","One of Chicago's oldest private dining clubs",4.6,f(false,false,false,true,true,false,true,true,true),"https://thechicagoclub.org",41.8791,-87.6252),
    v("Portillo's","Chicago-style","Chicago icon, best Italian beef and hot dogs",4.4,f(false,false,false,true,false,false,false,false),"https://portillos.com",41.8914,-87.6502),
    v("RPM Steak","Steakhouse","Celebrity-owned steakhouse, River North hot spot",4.5,f(false,false,true,false,true,false,false,false),"https://rpmrestaurants.com/rpm-steak",41.8933,-87.6326),
    v("Maple & Ash","Steakhouse","Wood-fired steakhouse, Gold Coast glamour",4.5,f(false,false,true,false,true,false,false,false),"https://mapleandash.com",41.9012,-87.6278),
    v("Publican","American","Paul Kahan's acclaimed pork and oyster hall",4.6,f(false,false,false,true,false,false,false,false),"https://thepublicanrestaurant.com",41.8844,-87.6514),
    v("Two","Contemporary American","One Michelin star, refined Chicago tasting menu",4.6,f(true,false,false,false,false,false,true,true),"https://tworestaurantchicago.com",41.8914,-87.6372),
    v("Cindy's","American Rooftop","Chicago Athletic Association rooftop, stunning views",4.5,f(false,false,true,false,true,false,false,false),"https://cindysrooftop.com",41.8836,-87.6252),
    v("Three Dots and a Dash","Tiki Bar","Best tiki bar in Chicago, hidden underground",4.5,f(false,false,true,false,false,true,false,false),"https://threedotsandadash.com",41.8836,-87.6262),
    v("Ina Mae Tavern","New Orleans","James Beard nominated Creole in Wicker Park",4.5,f(false,false,true,false,false,false,false,false),"https://inamaetavern.com",41.9082,-87.6766),
    v("Parachute","American","Beverly Kim's James Beard-winning Avondale gem",4.6,f(false,false,true,false,false,false,true,false),"https://parachuterestaurant.com",41.9386,-87.7103),
    v("Aba","Mediterranean","Lettuce Entertain You's rooftop Mediterranean, Fulton",4.5,f(false,false,true,false,true,false,false,false),"https://abarestaurants.com/chicago",41.8844,-87.6584),
  ],

  "Boston": [
    v("Menton","French-Italian","Barbara Lynch's flagship, Michelin starred, Fort Point",4.8,f(true,false,false,true,false,false,true,true),"https://mentonboston.com",42.3493,-71.0475),
    v("O Ya","Japanese","One Michelin star, extraordinary omakase, best in Boston",4.8,f(true,false,false,false,true,false,true,true),"https://oyarestaurantboston.com",42.3573,-71.0543),
    v("Tasting Counter","Contemporary American","One Michelin star, 12-seat chef's counter, exceptional",4.8,f(true,false,false,false,false,false,true,true),"https://tastingcounter.com",42.3808,-71.1229),
    v("No. 9 Park","French-Italian","Barbara Lynch's South End staple, two Michelin stars",4.7,f(true,false,false,true,true,false,false,true),"https://no9park.com",42.3574,-71.0643),
    v("Asta","Contemporary American","One Michelin star, inventive Back Bay tasting menu",4.7,f(true,false,false,false,false,false,true,true),"https://astaboston.com",42.3508,-71.0848),
    v("Uni","Japanese","One Michelin star, sashimi bar inside Eliot Hotel",4.7,f(true,false,false,false,true,false,true,true),"https://uniboston.com",42.3508,-71.0858),
    v("Bar Vlaha","Greek","Outstanding modern Greek, James Beard nominated",4.7,f(false,true,true,false,false,false,true,false),"https://barvlaha.com",42.3573,-71.0623),
    v("Sarma","Middle Eastern","Ana Sortun's Somerville mezze masterpiece",4.7,f(false,false,true,false,false,false,true,false),"https://sarmarestaurant.com",42.3932,-71.1079),
    v("Oleana","Middle Eastern","Ana Sortun's James Beard Award-winning Cambridge gem",4.7,f(false,false,true,false,false,false,true,true),"https://oleanarestaurant.com",42.3662,-71.1009),
    v("Pammy's","Italian","Cambridge neighborhood gem, intimate and refined",4.6,f(false,false,true,false,false,false,true,true),"https://pammyscambridge.com",42.3662,-71.1009),
    v("The Harvest","New American","Harvard Square staple since 1975, seasonal American",4.5,f(false,false,false,true,true,false,false,true),"https://harvestcambridge.com",42.3732,-71.1179),
    v("Troquet on South","French-American","Boston Common views, excellent wine and bistro fare",4.5,f(false,false,false,true,false,false,false,true),"https://troquetboston.com",42.3543,-71.0643),
    v("Puritan & Company","New American","Cambridge's finest neighborhood restaurant",4.6,f(false,false,true,false,false,false,false,false),"https://puritancambridge.com",42.3752,-71.1149),
    v("Island Creek Oyster Bar","Seafood","Boston institution, best oysters in the city",4.6,f(false,false,false,true,true,false,false,false),"https://islandcreekoysterbar.com",42.3483,-71.0948),
    v("Row 34","Seafood","Outstanding oyster and craft beer bar, Fort Point",4.6,f(false,false,true,false,false,false,false,false),"https://row34.com",42.3513,-71.0495),
    v("Waypoint","Seafood","Cambridge seafood and wood grill, refined and local",4.5,f(false,false,false,true,false,false,false,true),"https://waypointcambridge.com",42.3752,-71.1149),
    v("Post 390","American","Refined Back Bay bistro, great happy hour",4.4,f(false,false,false,true,false,false,false,true),"https://post390restaurant.com",42.3508,-71.0848),
    v("The Bristol Lounge","American","Four Seasons' classic lounge, power breakfast scene",4.5,f(false,false,false,true,true,false,false,true),"https://fourseasons.com/boston/dining",42.3543,-71.0703),
    v("Drink","Cocktail Bar","No-menu craft cocktail bar, Fort Point institution",4.7,f(false,false,false,true,false,false,false,false),"https://drinkfortpoint.com",42.3514,-71.0488),
    v("Eastern Standard","American Brasserie","Kenmore Square brasserie, great cocktails and oysters",4.5,f(false,false,false,true,false,false,false,false),"https://easternstandardboston.com",42.3483,-71.0978),
    v("Hawthorne","Cocktail Bar","Hotel Commonwealth's acclaimed cocktail program",4.5,f(false,false,false,true,false,false,false,true),"https://thehawthornebar.com",42.3483,-71.0978),
    v("Tavern Road","American","Fort Point's creative neighborhood restaurant",4.4,f(false,false,true,false,false,false,false,false),"https://tavernroad.com",42.3493,-71.0485),
    v("The Salty Pig","Italian-American","Back Bay cheese, charcuterie and craft beer bar",4.4,f(false,false,true,false,false,false,false,false),"https://thesaltypig.com",42.3508,-71.0808),
    v("Spoke Wine Bar","Wine Bar","Somerville natural wine bar, neighborhood gem",4.4,f(false,false,true,false,false,false,false,true),"https://spokewinebarboston.com",42.3932,-71.1179),
    v("The Beehive","American","South End jazz club and restaurant, live music nightly",4.4,f(false,false,false,true,true,true,false,false),"https://beehiveboston.com",42.3413,-71.0703),
    v("Craigie on Main","French-American","Whole animal cooking pioneer, Cambridge institution",4.6,f(false,false,false,true,false,false,false,true),"https://craigieonmain.com",42.3642,-71.1019),
    v("Legal Sea Foods","Seafood","Boston seafood institution, airport and city staple",4.3,f(false,false,false,true,false,false,false,false),"https://legalseafoods.com",42.3508,-71.0818),
    v("Harvard Club of Boston","Private Members Club","Cambridge institution, private dining and events",4.5,f(false,false,false,true,true,false,true,true,true),"https://harvardclubboston.com",42.3583,-71.0603),
    v("Neptune Oyster","Seafood","North End's beloved oyster bar, perpetual line",4.6,f(false,false,false,true,true,false,true,false),"https://neptuneoyster.com",42.3643,-71.0553),
    v("Saltie Girl","Seafood","Back Bay raw bar and tinned fish, outstanding wine list",4.7,f(false,false,true,false,true,false,true,true),"https://saltiegirl.com",42.3508,-71.0858),
  ],

  "Las Vegas": [
    v("é by José Andrés","Spanish","8-seat secret restaurant inside Jaleo, two Michelin stars",4.9,f(true,false,true,false,true,false,true,true),"https://cosmopolitanlasvegas.com/restaurants/e-by-jose-andres",36.1097,-115.1740),
    v("Joël Robuchon","French","Three Michelin stars, most awarded restaurant in Vegas",4.9,f(true,false,false,true,false,false,true,true),"https://mgmgrand.com/restaurants/joel-robuchon",36.1024,-115.1710),
    v("L'Atelier de Joël Robuchon","French Counter","One Michelin star, counter dining, MGM Grand",4.8,f(true,false,false,false,false,false,true,true),"https://mgmgrand.com/restaurants/l-atelier-de-joel-robuchon",36.1024,-115.1720),
    v("Twist by Pierre Gagnaire","French","One Michelin star, Mandarin Oriental, stunning views",4.8,f(true,false,false,false,false,false,true,true),"https://mandarinoriental.com/las-vegas/strip/fine-dining/twist",36.1097,-115.1730),
    v("Picasso","French-Spanish","Two Michelin stars, Bellagio fountain views, timeless",4.8,f(true,false,false,true,true,false,true,true),"https://bellagio.com/en/restaurants/picasso.html",36.1131,-115.1739),
    v("Le Cirque","French","Bellagio's opulent French classic, two Michelin stars",4.7,f(true,false,false,true,true,false,true,true),"https://bellagio.com/en/restaurants/le-cirque.html",36.1131,-115.1739),
    v("Nobu at Caesars","Japanese-Peruvian","Celebrity sushi destination on the Strip",4.7,f(false,false,true,false,true,false,false,false),"https://noburestaurants.com/las-vegas",36.1162,-115.1747),
    v("Carbone Las Vegas","Italian-American","NYC's hottest Italian, massive Vegas outpost",4.7,f(false,false,true,false,true,false,true,false),"https://carbonelasvegas.com",36.1097,-115.1750),
    v("Hell's Kitchen","British-American","Gordon Ramsay's best Vegas restaurant, Caesars",4.6,f(false,false,true,false,true,false,false,false),"https://gordonramsayrestaurants.com/hells-kitchen-las-vegas",36.1162,-115.1747),
    v("Bardot Brasserie","French","Michael Mina's stunning Art Deco French brasserie, ARIA",4.7,f(false,false,true,false,true,false,false,false),"https://aria.com/en/restaurants/bardot-brasserie.html",36.1075,-115.1756),
    v("Kame Japanese Cuisine","Japanese","Intimate omakase at Resorts World, outstanding quality",4.7,f(false,true,false,false,false,false,true,true),"https://rwlasvegas.com/restaurant/kame",36.1271,-115.1641),
    v("SW Steakhouse","Steakhouse","Wynn's premier steakhouse, lakeside views",4.6,f(false,false,false,true,true,false,false,true),"https://wynnlasvegas.com/dining/fine-dining/sw-steakhouse",36.1270,-115.1659),
    v("Prosecco","Italian","Palazzo Italian, refined and classic Strip dining",4.5,f(false,false,false,true,false,false,false,true),"https://palazzo.com/dining/prosecco",36.1199,-115.1730),
    v("Eataly Las Vegas","Italian Market","Three-floor Italian food hall, Park MGM",4.5,f(false,false,true,false,true,false,false,false),"https://eataly.com/us-en/stores/las-vegas",36.1038,-115.1720),
    v("Majordomo Meat & Fish","Contemporary","David Chang's Vegas outpost, Resorts World",4.6,f(false,false,true,false,true,false,false,false),"https://rwlasvegas.com/restaurant/majordomo",36.1271,-115.1651),
    v("Zuma Las Vegas","Japanese","Rooftop Japanese robatayaki, Cosmopolitan",4.6,f(false,false,true,false,true,false,false,false),"https://zumarestaurant.com/zuma-las-vegas",36.1097,-115.1740),
    v("STK Las Vegas","Steakhouse","Trendy steakhouse meets nightclub, The Cosmopolitan",4.5,f(false,false,true,false,true,true,false,false),"https://stksteakhouse.com/venues/las-vegas",36.1097,-115.1740),
    v("Spago Las Vegas","Californian","Wolfgang Puck's Vegas flagship, Forum Shops",4.5,f(false,false,false,true,true,false,false,false),"https://wolfgangpuck.com/dining/spago-las-vegas",36.1162,-115.1737),
    v("Giada","Italian","Giada De Laurentiis' Cromwell restaurant, celebrity chef",4.5,f(false,false,true,false,true,false,false,false),"https://giadadelaurentiis.com/restaurants",36.1120,-115.1739),
    v("Mon Ami Gabi","French Brasserie","Paris Las Vegas outdoor brasserie, Eiffel Tower views",4.5,f(false,false,false,true,false,false,false,false),"https://monamigabi.com/las-vegas",36.1120,-115.1750),
    v("Momofuku Las Vegas","American-Asian","David Chang's noodle bar and ssam bar, Cosmopolitan",4.5,f(false,false,true,false,true,false,false,false),"https://momofuku.com/las-vegas",36.1097,-115.1750),
    v("Wynn Bar","Cocktail Bar","Stunning Wynn Casino bar, elegant and lively",4.5,f(false,false,true,false,true,false,false,false),"https://wynnlasvegas.com",36.1270,-115.1659),
    v("Rosina","Cocktail Bar","Cosmopolitan's chic cocktail lounge, beautiful design",4.5,f(false,false,true,false,true,false,false,true),"https://cosmopolitanlasvegas.com/restaurants/rosina",36.1097,-115.1750),
    v("Vesper Bar","Cocktail Bar","Cosmopolitan's classic James Bond-inspired bar",4.4,f(false,false,true,false,true,false,false,false),"https://cosmopolitanlasvegas.com/restaurants/vesper-bar",36.1097,-115.1740),
    v("The Chandelier","Cocktail Bar","Cosmopolitan's three-story cocktail bar, iconic Vegas",4.6,f(false,false,true,false,true,false,false,false),"https://cosmopolitanlasvegas.com/restaurants/the-chandelier",36.1097,-115.1740),
    v("Scarpetta","Italian","Scott Conant's acclaimed spaghetti, Cosmopolitan",4.6,f(false,false,false,true,true,false,false,true),"https://cosmopolitanlasvegas.com/restaurants/scarpetta",36.1097,-115.1750),
    v("Beauty & Essex","American","Secret-pawn-shop restaurant, fabulous cocktails",4.5,f(false,false,true,false,true,false,false,false),"https://beautyandessex.com/las-vegas",36.1097,-115.1740),
    v("Gordon Ramsay Fish & Chips","British","Paris Las Vegas, casual Gordon Ramsay classic",4.3,f(false,false,true,false,true,false,false,false),"https://gordonramsayrestaurants.com/fish-chips",36.1120,-115.1750),
    v("Mastro's Ocean Club","Steakhouse","Crystal clear seafood and steaks, Crystals",4.6,f(false,false,true,false,true,false,false,false),"https://mastrosrestaurants.com/restaurant/ocean-club-las-vegas",36.1055,-115.1756),
    v("Javier's","Mexican","Palazzo's upscale Mexican, lively scene",4.4,f(false,false,true,false,true,false,false,false),"https://javiers.net/palazzo",36.1199,-115.1730),
  ],

  "Paris": [
    v("Guy Savoy","French","Three Michelin stars, best tasting menu in Paris",4.9,f(true,false,false,true,true,false,true,true),"https://guysavoy.com",48.8607,-2.3322),
    v("Le Grand Véfour","French","Three Michelin stars, Napoleon's favorite, Palais Royal",4.9,f(true,false,false,true,true,false,true,true),"https://grand-vefour.com",48.8648,-2.3376),
    v("Arpège","French","Three Michelin stars, Alain Passard's vegetable paradise",4.9,f(true,false,false,true,false,false,true,true),"https://alain-passard.com",48.8556,-2.3177),
    v("Le Bernardin Paris","French Seafood","Three Michelin stars, refined Paris seafood",4.8,f(true,false,false,true,false,false,true,true),"https://le-bernardin.fr",48.8667,-2.3167),
    v("Pierre Gagnaire","French","Three Michelin stars, avant-garde genius",4.9,f(true,false,true,false,true,false,true,true),"https://pierre-gagnaire.com",48.8748,-2.3046),
    v("Septime","French Contemporary","One Michelin star, hottest table in Paris, Bastille",4.8,f(true,false,true,false,true,false,true,true),"https://septime-charonne.fr",48.8520,-2.3788),
    v("Le Jules Verne","French","One Michelin star, Eiffel Tower dining, Ducasse",4.7,f(true,false,false,true,true,false,true,true),"https://lejulesverne-paris.com",48.8582,-2.2941),
    v("Caviar Kaspia","Caviar & Champagne","Celebrity haunt atop Place de la Madeleine",4.7,f(false,false,false,true,true,false,false,true),"https://caviar-kaspia.com",48.8700,-2.3247),
    v("L'Ambroisie","French","Three Michelin stars, Place des Vosges, timeless",4.9,f(true,false,false,true,false,false,true,true),"https://ambroisie-paris.com",48.8546,-2.3636),
    v("Frenchie","French Contemporary","One Michelin star, Rue du Nil, impossible to book",4.7,f(true,false,true,false,false,false,true,false),"https://frenchierestaurant.com",48.8627,-2.3466),
    v("Frenchie Bar à Vins","Wine Bar","Natural wine, small plates, Rue du Nil cluster",4.6,f(false,false,true,false,false,false,false,false),"https://frenchierestaurant.com",48.8627,-2.3466),
    v("Le Châteaubriand","French Contemporary","Natural wine bistro pioneer, innovative and iconic",4.7,f(false,false,true,false,true,false,true,false),"https://lechateaubriand.net",48.8678,-2.3728),
    v("Clown Bar","French Bistro","Natural wine bar beside Cirque d'Hiver, cult status",4.6,f(false,false,true,false,true,false,true,false),"https://clown-bar-paris.fr",48.8586,-2.3658),
    v("Le Cinq","French","Four Seasons George V, two Michelin stars, palatial",4.8,f(true,false,false,true,true,false,true,true),"https://fourseasons.com/paris/dining/restaurants/le_cinq",48.8748,-2.3046),
    v("Taillevent","French","Two Michelin stars, institution since 1946",4.8,f(true,false,false,true,true,false,true,true),"https://taillevent.com",48.8748,-2.3026),
    v("Épicure","French","Three Michelin stars, Le Bristol hotel garden dining",4.9,f(true,false,false,true,true,false,true,true),"https://lebristolparis.com/en/cuisine/epicure",48.8728,-2.3136),
    v("Le Voltaire","French Bistro","Saint-Germain power lunch, Paris literary scene",4.5,f(false,false,false,true,true,false,false,true),"https://restaurant-levoltaire.fr",48.8566,-2.3336),
    v("Kei","French-Japanese","One Michelin star, French-Japanese fusion, Louvre area",4.6,f(true,false,true,false,false,false,true,true),"https://restaurant-kei.fr",48.8618,-2.3466),
    v("Passage 53","French","Two Michelin stars, intimate covered passage dining",4.7,f(true,false,false,false,false,false,true,true),"https://passage53.com",48.8658,-2.3416),
    v("Le Baratin","French Bistro","Belleville natural wine bistro, neighborhood icon",4.5,f(false,false,true,false,true,false,false,false),"https://lebaratin.fr",48.8718,-2.3858),
    v("Berthillon","Ice Cream","Île Saint-Louis ice cream institution since 1954",4.5,f(false,false,false,true,true,false,false,false),"https://berthillon.fr",48.8516,-2.3556),
    v("Café de Flore","French Café","Saint-Germain café institution, Sartre and de Beauvoir",4.4,f(false,false,false,true,true,false,false,false),"https://cafedeflore.fr",48.8536,-2.3336),
    v("Les Deux Magots","French Café","Existentialist Left Bank café, essential Paris",4.4,f(false,false,false,true,true,false,false,false),"https://lesdeuxmagots.fr",48.8536,-2.3346),
    v("Harry's New York Bar","Cocktail Bar","Hemingway's Paris bar since 1911, Bloody Mary birthplace",4.5,f(false,false,false,true,true,false,false,false),"https://harrysbar.fr",48.8698,-2.3296),
    v("Prescription Cocktail Club","Cocktail Bar","Saint-Germain speakeasy, craft cocktails done right",4.6,f(false,false,true,false,true,false,false,false),"https://prescriptioncocktailclub.com",48.8536,-2.3376),
    v("Hôtel Costes","French","Saint-Honoré hotel restaurant, ultimate see-and-be-seen",4.5,f(false,false,false,true,true,false,false,false),"https://hotelcostes.com",48.8658,-2.3296),
    v("Loulou","French Mediterranean","Musée des Arts Décoratifs terrace, Louvre gardens",4.5,f(false,false,true,false,true,false,false,false),"https://loulou-paris.com",48.8618,-2.3356),
    v("Jòia par Hélène Darroze","French Bistro","One Michelin star, natural wine and seasonal cooking",4.6,f(true,false,true,false,false,false,true,false),"https://helenedarroze.com",48.8688,-2.3476),
    v("Le Mary Celeste","Cocktail Bar","Marais cocktail bar with excellent oysters",4.5,f(false,false,true,false,false,false,false,false),"https://lemaryceleste.com",48.8568,-2.3566),
    v("Candelaria","Cocktail Bar","Hidden taqueria with speakeasy cocktail bar behind",4.5,f(false,false,true,false,true,false,false,false),"https://quixotic-projects.com/venue/candelaria",48.8598,-2.3526),
  ],

  "London": [
    v("The Clove Club","British Contemporary","Three Michelin stars, Isaac McHale, Shoreditch",4.9,f(true,false,true,false,false,false,true,true),"https://thecloveclub.com",51.5246,-0.0774),
    v("Alain Ducasse at The Dorchester","French","Three Michelin stars, Hyde Park grandeur",4.9,f(true,false,false,true,true,false,true,true),"https://alainducasse-dorchester.com",51.5074,-0.1554),
    v("Restaurant Gordon Ramsay","French","Three Michelin stars, Chelsea institution",4.9,f(true,false,false,true,false,false,true,true),"https://gordonramsayrestaurants.com/restaurant-gordon-ramsay",51.4907,-0.1634),
    v("Core by Clare Smyth","British Contemporary","Three Michelin stars, Notting Hill, extraordinary",4.9,f(true,false,false,false,false,false,true,true),"https://corebyclare.com",51.5094,-0.2034),
    v("Sketch","French Contemporary","Two Michelin stars, Mayfair's most instagrammed rooms",4.8,f(true,false,true,false,true,false,true,false),"https://sketch.london",51.5094,-0.1424),
    v("The Ledbury","French Contemporary","Two Michelin stars, Notting Hill, Brett Graham",4.8,f(true,false,false,false,false,false,true,true),"https://theledbury.com",51.5094,-0.2024),
    v("Brat","Basque-influenced","One Michelin star, open-fire cooking, Shoreditch",4.8,f(true,false,true,false,true,false,true,false),"https://bratrestaurant.com",51.5246,-0.0771),
    v("Dinner by Heston Blumenthal","British Historical","Two Michelin stars, Mandarin Oriental, Hyde Park",4.8,f(true,false,true,false,true,false,true,true),"https://dinnerbyheston.com",51.5024,-0.1614),
    v("Ikoyi","West African","Two Michelin stars, ground-breaking West African cuisine",4.8,f(true,false,true,false,false,false,true,true),"https://ikoyilondon.com",51.5094,-0.1424),
    v("The Fat Duck","Molecular British","Three Michelin stars, Heston's Bray restaurant",4.9,f(true,false,true,false,true,false,true,true),"https://thefatduck.co.uk",51.5074,-0.7154),
    v("Kiln","Thai","Best Thai in London, coal-fired, Soho tiny gem",4.7,f(false,false,true,false,false,false,true,false),"https://kilnsoho.com",51.5134,-0.1354),
    v("St. John","British","Nose-to-tail pioneer, Smithfield, deeply influential",4.7,f(false,false,false,true,true,false,false,false),"https://stjohnrestaurant.com",51.5194,-0.1014),
    v("The River Café","Italian","Ruth Rogers' legendary Thames-side Italian institution",4.7,f(false,false,false,true,true,false,true,true),"https://rivercafe.co.uk",51.4797,-0.2234),
    v("Lyle's","British Contemporary","One Michelin star, James Lowe's restrained brilliance",4.7,f(true,false,false,false,false,false,true,true),"https://lyleslondon.com",51.5246,-0.0784),
    v("Rochelle Canteen","British","Melanie Arnold and Margot Henderson's beloved canteen",4.6,f(false,false,false,true,true,false,false,false),"https://arnoldandhenderson.com",51.5246,-0.0784),
    v("The Wolseley","European Grand Café","Grand Picadilly café, London institution for all meals",4.6,f(false,false,false,true,true,false,false,false),"https://thewolseley.com",51.5074,-0.1394),
    v("Scott's","Seafood","Mayfair seafood institution, best-dressed crowd in London",4.6,f(false,false,false,true,true,false,false,false),"https://scotts-restaurant.com",51.5104,-0.1474),
    v("Sexy Fish","Asian","Harvey Nichols-adjacent celebrity magnet, Mayfair",4.5,f(false,false,true,false,true,false,false,false),"https://sexyfish.com",51.5104,-0.1434),
    v("Annabel's","Private Members Club","Mayfair's most iconic members club since 1963",4.7,f(false,false,true,false,true,true,true,false,true),"https://annabels.co.uk",51.5084,-0.1454),
    v("Harry's Bar London","Italian","Private members club, London's answer to the Venice icon",4.6,f(false,false,false,true,true,false,true,true,true),"https://harrysbar.co.uk",51.5074,-0.1474),
    v("Nightjar","Cocktail Bar","Pre-Prohibition cocktails, live jazz nightly, Shoreditch",4.7,f(false,false,false,true,false,true,true,false),"https://barnightjar.com",51.5241,-0.0920),
    v("Dandelyan","Cocktail Bar","Mondrian's Southbank cocktail bar, world's best list",4.7,f(false,false,true,false,true,false,false,true),"https://morganshotelgroup.com",51.5074,-0.1074),
    v("The American Bar at The Savoy","Cocktail Bar","London's most historic hotel bar since 1893",4.7,f(false,false,false,true,true,false,false,true),"https://fairmont.com/savoy-london/dining/americanbar",51.5104,-0.1204),
    v("Lyaness","Cocktail Bar","Ryan Chetiyawardana's Southbank cocktail destination",4.6,f(false,false,true,false,false,false,false,true),"https://lyaness.com",51.5074,-0.1064),
    v("Noble Rot Soho","Wine Bar","Outstanding natural wine bar and restaurant, Soho",4.6,f(false,false,true,false,true,false,false,true),"https://noblerot.co.uk",51.5134,-0.1294),
    v("P Franco","Wine Bar","Clapton wine bar and kitchen, natural wine obsessives",4.5,f(false,false,true,false,false,false,false,true),"https://pfranco.co.uk",51.5534,-0.0564),
    v("The Marksman","British Pub","Hackney's best gastropub, Michelin Bib Gourmand",4.5,f(false,false,false,true,false,false,false,false),"https://marksmanpublichouse.com",51.5336,-0.0574),
    v("Rules","British","London's oldest restaurant since 1798, game and classic",4.5,f(false,false,false,true,true,false,false,true),"https://rules.co.uk",51.5104,-0.1224),
    v("Berners Tavern","British","Ian Schrager's Edition Hotel grand dining room",4.5,f(false,false,true,false,true,false,false,false),"https://bernerstavern.com",51.5174,-0.1334),
    v("Ottolenghi","Israeli-Mediterranean","Yotam Ottolenghi's beloved delis and restaurants",4.5,f(false,false,true,false,true,false,false,false),"https://ottolenghi.co.uk",51.5334,-0.0984),
  ],

  "Barcelona": [
    v("Disfrutar","Avant-garde","Three Michelin stars, world's #1 restaurant, former elBulli",4.9,f(true,true,true,false,true,false,true,true),"https://disfrutarbarcelona.com",41.3891,-2.1558),
    v("Lasarte","Contemporary Basque","Three Michelin stars, Martin Berasategui, Eixample",4.9,f(true,false,false,true,false,false,true,true),"https://restaurantlasarte.com",41.3871,-2.1538),
    v("Moments","Catalan","Two Michelin stars, Mandarin Oriental, Carme Ruscalleda",4.8,f(true,false,false,true,true,false,true,true),"https://mandarinoriental.com/barcelona/passeig-de-gracia/fine-dining/restaurants/catalan-cuisine/moments",41.3921,-2.1638),
    v("Àbac","Contemporary Catalan","Two Michelin stars, Jordi Cruz, elegant Zona Alta",4.8,f(true,false,false,false,false,false,true,true),"https://abacbarcelona.com",41.4041,-2.1498),
    v("Cocina Hermanos Torres","Avant-garde","Two Michelin stars, twin brothers, theatrical dining",4.8,f(true,false,true,false,false,false,true,true),"https://cocinahermanostorres.com",41.3791,-2.1498),
    v("Tickets","Avant-garde Tapas","Albert Adrià's impossible-to-book tapas, elBulli DNA",4.8,f(false,false,true,false,true,false,true,false),"https://ticketsbar.es",41.3761,-2.1698),
    v("El Nacional","Multi-concept","Four restaurants in one stunning Art Deco space",4.6,f(false,false,true,false,true,true,false,false),"https://elnacional.cat",41.3896,-2.1686),
    v("Bodega Sepúlveda","Catalan Wine Bar","Old-school bodega, locals love it, timeless",4.5,f(false,false,false,true,false,false,false,true),"https://bodegasepulveda.com",41.3801,-2.1558),
    v("Bar Calders","Tapas Bar","Sant Antoni neighborhood bar, best vermouth in Barcelona",4.5,f(false,false,true,false,false,false,false,false),"https://barcalders.com",41.3781,-2.1638),
    v("Bodega Celler de Can Roca","Catalan","Suburban gem with bottles from the three-star can roca",4.6,f(false,false,false,true,false,false,false,true),"https://cellercanroca.com",41.9862,-2.8243),
    v("Compartir","Catalan Sharing","Former El Celler de Can Roca team, sharing plates",4.7,f(false,false,true,false,false,false,true,false),"https://compartirbarcelona.com",41.3851,-2.1738),
    v("La Mar Salada","Seafood","Best paella and seafood near Barceloneta beach",4.5,f(false,false,false,true,false,false,false,false),"https://lamarsalada.com",41.3761,-2.1878),
    v("Espai Mescladís","Mediterranean","Social enterprise restaurant, lovely outdoor garden",4.4,f(false,false,false,false,false,false,false,true),"https://espaimescladis.net",41.3851,-2.1728),
    v("Xerta","Ebro Delta Catalan","One Michelin star, Ohla Eixample hotel",4.6,f(true,false,false,false,false,false,true,true),"https://xertarestaurant.com",41.3931,-2.1658),
    v("Belcanto Barcelona","Portuguese-Catalan","José Avillez's Barcelona venture, creative Mediterranean",4.6,f(false,true,true,false,false,false,true,false),"https://belcanto.pt",41.3851,-2.1738),
    v("El Xampanyet","Cava Bar","Barceloneta cava bar since 1929, Catalan classics",4.5,f(false,false,false,true,false,false,false,false),"https://elxampanyet.cat",41.3841,-2.1788),
    v("Bar Marsella","Absinthe Bar","Oldest bar in Barcelona since 1820, atmospheric and historic",4.4,f(false,false,false,true,true,false,false,false),"https://barmarsella.es",41.3791,-2.1748),
    v("Dry Martini","Cocktail Bar","Barcelona's most elegant cocktail bar since 1978",4.6,f(false,false,false,true,true,false,false,true),"https://drymartiniorg.com",41.3921,-2.1478),
    v("Dr. Stravinsky","Cocktail Bar","El Born's innovative molecular cocktail bar",4.5,f(false,false,true,false,false,false,false,false),"https://drstravinsky.com",41.3851,-2.1788),
    v("Bar Mut","Wine Bar","Upscale wine bar and vermouth, Eixample classic",4.5,f(false,false,false,true,true,false,false,true),"https://barmut.com",41.3951,-2.1518),
    v("Cervecería Catalana","Catalan Tapas","Eixample institution for pintxos and craft beer",4.4,f(false,false,false,true,false,false,false,false),"https://cerveseriacatalana.com",41.3921,-2.1568),
    v("La Cova Fumada","Tapas","Working-class Barceloneta legend, birthplace of bombas",4.5,f(false,false,false,true,false,false,false,false),"https://lacovafumada.es",41.3741,-2.1878),
    v("Roca Moo","Contemporary Catalan","One Michelin star, Hotel Omm, Can Roca brothers",4.7,f(true,false,false,false,true,false,true,true),"https://hotelmoo.com/en/restaurante",41.3921,-2.1628),
    v("Enigma","Avant-garde","Albert Adrià's otherworldly tasting experience",4.7,f(false,false,true,false,true,false,true,true),"https://enigmaconcept.es",41.3791,-2.1608),
    v("Speakeasy","Cocktail Bar","Hidden bar inside Dry Martini restaurant",4.5,f(false,false,true,false,true,false,true,false),"https://speakeasybarcelona.com",41.3921,-2.1478),
    v("Bar Calders Vermouth","Vermouth Bar","Best traditional vermouth ritual in Sant Antoni",4.4,f(false,false,false,true,false,false,false,false),"https://barcalders.com",41.3761,-2.1648),
    v("La Pepita","Bocadillo Bar","Gracia neighborhood gem, creative sandwiches and wine",4.4,f(false,true,true,false,false,false,false,false),"https://lapepita.com",41.4041,-2.1558),
    v("Espai Barcelona","Catalan Tasting","Hidden market restaurant, chef's table format",4.5,f(false,false,false,false,false,false,true,true),"https://espaibarcelona.com",41.3841,-2.1768),
    v("Ocaña","Mediterranean Terrace","Plaza Reial's terrace restaurant and bar, lively scene",4.3,f(false,false,true,false,true,true,false,false),"https://ocana.cat",41.3801,-2.1748),
    v("Bodega Bonavista","Natural Wine","Gracia natural wine bar, charcuterie and cheese",4.5,f(false,false,true,false,false,false,false,true),"https://bodegabonavista.com",41.4011,-2.1578),
  ],

  "Milan": [
    v("Il Luogo di Aimo e Nadia","Italian Contemporary","Two Michelin stars, seasonal Italian, Milanese classic",4.9,f(true,false,false,true,false,false,true,true),"https://aimoenadia.com",45.4529,-9.1471),
    v("Enrico Bartolini at Mudec","Italian Contemporary","Three Michelin stars, museum dining, exceptional",4.9,f(true,false,true,false,false,false,true,true),"https://enricobartolini.net/mudec",45.4509,-9.1691),
    v("Seta by Antonio Guida","Italian","Two Michelin stars, Mandarin Oriental Milan",4.8,f(true,false,false,true,true,false,true,true),"https://mandarinoriental.com/milan/via-andegari/fine-dining",45.4659,-9.1891),
    v("Berton","Contemporary Italian","One Michelin star, sleek minimalist design dining",4.7,f(true,false,true,false,false,false,true,true),"https://ristoranteberton.com",45.4773,-9.1891),
    v("Contraste","Italian Contemporary","Two Michelin stars, creative and inventive, Brera",4.8,f(true,false,true,false,false,false,true,true),"https://contrastemilano.it",45.4709,-9.1831),
    v("Osteria dell'Enoteca","Italian","One Michelin star, Florence-born chef, refined",4.7,f(true,false,false,true,false,false,true,true),"https://osteriadell-enoteca.it",45.4629,-9.1971),
    v("Alice Ristorante","Italian Seafood","One Michelin star, Eataly Milan's flagship restaurant",4.6,f(true,false,false,false,false,false,true,true),"https://aliceristorantemilano.it",45.4639,-9.1911),
    v("Cracco","Italian Contemporary","Carlo Cracco's two-star Galleria restaurant",4.7,f(true,false,true,false,true,false,true,false),"https://ristorantecracco.it",45.4659,-9.1921),
    v("Il Ristorante Trussardi alla Scala","Italian","Two Michelin stars, opera-adjacent luxury",4.7,f(true,false,false,true,true,false,true,true),"https://trussardiallascala.com",45.4669,-9.1911),
    v("Savini","Italian","Galleria Vittorio Emanuele II icon since 1867",4.6,f(false,false,false,true,true,false,false,true),"https://savinimilano.it",45.4659,-9.1921),
    v("Bar Basso","Cocktail Bar","Negroni Sbagliato birthplace, design week legend",4.6,f(false,false,false,true,true,false,false,false),"https://barbasso.com",45.4778,-9.2058),
    v("Dry Milano","Cocktail Bar","Craft cocktails and Neapolitan pizza, Brera",4.6,f(false,false,true,false,true,false,false,false),"https://drymilano.it",45.4709,-9.1851),
    v("Nottingham Forest","Cocktail Bar","Legendary cocktail bar, Enrico Meschini",4.5,f(false,false,false,true,true,false,false,false),"https://nottinghamforestbar.com",45.4739,-9.1731),
    v("Ceresio 7","Rooftop Bar","Design hotel rooftop pools and cocktails, Porta Garibaldi",4.6,f(false,false,true,false,true,false,false,false),"https://ceresio7.com",45.4789,-9.1811),
    v("Circolo Filologico Milanese","Private Members Club","One of Milan's most storied intellectual private clubs",4.5,f(false,false,false,true,true,false,true,true,true),"https://circolofilologico.it",45.4669,-9.1871),
    v("Il Salumaio di Montenapoleone","Italian","Via Montenapoleone institution, fashion week essential",4.6,f(false,false,false,true,true,false,false,true),"https://ilsalumaiodimontenapoleone.it",45.4679,-9.1961),
    v("Peck","Italian Deli","Milan's most famous food shop and restaurant since 1883",4.6,f(false,false,false,true,true,false,false,false),"https://peck.it",45.4649,-9.1901),
    v("Terrazza Aperol","Aperitivo Bar","Duomo views, the ultimate Milanese aperitivo experience",4.4,f(false,false,true,false,true,false,false,false),"https://terrazzaaperoldiapertura.it",45.4659,-9.1931),
    v("Pescaria","Seafood Casual","Best fish sandwiches in Milan, cult street food",4.5,f(false,false,true,false,false,false,false,false),"https://pescaria.it",45.4799,-9.1831),
    v("Ratanà","Milanese","Celebrates traditional Milanese cuisine, beloved local",4.6,f(false,false,false,true,false,false,false,true),"https://ratana.it",45.4789,-9.1891),
    v("Langosteria","Italian Seafood","The chicest seafood restaurant in Milan",4.7,f(false,false,true,false,true,false,true,false),"https://langosteria.com",45.4669,-9.1781),
    v("Carlo e Camilla in Segheria","Italian","Dinner-theatre in a sawmill, theatrical and fun",4.5,f(false,false,true,false,true,false,false,false),"https://carloeocamillia.com",45.4619,-9.1881),
    v("Unico","Contemporary Italian","Skyscraper restaurant, 360 degree views of Milan",4.5,f(false,false,true,false,true,false,false,false),"https://unicomilano.it",45.4829,-9.1721),
    v("Giacomo Bistrot","Italian Bistro","Fashion crowd institution, Brera classic",4.5,f(false,false,false,true,true,false,false,true),"https://giacomobistrot.com",45.4729,-9.1851),
    v("Frida","Aperitivo","Isola neighborhood aperitivo bar with a garden",4.4,f(false,false,true,false,false,false,false,false),"https://fridamilano.it",45.4849,-9.1951),
    v("10 Corso Como Café","Design Café","Design space café, fashion week essential",4.4,f(false,false,true,false,true,false,false,false),"https://10corsocomo.com",45.4799,-9.1901),
    v("Bice","Italian","Historic Milanese restaurant beloved by fashion world",4.4,f(false,false,false,true,true,false,false,true),"https://biceristorante.com",45.4679,-9.1951),
    v("Quattro Mori","Sardinian","Authentic Sardinian in the heart of Milan",4.4,f(false,false,false,true,false,false,false,false),"https://quattromori.it",45.4639,-9.1901),
    v("Bulk","American Bar","Cocktails and burgers, Porta Garibaldi hipster scene",4.3,f(false,false,true,false,false,false,false,false),"https://bulkmilano.com",45.4809,-9.1841),
    v("Straf Bar","Cocktail Bar","Design hotel bar, Via Torino, sleek and modern",4.4,f(false,false,true,false,true,false,false,true),"https://straf.it",45.4659,-9.1891),
  ],

  "Washington DC": [
    v("Inn at Little Washington","American Contemporary","Three Michelin stars, Patrick O'Connell's masterpiece",4.9,f(true,false,false,true,true,false,true,true),"https://theinnatlittlewashington.com",38.9072,-77.0369),
    v("Minibar by José Andrés","Avant-garde","Two Michelin stars, 20-course theatrical tasting menu",4.9,f(true,false,true,false,true,false,true,true),"https://minibarbyandres.com",38.8977,-77.0255),
    v("Pineapple and Pearls","Contemporary American","Two Michelin stars, Aaron Silverman's luxury tasting menu",4.8,f(true,false,false,false,false,false,true,true),"https://pineappleandpearls.com",38.8817,-77.0035),
    v("Bresca","Contemporary American","One Michelin star, Ryan Ratino's creative tasting menu",4.8,f(true,false,true,false,false,false,true,true),"https://brescadc.com",38.9098,-77.0321),
    v("Jônt","Japanese-French Fusion","One Michelin star, Ryan Ratino's omakase upstairs",4.8,f(true,false,true,false,false,false,true,true),"https://jontdc.com",38.9098,-77.0321),
    v("Cranes","Spanish-Japanese","One Michelin star, Penn Quarter fusion",4.7,f(true,false,true,false,false,false,true,true),"https://cranesdc.com",38.8967,-77.0265),
    v("Le Diplomate","French Brasserie","DC's most beloved brasserie, perpetual hot spot",4.7,f(false,false,true,false,true,false,true,false),"https://lediplomatedc.com",38.9093,-77.0322),
    v("Gravitas","Contemporary American","One Michelin star, Matt Baker's tasting menu, H Street",4.7,f(true,false,false,false,false,false,true,true),"https://gravitasrestaurant.com",38.8997,-76.9935),
    v("Columbia Room","Cocktail Bar","Michelin-starred cocktail bar, three rooms, exceptional",4.8,f(true,false,true,false,false,false,true,true),"https://columbiaroomdc.com",38.9127,-77.0301),
    v("Tail Up Goat","Caribbean-Inspired","One Michelin star, Adams Morgan's most creative kitchen",4.7,f(true,false,true,false,false,false,true,false),"https://tailupgoat.com",38.9227,-77.0381),
    v("Rose's Luxury","American","James Beard Award, Capitol Hill charmer, no reservations",4.7,f(false,false,true,false,false,false,false,false),"https://rosesluxury.com",38.8817,-77.0035),
    v("Fiola","Italian","Fabio Trabocchi's two-Michelin-star Penn Quarter Italian",4.8,f(true,false,false,true,true,false,true,true),"https://fioladc.com",38.8967,-77.0235),
    v("The Prime Rib","Steakhouse","DC's power steakhouse since 1976, black tie required",4.7,f(false,false,false,true,true,false,false,true),"https://theprimerib.com/dc",38.9008,-77.0445),
    v("Rasika","Indian","Two locations, best Indian in America, James Beard nominated",4.7,f(false,false,true,false,false,false,true,false),"https://rasikarestaurant.com",38.8987,-77.0195),
    v("Jaleo","Spanish","José Andrés' flagship tapas, Penn Quarter institution",4.6,f(false,false,true,false,true,false,false,false),"https://jaleo.com/location/jaleo-dc",38.8977,-77.0245),
    v("Dabney","Mid-Atlantic","One Michelin star, Jeremiah Langhorne, exceptional local",4.7,f(true,false,false,false,false,false,true,true),"https://thedabney.com",38.9077,-77.0221),
    v("The Red Hen","Italian-American","Bloomingdale neighborhood Italian, DC's best pasta",4.6,f(false,false,true,false,false,false,true,false),"https://theredhendc.com",38.9127,-77.0111),
    v("Centrolina","Italian","Amy Brandwein's Penn Quarter Italian, pasta master",4.6,f(false,false,true,false,false,false,false,true),"https://centrolinadc.com",38.9007,-77.0235),
    v("Arroz","Spanish-Portuguese","José Andrés' hotel restaurant, stunning Moor-inspired",4.6,f(false,false,true,false,true,false,false,true),"https://arrozdc.com",38.9058,-77.0201),
    v("Jack Rose Dining Saloon","Whiskey Bar","Adams Morgan whiskey bar, 2,700 bottles, extraordinary",4.6,f(false,false,false,true,true,false,false,false),"https://jackrosediningsaloon.com",38.9217,-77.0381),
    v("The Occidental Grill","American","Pennsylvania Avenue power lunch, near White House",4.5,f(false,false,false,true,true,false,false,false),"https://occidentaldc.com",38.8987,-77.0355),
    v("Tail Up Goat","Contemporary","Beautifully inventive Adams Morgan restaurant",4.6,f(true,false,true,false,false,false,true,false),"https://tailupgoat.com",38.9217,-77.0371),
    v("The Riggsby","American","Carlyle Hotel's James Beard-nominated brasserie",4.5,f(false,false,false,true,true,false,false,true),"https://theriggsby.com",38.9108,-77.0451),
    v("Estadio","Spanish","Logan Circle Spanish, best jamón in DC",4.5,f(false,false,true,false,false,false,false,false),"https://estadio-dc.com",38.9087,-77.0301),
    v("Metier","Contemporary American","One Michelin star, intimate tasting menu, Dupont Circle",4.7,f(true,false,false,false,false,false,true,true),"https://metierdc.com",38.9107,-77.0431),
    v("Off The Record","Bar","Hay-Adams Hotel bar, political power drinking below White House",4.5,f(false,false,false,true,true,false,false,true),"https://hayadams.com/dining/off-the-record",38.8987,-77.0375),
    v("Tiger Fork","Hong Kong","Blagden Alley's dim sum and cocktail destination",4.5,f(false,false,true,false,false,false,false,false),"https://tigerforkdc.com",38.9057,-77.0231),
    v("Unconventional Diner","American","Shaw diner with James Beard-nominated chef",4.5,f(false,true,true,false,false,false,false,false),"https://unconventionaldiner.com",38.9117,-77.0201),
    v("The Capital Grille","Steakhouse","DC power dining, Penn Quarter classic steakhouse",4.5,f(false,false,false,true,true,false,false,true),"https://thecapitalgrille.com/locations/dc",38.8987,-77.0225),
    v("Metropolitan Club","Private Members Club","One of DC's oldest and most prestigious private clubs",4.6,f(false,false,false,true,true,false,true,true,true),"https://metropolitanclubdc.org",38.9028,-77.0395),
  ],

  "Cannes": [
    v("La Palme d'Or","French Riviera","Two Michelin stars, Hotel Martinez, film festival icon",4.9,f(true,false,false,true,true,false,true,true),"https://hotel-martinez.hyatt.com",43.5490,-7.0186),
    v("Mantel","French Contemporary","One Michelin star, inventive Riviera cuisine",4.7,f(true,false,true,false,false,false,true,true),"https://restaurantmantel.com",43.5508,-7.0176),
    v("Baoli Beach","Mediterranean Beach Club","Glamorous festival beach club, celebrity epicenter",4.5,f(false,false,true,false,true,true,false,false),"https://baolicannes.com",43.5479,-7.0225),
    v("La Môme","French Mediterranean","New luxury rooftop restaurant, Grand Hyatt Cannes",4.7,f(false,true,true,false,true,false,true,false),"https://lamome-cannes.com",43.5490,-7.0196),
    v("Fouquet's Cannes","French Brasserie","Film festival HQ, Majestic Barrière hotel",4.6,f(false,false,false,true,true,false,false,false),"https://fouquets-cannes.com",43.5490,-7.0176),
    v("38 The Restaurant","French","InterContinental Carlton's terrace restaurant",4.6,f(false,false,false,true,true,false,false,true),"https://ichotelsgroup.com",43.5500,-7.0186),
    v("La Cave","Wine Bar","Best wine bar in Cannes, local and natural bottles",4.5,f(false,false,true,false,false,false,false,true),"https://lacavecannes.com",43.5518,-7.0196),
    v("Aux Bons Enfants","French Bistro","Cannes institution since 1935, cash only, legendary",4.6,f(false,false,false,true,false,false,false,false),"https://auxbonsenfants.net",43.5518,-7.0196),
    v("Le Jardin","French Mediterranean","Park hotel's beautiful garden restaurant",4.5,f(false,false,false,true,false,false,false,true),"https://le-jardin-cannes.com",43.5528,-7.0186),
    v("Casa Italia","Italian","Best Italian on the Croisette, simple and excellent",4.4,f(false,false,false,true,false,false,false,false),"https://casaitaliacannes.com",43.5508,-7.0196),
    v("Volupté","Rooftop Bar","JW Marriott rooftop, panoramic Riviera views",4.5,f(false,false,true,false,true,false,false,false),"https://jwcannes.com",43.5490,-7.0186),
    v("Le Galion","French","Old Port classic, fresh Provençal cuisine",4.4,f(false,false,false,true,false,false,false,false),"https://legalioncannes.com",43.5528,-7.0216),
    v("Le Farfalla","Italian","Popular Italian near the Palais, festival crowd",4.4,f(false,false,true,false,true,false,false,false),"https://lefarfallacannes.com",43.5498,-7.0196),
    v("Lérins","Provençal","Île Sainte-Honorat monastery restaurant, ferry required",4.6,f(false,false,false,true,false,false,false,true),"https://abbayedelerins.com",43.5120,-7.0490),
    v("Plage du Festival","Beach Club","The Croisette's chicest festival beach club",4.4,f(false,false,true,false,true,true,false,false),"https://plage-du-festival.com",43.5490,-7.0186),
    v("Tarterie & Co","French Café","Lovely breakfast and lunch spot near the Marché Forville",4.3,f(false,false,false,false,false,false,false,false),"https://tarterieandco.fr",43.5538,-7.0196),
    v("Le Bâoli Sushi","Japanese","Sister sushi restaurant of the famous beach club",4.5,f(false,false,true,false,true,false,false,false),"https://baolicannes.com",43.5479,-7.0225),
    v("Le Maschou","French Grill","Wooden beams and open fire, old Cannes charm",4.5,f(false,false,false,true,false,false,false,true),"https://lemaschou.fr",43.5528,-7.0206),
    v("Cave de la Coopérative","Wine Bar","Provençal cooperative wines, excellent value",4.4,f(false,false,false,true,false,false,false,false),"https://cavecannes.fr",43.5538,-7.0206),
    v("L'Oasis","French Riviera","Historical La Napoule restaurant, lobster and sea views",4.6,f(false,false,false,true,false,false,false,true),"https://oasis-raimbault.com",43.5160,-6.9560),
  ],

  "Mykonos": [
    v("Nobu Mykonos","Japanese-Peruvian","Glamorous clifftop Nobu, jet-set crowd, exceptional",4.8,f(false,false,true,false,true,false,true,false),"https://noburestaurants.com/mykonos",37.4467,-25.3289),
    v("Spilia","Seafood","Sea cave setting, dramatic cliffside location, romantic",4.8,f(false,false,true,false,true,false,true,true),"https://spilia.gr",37.4312,-25.3195),
    v("Scorpios","Mediterranean Beach Club","Island's most iconic sunset beach club and restaurant",4.7,f(false,false,true,false,true,true,false,false),"https://scorpiosmykonos.com",37.4201,-25.3401),
    v("Interni","Mediterranean","Romantic garden setting in Mykonos Town, classic",4.6,f(false,false,false,true,true,false,false,true),"https://internirestaurant.com",37.4454,-25.3283),
    v("Remezzo","Cocktail Bar","Iconic Little Venice waterfront bar, legendary sunsets",4.5,f(false,false,false,true,true,false,false,false),"https://remezzomykonos.com",37.4452,-25.3274),
    v("Nammos","Mediterranean Beach","Psarou Beach's glamorous beach club and restaurant",4.6,f(false,false,true,false,true,false,false,false),"https://nammos.gr",37.4181,-25.3411),
    v("Katrin","Greek","Old Town institution since 1969, traditional and beloved",4.5,f(false,false,false,true,false,false,false,true),"https://katrinmykonos.gr",37.4454,-25.3283),
    v("Nice n Easy","Greek Organic","Organic Mediterranean, Little Venice views",4.5,f(false,false,true,false,false,false,false,false),"https://niceandeasymykonos.com",37.4452,-25.3274),
    v("M-eating","Greek Contemporary","Modern Greek, award-winning, Mykonos Town",4.6,f(false,false,true,false,false,false,true,false),"https://m-eating.gr",37.4464,-25.3283),
    v("Kiku","Japanese","Best Japanese on the island, sushi and robata",4.5,f(false,false,true,false,true,false,false,false),"https://kikumykonos.com",37.4454,-25.3293),
    v("Fokos Taverna","Greek","Remote beach taverna, traditional and magical",4.7,f(false,false,false,true,false,false,false,true),"https://fokostaveran.gr",37.4801,-25.3551),
    v("Funky Kitchen","Fusion","Creative Mediterranean fusion, lively atmosphere",4.4,f(false,false,true,false,false,false,false,false),"https://funkykitchenmykonos.com",37.4464,-25.3273),
    v("Sea Satin Market","Seafood","Little Venice seafood under the windmills, magical setting",4.5,f(false,false,false,true,false,false,false,false),"https://seasatinmarket.gr",37.4444,-25.3264),
    v("The Wild","Mediterranean","Beach club and restaurant, Paraga Beach",4.5,f(false,false,true,false,true,true,false,false),"https://thewildmykonos.com",37.4181,-25.3451),
    v("Joanna's Nikos Place","Greek","Family-run Ornos Beach favorite, fresh fish",4.4,f(false,false,false,true,false,false,false,false),"https://joannas-nikos.gr",37.4231,-25.3381),
    v("Cavo Paradiso","Nightclub","Legendary cliffside superclub, sunrise parties",4.3,f(false,false,true,false,true,true,false,false),"https://cavoparadiso.gr",37.4141,-25.3281),
    v("Babylon","Bar","Little Venice gay bar, legendary sunset cocktails",4.3,f(false,false,true,false,true,false,false,false),"https://babylonmykonos.gr",37.4452,-25.3264),
    v("Super Paradise Beach Club","Beach Club","The most famous beach club in Mykonos",4.3,f(false,false,true,false,true,true,false,false),"https://superparadise.com.gr",37.4151,-25.3351),
    v("Matsuhisa Mykonos","Japanese-Peruvian","Nobu Matsuhisa's Belvedere Hotel outpost",4.6,f(false,false,true,false,true,false,true,false),"https://belvedere.com/matsuhisa-mykonos",37.4464,-25.3313),
    v("Om Bar","Cocktail Bar","Sunset cocktails with the windmill views",4.4,f(false,false,true,false,false,false,false,false),"https://ombar.gr",37.4454,-25.3274),
    v("Avli tou Thodori","Greek","Charming courtyard taverna, local favorite",4.5,f(false,false,false,true,false,false,false,true),"https://avlimykonos.gr",37.4464,-25.3283),
    v("Pierro's Bar","Bar","Mykonos Town's most famous late-night bar since 1970",4.2,f(false,false,true,false,true,true,false,false),"https://pierrosmykonos.com",37.4454,-25.3283),
    v("Galleraki","Wine Bar","Little Venice wine bar, best tables over the water",4.4,f(false,false,false,true,false,false,false,true),"https://galleraki.gr",37.4452,-25.3274),
    v("Krama","Mediterranean","Rooftop restaurant, stunning views across the town",4.5,f(false,false,true,false,false,false,false,false),"https://kramarestarant.com",37.4464,-25.3293),
    v("Elysium Hotel Restaurant","Greek-Mediterranean","Gay-friendly hotel restaurant with sweeping views",4.4,f(false,false,true,false,true,false,false,false),"https://elysiumhotel.com",37.4454,-25.3303),
    v("Tasos","Greek Seafood","Paraga Beach family taverna, ultra-fresh fish",4.5,f(false,false,false,true,false,false,false,false),"https://tasosmykonos.gr",37.4181,-25.3441),
    v("Alegria","Cocktail Bar","Late-night cocktail bar, Mykonos Town",4.3,f(false,false,true,false,true,true,false,false),"https://alegriamykonos.com",37.4454,-25.3283),
    v("Buddha Bar Beach","Asian Fusion","Lia Beach Buddha Bar outpost, DJ sets and cocktails",4.4,f(false,false,true,false,true,true,false,false),"https://buddhabarhotels.com/mykonos",37.4161,-25.3481),
    v("Nikos Taverna","Greek","Old Town classic, best gyros and mezze",4.3,f(false,false,false,true,false,false,false,false),"https://nikostaverna.gr",37.4454,-25.3283),
    v("Little Venice Music Bar","Bar","Waterfront Little Venice bar, live music nightly",4.3,f(false,false,false,true,false,true,false,false),"https://littlevenicemykonos.com",37.4452,-25.3264),
    v("Zuma Mykonos","Japanese","Seasonal Zuma outpost at Santa Marina resort",4.6,f(false,false,true,false,true,false,true,false),"https://zumarestaurant.com/zuma-mykonos",37.4501,-25.3443),
  ],

  "Scottsdale": [
    v("Bourbon Steak","Steakhouse","Michael Mina's acclaimed steakhouse, butter-poached cuts",4.8,f(false,false,true,false,true,false,true,true),"https://michaelmina.net/restaurants/bourbon-steak-scottsdale",33.5092,-111.8983),
    v("FnB","Arizona Cuisine","Charleen Badman's James Beard-winning farm-to-table",4.8,f(false,false,false,true,false,false,false,true),"https://fnbrestaurant.com",33.4943,-111.9254),
    v("Kai","Native American","Only Native American-owned AAA Five Diamond restaurant",4.8,f(false,false,false,true,false,false,true,true),"https://wildhorsepass.com/kai",33.3012,-111.9462),
    v("Prado","Spanish Mediterranean","Omni Scottsdale's acclaimed Spanish restaurant",4.7,f(false,false,true,false,true,false,false,true),"https://omniscottsdaleresort.com/dining/prado",33.6032,-111.8543),
    v("Virtù Honest Craft","Mediterranean","James Beard nominated, intimate Old Town gem",4.7,f(false,false,true,false,false,false,true,true),"https://virtuhonestcraft.com",33.4953,-111.9264),
    v("Elements","Contemporary American","Sanctuary Resort's stunning mountain-view restaurant",4.7,f(false,false,false,true,true,false,true,true),"https://sanctuaryoncamelback.com/dining/elements",33.5292,-111.9703),
    v("Hana Japanese Eatery","Japanese","Best omakase in Arizona, intimate and brilliant",4.7,f(false,false,false,false,false,false,true,true),"https://hanajapanese.com",33.4973,-112.0804),
    v("Proof Canteen","American","Four Seasons Scottsdale's farm-to-table gem",4.6,f(false,false,true,false,true,false,false,true),"https://fourseasons.com/scottsdale/dining/restaurants/proof",33.6322,-111.8543),
    v("Talavera","Mediterranean","Four Seasons Troon North, stunning mountain setting",4.6,f(false,false,false,true,true,false,false,true),"https://fourseasons.com/scottsdale/dining/restaurants/talavera",33.6922,-111.8543),
    v("Sushi Roku","Japanese","Celebrity-friendly sushi, always a scene in Old Town",4.5,f(false,false,true,false,true,false,false,false),"https://sushiroku.com",33.4948,-111.9232),
    v("AZ/88","American Bar","Old Town institution, patio and cocktails, always packed",4.5,f(false,false,true,false,true,false,false,false),"https://az88.com",33.4943,-111.9264),
    v("Maple & Ash Scottsdale","Steakhouse","Chicago hit comes to Scottsdale, wood-fired excellence",4.6,f(false,false,true,false,true,false,false,false),"https://mapleandash.com/scottsdale",33.5002,-111.9264),
    v("Counter Intuitive","New American","Creative tasting menu, outstanding local talent",4.6,f(false,true,true,false,false,false,true,true),"https://counterintuitiveaz.com",33.4953,-111.9254),
    v("The Mission","Latin American","Old Town Latin restaurant, beautiful courtyard",4.5,f(false,false,true,false,true,false,false,false),"https://themissionaz.com",33.4943,-111.9264),
    v("Dominick's Steakhouse","Steakhouse","Classic steakhouse with live entertainment nightly",4.5,f(false,false,true,false,true,true,false,false),"https://dominickssteakhouse.com",33.5912,-111.8563),
    v("Olive & Ivy","Mediterranean","Waterfront Old Town patio, River Walk gem",4.5,f(false,false,true,false,true,false,false,false),"https://oliveandivy.com",33.4973,-111.9254),
    v("Steak 44","Steakhouse","Phoenix's power steakhouse, outstanding cellar",4.6,f(false,false,true,false,true,false,false,true),"https://steak44.com",33.5032,-112.0214),
    v("Lon's at the Hermosa","Southwestern","Hermosa Inn's romantic ranch restaurant",4.6,f(false,false,false,true,true,false,false,true),"https://lonshermosa.com",33.5092,-111.9543),
    v("Cafe Monarch","French-American","Intimate fine dining room, outstanding prix fixe",4.6,f(false,false,false,false,false,false,true,true),"https://cafemonarh.com",33.5002,-111.9254),
    v("Diego Pops","Mexican","Fun agave bar and modern Mexican in Old Town",4.4,f(false,false,true,false,true,false,false,false),"https://diegopops.com",33.4943,-111.9274),
    v("Handlebar J","Country Bar","Old West country bar and BBQ, live music nightly",4.3,f(false,false,false,true,false,true,false,false),"https://handlebarj.com",33.6152,-111.8883),
    v("Zinc Bistro","French","Pinnacle Peak French bistro with Parisian charm",4.5,f(false,false,false,true,false,false,false,true),"https://zincbistroaz.com",33.6832,-111.8743),
    v("Mastro's Steakhouse","Steakhouse","Old Town power dining and live piano entertainment",4.5,f(false,false,true,false,true,true,false,false),"https://mastrosrestaurants.com/restaurant/city-grille-scottsdale",33.4953,-111.9264),
    v("Rancho Pinot","Southwestern","Rustically elegant neighborhood gem, 20+ year local",4.5,f(false,false,false,true,false,false,false,true),"https://ranchopinot.com",33.5782,-111.9254),
    v("Schmooze","Wine Bar","Best wine bar in Scottsdale, intimate and knowledgeable",4.4,f(false,false,false,true,false,false,false,true),"https://schmoozewinebar.com",33.4953,-111.9244),
    v("Ghost Ranch","Southwestern","Saddle brown leather and turquoise, Old Town cowboy chic",4.4,f(false,false,true,false,true,false,false,false),"https://ghostranchscottsdale.com",33.4943,-111.9274),
    v("Bandera","American","Rotisserie chicken and cocktails, indoor-outdoor Scottsdale",4.4,f(false,false,true,false,false,false,false,false),"https://banderarestaurants.com/scottsdale",33.5092,-111.8993),
    v("Grassroots Kitchen & Tap","American","North Scottsdale community restaurant and craft beer",4.3,f(false,false,false,true,false,false,false,false),"https://grassrootskitchenandtap.com",33.6832,-111.8953),
    v("Over Easy","Breakfast","Best breakfast in Scottsdale, two locations",4.4,f(false,false,false,true,false,false,false,false),"https://overeasyaz.com",33.4953,-111.9254),
    v("Oregano's","Italian-American","Arizona chain beloved by all, best pizza in the valley",4.2,f(false,false,false,true,false,false,false,false),"https://oreganos.com",33.4943,-111.9264),
  ],

  "Napa": [
    v("The French Laundry","Contemporary American","Thomas Keller's three-star temple, Yountville",4.9,f(true,false,false,true,true,false,true,true),"https://frenchlaundry.com",38.4044,-122.3647),
    v("Restaurant at Meadowood","Contemporary American","Three Michelin stars, luxury resort dining",4.9,f(true,false,false,true,true,false,true,true),"https://meadowood.com/restaurant",38.5012,-122.4892),
    v("Bouchon Bistro","French Bistro","Thomas Keller's charming Yountville French bistro",4.7,f(false,false,false,true,true,false,false,true),"https://bouchonbistro.com",38.4047,-122.3640),
    v("Ad Hoc","American","Thomas Keller's family-style comfort food, Yountville",4.7,f(false,false,false,true,false,false,false,false),"https://adhocrestaurant.com",38.4055,-122.3647),
    v("The Charter Oak","Californian","St. Helena Wood-fired and local, CharterOak winery",4.7,f(false,false,true,false,false,false,false,true),"https://thecharteroak.com",38.5066,-122.4700),
    v("Redd","Contemporary Californian","Yountville's most celebrated second restaurant",4.6,f(false,false,true,false,true,false,false,true),"https://reddnapavalley.com",38.4047,-122.3647),
    v("Bottega","Italian","Michael Chiarello's Yountville Italian, always packed",4.6,f(false,false,true,false,true,false,false,false),"https://botteganapavalley.com",38.4047,-122.3637),
    v("Morimoto Napa","Japanese","Iron Chef's Napa outpost, outstanding sushi",4.6,f(false,false,true,false,true,false,false,false),"https://morimotonapa.com",38.2975,-122.2852),
    v("Zuzu","Spanish Tapas","Lively downtown Napa tapas, great wine list",4.5,f(false,false,false,false,true,false,false,false),"https://zuzunapa.com",38.2975,-122.2852),
    v("Angèle","French Brasserie","Downtown Napa riverfront French brasserie",4.6,f(false,false,false,true,false,false,false,true),"https://angelerestaurant.com",38.2985,-122.2862),
    v("Ubuntu","Vegetarian","James Beard nominated vegetable-focused restaurant",4.6,f(false,false,true,false,false,false,true,true),"https://ubuntunapa.com",38.2985,-122.2862),
    v("The Thomas","American","Downtown Napa rooftop, farm-to-table American",4.5,f(false,false,true,false,false,false,false,false),"https://thethomasnapa.com",38.2975,-122.2862),
    v("Cole's Chop House","Steakhouse","Downtown Napa's power steakhouse, dry-aged perfection",4.6,f(false,false,false,true,true,false,false,true),"https://coleschophouse.com",38.2985,-122.2852),
    v("Bistro Jeanty","French Bistro","Yountville French bistro, comfort classic",4.5,f(false,false,false,true,false,false,false,true),"https://bistrojeanty.com",38.4047,-122.3637),
    v("Farmstead at Long Meadow Ranch","Californian","St. Helena winery restaurant, garden-to-table",4.6,f(false,false,false,true,false,false,false,true),"https://longmeadowranch.com/eat-and-drink/farmstead",38.5066,-122.4690),
    v("Tra Vigne","Italian","St. Helena valley landmark, beautiful courtyard",4.4,f(false,false,false,true,false,false,false,true),"https://travignenapavalley.com",38.5063,-122.4699),
    v("Mustards Grill","Californian","Napa institution since 1983, best burger in wine country",4.6,f(false,false,false,true,true,false,false,false),"https://mustardsgrill.com",38.4282,-122.3927),
    v("Goose & Gander","American","Speakeasy-style bar and seasonal menu in St. Helena",4.5,f(false,false,false,true,false,false,false,false),"https://goosegander.com",38.5063,-122.4699),
    v("Torc","Contemporary American","Downtown Napa tasting menu, great value",4.5,f(false,false,true,false,false,false,true,true),"https://torcnapa.com",38.2985,-122.2852),
    v("La Toque","French","One Michelin star, Westin Verasa downtown",4.6,f(true,false,false,true,false,false,true,true),"https://latoque.com",38.2985,-122.2862),
    v("Rutherford Grill","American","Classic wine country tavern, rotisserie chicken",4.5,f(false,false,false,true,false,false,false,false),"https://rutherfordgrill.com",38.4597,-122.4117),
    v("Press","Steakhouse","St. Helena's premier steakhouse, world-class cellar",4.6,f(false,false,false,true,true,false,false,true),"https://pressnapavalley.com",38.5066,-122.4700),
    v("Bounty Hunter Wine Bar","Wine Bar","Downtown Napa wine bar, over 40 wines by the glass",4.5,f(false,false,false,true,false,false,false,false),"https://bountyhunterwine.com",38.2985,-122.2852),
    v("Grace's Table","Eclectic","Downtown Napa neighborhood gem, great brunch",4.4,f(false,false,false,true,false,false,false,false),"https://gracestable.net",38.2985,-122.2862),
    v("Carpe Diem Wine Bar","Wine Bar","Romantic wine bar, over 100 wines by the glass",4.4,f(false,false,false,true,false,false,false,false),"https://carpediemwinebar.com",38.2975,-122.2852),
    v("Oenotri","Southern Italian","Downtown Napa Calabrian pasta, wood-fired excellence",4.6,f(false,false,true,false,false,false,false,false),"https://oenotri.com",38.2985,-122.2862),
    v("Boon Fly Café","American","Carneros Inn's casual diner, outstanding breakfast",4.5,f(false,false,false,true,false,false,false,false),"https://boonflycafe.com",38.2445,-122.3627),
    v("Taqueria Maria","Mexican","Downtown Napa taco institution, cheap and perfect",4.4,f(false,false,false,true,false,false,false,false),"https://taqueriamaria.com",38.2975,-122.2852),
    v("Kitchen Door","Eclectic","Oxbow Market's beloved quick-service gem",4.4,f(false,false,true,false,false,false,false,false),"https://kitchendoornapa.com",38.2975,-122.2862),
    v("Azzurro","Italian","Wood-fired Neapolitan pizza and pasta, downtown Napa",4.4,f(false,false,false,true,false,false,false,false),"https://azzurropizzeria.com",38.2985,-122.2862),
  ],

  "Sonoma": [
    v("The Girl & The Fig","French Country","Sonoma Square staple, James Beard nominated, beloved",4.7,f(false,false,false,true,false,false,false,true),"https://thegirlandthefig.com",38.2918,-122.4581),
    v("LaSalette","Portuguese","Unique Portuguese flavors in wine country, outstanding",4.6,f(false,false,false,false,false,false,false,true),"https://lasalette-restaurant.com",38.2920,-122.4575),
    v("El Dorado Kitchen","Californian","El Dorado Hotel's farm-to-table Sonoma gem",4.6,f(false,false,true,false,false,false,false,true),"https://eldoradosonoma.com",38.2918,-122.4581),
    v("Cafe La Haye","Californian","Sonoma Square tiny gem, James Beard nominated",4.7,f(false,false,false,true,false,false,true,true),"https://cafelahaye.com",38.2918,-122.4571),
    v("Harvest Moon Café","Californian","Seasonal menus, lovely Sonoma Square patio",4.6,f(false,false,false,true,false,false,false,true),"https://harvestmooncafesonoma.com",38.2928,-122.4581),
    v("Wit & Wisdom","American","MacArthur Place Hotel's lovely garden restaurant",4.5,f(false,false,false,true,false,false,false,true),"https://macarthurplace.com",38.2918,-122.4591),
    v("Estate","Californian","Mayo Family Winery's garden restaurant, beautiful patio",4.5,f(false,false,true,false,false,false,false,true),"https://estatesonoma.com",38.2918,-122.4571),
    v("Sunflower Caffé","Californian","Casual Sonoma Square café, great breakfast and brunch",4.4,f(false,false,false,true,false,false,false,false),"https://sunflowercaffe.com",38.2928,-122.4581),
    v("The Fremont Diner","American Diner","Sonoma's beloved roadside diner, weekend waits",4.5,f(false,false,false,true,false,false,false,false),"https://thefremontdiner.com",38.2618,-122.4761),
    v("Sebastiani Vineyards","Wine Bar","Historic Sonoma winery with excellent tasting room dining",4.5,f(false,false,false,true,false,false,false,false),"https://sebastiani.com",38.2908,-122.4561),
    v("Tasca Tasca","Portuguese Wine Bar","Natural wine and Portuguese small plates",4.5,f(false,false,true,false,false,false,false,true),"https://tascatasca.com",38.2918,-122.4571),
    v("Boon Eat + Drink","Californian","Guerneville casual Californian, Russian River Valley",4.5,f(false,false,true,false,false,false,false,false),"https://booneatanddrink.com",38.5088,-122.9881),
    v("Ramen Gaijin","Japanese","Sebastopol ramen destination, outstanding broth",4.5,f(false,false,true,false,false,false,false,false),"https://ramengaijin.com",38.4018,-122.8261),
    v("Zazu Kitchen + Farm","Californian","Farm restaurant, Duane Sorenson's Sonoma favorite",4.6,f(false,false,false,true,false,false,false,true),"https://zazukitchen.com",38.3918,-122.7861),
    v("Carneros Bistro","Californian","Lodge at Sonoma's elegant wine country bistro",4.5,f(false,false,false,true,false,false,false,true),"https://carnerosthecarnerosbistro.com",38.2448,-122.3718),
    v("Saddles Steakhouse","Steakhouse","MacArthur Place Hotel's classic wine country steakhouse",4.4,f(false,false,false,true,false,false,false,true),"https://saddlessonoma.com",38.2918,-122.4591),
    v("Glen Ellen Star","Californian","Ari Weiswasser's Glen Ellen wood-fired gem",4.7,f(false,false,true,false,false,false,true,true),"https://glenellenstar.com",38.3598,-122.5241),
    v("Hana Restaurant","Japanese","Rohnert Park outstanding Japanese, best in Sonoma County",4.6,f(false,false,false,true,false,false,false,true),"https://hanaJapanese.com",38.3398,-122.7011),
    v("Backyard","Californian","Forestville gem, outstanding seasonal California fare",4.6,f(false,false,true,false,false,false,true,true),"https://backyardforestville.com",38.4768,-122.9091),
    v("Peter Lowell's","Californian","Sebastopol farm-to-table pioneer, beloved organic dining",4.5,f(false,false,false,true,false,false,false,false),"https://peterlowell.com",38.4018,-122.8261),
    v("Sebastopol Inn Restaurant","Californian","Casual wine country dining, lovely garden",4.3,f(false,false,false,true,false,false,false,false),"https://sebastopolinn.com",38.4018,-122.8261),
    v("Handline","Seafood","Sebastopol fast casual seafood, James Beard nominated",4.5,f(false,false,true,false,false,false,false,false),"https://handline.com",38.4018,-122.8261),
    v("Fern Bar","Wine Bar","Guerneville's charming natural wine bar",4.5,f(false,false,true,false,false,false,false,true),"https://fernbar.com",38.5088,-122.9881),
    v("Bird & The Bottle","American","Sonoma Valley seasonal American, excellent burgers",4.4,f(false,false,false,true,false,false,false,false),"https://thebirdandthebottle.com",38.3618,-122.5451),
    v("The Fig Café","French Californian","Girl & The Fig's casual sister, Glen Ellen",4.6,f(false,false,false,true,false,false,false,true),"https://thefigcafe.com",38.3598,-122.5231),
    v("Figone's Olive Oil","Deli","Sonoma olive oil tasting room and casual bites",4.3,f(false,false,false,true,false,false,false,false),"https://figonesoliveoil.com",38.2918,-122.4581),
    v("Della Santina's","Italian","Sonoma Square family Italian, outdoor garden",4.4,f(false,false,false,true,false,false,false,true),"https://dellasantinas.com",38.2918,-122.4571),
    v("Murphy's Irish Pub","Pub","Sonoma Square pub, live music, local hangout",4.2,f(false,false,false,true,false,true,false,false),"https://sonomamurphys.com",38.2928,-122.4581),
    v("Swiss Hotel","Bar","Sonoma Square hotel bar since 1909, oldest in town",4.3,f(false,false,false,true,false,false,false,false),"https://swisshotelsonoma.com",38.2918,-122.4581),
    v("El Molino Central","Mexican","Sebastopol's beloved Mexican, hand-made tortillas",4.5,f(false,false,false,true,false,false,false,false),"https://elmolino central.com",38.3968,-122.8261),
  ],

  "Healdsburg": [
    v("SingleThread","Farm-to-Table","Three Michelin stars, farm-driven kaiseki, extraordinary",4.9,f(true,false,false,true,false,false,true,true),"https://singlethreadfarms.com",38.6110,-122.8698),
    v("Chalkboard","Contemporary American","Healdsburg's best downtown restaurant after SingleThread",4.7,f(false,false,true,false,false,false,true,false),"https://chalkboardhealdsburg.com",38.6110,-122.8698),
    v("Bravas Bar de Tapas","Spanish","Sonoma wine country tapas and cocktails, lively square",4.6,f(false,false,true,false,false,false,false,false),"https://bravashealdsburg.com",38.6100,-122.8688),
    v("Barndiva","Californian","Arts district garden restaurant, farm-to-table excellence",4.6,f(false,false,true,false,false,false,true,true),"https://barndiva.com",38.6100,-122.8698),
    v("Valette","Contemporary American","Healdsburg chef's homecoming, outstanding local menu",4.6,f(false,false,true,false,false,false,true,false),"https://valettehealdsburg.com",38.6110,-122.8688),
    v("Spoonbar","Craft Cocktails","h2hotel's acclaimed cocktail program, beautiful space",4.5,f(false,false,false,true,false,false,false,false),"https://h2hotel.com/spoonbar",38.6104,-122.8693),
    v("Campo Fina","Italian","Pizza and bocce ball in beautiful garden setting",4.5,f(false,false,true,false,false,false,false,false),"https://campofina.com",38.6110,-122.8688),
    v("Willi's Wine Bar","California","Healdsburg institution, innovative small plates",4.5,f(false,false,false,true,false,false,false,false),"https://williswinebar.net",38.6360,-122.8738),
    v("Mateo's Cocina Latina","Latin American","Yucatecan cuisine in wine country, unique and delicious",4.5,f(false,false,true,false,false,false,false,false),"https://mateoscocinalatina.com",38.6110,-122.8698),
    v("Dry Creek Kitchen","Californian","Charlie Palmer's Healdsburg Hotel restaurant",4.5,f(false,false,false,true,false,false,false,true),"https://drycreekkitchen.com",38.6110,-122.8698),
    v("Noble Folk Ice Cream","Ice Cream","Artisan ice cream and pie, Healdsburg Square",4.6,f(false,false,false,true,false,false,false,false),"https://thenoblefolk.com",38.6110,-122.8688),
    v("Shed","Californian","Fermentation bar and café, local food system champion",4.5,f(false,false,true,false,false,false,false,true),"https://healdsburgshed.com",38.6110,-122.8688),
    v("Flying Goat Coffee","Café","Sonoma County's best roaster, Healdsburg location",4.5,f(false,false,false,true,false,false,false,false),"https://flyinggoatcoffee.com",38.6110,-122.8698),
    v("Costeaux French Bakery","French Bakery","Healdsburg's beloved breakfast spot since 1923",4.4,f(false,false,false,true,false,false,false,false),"https://costeaux.com",38.6120,-122.8698),
    v("Bergamot Alley","Wine Bar","Natural wine bar, Healdsburg's best casual option",4.5,f(false,false,true,false,false,false,false,true),"https://bergamotalley.com",38.6110,-122.8688),
    v("Ravenous Café","American","Healdsburg neighborhood café, beloved by locals",4.4,f(false,false,false,true,false,false,false,false),"https://ravenoushealdsburg.com",38.6110,-122.8698),
    v("Rustic Restaurant at Ferrari-Carano","Californian","Winery restaurant with outstanding Sonoma wine selection",4.5,f(false,false,false,true,false,false,false,true),"https://ferrari-carano.com",38.7180,-122.9438),
    v("Bear Republic Brewing","Brewpub","Healdsburg craft beer institution, Racer 5 home",4.3,f(false,false,false,true,false,false,false,false),"https://bearrepublic.com",38.6110,-122.8698),
    v("Healdsburg Bar & Grill","American","Casual downtown American, great burgers",4.3,f(false,false,false,true,false,false,false,false),"https://healdsburgbarandgrill.com",38.6110,-122.8698),
    v("Alexander Valley Bar & Grill","California American","Laid-back Alexander Valley wine road stop",4.2,f(false,false,false,true,false,false,false,false),"https://avbg.com",38.7188,-122.9448),
    v("Portalupi Wine Company","Wine Bar","Intimate Healdsburg wine bar, boutique Italian-style",4.4,f(false,false,false,true,false,false,false,true),"https://portalupiwine.com",38.6110,-122.8688),
    v("Cyrus","French-Californian","Nick Peyton and Douglas Keane's legendary two-star return",4.8,f(true,true,false,true,false,false,true,true),"https://cyrusrestaurant.com",38.6120,-122.8698),
    v("Harmon Guest House Restaurant","Californian","Boutique hotel's standout seasonal menu",4.5,f(false,false,true,false,false,false,false,true),"https://harmonguesthouse.com",38.6110,-122.8688),
    v("The Matheson","Contemporary American","Healdsburg's celebrated rooftop cocktail bar",4.6,f(false,true,true,false,true,false,false,false),"https://thematheson.com",38.6110,-122.8698),
    v("Duke's Spirited Cocktails","Cocktail Bar","Healdsburg's best cocktail bar, farm-driven drinks",4.5,f(false,false,true,false,false,false,false,false),"https://dukesspiritedcocktails.com",38.6110,-122.8688),
    v("Willi's Seafood & Raw Bar","Seafood","Healdsburg seafood and cocktails, lively patio",4.5,f(false,false,true,false,false,false,false,false),"https://willisseafood.net",38.6360,-122.8748),
    v("Scopa","Italian","Healdsburg's beloved neighborhood Italian",4.6,f(false,false,false,true,false,false,true,false),"https://scopahealdsburg.com",38.6100,-122.8698),
    v("Oakville Grocery Healdsburg","Deli","Artisan deli and wine shop on the plaza",4.3,f(false,false,false,true,false,false,false,false),"https://oakvillegrocery.com",38.6110,-122.8688),
    v("Zin Restaurant","Californian","Healdsburg comfort food and wine, solid neighborhood pick",4.4,f(false,false,false,true,false,false,false,false),"https://zinrestaurant.com",38.6100,-122.8688),
    v("Moustache Baked Goods","Bakery","Healdsburg's best morning pastries and coffee",4.5,f(false,false,false,true,false,false,false,false),"https://moustachebakedgoods.com",38.6110,-122.8698),
  ],

  "St. Helena": [
    v("Press","Steakhouse","Napa Valley's premier steakhouse, world-class cellar",4.8,f(false,false,false,true,true,false,false,true),"https://pressnapavalley.com",38.5066,-122.4700),
    v("Farmstead at Long Meadow Ranch","Californian","Garden-to-table winery restaurant, beautiful setting",4.7,f(false,false,false,true,false,false,false,true),"https://longmeadowranch.com",38.5066,-122.4690),
    v("The Charter Oak","Californian","Wood-fired seasonal menu, CharterOak winery adjacent",4.7,f(false,false,true,false,false,false,false,true),"https://thecharteroak.com",38.5066,-122.4700),
    v("Cook St. Helena","Italian","Beloved Main Street Italian, pasta and wood-fired",4.6,f(false,false,false,true,false,false,false,false),"https://cooksthelena.com",38.5076,-122.4700),
    v("Goose & Gander","American","Speakeasy bar below, seasonal American above",4.5,f(false,false,false,true,false,false,false,true),"https://goosegander.com",38.5063,-122.4699),
    v("Tra Vigne","Italian","Valley landmark since 1987, beautiful courtyard",4.4,f(false,false,false,true,false,false,false,true),"https://travignenapavalley.com",38.5063,-122.4699),
    v("Market","American","St. Helena neighborhood restaurant, local favorite",4.5,f(false,false,false,true,false,false,false,false),"https://marketsthelena.com",38.5076,-122.4700),
    v("Cindy's Backstreet Kitchen","Californian","Cindy Pawlcyn's beloved casual St. Helena gem",4.5,f(false,false,false,true,false,false,false,false),"https://cindysbackstreetkitchen.com",38.5076,-122.4700),
    v("Pizzeria Tra Vigne","Italian","Casual pizza spinoff from the Tra Vigne team",4.4,f(false,false,false,true,false,false,false,false),"https://pizzeriatravigne.com",38.5063,-122.4689),
    v("Vigne Café","French Café","St. Helena's charming morning café",4.3,f(false,false,false,true,false,false,false,false),"https://vignecafe.com",38.5076,-122.4700),
    v("Harvest Table","Californian","Meadowood's casual restaurant, farm-fresh ingredients",4.5,f(false,false,false,true,false,false,false,true),"https://meadowood.com/harvest-table",38.5012,-122.4892),
    v("Gott's Roadside","American","Napa Valley's beloved burger stand, Oxbow and St. Helena",4.5,f(false,false,false,true,false,false,false,false),"https://gottsroadside.com",38.5076,-122.4700),
    v("Armadillo's","Mexican","St. Helena's casual Mexican, valley workers' secret",4.3,f(false,false,false,true,false,false,false,false),"https://armadillosrestaurant.com",38.5076,-122.4700),
    v("Brasswood Estate Kitchen","Californian","Winery restaurant with modern Californian menu",4.5,f(false,false,true,false,false,false,false,true),"https://brasswood.com",38.5276,-122.4800),
    v("Meadowood Croquet Lawn Bar","Bar","Meadowood resort's outdoor evening drinks setting",4.6,f(false,false,false,true,true,false,false,true),"https://meadowood.com",38.5012,-122.4892),
    v("Brix","Californian","Southside wine country restaurant, beautiful garden",4.4,f(false,false,false,true,false,false,false,true),"https://brix.com",38.4302,-122.4027),
    v("Auberge du Soleil","Mediterranean","Romantic hilltop Auberge resort dining, valley views",4.7,f(false,false,false,true,true,false,true,true),"https://aubergedusoleil.com",38.4822,-122.4427),
    v("Solbar at Solage","Californian","Michelin-starred Calistoga resort restaurant",4.6,f(true,false,true,false,false,false,false,true),"https://aubergeresorts.com/solage",38.5788,-122.5803),
    v("Etoile at Domaine Chandon","French-Californian","Winery fine dining in Yountville, sparkling wine pairings",4.6,f(false,false,false,true,false,false,true,true),"https://chandon.com/visit/etoile-restaurant",38.4092,-122.3637),
    v("Terra","French-Japanese","St. Helena two-star Michelin, Hiro Sone's masterwork",4.7,f(true,false,false,true,false,false,true,true),"https://terrarestaurant.com",38.5076,-122.4700),
  ],

  "Calistoga": [
    v("Solbar","California Cuisine","Michelin-starred Solage Auberge resort restaurant",4.8,f(true,false,true,false,false,false,false,true),"https://aubergeresorts.com/solage/dine",38.5788,-122.5803),
    v("Evangeline","New Orleans Creole","Southern charm and hospitality in wine country",4.6,f(false,true,true,false,false,true,false,false),"https://evangelinecalistoga.com",38.5786,-122.5795),
    v("JoLē","Californian","Calistoga's beloved local fine dining restaurant",4.6,f(false,false,false,true,false,false,false,true),"https://jolecalistoga.com",38.5786,-122.5795),
    v("Sam's Social Club","Californian","Indian Springs Resort's casual but excellent restaurant",4.5,f(false,false,true,false,false,false,false,false),"https://indianspringsresort.com/sams-social-club",38.5786,-122.5805),
    v("Barolo","Italian","Calistoga's casual Italian, dependable and charming",4.4,f(false,false,false,true,false,false,false,false),"https://barolocalistoga.com",38.5786,-122.5795),
    v("Checker's","American Deli","Calistoga breakfast and lunch institution",4.3,f(false,false,false,true,false,false,false,false),"https://checkerscalistoga.com",38.5796,-122.5795),
    v("Calistoga Inn Restaurant","Californian","Napa River Inn dining with outdoor brewing garden",4.4,f(false,false,false,true,false,false,false,false),"https://calistogainn.com",38.5786,-122.5795),
    v("Lovina","Californian","Indian Springs' second restaurant, poolside dining",4.4,f(false,false,true,false,false,false,false,false),"https://indianspringsresort.com",38.5786,-122.5805),
    v("Café Sarafornia","Diner","Calistoga diner institution, hangover-friendly breakfast",4.3,f(false,false,false,true,false,false,false,false),"https://cafesarafornia.com",38.5796,-122.5795),
    v("Boskos Trattoria","Italian","Calistoga Italian neighborhood staple",4.3,f(false,false,false,true,false,false,false,false),"https://boskos.com",38.5786,-122.5795),
    v("Palisades Deli","Deli","Calistoga deli and market, excellent sandwiches",4.3,f(false,false,false,true,false,false,false,false),"https://palisadesdeli.com",38.5786,-122.5795),
    v("Tank Garage Winery","Wine Bar","Gas station wine bar, cool Calistoga hangout",4.5,f(false,false,true,false,false,false,false,false),"https://tankgaragewinery.com",38.5796,-122.5795),
    v("La Luna Market","Mexican","Rutherford taqueria institution beloved by winery workers",4.4,f(false,false,false,true,false,false,false,false),"https://lalunamarket.com",38.4597,-122.4117),
    v("Calistoga Roastery","Coffee Bar","Best coffee in Calistoga, great morning gathering spot",4.4,f(false,false,false,true,false,false,false,false),"https://calistogaroastery.com",38.5786,-122.5795),
    v("Hydro Bar & Grill","Bar","Calistoga's classic local bar, draft beer and burgers",4.2,f(false,false,false,true,false,false,false,false),"https://hydrobarandgrill.com",38.5786,-122.5795),
  ],

  "Palo Alto": [
    v("Baumé","French Contemporary","Two Michelin stars, most ambitious tasting menu on Peninsula",4.9,f(true,false,false,false,false,false,true,true),"https://maisonbaume.com",37.4419,-122.1430),
    v("Evvia Estiatorio","Greek","Beloved Greek, tech titans' power lunch",4.7,f(false,false,false,true,true,false,false,false),"https://evvia.net",37.4446,-122.1613),
    v("Nobu Palo Alto","Japanese-Peruvian","Nobu's Peninsula outpost, tech celebrity sushi",4.6,f(false,false,true,false,true,false,false,false),"https://noburestaurants.com/palo-alto",37.4480,-122.1601),
    v("Zola","French","Downtown Palo Alto French, best in class",4.6,f(false,false,true,false,false,false,true,true),"https://zolapaloalto.com",37.4440,-122.1600),
    v("Protégé","Contemporary American","James Beard nominated, elegant downtown tasting menu",4.7,f(false,false,true,false,false,false,true,true),"https://protegepa.com",37.4440,-122.1610),
    v("Madera","Contemporary American","Rosewood Sand Hill's award-winning restaurant",4.7,f(false,false,true,false,true,false,true,true),"https://rosewoodhotels.com/en/sand-hill-menlo-park/dining/madera",37.4133,-122.1978),
    v("Tamarine","Vietnamese","Palo Alto's best Vietnamese, celebrated for years",4.6,f(false,false,false,true,false,false,false,true),"https://tamarinerestaurant.com",37.4440,-122.1600),
    v("Oren's Hummus","Middle Eastern","Counter-service hummus institution, University Ave",4.5,f(false,false,false,true,false,false,false,false),"https://orenshummus.com",37.4450,-122.1600),
    v("The Bywater","Cajun","Sean Baker's New Orleans spot near downtown",4.5,f(false,false,true,false,false,false,false,false),"https://thebywater.com",37.4440,-122.1610),
    v("Ranges","Californian","Sustainable seasonal menu, Palo Alto neighborhood gem",4.5,f(false,false,false,true,false,false,false,true),"https://rangesrestaurant.com",37.4450,-122.1610),
    v("Il Fornaio","Italian","University Ave classic, reliable Italian institution",4.4,f(false,false,false,true,false,false,false,false),"https://ilfornaio.com/palo-alto",37.4450,-122.1600),
    v("Nola","New Orleans","Cajun and Creole in Palo Alto, great cocktails",4.4,f(false,false,true,false,false,false,false,false),"https://nolaparestaurant.com",37.4440,-122.1600),
    v("The Rose & Crown","British Pub","Palo Alto's beloved British pub, quiz nights",4.4,f(false,false,false,true,false,true,false,false),"https://roseandcrownpa.com",37.4440,-122.1610),
    v("St. Michael's Alley","Californian","Palo Alto institution since 1959, charming back alley",4.5,f(false,false,false,true,true,false,false,true),"https://stmikes.com",37.4450,-122.1600),
    v("Cafe Venetia","Coffee","Palo Alto's best espresso, intellectuals and founders",4.4,f(false,false,false,true,false,false,false,false),"https://cafevenetia.com",37.4450,-122.1610),
    v("Vina Enoteca","Italian","Stanford Shopping Center's wine bar and pasta",4.5,f(false,false,true,false,true,false,false,true),"https://vinaenoteca.com",37.4426,-122.1690),
    v("Bird Dog","Japanese-American","Michelin Bib Gourmand, creative Palo Alto spot",4.6,f(false,false,true,false,false,false,true,false),"https://birddogpa.com",37.4440,-122.1600),
    v("Sushi Sus","Japanese","Omakase counter, best sushi in Palo Alto",4.6,f(false,false,false,false,false,false,true,true),"https://sushisus.com",37.4440,-122.1610),
    v("Coupa Café","Venezuelan","Cacao-focused café, Venezuelan specialties",4.4,f(false,false,false,true,false,false,false,false),"https://coupacafe.com",37.4450,-122.1600),
    v("Fuki Sushi","Japanese","Palo Alto Japanese institution since 1972",4.4,f(false,false,false,true,true,false,false,false),"https://fukisushi.com",37.4480,-122.1591),
    v("Gravity Wine Bar","Wine Bar","Downtown Palo Alto wine bar, good selection",4.3,f(false,false,false,true,false,false,false,true),"https://gravitywinebar.com",37.4440,-122.1610),
    v("The Bird Bar & Grill","American Bar","Lively neighborhood bar, great happy hour crowds",4.3,f(false,false,false,false,false,false,false,false),"https://thebirdpaloalto.com",37.4421,-122.1429),
    v("Naomi Sushi","Japanese","Menlo Park Japanese institution, sashimi and rolls",4.4,f(false,false,false,true,false,false,false,false),"https://naomisushi.com",37.4527,-122.1822),
    v("Lavanda","Mediterranean","Palo Alto Med, lovely patio, good value",4.4,f(false,false,false,true,false,false,false,true),"https://lavaanda.com",37.4440,-122.1600),
    v("Pizzeria Delfina","Italian","Palo Alto outpost of SF's beloved pizzeria",4.5,f(false,false,false,true,false,false,false,false),"https://pizzeriadelfina.com/palo-alto",37.4440,-122.1610),
    v("Reposado","Mexican","Palo Alto upscale Mexican with outstanding tequila list",4.4,f(false,false,true,false,false,false,false,false),"https://reposadomexican.com",37.4440,-122.1600),
    v("Mayfield Bakery & Café","American","Town & Country Village's beloved all-day café",4.4,f(false,false,false,true,false,false,false,false),"https://mayfieldbakeryan dcafe.com",37.4310,-122.1610),
    v("Calafia Café","Californian","Google alum-founded healthy California café",4.3,f(false,false,false,true,false,false,false,false),"https://calafiapaloalto.com",37.4440,-122.1600),
    v("Nick's Crispy Tacos","Mexican","Crispy shell tacos institution, Palo Alto and SF",4.4,f(false,false,false,true,false,false,false,false),"https://nickscrisptacos.com",37.4440,-122.1610),
    v("Cho's Chinese Kitchen","Chinese","Best Chinese food in Palo Alto, simple and perfect",4.4,f(false,false,false,true,false,false,false,false),"https://choschinese.com",37.4440,-122.1600),
  ],

  "Menlo Park": [
    v("Madera","Contemporary American","Rosewood Sand Hill's acclaimed restaurant, VC crowd",4.8,f(false,false,true,false,true,false,true,true),"https://rosewoodhotels.com/en/sand-hill-menlo-park/dining/madera",37.4133,-122.1978),
    v("LB Steak","Steakhouse","Peninsula power dining, Sand Hill Road scene",4.6,f(false,false,true,false,true,false,false,false),"https://lbsteak.com",37.4531,-122.1819),
    v("Refuge","Sandwiches & Beer","Legendary pastrami and craft beer, local institution",4.7,f(false,false,false,true,false,false,false,false),"https://refugemenlopark.com",37.4527,-122.1822),
    v("Flea St. Cafe","California Cuisine","Farm-to-table pioneer, Jesse Ziff Cool's legacy",4.6,f(false,false,false,true,false,false,false,true),"https://fleastreetcafe.com",37.4489,-122.1851),
    v("Micheline","French-California","Intimate bistro, Peninsula's best French",4.5,f(false,false,false,false,false,false,false,true),"https://michelinerestaurant.com",37.4530,-122.1817),
    v("Marche","Californian","Elegant farm-to-table in lovely Menlo Park setting",4.5,f(false,false,false,true,false,false,false,true),"https://restaurantmarche.com",37.4530,-122.1817),
    v("Camper","Californian","Beloved Menlo Park seasonal American",4.5,f(false,false,true,false,false,false,true,false),"https://campermenlpark.com",37.4527,-122.1822),
    v("Naomi Sushi","Japanese","Long-standing Japanese institution in Menlo Park",4.4,f(false,false,false,true,false,false,false,false),"https://naomisushi.com",37.4527,-122.1822),
    v("Pasta Moon","Italian","Half Moon Bay Italian, beloved Sunday destination",4.5,f(false,false,false,true,false,false,false,true),"https://pastamoon.com",37.4916,-122.4268),
    v("Donato Enoteca","Italian","Redwood City Italian wine bar, outstanding cicchetti",4.6,f(false,false,false,true,false,false,false,true),"https://donatoenoteca.com",37.4922,-122.2227),
    v("Portofino Restaurant","Italian","Classic Redwood City Italian institution",4.4,f(false,false,false,true,false,false,false,false),"https://portofinorca.com",37.4922,-122.2237),
    v("Howie's Artisan Pizza","Italian","Palo Alto beloved pizza spot",4.4,f(false,false,false,true,false,false,false,false),"https://howiesartisanpizza.com",37.4527,-122.1822),
    v("Trabocchi's","Italian","Menlo Park neighborhood Italian, reliable and warm",4.3,f(false,false,false,true,false,false,false,false),"https://trabocchis.com",37.4527,-122.1822),
    v("Village Pub","Californian","Woodside fine dining pub, one Michelin star",4.7,f(true,false,false,true,true,false,true,true),"https://thevillagepub.net",37.4307,-122.2548),
    v("Bucks of Woodside","American","Iconic Silicon Valley power breakfast diner",4.3,f(false,false,false,true,true,false,false,false),"https://buckswoodside.com",37.4307,-122.2548),
    v("Alpine Inn","Bar","Oldest bar on the Peninsula, Rossotti's, outdoor tables",4.2,f(false,false,false,true,false,false,false,false),"https://alpineinnwoodside.com",37.3833,-122.2388),
    v("The Fox and Hound","British Pub","Redwood City's best British pub, Premier League mornings",4.3,f(false,false,false,true,false,true,false,false),"https://foxandhoundpub.com",37.4922,-122.2247),
    v("Saffron","Indian","Best Indian food in Menlo Park, refined and fragrant",4.4,f(false,false,false,true,false,false,false,false),"https://saffrondining.com",37.4527,-122.1822),
    v("Stacks Menlo Park","Diner","Best weekend brunch in Menlo Park",4.4,f(false,false,false,true,false,false,false,false),"https://stacksrestaurant.com",37.4527,-122.1822),
    v("Reposado Menlo","Mexican","Upscale tequila-focused Mexican, Central Ave",4.4,f(false,false,true,false,false,false,false,false),"https://reposadomexican.com",37.4527,-122.1822),
    v("Oak+Vine","American","Menlo Park casual wine bar and American food",4.3,f(false,false,false,true,false,false,false,true),"https://oakandvinemenlopark.com",37.4527,-122.1822),
    v("Palo Alto Creamery","American Diner","Old-school diner, Menlo Park institution",4.2,f(false,false,false,true,false,false,false,false),"https://pacreamery.com",37.4527,-122.1812),
    v("Cascal","Latin American","Castro Street Latin restaurant, great margaritas",4.4,f(false,false,true,false,false,false,false,false),"https://cascalrestaurant.com",37.3954,-122.0783),
    v("Amber India Menlo Park","Indian","Excellent upscale Indian, reliable and consistent",4.4,f(false,false,false,true,false,false,false,false),"https://amber-india.com",37.4527,-122.1822),
    v("La Bohème","French Bistro","Menlo Park classic French, lovely for anniversaries",4.4,f(false,false,false,true,false,false,false,true),"https://restaurantlaboheme.com",37.4527,-122.1812),
    v("Chef Chu's","Chinese","Chinese American landmark since 1970, Los Altos classic",4.4,f(false,false,false,true,true,false,false,false),"https://chefchus.com",37.3692,-122.1149),
    v("Three Seasons","Vietnamese","Palo Alto Vietnamese institution, great pho",4.3,f(false,false,false,true,false,false,false,false),"https://threeseasonsmenlopa.com",37.4527,-122.1822),
    v("Taverna Fiorentina","Italian","Menlo Park trattoria, solid neighborhood Italian",4.3,f(false,false,false,true,false,false,false,false),"https://tavernafiorentina.com",37.4527,-122.1822),
    v("Watercourse Way","American Café","Menlo Park spa café, healthy and pleasant",4.2,f(false,false,false,true,false,false,false,false),"https://watercourseway.com",37.4527,-122.1822),
    v("La Bodeguita del Medio","Cuban","Menlo Park Cuban bar, mojitos and music",4.3,f(false,false,true,false,false,true,false,false),"https://labodeguita.com",37.4527,-122.1822),
  ],

  "Santa Monica": [
    v("Melisse","French Contemporary","Two Michelin stars, Josiah Citrin's LA finest French",4.9,f(true,false,false,true,true,false,true,true),"https://melisse.com",34.0195,-118.4912),
    v("Dialogue","Contemporary American","Dave Beran's Michelin-starred counter, outstanding",4.8,f(true,false,true,false,false,false,true,true),"https://dialoguedining.com",34.0195,-118.4912),
    v("Rustic Canyon","California","Jeremy Fox's acclaimed farm-to-table, Pico Blvd gem",4.7,f(false,false,false,true,false,false,false,true),"https://rusticcanyonwinebar.com",34.0195,-118.4892),
    v("Tar & Roses","Wood-fired","Cozy wood-fired small plates, Andrew Kirschner's spot",4.6,f(false,false,true,false,false,false,false,false),"https://tarandroses.com",34.0199,-118.4955),
    v("Wilshire Restaurant","Californian","Outdoor patio, great cocktails, iconic SM gathering",4.6,f(false,false,true,false,true,false,false,false),"https://wilshirerestaurant.com",34.0295,-118.4782),
    v("Ocean & Vine","Californian","Loews Santa Monica's beachfront seasonal dining",4.5,f(false,false,false,true,false,false,false,true),"https://oceanandvine.com",34.0051,-118.5012),
    v("Bay Cities Italian Deli","Italian Deli","Best Italian deli in LA, legendary Godmother sandwich",4.6,f(false,false,false,true,true,false,true,false),"https://baycitiesitaliandeli.com",34.0175,-118.4832),
    v("Chez Jay","American Dive","Beloved dive bar since 1959, Sinatra's table still reserved",4.5,f(false,false,false,true,true,false,false,false),"https://chezjays.com",34.0168,-118.4991),
    v("The Misfit Restaurant + Bar","American","Casual downtown SM bar and restaurant, craft cocktails",4.4,f(false,false,true,false,false,false,false,false),"https://themisfitbar.com",34.0151,-118.4912),
    v("Lunetta","Italian","Wine country Italian in Santa Monica, lovely and local",4.5,f(false,false,false,true,false,false,false,true),"https://lunettasm.com",34.0195,-118.4892),
    v("Tar Pit","Cocktail Bar","Mid-century style craft cocktails near LACMA",4.5,f(false,false,false,true,true,false,false,false),"https://tarpitbar.com",34.0614,-118.3611),
    v("The Lobster","Seafood","SM Pier adjacent lobster institution with ocean views",4.5,f(false,false,false,true,true,false,false,false),"https://thelobster.com",34.0059,-118.4992),
    v("Michael's Santa Monica","Californian","California cuisine pioneer since 1979, beautiful garden",4.5,f(false,false,false,true,true,false,false,true),"https://michaelssantamonica.com",34.0195,-118.4882),
    v("Cassia","Southeast Asian","Chef Bryant Ng's acclaimed Vietnamese-French",4.6,f(false,false,true,false,true,false,true,false),"https://cassiarestaurant.com",34.0215,-118.4872),
    v("Tasting Kitchen","California","Venice-adjacent seasonal Californian gem",4.5,f(false,false,false,true,false,false,false,true),"https://thetastingkitchen.com",33.9905,-118.4700),
    v("Mélisse/Citrin","French American","The other Josiah Citrin restaurant in the same space",4.6,f(false,false,true,false,true,false,false,true),"https://citrinrestaurant.com",34.0195,-118.4912),
    v("Anarbor","Mediterranean","Third St Promenade gem, great happy hour and cocktails",4.4,f(false,false,true,false,false,false,false,false),"https://anarborsm.com",34.0151,-118.4922),
    v("True Food Kitchen","Healthy American","Dr. Weil's anti-inflammatory menu, SM original",4.4,f(false,false,true,false,true,false,false,false),"https://truefoodkitchen.com/location/santa-monica",34.0279,-118.4782),
    v("Father's Office","Gastropub","Best craft beer bar in LA with legendary blue cheese burger",4.6,f(false,false,false,true,true,false,false,false),"https://fathersoffice.com",34.0175,-118.4832),
    v("Tallula's","Mexican","Santa Monica Mexican with creative mezcal cocktails",4.5,f(false,false,true,false,false,false,false,false),"https://tallulasrestaurant.com",34.0215,-118.4882),
    v("Huckleberry Café","American","Santa Monica's best bakery and all-day café",4.6,f(false,false,false,true,false,false,false,false),"https://huckleberrycafe.com",34.0175,-118.4832),
    v("26 Beach Restaurant","American","Creative American, Venice Beach adjacent, always reliable",4.4,f(false,false,false,true,false,false,false,false),"https://26beach.com",33.9965,-118.4812),
    v("Maru Coffee","Coffee Bar","SM's best specialty coffee, Japanese minimalist",4.5,f(false,false,false,true,false,false,false,false),"https://marucoffee.com",34.0175,-118.4832),
    v("Santa Monica Yacht Club","Bar","Private club with outstanding Pacific views",4.4,f(false,false,false,true,false,false,false,true,true),"https://smyc.com",34.0059,-118.4992),
    v("Viceroy Santa Monica Bar","Cocktail Bar","Hotel bar with beautiful pool scene and cocktails",4.4,f(false,false,true,false,true,false,false,false),"https://viceroyhotelsandresorts.com/santamonica",34.0129,-118.4962),
    v("Fia","Italian American","Third St's impressive all-day Italian, beautiful space",4.5,f(false,false,true,false,true,false,false,false),"https://fiarestaurant.com",34.0151,-118.4922),
    v("Tasting Kitchen","California Coastal","Chef's tasting menu, California seasonal",4.5,f(false,false,false,true,false,false,false,true),"https://thetastingkitchenla.com",34.0175,-118.4922),
    v("Dogtown Coffee","Coffee","Venice boardwalk coffee icon, skate culture meets specialty",4.4,f(false,false,false,true,false,false,false,false),"https://dogtowncoffee.com",33.9901,-118.4710),
    v("Zinque","French Café","Santa Monica Franco-California all-day café and wine bar",4.4,f(false,false,true,false,true,false,false,false),"https://zinque.com",34.0175,-118.4832),
    v("Neighborhood","Bar","Montana Avenue's neighborhood bar, quiz nights",4.2,f(false,false,false,true,false,true,false,false),"https://neighborhoodsm.com",34.0275,-118.4782),
  ],

  "Venice CA": [
    v("Felix Trattoria","Italian","Best pizza in LA, Venetian-style, acclaimed by all",4.7,f(false,false,true,false,true,false,true,false),"https://felixla.com",33.9906,-118.4709),
    v("Gjelina","California","Venice institution, farm-to-table, always packed",4.7,f(false,false,false,true,true,false,true,false),"https://gjelina.com",33.9905,-118.4714),
    v("Gjusta","Bakery/Deli","Celebrity hangout bakery and deli, perpetual lines",4.7,f(false,false,false,true,true,false,false,false),"https://gjusta.com",33.9901,-118.4710),
    v("Gou Lou Zai","Cantonese","Tiny outstanding Cantonese, Abbott Kinney best-kept secret",4.6,f(false,true,false,false,false,false,true,true),"https://gouloulaistaurant.com",33.9906,-118.4709),
    v("Superba Food + Bread","Californian","Venice all-day café, beautiful space",4.5,f(false,false,true,false,false,false,false,false),"https://superbafoodandbread.com",33.9895,-118.4714),
    v("The Tasting Kitchen","California","Seasonal California, intimate Abbott Kinney",4.5,f(false,false,false,true,false,false,false,true),"https://thetastingkitchen.com",33.9905,-118.4700),
    v("Abbot's Pizza","Pizza","Venice beach pizza institution, creative toppings",4.4,f(false,false,false,true,false,false,false,false),"https://abbotspizzacompany.com",33.9906,-118.4709),
    v("Café Gratitude","Vegan","Raw vegan café, Venice original, spiritual and fresh",4.4,f(false,false,true,false,true,false,false,false),"https://cafegratitude.com",33.9906,-118.4709),
    v("Rose Café","Californian","Venice institution since 1979, large patio dining",4.4,f(false,false,false,true,true,false,false,false),"https://rosecafevenice.com",33.9906,-118.4709),
    v("Fia Venice","Italian","Sister restaurant to SM's Fia, Abbott Kinney",4.5,f(false,false,true,false,true,false,false,false),"https://fiarestaurant.com",33.9906,-118.4709),
    v("Salt Air","American","Rooftop dining over Abbot Kinney, sunset cocktails",4.5,f(false,false,true,false,true,false,false,false),"https://saltairvenice.com",33.9906,-118.4709),
    v("Townhouse","Bar","Venice dive bar institution since 1915, basement DJs",4.3,f(false,false,true,false,true,true,false,false),"https://townhousevenice.com",33.9920,-118.4730),
    v("The Other Room","Cocktail Bar","Craft cocktail bar, Venice's best spirits list",4.5,f(false,false,false,true,false,false,false,false),"https://theotherroom.com",33.9906,-118.4719),
    v("Venice Whaler","Bar","Legendary beachside bar since 1944, no pretense",4.3,f(false,false,false,true,true,false,false,false),"https://venicewhaler.com",33.9870,-118.4730),
    v("Stronghold","Cocktail Bar","Eclectic Venice cocktail bar with amazing whiskey list",4.4,f(false,false,true,false,false,false,false,false),"https://strongholdvenice.com",33.9906,-118.4709),
    v("Esters Wine Shop & Bar","Wine Bar","Outstanding natural wine bar, Pico Blvd gem",4.6,f(false,false,true,false,false,false,false,true),"https://esterswine.com",34.0025,-118.4730),
    v("Mélisse at GTA","California","Pop-up fine dining in garage space",4.4,f(false,false,true,false,true,false,true,false),"https://melisse.com",33.9906,-118.4719),
    v("Gjusta Goods","Deli","Second Gjusta location, same quality",4.6,f(false,false,false,true,false,false,false,false),"https://gjusta.com",33.9895,-118.4714),
    v("Wabi Sabi","Japanese","Venice Japanese institution, sushi and omakase",4.5,f(false,false,false,true,false,false,false,false),"https://wabisabirestaurant.com",33.9906,-118.4709),
    v("Dudley Market","Café","Venice micro-café and farm stand, neighborhood treasure",4.5,f(false,false,false,true,false,false,false,true),"https://dudleymarket.com",33.9906,-118.4709),
    v("Intelligentsia Venice","Coffee","Best espresso on the Westside, Abbot Kinney",4.6,f(false,false,false,true,true,false,false,false),"https://intelligentsiacoffee.com/locations/venice-coffeebar",33.9906,-118.4709),
    v("Deus Ex Machina","Bar/Café","Surf culture café and bar, beautiful space",4.4,f(false,false,true,false,true,false,false,false),"https://deuscustoms.com",33.9906,-118.4709),
    v("Roosterfish Beach Club","Bar","Venice gay dive bar, the most welcoming on the beach",4.3,f(false,false,true,false,true,true,false,false),"https://roosterfish.com",33.9870,-118.4730),
    v("Poke-Poke","Hawaiian","Best poke bowls in Venice",4.4,f(false,false,false,true,false,false,false,false),"https://pokepoke.com",33.9906,-118.4709),
    v("Sidecar Doughnuts","Bakery","Best doughnuts in LA, perpetual line worth joining",4.6,f(false,false,false,true,true,false,false,false),"https://sidecardoughnuts.com",33.9906,-118.4709),
    v("Gold's Gym Café","Health Café","The original Gold's Gym beachfront café, historic",4.2,f(false,false,false,true,true,false,false,false),"https://goldsgym.com",33.9870,-118.4730),
    v("Nikita","Russian","Beach-front Russian bar and restaurant, lively and fun",4.3,f(false,false,true,false,true,true,false,false),"https://nikitavenice.com",33.9870,-118.4730),
    v("Kreation Kafe","Healthy","Juice bar and café, wellness culture Venice",4.3,f(false,false,true,false,false,false,false,false),"https://kreationorganic.com",33.9906,-118.4709),
    v("Snap Kitchen","Healthy","Healthy meal prep and café, Venice location",4.2,f(false,false,false,true,false,false,false,false),"https://snapkitchen.com",33.9906,-118.4719),
    v("Plant Food and Wine","Vegan","Matthew Kenney's upscale vegan",4.4,f(false,false,true,false,true,false,false,false),"https://matthewkenneycuisine.com",33.9906,-118.4709),
  ],

  "West Palm Beach": [
    v("Buccan","Small Plates","Palm Beach's best restaurant, Clay Conley's flagship",4.8,f(false,false,true,false,true,false,true,false),"https://buccanpalmbeach.com",26.7041,-80.0378),
    v("Imoto","Japanese","Clay Conley's Japanese sibling to Buccan, excellent",4.7,f(false,false,true,false,true,false,true,false),"https://imotopalmbeach.com",26.7041,-80.0378),
    v("Meat Market Palm Beach","Steakhouse","Upscale steakhouse on Worth Avenue, power scene",4.6,f(false,false,true,false,true,false,false,false),"https://meatmarket.net",26.7153,-80.0534),
    v("Avocado Grill","Contemporary American","Farm-to-table local favorite for brunch and dinner",4.6,f(false,false,true,false,false,false,false,false),"https://avocadogrillwpb.com",26.7157,-80.0527),
    v("Cafe Boulud Palm Beach","French","Daniel Boulud's Brazilian Court outpost",4.7,f(false,false,false,true,true,false,true,true),"https://cafeboulud.com/palmbeach",26.7041,-80.0358),
    v("Bice Palm Beach","Italian","Worth Avenue Italian power dining, society crowd",4.6,f(false,false,false,true,true,false,false,true),"https://bicepalmbeach.com",26.7041,-80.0378),
    v("Renato's","Italian","Palm Beach romantic Italian, garden courtyard",4.6,f(false,false,false,true,true,false,false,true),"https://renatospalmbeach.com",26.7041,-80.0378),
    v("HMF at The Breakers","American","The Breakers Hotel's spectacular bar and restaurant",4.7,f(false,false,false,true,true,false,false,true),"https://thebreakers.com/dining/hmf",26.7041,-80.0348),
    v("Ta-boo","American","Palm Beach institution since 1941, winter social hub",4.5,f(false,false,false,true,true,false,false,false),"https://taboorestaurant.com",26.7041,-80.0378),
    v("Cha Cha's Latin Kitchen","Latin American","Rosemary Ave Latin, James Beard nominated",4.6,f(false,false,true,false,false,false,false,false),"https://chachaspalmbeach.com",26.7157,-80.0527),
    v("Respite at the Ben","Cocktail Bar","Rooftop bar, West Palm skyline views, creative cocktails",4.5,f(false,true,true,false,false,true,false,false),"https://thebenwestpalmbeach.com",26.7148,-80.0541),
    v("Amici Market","Italian","Palm Beach Italian market café and wine shop",4.4,f(false,false,false,true,false,false,false,false),"https://amicimarket.com",26.7041,-80.0368),
    v("Pistache French Bistro","French","Waterfront bistro, Clematis St., WPB's best French",4.6,f(false,false,false,true,false,false,false,true),"https://pistachewpb.com",26.7148,-80.0541),
    v("Subculture Coffee","Coffee","WPB's best specialty coffee, local institution",4.5,f(false,false,false,true,false,false,false,false),"https://subculturecoffee.com",26.7157,-80.0527),
    v("E.R. Bradley's Saloon","Bar","WPB's landmark waterfront bar since 1892",4.3,f(false,false,false,true,false,true,false,false),"https://erbradleys.com",26.7148,-80.0541),
    v("Elisabetta's Ristorante","Italian","Clematis waterfront Italian, lively and fun",4.4,f(false,false,true,false,false,true,false,false),"https://elisabettaswpb.com",26.7148,-80.0541),
    v("Galley","Seafood","Casual waterfront seafood and craft cocktails",4.4,f(false,false,true,false,false,false,false,false),"https://galleywpb.com",26.7148,-80.0531),
    v("Celis Produce & Specialty Foods","Market","WPB's beloved market café and specialty grocery",4.4,f(false,false,false,true,false,false,false,false),"https://celisproduce.com",26.7157,-80.0527),
    v("Taco Craft","Mexican","Best tacos in WPB, craft beer and cocktails",4.4,f(false,false,true,false,false,false,false,false),"https://tacocraftwpb.com",26.7157,-80.0537),
    v("Bricktop's","American","Worth Avenue institution, power lunch and dinner",4.5,f(false,false,false,true,true,false,false,true),"https://bricktopsrestaurant.com",26.7041,-80.0368),
    v("The Regional Kitchen","Southern American","James Beard nominated, downtown WPB Southern",4.6,f(false,false,true,false,false,false,false,false),"https://eatregional.com",26.7157,-80.0527),
    v("Longboards at Sloan's","American","Whimsical ice cream and casual dining, WPB icon",4.2,f(false,false,false,true,false,false,false,false),"https://sloansicecream.com",26.7041,-80.0368),
    v("iPic Theaters & Tanzy","American","Upscale theater dining experience",4.3,f(false,false,true,false,false,false,false,false),"https://ipictheaters.com",26.7041,-80.0378),
    v("Grandview Public Market","Food Hall","WPB's best food hall, multiple outstanding vendors",4.5,f(false,false,true,false,false,false,false,false),"https://grandviewpublicmarket.com",26.7041,-80.0528),
    v("Hullabaloo","American","Downtown WPB social hub, craft cocktails and brunch",4.4,f(false,false,true,false,false,false,false,false),"https://hullabaloodiner.com",26.7148,-80.0541),
    v("Almond","American Bistro","Modern American bistro, WPB casual fine dining",4.5,f(false,false,true,false,false,false,false,true),"https://almondrestaurant.com",26.7041,-80.0368),
    v("Swifty's","American","Palm Beach social restaurant, classic scene",4.5,f(false,false,false,true,true,false,false,false),"https://swiftysrb.com",26.7041,-80.0378),
    v("The Breakers Ocean Club","Private Members Club","The Breakers Hotel private club facilities and dining",4.7,f(false,false,false,true,true,false,true,true,true),"https://thebreakers.com",26.7041,-80.0338),
    v("Dada","Eclectic American","Artsy WPB institution, live music and eclectic menu",4.4,f(false,false,true,false,true,true,false,false),"https://dadawpb.com",26.7157,-80.0527),
    v("Table 26","American Steak","WPB classic American steakhouse, power lunch",4.4,f(false,false,false,true,true,false,false,true),"https://table26palmbeach.com",26.7041,-80.0368),
  ],

  "Fort Lauderdale": [
    v("Louie Bossi's","Italian","Lively Italian on Las Olas, fresh pasta and great energy",4.6,f(false,false,true,false,false,true,false,false),"https://louiebossi.com",26.1192,-80.1375),
    v("Steak 954","Steakhouse","W Hotel's dramatic steakhouse with jellyfish tank wall",4.6,f(false,false,true,false,true,false,false,false),"https://steak954.com",26.1226,-80.1040),
    v("Steak Takeover","Steakhouse","Lauderdale's hottest new steakhouse, excellent cuts",4.6,f(false,true,true,false,true,false,true,false),"https://steaktakeover.com",26.1192,-80.1385),
    v("Burlock Coast","American Coastal","Ritz-Carlton Fort Lauderdale's acclaimed restaurant",4.7,f(false,false,true,false,true,false,false,true),"https://burlock coast.com",26.1226,-80.1030),
    v("The Boatyard","Seafood","Waterfront seafood, yachts docking tableside",4.5,f(false,false,false,true,false,true,false,false),"https://boatyardrestaurant.com",26.0998,-80.1140),
    v("SuViche","Peruvian-Japanese","Las Olas Peruvian-Japanese fusion, ceviche and sushi",4.5,f(false,false,true,false,false,false,false,false),"https://suviche.com",26.1192,-80.1385),
    v("The Foxy Brown","American","Las Olas brunch institution, cocktails and comfort",4.5,f(false,false,true,false,false,false,false,false),"https://thefoxybrown.com",26.1192,-80.1375),
    v("Rok:Brgr","American","Best burgers in Fort Lauderdale, Las Olas staple",4.4,f(false,false,true,false,false,false,false,false),"https://rokbrgr.com",26.1192,-80.1385),
    v("Casa D'Angelo","Italian","Old-school Italian fine dining, Angelo Elia's flagship",4.6,f(false,false,false,true,true,false,false,true),"https://casa-d-angelo.com",26.1566,-80.1220),
    v("Coconuts","Seafood","Casual waterfront seafood, intracoastal dolphin views",4.3,f(false,false,false,true,false,false,false,false),"https://coconuts.com",26.1376,-80.1030),
    v("Grateful","Health American","Fort Lauderdale's beloved healthy café and juice bar",4.4,f(false,false,true,false,false,false,false,false),"https://gratefulfl.com",26.1192,-80.1375),
    v("Cibo Wine Bar","Italian Wine Bar","Las Olas Italian wine bar and restaurant",4.5,f(false,false,true,false,false,false,false,true),"https://cibowinebar.com",26.1192,-80.1385),
    v("Tarpon Bend","American","Las Olas craft beer and American food staple",4.3,f(false,false,false,true,false,true,false,false),"https://tarponbend.com",26.1192,-80.1375),
    v("Batch Gastropub","Gastropub","Craft beer and excellent burgers, Las Olas",4.4,f(false,false,true,false,false,true,false,false),"https://batchgastropub.com",26.1188,-80.1381),
    v("26 Degrees North","American","Fort Lauderdale Yacht Club's excellent restaurant",4.5,f(false,false,false,true,true,false,false,true),"https://26degreesnorth.com",26.1226,-80.1030),
    v("The Capital Grille Fort Lauderdale","Steakhouse","Galleria Mall power dining, classic steakhouse",4.5,f(false,false,false,true,true,false,false,true),"https://thecapitalgrille.com",26.1566,-80.1330),
    v("Sea Level Restaurant & Ocean Bar","Seafood","Atlantic Hotel's oceanfront dining, spectacular setting",4.5,f(false,false,true,false,true,false,false,false),"https://atlantichotelfl.com/sea-level",26.1226,-80.1030),
    v("Boho Ft Lauderdale","Cocktail Bar","East Las Olas craft cocktail bar",4.5,f(false,false,true,false,false,false,false,false),"https://bohoftl.com",26.1192,-80.1375),
    v("Grille 401","American","Downtown FLL power dining and cocktails",4.4,f(false,false,true,false,true,false,false,false),"https://grille401.com",26.1201,-80.1385),
    v("Canyon Southwest Café","Southwestern","Fort Lauderdale's beloved Southwest, great margaritas",4.5,f(false,false,false,true,false,false,false,false),"https://canyonsouthwest.com",26.1566,-80.1240),
    v("Sbraga & Company","American","Kevin Sbraga's Fort Lauderdale flagship",4.5,f(false,false,true,false,false,false,true,false),"https://sbragaandcompany.com",26.1192,-80.1385),
    v("Kaluz Restaurant","American","Intracoastal waterway dining, spectacular sunsets",4.5,f(false,false,true,false,false,false,false,true),"https://kaluzrestaurant.com",26.0938,-80.1360),
    v("Monkitail","Japanese","W Hotel's Japanese restaurant and sake bar",4.4,f(false,false,true,false,true,false,false,false),"https://monkitail.com",26.1226,-80.1040),
    v("Rooftop @1WLO","Rooftop Bar","Fort Lauderdale's best rooftop bar, panoramic views",4.4,f(false,false,true,false,true,false,false,false),"https://1wlo.com",26.1201,-80.1375),
    v("Primebar","Cocktail Bar","High-end craft cocktail bar with excellent food menu",4.4,f(false,false,true,false,true,false,false,true),"https://primebar.com",26.1201,-80.1385),
    v("S3 Restaurant & Bar","American","Riverside Hotel's restaurant with New River views",4.3,f(false,false,false,true,false,false,false,true),"https://riversidehotel.com",26.1192,-80.1375),
    v("Olio e Limone","Italian","South Florida's finest upscale Italian",4.6,f(false,false,false,true,true,false,false,true),"https://olioelimone.com",26.1192,-80.1385),
    v("Ernie's Bar-B-Q","BBQ","Fort Lauderdale institution since 1947, iconic BBQ",4.3,f(false,false,false,true,false,false,false,false),"https://erniesbbq.com",26.1101,-80.1385),
    v("Heritage Craft Cocktails & Kitchen","Cocktail Bar","Wilton Manors beloved cocktail spot",4.4,f(false,false,true,false,true,false,false,false),"https://heritageftl.com",26.1566,-80.1320),
    v("Shooters Waterfront","American","Fort Lauderdale waterfront landmark since 1982",4.2,f(false,false,false,true,false,true,false,false),"https://shooterswaterfront.com",26.1376,-80.1040),
  ],
}

function StarRating({ val }) {
  return (
    <span style={{ fontSize:13, color:"#BA7517", fontWeight:500 }}>
      {"★".repeat(Math.round(val))}{"☆".repeat(5-Math.round(val))} {val.toFixed(1)}
    </span>
  )
}

function Tags({ venue }) {
  const tags = Object.keys(TAG_COLORS).filter(k => venue[k])
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
  return (
    <div style={{ background:"#fff", border:`0.5px solid ${venue.status ? "#378ADD" : "#e5e5e5"}`, borderRadius:12, padding:"14px 16px", display:"flex", flexDirection:"column", gap:4, position:"relative" }}>
      {venue.status && <div style={{ position:"absolute", top:10, right:10 }}><StatusBadge status={venue.status} /></div>}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8, paddingRight: venue.status ? 110 : 0 }}>
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
      {venue.notes && <div style={{ fontSize:12, color:"#185FA5", background:"#E6F1FB", borderRadius:6, padding:"6px 10px", marginTop:4, marginLeft:26, lineHeight:1.5 }}>{venue.notes}</div>}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginLeft:26 }}>
        <Tags venue={venue} />
        <button onClick={() => onEditNote(venue)} style={{ fontSize:11, color:"#999", background:"none", border:"none", cursor:"pointer", padding:"4px 0 0", whiteSpace:"nowrap" }}>{venue.notes ? "edit note" : "+ note"}</button>
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
  const [noteText, setNoteText] = useState("")

  const venues = (data[city] || []).filter(venue => {
    const matchFilter = activeFilters.length === 0 || activeFilters.every(f => venue[f])
    const matchSearch = search === "" || venue.name.toLowerCase().includes(search.toLowerCase()) || venue.type.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  function toggleFilter(k) {
    setActiveFilters(prev => prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k])
  }

  function openEditNote(venue) {
    setEditingVenue({...venue, city})
    setNoteText(venue.notes || "")
  }

  function saveNote() {
    if (!editingVenue) return
    setData(prev => {
      const updated = JSON.parse(JSON.stringify(prev))
      updated[editingVenue.city] = (updated[editingVenue.city] || []).map(venue => venue.name === editingVenue.name ? {...venue, notes: noteText} : venue)
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
          messages:[{ role:"user", content:`Search for major restaurant news from the past 2 weeks across NYC, Miami, Los Angeles, Las Vegas, San Francisco, Paris, London, Barcelona, Milan, Washington DC, Chicago, Boston, Mykonos, Palo Alto, Scottsdale, West Palm Beach, Fort Lauderdale. Look for Michelin awards, notable openings, closures, new chefs, buzz-worthy news. Return ONLY a JSON array (no markdown, no preamble) with objects containing: city, name, status (one of: new opening/closed/michelin award/new chef/update), note (one sentence). Return 5-10 updates max. If nothing found return [].` }]
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
              const idx = cityData.findIndex(venue => venue.name.toLowerCase() === u.name.toLowerCase())
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
    fontSize:13, padding:"6px 16px", borderRadius:99, cursor:"pointer", fontWeight: activeTab===t ? 500 : 400,
    border:`0.5px solid ${activeTab===t ? "#888" : "#ddd"}`,
    background: activeTab===t ? "#f5f5f5" : "transparent",
    color: activeTab===t ? "#111" : "#666"
  })

  return (
    <div style={{ padding:"24px", fontFamily:"system-ui, sans-serif", maxWidth:1200, margin:"0 auto" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:4 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:500, margin:0, color:"#111" }}>Restaurant & Bar Guide</h1>
          <p style={{ fontSize:14, color:"#666", margin:"2px 0 0" }}>26 cities · ranked best to worst · restaurants, bars & private clubs</p>
        </div>
        <button onClick={runDailyRefresh} disabled={isRefreshing}
          style={{ fontSize:13, padding:"6px 14px", borderRadius:8, border:"0.5px solid #ccc", background:"transparent", color: isRefreshing ? "#aaa":"#555", cursor: isRefreshing ? "not-allowed":"pointer" }}>
          {isRefreshing ? "Refreshing..." : "Daily Refresh"}
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
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:16 }}>
            {CITIES.map(c => {
              const hasUpdates = (data[c]||[]).some(venue => venue.status)
              return (
                <button key={c} onClick={() => { setCity(c); setSearch("") }}
                  style={{ fontSize:13, padding:"5px 12px", borderRadius:99, border:`0.5px solid ${c===city ? "#888":"#ddd"}`, background: c===city ? "#f0f0f0":"transparent", color: c===city ? "#111":"#666", cursor:"pointer", fontWeight: c===city ? 500:400 }}>
                  {c}{hasUpdates && <span style={{ display:"inline-block", width:6, height:6, borderRadius:99, background:"#1D9E75", marginLeft:5, verticalAlign:"middle", marginTop:-2 }} />}
                </button>
              )
            })}
          </div>

          <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap", alignItems:"center" }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or type..."
              style={{ flex:"1 1 160px", minWidth:140, fontSize:13, padding:"6px 12px", borderRadius:8, border:"0.5px solid #ddd", color:"#111" }} />
            {FILTERS.map(f => (
              <button key={f.key} onClick={() => toggleFilter(f.key)}
                style={{ fontSize:12, padding:"5px 12px", borderRadius:99, border:`0.5px solid ${activeFilters.includes(f.key) ? TAG_COLORS[f.key].color:"#ddd"}`, background: activeFilters.includes(f.key) ? TAG_COLORS[f.key].bg:"transparent", color: activeFilters.includes(f.key) ? TAG_COLORS[f.key].color:"#888", cursor:"pointer", fontWeight: activeFilters.includes(f.key) ? 500:400 }}>
                {f.label}
              </button>
            ))}
          </div>

          <div style={{ display:"flex", gap:8, marginBottom:16, alignItems:"center" }}>
            <span style={{ fontSize:12, color:"#aaa" }}>{venues.length} venue{venues.length !== 1 ? "s":""} in {city} · ranked best to worst</span>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:12 }}>
            {venues.length === 0 ? (
              <div style={{ gridColumn:"1/-1", padding:"2rem", textAlign:"center", color:"#888", fontSize:14 }}>No venues match your filters.</div>
            ) : venues.map((venue, i) => <VenueCard key={venue.name} v={venue} onEditNote={openEditNote} rank={i+1} />)}
          </div>
        </>
      )}

      {editingVenue && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.35)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:999 }}
          onClick={e => { if (e.target === e.currentTarget) setEditingVenue(null) }}>
          <div style={{ background:"#fff", borderRadius:12, padding:"20px 24px", width:"min(420px, 90vw)", border:"0.5px solid #eee" }}>
            <p style={{ fontWeight:500, fontSize:15, margin:"0 0 4px" }}>{editingVenue.name}</p>
            <p style={{ fontSize:12, color:"#888", margin:"0 0 12px" }}>Add a note or status update</p>
            <textarea value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="e.g. Visited March 2026 — incredible tasting menu, ask for table by window..."
              style={{ width:"100%", minHeight:80, fontSize:13, padding:"8px 10px", borderRadius:8, resize:"vertical", border:"0.5px solid #ddd", fontFamily:"system-ui, sans-serif", boxSizing:"border-box" }} />
            <div style={{ display:"flex", gap:8, marginTop:12, justifyContent:"flex-end" }}>
              <button onClick={() => setEditingVenue(null)} style={{ fontSize:13, padding:"6px 16px", borderRadius:8, border:"0.5px solid #ddd", background:"transparent", color:"#666", cursor:"pointer" }}>Cancel</button>
              <button onClick={saveNote} style={{ fontSize:13, padding:"6px 16px", borderRadius:8, border:"0.5px solid #ccc", background:"#f5f5f5", color:"#111", cursor:"pointer", fontWeight:500 }}>Save note</button>
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
