'use client'

import {
  FieldDescription,
  FieldError,
  FieldLabel,
  fieldBaseClass,
  RenderCustomComponent,
  useField,
} from '@payloadcms/ui'
import { mergeFieldStyles } from '@payloadcms/ui/shared'
import type { CheckboxFieldClientProps, Validate } from 'payload'
import { useCallback, useId, useMemo } from 'react'

import { defaultBooleanSwitchLabels, type BooleanSwitchLabels } from './boolean-switch-config'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function resolveBooleanSwitchLabels(custom: unknown): BooleanSwitchLabels {
  if (!isRecord(custom) || !isRecord(custom.booleanSwitch)) {
    return defaultBooleanSwitchLabels
  }

  const { falseLabel, trueLabel } = custom.booleanSwitch

  return {
    falseLabel:
      typeof falseLabel === 'string' && falseLabel.trim()
        ? falseLabel
        : defaultBooleanSwitchLabels.falseLabel,
    trueLabel:
      typeof trueLabel === 'string' && trueLabel.trim()
        ? trueLabel
        : defaultBooleanSwitchLabels.trueLabel,
  }
}

export function BooleanSwitchField(properties: CheckboxFieldClientProps) {
  const {
    checked: checkedFromProperties,
    disableFormData,
    field,
    field: { admin: { className, description } = {}, label, localized, required },
    id: idFromProperties,
    onChange,
    path: pathFromProperties,
    readOnly,
    validate,
  } = properties
  const fallbackID = useId()
  const fieldID = idFromProperties ?? fallbackID
  const memoizedValidate = useCallback<NonNullable<CheckboxFieldClientProps['validate']>>(
    (value, options) => (validate ? validate(value, { ...options, required }) : true),
    [required, validate],
  )
  const {
    customComponents: { AfterInput, BeforeInput, Description, Error, Label } = {},
    disabled,
    path,
    setValue,
    showError,
    value,
  } = useField<boolean>({
    disableFormData,
    potentiallyStalePath: pathFromProperties,
    validate: memoizedValidate as Validate,
  })
  const checked = checkedFromProperties ?? Boolean(value)
  const isDisabled = Boolean(readOnly || disabled)
  const labels = resolveBooleanSwitchLabels(field.admin?.custom)
  const stateLabel = checked ? labels.trueLabel : labels.falseLabel
  const styles = useMemo(() => mergeFieldStyles(field), [field])

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.target.checked
      setValue(nextValue)
      onChange?.(nextValue)
    },
    [onChange, setValue],
  )

  return (
    <div
      className={[
        fieldBaseClass,
        'wkf-boolean-switch',
        checked && 'wkf-boolean-switch--checked',
        showError && 'error',
        isDisabled && 'wkf-boolean-switch--read-only',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={styles}
    >
      <RenderCustomComponent
        CustomComponent={Error}
        Fallback={<FieldError path={path} showError={showError} />}
      />
      <div className="wkf-boolean-switch__label" id={`${fieldID}-label`}>
        <RenderCustomComponent
          CustomComponent={Label}
          Fallback={
            <FieldLabel
              htmlFor={fieldID}
              label={label}
              localized={localized}
              path={path}
              required={required}
            />
          }
        />
      </div>
      <div className="wkf-boolean-switch__input-row">
        {BeforeInput}
        <label className="wkf-boolean-switch__control">
          <input
            aria-labelledby={`${fieldID}-label ${fieldID}-state`}
            checked={checked}
            disabled={isDisabled}
            id={fieldID}
            name={path}
            onChange={handleChange}
            required={required}
            role="switch"
            type="checkbox"
          />
          <span aria-hidden="true" className="wkf-boolean-switch__track">
            <span className="wkf-boolean-switch__thumb" />
          </span>
          <span className="wkf-boolean-switch__state" id={`${fieldID}-state`}>
            {stateLabel}
          </span>
        </label>
        {AfterInput}
      </div>
      <RenderCustomComponent
        CustomComponent={Description}
        Fallback={<FieldDescription description={description} path={path} />}
      />
    </div>
  )
}
