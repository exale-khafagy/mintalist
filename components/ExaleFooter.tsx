export function ExaleFooter({ className = "" }: { className?: string }) {
  return (
    <footer
      className={`border-t border-border py-6 text-center text-sm text-muted-foreground ${className}`}
    >
      <p>© {new Date().getFullYear()} Mintalist</p>
      <p className="mt-1">Part of Exale Holdings</p>
    </footer>
  );
}
