import type { JSX as LocalJSX } from '@stencil/core'
import { DetailedHTMLProps, HTMLAttributes } from 'react'

type StencilProps<T> = {
    [P in keyof T]?: Omit<T[P], 'ref'> | HTMLAttributes<T>
}

type ReactProps<T> = {
    [P in keyof T]?: DetailedHTMLProps<HTMLAttributes<T[P]>, T[P]>
}

type StencilToReact<
    T = LocalJSX.IntrinsicElements,
    U = HTMLElementTagNameMap
> = StencilProps<T> & ReactProps<U>

declare module 'react' {
    namespace JSX {
        type IntrinsicElements = StencilToReact
    }
}
