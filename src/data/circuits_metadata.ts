export interface CircuitMetadata {
  circuit_name: string;
  location: string;
  track_length_km: number;
  number_of_laps: number;
  fastest_lap: {
    time: string;
    driver: string;
    year: number;
  };
  first_grand_prix: number;
}

export const CIRCUITS_METADATA: Record<string, CircuitMetadata> = {
  'bahrain': {
    "circuit_name": "Bahrain International Circuit",
    "location": "Sakhir, Bahrain",
    "track_length_km": 5.412,
    "number_of_laps": 57,
    "fastest_lap": { "time": "1:31.447", "driver": "Pedro de la Rosa", "year": 2005 },
    "first_grand_prix": 2004
  },
  'jeddah': {
    "circuit_name": "Jeddah Corniche Circuit",
    "location": "Jeddah, Saudi Arabia",
    "track_length_km": 6.174,
    "number_of_laps": 50,
    "fastest_lap": { "time": "1:30.734", "driver": "Lewis Hamilton", "year": 2021 },
    "first_grand_prix": 2021
  },
  'albert_park': {
    "circuit_name": "Albert Park Circuit",
    "location": "Melbourne, Australia",
    "track_length_km": 5.278,
    "number_of_laps": 58,
    "fastest_lap": { "time": "1:19.813", "driver": "Charles Leclerc", "year": 2024 },
    "first_grand_prix": 1996
  },
  'suzuka': {
    "circuit_name": "Suzuka International Racing Course",
    "location": "Suzuka, Japan",
    "track_length_km": 5.807,
    "number_of_laps": 53,
    "fastest_lap": { "time": "1:30.983", "driver": "Lewis Hamilton", "year": 2019 },
    "first_grand_prix": 1987
  },
  'shanghai': {
    "circuit_name": "Shanghai International Circuit",
    "location": "Shanghai, China",
    "track_length_km": 5.451,
    "number_of_laps": 56,
    "fastest_lap": { "time": "1:32.238", "driver": "Michael Schumacher", "year": 2004 },
    "first_grand_prix": 2004
  },
  'miami': {
    "circuit_name": "Miami International Autodrome",
    "location": "Miami, USA",
    "track_length_km": 5.412,
    "number_of_laps": 57,
    "fastest_lap": { "time": "1:29.708", "driver": "Max Verstappen", "year": 2023 },
    "first_grand_prix": 2022
  },
  'monaco': {
    "circuit_name": "Circuit de Monaco",
    "location": "Monte Carlo, Monaco",
    "track_length_km": 3.337,
    "number_of_laps": 78,
    "fastest_lap": { "time": "1:12.909", "driver": "Lewis Hamilton", "year": 2021 },
    "first_grand_prix": 1950
  },
  'catalunya': {
    "circuit_name": "Circuit de Barcelona-Catalunya",
    "location": "Barcelona, Spain",
    "track_length_km": 4.657,
    "number_of_laps": 66,
    "fastest_lap": { "time": "1:16.330", "driver": "Oscar Piastri", "year": 2025 },
    "first_grand_prix": 1991
  },
  'villeneuve': {
    "circuit_name": "Circuit Gilles Villeneuve",
    "location": "Montreal, Canada",
    "track_length_km": 4.361,
    "number_of_laps": 70,
    "fastest_lap": { "time": "1:13.078", "driver": "Valtteri Bottas", "year": 2019 },
    "first_grand_prix": 1978
  },
  'red_bull_ring': {
    "circuit_name": "Red Bull Ring",
    "location": "Spielberg, Austria",
    "track_length_km": 4.318,
    "number_of_laps": 71,
    "fastest_lap": { "time": "1:05.619", "driver": "Carlos Sainz", "year": 2020 },
    "first_grand_prix": 1970
  },
  'silverstone': {
    "circuit_name": "Silverstone Circuit",
    "location": "Silverstone, UK",
    "track_length_km": 5.891,
    "number_of_laps": 52,
    "fastest_lap": { "time": "1:27.097", "driver": "Max Verstappen", "year": 2020 },
    "first_grand_prix": 1950
  },
  'spa': {
    "circuit_name": "Circuit de Spa-Francorchamps",
    "location": "Stavelot, Belgium",
    "track_length_km": 7.004,
    "number_of_laps": 44,
    "fastest_lap": { "time": "1:46.286", "driver": "Valtteri Bottas", "year": 2018 },
    "first_grand_prix": 1950
  },
  'monza': {
    "circuit_name": "Autodromo Nazionale Monza",
    "location": "Monza, Italy",
    "track_length_km": 5.793,
    "number_of_laps": 53,
    "fastest_lap": { "time": "1:21.046", "driver": "Rubens Barrichello", "year": 2004 },
    "first_grand_prix": 1950
  }
};
