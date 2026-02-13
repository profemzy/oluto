import Image from "next/image";
import Link from "next/link";

interface FooterProps {
  companyName?: string;
  tagline?: string;
}

export function Footer({
  companyName = "InfoTitans LTD",
  tagline = "The financial autopilot for Canadian small business owners. Voice-enabled, AI-powered, and built for how you actually work.",
}: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-gray-200 bg-gradient-to-b from-white to-gray-50/50 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-[10%] w-32 h-32 bg-cyan-100 rounded-full opacity-30 blur-3xl" />
      <div className="absolute bottom-0 right-[10%] w-40 h-40 bg-green-100 rounded-full opacity-30 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8 py-12 lg:py-16">
        <div className="flex flex-col items-center text-center">
          {/* Logo with hover effect */}
          <Link href="/" className="inline-block group">
            <Image
              src="/logo.png"
              alt="Oluto"
              width={160}
              height={48}
              className="h-10 w-auto group-hover:scale-105 transition-transform duration-300"
            />
          </Link>
          
          {/* Tagline with animated highlight */}
          <p className="mt-4 text-sm leading-6 text-gray-500 max-w-md">
            {tagline}
          </p>

          {/* Quick Links */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm">
            <Link href="#features" className="text-gray-500 hover:text-cyan-600 transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-gray-500 hover:text-cyan-600 transition-colors">
              How it Works
            </Link>
            <Link href="/auth/login" className="text-gray-500 hover:text-cyan-600 transition-colors">
              Sign In
            </Link>
            <Link href="/auth/register" className="text-gray-500 hover:text-cyan-600 transition-colors">
              Get Started
            </Link>
          </div>

          {/* Social Links */}
          <div className="mt-6 flex items-center gap-4">
            <a 
              href="#" 
              className="p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-cyan-100 hover:text-cyan-600 transition-all duration-300 hover:scale-110"
              aria-label="Twitter"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
            <a 
              href="#" 
              className="p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-cyan-100 hover:text-cyan-600 transition-all duration-300 hover:scale-110"
              aria-label="LinkedIn"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
              </svg>
            </a>
            <a 
              href="#" 
              className="p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-cyan-100 hover:text-cyan-600 transition-all duration-300 hover:scale-110"
              aria-label="GitHub"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400" suppressHydrationWarning>
            &copy; {currentYear} {companyName}. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <Link href="/privacy" className="hover:text-gray-600 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-gray-600 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
