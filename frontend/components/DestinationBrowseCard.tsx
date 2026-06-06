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
    <article className="group h-full min-h-[390px] w-full" style={style}>
      <Link
        aria-label={`Explore travel data options for ${location}`}
        className="relative block h-full overflow-hidden rounded-lg shadow-[0_26px_90px_-66px_hsl(var(--theme-color)/0.72)] transition duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_34px_108px_-66px_hsl(var(--theme-color)/0.78)]"
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

          <div className="mt-9 flex items-center gap-2 text-white transition-colors duration-200 group-hover:text-orange-100">
            <span className="text-sm font-semibold">Browse destination</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </Link>
    </article>
  );
}
