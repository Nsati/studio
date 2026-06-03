"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

/**
 * @fileOverview Production-grade Premium Booking Calendar.
 * Strictly aligned 7-column grid with Airbnb-style range selection.
 * Optimized for horizontal alignment (column precision).
 */

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4 md:p-8 bg-white", className)}
      classNames={{
        months: "flex flex-col md:flex-row space-y-12 md:space-x-12 md:space-y-0 justify-center",
        month: "space-y-8 w-full max-w-[340px]",
        caption: "flex justify-center pt-2 relative items-center mb-6",
        caption_label: "text-base font-black uppercase tracking-[0.2em] text-primary",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-10 w-10 bg-transparent p-0 opacity-80 hover:opacity-100 transition-all border-black/5 rounded-full shadow-sm hover:bg-primary/5"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse",
        head_row: "flex w-full mb-4",
        head_cell: "text-primary/30 flex-1 font-black text-[10px] uppercase tracking-widest text-center",
        row: "flex w-full mt-1.5",
        cell: cn(
          "relative h-12 flex-1 p-0 text-center text-sm focus-within:relative focus-within:z-20 transition-all flex items-center justify-center",
          props.mode === "range"
            ? "[&.day-range-end]:rounded-r-full [&.day-range-start]:rounded-l-full"
            : "[&:has([aria-selected])]:rounded-full"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-12 w-full p-0 font-bold rounded-full aria-selected:opacity-100 hover:bg-primary/5 transition-all flex items-center justify-center z-10 text-primary"
        ),
        day_range_start: "day-range-start !bg-primary !text-white hover:!bg-primary hover:!text-white focus:!bg-primary focus:!text-white rounded-full shadow-xl !opacity-100 ring-4 ring-primary/10",
        day_range_end: "day-range-end !bg-primary !text-white hover:!bg-primary hover:!text-white focus:!bg-primary focus:!text-white rounded-full shadow-xl !opacity-100 ring-4 ring-primary/10",
        day_selected: "!bg-primary !text-white hover:!bg-primary hover:!text-white focus:!bg-primary focus:!text-white",
        day_today: "border-2 border-accent text-accent font-black",
        day_outside: "text-muted-foreground opacity-10 aria-selected:bg-accent/10 aria-selected:text-muted-foreground aria-selected:opacity-20",
        day_disabled: "text-muted-foreground opacity-10 cursor-not-allowed",
        day_range_middle: "aria-selected:!bg-primary/5 aria-selected:!text-primary font-black rounded-none z-0 !opacity-100",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-5 w-5" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-5 w-5" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
