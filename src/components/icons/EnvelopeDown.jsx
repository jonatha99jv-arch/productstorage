const EnvelopeDown = ({ className = "h-5 w-5", strokeWidth = 2, ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <rect x="3" y="7" width="18" height="12" rx="2" ry="2" />
      <path d="M3 9l9 6 9-6" />
      <path d="M12 3v7" />
      <path d="M9 8l3 3 3-3" />
    </svg>
  )
}

export default EnvelopeDown


