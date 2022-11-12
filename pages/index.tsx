import Head from "next/head";
import { Yoyogi } from "../components/components";

export default function Home() {
  return (
    <div>
      <Head>
        <title>Yoyogi</title>
        <meta
          name="description"
          content="Yoyogi: a Mastodon reader for folks who hate The Timeline"
        />
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🚂</text></svg>"
        ></link>
      </Head>

      <Yoyogi />
    </div>
  );
}
