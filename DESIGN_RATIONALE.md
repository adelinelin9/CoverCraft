# CoverCraft — Design Rationale

This document explains the intentional UX decisions made in CoverCraft and identifies where
findings from our CS 356 user study should be cited. Each section names the specific UI element,
describes the design decision, and marks where study evidence belongs.

---

## 1. Stepped wizard with a persistent progress bar

**What we built:** Four clearly named steps (Your Details → Experience Matches → Personalize →
Your Cover Letter) with a fixed progress indicator at the top of every screen. Completed steps
are clickable and act as back-links.

**Design rationale:** Breaking the task into four discrete steps reduces cognitive load compared
to a single long form. The named steps set expectations about what comes next, so users are
never surprised.

The clickable back-navigation on completed steps lets users revisit and revise earlier input
without losing their progress — important when users realize mid-questionnaire that they want
to change which experiences they selected.

> **[INSERT STUDY FINDING]** — e.g., did participants in your study express confusion about
> how many steps remained, or abandon the flow because going back felt risky? Cite here.

---

## 2. AI presents options; user selects

**What we built:** Step 2 (Experience Matches) shows the AI's analysis as selectable cards,
all selected by default. Users can deselect experiences they don't want emphasized. AI never
silently decides what to include — the user confirms.

**Design rationale:** This positions AI as a collaborator rather than an authority. Users who
feel in control of AI suggestions are more likely to trust the final output.

Defaulting to all selected reduces friction for users who want to accept all recommendations,
while still making deselection trivially easy.

> **[INSERT STUDY FINDING]** — e.g., did participants in your study express distrust of
> AI-generated content, or did they want more control over what gets included? Cite here.

---

## 3. Selection count badge on Experience Matches

**What we built:** A "X of Y selected" badge updates live as users toggle cards.

**Design rationale:** Provides immediate feedback about the current state without requiring
users to count manually. The badge also signals that selection is optional — not all cards
need to be chosen.

> **[INSERT STUDY FINDING]** — e.g., did participants miss that they could deselect items,
> or were they unsure whether they had selected enough? Cite here.

---

## 4. Selected experiences summary in the questionnaire

**What we built:** A collapsible panel at the top of Step 3 shows which experiences AI will
highlight, with the panel open by default.

**Design rationale:** When users arrive at the questionnaire, they may not remember which
experiences they selected two steps earlier. Showing this context helps them write answers
that complement (rather than repeat) what AI already knows. The panel is collapsible to avoid
competing with the form fields once users no longer need it.

> **[INSERT STUDY FINDING]** — e.g., did participants write questionnaire answers that
> contradicted their selected experiences, suggesting they had forgotten them? Cite here.

---

## 5. Conversational questionnaire framing

**What we built:** Three short questions with sub-labels explaining what kind of answer is
useful. The tone is first-person and direct ("What interests you most…" rather than
"Describe your motivation…").

**Design rationale:** Formal prompt language can cause users to write stiff, corporate
answers that make the final letter feel generic. Conversational framing encourages natural
language, which translates better into an authentic cover letter voice.

> **[INSERT STUDY FINDING]** — e.g., did participants produce more personal or specific
> answers when prompted conversationally versus formally? Cite here.

---

## 6. Editable cover letter with explicit "Edited" indicator

**What we built:** Step 4 displays the letter in a plain textarea. A small "Edited" label
appears in the document header as soon as the user modifies the text.

**Design rationale:** Letting users edit directly removes the "AI hands you something finished"
feeling and makes the user the author. The "Edited" indicator confirms that their changes have
been registered, and it triggers a confirmation prompt if they try to regenerate — preventing
accidental loss of their edits.

> **[INSERT STUDY FINDING]** — e.g., did participants feel the AI-generated letter was
> "theirs," or did they hesitate to edit it? Did they accidentally overwrite edits? Cite here.

---

## 7. Collapsible AI suggestions panel

**What we built:** The 2–3 improvement suggestions from AI appear below the letter in a
collapsible panel (open by default).

**Design rationale:** Suggestions are useful for a first read but become visual clutter once
a user has decided on their edits. Making the panel collapsible lets users focus on the letter
itself without removing the suggestions entirely.

> **[INSERT STUDY FINDING]** — e.g., did participants notice or use the suggestions, or did
> they scroll past them? Cite here.

---

## 8. Regenerate with edit-protection warning

**What we built:** Clicking "Regenerate" when the letter has been edited shows a confirmation
dialog before overwriting.

**Design rationale:** Regenerating silently would destroy user work without warning.
The confirmation is minimal (two buttons, no modal overlay) so it does not feel obstructive
when the user genuinely wants to regenerate from a clean state.

> **[INSERT STUDY FINDING]** — e.g., did participants accidentally trigger regeneration and
> lose edits during your study? Cite here.

---

## 9. Character count feedback on inputs

**What we built:** Step 1 shows a live character count next to each textarea label. It
displays "N more characters needed" until the minimum is met, then switches to a neutral
"N characters" display.

**Design rationale:** Validation errors that only appear on submit are frustrating. Inline
feedback helps users know in real time whether their pasted content is enough for meaningful
AI analysis, without blocking their typing.

> **[INSERT STUDY FINDING]** — e.g., did participants submit short or partial resumes that
> produced poor results, suggesting they needed earlier guidance? Cite here.

---

## 10. Demo mode with explicit labeling

**What we built:** A complete demo path using a fictional resume and job description,
accessible from the homepage and from the input step. All demo output is marked with an
amber "Demo mode — sample results" badge.

**Design rationale:** Lowering the barrier to exploring the app increases the chance that
users engage with the full flow before committing their own data. The explicit badge prevents
users from mistaking sample output for their own AI analysis.

> **[INSERT STUDY FINDING]** — e.g., did participants want to try the app before entering
> their personal information? Cite here.

---

## 11. Off-white background and muted purple accent

**What we built:** `#FAF9F7` background (warm off-white), purple-500 as the primary action
color, with purple-50/100 for containers and surfaces.

**Design rationale:** Pure white can feel clinical and high-contrast for a document-creation
tool. The warm off-white creates a calmer writing environment. Purple is associated with
creativity and is distinct from the blues used in most job-application platforms, reinforcing
CoverCraft's identity as a writing assistant rather than a job board.

> **[INSERT STUDY FINDING]** — e.g., did participants comment on the visual tone, or did
> aesthetic trust affect their willingness to submit personal information? Cite here.

---

*Last updated: 2026-11-11 — placeholders to be filled with study findings before final submission.*
