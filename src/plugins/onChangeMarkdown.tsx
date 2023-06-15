import type { Dispatch, SetStateAction } from "react";
import type { EditorState } from "lexical";
import { useMemo } from "react";
import { $convertToMarkdownString } from "@lexical/markdown";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import debounce from "lodash.debounce";

export type OnChangeMarkdownType =
    | Dispatch<SetStateAction<string>>
    | ((value: string) => void);

export default function OnChangeMarkdown({
    onChange,
    transformers,
    __UNSAFE_debounceTime
}: {
    transformers: any;
    onChange: OnChangeMarkdownType;
    __UNSAFE_debounceTime?: number;
}) {
    const OnChangeMarkdown = useMemo(() => {
        return debounce(
            (state: EditorState) => transformState(state, onChange, transformers),
            __UNSAFE_debounceTime ?? 200
        );
    }, [onChange, __UNSAFE_debounceTime]);

    return (
        <OnChangePlugin
            onChange={OnChangeMarkdown}
            ignoreInitialChange
            ignoreSelectionChange
        />
    );
}

function transformState(
    editorState: EditorState,
    onChange: OnChangeMarkdownType,
    transformers: any
) {
    editorState.read(() => {
        const markdown = $convertToMarkdownString(transformers);

        const withBrs = markdown
            // https://github.com/markedjs/marked/issues/190#issuecomment-865303317
            .replace(/\n(?=\n)/g, "\n\n<br>\n")
            .replace(/```html/g, '').replace(/```/g, '')

            // When escape(markdown) with block quotes we end up with the following:
            // '&gt; block quote text'
            // and need to convert it back to the original, so the markdown is respected
            .replace(/^(&gt\;)(?=\s)(?!.*&lt\;)/gm, ">");

        onChange(withBrs);
    });
}
