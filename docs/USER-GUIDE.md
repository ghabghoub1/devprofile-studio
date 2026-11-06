# DevProfile Studio — User Guide

> Step-by-step instructions for creating a GitHub profile README with DevProfile Studio (v0.4.3).

## 1. Start DevProfile Studio

Open the deployed application, or run it locally using the [Developer Guide](DEVELOPER-GUIDE.md). Your edits take place in the profile editor.

## 2. Connect your GitHub profile (optional)

1. Find **GitHub Connect** in the editor.
2. Enter your public GitHub username and fetch the profile.
3. Review the retrieved public account information.
4. In **Smart Import**, select the fields you want to import.
5. Compare the current and incoming values, then confirm the import.

**Important:** Connecting does not automatically overwrite every editor field. Review the selection before importing. GitHub Connect uses public profile information; it does not require granting repository write access.

## 3. Edit your profile

Use the **Content** tab to update your profile details, introduction, skills, social links, and featured projects. Use section visibility and ordering controls to decide what appears in the generated README.

### Add featured projects

Enter **one project per line**. Descriptions are optional:

```text
DevProfile Studio | Open-source GitHub README builder
Task Manager API | REST API built with Spring Boot
Portfolio Website
```

**Format:** `Project Name | Optional description`

- `Portfolio Website` displays **only the project name**.
- `DevProfile Studio | Open-source GitHub README builder` displays the **name and description**.
- The `|` character separates the name from the description; everything after the first `|` is treated as description text.
- An empty Projects field should not display a Featured Projects section.
- The preview should **never** show “Add a project description” as real project content.

## 4. Customize the design

- **Appearance:** Adjust the available visual options.
- **Templates:** Choose a starting layout or style.
- **Banner:** Set a banner image URL or upload an image using the available editor controls.

Check the preview after each change.

## 5. Preview your profile

Switch between the available preview modes:

- **README Only:** Focus on the generated README content.
- **GitHub Layout:** See the README in a GitHub-inspired profile layout with public account details, where available.

Empty sections should be hidden rather than displayed as unfinished placeholders.

## 6. Export the README

Use the app's **README** export to obtain the generated Markdown, or the **ZIP** export if you want a bundled output. Review the exported files before publishing.

## 7. Publish to your GitHub profile

1. On GitHub, create a **public repository with exactly the same name as your GitHub username**, if you do not already have one.
2. Ensure that repository contains a `README.md` file at its root.
3. Replace or update that file with the Markdown exported from DevProfile Studio.
4. Commit the changes.
5. Visit your GitHub profile to verify the result.

> GitHub's special profile README feature depends on the username-matching repository being public and containing a root `README.md`.

## 8. Manage your editor data

Use the editor's **⋯** menu for **Clear Profile** or **Reset to Example**. The application saves profile editor data locally in your browser, so treat browser storage as convenient working state—not as your only backup. Export a README before clearing data or switching browsers.

## Troubleshooting

| Problem | What to check |
| --- | --- |
| GitHub profile not found | Confirm the public username and network access. |
| Import changed unexpected fields | Review selected Smart Import fields before confirming; restore manually if needed. |
| A project description is missing | Use `Project Name | Description` on the same line. |
| Empty sections are not visible | Add content and confirm the section is enabled. |
| README does not appear on GitHub profile | Check repository name, public visibility, and root `README.md`. |
| Edits disappeared | Check whether browser data was cleared; restore from a previous export. |

## Related documentation

- [Developer Guide](DEVELOPER-GUIDE.md)
