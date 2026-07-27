"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";

import { cn } from "@/utils/cn";

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<
    typeof AccordionPrimitive.Item
  >
>(({ className, ...props }, ref) => {
  return (
    <AccordionPrimitive.Item
      ref={ref}
      className={cn(className)}
      {...props}
    />
  );
});

AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
  React.ElementRef<
    typeof AccordionPrimitive.Trigger
  >,
  React.ComponentPropsWithoutRef<
    typeof AccordionPrimitive.Trigger
  >
>(({ className, children, ...props }, ref) => {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(
          `
            group flex flex-1
            items-center justify-between
            text-left
            outline-none
            transition-colors
            focus-visible:ring-2
            focus-visible:ring-focus
            focus-visible:ring-offset-2
            focus-visible:ring-offset-background
          `,
          className,
        )}
        {...props}
      >
        {children}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
});

AccordionTrigger.displayName =
  AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<
    typeof AccordionPrimitive.Content
  >,
  React.ComponentPropsWithoutRef<
    typeof AccordionPrimitive.Content
  >
>(({ className, children, ...props }, ref) => {
  return (
    <AccordionPrimitive.Content
      ref={ref}
      className={cn(
        `
          accordion-content
          overflow-hidden
          text-text-muted
        `,
        className,
      )}
      {...props}
    >
      {children}
    </AccordionPrimitive.Content>
  );
});

AccordionContent.displayName =
  AccordionPrimitive.Content.displayName;

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger,};