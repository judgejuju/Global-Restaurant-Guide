import { useState, useEffect, useRef } from "react";

const CITIES = [
  "NYC","Miami","Las Vegas","Los Angeles","San Francisco",
  "Napa","Sonoma","St. Helena","Healdsburg","Calistoga",
  "Paris","Cannes","Barcelona","Milan","London",
  "Boston","Chicago","Scottsdale","Santa Monica","Venice CA",
  "Menlo Park","Palo Alto","Washington DC","Mykonos","West Palm Beach","Fort Lauderdale"
];

const FILTERS = [
  { key:"michelin", label:"Michelin" },
  { key:"newBuzz", label:"New & Buzzy" },
  { key:"trendy", label:"Trendy" },
  { key:"classic", label:"Classic" },
  { key:"celebrity", label:"Celebrity" },
  { key:"liveMusic", label:"Live Music" },
  { key:"hardToGet", label:"Hard to Get" },
  { key:"quiet", label:"Quiet" },
];

const TAG_COLORS = {
  michelin:   { bg:"#EEEDFE", color:"#3C3489", label:"Michelin" },
  newBuzz:    { bg:"#E1F5EE", color:"#0F6E56", label:"New & Buzzy" },
  trendy:     { bg:"#FAEEDA", color:"#854F0B", label:"Trendy" },
  classic:    { bg:"#E6F1FB", color:"#185FA5", label:"Classic" },
  celebrity:  { bg:"#FBEAF0", color:"#993556", label:"Celebrity" },
  liveMusic:  { bg:"#EAF3DE", color:"#3B6D11", label:"Live Music" },
  hardToGet:  { bg:"#FCEBEB", color:"#A32D2D", label:"Hard to Get" },
  quiet:      { bg:"#F1EFE8", color:"#5F5E5A", label:"Quiet" },
};

const STATUS_COLORS = {
  open:            { bg:"#EAF3DE", color:"#3B6D11" },
  closed:          { bg:"#FCEBEB", color:"#A32D2D" },
  "new opening":   { bg:"#E1F5EE", color:"#0F6E56" },
  "michelin award":{ bg:"#EEEDFE", color:"#3C3489" },
  "new chef":      { bg:"#FAEEDA", color:"#854F0B" },
  update:          { bg:"#E6F1FB", color:"#185FA5" },
};

const INITIAL_DATA = {
  "NYC": [
    { name:"Le Bernardin", type:"Seafood", desc:"Iconic fine dining, seafood temple", stars:4.9, michelin:true, classic:true, hardToGet:true, quiet:true, newBuzz:false, trendy:false, celebrity:false, liveMusic:false, url:"https://le-bernardin.com", lat:40.7614, lng:-73.9816, status:"", notes:"" },
    { name:"Carbone", type:"Italian-American", desc:"Red-sauce power scene, celebrity magnet", stars:4.7, michelin:false, classic:false, hardToGet:true, quiet:false, newBuzz:false, trendy:true, celebrity:true, liveMusic:false, url:"https://carbonenewyork.com", lat:40.7277, lng:-74.0020, status:"", notes:"" },
    { name:"Tatiana by Kwame Onwuachi", type:"Afro-Caribbean", desc:"Lincoln Center's buzzy new gem", stars:4.6, michelin:true, classic:false, hardToGet:true, quiet:false, newBuzz:true, trendy:true, celebrity:true, liveMusic:false, url:"https://tatiananyc.com", lat:40.7725, lng:-73.9836, status:"", notes:"" },
    { name:"Don Angie", type:"Italian", desc:"Creative red-sauce, perpetually packed", stars:4.7, michelin:true, classic:false, hardToGet:true, quiet:false, newBuzz:false, trendy:true, celebrity:false, liveMusic:false, url:"https://donangie.com", lat:40.7354, lng:-74.0065, status:"", notes:"" },
    { name:"Employees Only", type:"Cocktail Bar", desc:"Legendary speakeasy-style cocktail bar", stars:4.6, michelin:false, classic:true, hardToGet:false, quiet:false, newBuzz:false, trendy:false, celebrity:true, liveMusic:false, url:"https://employeesonlynyc.com", lat:40.7339, lng:-74.0051, status:"", notes:"" },
    { name:"Bar Goto", type:"Japanese Cocktail Bar", desc:"Intimate Japanese-inspired cocktails", stars:4.7, michelin:false, classic:true, hardToGet:false, quiet:true, newBuzz:false, trendy:false, celebrity:false, liveMusic:false, url:"https://bargoto.com", lat:40.7225, lng:-73.9896, status:"", notes:"" },
  ],
  "Miami": [
    { name:"Cote Miami", type:"Korean Steakhouse", desc:"Korean BBQ meets Miami glam", stars:4.7, michelin:true, classic:false, hardToGet:true, quiet:false, newBuzz:false, trendy:true, celebrity:true, liveMusic:false, url:"https://cotemiami.com", lat:25.7926, lng:-80.1419, status:"", notes:"" },
    { name:"Papi Steak", type:"Steakhouse", desc:"Over-the-top steakhouse, celebrity playground", stars:4.5, michelin:false, classic:false, hardToGet:true, quiet:false, newBuzz:false, trendy:true, celebrity:true, liveMusic:true, url:"https://papisteakmiami.com", lat:25.7908, lng:-80.1362, status:"", notes:"" },
    { name:"Cipriani Miami", type:"Italian", desc:"Classic Italian, see-and-be-seen scene", stars:4.5, michelin:false, classic:true, hardToGet:false, quiet:false, newBuzz:false, trendy:false, celebrity:true, liveMusic:false, url:"https://cipriani.com", lat:25.7749, lng:-80.1868, status:"", notes:"" },
    { name:"Le Jardinier", type:"French Vegetable", desc:"Michelin-starred vegetable-forward French", stars:4.6, michelin:true, classic:false, hardToGet:true, quiet:true, newBuzz:false, trendy:true, celebrity:false, liveMusic:false, url:"https://lejardiniermiami.com", lat:25.7908, lng:-80.1347, status:"", notes:"" },
  ],
  "Los Angeles": [
    { name:"Providence", type:"Seafood", desc:"LA's finest seafood, two Michelin stars", stars:4.8, michelin:true, classic:true, hardToGet:true, quiet:true, newBuzz:false, trendy:false, celebrity:true, liveMusic:false, url:"https://providencela.com", lat:34.0833, lng:-118.3418, status:"", notes:"" },
    { name:"Horses", type:"American Bistro", desc:"Coolest room in LA, natural wine haven", stars:4.6, michelin:false, classic:false, hardToGet:true, quiet:false, newBuzz:true, trendy:true, celebrity:true, liveMusic:false, url:"https://horsesla.com", lat:34.0903, lng:-118.3690, status:"", notes:"" },
    { name:"Gjusta", type:"Bakery/Deli", desc:"Venice institution, perpetual lines", stars:4.6, michelin:false, classic:true, hardToGet:false, quiet:false, newBuzz:false, trendy:false, celebrity:true, liveMusic:false, url:"https://gjusta.com", lat:33.9901, lng:-118.4710, status:"", notes:"" },
    { name:"Dialogue", type:"Tasting Menu", desc:"Intimate counter dining, Michelin starred", stars:4.7, michelin:true, classic:false, hardToGet:true, quiet:true, newBuzz:false, trendy:true, celebrity:false, liveMusic:false, url:"https://dialoguedining.com", lat:34.0195, lng:-118.4912, status:"", notes:"" },
  ],
  "Las Vegas": [
    { name:"Joël Robuchon", type:"French", desc:"The most Michelin stars in Vegas", stars:4.8, michelin:true, classic:true, hardToGet:true, quiet:true, newBuzz:false, trendy:false, celebrity:false, liveMusic:false, url:"https://mgmgrand.com/restaurants/joel-robuchon", lat:36.1024, lng:-115.1710, status:"", notes:"" },
    { name:"é by José Andrés", type:"Spanish", desc:"8-seat secret restaurant inside Jaleo", stars:4.9, michelin:true, classic:false, hardToGet:true, quiet:true, newBuzz:false, trendy:true, celebrity:false, liveMusic:false, url:"https://cosmopolitanlasvegas.com/restaurants/e-by-jose-andres", lat:36.1097, lng:-115.1740, status:"", notes:"" },
    { name:"Resorts World Bar", type:"Cocktail Bar", desc:"Rooftop views, Vegas skyline cocktails", stars:4.4, michelin:false, classic:false, hardToGet:false, quiet:false, newBuzz:true, trendy:true, celebrity:true, liveMusic:true, url:"https://rwlasvegas.com", lat:36.1271, lng:-115.1641, status:"", notes:"" },
  ],
  "San Francisco": [
    { name:"Quince", type:"California Italian", desc:"Three Michelin stars, seasonal perfection", stars:4.8, michelin:true, classic:true, hardToGet:true, quiet:true, newBuzz:false, trendy:false, celebrity:false, liveMusic:false, url:"https://quincerestaurant.com", lat:37.7956, lng:-122.4059, status:"", notes:"" },
    { name:"Nari", type:"Thai", desc:"Modern Thai, James Beard nominated", stars:4.7, michelin:true, classic:false, hardToGet:true, quiet:false, newBuzz:true, trendy:true, celebrity:false, liveMusic:false, url:"https://narithairestaurant.com", lat:37.7861, lng:-122.4328, status:"", notes:"" },
    { name:"Trick Dog", type:"Cocktail Bar", desc:"Rotating thematic menus, SF cocktail icon", stars:4.6, michelin:false, classic:true, hardToGet:false, quiet:false, newBuzz:false, trendy:false, celebrity:false, liveMusic:false, url:"https://trickdogbar.com", lat:37.7618, lng:-122.4148, status:"", notes:"" },
  ],
  "Napa": [
    { name:"The French Laundry", type:"Contemporary American", desc:"Thomas Keller's legendary three-star temple", stars:4.9, michelin:true, classic:true, hardToGet:true, quiet:true, newBuzz:false, trendy:false, celebrity:true, liveMusic:false, url:"https://frenchlaundry.com", lat:38.4044, lng:-122.3647, status:"", notes:"" },
    { name:"Bouchon Bistro", type:"French Bistro", desc:"Thomas Keller's charming French bistro", stars:4.6, michelin:false, classic:true, hardToGet:false, quiet:true, newBuzz:false, trendy:false, celebrity:false, liveMusic:false, url:"https://bouchonbistro.com", lat:38.4047, lng:-122.3640, status:"", notes:"" },
    { name:"Zuzu", type:"Spanish Tapas", desc:"Lively tapas, great wine list", stars:4.5, michelin:false, classic:false, hardToGet:false, quiet:false, newBuzz:false, trendy:true, celebrity:false, liveMusic:false, url:"https://zuzunapa.com", lat:38.2975, lng:-122.2852, status:"", notes:"" },
  ],
  "St. Helena": [
    { name:"Press", type:"Steakhouse", desc:"Napa Valley's premier steakhouse", stars:4.6, michelin:false, classic:true, hardToGet:false, quiet:true, newBuzz:false, trendy:false, celebrity:true, liveMusic:false, url:"https://pressnapavalley.com", lat:38.5066, lng:-122.4700, status:"", notes:"" },
    { name:"Tra Vigne", type:"Italian", desc:"Valley landmark, beautiful patio", stars:4.4, michelin:false, classic:true, hardToGet:false, quiet:true, newBuzz:false, trendy:false, celebrity:false, liveMusic:false, url:"https://travignenapavalley.com", lat:38.5063, lng:-122.4699, status:"", notes:"" },
  ],
  "Healdsburg": [
    { name:"SingleThread", type:"Farm-to-Table", desc:"Three Michelin stars, farm-driven kaiseki", stars:4.9, michelin:true, classic:false, hardToGet:true, quiet:true, newBuzz:false, trendy:true, celebrity:false, liveMusic:false, url:"https://singlethreadfarms.com", lat:38.6110, lng:-122.8698, status:"", notes:"" },
    { name:"Spoonbar", type:"Craft Cocktails", desc:"Hotel h2hotel's acclaimed cocktail program", stars:4.5, michelin:false, classic:false, hardToGet:false, quiet:false, newBuzz:false, trendy:true, celebrity:false, liveMusic:false, url:"https://h2hotel.com/spoonbar", lat:38.6104, lng:-122.8693, status:"", notes:"" },
  ],
  "Calistoga": [
    { name:"Solbar", type:"California Cuisine", desc:"Solage Resort's Michelin-starred gem", stars:4.6, michelin:true, classic:false, hardToGet:false, quiet:true, newBuzz:false, trendy:true, celebrity:false, liveMusic:false, url:"https://aubergeresorts.com/solage/dine", lat:38.5788, lng:-122.5803, status:"", notes:"" },
    { name:"Evangeline", type:"New Orleans Creole", desc:"Southern charm in wine country", stars:4.5, michelin:false, classic:false, hardToGet:false, quiet:false, newBuzz:true, trendy:true, celebrity:false, liveMusic:true, url:"https://evangelinecalistoga.com", lat:38.5786, lng:-122.5795, status:"", notes:"" },
  ],
  "Sonoma": [
    { name:"The Girl & The Fig", type:"French Country", desc:"Sonoma Square staple, beloved bistro", stars:4.5, michelin:false, classic:true, hardToGet:false, quiet:true, newBuzz:false, trendy:false, celebrity:false, liveMusic:false, url:"https://thegirlandthefig.com", lat:38.2918, lng:-122.4581, status:"", notes:"" },
    { name:"LaSalette", type:"Portuguese", desc:"Unique Portuguese flavors in wine country", stars:4.5, michelin:false, classic:false, hardToGet:false, quiet:true, newBuzz:false, trendy:false, celebrity:false, liveMusic:false, url:"https://lasalette-restaurant.com", lat:38.2920, lng:-122.4575, status:"", notes:"" },
  ],
  "Paris": [
    { name:"Septime", type:"French Contemporary", desc:"Hottest table in Paris, impossible to book", stars:4.8, michelin:true, classic:false, hardToGet:true, quiet:true, newBuzz:false, trendy:true, celebrity:true, liveMusic:false, url:"https://septime-charonne.fr", lat:48.8520, lng:2.3788, status:"", notes:"" },
    { name:"Le Jules Verne", type:"French", desc:"Eiffel Tower dining, Alain Ducasse", stars:4.6, michelin:true, classic:true, hardToGet:true, quiet:true, newBuzz:false, trendy:false, celebrity:true, liveMusic:false, url:"https://www.lejulesverne-paris.com", lat:48.8582, lng:2.2941, status:"", notes:"" },
    { name:"Frenchie Bar à Vins", type:"Wine Bar", desc:"Natural wine, small plates, buzzy", stars:4.5, michelin:false, classic:false, hardToGet:false, quiet:false, newBuzz:false, trendy:true, celebrity:false, liveMusic:false, url:"https://frenchierestaurant.com", lat:48.8627, lng:2.3466, status:"", notes:"" },
    { name:"Caviar Kaspia", type:"Caviar & Champagne", desc:"Celebrity haunt atop Place de la Madeleine", stars:4.7, michelin:false, classic:true, hardToGet:false, quiet:true, newBuzz:false, trendy:false, celebrity:true, liveMusic:false, url:"https://caviar-kaspia.com", lat:48.8700, lng:2.3247, status:"", notes:"" },
  ],
  "Cannes": [
    { name:"La Palme d'Or", type:"French Riviera", desc:"Two Michelin stars, Martinez Hotel", stars:4.8, michelin:true, classic:true, hardToGet:true, quiet:true, newBuzz:false, trendy:false, celebrity:true, liveMusic:false, url:"https://hotel-martinez.hyatt.com/en-US/hotel/dining.html", lat:43.5490, lng:7.0186, status:"", notes:"" },
    { name:"Mantel", type:"French Contemporary", desc:"One star, creative Riviera cuisine", stars:4.6, michelin:true, classic:false, hardToGet:true, quiet:true, newBuzz:false, trendy:true, celebrity:false, liveMusic:false, url:"https://restaurantmantel.com", lat:43.5508, lng:7.0176, status:"", notes:"" },
    { name:"Baoli Beach", type:"Beach Club", desc:"Glamorous beach scene, film festival epicenter", stars:4.4, michelin:false, classic:false, hardToGet:false, quiet:false, newBuzz:false, trendy:true, celebrity:true, liveMusic:true, url:"https://baolicannes.com", lat:43.5479, lng:7.0225, status:"", notes:"" },
  ],
  "Barcelona": [
    { name:"Disfrutar", type:"Avant-garde", desc:"World's #1 restaurant 2024, former elBulli team", stars:4.9, michelin:true, classic:false, hardToGet:true, quiet:true, newBuzz:true, trendy:true, celebrity:true, liveMusic:false, url:"https://disfrutarbarcelona.com", lat:41.3891, lng:2.1558, status:"", notes:"" },
    { name:"Bodega Sepúlveda", type:"Catalan Wine Bar", desc:"Old-school Catalan bodega, locals love it", stars:4.5, michelin:false, classic:true, hardToGet:false, quiet:true, newBuzz:false, trendy:false, celebrity:false, liveMusic:false, url:"https://bodegasepulveda.com", lat:41.3801, lng:2.1558, status:"", notes:"" },
    { name:"El Nacional", type:"Multi-concept", desc:"Four restaurants in one stunning space", stars:4.6, michelin:false, classic:false, hardToGet:false, quiet:false, newBuzz:false, trendy:true, celebrity:true, liveMusic:true, url:"https://elnacional.cat", lat:41.3896, lng:2.1686, status:"", notes:"" },
  ],
  "Milan": [
    { name:"Il Luogo di Aimo e Nadia", type:"Italian Contemporary", desc:"Two Michelin stars, seasonal Milanese", stars:4.8, michelin:true, classic:true, hardToGet:true, quiet:true, newBuzz:false, trendy:false, celebrity:false, liveMusic:false, url:"https://aimoenadia.com", lat:45.4529, lng:9.1471, status:"", notes:"" },
    { name:"Berton", type:"Contemporary Italian", desc:"One star, sleek design-forward dining", stars:4.6, michelin:true, classic:false, hardToGet:true, quiet:true, newBuzz:false, trendy:true, celebrity:false, liveMusic:false, url:"https://ristoranteberton.com", lat:45.4773, lng:9.1891, status:"", notes:"" },
    { name:"Bar Basso", type:"Cocktail Bar", desc:"Negroni Sbagliato birthplace, design week legend", stars:4.6, michelin:false, classic:true, hardToGet:false, quiet:false, newBuzz:false, trendy:false, celebrity:true, liveMusic:false, url:"https://barbasso.com", lat:45.4778, lng:9.2058, status:"", notes:"" },
  ],
  "London": [
    { name:"The Clove Club", type:"British Contemporary", desc:"Three Michelin stars in Shoreditch", stars:4.8, michelin:true, classic:false, hardToGet:true, quiet:true, newBuzz:false, trendy:true, celebrity:false, liveMusic:false, url:"https://thecloveclub.com", lat:51.5246, lng:-0.0774, status:"", notes:"" },
    { name:"Brat", type:"Basque-influenced", desc:"Open-fire cooking, Michelin starred", stars:4.7, michelin:true, classic:false, hardToGet:true, quiet:false, newBuzz:false, trendy:true, celebrity:true, liveMusic:false, url:"https://bratrestaurant.com", lat:51.5246, lng:-0.0771, status:"", notes:"" },
    { name:"Nightjar", type:"Cocktail Bar", desc:"Pre-Prohibition cocktails, live jazz", stars:4.7, michelin:false, classic:true, hardToGet:true, quiet:false, newBuzz:false, trendy:false, celebrity:false, liveMusic:true, url:"https://barnightjar.com", lat:51.5241, lng:-0.0920, status:"", notes:"" },
  ],
  "Boston": [
    { name:"Menton", type:"French-Italian", desc:"Barbara Lynch's flagship, Michelin starred", stars:4.7, michelin:true, classic:true, hardToGet:true, quiet:true, newBuzz:false, trendy:false, celebrity:false, liveMusic:false, url:"https://mentonboston.com", lat:42.3493, lng:-71.0475, status:"", notes:"" },
    { name:"No. 9 Park", type:"French-Italian", desc:"Barbara Lynch original, South End staple", stars:4.6, michelin:true, classic:true, hardToGet:false, quiet:true, newBuzz:false, trendy:false, celebrity:true, liveMusic:false, url:"https://no9park.com", lat:42.3574, lng:-71.0643, status:"", notes:"" },
    { name:"Drink", type:"Cocktail Bar", desc:"No-menu craft cocktail bar, Fort Point", stars:4.7, michelin:false, classic:true, hardToGet:false, quiet:false, newBuzz:false, trendy:false, celebrity:false, liveMusic:false, url:"https://drinkfortpoint.com", lat:42.3514, lng:-71.0488, status:"", notes:"" },
  ],
  "Chicago": [
    { name:"Alinea", type:"Avant-garde", desc:"Three Michelin stars, theatrical dining experience", stars:4.9, michelin:true, classic:true, hardToGet:true, quiet:true, newBuzz:false, trendy:false, celebrity:true, liveMusic:false, url:"https://alinearestaurant.com", lat:41.9138, lng:-87.6506, status:"", notes:"" },
    { name:"The Violet Hour", type:"Cocktail Bar", desc:"Pioneer of craft cocktail movement", stars:4.7, michelin:false, classic:true, hardToGet:false, quiet:true, newBuzz:false, trendy:false, celebrity:false, liveMusic:false, url:"https://theviolethour.com", lat:41.9073, lng:-87.6758, status:"", notes:"" },
    { name:"Smyth", type:"Contemporary American", desc:"Two stars, inventive tasting menu", stars:4.7, michelin:true, classic:false, hardToGet:true, quiet:true, newBuzz:false, trendy:true, celebrity:false, liveMusic:false, url:"https://smythandtheloyalist.com", lat:41.8914, lng:-87.6522, status:"", notes:"" },
  ],
  "Scottsdale": [
    { name:"FnB", type:"Arizona Cuisine", desc:"James Beard nominated, local ingredients champion", stars:4.7, michelin:false, classic:true, hardToGet:false, quiet:true, newBuzz:false, trendy:false, celebrity:false, liveMusic:false, url:"https://fnbrestaurant.com", lat:33.4943, lng:-111.9254, status:"", notes:"" },
    { name:"Sushi Roku", type:"Japanese", desc:"Celebrity-friendly sushi, Old Town scene", stars:4.4, michelin:false, classic:false, hardToGet:false, quiet:false, newBuzz:false, trendy:true, celebrity:true, liveMusic:false, url:"https://sushiroku.com", lat:33.4948, lng:-111.9232, status:"", notes:"" },
  ],
  "Santa Monica": [
    { name:"Melisse", type:"French Contemporary", desc:"Two Michelin stars, LA's finest French", stars:4.8, michelin:true, classic:true, hardToGet:true, quiet:true, newBuzz:false, trendy:false, celebrity:true, liveMusic:false, url:"https://melisse.com", lat:34.0195, lng:-118.4912, status:"", notes:"" },
    { name:"Tar & Roses", type:"Wood-fired", desc:"Cozy wood-fired small plates", stars:4.5, michelin:false, classic:false, hardToGet:false, quiet:false, newBuzz:false, trendy:true, celebrity:false, liveMusic:false, url:"https://tarandroses.com", lat:34.0199, lng:-118.4955, status:"", notes:"" },
    { name:"Chez Jay", type:"American", desc:"Beloved dive bar since 1959, Sinatra haunt", stars:4.4, michelin:false, classic:true, hardToGet:false, quiet:false, newBuzz:false, trendy:false, celebrity:true, liveMusic:false, url:"https://chezjays.com", lat:34.0168, lng:-118.4991, status:"", notes:"" },
  ],
  "Venice CA": [
    { name:"Felix Trattoria", type:"Italian", desc:"Best pizza in LA, Venetian-style", stars:4.6, michelin:false, classic:false, hardToGet:true, quiet:false, newBuzz:false, trendy:true, celebrity:true, liveMusic:false, url:"https://felixla.com", lat:33.9906, lng:-118.4709, status:"", notes:"" },
    { name:"Gjelina", type:"California", desc:"Venice institution, always packed", stars:4.6, michelin:false, classic:true, hardToGet:true, quiet:false, newBuzz:false, trendy:false, celebrity:true, liveMusic:false, url:"https://gjelina.com", lat:33.9905, lng:-118.4714, status:"", notes:"" },
  ],
  "Menlo Park": [
    { name:"Micheline", type:"French-California", desc:"Intimate bistro, wine country meets Peninsula", stars:4.5, michelin:false, classic:false, hardToGet:false, quiet:true, newBuzz:false, trendy:true, celebrity:false, liveMusic:false, url:"https://michelinerestaurant.com", lat:37.4530, lng:-122.1817, status:"", notes:"" },
    { name:"Refuge", type:"Sandwiches & Beer", desc:"Beloved deli, legendary pastrami and craft beer", stars:4.6, michelin:false, classic:true, hardToGet:false, quiet:false, newBuzz:false, trendy:false, celebrity:false, liveMusic:false, url:"https://refugemenlopark.com", lat:37.4527, lng:-122.1822, status:"", notes:"" },
    { name:"Flea St. Cafe", type:"California Cuisine", desc:"Farm-to-table pioneer, decades of consistency", stars:4.5, michelin:false, classic:true, hardToGet:false, quiet:true, newBuzz:false, trendy:false, celebrity:false, liveMusic:false, url:"https://fleastreetcafe.com", lat:37.4489, lng:-122.1851, status:"", notes:"" },
    { name:"LB Steak", type:"Steakhouse", desc:"Peninsula power dining, tech crowd favorite", stars:4.5, michelin:false, classic:false, hardToGet:false, quiet:false, newBuzz:false, trendy:true, celebrity:true, liveMusic:false, url:"https://lbsteak.com", lat:37.4531, lng:-122.1819, status:"", notes:"" },
  ],
  "Palo Alto": [
    { name:"Baumé", type:"French Contemporary", desc:"Two Michelin stars, avant-garde tasting menu", stars:4.8, michelin:true, classic:false, hardToGet:true, quiet:true, newBuzz:false, trendy:true, celebrity:false, liveMusic:false, url:"https://maisonbaume.com", lat:37.4419, lng:-122.1430, status:"", notes:"" },
    { name:"Evvia Estiatorio", type:"Greek", desc:"Beloved Greek, tech titans' go-to", stars:4.6, michelin:false, classic:true, hardToGet:false, quiet:false, newBuzz:false, trendy:false, celebrity:true, liveMusic:false, url:"https://evvia.net", lat:37.4446, lng:-122.1613, status:"", notes:"" },
    { name:"Nobu Palo Alto", type:"Japanese-Peruvian", desc:"Nobu's Peninsula outpost, sushi and celeb scene", stars:4.5, michelin:false, classic:false, hardToGet:false, quiet:false, newBuzz:false, trendy:true, celebrity:true, liveMusic:false, url:"https://noburestaurants.com/palo-alto", lat:37.4480, lng:-122.1601, status:"", notes:"" },
    { name:"The Bird Bar & Grill", type:"American Bar", desc:"Lively neighborhood bar, great happy hour", stars:4.3, michelin:false, classic:false, hardToGet:false, quiet:false, newBuzz:false, trendy:false, celebrity:false, liveMusic:true, url:"https://thebirdpaloalto.com", lat:37.4421, lng:-122.1429, status:"", notes:"" },
  ],
  "Washington DC": [
    { name:"Inn at Little Washington", type:"American Contemporary", desc:"Three Michelin stars, Patrick O'Connell's masterpiece", stars:4.9, michelin:true, classic:true, hardToGet:true, quiet:true, newBuzz:false, trendy:false, celebrity:true, liveMusic:false, url:"https://theinnatlittlewashington.com", lat:38.9072, lng:-77.0369, status:"", notes:"" },
    { name:"Minibar by José Andrés", type:"Avant-garde", desc:"Two Michelin stars, 20-course theatrical experience", stars:4.9, michelin:true, classic:false, hardToGet:true, quiet:true, newBuzz:false, trendy:true, celebrity:true, liveMusic:false, url:"https://minibarbyandres.com", lat:38.8977, lng:-77.0255, status:"", notes:"" },
    { name:"Le Diplomate", type:"French Brasserie", desc:"DC's most beloved brasserie, perennial hot spot", stars:4.6, michelin:false, classic:false, hardToGet:true, quiet:false, newBuzz:false, trendy:true, celebrity:true, liveMusic:false, url:"https://lediplomatedc.com", lat:38.9093, lng:-77.0322, status:"", notes:"" },
    { name:"Bresca", type:"Contemporary American", desc:"One Michelin star, creative seasonal tasting menu", stars:4.7, michelin:true, classic:false, hardToGet:true, quiet:true, newBuzz:false, trendy:true, celebrity:false, liveMusic:false, url:"https://brescadc.com", lat:38.9098, lng:-77.0321, status:"", notes:"" },
    { name:"Columbia Room", type:"Cocktail Bar", desc:"Michelin-starred cocktail bar, three distinct spaces", stars:4.8, michelin:true, classic:false, hardToGet:true, quiet:true, newBuzz:false, trendy:true, celebrity:false, liveMusic:false, url:"https://columbiaroomdc.com", lat:38.9127, lng:-77.0301, status:"", notes:"" },
  ],
  "Mykonos": [
    { name:"Nobu Mykonos", type:"Japanese-Peruvian", desc:"Glamorous clifftop setting, jet-set crowd", stars:4.6, michelin:false, classic:false, hardToGet:true, quiet:false, newBuzz:false, trendy:true, celebrity:true, liveMusic:false, url:"https://noburestaurants.com/mykonos", lat:37.4467, lng:25.3289, status:"", notes:"" },
    { name:"Spilia", type:"Seafood", desc:"Sea cave setting, dramatic and romantic", stars:4.7, michelin:false, classic:false, hardToGet:true, quiet:true, newBuzz:false, trendy:true, celebrity:true, liveMusic:false, url:"https://spilia.gr", lat:37.4312, lng:25.3195, status:"", notes:"" },
    { name:"Scorpios", type:"Beach Club", desc:"The island's most iconic sunset beach club", stars:4.6, michelin:false, classic:false, hardToGet:false, quiet:false, newBuzz:false, trendy:true, celebrity:true, liveMusic:true, url:"https://scorpiosmykonos.com", lat:37.4201, lng:25.3401, status:"", notes:"" },
    { name:"Interni", type:"Mediterranean", desc:"Romantic garden setting in Mykonos Town", stars:4.6, michelin:false, classic:true, hardToGet:false, quiet:true, newBuzz:false, trendy:false, celebrity:true, liveMusic:false, url:"https://internirestaurant.com", lat:37.4454, lng:25.3283, status:"", notes:"" },
    { name:"Remezzo", type:"Cocktail Bar", desc:"Iconic Little Venice waterfront bar, legendary sunsets", stars:4.5, michelin:false, classic:true, hardToGet:false, quiet:false, newBuzz:false, trendy:false, celebrity:true, liveMusic:false, url:"https://remezzomykonos.com", lat:37.4452, lng:25.3274, status:"", notes:"" },
  ],
  "West Palm Beach": [
    { name:"Meat Market", type:"Steakhouse", desc:"Upscale steakhouse, Worth Avenue scene", stars:4.5, michelin:false, classic:false, hardToGet:false, quiet:false, newBuzz:false, trendy:true, celebrity:true, liveMusic:false, url:"https://meatmarket.net", lat:26.7153, lng:-80.0534, status:"", notes:"" },
    { name:"Avocado Grill", type:"Contemporary American", desc:"Farm-to-table, local favorite for brunch and dinner", stars:4.5, michelin:false, classic:false, hardToGet:false, quiet:false, newBuzz:false, trendy:true, celebrity:false, liveMusic:false, url:"https://avocadogrillwpb.com", lat:26.7157, lng:-80.0527, status:"", notes:"" },
    { name:"Buccan", type:"Small Plates", desc:"Palm Beach's buzziest spot, share plates and cocktails", stars:4.6, michelin:false, classic:false, hardToGet:true, quiet:false, newBuzz:false, trendy:true, celebrity:true, liveMusic:false, url:"https://buccanpalmbeach.com", lat:26.7041, lng:-80.0378, status:"", notes:"" },
    { name:"Respite at the Ben", type:"Craft Cocktails", desc:"Rooftop bar, skyline views and creative cocktails", stars:4.4, michelin:false, classic:false, hardToGet:false, quiet:false, newBuzz:true, trendy:true, celebrity:false, liveMusic:true, url:"https://thebenwestpalmbeach.com", lat:26.7148, lng:-80.0541, status:"", notes:"" },
  ],
  "Fort Lauderdale": [
    { name:"Louie Bossi's", type:"Italian", desc:"Lively Italian, fresh pasta and great energy on Las Olas", stars:4.5, michelin:false, classic:false, hardToGet:false, quiet:false, newBuzz:false, trendy:true, celebrity:false, liveMusic:true, url:"https://louiebossi.com", lat:26.1192, lng:-80.1375, status:"", notes:"" },
    { name:"Steak 954", type:"Steakhouse", desc:"W Hotel's dramatic steakhouse with jellyfish tank", stars:4.5, michelin:false, classic:false, hardToGet:false, quiet:false, newBuzz:false, trendy:true, celebrity:true, liveMusic:false, url:"https://steak954.com", lat:26.1226, lng:-80.1040, status:"", notes:"" },
    { name:"The Boatyard", type:"Seafood", desc:"Waterfront seafood, yachts docking at your table", stars:4.4, michelin:false, classic:true, hardToGet:false, quiet:false, newBuzz:false, trendy:false, celebrity:false, liveMusic:true, url:"https://boatyardrestaurant.com", lat:26.0998, lng:-80.1140, status:"", notes:"" },
    { name:"Batch Gastropub", type:"Gastropub", desc:"Craft beer and burgers, vibrant Las Olas staple", stars:4.3, michelin:false, classic:false, hardToGet:false, quiet:false, newBuzz:false, trendy:true, celebrity:false, liveMusic:true, url:"https://batchgastropub.com", lat:26.1188, lng:-80.1381, status:"", notes:"" },
  ],
};

function StarRating({ val }) {
  return (
    <span style={{ fontSize:13, color:"#BA7517", fontWeight:500 }}>
      {"★".repeat(Math.round(val))}{"☆".repeat(5-Math.round(val))} {val.toFixed(1)}
    </span>
  );
}

function Tags({ venue }) {
  const tags = Object.keys(TAG_COLORS).filter(k => venue[k]);
  return (
    <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginTop:6 }}>
      {tags.map(t => (
        <span key={t} style={{ fontSize:11, padding:"2px 8px", borderRadius:99, background:TAG_COLORS[t].bg, color:TAG_COLORS[t].color, fontWeight:500 }}>
          {TAG_COLORS[t].label}
        </span>
      ))}
    </div>
  );
}

function StatusBadge({ status }) {
  if (!status) return null;
  const key = status.toLowerCase();
  const style = STATUS_COLORS[key] || STATUS_COLORS.update;
  return (
    <span style={{ fontSize:11, padding:"2px 10px", borderRadius:99, background:style.bg, color:style.color, fontWeight:500, whiteSpace:"nowrap" }}>
      {status}
    </span>
  );
}

function VenueCard({ v, onEditNote }) {
  return (
    <div style={{ background:"var(--color-background-primary)", border:`0.5px solid ${v.status ? "#378ADD" : "var(--color-border-tertiary)"}`,
      borderRadius:12, padding:"14px 16px", display:"flex", flexDirection:"column", gap:4,
      position:"relative" }}>
      {v.status && (
        <div style={{ position:"absolute", top:10, right:10 }}>
          <StatusBadge status={v.status} />
        </div>
      )}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8, paddingRight: v.status ? 100 : 0 }}>
        <div>
          <a href={v.url} target="_blank" rel="noopener noreferrer"
            style={{ fontSize:15, fontWeight:500, color:"var(--color-text-primary)", textDecoration:"none" }}>
            {v.name}
          </a>
          <div style={{ fontSize:12, color:"var(--color-text-secondary)", marginTop:1 }}>{v.type}</div>
        </div>
        <StarRating val={v.stars} />
      </div>
      <p style={{ fontSize:13, color:"var(--color-text-secondary)", margin:0, lineHeight:1.5 }}>{v.desc}</p>
      {v.notes && (
        <div style={{ fontSize:12, color:"var(--color-text-info)", background:"var(--color-background-info)",
          borderRadius:6, padding:"6px 10px", marginTop:4, lineHeight:1.5 }}>
          {v.notes}
        </div>
      )}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
        <Tags venue={v} />
        <button onClick={() => onEditNote(v)}
          style={{ fontSize:11, color:"var(--color-text-tertiary)", background:"none", border:"none", cursor:"pointer", padding:"4px 0 0", whiteSpace:"nowrap" }}>
          {v.notes ? "edit note" : "+ note"}
        </button>
      </div>
    </div>
  );
}

function MapView({ venues }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!mapRef.current || venues.length === 0) return;
    const center = { lat: venues[0].lat, lng: venues[0].lng };
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        zoom:13, center, mapTypeControl:false, streetViewControl:false,
        styles:[{ featureType:"poi", elementType:"labels", stylers:[{visibility:"off"}] }]
      });
    } else {
      mapInstanceRef.current.setCenter(center);
    }
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
    venues.forEach(v => {
      const marker = new window.google.maps.Marker({ position:{lat:v.lat,lng:v.lng}, map:mapInstanceRef.current, title:v.name });
      const iw = new window.google.maps.InfoWindow({
        content:`<div style="max-width:220px;font-family:sans-serif"><strong style="font-size:14px">${v.name}</strong><br><span style="font-size:12px;color:#666">${v.type}</span><br><span style="font-size:12px">${v.desc}</span><br><span style="font-size:12px;color:#BA7517">${"★".repeat(Math.round(v.stars))} ${v.stars.toFixed(1)}</span>${v.status ? `<br><span style="font-size:11px;color:#185FA5;font-weight:500">${v.status}</span>` : ""}${v.notes ? `<br><span style="font-size:11px;color:#555">${v.notes}</span>` : ""}<br><a href="${v.url}" target="_blank" style="font-size:12px;color:#185FA5">Visit website</a></div>`
      });
      marker.addListener("click", () => iw.open(mapInstanceRef.current, marker));
      markersRef.current.push(marker);
    });
    if (venues.length > 1) {
      const bounds = new window.google.maps.LatLngBounds();
      venues.forEach(v => bounds.extend({lat:v.lat,lng:v.lng}));
      mapInstanceRef.current.fitBounds(bounds);
    }
  }, [venues]);

  return <div ref={mapRef} style={{ width:"100%", height:400, borderRadius:8, border:"0.5px solid var(--color-border-tertiary)" }} />;
}

export default function App() {
  const [city, setCity] = useState("NYC");
  const [activeFilters, setActiveFilters] = useState([]);
  const [search, setSearch] = useState("");
  const [view, setView] = useState("list");
  const [mapsLoaded, setMapsLoaded] = useState(!!window.google);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [data, setData] = useState(INITIAL_DATA);
  const [recentUpdates, setRecentUpdates] = useState([]);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [activeTab, setActiveTab] = useState("cities");
  const [editingVenue, setEditingVenue] = useState(null);
  const [noteText, setNoteText] = useState("");

  useEffect(() => {
    if (!window.google && !document.getElementById("gmaps-script")) {
      const s = document.createElement("script");
      s.id = "gmaps-script";
      s.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyBVIwqZ4L7ACGvcqgVXc0ZvOJZVw1VBDhU";
      s.async = true;
      s.onload = () => setMapsLoaded(true);
      document.head.appendChild(s);
    }
  }, []);

  const allVenues = Object.entries(data).flatMap(([c, vs]) => vs.map(v => ({...v, city:c})));

  const venues = (data[city] || []).filter(v => {
    const matchFilter = activeFilters.length === 0 || activeFilters.every(f => v[f]);
    const matchSearch = search === "" || v.name.toLowerCase().includes(search.toLowerCase()) || v.type.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  function toggleFilter(k) {
    setActiveFilters(prev => prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k]);
  }

  function openEditNote(v) {
    setEditingVenue(v);
    setNoteText(v.notes || "");
  }

  function saveNote() {
    if (!editingVenue) return;
    setData(prev => {
      const updated = { ...prev };
      updated[editingVenue.city || city] = (updated[editingVenue.city || city] || []).map(v =>
        v.name === editingVenue.name ? { ...v, notes: noteText } : v
      );
      return updated;
    });
    setEditingVenue(null);
  }

  async function runDailyRefresh() {
    setIsRefreshing(true);
    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          tools:[{ type:"web_search_20250305", name:"web_search" }],
          messages:[{
            role:"user",
            content:`You are a restaurant intelligence agent. Search for major restaurant news from the past 2 weeks across these cities: NYC, Miami, Los Angeles, Las Vegas, San Francisco, Paris, London, Barcelona, Milan, Washington DC, Chicago, Boston, Mykonos, Palo Alto, Scottsdale, West Palm Beach, Fort Lauderdale.

Look for: new Michelin awards, notable openings, closures, new chefs, buzz-worthy news.

Return ONLY a JSON array (no markdown, no preamble) of update objects. Each object must have exactly these fields:
- "city": city name matching the list above
- "name": restaurant or bar name
- "status": one of: "new opening", "closed", "michelin award", "new chef", "update"
- "note": one sentence summary of the news

Example format:
[{"city":"NYC","name":"Carbone","status":"update","note":"Expanded to new location in Tribeca."}]

Return 5-10 updates maximum. If nothing notable found, return an empty array [].`
          }]
        })
      });
      const d = await resp.json();
      const text = d.content?.filter(b => b.type === "text").map(b => b.text).join("") || "[]";
      let updates = [];
      try {
        const clean = text.replace(/```json|```/g,"").trim();
        updates = JSON.parse(clean);
      } catch(e) { updates = []; }

      if (updates.length > 0) {
        const ts = new Date().toLocaleString();
        const stamped = updates.map(u => ({...u, ts}));
        setRecentUpdates(prev => [...stamped, ...prev].slice(0, 50));
        setData(prev => {
          const updated = JSON.parse(JSON.stringify(prev));
          updates.forEach(u => {
            const cityData = updated[u.city];
            if (cityData) {
              const idx = cityData.findIndex(v => v.name.toLowerCase() === u.name.toLowerCase());
              if (idx !== -1) {
                cityData[idx].status = u.status;
                cityData[idx].notes = u.note;
              }
            }
          });
          return updated;
        });
      }
      setLastRefresh(new Date().toLocaleString());
    } catch(e) {
      console.error(e);
    }
    setIsRefreshing(false);
  }

  const tabStyle = (t) => ({
    fontSize:13, padding:"6px 16px", borderRadius:99, cursor:"pointer", fontWeight: activeTab===t ? 500 : 400,
    border:`0.5px solid ${activeTab===t ? "var(--color-border-primary)" : "var(--color-border-tertiary)"}`,
    background: activeTab===t ? "var(--color-background-secondary)" : "transparent",
    color: activeTab===t ? "var(--color-text-primary)" : "var(--color-text-secondary)"
  });

  return (
    <div style={{ padding:"1rem 0", fontFamily:"var(--font-sans)" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:4 }}>
        <div>
          <h2 style={{ fontSize:22, fontWeight:500, margin:0, color:"var(--color-text-primary)" }}>Restaurant & Bar Guide</h2>
          <p style={{ fontSize:14, color:"var(--color-text-secondary)", margin:"2px 0 0" }}>27 cities · restaurants, bars & buzz</p>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <button onClick={runDailyRefresh} disabled={isRefreshing}
            style={{ fontSize:13, padding:"6px 14px", borderRadius:8, border:"0.5px solid var(--color-border-secondary)",
              background:"transparent", color: isRefreshing ? "var(--color-text-tertiary)" : "var(--color-text-secondary)", cursor: isRefreshing ? "not-allowed":"pointer" }}>
            {isRefreshing ? "Refreshing..." : "Daily Refresh ↗"}
          </button>
        </div>
      </div>

      {lastRefresh && (
        <p style={{ fontSize:11, color:"var(--color-text-tertiary)", margin:"0 0 12px" }}>Last refreshed: {lastRefresh}</p>
      )}

      <div style={{ display:"flex", gap:8, marginBottom:20 }}>
        <button style={tabStyle("cities")} onClick={() => setActiveTab("cities")}>Cities</button>
        <button style={tabStyle("updates")} onClick={() => setActiveTab("updates")}>
          Recently Updated {recentUpdates.length > 0 && (
            <span style={{ marginLeft:4, fontSize:11, background:"#E1F5EE", color:"#0F6E56", padding:"1px 6px", borderRadius:99, fontWeight:500 }}>
              {recentUpdates.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === "updates" ? (
        <div>
          {recentUpdates.length === 0 ? (
            <div style={{ padding:"2rem", textAlign:"center", color:"var(--color-text-secondary)", fontSize:14,
              background:"var(--color-background-secondary)", borderRadius:8, border:"0.5px solid var(--color-border-tertiary)" }}>
              No updates yet. Hit Daily Refresh to check for news across all cities.
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {recentUpdates.map((u, i) => (
                <div key={i} style={{ background:"var(--color-background-primary)", border:"0.5px solid var(--color-border-tertiary)",
                  borderRadius:10, padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                      <span style={{ fontSize:14, fontWeight:500, color:"var(--color-text-primary)" }}>{u.name}</span>
                      <span style={{ fontSize:12, color:"var(--color-text-tertiary)" }}>·</span>
                      <span style={{ fontSize:12, color:"var(--color-text-secondary)" }}>{u.city}</span>
                      <StatusBadge status={u.status} />
                    </div>
                    <p style={{ fontSize:13, color:"var(--color-text-secondary)", margin:0, lineHeight:1.5 }}>{u.note}</p>
                  </div>
                  <span style={{ fontSize:11, color:"var(--color-text-tertiary)", whiteSpace:"nowrap", paddingTop:2 }}>{u.ts}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:16 }}>
            {CITIES.map(c => {
              const hasUpdates = (data[c]||[]).some(v => v.status);
              return (
                <button key={c} onClick={() => { setCity(c); setSearch(""); }}
                  style={{ fontSize:13, padding:"5px 12px", borderRadius:99,
                    border:`0.5px solid ${c===city ? "var(--color-border-primary)" : "var(--color-border-tertiary)"}`,
                    background: c===city ? "var(--color-background-secondary)" : "transparent",
                    color: c===city ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                    cursor:"pointer", fontWeight: c===city ? 500 : 400, position:"relative" }}>
                  {c}{hasUpdates && <span style={{ display:"inline-block", width:6, height:6, borderRadius:99, background:"#1D9E75", marginLeft:5, verticalAlign:"middle", marginTop:-2 }} />}
                </button>
              );
            })}
          </div>

          <div style={{ display:"flex", gap:8, marginBottom:12, flexWrap:"wrap", alignItems:"center" }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or type..."
              style={{ flex:"1 1 160px", minWidth:140, fontSize:13, padding:"6px 12px", borderRadius:8,
                border:"0.5px solid var(--color-border-tertiary)", background:"var(--color-background-primary)", color:"var(--color-text-primary)" }} />
            {FILTERS.map(f => (
              <button key={f.key} onClick={() => toggleFilter(f.key)}
                style={{ fontSize:12, padding:"5px 12px", borderRadius:99,
                  border:`0.5px solid ${activeFilters.includes(f.key) ? TAG_COLORS[f.key].color : "var(--color-border-tertiary)"}`,
                  background: activeFilters.includes(f.key) ? TAG_COLORS[f.key].bg : "transparent",
                  color: activeFilters.includes(f.key) ? TAG_COLORS[f.key].color : "var(--color-text-secondary)",
                  cursor:"pointer", fontWeight: activeFilters.includes(f.key) ? 500 : 400 }}>
                {f.label}
              </button>
            ))}
          </div>

          <div style={{ display:"flex", gap:8, marginBottom:16, alignItems:"center" }}>
            <button onClick={() => setView(v => v==="list"?"map":"list")}
              style={{ fontSize:13, padding:"6px 14px", borderRadius:8, border:"0.5px solid var(--color-border-secondary)",
                background:"transparent", color:"var(--color-text-primary)", cursor:"pointer" }}>
              {view==="list" ? "Show Map" : "Show List"}
            </button>
            <span style={{ fontSize:12, color:"var(--color-text-tertiary)" }}>
              {venues.length} venue{venues.length !== 1 ? "s" : ""} in {city}
            </span>
          </div>

          {view === "map" ? (
            mapsLoaded ? (
              <MapView venues={venues} />
            ) : (
              <div style={{ background:"var(--color-background-secondary)", borderRadius:8, padding:"2rem", textAlign:"center",
                border:"0.5px solid var(--color-border-tertiary)", color:"var(--color-text-secondary)", fontSize:14 }}>
                <div style={{ marginBottom:8, fontWeight:500 }}>Map view requires a Google Maps API key</div>
                <div style={{ fontSize:13, marginBottom:12 }}>Replace <code>YOUR_API_KEY_HERE</code> in the source with your key from Google Cloud Console.</div>
                <div style={{ fontSize:12, color:"var(--color-text-tertiary)", textAlign:"left", maxWidth:400, margin:"0 auto" }}>
                  {venues.map(v => (
                    <div key={v.name} style={{ marginBottom:3 }}>
                      <strong>{v.name}</strong> — {v.lat.toFixed(4)}, {v.lng.toFixed(4)}
                    </div>
                  ))}
                </div>
              </div>
            )
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:12 }}>
              {venues.length === 0 ? (
                <div style={{ gridColumn:"1/-1", padding:"2rem", textAlign:"center", color:"var(--color-text-secondary)", fontSize:14 }}>
                  No venues match your filters.
                </div>
              ) : venues.map(v => (
                <VenueCard key={v.name} v={v} onEditNote={openEditNote} />
              ))}
            </div>
          )}
        </>
      )}

      {editingVenue && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.35)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:999 }}
          onClick={e => { if (e.target === e.currentTarget) setEditingVenue(null); }}>
          <div style={{ background:"var(--color-background-primary)", borderRadius:12, padding:"20px 24px", width:"min(420px, 90vw)",
            border:"0.5px solid var(--color-border-tertiary)" }}>
            <p style={{ fontWeight:500, fontSize:15, margin:"0 0 4px" }}>{editingVenue.name}</p>
            <p style={{ fontSize:12, color:"var(--color-text-secondary)", margin:"0 0 12px" }}>Add a note or status update</p>
            <textarea value={noteText} onChange={e => setNoteText(e.target.value)}
              placeholder="e.g. Temporarily closed for renovation, reopening May 2026..."
              style={{ width:"100%", minHeight:80, fontSize:13, padding:"8px 10px", borderRadius:8, resize:"vertical",
                border:"0.5px solid var(--color-border-secondary)", background:"var(--color-background-secondary)",
                color:"var(--color-text-primary)", fontFamily:"var(--font-sans)", boxSizing:"border-box" }} />
            <div style={{ display:"flex", gap:8, marginTop:12, justifyContent:"flex-end" }}>
              <button onClick={() => setEditingVenue(null)}
                style={{ fontSize:13, padding:"6px 16px", borderRadius:8, border:"0.5px solid var(--color-border-tertiary)",
                  background:"transparent", color:"var(--color-text-secondary)", cursor:"pointer" }}>
                Cancel
              </button>
              <button onClick={saveNote}
                style={{ fontSize:13, padding:"6px 16px", borderRadius:8, border:"0.5px solid var(--color-border-secondary)",
                  background:"var(--color-background-secondary)", color:"var(--color-text-primary)", cursor:"pointer", fontWeight:500 }}>
                Save note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
