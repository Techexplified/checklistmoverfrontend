# Checklist Mover – Trello Power-Up 🚀

A high-fidelity Trello Power-Up that lets you seamlessly move or copy checklist items between cards within your Trello boards.

---

## 📸 Implemented Screens & Features (Matching Design Spec)

1. **Card View with Power-Up Integration (Image 1)**:
   - "Website Redesign – Tasks" card with full checklist "Development Tasks (5/5)".
   - Dedicated `[ ⇄ Checklist Mover ]` button under Power-Ups sidebar.
2. **Step 1: Select Items (Image 2)**:
   - Source card badge & board info pill.
   - Checklist dropdown selector.
   - Interactive checkbox list with "Select All" toggle, active item counter, and blue row selection styling.
3. **Step 2: Destination & Action Choice (Images 3 & 4)**:
   - Destination card dropdown selector (Same Board).
   - "Existing Checklist" or "Create New Checklist" options.
   - Action picker cards: **Move** (transfer & remove from source) vs **Copy** (duplicate & keep in source).
4. **Step 3: Review & Confirm (Images 5 & 6)**:
   - Action badge, Source & Destination card paths, and items bullet list.
   - Amber warning banner for **Move** operations.
   - Blue informational banner for **Copy** operations.
5. **Step 4: Animated Processing Screen (Images 7 & 8)**:
   - Dual-document card graphic with center transfer icon.
   - Smooth progress bar with live 3-stage status updates (Creating items → Removing items / Finalizing → Finishing up).
6. **Step 5: Move/Copy Completed Celebration (Image 9)**:
   - Celebration checkmark with radiant burst effect.
   - Transfer summary with green checkmark confirmation.
   - "View Destination Card ↗" shortcut and "Done" button.
7. **Destination Card View (Image 10)**:
   - "Sprint Planning – Week 1" destination card view.
   - Updated checklist count & progress indicator.
   - Prominent `[ ⇄ Moved ]` badge on newly transferred items.

---

## 🛠️ How to Run Locally

```bash
cd checklistmover
npm run dev
```

Open the printed URL (e.g. `http://localhost:5173`) in your browser to experience the full interactive Trello card & board interface, trigger Checklist Mover, and test Move and Copy operations.

---

## ⚡ How to Add to Real Trello as a Power-Up

1. **Deploy this project**:
   Deploy the `checklistmover` project to any static hosting provider (e.g. Vercel, Netlify, GitHub Pages, or Cloudflare Pages).
2. **Register Power-Up on Trello**:
   - Go to [https://trello.com/power-ups/admin](https://trello.com/power-ups/admin)
   - Click **New Power-Up**
   - Name: `Checklist Mover`
   - Iframe connector URL: `https://<YOUR_DEPLOYED_URL>/connector.html`
   - Capability: Enable `Card buttons`
3. **Enable on your Board**:
   - In any Trello board, click **Power-Ups** → **Custom** → Enable **Checklist Mover**.
   - Open any card, and you will see the `[ ⇄ Checklist Mover ]` button in the sidebar ready to use!
