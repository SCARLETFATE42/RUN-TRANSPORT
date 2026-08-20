const RUN_LOGO_URL = "/RUN-Logo.png";

interface RUNLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export default function RUNLogo({
  className = "",
  size = 250,
  showText = false,
}: RUNLogoProps) {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <img
        src={RUN_LOGO_URL}
        alt="Redeemer's University Logo"
        style={{ width: size, height: size }}
        className="object-contain shrink-0 drop-shadow-md"
      />

{showText && (
  <div className="flex flex-col leading-none">
    <div className="flex items-center gap-1.5">
      <span className="font-extrabold text-3xl tracking-tight text-white">
        RUN
      </span>

      <span className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">
        Mobility
      </span>
    </div>

    <span className="mt-1 text-[10px] font-medium tracking-wider text-slate-400 uppercase">
      Redeemer's University
    </span>
  </div>
)}
    </div>
  );
}
