export function ProgressBar({
  percent,
  colorClassName = "bg-primary",
  trackClassName = "bg-primary-light",
  heightClassName = "h-2.5",
}: {
  percent: number;
  colorClassName?: string;
  trackClassName?: string;
  heightClassName?: string;
}) {
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <div className={`w-full overflow-hidden rounded-full ${trackClassName} ${heightClassName}`}>
      <div
        className={`h-full rounded-full ${colorClassName} transition-all duration-500`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
