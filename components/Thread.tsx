import { Entity } from "megalodon";
import { getGuaranteed, Trees } from "./ShowAuthor";
import styles from "../styles/components.module.css";
import { Fragment } from "react";

const fmt = Intl.DateTimeFormat(undefined, {
  dateStyle: "short",
  timeStyle: "short",
  hourCycle: "h23",
});
function isoTimestampToNice(s: string) {
  return fmt.format(new Date(s));
}
function basicStatusToJsx(
  status: Entity.Status,
  footer: string,
  reblog?: Entity.Status
): JSX.Element {
  if (status.reblog) {
    return basicStatusToJsx(status.reblog, footer, status);
  }
  return (
    <>
      <div className={styles["toot-topbar"]}>
        <div className={styles["avatar-image"]}>
          <a title={"Go to original"} href={status.url}>
            <img
              alt={status.account.username}
              src={status.account.avatar_static}
            />
          </a>
        </div>
        <div>
          <a
            title={"Go to original"}
            href={status.url}
            className={styles["toot-author"]}
          >
            {status.account.username}
          </a>
          <br />
          <small>
            {isoTimestampToNice(status.created_at)}
            <br />
            {footer && (
              <>
                {footer}
                <br />
              </>
            )}
            {reblog && (
              <span
                title={`Boosted on ${isoTimestampToNice(reblog.created_at)}`}
              >
                ♻️
              </span>
            )}
          </small>
        </div>
      </div>
      <div
        className={styles["dangerous-content"]}
        dangerouslySetInnerHTML={{ __html: status.content }}
      ></div>{" "}
    </>
  );
}

function sortStatuses(v: Entity.Status[], authorId: string) {
  return v.sort((a, b) => {
    if (a.account.id === b.account.id) {
      return a.created_at.localeCompare(b.created_at);
    }
    // They're different authors
    if (a.account.id === authorId) {
      return -1;
    }
    if (b.account.id === authorId) {
      return 1;
    }
    return a.created_at.localeCompare(b.created_at);
  });
}
function sortStatusIds(v: string[], authorId: string, trees: Trees) {
  return sortStatuses(
    v.map((i) => getGuaranteed(trees.id2status, i)),
    authorId
  );
}

export interface ThreadProps {
  progenitorId: string;
  trees: Trees;
  authorId: string;
  depth: number;
  siblingIdx?: number;
  sectionNumbers: number[];
}
export function Thread({
  progenitorId,
  trees,
  authorId,
  depth,
  siblingIdx,
  sectionNumbers,
}: ThreadProps) {
  const progenitor = getGuaranteed(trees.id2status, progenitorId);
  const bullets: JSX.Element[] = [];
  const statusToBoostStatus = (e: Entity.Status) => {
    const boostId = trees.origIdToBoostId.get(e.id);
    return boostId ? trees.id2status.get(boostId) : undefined;
  };

  let thisStatus: Entity.Status | undefined = progenitor;
  while (thisStatus) {
    const childrenOfThis: Entity.Status[] = Array.from(
      trees.parent2childid.get(thisStatus.id) || []
    ).map((s) => getGuaranteed(trees.id2status, s));
    const childrenToShow = sortStatuses(
      childrenOfThis.filter((s) => trees.foldedIds.get(s.id) !== true),
      authorId
    );
    const numFoldedChildren = childrenOfThis.length - childrenToShow.length;

    const foldFooter = numFoldedChildren
      ? `${numFoldedChildren} hidden ${
          numFoldedChildren === 1 ? "reply" : "replies"
        }`
      : "";

    if (childrenToShow.length <= 1) {
      // either no children or just one child (straight-shot thread)
      bullets.push(
        <div key={thisStatus.id} className={styles["toot"]} id={thisStatus.id}>
          {basicStatusToJsx(
            thisStatus,
            foldFooter,
            statusToBoostStatus(thisStatus)
          )}
        </div>
      );
      thisStatus = childrenToShow[0]; // might be undefined! ok! While guard above will work
    } else {
      bullets.push(
        <Fragment key={thisStatus.id}>
          <div
            key={thisStatus.id}
            className={styles["toot"]}
            id={thisStatus.id}
          >
            {basicStatusToJsx(
              thisStatus,
              foldFooter,
              statusToBoostStatus(thisStatus)
            )}
          </div>
          {childrenToShow.map((s, siblingIdx) => (
            <Thread
              key={s.id + "/" + depth}
              progenitorId={s.id}
              trees={trees}
              authorId={authorId}
              depth={depth + 1}
              siblingIdx={siblingIdx + 1}
              sectionNumbers={sectionNumbers.concat(siblingIdx + 1)}
            />
          ))}
        </Fragment>
      );
      thisStatus = undefined;
    }
  }

  const siblings = trees.parent2childid.get(
    trees.child2parentid.get(progenitor.id) ?? ""
  );
  const numSiblings = siblings ? siblings.size : 0;
  const desc = getGuaranteed(trees.id2numDescendants, progenitor.id);
  if (depth === 1) {
    return <div className={styles["thread"]}>{bullets}</div>;
  }

  const siblingIds = sortStatusIds(Array.from(siblings || []), authorId, trees);
  const goLeft =
    siblingIdx && siblingIdx > 1 ? (
      <a
        href={`#collapsible-${siblingIds[siblingIdx - 1 - 1]}`}
        title="Previous sub-thread"
      >
        👈
      </a>
    ) : (
      ""
    );
  const goRight =
    siblingIdx && siblingIdx < numSiblings ? (
      <a
        href={`#collapsible-${siblingIds[siblingIdx + 1 - 1]}`}
        title="Next sub-thread"
      >
        👉
      </a>
    ) : (
      ""
    );
  return (
    <details
      open
      className={styles["thread"]}
      id={"collapsible-" + progenitor.id}
    >
      <summary>
        §{sectionNumbers.join(".")}, reply #{siblingIdx ?? 0} of {numSiblings} (
        {desc.shown + 1} toot
        {desc.shown ? "s" : ""}){" "}
        <a
          href={`#${progenitor.in_reply_to_id}`}
          title="Jump to parent of sub-thread"
        >
          👆
        </a>{" "}
        {goLeft} {goRight}
      </summary>
      {bullets}
    </details>
  );
}
