"use client";

import { useEffect, useState } from "react";

/**
 * Announcer - Screen reader announcement utility
 * 
 * Provides aria-live regions for dynamic content announcements.
 * Use this for status updates that should be announced to screen readers.
 * 
 * @example
 * const { announce } = useAnnouncer();
 * announce("Transaction saved successfully");
 * 
 * @see https://www.w3.org/WAI/WCAG21/Understanding/status-messages
 */

interface AnnouncerState {
  message: string;
  priority: "polite" | "assertive";
}

// Global state for announcements
let announcementCallback: ((state: AnnouncerState) => void) | null = null;

export function announce(message: string, priority: "polite" | "assertive" = "polite") {
  if (announcementCallback) {
    announcementCallback({ message, priority });
  }
}

export function useAnnouncer() {
  return {
    announce: (message: string, priority: "polite" | "assertive" = "polite") => {
      announce(message, priority);
    },
  };
}

/**
 * LiveRegion - Component that provides aria-live regions
 * 
 * Place this once in your app (typically in layout) to enable
 * screen reader announcements throughout the application.
 */
export function LiveRegion() {
  const [politeMessage, setPoliteMessage] = useState("");
  const [assertiveMessage, setAssertiveMessage] = useState("");

  useEffect(() => {
    announcementCallback = ({ message, priority }) => {
      if (priority === "assertive") {
        setAssertiveMessage(message);
        // Clear after announcement
        setTimeout(() => setAssertiveMessage(""), 1000);
      } else {
        setPoliteMessage(message);
        // Clear after announcement
        setTimeout(() => setPoliteMessage(""), 1000);
      }
    };

    return () => {
      announcementCallback = null;
    };
  }, []);

  return (
    <>
      {/* Polite announcements - won't interrupt current speech */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        data-testid="polite-announcer"
      >
        {politeMessage}
      </div>
      {/* Assertive announcements - will interrupt current speech */}
      <div
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        data-testid="assertive-announcer"
      >
        {assertiveMessage}
      </div>
    </>
  );
}
