import generator, { Entity, MegalodonInterface, Response } from "megalodon";
import { useState } from "react";
import styles from "../styles/components.module.css";
import { ShowAuthor } from "./ShowAuthor";

interface LoginProps {
  loggedIn: boolean;
  submit: (url: string, token: string) => void;
  logout: () => void;
}
function Login({ loggedIn, submit, logout }: LoginProps) {
  const [url, setUrl] = useState("");
  const [token, setToken] = useState("");
  return (
    <div className={styles["login-box"]}>
      {loggedIn ? (
        <>
          Logged into {url}.{" "}
          <button
            onClick={() => {
              logout();
              setUrl("");
              setToken("");
            }}
          >
            Log out
          </button>
        </>
      ) : (
        <>
          <label>
            Mastodon URL?
            <input
              type="url"
              placeholder="https://octodon.social"
              onChange={(e) => setUrl(e.target.value)}
              value={url}
            />
          </label>
          <label>
            Token?
            <input
              type="password"
              placeholder="token"
              onChange={(e) => setToken(e.target.value)}
              value={token}
            />
          </label>
          <button onClick={() => submit(url, token)}>Submit</button>
        </>
      )}
    </div>
  );
}

function removeTrailingSlashes(url: string) {
  const match = url.match(/\/+$/);
  if (match && match.index) {
    url = url.slice(0, match.index);
  }
  return url;
}
async function verify(
  url: string,
  token: string
): Promise<
  undefined | { megalodon: MegalodonInterface; account: Entity.Account }
> {
  const megalodon = generator("mastodon", url, token);
  try {
    const res = await megalodon.verifyAccountCredentials();
    // above will throw if 401 (unauthorized) or 404 (bad URL)
    return { megalodon, account: res.data };
  } catch (e) {
    console.error("Network error:", e);
    return undefined;
  }
}
export function Yoyogi() {
  const [megalodon, setMegalodon] = useState<MegalodonInterface | undefined>(
    undefined
  );
  const [account, setAccount] = useState<Entity.Account | undefined>(undefined);

  const loggedIn = !!account && !!megalodon;

  const logout = () => {
    setMegalodon(undefined);
    setAccount(undefined);
  };

  const loginProps: LoginProps = {
    loggedIn,
    logout,
    submit: async (enteredUrl: string, enteredToken: string) => {
      enteredUrl = removeTrailingSlashes(enteredUrl);
      const res = await verify(enteredUrl, enteredToken);
      if (res) {
        setMegalodon(res.megalodon);
        setAccount(res.account);
        console.log(res);
      }
    },
  };
  return (
    <div>
      <h1>Yoyogi</h1>
      <Login {...loginProps} />
      {account && megalodon && (
        <ShowAuthor account={account} megalodon={megalodon} />
      )}
    </div>
  );
}
