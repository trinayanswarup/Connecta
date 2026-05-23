import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type DestinationBrowseCardProps = {
  imageUrl: string;
  location: string;
  flag: string;
  stats: string;
  href: string;
  themeColor: string;
};

export function DestinationBrowseCard({
  imageUrl,
  location,
  flag,
  stats,
  href,
  themeColor
}: DestinationBrowseCardProps) {
  const style = {
    "--theme-color": themeColor
  } as CSSProperties;

  return (
    <article className="group h-full min-h-[360px] w-full" style={style}>
      <Link
        aria-label={`Explore travel data options for ${location}`}
        className="relative block h-full overflow-hidden rounded-2xl shadow-lg transition duration-500 ease-out hover:scale-[1.015] hover:shadow-[0_18px_60px_-24px_hsl(var(--theme-color)/0.7)]"
        href={href}
      >
        <div
          className="absolute inset-0 bg-cover bg-center transition duration-700 ease-out group-hover:scale-105"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, hsl(var(--theme-color) / 0.92), hsl(var(--theme-color) / 0.58) 34%, transparent 68%)"
          }}
        />

        <div className="relative flex h-full flex-col justify-end p-5 text-white sm:p-6">
          <h3 className="text-3xl font-semibold tracking-tight">
            {location} <span className="ml-1 text-xl font-semibold">{flag}</span>
          </h3>
          <p className="mt-1 text-sm font-medium text-white/80">{stats}</p>

          <div className="mt-7 flex items-center justify-between rounded-lg border border-[hsl(var(--theme-color)/0.26)] bg-[hsl(var(--theme-color)/0.24)] px-4 py-3 backdrop-blur-md transition duration-300 group-hover:border-[hsl(var(--theme-color)/0.42)] group-hover:bg-[hsl(var(--theme-color)/0.36)]">
            <span className="text-sm font-semibold">Browse destination</span>
            <ArrowRight className="h-4 w-4 transition duration-300 group-hover:translate-x-1" />
          </div>
        </div>
      </Link>
    </article>
  );
}
