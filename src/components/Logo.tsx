interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ size = 'md' }: LogoProps) {
  return (
    <span className={`logo logo--${size}`}>
      <span aria-hidden="true" className="logo-mark">
        <svg fill="none" viewBox="0 0 48 48">
          <defs>
            <linearGradient id="logo-gradient" x1="8" x2="40" y1="6" y2="42">
              <stop stopColor="#22d3ee" />
              <stop offset="1" stopColor="#818cf8" />
            </linearGradient>
          </defs>
          <rect
            fill="url(#logo-gradient)"
            height="23"
            rx="5"
            transform="rotate(-28 13 27)"
            width="10"
            x="8"
            y="15.5"
          />
          <rect
            fill="url(#logo-gradient)"
            height="23"
            rx="5"
            transform="rotate(28 35 21)"
            width="10"
            x="30"
            y="9.5"
          />
          <circle cx="24" cy="24" fill="#fbbf24" r="5" />
        </svg>
      </span>
      <span className="logo-text">
        Ping<span>Pong</span>
      </span>
    </span>
  );
}
