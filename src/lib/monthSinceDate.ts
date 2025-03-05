export function monthsSinceDate(date: Date) {
  return Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
}