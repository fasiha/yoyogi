import { Entity, MegalodonInterface } from "megalodon";
import { getGuaranteed, Trees } from "./ShowAuthor";
import stylesAuthor from "../styles/ShowAuthor.module.css";
import { Fragment } from "react";

function isoTimestampToNice(s: string) {
  return new Date(s).toUTCString();
}
function basicStatusToJsx(status: Entity.Status): JSX.Element {
  if (status.reblog) {
    return basicStatusToJsx(status.reblog);
  }
  return (
    <>
      <a
        title={"Go to original: " + isoTimestampToNice(status.created_at)}
        href={status.url}
        className={stylesAuthor["toot-author"]}
      >
        {status.account.username}
      </a>{" "}
      <div
        className={stylesAuthor["dangerous-content"]}
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

    const foldFooter = numFoldedChildren ? (
      <sub>
        {" "}
        {numFoldedChildren} hidden{" "}
        {numFoldedChildren === 1 ? "reply" : "replies"}
      </sub>
    ) : (
      ""
    );

    if (childrenToShow.length <= 1) {
      // either no children or just one child (straight-shot thread)
      bullets.push(
        <div
          key={thisStatus.id}
          className={stylesAuthor["toot"]}
          id={thisStatus.id}
        >
          {basicStatusToJsx(thisStatus)}
          {foldFooter}
        </div>
      );
      thisStatus = childrenToShow[0]; // might be undefined! ok! While guard above will work
    } else {
      bullets.push(
        <Fragment key={thisStatus.id}>
          <div
            key={thisStatus.id}
            className={stylesAuthor["toot"]}
            id={thisStatus.id}
          >
            {basicStatusToJsx(thisStatus)}
            {foldFooter}
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
    return <div className={stylesAuthor["thread"]}>{bullets}</div>;
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
      className={stylesAuthor["thread"]}
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
