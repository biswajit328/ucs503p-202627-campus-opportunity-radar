export function RadarBackdrop() {
  const ringScales = [0.25, 0.5, 0.75, 1];

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
      <div className="relative w-[560px] h-[560px]">
        {ringScales.map((scale) => (
          <div
            key={scale}
            className="absolute inset-0 rounded-full border border-teal-400/15"
            style={{ transform: `scale(${scale})` }}
          />
        ))}
        <div
          className="absolute inset-0 rounded-full radar-sweep"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, transparent 300deg, rgba(45,212,191,0.35) 340deg, rgba(45,212,191,0.6) 360deg)",
          }}
        />
      </div>
    </div>
  );
}