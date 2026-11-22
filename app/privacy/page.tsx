import type { Metadata } from "next";
import { WipeLink } from "@/app/components/wipe";

export const metadata: Metadata = {
  title: "Privacy policy | Code-Z",
  description: "How the Code-Z portfolio handles browser preferences, requests, and published content.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPolicy() {
  return (
    <main className="screen">
      <article className="center doc privacy-policy">
        <h1 className="prompt">privacy policy</h1>
        <p>Last updated: November 22, 2026</p>
        <p>
          This is a personal developer portfolio. It has no visitor analytics, advertising, contact form, or
          third-party tracking pixels. This page describes what the site itself does; hosting and database
          providers may separately process technical data as described below.
        </p>

        <h2>Information sent to the site</h2>
        <p>
          The code-entry feature sends the text you enter to the site&apos;s backend so it can check for a matching
          code or route. The site does not save that text as a visitor profile or use it for analytics. The
          admin login similarly checks a password without storing it as a visitor submission.
        </p>
        <p>
          To slow repeated login and code-entry attempts, the backend temporarily uses an IP address supplied by
          the hosting request headers. These rate-limit counters are held in server memory for up to about one
          minute and are not written to the portfolio database. They may be lost sooner when an application
          instance restarts; limits can also vary across instances.
        </p>

        <h2>Cookies and browser storage</h2>
        <p>
          Cookies are used only for the login sessions, you will likely not be affected by them during normal browsing.
        </p>
        <p>
          Optional display preferences (dyslexia-friendly font, larger text, higher contrast, a motion
          override, and brighter keyboard focus) and developer transition settings are saved in this browser&apos;s localStorage. They are not
          sent to the backend. Clear this site&apos;s browser storage to remove them. The developer transition
          controls are only shown when the URL contains the <code>dev</code> query parameter.
        </p>

        <h2>Audio</h2>
        <p>
          The optional audio playground can request microphone access after you enable its audio
          control. Audio is analyzed in your browser to drive the visualizer; it is not uploaded or recorded by
          this site. A locally selected audio file is likewise played and analyzed in the browser.
          To reiterate, no audio is uploaded or stored by the site. My site is entirely local and processes audio only within your browser.
        </p>

        <h2>Technical information and service providers</h2>
        <p>
          The hosting platform necessarily handles requests to deliver this site and may process IP addresses,
          request details, and security logs under its own retention practices. The PostgreSQL provider configured
          for deployment processes the published portfolio content. 
        </p>
        <p>
          Links to GitHub, LeetCode, project demos, and other external sites take you to those services. Their
          privacy practices apply once you leave this site. The portfolio fonts and visual assets are served
          locally; no third-party font service is contacted by the page. Images embedded in project Markdown
          are limited to same-site URLs so they do not silently contact external image hosts.
        </p>

        <h2>Retention and requests</h2>
        <p>
          Browser preferences remain until you clear them. None of your data is stored by this site.
        </p>
        <p>
          The portfolio does not retain visitor submissions or build visitor profiles. If you believe personal
          information about you appears in on this site, or you have questions regarding your privacy, please contact me anyway.
        </p>

        <h2>Children, security, and updates</h2>
        <p>
          This portfolio is not designed to collect information from children. The site is also not intended for childern under the age of 13. As it contains unfilted content that may not be suitable for young audiences.
        </p>
        <WipeLink href="/contact" className="back">
          &lt; contact
        </WipeLink>
        <WipeLink href="/" className="back">
          &lt; home
        </WipeLink>
      </article>
    </main>
  );
}
