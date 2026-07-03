import React, { createContext, useContext, useState, ReactNode } from 'react';
import { WeatherContext as WeatherCtxType } from '../types';
import { getMockWeather } from '../data/mockData';

interface WeatherContextShape {
  weather: WeatherCtxType;
  setWeather: (w: WeatherCtxType) => void;
}

const WeatherContext = createContext<WeatherContextShape | null>(null);

export function WeatherProvider({ children }: { children: ReactNode }) {
  const [weather, setWeather] = useState<WeatherCtxType>(getMockWeather());
  return (
    <WeatherContext.Provider value={{ weather, setWeather }}>
      {children}
    </WeatherContext.Provider>
  );
}

export const useWeather = () => {
  const ctx = useContext(WeatherContext);
  if (!ctx) throw new Error('useWeather must be used within WeatherProvider');
  return ctx;
};
