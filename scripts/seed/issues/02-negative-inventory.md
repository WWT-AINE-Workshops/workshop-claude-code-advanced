title: Inventory can go negative when two approvals overlap
labels: bug,api,workshop
---

On 22 September we had one HD Webcam (CAM-HD) in stock and two pending requests for it. Ben approved both within a second of each other, and both approvals succeeded. The catalog now shows **-1** in stock.

**Expected:** the second approval fails with 409 because the stock has run out, and stock never drops below zero.

**To reproduce:** the two pending CAM-HD requests in the demo data (requests 1 and 2) can be approved at the same time as Ben Okafor (user 2).

**Done when** a test that approves both at once shows one success and one 409, and stock ends at 0.
