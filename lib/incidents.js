// Retained for any future direct fetch use outside the API route
export function mapIncident(incident) {
  const id = incident?.id ? String(incident.id) : undefined;
  const callType = incident?.callType ?? incident?.CallType ?? incident?.type ?? '';
  const locationText = incident?.locationText ?? incident?.address ?? incident?.location ?? '';
  const datetimeStr = incident?.datetimeStr ?? incident?.calledIn ?? '';
  const isActive =
    typeof incident?.isActive === 'boolean' ? incident.isActive :
    (incident?.status ? incident.status !== 'CLEARED' : true);
  const stableId = id ?? `${datetimeStr}::${callType}::${locationText}`.trim();
  return { id: stableId, callType, locationText, datetimeStr, isActive };
}
