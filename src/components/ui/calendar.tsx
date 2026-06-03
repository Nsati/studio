"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

/**
 * @fileOverview Production-grade Premium Booking Calendar.
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
      className={cn("p-4 bg-white", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 justify-center",
        month: "space-y-4 w-full",
        caption: "flex justify-center pt-2 relative items-center mb-2",
        caption_label: "text-sm font-black uppercase tracking-widest text-primary",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-80 hover:opacity-100 transition-all border-black/5 rounded-full"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse mx-auto",
        head_row: "flex w-full mb-2",
        head_cell: "text-primary/40 flex-1 font-black text-[10px] uppercase tracking-widest flex items-center justify-center h-10",
        row: "flex w-full mt-1",
        cell: cn(
          "relative h-10 flex-1 p-0 text-center text-sm focus-within:relative focus-within:z-20 transition-all flex items-center justify-center",
          props.mode === "range"
            ? "[&.day-range-end]:rounded-r-full [&.day-range-start]:rounded-l-full"
            : "[&:has([aria-selected])]:rounded-full"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-full p-0 font-bold rounded-full aria-selected:opacity-100 hover:bg-primary/5 transition-all flex items-center justify-center"
        ),
        day_range_start: "day-range-start bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-full shadow-lg z-10",
        day_range_end: "day-range-end bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-full shadow-lg z-10",
        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "border-2 border-accent text-accent font-black",
        day_outside: "text-muted-foreground opacity-30 aria-selected:bg-accent/10 aria-selected:text-muted-foreground aria-selected:opacity-40",
        day_disabled: "text-muted-foreground opacity-10 cursor-not-allowed",
        day_range_middle: "aria-selected:bg-accent/10 aria-selected:text-primary font-bold rounded-none",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
