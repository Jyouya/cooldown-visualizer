export default (time, short) =>
  (Math.sign(time) < 0 ? '-' : '') +
  Math.floor(Math.abs(time) / 6000)
    .toString()
    .padStart(2, '0') +
  ':' +
  (short
    ? ((Math.abs(time) % 6000) / 100).toString().padStart(2, '0')
    : ((Math.abs(time) % 6000) / 100).toFixed(2).padStart(5, '0'));
