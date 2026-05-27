'use client'

import * as TooltipPrimitive from '@radix-ui/react-tooltip'

/**
 * Lightweight tooltip matching Inspectrum brand.
 *
 * Usage:
 *   <Tooltip content="Full Home Inspection">
 *     <button>🏠</button>
 *   </Tooltip>
 */
export function TooltipProvider({ children }) {
  return (
    <TooltipPrimitive.Provider delayDuration={200} skipDelayDuration={100}>
      {children}
    </TooltipPrimitive.Provider>
  )
}

export default function Tooltip({ content, children, side = 'top', align = 'center' }) {
  if (!content) return children

  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>
        {children}
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          align={align}
          sideOffset={6}
          className="z-50 px-2.5 py-1.5 text-xs font-medium text-cream bg-ink rounded shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
        >
          {content}
          <TooltipPrimitive.Arrow className="fill-ink" width={10} height={5} />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}
