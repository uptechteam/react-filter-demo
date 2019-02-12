import { COLORS, EASE_FUNCTIONS } from './constants';

export const arraySlicer = (array, chunkLength) => {
  const result = [];
  const initialLength = array.length;
  if (initialLength <= chunkLength) {
    result.push(array);
  } else {
    const iterations = Math.floor(initialLength / chunkLength);
    for (let i = 0; i < iterations; i += 1) {
      result.push(array.splice(0, chunkLength));
    }
    if (array.length > 0) {
      result.push(array);
    }
  }
  return result;
};

export const mapByColor = (unMapped) => {
  const mapped = {
    Violet: [],
    Red: [],
    Yellow: [],
    Crimson: [],
    Other: [],
  };

  unMapped.forEach((item) => {
    switch (item.fav_color) {
      case COLORS.RED:
        mapped.Red.push(item);
        break;
      case COLORS.VIOLET:
        mapped.Violet.push(item);
        break;
      case COLORS.YELLOW:
        mapped.Yellow.push(item);
        break;
      case COLORS.CRIMSON:
        mapped.Crimson.push(item);
        break;
      default:
        mapped.Other.push(item);
    }
  });
  return mapped;
};

export const scrollIt = (destination, customOffset = 0, duration = 200, easing = 'easeInOutQuint', callback) => {
  const start = window.pageYOffset;
  const startTime = 'now' in window.performance ? performance.now() : new Date().getTime();
  const documentHeight = Math.max(
    document.body.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.clientHeight,
    document.documentElement.scrollHeight,
    document.documentElement.offsetHeight,
  );
  const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.getElementsByTagName('body')[0].clientHeight;
  const destinationOffset = (typeof destination === 'number' ? destination : destination.offsetTop) + customOffset;
  const destinationOffsetToScroll = Math.round(
    documentHeight - destinationOffset < windowHeight
      ? documentHeight - windowHeight : destinationOffset,
  );

  if ('requestAnimationFrame' in window === false) {
    window.scroll(0, destinationOffsetToScroll);
    if (callback) {
      callback();
    }
    return;
  }

  function scroll() {
    const now = 'now' in window.performance ? performance.now() : new Date().getTime();
    const time = Math.min(1, ((now - startTime) / duration));
    const timeFunction = EASE_FUNCTIONS[easing](time);
    window.scroll(0, Math.ceil((timeFunction * (destinationOffsetToScroll - start)) + start));

    if (window.pageYOffset === destinationOffsetToScroll) {
      if (callback) {
        callback();
      }
      return;
    }
    requestAnimationFrame(scroll);
  }
  scroll();
};
