export default function Badge({ count }) {
  if (!count || count <= 0) return null;

  return (
    <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-navy-800 px-1.5 text-xs font-bold text-white">
      {count > 99 ? '99+' : count}
    </span>
  );
}
