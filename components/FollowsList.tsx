import { Entity, MegalodonInterface } from "megalodon";
export interface FollowsListProps {
  follows: Entity.Account[];
}
export function FollowsList({ follows }: FollowsListProps) {
  return (
    <div>
      <ol>
        {follows.map((f) => (
          <li key={f.id}>
            @{f.acct} {f.display_name}
          </li>
        ))}
      </ol>
    </div>
  );
}
