import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { addDays, format, startOfToday } from 'date-fns';
import weatherStyles from './Weather.module.scss';

function getNext6Days() {
  const today = startOfToday();
  return Array.from({ length: 6 }, (_, i) => format(addDays(today, i), 'yyyy-MM-dd'));
}

function getVisitsOrDefault(visits) {
  const days = getNext6Days();
  const byDate = {};
  for (const v of visits) {
    if (v.visitDate && !byDate[v.visitDate]) {
      byDate[v.visitDate] = v;
    }
  }
  return days.map(date => {
    if (byDate[date]) return byDate[date];
    return {
      visitDate: date,
      address: { postcode: '87370' },
      isDefault: true,
    };
  });
}

function extractPostcode(address) {
  if (!address || typeof address.address !== 'string') return '87370';
  const match = address.address.match(/\b\d{5}\b/);
  return match ? match[0] : '87370';
}

async function fetchWeather(postcode, date) {
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
  if (!apiKey) {
    return { rainChance: 0, summary: 'No API key' };
  }
  let lat, lon;
  try {
    const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/zip?zip=${postcode},FR&appid=${apiKey}`);
    const geoData = await geoRes.json();
    lat = geoData.lat;
    lon = geoData.lon;
    if (!lat || !lon) throw new Error('No lat/lon');
  } catch (e) {
    return { rainChance: 0, summary: 'No location' };
  }
  try {
    const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`);
    const weatherData = await weatherRes.json();

    if (!weatherData.list) throw new Error('No forecast data');
    const targetDate = new Date(date);
    const slots = weatherData.list.filter(item => {
      const d = new Date(item.dt * 1000);
      return d.getFullYear() === targetDate.getFullYear() &&
        d.getMonth() === targetDate.getMonth() &&
        d.getDate() === targetDate.getDate() &&
        d.getHours() >= 9 && d.getHours() <= 16;
    });
    let rainChance = 0;
    let summary = 'No forecast';
    let icon = null;
    if (slots.length) {
      if (slots.some(s => typeof s.pop === 'number')) {
        rainChance = Math.round(Math.max(...slots.map(s => (s.pop || 0) * 100)));
      } else if (slots.some(s => s.rain && s.rain['3h'] > 0)) {
        rainChance = 80;
      } else {
        rainChance = 0;
      }
      const weatherCounts = {};
      slots.forEach(s => {
        const key = s.weather && s.weather[0] ? s.weather[0].description : 'No summary';
        weatherCounts[key] = (weatherCounts[key] || 0) + 1;
      });
      summary = Object.entries(weatherCounts).sort((a, b) => b[1] - a[1])[0][0];
      icon = slots[0].weather && slots[0].weather[0] ? `https://openweathermap.org/img/wn/${slots[0].weather[0].icon}@2x.png` : null;
    }
    return {
      rainChance,
      summary: summary.charAt(0).toUpperCase() + summary.slice(1),
      icon,
    };
  } catch (e) {
    return { rainChance: 0, summary: 'No forecast' };
  }
}

export default function Weather({ events }) {
  const [weatherData, setWeatherData] = useState([]);

  const visits = (events || [])
    .map(e => e.resource?.visit && e.resource.address ? {
      ...e.resource.visit,
      address: e.resource.address,
      isInside: typeof e.resource.visit.isInside !== 'undefined' ? e.resource.visit.isInside : undefined
    } : null)
    .filter(Boolean);

  useEffect(() => {
    async function loadWeather() {
      const visitsOrDefault = getVisitsOrDefault(visits);
      const results = await Promise.all(
        visitsOrDefault.map(async v => {
          const postcode = extractPostcode(v.address);
          const weather = await fetchWeather(postcode, v.visitDate);
          return {
            date: v.visitDate,
            postcode,
            isDefault: v.isDefault,
            isInside: v.isInside,
            ...weather,
          };
        })
      );
      setWeatherData(results);
    }
    loadWeather();
  }, [events]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: 220 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, borderBottom: '1px solid #ccc', paddingBottom: 4 }}>
        <span style={{ minWidth: 50 }}>Day</span>
        <span style={{ minWidth: 32 }}>Good</span>
        <span style={{ width: 32 }}></span>
        <span style={{ minWidth: 60 }}>Rain</span>
      </div>
      {weatherData.map((w, idx) => {
        let insideCell = null;
        if (!w.isDefault) {
          if (typeof w.isInside !== 'undefined' && !w.isInside && w.rainChance >= 30) {
            insideCell = <span title="Outside, rain likely" className={weatherStyles['weather-cross-flash']}>❌</span>;
          } else {
            insideCell = (
              <span title="Visit scheduled" className={weatherStyles['weather-tick-green']} style={{ display: 'inline-flex', alignItems: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
                  <path d="M6 13L11 18L20 7" stroke="#2ecc40" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            );
          }
        }
        return (
          <div key={w.date || idx} style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: w.isDefault ? 0.7 : 1 }}>
            <span style={{
              color: w.rainChance > 30 ? 'red' : 'green',
              fontWeight: 600,
              minWidth: 50,
              textTransform: 'capitalize'
            }}>
              {format(new Date(w.date), 'EEE')}
            </span>
            <span style={{ minWidth: 32, textAlign: 'center' }}>{insideCell}</span>
            {w.icon && <img src={w.icon} alt="Weather icon" style={{ width: 32, height: 32, marginRight: 4 }} />}
            <span style={{ marginLeft: 8, fontSize: 12, minWidth: 60 }}>Rain: {w.rainChance}%</span>
          </div>
        );
      })}
    </div>
  );
}

Weather.propTypes = {
  events: PropTypes.array.isRequired,
};
