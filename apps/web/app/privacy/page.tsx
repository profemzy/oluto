import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Privacy Policy
        </h1>
        <div className="prose prose-gray max-w-none space-y-6 text-gray-600">
          <p>
            InfoTitans LTD (&ldquo;we&rdquo;, &ldquo;us&rdquo;) operates the
            Oluto platform. This policy describes how we collect, use, and
            protect your information.
          </p>
          <h2 className="text-xl font-bold text-gray-900">
            1. Information We Collect
          </h2>
          <p>
            We collect information you provide directly: name, email address,
            business details, and financial data you enter into the platform. We
            also collect usage data such as page visits and feature usage to
            improve the service.
          </p>
          <h2 className="text-xl font-bold text-gray-900">
            2. How We Use Your Information
          </h2>
          <p>
            Your information is used solely to provide and improve the Oluto
            service. We do not sell your personal or financial data to third
            parties.
          </p>
          <h2 className="text-xl font-bold text-gray-900">
            3. Data Storage &amp; Security
          </h2>
          <p>
            Your data is stored on encrypted servers hosted on Microsoft Azure
            in Canada. We use industry-standard security measures including TLS
            encryption, hashed passwords, and role-based access controls.
          </p>
          <h2 className="text-xl font-bold text-gray-900">
            4. Data Retention
          </h2>
          <p>
            We retain your data for as long as your account is active. You may
            request deletion of your account and associated data at any time by
            contacting support.
          </p>
          <h2 className="text-xl font-bold text-gray-900">5. Cookies</h2>
          <p>
            We use essential cookies for authentication and session management.
            No third-party advertising cookies are used.
          </p>
          <h2 className="text-xl font-bold text-gray-900">6. Contact</h2>
          <p>
            For questions about this privacy policy, contact us at{" "}
            <a
              href="mailto:privacy@infotitans.com"
              className="text-cyan-600 hover:text-cyan-500"
            >
              privacy@infotitans.com
            </a>
            .
          </p>
        </div>
        <div className="mt-12">
          <Link
            href="/"
            className="text-sm font-bold text-cyan-600 hover:text-cyan-500 transition-colors"
          >
            &larr; Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
