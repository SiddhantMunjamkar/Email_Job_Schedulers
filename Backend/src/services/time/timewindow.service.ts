export function getHourWindowKey(date = new Date()) {
    
  const yyyy = date.getFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const hh = String(date.getUTCHours()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}-${hh}`;
}

export function getNextHourStart(date = new Date()) {
  const d = new Date(date);

  d.setUTCMinutes(0, 0, 0);
  d.setUTCHours(d.getUTCHours() + 1);
  return d;
}
