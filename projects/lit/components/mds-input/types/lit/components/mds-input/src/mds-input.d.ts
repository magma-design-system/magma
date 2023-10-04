import { AutocompleteType } from '@stencil-type/autocomplete';
import { InputTextType } from '@stencil-type/input-text-type';
import { InputValueType } from '@stencil-type/input-value-type';
import { ThemeStatusVariantType } from '@stencil-type/variant';
import { LitElement } from 'lit';
export declare class MdsInput extends LitElement {
    static formAssociated: boolean;
    static styles: import("lit").CSSResult[];
    private internals;
    /**
     * Specifies whether the element should have autocomplete enabled
     */
    readonly autocomplete?: AutocompleteType;
    /**
     * Specifies that the element should automatically get focus when the page loads
     */
    readonly autofocus: boolean;
    /**
     * A list of search terms to be searched from the input field,
     * it should be used with type="search" input.
     */
    readonly datalist?: string | string[];
    /**
     * If true, the element is displayed as disabled
     */
    readonly disabled?: boolean;
    /**
     * An icon displayed at the right of the input
     */
    readonly icon?: string;
    /**
     * Specifies the maximum value
     * use it with input type="number" or type="date"
     * Example: max="180", max="2046-12-04"
     */
    readonly max?: number;
    /**
     * Specifies the maximum number of characters allowed in an element
     * use it with input type="number"
     */
    readonly maxlength?: number;
    /**
     * Specifies the minimum value
     * use it with input type="number" or type="date"
     * Example: min="-3", min="1988-04-15"
     */
    readonly min?: number;
    /**
     * Specifies the minimum number of characters allowed in an element
     * use it with input type="number"
     */
    readonly minlength?: number;
    /**
     * Is needed to reference the form data after the form is submitted
     */
    readonly name?: string;
    /**
     * Specifies a regular expression that element\'s value is checked against
     */
    readonly pattern?: string;
    /**
     * Specifies a short hint that describes the expected value of the element
     */
    readonly placeholder?: string;
    /**
     * Specifies that the element is read-only
     */
    readonly readonly?: boolean;
    /**
     * Specifies that the element must be filled out before submitting the form
     */
    readonly required?: boolean;
    /**
     * Sets the variant of the input field
     */
    readonly variant?: ThemeStatusVariantType;
    /**
     * Sets the word(s) of the tip of the input field
     */
    readonly tip?: string;
    /**
     * Specifies the interval between legal numbers in an input field
     */
    readonly step?: number;
    /**
     * Specifies the type of input element
     */
    readonly type?: InputTextType;
    /**
     * Specifies the value of the input element
     */
    value: InputValueType;
    private tabindex?;
    inputElement: HTMLInputElement | HTMLTextAreaElement | undefined;
    constructor();
    firstUpdated(): void;
    connectedCallback(): void;
    private getValue;
    private onInput;
    private handleValidation;
    private onBlur;
    private onFocus;
    private buildInput;
    private buildDatalist;
    get validity(): ValidityState;
    get validationMessage(): string;
    get willValidate(): boolean;
    checkValidity(): boolean;
    reportValidity(): boolean;
    formResetCallback(): void;
    render(): import("lit").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'mds-input': MdsInput;
    }
}
