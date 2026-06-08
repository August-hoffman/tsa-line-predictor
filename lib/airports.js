// Airport reference data for the prototype.
// `baseWait` = typical STANDARD-lane wait (minutes) at an average moment.
// `precheckFactor` = PreCheck lane wait as a fraction of standard.
// `tz` is informational; the prototype uses the visitor's local clock for the demo.
// SEA is featured first because that's August's home airport.

export const AIRPORTS = [
  { code: "SEA", name: "Seattle–Tacoma Intl", city: "Seattle", baseWait: 18, precheckFactor: 0.35, tz: "America/Los_Angeles" },
  { code: "LAX", name: "Los Angeles Intl", city: "Los Angeles", baseWait: 22, precheckFactor: 0.35, tz: "America/Los_Angeles" },
  { code: "ATL", name: "Hartsfield–Jackson Atlanta Intl", city: "Atlanta", baseWait: 24, precheckFactor: 0.30, tz: "America/New_York" },
  { code: "ORD", name: "O'Hare Intl", city: "Chicago", baseWait: 20, precheckFactor: 0.35, tz: "America/Chicago" },
  { code: "JFK", name: "John F. Kennedy Intl", city: "New York", baseWait: 21, precheckFactor: 0.38, tz: "America/New_York" },
  { code: "DEN", name: "Denver Intl", city: "Denver", baseWait: 19, precheckFactor: 0.35, tz: "America/Denver" },
];

export function getAirport(code) {
  return AIRPORTS.find((a) => a.code === code) || AIRPORTS[0];
}
