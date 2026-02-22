"use client";

import { HeroSection, AgentChatPreview, AgentsSection, AccountantSection, HowItWorksSection, CTASection } from "./sections";

export default function Home() {
  return (
    <>
      <HeroSection />
      <AgentChatPreview />
      <AgentsSection />
      <HowItWorksSection />
      <AccountantSection />
      <CTASection />
    </>
  );
}
