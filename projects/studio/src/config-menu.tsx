/*
  The Config menu of the bar (shell.tsx): what brings a configuration into the studio and what
  takes it out, from any section (vittorio, 2026-11-09). The actions are the App's (app.tsx),
  which holds the configuration and asks through the contrast gate before anything leaves; the bar
  only draws them, in its dropdown and in the menu of a narrow window. Each says beside its label
  the format of what it reads or hands over, a badge the click goes through.
*/

/** An action of the Config menu: what it is called, what it reads or hands over, what it runs. */
export interface ConfigAction {
  id: string;
  label: string;
  icon: string;
  /** The format of what the action reads or hands over: the badge beside its label. */
  format?: string;
  /** A separator before it: the actions that take the configuration out, after those that bring it in. */
  apart?: boolean;
  /** The menu stays open after it, so the person sees what it did (Copy JSON says Copied!). */
  keepOpen?: boolean;
  run: () => void;
}

/** The actions, a button each, its format in a badge over its end. */
export function ConfigItems({
  actions,
  onRun,
}: {
  actions: ConfigAction[];
  /** After an action ran, with it: the bar closes its menu, unless the action keeps it open. */
  onRun?: (action: ConfigAction) => void;
}) {
  return (
    <>
      {actions.map((action) => (
        <>
          {action.apart && <mds-separator></mds-separator>}
          <div class="studio-config-item">
            <mds-button
              type="button"
              variant="dark"
              tone="text"
              icon={action.icon}
              class="studio-menu-link"
              label={action.label}
              aria-label={action.format ? `${action.label}, ${action.format}` : undefined}
              data-action={action.id}
              onClick={() => {
                action.run();
                onRun?.(action);
              }}
            ></mds-button>
            {action.format && (
              <mds-badge variant="dark" label={action.format} aria-hidden="true"></mds-badge>
            )}
          </div>
        </>
      ))}
    </>
  );
}
