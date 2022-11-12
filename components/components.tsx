import generator, { Entity, MegalodonInterface } from "megalodon";
import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "../styles/components.module.css";
import { FollowsList } from "./FollowsList";
import { ShowAuthor } from "./ShowAuthor";
import { useRouter } from "next/router";

const LINK_PREFIX = process.env.NEXT_PUBLIC_ASSET_PREFIX || "";
const LOCALSTORAGE_REG_KEY = "yoyogi-registration";
interface LoginProps {
  initialUrl: string;
  loggedIn: boolean;
  submit: (url: string) => void;
  switchServer: () => void;
}

function Login({ initialUrl, loggedIn, submit, switchServer }: LoginProps) {
  const [url, setUrl] = useState(initialUrl);
  const [urls, setUrls] = useState<string[]>([]);

  useEffect(() => {
    if (!url) {
      setUrls(getYoyogiUrls());
    }
  }, [url]);
  useEffect(() => {
    setUrl(initialUrl);
  }, [initialUrl]);

  return (
    <div className={styles["login-box"]}>
      {loggedIn ? (
        <>
          Logged into {url}.{" "}
          <button
            onClick={() => {
              switchServer();
              setUrl("");
            }}
          >
            Log out
          </button>{" "}
        </>
      ) : (
        <>
          {urls.length ? (
            <label htmlFor="server-select">
              Log in again?{" "}
              <select
                id="server-select"
                onChange={(e) => {
                  setUrl(e.target.value);
                  submit(e.target.value);
                }}
              >
                <option value="" key="">
                  --Pick one of {urls.length} saved servers--
                </option>
                {urls.map((url) => (
                  <option value={url} key={url}>
                    {url}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            ""
          )}
          <form
            style={{ display: "inline" }}
            onSubmit={(e) => {
              submit(url);
              e.preventDefault();
            }}
          >
            <label htmlFor="url-input">
              Enter new Mastodon URL?
              <input
                id="url-input"
                type="url"
                placeholder="https://octodon.social"
                onChange={(e) => setUrl(e.target.value)}
                value={url}
              />
            </label>
          </form>{" "}
          <button onClick={() => submit(url)}>Submit</button>{" "}
          <button
            onClick={() => {
              switchServer();
              setUrl("");
              localStorage.clear();
              setUrls(getYoyogiUrls());
            }}
          >
            Clear local data
          </button>
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
const REDIRECT_URL = () =>
  removeTrailingSlashes(window.location.origin + window.location.pathname);
interface AppRegisterInfo {
  url: string;
  client_id: string;
  client_secret: string;
  authUrl: string; // this is the URL for the user to get their code
  version: number;
}
async function registerApp(
  url: string,
  megalodon: MegalodonInterface
): Promise<AppRegisterInfo> {
  const yoyogiRegistration = await megalodon.registerApp("Yoyogi", {
    scopes: ["read", "push"],
    website: "https://fasiha.github.io/yoyogi",
    redirect_uris: REDIRECT_URL(),
  });
  return {
    url,
    version: 1,
    client_id: yoyogiRegistration.client_id,
    client_secret: yoyogiRegistration.client_secret,
    authUrl: yoyogiRegistration.url || "",
  };
}
async function register1(url: string) {
  const megalodon = generator("mastodon", url);

  const tokenInfo = getUrlToken(url);
  if (tokenInfo) {
    // don't need to register or get token, we have it already
    return verify(url, tokenInfo.token);
  }

  // register app
  const regInfo = await registerApp(url, megalodon);

  if (!regInfo.authUrl) {
    console.error("no URL");
    return;
  }

  localStorage.setItem(LOCALSTORAGE_REG_KEY, JSON.stringify(regInfo));

  window.open(regInfo.authUrl, "_self");
}
async function register2(regInfo: AppRegisterInfo, code: string) {
  const megalodon = generator("mastodon", regInfo.url);
  const token = await megalodon.fetchAccessToken(
    regInfo.client_id,
    regInfo.client_secret,
    code,
    REDIRECT_URL()
  );
  console.log("got token");
  addNewUrlToken(regInfo.url, token.access_token);
  return verify(regInfo.url, token.access_token);
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

async function getFollows(
  megalodon: MegalodonInterface,
  account: Entity.Account
) {
  const follows: Entity.Account[] = [];
  try {
    const followsResponse = await megalodon.getAccountFollowing(account.id, {
      get_all: true,
    });
    follows.push(...followsResponse.data);
  } catch (e) {
    console.error("Network error:", e);
  }
  return follows;
}

export function Yoyogi() {
  const [megalodon, setMegalodon] = useState<MegalodonInterface | undefined>(
    undefined
  );
  const [account, setAccount] = useState<Entity.Account | undefined>(undefined);
  const [follows, setFollows] = useState<Entity.Account[]>([]);
  const [author, setAuthor] = useState<Entity.Account | undefined>(undefined);
  const [initialUrl, setInitialUrl] = useState("");

  const router = useRouter();
  useEffect(() => {
    (async function main() {
      const code = new URL("" + window.location).searchParams.get("code");
      if (code) {
        const raw = localStorage.getItem(LOCALSTORAGE_REG_KEY);
        if (!raw) {
          console.error("received a code in URL but no registration");
          window.location.search = "";
          return;
        }
        try {
          const regInfo: AppRegisterInfo = JSON.parse(raw);
          const res = await register2(regInfo, code);
          if (res) {
            setInitialUrl(regInfo.url);
            setMegalodon(res.megalodon);
            setAccount(res.account);
            setAuthor(res.account);
            setFollows(await getFollows(res.megalodon, res.account));
            localStorage.removeItem(LOCALSTORAGE_REG_KEY);
            router.push("/", undefined, { shallow: true });
            return;
          } else {
            console.error("unable to verify");
          }
        } catch (e) {
          // JSON parse error, registration error
          console.error("registration finalization error", e);
          localStorage.removeItem(LOCALSTORAGE_REG_KEY);
        }
      }
    })();
  }, [router]);

  const loggedIn = !!account && !!megalodon;

  const logout = () => {
    setMegalodon(undefined);
    setAccount(undefined);
  };

  const loginProps: LoginProps = {
    loggedIn,
    initialUrl,
    switchServer: logout,
    submit: async (enteredUrl: string) => {
      enteredUrl = removeTrailingSlashes(enteredUrl);
      const res = await register1(enteredUrl);
      if (res) {
        setMegalodon(res.megalodon);
        setAccount(res.account);
        setAuthor(res.account);
        setFollows(await getFollows(res.megalodon, res.account));
      }
    },
  };
  return (
    <main className={styles["griddy-main"]}>
      <h1>
        Yoyogi{" "}
        <sup>
          <Link href="/about" as={LINK_PREFIX + "/about"}>
            About
          </Link>
        </sup>
      </h1>
      <Login {...loginProps} />
      {account && megalodon && author && (
        <div className={styles["follows-and-threads"]}>
          <FollowsList
            myAccount={account}
            follows={follows}
            authorId={author.id}
            setAuthor={setAuthor}
          />
          <ShowAuthor account={author} megalodon={megalodon} />
        </div>
      )}
    </main>
  );
}

///
export interface YoyogiUrls {
  version: number;
  urls: string[];
}

interface TokenInfo {
  serverUrl: string;
  token: string;
  version: number;
}

function urlToTokenLocalStorageKey(url: string) {
  return "yoyogi-" + url;
}

const YOYOGI_URLS_KEY = "yoyogi-urls";
function getYoyogiUrls(): string[] {
  if (typeof window === "undefined") {
    return [];
  }
  const raw = localStorage.getItem(YOYOGI_URLS_KEY);
  if (!raw) {
    return [];
  }
  try {
    const urlsObj: YoyogiUrls = JSON.parse(raw);
    return urlsObj.urls;
  } catch {
    return [];
  }
}

function addNewUrlToken(url: string, token: string) {
  const urls = getYoyogiUrls();
  const newPayload: YoyogiUrls = {
    version: 1,
    urls: urls.filter((u) => u !== url).concat(url),
  };
  localStorage.setItem(YOYOGI_URLS_KEY, JSON.stringify(newPayload));

  const tokenInfo: TokenInfo = {
    version: 1,
    serverUrl: url,
    token,
  };
  localStorage.setItem(
    urlToTokenLocalStorageKey(url),
    JSON.stringify(tokenInfo)
  );
}

function getUrlToken(url: string) {
  const localStorageKey = urlToTokenLocalStorageKey(url);

  const raw = localStorage.getItem(localStorageKey);
  if (raw) {
    try {
      const tokenInfo: TokenInfo = JSON.parse(raw);
      if (tokenInfo.token) {
        // don't need to register or get token
        return tokenInfo;
      }
    } catch {
      // failed to parse JSON
    }
  } else {
    // nothing in localStorage
  }
  return undefined;
}
