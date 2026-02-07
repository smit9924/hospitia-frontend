## Typography

The application **self-hosts its primary UI font** instead of loading it from Google Fonts at runtime.

### Font Files
- The **Roboto** font files are downloaded from Google Fonts.
- They are stored locally under: `src/assets/fonts/Roboto`
- This approach avoids external runtime dependencies and improves performance, reliability, and control over font loading.

---

### Font Registration
- Global `@font-face` rules are defined in: `src/styles/_fonts.scss`
- These rules register the local font files as web fonts for use throughout the application.

---

### Generic Font Family Naming

All `@font-face` declarations use a **generic, semantic font-family name**: `FontFamilyUI`, instead of referencing the physical font name (for e.g. `Roboto`) directly.

#### Why this matters
- **Future-proofing**: If the UI font changes in the future, only the `src` URLs in the `@font-face` declarations need to be updated.
- **Zero refactors**: No changes are required in CSS, Angular Material typography configuration, or component styles.
- **Single source of truth**: All typography (including Angular Material M3 theming) references `FontFamilyUI`.

This ensures that the application’s typography remains consistent and maintainable over time.




