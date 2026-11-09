/** Fill {name} placeholders. Unknown values show as "?" so a missing variable is visible, not silent. */
export function fill(template: string, vars: Record<string, string | number | boolean | undefined>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? '?'));
}

export const minutes = (seconds: number) => Math.round(seconds / 60);

export function lightTimeLabel(seconds: number): string {
  const m = seconds / 60;
  return m < 10 ? `${m.toFixed(1)} min` : `${Math.round(m)} min`;
}
