'use client';

import { useEffect } from 'react';
import { getAtmosphereColor, ATMOSPHERE_CSS_VAR } from '@/lib/aesthetics/atmosphere';

/**
 * Updates the --atmosphere-bg CSS custom property every minute
 * to reflect the current time's color temperature.
 */
export function AtmosphereLayer() {
  useEffect(() => {
    const layer = document.getElementById('atmosphere-layer');
    if (!layer) return;

    const update = () => {
      layer.style.setProperty(ATMOSPHERE_CSS_VAR, getAtmosphereColor());
    };

    update();
    const interval = setInterval(update, 60000); // check every minute

    return () => clearInterval(interval);
  }, []);

  return null;
}
