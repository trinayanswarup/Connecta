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
    <article className="group h-full min-h-[380px] w-full" style={style}>
      <Link
        aria-label={`Explore travel data options for ${location}`}
        className="relative block h-full overflow-hidden rounded-lg shadow-[0_24px_80px_-56px_hsl(var(--theme-color)/0.72)] transition-shadow duration-300 ease-out hover:shadow-[0_30px_96px_-58px_hsl(var(--theme-color)/0.82)]"
        href={href}
      >
        <div
          className="absolute inset-0 bg-cover bg-center transition duration-700 ease-out group-hover:scale-[1.03]"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to top, hsl(var(--theme-color) / 0.9), hsl(var(--theme-color) / 0.46) 38%, transparent 72%)"
          }}
        />

        <div className="relative flex h-full flex-col justify-end p-6 text-white sm:p-7">
          <h3 className="text-3xl font-semibold">
            {location} <span className="ml-1 text-xl font-semibold">{flag}</span>
          </h3>
          <p className="mt-1 text-sm font-medium text-white/80">{stats}</p>

          <div className="mt-8 flex items-center justify-between rounded-md bg-white/15 px-4 py-3 text-white backdrop-blur-md ring-1 ring-white/20 transition-colors duration-200 group-hover:bg-white/20">
            <span className="text-sm font-semibold">Browse destination</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </Link>
    </article>
  );
}
