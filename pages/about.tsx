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
        <section>
          <h2>Here’s my burning secret.</h2>
          <p style={{ fontSize: "x-large" }}>I hate the timeline.</p>
          <p>
            I <em>love</em> following tons of people, I getting windows into
            their lives, and sometimes being invited to step into the door.
          </p>
          <p>
            But stuffing every one of those follows’ posts into a single
            vertical timeline is awful. There are folks I love keeping up with
            but for whom I{" "}
            <em>
              <strong>have</strong>
            </em>{" "}
            to be in the right headspace before I do.
          </p>
          <p>
            For years, I just maintained a bunch of bookmarks in my browser and
            visited individuals’ social media to catch up with them on my
            timeline. It was great! But then (a) <em>November 2022</em> and (b){" "}
            <em>Mastodon</em> happened and I found a ton of fascinating people I
            wanted to keep up with (and interact with!) on the Fediverse. The
            old problem returned: the evil timeline.
          </p>
          <p style={{ fontSize: "x-large" }}>
            Yoyogi is my attempt at a better reading experience.
          </p>
          <p>
            It very consciously breaks from the timeline, and instead elevates{" "}
            <strong>the author</strong> and centers <strong>the thread</strong>.
          </p>
          <p>
            You log in to your Fediverse<sup>†</sup> server. You pick{" "}
            <em>one</em> account you’re following. You see just their threads.
          </p>
          <blockquote>
            † Mastodon right now. Pleroma and Misskey are coming soon.{" "}
            <a href="https://github.com/fasiha/yoyogi/issues">Holler</a> if
            you’re interested.
          </blockquote>
          <p>
            <Link href="/">Try it</Link>!
          </p>
        </section>
        <h2>How it works</h2>
        <section>
          <p>
            Yoyogi runs all its code in your browser. There is <em>no</em>{" "}
            “Yoyogi server” that talks to your Mastodon server on your behalf.
            Your browser loads Yoyogi code from this Yoyogi website and uses it
            to talk to your Fediverse server. So there’s still the concept of
            “logging into” your server. So.
          </p>
          <ol>
            <li>
              Type in the URL of your server, e.g.,{" "}
              <code>https://octodon.social</code> and click “Submit”.
            </li>
            <li>
              Yoyogi opens a new browser tab to that server, which after
              ascertaining you’re logged in, will ask you, “Hey, this Yoyogi
              thing wants to have permission to read what you can read (no
              writing/changing), that ok?” Assuming you trust me, you say
              “Authorize”.
            </li>
            <li>
              Your server will give you a long string of random characters. You
              copy that and paste it into your Yoyogi tab.
            </li>
          </ol>
          <p></p>
        </section>
      </main>
    </div>
  );
}
