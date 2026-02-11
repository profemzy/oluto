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
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12 lg:py-16">
        <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
          <Link href="/" className="inline-block">
            <Image
              src="/logo.png"
              alt="Oluto"
              width={160}
              height={48}
              className="h-10 w-auto"
            />
          </Link>
          <p className="mt-4 text-sm leading-6 text-gray-500 max-w-md">
            {tagline}
          </p>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-100 flex items-center justify-center sm:justify-start">
          <p className="text-xs text-gray-400">
            &copy; {currentYear} {companyName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
