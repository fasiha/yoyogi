import Head from "next/head";
import Link from "next/link";

export default function About() {
  return (
    <div>
      <Head>
        <title>About Yoyogi</title>
        <meta
          name="description"
          content="About Yoyogi (the Mastodon reader for folks who hate The Timeline)"
        />
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🚂</text></svg>"
        ></link>
      </Head>

      <main>
        <h1>
          About <Link href="/">Yoyogi</Link>
        </h1>
      </main>
    </div>
  );
}
