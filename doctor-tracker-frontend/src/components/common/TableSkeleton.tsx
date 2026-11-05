"use client";

interface TableSkeletonProps {
  cols: number;
  rows?: number;
}

  export default function TableSkeleton({ cols, rows = 5 }: TableSkeletonProps) {
    return (
        <>
          {Array.from({ length: rows }).map((_, rIdx) => (
        <tr key={rIdx} className="animate-pulse border-b border-slate-100">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <td key={cIdx} className="px-4 py-3">
              <div className={`h-3.5 rounded bg-slate-200 ${cIdx === 0 ? "w-3/4" : "w-1/2"}`} />
            </td>
          ))}
        </tr>
          ))}
      </>
    );
}
