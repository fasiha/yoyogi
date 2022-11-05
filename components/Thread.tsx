import { Entity, MegalodonInterface } from "megalodon";
import { getGuaranteed, Trees } from "./ShowAuthor";
import stylesAuthor from "../styles/ShowAuthor.module.css";
import { Fragment } from "react";

function basicStatusToJsx(status: Entity.Status): JSX.Element {
  if (status.reblog) {
    return basicStatusToJsx(status.reblog);
  }
  return (
    <>
      <a href={status.url} className={stylesAuthor["toot-author"]}>
        {status.account.username}
      </a>{" "}
      <span dangerouslySetInnerHTML={{ __html: status.content }}></span>
    </>
  );
}

export interface ThreadProps {
  progenitorId: string;
  trees: Trees;
  authorId: string;
  depth: number;
  siblingIdx?: number;
}
export function Thread({
  progenitorId,
  trees,
  authorId,
  depth,
  siblingIdx,
}: ThreadProps) {
  const progenitor = getGuaranteed(trees.id2status, progenitorId);
  const bullets: JSX.Element[] = [];

  let thisStatus: Entity.Status | undefined = progenitor;
  while (thisStatus) {
    const childrenOfThis: Entity.Status[] = Array.from(
      trees.parent2childid.get(thisStatus.id) || []
    ).map((s) => getGuaranteed(trees.id2status, s));
    const childrenToShow = childrenOfThis.filter(
      (s) => trees.foldedIds.get(s.id) !== true
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
        <div key={thisStatus.id} className={stylesAuthor["toot"]}>
          {basicStatusToJsx(thisStatus)}
          {foldFooter}
        </div>
      );
      thisStatus = childrenToShow[0]; // might be undefined! ok! While guard above will work
    } else {
      bullets.push(
        <div key={thisStatus.id} className={stylesAuthor["toot"]}>
          {basicStatusToJsx(thisStatus)}
          {foldFooter}
          {childrenToShow.map((s, siblingIdx) => (
            <Thread
              key={s.id + "/" + depth}
              progenitorId={s.id}
              trees={trees}
              authorId={authorId}
              depth={depth + 1}
              siblingIdx={siblingIdx + 1}
            />
          ))}
        </div>
      );
      thisStatus = undefined;
    }
  }

  const siblings = trees.parent2childid.get(
    trees.child2parentid.get(progenitor.id) ?? ""
  );
  const numSiblings = siblings ? siblings.size : 0;
  const desc = getGuaranteed(trees.id2numDescendants, progenitor.id);
  return depth === 1 ? (
    <div className={stylesAuthor["thread"]}>{bullets}</div>
  ) : (
    <details open className={stylesAuthor["thread"]}>
      <summary>
        (Reply {siblingIdx ?? 0} of {numSiblings}, with total {desc.shown + 1}{" "}
        toot{desc.shown ? "s" : ""})
      </summary>
      {bullets}
    </details>
  );
}
