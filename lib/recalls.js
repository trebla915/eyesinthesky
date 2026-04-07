export function mapRecall(recall) {
  return {
    id: recall?.id || '',
    source: recall?.source || '',
    product: recall?.product || '',
    classification: recall?.classification || '',
    date: recall?.date || '',
    date_iso: recall?.date_iso || '',
    distribution: recall?.distribution || '',
    reason: recall?.reason || '',
    alert_level: recall?.alert_level || '',
    isNew: Boolean(recall?.isNew),
  };
}

export function formatRecallDate(dateString) {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}
