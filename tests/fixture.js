// Resposta de exemplo no mesmo formato da API Open-Meteo, usada nos testes.
export function respostaExemplo() {
  const time = [];
  const temperature_2m = [];
  const precipitation_probability = [];
  const weather_code = [];
  const is_day = [];
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      const dia = String(30 + d > 31 ? 30 + d - 31 : 30 + d).padStart(2, '0');
      const mes = 30 + d > 31 ? '11' : '10';
      time.push(`2026-${mes}-${dia}T${String(h).padStart(2, '0')}:00`);
      temperature_2m.push(18 + 7 * Math.sin(((h - 9) / 24) * 2 * Math.PI) + d * 0.3);
      precipitation_probability.push(h > 15 && h < 20 ? 60 : 10);
      weather_code.push(h > 15 && h < 20 ? 61 : 2);
      is_day.push(h >= 6 && h < 18 ? 1 : 0);
    }
  }
  return {
    current: {
      time: '2026-10-30T15:45',
      temperature_2m: 24.6,
      relative_humidity_2m: 58,
      apparent_temperature: 25.2,
      is_day: 1,
      weather_code: 2,
      wind_speed_10m: 11.4,
    },
    hourly: { time, temperature_2m, precipitation_probability, weather_code, is_day },
    daily: {
      time: ['2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05'],
      weather_code: [2, 61, 3, 0, 1, 95, 80],
      temperature_2m_max: [26.1, 22.4, 24.0, 28.7, 29.9, 25.3, 23.8],
      temperature_2m_min: [16.2, 15.1, 15.9, 17.4, 18.8, 18.0, 16.5],
      precipitation_probability_max: [35, 80, 20, 0, 5, 90, 65],
      sunrise: ['2026-10-30T05:22'],
      sunset: ['2026-10-30T18:21'],
    },
  };
}
