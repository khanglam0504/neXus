
---

## 6. Handover to Robert (Action Items)

**Status:** Phase 1 is partially done (Infrastructure Setup).

**Your Mission:**
1.  **Generate Components:** Run `npx convex dev` to generate the component API in `_generated/`. You might see type errors in `convex/jason.ts` until this is done.
2.  **Verify Schema:** Ensure the new component tables (managed by `@convex-dev/agent`) do not conflict with our existing tables.
3.  **Implement `convex/jason.ts`:**
    - I've created the skeleton.
    - Add tools! We need a tool to search our existing `tasks` table so Jason knows what's going on.
4.  **Connect Frontend:**
    - Create a test page `app/test-agent/page.tsx`.
    - Try to chat with Jason using the `useQuery(api.jason.chat, ...)` or the agent client hook.
    
**Good luck, Robert! Make me proud.** 🚀
