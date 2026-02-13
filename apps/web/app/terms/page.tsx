import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Terms of Service
        </h1>
        <div className="prose prose-gray max-w-none space-y-6 text-gray-600">
          <p>
            Welcome to Oluto by InfoTitans LTD. By using our service, you agree
            to the following terms and conditions.
          </p>
          <h2 className="text-xl font-bold text-gray-900">1. Use of Service</h2>
          <p>
            Oluto is an accounting and financial management platform designed for
            Canadian small businesses. You must provide accurate information when
            creating your account and are responsible for maintaining the
            confidentiality of your credentials.
          </p>
          <h2 className="text-xl font-bold text-gray-900">2. Data Ownership</h2>
          <p>
            You retain full ownership of all financial data you enter into Oluto.
            We do not sell, share, or use your financial data for purposes other
            than providing the service.
          </p>
          <h2 className="text-xl font-bold text-gray-900">
            3. Service Availability
          </h2>
          <p>
            We strive to maintain high availability but do not guarantee
            uninterrupted access. Scheduled maintenance windows will be
            communicated in advance.
          </p>
          <h2 className="text-xl font-bold text-gray-900">
            4. Limitation of Liability
          </h2>
          <p>
            Oluto is a bookkeeping tool and does not constitute professional
            accounting or tax advice. Always consult a qualified accountant for
            tax filing and compliance matters.
          </p>
          <h2 className="text-xl font-bold text-gray-900">5. Changes</h2>
          <p>
            We may update these terms from time to time. Continued use of the
            service after changes constitutes acceptance of the revised terms.
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
