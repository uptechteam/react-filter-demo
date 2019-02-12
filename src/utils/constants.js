export const COLORS = {
  RED: 'Red',
  YELLOW: 'Yellow',
  VIOLET: 'Violet',
  CRIMSON: 'Crimson',
};

export const EASE_FUNCTIONS = {
  linear(t) {
    return t;
  },
  easeInQuad(t) {
    return t * t;
  },
  easeOutQuad(t) {
    return t * (2 - t);
  },
  easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  },
  easeInCubic(t) {
    return t * t * t;
  },
  easeOutCubic(t) {
    return --t * t * t + 1;
  },
  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  },
  easeInQuart(t) {
    return t * t * t * t;
  },
  easeOutQuart(t) {
    return 1 - --t * t * t * t;
  },
  easeInOutQuart(t) {
    return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t;
  },
  easeInQuint(t) {
    return t * t * t * t * t;
  },
  easeOutQuint(t) {
    return 1 + --t * t * t * t * t;
  },
  easeInOutQuint(t) {
    return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t;
  },
};

export const mappedUsersConst = Object.freeze({
  Other: [],
  Violet: [],
  Red: [],
  Yellow: [],
  Crimson: [],
});

export const highLightConst = Object.freeze({
  currentHighLight: 0,
  allHighLight: 0,
  currentType: '',
  currentTypeCount: 0,
  typesCounts: {
    Other: 0,
    Violet: 0,
    Red: 0,
    Yellow: 0,
    Crimson: 0,
  },
  highLightTypes: [],
});
