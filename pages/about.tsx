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
          <h2 id="heres-my-burning-secret">
            <a href="#heres-my-burning-secret">Here’s my burning secret.</a>
          </h2>
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
        <h2 id="how-it-works">
          <a href="#how-it-works">How it works</a>
        </h2>
        <section>
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
          <h2 id="anticipated-questions">
            <a href="#anticipated-questions">Anticipated questions</a>
          </h2>
          <p>
            <strong>Why does it look so terrible?</strong> Yoyogi is just barely
            in the MVP (minimum viable product) stage. I don’t know if it’s{" "}
            <a href="https://blog.asmartbear.com/slc.html">SLC</a> (simple,
            lovable, complete) yet.
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
              follows.
            </li>
            <li>Of course I need to add media (images and video).</li>
            <li>Toggle boosts.</li>
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
