import { asset } from "@/lib/asset";

// GitHub Pages can't run middleware, so the root picks a locale in the browser.
const script = `var l=(navigator.language||"").toLowerCase().indexOf("id")===0?"id":"en";location.replace("${asset("/")}"+l+"/");`;

export default function RootRedirect() {
  return (
    <html lang="en">
      <head>
        <title>Cup of Hope</title>
        <meta httpEquiv="refresh" content={`0; url=${asset("/en/")}`} />
        <link rel="canonical" href="https://cupofhope.id/en" />
        <script dangerouslySetInnerHTML={{ __html: script }} />
      </head>
      <body>
        <a href={asset("/en/")}>Cup of Hope</a>
      </body>
    </html>
  );
}
