export const colors = {
  bg: '#0B0F0C',
  bgAlt: '#121814',
  card: '#18211B',
  cardAlt: '#1F2A22',
  border: '#2C3A2F',
  green: '#0F9D58',
  greenDeep: '#065F3C',
  acid: '#7CFC8B',
  yellow: '#F2C500',
  hazmat: '#D6E63C',
  blue: '#4FC3F7',
  meth: '#5BC8F5',
  red: '#C1440E',
  danger: '#E03E2D',
  text: '#EDF3EE',
  textDim: '#8FA394',
  textFaint: '#5E6F63',
  white: '#FFFFFF',
};

export const gradients = {
  screen: ['#0B0F0C', '#101A12', '#0B0F0C'],
  hero: ['#065F3C', '#0F9D58'],
  correct: ['#0F9D58', '#0B6E3E'],
  wrong: ['#8E2B12', '#5C1A0A'],
  meth: ['#5BC8F5', '#2E7FA8'],
};

export const radius = { sm: 8, md: 14, lg: 20, xl: 28 };

export const spacing = (n) => n * 8;

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  glow: (color) => ({
    shadowColor: color,
    shadowOpacity: 0.55,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  }),
};
