'use client'

import type { TextFieldClientProps } from 'payload'

import { validateClockTime } from '@/modules/events/validation'

import { BlurValidatedTextInput } from './BlurValidatedTextField'

export function TimeTextField(properties: TextFieldClientProps) {
  return (
    <BlurValidatedTextInput
      inputType="time"
      properties={properties}
      validateValue={validateClockTime}
    />
  )
}
