import Head from "next/head";
import Link from "next/link";
import styles from "../styles/about.module.css";

const LINK_PREFIX = process.env.NEXT_PUBLIC_ASSET_PREFIX || "";

interface LinkedH2Props {
  text: string;
  slug: string;
}
function LinkedH2({ text, slug }: LinkedH2Props) {
  return (
    <h2 id={slug} className={styles["slugged"]}>
      {text} <Link href={"#" + slug}>#</Link>
    </h2>
  );
}

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

      <main className={styles["about"]}>
        <h1>
          About{" "}
          <Link href="/" as={LINK_PREFIX + "/"}>
            Yoyogi
          </Link>
        </h1>
        <section>
          <LinkedH2
            slug="heres-my-burning-secret"
            text="Here’s my burning secret."
          />
          <p style={{ fontSize: "x-large" }}>I hate the timeline.</p>
          <p>
            I <em>love</em> following tons of people, and getting windows into
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
        </section>
        <section>
          <LinkedH2 slug="links" text="Links" />
          <p>
            <Link href="/" as={LINK_PREFIX + "/"}>
              Try it
            </Link>
            ! Star it or leave a bug report on{" "}
            <a href="https://github.com/fasiha/yoyogi">GitHub</a>!
          </p>
          <p>
            Many thanks to{" "}
            <a href="https://toot.cafe/@qm3jp">@qm3jp@toot.cafe</a> for
            invaluable advie and feedback during the design and testing phase!
          </p>
        </section>
        <section>
          <LinkedH2 slug="how-it-works" text="How it works" />
          <p>
            So right now Yoyogi runs all its code in your browser (like{" "}
            <a href="https://pinafore.social/">Pinafore</a>). There is no
            “Yoyogi server”: rather your browser talks to your Fediverse
            server—and I never see any of your data. But you do have to get your
            Fediverse server to talk to your browser, so there’s still the
            concept of logging in:
          </p>
          <ol>
            <li>
              Type in the URL of your server, e.g.,{" "}
              <code>https://octodon.social</code> and click “Submit”.
            </li>
            <li>
              Yoyogi sends you to that server, which after ascertaining you’re
              logged in, will ask you, “Hey, this Yoyogi thing wants to have
              permission to read what you can read (no writing/changing), that
              ok?”
            </li>
            <li>Assuming you trust me, you say “Authorize”.</li>
            <li>Mastodon sends you back to Yoyogi and you can get started!</li>
          </ol>
          <p></p>
        </section>
        <section>
          <LinkedH2 slug="anticipated-questions" text="Anticipated questions" />
          <p>
            <strong>Why does it look so terrible?</strong> Yoyogi is just barely
            in the MVP (minimum viable product) stage. I don’t know if it’s{" "}
            <a href="https://blog.asmartbear.com/slc.html">SLC</a> (simple,
            lovable, complete) yet.
          </p>
          <p>
            <strong>Why is it so slow?</strong> Largely due to my not hiding
            network latency better—we could definitely be showing you toots and
            threads faster, and showing a spinner when we have nothing. But in
            some way, this usage pattern is not well-supported by the Mastodon
            server API at least, which expects you to read a few toots at a time{" "}
            <em>in temporal order</em>, rather than whole threads at a time.
            What Yoyogi does is, it takes a chunk of temporally-contiguous toots
            (one network call) and builds the thread around each (one network
            call <em>per</em> toot), dramatically increasing the work done.
            There are various technical solutions to this (caching, smarter
            database/API layer), which is partly why I haven’t even tried
            reaching for the low-hanging fruit (that’s a lie, mostly it’s
            because I’m lazy).
          </p>
          <p>
            Also note that we’re not saving any toots locally in your browser
            yet. That would make it much faster when you keep up with an author
            regularly (not much to fetch from the server), but wouldn’t help
            much if you’re at all like me and sometimes days go by without
            checking in with some folks.
          </p>
          <p>
            <strong>Why is it lacking &lt;important feature&gt;?</strong> See
            above.
          </p>
          <p>
            <strong>What features are next?</strong> Great question.
          </p>
          <ol>
            <li>
              My mental image for Yoyogi is frankly Google Reader. I’d love it
              if it kept track of how many unread toots I have from each of my
              follows. Or at least how many days it’s been since I caught up.
            </li>
          </ol>
          <p>
            <strong>
              Will it ever have a mode to <em>write</em> posts?
            </strong>{" "}
            No I don’t think so. Posting for me is a totally different mental
            activity than reading/catching up. It’s in fact <em>two</em> mental
            activities:
          </p>
          <ol>
            <li>
              quick conversations—the timeline is actually great for this, so
              I’d switch back to a “normal” Mastodon or Misskey or Pleroma or
              Pinafore app; and
            </li>
            <li>
              Zen-mode composing toots and threads. This I often do in a proper
              document writing app (my journaling app, a notes app, etc.).
            </li>
          </ol>
        </section>
      </main>
    </div>
  );
}
