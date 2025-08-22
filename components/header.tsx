import Link from "next/link";
import { HandHeart } from "lucide-react";

export function Header() {
  return (
    <div className="w-full fixed top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="absolute inset-0 border-b border-primary/10">
        <header className="relative max-w-6xl mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center space-x-2 transition-opacity hover:opacity-80"
            >
              <HandHeart className="h-7 w-7 text-primary animate-pulse-gentle" />
              <div className="flex flex-col">
                <span className="font-semibold text-lg bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  InnerEase
                </span>

              </div>
            </Link>
          </div>
        </header>
      </div>
    </div>
  );
}
