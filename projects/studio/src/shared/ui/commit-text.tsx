import { Field, TextInput } from '../magma/magma.js';

/**
 * A labelled text field whose value is handed over when the person commits it, on Enter or on
 * leaving it (TextInput, commit "leave"): a name handed over at every key would meet the name of
 * another colour halfway and select it, and the export groups would lose the comma just typed.
 */
export function CommitText({
  label,
  value,
  onCommit,
  placeholder,
  message,
  disabled,
}: {
  label: string;
  value: string;
  onCommit: (value: string) => void;
  placeholder?: string;
  message?: string;
  disabled?: boolean;
}) {
  return (
    <Field label={label} message={message}>
      <TextInput
        commit="leave"
        value={value}
        onValue={onCommit}
        placeholder={placeholder}
        disabled={disabled}
      />
    </Field>
  );
}
