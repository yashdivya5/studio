"use client"

import * as React from "react"
import { GripVertical } from "lucide-react"
import { ImperativePanelHandle, PanelOnCollapse, PanelOnExpand, PanelResizeHandle } from "react-resizable-panels"

import { cn } from "@/lib/utils"

const ResizablePanelGroup = React.forwardRef<
  ImperativePanelHandle,
  React.ComponentProps<typeof PanelResizeHandle> & {
    className?: string
    direction: "horizontal" | "vertical"
  }
>(({ className, direction, children, ...props }, ref) => (
  // @ts-expect-error TODO: fix this type
  <PanelResizeHandle
    ref={ref}
    className={cn(
      "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
      className
    )}
    {...props}
  >
    {/* @ts-expect-error TODO: fix this type */}
    <PanelGroup direction={direction}>{children}</PanelGroup>
  </PanelResizeHandle>
))
ResizablePanelGroup.displayName = "ResizablePanelGroup"

const PanelGroup = React.lazy(
  () => import("react-resizable-panels").then((mod) => ({ default: mod.PanelGroup }))
)

const ResizablePanel = React.forwardRef<
  ImperativePanelHandle,
  Omit<React.ComponentProps<typeof PanelResizeHandle>, "children" | "onCollapse" | "onExpand"> & {
    children?: React.ReactNode
    className?: string
    collapsedSize?: number
    collapsible?: boolean
    defaultSize?: number
    minSize?: number
    onCollapse?: PanelOnCollapse
    onExpand?: PanelOnExpand
  }
>(({ className, children, ...props }, ref) => {
  const Panel = React.lazy(() =>
    import("react-resizable-panels").then((mod) => ({ default: mod.Panel }))
  )
  return (
    <React.Suspense
      fallback={
        <div
          className={cn(
            "flex h-full w-full animate-pulse items-center justify-center rounded-lg bg-muted",
            className
          )}
        />
      }
    >
      {/* @ts-expect-error TODO: fix this type */}
      <Panel ref={ref} className={className} {...props}>
        {children}
      </Panel>
    </React.Suspense>
  )
})
ResizablePanel.displayName = "ResizablePanel"

const ResizableHandle = React.forwardRef<
  ImperativePanelHandle,
  React.ComponentProps<typeof PanelResizeHandle> & {
    className?: string
    withHandle?: boolean
  }
>(({ className, withHandle, children, ...props }, ref) => (
  // @ts-expect-error TODO: fix this type
  <PanelResizeHandle
    ref={ref}
    className={cn(
      "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-dragging=true]]:bg-muted-foreground [&[data-dragging=true]]:opacity-30",
      className
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
        <GripVertical className="h-2.5 w-2.5 text-muted-foreground" />
      </div>
    )}
    {children}
  </PanelResizeHandle>
))
ResizableHandle.displayName = "ResizableHandle"

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
