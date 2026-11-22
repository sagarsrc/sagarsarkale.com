/** Editorial illustrations for the two projects in the landing-page sequence. */
export function ProjectPrint({ project }: { project: 'quickcall' | 'misal' }) {
  return (
    <svg className="project-print" viewBox="0 0 600 180" aria-hidden="true" focusable="false">
      {project === 'quickcall' ? (
        <>
          <rect width="600" height="180" fill="#d7e4e7" />
          <g fill="none" stroke="#20557b" strokeWidth="1.35">
            {Array.from({ length: 31 }, (_, i) => {
              const y = 7 + i * 5.5;
              const bundle = 70 + i * 1.3;
              return <path key={i} d={`M-5 ${y} C95 ${y} 146 ${176 - y} 224 ${bundle} S330 ${bundle} 369 ${bundle} C443 ${bundle} 458 ${y} 605 ${y}`} />;
            })}
          </g>
        </>
      ) : (
        <>
          <rect width="600" height="180" fill="#f3debb" />
          <g stroke="#ad8364" opacity=".48">
            {[25, 54, 90, 137, 156].map(y => <path key={y} d={`M0 ${y}H600`} />)}
            {[80, 180, 300, 420, 520].map(x => <path key={x} d={`M${x} 0V180`} />)}
          </g>
          <text x="300" y="126" textAnchor="middle" fill="#563825" fontSize="110" lang="mr"
            fontFamily="'Noto Sans Devanagari', 'Devanagari Sangam MN', 'Nirmala UI', sans-serif">मिसळ</text>
        </>
      )}
    </svg>
  );
}
