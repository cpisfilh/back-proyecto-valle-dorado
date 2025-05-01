export function addExactMonthPreservingDate(baseDate, monthsToAdd) {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const day = baseDate.getDate();
  
    const targetDate = new Date(year, month + monthsToAdd, 1); // primer día del mes destino
    const lastDay = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).getDate(); // último día de ese mes
  
    targetDate.setDate(Math.min(day, lastDay)); // si el día no existe (31 en febrero), ajusta al último día
  
    return targetDate;
  }
  
export function parseFechaReferenciaUTC(dateStr) {
    const date = new Date(dateStr);
    return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  }