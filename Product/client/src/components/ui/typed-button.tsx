import { Button, buttonVariants } from './button'
import { VariantProps } from 'class-variance-authority'
import React from 'react'

type ButtonVariants = VariantProps<typeof buttonVariants>

export interface TypedButtonProps 
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariants {
  asChild?: boolean
}

export const TypedButton = React.forwardRef<HTMLButtonElement, TypedButtonProps>(
  (props, ref) => {
    return <Button ref={ref} {...props} />
  }
)

TypedButton.displayName = 'TypedButton'
