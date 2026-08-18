'use client'

import { FieldError, TextInput, useField } from '@payloadcms/ui'
import type { TextFieldClientProps, Validate } from 'payload'
import type { ChangeEvent, CSSProperties, ReactNode } from 'react'
import { useCallback, useState } from 'react'

import { validatePostalCode, validateVenueWebsite } from '@/modules/events/validation'

type ValidationKind = 'postalCode' | 'venueWebsite'
type ClientValidator = (value: unknown) => true | string

const validators: Record<ValidationKind, ClientValidator> = {
  postalCode: validatePostalCode,
  venueWebsite: validateVenueWebsite,
}

export function BlurValidatedTextInput({
  children,
  properties,
  validateValue,
}: {
  children?: ReactNode
  properties: TextFieldClientProps
  validateValue: ClientValidator
}) {
  const { field, inputRef, onKeyDown, path: pathFromProperties, readOnly, validate } = properties
  const { admin, label, localized, maxLength, minLength, required } = field
  const memoizedValidate = useCallback<NonNullable<TextFieldClientProps['validate']>>(
    (value, options) =>
      validate?.(value, { ...options, maxLength, minLength, required }) ?? validateValue(value),
    [maxLength, minLength, required, validate, validateValue],
  )
  const {
    customComponents: { AfterInput, BeforeInput, Description, Error, Label } = {},
    disabled,
    errorMessage: formErrorMessage,
    path,
    setValue,
    showError,
    value,
  } = useField<unknown>({
    potentiallyStalePath: pathFromProperties,
    validate: memoizedValidate as Validate,
  })
  const [hasBlurred, setHasBlurred] = useState(false)
  const validationResult = validateValue(value)
  const blurErrorMessage = validationResult === true ? null : validationResult
  const showBlurError = hasBlurred && Boolean(blurErrorMessage)
  const showVisibleError = showError || showBlurError
  const fieldStyle = {
    ...(admin?.style ?? {}),
    ...(admin?.width ? { '--field-width': admin.width } : { flex: '1 1 auto' }),
  } as CSSProperties
  const htmlAttributes = {
    autoComplete: admin?.autoComplete || undefined,
    onBlur: () => setHasBlurred(true),
  }

  return (
    <>
      <TextInput
        AfterInput={AfterInput}
        BeforeInput={BeforeInput}
        className={admin?.className}
        Description={Description}
        description={admin?.description}
        Error={
          Error ?? (
            <FieldError
              message={showBlurError ? (blurErrorMessage ?? undefined) : formErrorMessage}
              path={path}
              showError={showVisibleError}
            />
          )
        }
        htmlAttributes={htmlAttributes}
        inputRef={inputRef}
        Label={Label}
        label={label}
        localized={localized}
        onChange={(event: ChangeEvent<HTMLInputElement>) => setValue(event.target.value)}
        onKeyDown={onKeyDown}
        path={path}
        placeholder={admin?.placeholder}
        readOnly={readOnly || disabled}
        required={required}
        showError={showVisibleError}
        style={fieldStyle}
        value={typeof value === 'string' ? value : ''}
      />
      {children}
    </>
  )
}

export function BlurValidatedTextField(properties: TextFieldClientProps) {
  const validationKind = properties.field.admin?.custom?.validationKind as
    ValidationKind | undefined
  const validateValue = validationKind ? validators[validationKind] : () => true as const

  return <BlurValidatedTextInput properties={properties} validateValue={validateValue} />
}
