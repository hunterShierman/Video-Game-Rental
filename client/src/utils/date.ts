export const formatDisplayDate = (isoString: string): string =>
  new Date(isoString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

export const formatLongDate = (isoString: string): string =>
  new Date(isoString).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
