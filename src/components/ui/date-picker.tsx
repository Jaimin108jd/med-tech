"use client"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface DatePickerProps {
  date: Date | undefined
  onChange: (date: Date | undefined) => void
}

export function DatePicker({ date, onChange }: DatePickerProps) {
  const [currentView, setCurrentView] = useState<"day" | "month" | "year">("day")
  const [currentDate, setCurrentDate] = useState(date ?? new Date())

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i)

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(monthIndex)
    setCurrentDate(newDate)
    setCurrentView("day")
  }

  const handleYearSelect = (year: number) => {
    const newDate = new Date(currentDate)
    newDate.setFullYear(year)
    setCurrentDate(newDate)
    setCurrentView("month")
  }

  const formattedDate = date && !isNaN(date.getTime()) ? format(date, "PPP") : "Pick a date"

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formattedDate}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <Button
              variant="ghost"
              onClick={() => setCurrentView("month")}
            >
              {months[currentDate.getMonth()]}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setCurrentView("year")}
            >
              {currentDate.getFullYear()}
            </Button>
          </div>

          <AnimatePresence mode="wait">
            {currentView === "day" && (
              <motion.div
                key="day"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={onChange}
                  month={currentDate}
                  onMonthChange={setCurrentDate}
                  className="border-0"
                  disabled={(date) => date > new Date()}
                />
              </motion.div>
            )}

            {currentView === "month" && (
              <motion.div
                key="month"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-3 gap-2"
              >
                {months.map((month, index) => (
                  <Button
                    key={month}
                    variant={currentDate.getMonth() === index ? "default" : "outline"}
                    onClick={() => handleMonthSelect(index)}
                  >
                    {month}
                  </Button>
                ))}
              </motion.div>
            )}

            {currentView === "year" && (
              <motion.div
                key="year"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-3 gap-2 max-h-[300px] overflow-auto"
              >
                {years.map((year) => (
                  <Button
                    key={year}
                    variant={currentDate.getFullYear() === year ? "default" : "outline"}
                    onClick={() => handleYearSelect(year)}
                  >
                    {year}
                  </Button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </PopoverContent>
    </Popover>
  )
}