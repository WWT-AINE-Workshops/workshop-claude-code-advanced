title: Dashboard cards overflow below ~900px
labels: bug,ui,workshop
---

On a laptop with the browser window at half the screen, the dashboard's four summary cards run off the right edge and the page scrolls sideways.

**Expected:** below about 900px wide, the cards wrap into two rows of two, like this mockup (800px wide):

![Dashboard at 800px](https://github.com/{{REPO}}/blob/main/workshop/assets/issue-3-mockup.png?raw=true)

The mockup is also in the repository at `workshop/assets/issue-3-mockup.png`.

**To check:** `npm run dev`, then `npm run screenshot -- /dashboard --width 800` and compare `.screenshots/dashboard-800.png` with the mockup.
