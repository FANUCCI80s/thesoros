
import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Thesoros",
  description: "Thesoros trading and investment platform",
  icons: {
    icon: "/branding/coin_logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}

        <Script
          id="tawk-to"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.Tawk_API = window.Tawk_API || {};
              window.Tawk_LoadStart = new Date();

              window.Tawk_API.onLoad = function () {
                window.Tawk_API.hideWidget();
              };

              (function () {
                var s1 = document.createElement("script");
                var s0 = document.getElementsByTagName("script")[0];

                s1.async = true;
                s1.src =
                  "https://embed.tawk.to/6ada8c0463905d345e40317a/1k5ir5u2r";
                s1.charset = "UTF-8";
                s1.setAttribute("crossorigin", "*");

                if (s0 && s0.parentNode) {
                  s0.parentNode.insertBefore(s1, s0);
                } else {
                  document.head.appendChild(s1);
                }
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
