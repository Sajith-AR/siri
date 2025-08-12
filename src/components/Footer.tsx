export default function Footer() {
  return (
    <footer className="mt-12 border-t border-[color:var(--color-border)] text-sm text-foreground/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex flex-wrap gap-4 items-center justify-between">
        <p>© {new Date().getFullYear()} Telemedicine</p>
        <nav className="flex gap-4">
          <a href="/about" className="hover:underline">About</a>
          <a href="/disclaimer" className="hover:underline">Disclaimer</a>
          <a href="/help" className="hover:underline">Help</a>
        </nav>
      </div>
    </footer>
  );
}


