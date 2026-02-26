interface ExaleFooterProps {
  textColor?: string;
  className?: string;
}

export function ExaleFooter({ textColor, className = "" }: ExaleFooterProps) {
  // Use the passed textColor, or fallback to a readable gray
  const styleColor = textColor || "#71717a";

  return (
    <footer 
      className={`py-6 text-center text-sm transition-colors duration-300 ${className}`}
      style={{ color: styleColor }}
    >
      <p>© 2026 Mintalist</p>
      <p className="mt-1">
        Powered by{" "}
        <a 
          href="https://exale.net" 
          target="_blank" 
          rel="noopener noreferrer"
          className="font-medium hover:underline"
          style={{ color: styleColor }} // Ensures the link matches the adaptive color
        >
          Exale Holdings
        </a>
      </p>
    </footer>
  );
}