---
# A product layer, in the product's own repository: magma/patterns/message-placement.md.
# An invented product, to show the shape: it extends the Magma pattern by its id.
id: message-placement
extends: magma:message-placement
layer: example-backoffice
narrows:
  success-toast-duration: 8000
  message-wording: see Content
situations:
  - situation: A protocol number is assigned to a filed document
    case: action-done-elsewhere
    note: the toast carries Copy, so it stays (toast-action-stays)
---

# Where a message goes, in Example Backoffice

## Content

- An outcome names the record by its number: "Pratica 2026/0142 salvata."

## Why

The operators of Example Backoffice read slowly between two phone calls: 8 seconds instead of 5.
