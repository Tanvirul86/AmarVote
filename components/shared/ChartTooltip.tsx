'use client';

type Props = {
  x: number;
  y: number;
  children: React.ReactNode;
};

export default function ChartTooltip({ x, y, children }: Props) {
  return (
    <div
      style={{ left: x + 12, top: y + 12 }}
      className="fixed z-50 pointer-events-none bg-white text-gray-900 text-sm rounded shadow-lg px-3 py-2 border border-gray-200 max-w-xs"
    >
      {children}
    </div>
  );
}
