interface ExaleFooterProps {
  textColor?: string;
  className?: string;
}

export function ExaleFooter({ textColor, className = "" }: ExaleFooterProps) {
  return (
    <footer 
      className={`py-6 text-center text-sm transition-colors duration-300 ${className}`}
      style={{ color: textColor || "#71717a" }}
    >
      <p>© 2026 Mintalist</p>
      <p className="mt-1">
        Powered by <span className="font-medium text-emerald-500">Exale Holdings</span>
      </p>
    </footer>
  );
}