import { AutocompleteType } from '@stencil-type/autocomplete';
import { InputTextType } from '@stencil-type/input-text-type';
import { ThemeStatusVariantType } from '@stencil-type/variant';
import '../../dist/mds-input';
declare const _default: {
    title: string;
    argTypes: {
        autocomplete: {
            label: string;
            options: string[];
            control: {
                type: string;
            };
        };
        autofocus: {
            type: {
                name: string;
            };
            label: string;
        };
        datalist: {
            type: {
                name: string;
            };
            label: string;
        };
        disabled: {
            type: {
                name: string;
            };
            label: string;
        };
        icon: {
            control: {
                type: string;
            };
            label: string;
            options: string[];
            type: {
                name: string;
            };
        };
        max: {
            type: {
                name: string;
            };
            label: string;
        };
        maxLength: {
            type: {
                name: string;
            };
            label: string;
        };
        min: {
            type: {
                name: string;
            };
            label: string;
        };
        minLength: {
            type: {
                name: string;
            };
            label: string;
        };
        name: {
            type: {
                name: string;
            };
            label: string;
        };
        pattern: {
            type: {
                name: string;
            };
            label: string;
        };
        placeholder: {
            type: {
                name: string;
            };
            label: string;
        };
        readOnly: {
            type: {
                name: string;
            };
            label: string;
        };
        required: {
            type: {
                name: string;
            };
            label: string;
        };
        step: {
            type: {
                name: string;
            };
            label: string;
        };
        tabindex: {
            type: {
                name: string;
            };
            label: string;
        };
        tip: {
            type: {
                name: string;
            };
            label: string;
        };
        type: {
            type: {
                name: string;
                required: boolean;
            };
            label: string;
            options: string[];
            control: {
                type: string;
            };
        };
        variant: {
            type: {
                name: string;
            };
            options: string[];
            control: {
                type: string;
            };
            label: string;
        };
        value: {
            type: {
                name: string;
            };
            label: string;
        };
    };
};
export default _default;
interface MdsInputArgs {
    placeholder?: string;
    type: InputTextType;
    required?: boolean;
    autocomplete?: AutocompleteType;
    autofocus?: boolean;
    datalist?: string[];
    disabled?: boolean;
    icon?: string;
    max?: number;
    maxLength?: number;
    min?: number;
    minLength?: number;
    name?: string;
    pattern?: string;
    readOnly?: boolean;
    step?: string;
    variant?: ThemeStatusVariantType;
    tip?: string;
    value?: string;
    tabindex?: number;
}
export declare const Default: (args: MdsInputArgs) => import("lit-html").TemplateResult<1>;
