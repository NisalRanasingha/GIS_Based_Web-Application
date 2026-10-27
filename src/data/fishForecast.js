export const fishSpecies = {
  yellowfin: {
    label: 'Yellowfin tuna',
    description: 'Published polygon forecast areas for yellowfin tuna.',
    requirements: [{ key: 'shape', label: 'Yellowfin fishing areas', accept: '.shp' }],
  },
  bigeye: {
    label: 'Bigeye tuna',
    description: 'Published polygon forecast areas for bigeye tuna.',
    requirements: [{ key: 'shape', label: 'Bigeye fishing areas', accept: '.shp' }],
  },
  skipjack: {
    label: 'Skipjack tuna',
    description: 'Published polygon forecast areas for skipjack tuna.',
    requirements: [{ key: 'shape', label: 'Skipjack fishing areas', accept: '.shp' }],
  },
};

export const forecastUpdatedKey = 'fis_forecast_updated';
