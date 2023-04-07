export function nextDirection(previous, next) {
  const isOpposite = (previous, next) => {
    return next.x === -previous.x || next.y === -previous.y;
  };

  if (isOpposite(previous, next)) {
    return previous;
  }

  return next;
}

export const getRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};
