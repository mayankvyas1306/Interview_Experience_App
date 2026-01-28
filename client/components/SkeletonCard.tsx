export default function SkeletonCard({ height = 260 }: { height?: number }) {
  return (
    <div
      className="skeleton w-100"
      style={{ height }}
    />
  );
}
