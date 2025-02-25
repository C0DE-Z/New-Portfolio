"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"


const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
// eslint-disable-next-line @typescript-eslint/no-unused-vars
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className="z-50 overflow-hidden rounded-md border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-gray-200 shadow-md animate-in fade-in-0 zoom-in-95"
      {...props}
    />
  </TooltipPrimitive.Portal>
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
