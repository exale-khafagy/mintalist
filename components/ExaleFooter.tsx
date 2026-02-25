export function ExaleFooter({ className = "" }: { className?: string }) {
  return (
    <footer
      className={`border-t border-border py-6 text-center text-sm text-muted-foreground ${className}`}
    >
      <p>© {new Date().getFullYear()} Mintalist</p>
      <p className="mt-1">Powered by <a href="https://exale.net" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline dark:text-emerald-400">Exale Holdings</a></p>
    </footer>
  );
}
