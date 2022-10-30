import { Entity, MegalodonInterface } from "megalodon";
import { useEffect, useState } from "react";
export interface ShowAuthorProps {
  megalodon: MegalodonInterface;
  account: Entity.Account;
}
export function ShowAuthor({ account, megalodon }: ShowAuthorProps) {
  const [statuses, setStatuses] = useState<Entity.Status[]>([]);
  useEffect(() => {
    (async function () {
      const res = await megalodon.getAccountStatuses(account.id);
      setStatuses(res.data);
    })();
  }, [megalodon, account]);

  return (
    <>
      We know about {statuses.length} statuses for @{account.username}!
      <ul>
        {statuses.map((s) => (
          <li key={s.id}>
            {s.account.username}: {s.content.replace(/<.*?>/g, "")}{" "}
            {s.created_at}
          </li>
        ))}
      </ul>
    </>
  );
}
