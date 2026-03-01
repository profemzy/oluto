"use client";

import {
  HeroSection,
  AgentChatPreview,
  AgentsSection,
  AccountantSection,
  HowItWorksSection,
  CTASection,
} from "./sections";

/**
 * Home page component - Landing page for Oluto.
 * Composes multiple section components to tell the product story.
 * 
 * Sections flow:
 * 1. Hero - Value proposition and primary CTAs
 * 2. Preview - Visual demonstration of the AI interface
 * 3. Agents - Feature showcase of available and upcoming agents
 * 4. How It Works - Step-by-step onboarding process
 * 5. Accountant - Technical credibility and accounting foundation
 * 6. CTA - Final conversion push
 */
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
