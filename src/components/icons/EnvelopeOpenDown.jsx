const EnvelopeOpenDown = ({ className = "h-5 w-5", strokeWidth = 2, ...props }) => {
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
      <path d="M3 9l9-6 9 6" />
      <path d="M21 9v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9" />
      <path d="M3.5 10.5l7.5 5a2 2 0 0 0 2 0l7.5-5" />
      <path d="M12 3v8" />
      <path d="M9.5 8.5L12 11l2.5-2.5" />
    </svg>
  )
}

export default EnvelopeOpenDown


