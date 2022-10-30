(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[521],{9212:function(e,t,o){(window.__NEXT_P=window.__NEXT_P||[]).push(["/about",function(){return o(1473)}])},1473:function(e,t,o){"use strict";o.r(t),o.d(t,{default:function(){return u}});var i=o(5893),s=o(9008),n=o.n(s),r=o(1664),a=o.n(r),l=o(9384),h=o.n(l);let d="/yoyogi";function c(e){let{text:t,slug:o}=e;return(0,i.jsxs)("h2",{id:o,className:h().slugged,children:[t," ",(0,i.jsx)(a(),{href:"#"+o,children:"#"})]})}function u(){return(0,i.jsxs)("div",{children:[(0,i.jsxs)(n(),{children:[(0,i.jsx)("title",{children:"About Yoyogi"}),(0,i.jsx)("meta",{name:"description",content:"About Yoyogi (the Mastodon reader for folks who hate The Timeline)"}),(0,i.jsx)("link",{rel:"icon",href:"data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>\uD83D\uDE82</text></svg>"})]}),(0,i.jsxs)("main",{className:h().about,children:[(0,i.jsxs)("h1",{children:["About"," ",(0,i.jsx)(a(),{href:"/",as:d+"/",children:"Yoyogi"})]}),(0,i.jsxs)("section",{children:[(0,i.jsx)(c,{slug:"heres-my-burning-secret",text:"Here’s my burning secret."}),(0,i.jsx)("p",{style:{fontSize:"x-large"},children:"I hate the timeline."}),(0,i.jsxs)("p",{children:["I ",(0,i.jsx)("em",{children:"love"})," following tons of people, and getting windows into their lives, and sometimes being invited to step into the door."]}),(0,i.jsxs)("p",{children:["But stuffing every one of those follows’ posts into a single vertical timeline is awful. There are folks I love keeping up with but for whom I"," ",(0,i.jsx)("em",{children:(0,i.jsx)("strong",{children:"have"})})," ","to be in the right headspace before I do."]}),(0,i.jsxs)("p",{children:["For years, I just maintained a bunch of bookmarks in my browser and visited individuals’ social media to catch up with them on my timeline. It was great! But then (a) ",(0,i.jsx)("em",{children:"November 2022"})," and (b)"," ",(0,i.jsx)("em",{children:"Mastodon"})," happened and I found a ton of fascinating people I wanted to keep up with (and interact with!) on the Fediverse. The old problem returned: the evil timeline."]}),(0,i.jsx)("p",{style:{fontSize:"x-large"},children:"Yoyogi is my attempt at a better reading experience."}),(0,i.jsxs)("p",{children:["It very consciously breaks from the timeline, and instead elevates"," ",(0,i.jsx)("strong",{children:"the author"})," and centers ",(0,i.jsx)("strong",{children:"the thread"}),"."]}),(0,i.jsxs)("p",{children:["You log in to your Fediverse",(0,i.jsx)("sup",{children:"†"})," server. You pick"," ",(0,i.jsx)("em",{children:"one"})," account you’re following. You see just their threads."]}),(0,i.jsxs)("blockquote",{children:["† Mastodon right now. Pleroma and Misskey are coming soon."," ",(0,i.jsx)("a",{href:"https://github.com/fasiha/yoyogi/issues",children:"Holler"})," if you’re interested."]})]}),(0,i.jsxs)("section",{children:[(0,i.jsx)(c,{slug:"links",text:"Links"}),(0,i.jsxs)("p",{children:[(0,i.jsx)(a(),{href:"/",as:d+"/",children:"Try it"}),"! Star it or leave a bug report on"," ",(0,i.jsx)("a",{href:"https://github.com/fasiha/yoyogi",children:"GitHub"}),"!"]}),(0,i.jsxs)("p",{children:["Many thanks to"," ",(0,i.jsx)("a",{href:"https://toot.cafe/@qm3jp",children:"@qm3jp@toot.cafe"})," for invaluable advie and feedback during the design and testing phase!"]})]}),(0,i.jsxs)("section",{children:[(0,i.jsx)(c,{slug:"how-it-works",text:"How it works"}),(0,i.jsxs)("p",{children:["So right now Yoyogi runs all its code in your browser (like"," ",(0,i.jsx)("a",{href:"https://pinafore.social/",children:"Pinafore"}),"). There is no “Yoyogi server”: rather your browser talks to your Fediverse server—and I never see any of your data. But you do have to get your Fediverse server to talk to your browser, so there’s still the concept of logging in:"]}),(0,i.jsxs)("ol",{children:[(0,i.jsxs)("li",{children:["Type in the URL of your server, e.g.,"," ",(0,i.jsx)("code",{children:"https://octodon.social"})," and click “Submit”."]}),(0,i.jsx)("li",{children:"Yoyogi sends you to that server, which after ascertaining you’re logged in, will ask you, “Hey, this Yoyogi thing wants to have permission to read what you can read (no writing/changing), that ok?”"}),(0,i.jsx)("li",{children:"Assuming you trust me, you say “Authorize”."}),(0,i.jsx)("li",{children:"Mastodon sends you back to Yoyogi and you can get started!"})]}),(0,i.jsx)("p",{})]}),(0,i.jsxs)("section",{children:[(0,i.jsx)(c,{slug:"anticipated-questions",text:"Anticipated questions"}),(0,i.jsxs)("p",{children:[(0,i.jsx)("strong",{children:"Why does it look so terrible?"})," Yoyogi is just barely in the MVP (minimum viable product) stage. I don’t know if it’s"," ",(0,i.jsx)("a",{href:"https://blog.asmartbear.com/slc.html",children:"SLC"})," (simple, lovable, complete) yet."]}),(0,i.jsxs)("p",{children:[(0,i.jsx)("strong",{children:"Why is it so slow?"})," Largely due to my not hiding network latency better—we could definitely be showing you toots and threads faster, and showing a spinner when we have nothing. But in some way, this usage pattern is not well-supported by the Mastodon server API at least, which expects you to read a few toots at a time"," ",(0,i.jsx)("em",{children:"in temporal order"}),", rather than whole threads at a time. What Yoyogi does is, it takes a chunk of temporally-contiguous toots (one network call) and builds the thread around each (one network call ",(0,i.jsx)("em",{children:"per"})," toot), dramatically increasing the work done. There are various technical solutions to this (caching, smarter database/API layer), which is partly why I haven’t even tried reaching for the low-hanging fruit (that’s a lie, mostly it’s because I’m lazy)."]}),(0,i.jsx)("p",{children:"Also note that we’re not saving any toots locally in your browser yet. That would make it much faster when you keep up with an author regularly (not much to fetch from the server), but wouldn’t help much if you’re at all like me and sometimes days go by without checking in with some folks."}),(0,i.jsxs)("p",{children:[(0,i.jsx)("strong",{children:"Why is it lacking <important feature>?"})," See above."]}),(0,i.jsxs)("p",{children:[(0,i.jsx)("strong",{children:"What features are next?"})," Great question."]}),(0,i.jsxs)("ol",{children:[(0,i.jsx)("li",{children:"Desperately show media: avatars, images. videos."}),(0,i.jsx)("li",{children:"My mental image for Yoyogi is frankly Google Reader. I’d love it if it kept track of how many unread toots I have from each of my follows."}),(0,i.jsx)("li",{children:"Of course I need to add media (images and video)."}),(0,i.jsx)("li",{children:"Toggle boosts."})]}),(0,i.jsxs)("p",{children:[(0,i.jsxs)("strong",{children:["Will it ever have a mode to ",(0,i.jsx)("em",{children:"write"})," posts?"]})," ","No I don’t think so. Posting for me is a totally different mental activity than reading/catching up. It’s in fact ",(0,i.jsx)("em",{children:"two"})," mental activities:"]}),(0,i.jsxs)("ol",{children:[(0,i.jsx)("li",{children:"quick conversations—the timeline is actually great for this, so I’d switch back to a “normal” Mastodon or Misskey or Pleroma or Pinafore app; and"}),(0,i.jsx)("li",{children:"Zen-mode composing toots and threads. This I often do in a proper document writing app (my journaling app, a notes app, etc.)."})]})]})]})]})}},9384:function(e){e.exports={about:"about_about__uuuxx",slugged:"about_slugged__k7ViN"}}},function(e){e.O(0,[996,774,888,179],function(){return e(e.s=9212)}),_N_E=e.O()}]);