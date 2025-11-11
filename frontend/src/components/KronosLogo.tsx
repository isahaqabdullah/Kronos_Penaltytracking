export function KronosLogo() {
  return (
    <div className="relative">
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer circle */}
        <circle
          cx="24"
          cy="24"
          r="22"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        
        {/* Clock hands representing time management */}
        <line
          x1="24"
          y1="24"
          x2="24"
          y2="10"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <line
          x1="24"
          y1="24"
          x2="34"
          y2="24"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        
        {/* K letter integrated */}
        <path
          d="M 16 14 L 16 34 M 16 24 L 26 14 M 16 24 L 26 34"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.6"
        />
        
        {/* Center dot */}
        <circle cx="24" cy="24" r="2" fill="currentColor" />
      </svg>
    </div>
  );
}
